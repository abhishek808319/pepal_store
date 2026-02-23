let userLocation = null;
const cart = JSON.parse(localStorage.getItem('pepal_cart')) || [];

// Display Total
document.addEventListener('DOMContentLoaded', () => {
    const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    document.getElementById('final-amount').innerText = `₹${total}`;
});

function getLocation() {
    const status = document.getElementById('location-status');
    const btn = document.getElementById('location-btn');

    if (!navigator.geolocation) {
        status.innerText = "Geolocation is not supported by your browser";
        return;
    }

    status.innerText = "Locating...";
    btn.disabled = true;

    navigator.geolocation.getCurrentPosition((position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        userLocation = `https://www.google.com/maps?q=${lat},${lon}`;
        
        status.innerHTML = "✅ Location Attached Successfully!";
        status.style.color = "green";
        btn.innerText = "Location Updated";
        btn.style.background = "#27ae60";
    }, () => {
        status.innerText = "Unable to retrieve location. Please type address manually.";
        btn.disabled = false;
    });
}

document.getElementById('billing-form').addEventListener('submit', function(e) {
    e.preventDefault();

    const name = document.getElementById('cust-name').value;
    const phone = document.getElementById('cust-phone').value;
    const address = document.getElementById('cust-address').value;
    
    // Format Item List for WhatsApp
    let itemDetails = cart.map(item => `*${item.name}* (${item.qty} x ₹${item.price})`).join('%0A');
    const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

    // Build WhatsApp Message
    let message = `*NEW ORDER RECEIVED*%0A%0A`;
    message += `*Customer:* ${name}%0A`;
    message += `*Phone:* ${phone}%0A`;
    message += `*Address:* ${address}%0A%0A`;
    message += `*Items:*%0A${itemDetails}%0A%0A`;
    message += `*Total Amount:* ₹${total}%0A%0A`;
    
    if (userLocation) {
        message += `📍 *Live Location:* ${userLocation}`;
    }

    // Your WhatsApp Number (Include Country Code, e.g., 91 for India)
    const adminPhone = "91XXXXXXXXXX"; 
    window.open(`https://wa.me/${adminPhone}?text=${message}`, '_blank');

    // Clear cart and go home
    localStorage.removeItem('pepal_cart');
    window.location.href = 'index.html';
});