const BASE_URL = "/api";

function showToast(message, type = '') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type ? 'toast-' + type : ''} show`;
    setTimeout(() => { toast.className = 'toast'; }, 3500);
}

function setLoading(btn, loading, label) {
    if (loading) {
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner"></span>';
    } else {
        btn.disabled = false;
        btn.innerHTML = `<span>${label}</span>`;
    }
}

function switchTab(tab) {
    const btns = document.querySelectorAll('.tab-btn');
    btns[0].classList.toggle('active', tab === 'login');
    btns[1].classList.toggle('active', tab === 'register');
    document.getElementById('loginTab').classList.toggle('active', tab === 'login');
    document.getElementById('registerTab').classList.toggle('active', tab === 'register');
}

async function registerUser(btn) {
    const name = document.getElementById("regName").value.trim();
    const email = document.getElementById("regEmail").value.trim();
    const password = document.getElementById("regPassword").value;

    if (!name || !email || !password) {
        return showToast("Please fill in all fields.", "error");
    }

    setLoading(btn, true, "Create Account");
    try {
        const res = await fetch(`${BASE_URL}/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ name, email, password })
        });
        const data = await res.json();
        if (res.ok) {
            localStorage.setItem("token", data.token);
            localStorage.setItem("userName", data.user.name);
            showToast("Account created! Redirecting...", "success");
            setTimeout(() => { window.location.href = "dashboard.html"; }, 1000);
        } else {
            showToast(data.Message || data.message || "Registration failed.", "error");
            setLoading(btn, false, "Create Account");
        }
    } catch (e) {
        showToast("Network error. Please try again.", "error");
        setLoading(btn, false, "Create Account");
    }
}

async function loginUser(btn) {
    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;

    if (!email || !password) {
        return showToast("Please enter your email and password.", "error");
    }

    setLoading(btn, true, "Sign In");
    try {
        const res = await fetch(`${BASE_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (res.ok) {
            localStorage.setItem("token", data.token);
            localStorage.setItem("userName", data.user.name);
            window.location.href = "dashboard.html";
        } else {
            showToast(data.message || "Login failed.", "error");
            setLoading(btn, false, "Sign In");
        }
    } catch (e) {
        showToast("Network error. Please try again.", "error");
        setLoading(btn, false, "Sign In");
    }
}