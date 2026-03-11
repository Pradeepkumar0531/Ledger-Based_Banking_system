const BASE_URL = "/api";

// Auth guard
if (!localStorage.getItem("token")) {
    window.location.href = "index.html";
}

// Display username in navbar
const storedName = localStorage.getItem("userName");
if (storedName) {
    const el = document.getElementById("navUserName");
    if (el) el.textContent = storedName;
}

// Load accounts on page load
getAccounts();

function showToast(message, type = '') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type ? 'toast-' + type : ''} show`;
    setTimeout(() => { toast.className = 'toast'; }, 3500);
}

async function createAccount(btn) {
    const token = localStorage.getItem("token");
    const origInner = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span>';
    try {
        const res = await fetch(`${BASE_URL}/accounts`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            credentials: "include"
        });
        const data = await res.json();
        if (res.ok) {
            showToast("Account created successfully!", "success");
            getAccounts();
        } else {
            showToast(data.message || "Failed to create account.", "error");
        }
    } catch (e) {
        showToast("Network error.", "error");
    } finally {
        btn.disabled = false;
        btn.innerHTML = origInner;
    }
}

async function getAccounts() {
    const token = localStorage.getItem("token");
    try {
        const res = await fetch(`${BASE_URL}/accounts`, {
            headers: { "Authorization": `Bearer ${token}` },
            credentials: "include"
        });
        if (res.status === 401) {
            localStorage.removeItem("token");
            window.location.href = "index.html";
            return;
        }
        const data = await res.json();
        const list = document.getElementById("accountsList");
        list.innerHTML = "";
        if (!data.accounts || data.accounts.length === 0) {
            list.innerHTML = '<p class="empty-state">No accounts yet. Create one above.</p>';
            return;
        }
        data.accounts.forEach(acc => {
            const statusClass = `status-${acc.status.toLowerCase()}`;
            const item = document.createElement("div");
            item.className = "account-item";
            item.title = "Click to copy account ID";
            item.innerHTML = `
                <div>
                    <div class="account-meta">${acc.currency}</div>
                    <div class="account-id">${acc._id}</div>
                </div>
                <span class="status-badge ${statusClass}">${acc.status}</span>
            `;
            item.onclick = () => {
                navigator.clipboard.writeText(acc._id)
                    .then(() => showToast("Account ID copied!", "success"));
            };
            list.appendChild(item);
        });
    } catch (e) {
        showToast("Failed to load accounts.", "error");
    }
}

async function getBalance(btn) {
    const token = localStorage.getItem("token");
    const accountId = document.getElementById("balanceAccountId").value.trim();
    if (!accountId) return showToast("Please enter an account ID.", "error");

    const origInner = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span><span>Checking...</span>';
    try {
        const res = await fetch(`${BASE_URL}/accounts/balance/${accountId}`, {
            headers: { "Authorization": `Bearer ${token}` },
            credentials: "include"
        });
        const data = await res.json();
        const resultEl = document.getElementById("balanceResult");
        if (res.ok) {
            const formatted = Number(data.balance).toLocaleString('en-IN', { minimumFractionDigits: 2 });
            resultEl.innerHTML = `
                <div class="balance-label">Available Balance</div>
                <div class="balance-amount">&#x20B9; ${formatted}</div>
            `;
            resultEl.classList.remove("hidden");
        } else {
            showToast(data.message || "Account not found.", "error");
            resultEl.classList.add("hidden");
        }
    } catch (e) {
        showToast("Network error.", "error");
    } finally {
        btn.disabled = false;
        btn.innerHTML = origInner;
    }
}

async function logoutUser() {
    const token = localStorage.getItem("token");
    try {
        await fetch(`${BASE_URL}/auth/logout`, {
            method: "POST",
            headers: { "Authorization": `Bearer ${token}` },
            credentials: "include"
        });
    } catch (e) {}
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    window.location.href = "index.html";
}