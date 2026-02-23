// cart.js

// 1. Get data from local storage
let cart = JSON.parse(localStorage.getItem('pepal_cart')) || [];

function renderCart() {
    const list = document.getElementById('cart-list');
    const totalEl = document.getElementById('grand-total');
    
    // Check if elements exist to avoid the "null" error
    if (!list || !totalEl) {
        console.error("Required HTML elements 'cart-list' or 'grand-total' are missing!");
        return;
    }

    if (cart.length === 0) {
        list.innerHTML = `
            <div style="text-align:center; padding:40px;">
                <p style="font-size: 1.2rem; color: #666;">Your cart is empty</p>
                <a href="index.html" style="color: #27ae60; font-weight: bold;">Go back to Shop</a>
            </div>`;
        totalEl.innerText = "0";
        return;
    }

    let grandTotal = 0;
    let html = "";

    cart.forEach((item, index) => {
        const itemTotal = item.price * item.qty;
        grandTotal += itemTotal;

        html += `
            <div class="cart-item">
                <img src="${item.img}" alt="${item.name}">
                <div class="item-details">
                    <h4>${item.name}</h4>
                    <small>${item.unit || ''}</small>
                    <p>₹${item.price} x ${item.qty}</p>
                </div>
                <div class="qty-manager">
                    <button class="qty-btn" onclick="updateQty(${index}, -1)">-</button>
                    <span class="qty-num">${item.qty}</span>
                    <button class="qty-btn" onclick="updateQty(${index}, 1)">+</button>
                    <button class="remove-btn" onclick="removeItem(${index})">🗑️</button>
                </div>
            </div>
        `;
    });

    list.innerHTML = html;
    totalEl.innerText = grandTotal;
}

// 2. Change Quantity Logic
window.updateQty = function(index, change) {
    cart[index].qty += change;
    if (cart[index].qty <= 0) {
        return removeItem(index);
    }
    syncAndReload();
}

// 3. Remove Item Logic
window.removeItem = function(index) {
    cart.splice(index, 1);
    syncAndReload();
}

// 4. Sync with LocalStorage
function syncAndReload() {
    localStorage.setItem('pepal_cart', JSON.stringify(cart));
    renderCart();
}
function proceedToCheckout() {
    if (cart.length === 0) {
        alert("Your cart is empty!");
        return;
    }
    // Redirect to the billing page
    window.location.href = 'billing.html';
}
// Start the page
document.addEventListener('DOMContentLoaded', renderCart);