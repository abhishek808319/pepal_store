
const ADMIN_PHONE = "917079374554"; // Replace with your WhatsApp number (with country code)
const TELEGRAM_BOT_TOKEN = "8714311631:AAF5r44Y39N-_vBbm5-BO3MdsG3nGTrD74c";
const TELEGRAM_CHAT_ID = "1351045562";

// --- GLOBAL STATE ---
let userLocationLink = "";
const cart = JSON.parse(localStorage.getItem('pepal_cart')) || [];

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    if (cart.length === 0) {
        alert("Your cart is empty!");
        window.location.href = "index.html";
        return;
    }
    displayOrderSummary();
});

function displayOrderSummary() {
    const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const totalEl = document.getElementById('final-amount');
    if (totalEl) totalEl.innerText = `₹${total}`;
}

// --- 1. GEOLOCATION LOGIC ---
function getLocation() {
    const status = document.getElementById('location-status');
    const btn = document.getElementById('location-btn');

    if (!navigator.geolocation) {
        status.innerText = "❌ Browser does not support location.";
        return;
    }

    status.innerText = "Detecting location... Please allow access.";
    btn.disabled = true;

    const geoOptions = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
    };

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            // Generate standard Google Maps link
            userLocationLink = `https://www.google.com/maps?q=${lat},${lon}`;
            
            status.innerText = "✅ Location Attached Successfully!";
            status.style.color = "green";
            btn.innerText = "Location Updated";
            btn.style.background = "#27ae60";
            btn.disabled = false;
        },
        (error) => {
            btn.disabled = false;
            let msg = "";
            switch(error.code) {
                case error.PERMISSION_DENIED: msg = "Permission Denied. Check browser settings."; break;
                case error.POSITION_UNAVAILABLE: msg = "Location unavailable."; break;
                case error.TIMEOUT: msg = "Request timed out."; break;
                default: msg = "Unknown error occurred.";
            }
            status.innerText = "❌ " + msg;
            alert("Location Error: " + msg + "\nPlease ensure you are using HTTPS and have enabled GPS.");
        },
        geoOptions
    );
}

// --- 2. NOTIFICATION METHODS ---

async function notifyTelegram(message) {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    try {
        await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: message, parse_mode: "Markdown" })
        });
    } catch (err) { console.error("Telegram Error:", err); }
}

async function saveToFirebase(orderData) {
    try {
        await db.collection("orders").add({
            ...orderData,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            status: "Pending"
        });
    } catch (err) { console.error("Firebase Error:", err); }
}

// --- 3. FINAL ORDER SUBMISSION ---
document.getElementById('billing-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    const submitBtn = e.target.querySelector('button[type="submit"]');
    submitBtn.innerText = "Sending Order...";
    submitBtn.disabled = true;

    // Get Form Data
    const name = document.getElementById('cust-name').value.trim();
    const phone = document.getElementById('cust-phone').value.trim();
    const address = document.getElementById('cust-address').value.trim();
    const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    
    // Format Items List
    let itemsText = cart.map((item, i) => `${i+1}. ${item.name} (x${item.qty}) - ₹${item.price * item.qty}`).join("\n");

    // Build Messages
    const rawMessage = `*📦 NEW ORDER RECEIVED*\n\n` +
        `*Customer:* ${name}\n` +
        `*Phone:* ${phone}\n` +
        `*Address:* ${address}\n\n` +
        `*Items:*\n${itemsText}\n\n` +
        `*Total Amount: ₹${total}*\n` +
        `📍 *Location:* ${userLocationLink || "Not Shared"}`;

    // 1. Save to Firebase
    await saveToFirebase({ name, phone, address, items: cart, total, location: userLocationLink });

    // 2. Notify Admin via Telegram
    await notifyTelegram(rawMessage);

    // 3. Final WhatsApp Redirect
    const whatsappUrl = `https://wa.me/${ADMIN_PHONE}?text=${encodeURIComponent(rawMessage)}`;
    
    // Clear cart and redirect
    localStorage.removeItem('pepal_cart');
    window.location.href = whatsappUrl;
});
