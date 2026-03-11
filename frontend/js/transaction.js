async function createTransaction(btn) {
    const token = localStorage.getItem("token");
    const fromAccount = document.getElementById("fromAccount").value.trim();
    const toAccount = document.getElementById("toAccount").value.trim();
    const amount = parseFloat(document.getElementById("amount").value);

    if (!fromAccount || !toAccount || !amount || amount <= 0) {
        return showToast("Please fill in all transfer fields with valid values.", "error");
    }

    const idempotencyKey = crypto.randomUUID();
    const origInner = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span><span>Processing...</span>';

    try {
        const res = await fetch("/api/transactions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            credentials: "include",
            body: JSON.stringify({ fromAccount, toAccount, amount, idempotencyKey })
        });
        const data = await res.json();
        if (res.ok) {
            showToast("Transfer completed successfully!", "success");
            document.getElementById("fromAccount").value = "";
            document.getElementById("toAccount").value = "";
            document.getElementById("amount").value = "";
        } else {
            showToast(data.message || "Transaction failed.", "error");
        }
    } catch (e) {
        showToast("Network error. Please try again.", "error");
    } finally {
        btn.disabled = false;
        btn.innerHTML = origInner;
    }
}