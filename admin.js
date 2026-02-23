// 1. FIREBASE CONFIGURATION
const firebaseConfig = {
    apiKey: "AIzaSyA7lrvQTCdbV-yN2h1WdasWFgcCtaguGbM",
    authDomain: "pepalstore-af4e0.firebaseapp.com",
    projectId: "pepalstore-af4e0",
    storageBucket: "",
    messagingSenderId: "55793980711",
    appId: "1:55793980711:web:eb868814aff460ab1f8502",
    measurementId: "G-CWBFDMH7PF"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

// 2. AUTHENTICATION LOGIC
async function handleLogin() {
    const email = document.getElementById('login-email').value;
    const pass = document.getElementById('login-pass').value;
    const btn = document.getElementById('login-btn');

    if (!btn) return;

    try {
        btn.innerText = "Authenticating...";
        btn.disabled = true;
        await auth.signInWithEmailAndPassword(email, pass);
    } catch (e) {
        alert("Login Failed: " + e.message);
        btn.innerText = "Login to Dashboard";
        btn.disabled = false;
    }
}

function handleLogout() {
    auth.signOut();
}

// Watch for Login/Logout state
auth.onAuthStateChanged(user => {
    const loginSec = document.getElementById('login-section');
    const dashSec = document.getElementById('admin-dashboard');

    if (user) {
        loginSec.classList.add('hidden');
        dashSec.classList.remove('hidden');
        // Load default section and categories
        showSection('product-sec');
        populateCategories();
    } else {
        loginSec.classList.remove('hidden');
        dashSec.classList.add('hidden');
    }
});

// 3. NAVIGATION LOGIC
function showSection(id) {
    // Hide all panels
    const panels = ['banner-sec', 'product-sec', 'manage-items-sec'];
    panels.forEach(p => {
        const el = document.getElementById(p);
        if (el) el.classList.add('hidden');
    });

    // Show selected panel
    const target = document.getElementById(id);
    if (target) target.classList.remove('hidden');

    // If managing items, load them
    if (id === 'manage-items-sec') {
        loadAdminProducts();
    }
}

// 4. BANNER MANAGEMENT
async function saveBanners() {
    const urls = [
        document.getElementById('b1').value,
        document.getElementById('b2').value,
        document.getElementById('b3').value,
        document.getElementById('b4').value
    ];

    try {
        await db.collection("settings").doc("banners").set({ urls });
        alert("Banners Updated Successfully!");
    } catch (e) {
        alert("Banner Update Failed: " + e.message);
    }
}

// 5. PRODUCT MANAGEMENT (ADD)
async function addItem() {
    const btn = document.getElementById('save-btn');
    const name = document.getElementById('p-name').value;
    const price = document.getElementById('p-price').value;
    const stock = document.getElementById('p-stock').value;
    const cat = document.getElementById('p-category').value;
    const img = document.getElementById('p-img').value;
    const unit = document.getElementById('p-unit').value;

    if (!name || !price || !stock || !img) return alert("Please fill all fields!");

    try {
        btn.innerText = "Adding...";
        btn.disabled = true;

        await db.collection("products").add({
            name,
            price: Number(price),
            stock: Number(stock),
            cat,
            img,
            unit,
            status: Number(stock) > 0 ? "available" : "soldout",
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });

        alert("Product Added!");
        // Reset form
        document.getElementById('p-name').value = "";
        document.getElementById('p-price').value = "";
        document.getElementById('p-stock').value = "";
        document.getElementById('p-img').value = "";
        btn.innerText = "Add to Store";
        btn.disabled = false;
    } catch (e) {
        alert("Error: " + e.message);
        btn.disabled = false;
    }
}

// 6. INVENTORY MANAGEMENT (LOAD, UPDATE, DELETE)
function loadAdminProducts() {
    const listContainer = document.getElementById('admin-product-list');
    if (!listContainer) return;

    db.collection("products").orderBy("timestamp", "desc").onSnapshot(snapshot => {
        let html = "";
        snapshot.forEach(doc => {
            const p = doc.data();
            const lowStock = p.stock < 5 ? "color: red; font-weight: bold;" : "";
            
            html += `
                <div class="admin-item-row">
                    <img src="${p.img}" width="50" height="50" style="object-fit: contain;">
                    <div class="info">
                        <strong>${p.name}</strong>
                        <span style="${lowStock}">Stock: ${p.stock}</span>
                    </div>
                    <div class="actions">
                        <button onclick="updateStock('${doc.id}', 1)" class="sold-btn">+1</button>
                        <button onclick="updateStock('${doc.id}', -1)" class="delete-btn">-1</button>
                        <button onclick="deleteProduct('${doc.id}')" style="background:red; color:white;">🗑️</button>
                    </div>
                </div>`;
        });
        listContainer.innerHTML = html || "<p>No products yet.</p>";
    });
}

async function updateStock(id, change) {
    const ref = db.collection("products").doc(id);
    try {
        const doc = await ref.get();
        if (!doc.exists) return;
        
        let newStock = (doc.data().stock || 0) + change;
        if (newStock < 0) newStock = 0;

        await ref.update({
            stock: newStock,
            status: newStock === 0 ? "soldout" : "available"
        });
    } catch (e) { console.error(e); }
}

async function deleteProduct(id) {
    if (confirm("Permanently delete this item?")) {
        await db.collection("products").doc(id).delete();
    }
}

// 7. UTILS
function populateCategories() {
    const cats = ["Vegetable and Fruit", "Atta Rice & Dal", "Oil, Ghee & Masala", "Dairy, Bread & Egg", "Tea & Coffee", "Snacks & Drink"];
    const select = document.getElementById('p-category');
    if (select) {
        select.innerHTML = cats.map(c => `<option value="${c}">${c}</option>`).join('');
    }
}