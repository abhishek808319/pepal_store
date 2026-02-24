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

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();

// 2. CATEGORY DATA (To rebuild your grid)
const storeData = {

    "Grocery & Kitchen": [
        { name: "Vegetable and Fruit", img: "images/veg&fruits.jpg" },
        { name: "Atta Rice & Dal", img: "images/atta-rice&dal.png" },
        { name: "Oil, Ghee & Masala", img: "images/ghee.webp" },
        { name: "Dairy, Bread & Egg", img: "images/dairy-bread.jpg" },
        { name: "Tea & Coffee", img: "images/teacoffee.jpg" },
        { name: "Dry Fruits & Nuts", img: "images/dry fruits.jpg" },
        { name: "Noodles", img: "images/noodles.jpg" },
        { name: "Kitchen & Appliances", img: "images/kitchen&applicanes.jpg" }
    ],

    "Snacks & Drink": [
        { name: "Chip & Namkeen", img: "images/chips&namkeen.png" },
        { name: "Sweet & Chocolate", img: "images/sweets&chocolates.jpg" },
        { name: "Drinks & Juice", img: "images/drinks&juices.jpg" },
        { name: "Ice cream & More", img: "images/ice-creams.jpg" },
        { name: "Bakery & Biscuits", img: "images/biscuits-and-cakes.png" },
        { name: "Sauces & Spreads", img: "images/sauces.jpg" },
        { name: "Paan masala & Cigrate", img: "images/pan masala.jpg" }
    ],

    "Household": [
        { name: "Home & Lifestyle", img: "images/home.jpg" },
        { name: "Cleaners & Repellents", img: "images/cleanser.jfif" },
        { name: "Stationary & Games", img: "images/stationary.jfif" },
        { name: "Pooja Essentials", img: "images/pooja.jfif" },
        { name: "Electronics", img: "images/electronics..jpg" }
    ],

    "Personal Care": [
        { name: "Bath & Body", img: "images/bath&body.jfif" },
        { name: "Baby Care", img: "images/babycare.jfif" },
        { name: "Hair care", img: "images/hair.jfif" },
        { name: "Skin & Face", img: "images/skin&fash.jfif" },
        { name: "Beauty Cosmetics", img: "images/beautycosematics.jfif" },
        { name: "Feminiee Hygiene", img: "images/feminiee hygiene.jfif" },
        { name: "Health Pharma", img: "images/health.jfif" },
        { name: "Sexual Wellness", img: "images/sexual.jfif" }
    ]
};

// 3. INITIALIZATION
// document.addEventListener('DOMContentLoaded', () => {
//      const hamburgerMenu = document.getElementById('hamburger-menu');
//     const mobileNavOverlay = document.getElementById('mobile-nav-overlay'); // New: Mobile menu overlay
//     const closeMenuBtn = document.getElementById('close-menu-btn'); // New: Close button for mobile menu
//     initStore();         // Generates the category circles
//     loadBanners();       // Starts the slider
//     updateCartCount();   // Syncs the cart icon
// });
// 3. INITIALIZATION
document.addEventListener('DOMContentLoaded', () => {

const hamburgerMenu = document.getElementById('hamburger-menu');
const mobileNavOverlay = document.getElementById('mobile-nav-overlay');
const closeMenuBtn = document.getElementById('close-menu-btn');
const backdrop = document.getElementById('mobile-backdrop');

function openMenu() {
    mobileNavOverlay.classList.add('active');
    backdrop.classList.add('active');
    document.body.style.overflow = "hidden";
}

function closeMenu() {
    mobileNavOverlay.classList.remove('active');
    backdrop.classList.remove('active');
    document.body.style.overflow = "auto";
}

hamburgerMenu.addEventListener('click', openMenu);
closeMenuBtn.addEventListener('click', closeMenu);
backdrop.addEventListener('click', closeMenu);

/* Swipe to close (Mobile gesture) */
let startX = 0;

mobileNavOverlay.addEventListener("touchstart", e => {
    startX = e.touches[0].clientX;
});

mobileNavOverlay.addEventListener("touchmove", e => {
    let moveX = e.touches[0].clientX;
    if (moveX - startX > 100) {
        closeMenu();
    }
});
    // Existing functions
    initStore();
    loadBanners();
    updateCartCount();
});
 // --- Hamburger Menu Toggle ---
    hamburgerMenu.addEventListener('click', () => {
        mobileNavOverlay.classList.add('active');
        body.classList.add('mobile-menu-open'); // Prevent body scroll
    });

    closeMenuBtn.addEventListener('click', () => {
        mobileNavOverlay.classList.remove('active');
        body.classList.remove('mobile-menu-open'); // Re-enable body scroll
    });

    // Close menu if clicked outside (for mobile overlay)
    document.addEventListener('click', (event) => {
        // Check if click is outside the overlay AND not on the hamburger button
        if (!mobileNavOverlay.contains(event.target) && !hamburgerMenu.contains(event.target) && mobileNavOverlay.classList.contains('active')) {
            mobileNavOverlay.classList.remove('active');
            body.classList.remove('mobile-menu-open');
        }
    });
let currentSearchId = 0; // Prevents old searches from overwriting new ones

async function searchItems() {
    const searchBox = document.getElementById('item-search');
    const query = searchBox.value.toLowerCase().trim();
    const listContainer = document.getElementById('product-list');
    const homeContent = document.getElementById('home-content');
    const itemsView = document.getElementById('items-view');

    if (query === "") {
        showHome();
        return;
    }

    // Switch View
    homeContent.classList.add('hidden');
    itemsView.classList.remove('hidden');
    listContainer.innerHTML = `<div class="loader">Connecting to Store...</div>`;

    try {
        // Ensure Firebase is initialized
        if (!db) {
            throw new Error("Database not initialized");
        }

        // Fetch products
        const snapshot = await db.collection("products").get();
        let html = "";
        let found = false;

        snapshot.forEach((doc) => {
            const p = doc.data();
            if (p.name.toLowerCase().includes(query) || p.cat.toLowerCase().includes(query)) {
                found = true;
                html += `
                    <div class="item-card">
                        <img src="${p.img}" alt="${p.name}">
                        <div class="item-info">
                            <small>${p.unit || ''}</small>
                            <h4>${p.name}</h4>
                            <div class="price-box">
                                <b>₹${p.price}</b>
                                <button onclick="addToCart('${doc.id}', '${p.name}', ${p.price}, '${p.img}', '${p.unit}')">ADD</button>
                            </div>
                        </div>
                    </div>`;
            }
        });

        if (!found) {
            listContainer.innerHTML = `<div class="no-data">No items found for "${query}"</div>`;
        } else {
            listContainer.innerHTML = html;
        }

    } catch (error) {
        console.error("Firebase Search Error:", error);
        // This is the error you were seeing
        listContainer.innerHTML = `
            <div class="error-msg">
                <p>Connection Error!</p>
                <small>Check your internet or Firebase Rules.</small>
            </div>`;
    }
}
// 4. GENERATE CATEGORY GRID (RESTORED)
function initStore() {

    const gridMappings = {
        "Grocery & Kitchen": "grocery-grid",
        "Snacks & Drink": "snacks-grid",
        "Household": "household-grid",
        "Personal Care": "beauty-grid"
    };

    for (const [sectionTitle, categories] of Object.entries(storeData)) {

        const gridElement = document.getElementById(gridMappings[sectionTitle]);

        if (gridElement) {
            gridElement.innerHTML = categories.map(cat => `
                <div class="cat-card" onclick="openCategory('${cat.name}')">
                    <img src="${cat.img}" alt="${cat.name}">
                    <p>${cat.name}</p>
                </div>
            `).join('');
        }
    }
}

// 5. VIEW NAVIGATION
function openCategory(catName) {
    document.getElementById('home-content').classList.add('hidden');
    document.getElementById('items-view').classList.remove('hidden');
    document.getElementById('selected-cat-title').innerText = catName;
    window.scrollTo(0, 0);

    db.collection("products").where("cat", "==", catName).onSnapshot((snapshot) => {
        let html = "";
        snapshot.forEach((doc) => {
            const p = doc.data();
            const id = doc.id;
            const isSoldOut = p.status === "soldout" || p.stock <= 0;

            html += `
                <div class="item-card ${isSoldOut ? 'sold-out-blur' : ''}">
                    <img src="${p.img}" alt="${p.name}">
                    <div class="item-info">
                        <small>${p.unit || ''}</small>
                        <h4>${p.name}</h4>
                        <div class="price-box">
                            <b>₹${p.price}</b>
                            <button class="add-btn" 
                                onclick="addToCart('${id}', '${p.name.replace(/'/g, "\\'")}', ${p.price}, '${p.img}', '${p.unit || ''}')"
                                ${isSoldOut ? 'disabled' : ''}>
                                ${isSoldOut ? 'OUT' : 'ADD'}
                            </button>
                        </div>
                    </div>
                </div>`;
        });
        document.getElementById('product-list').innerHTML = html || `<p>No items in ${catName}</p>`;
    });
}

// 6. CART LOGIC
function addToCart(id, name, price, img, unit) {
    let cart = JSON.parse(localStorage.getItem('pepal_cart')) || [];
    const existing = cart.find(item => item.id === id);

    if (existing) {
        existing.qty += 1;
    } else {
        cart.push({ id, name, price: Number(price), img, unit: unit || "", qty: 1 });
    }

    localStorage.setItem('pepal_cart', JSON.stringify(cart));
    updateCartCount();
    alert(`${name} added!`);
}

function updateCartCount() {
    const el = document.getElementById('cart-count');
    if (!el) return;
    const cart = JSON.parse(localStorage.getItem('pepal_cart')) || [];
    const count = cart.reduce((s, i) => s + i.qty, 0);
    el.innerText = count;
    el.style.display = count > 0 ? "block" : "none";
}

// 7. BANNER LOGIC
let slideIdx = 0;
function loadBanners() {
    db.collection("settings").doc("banners").onSnapshot(doc => {
        const slider = document.getElementById('main-slider');
        if (doc.exists && slider) {
            const urls = doc.data().urls;
            slider.innerHTML = urls.map((u, i) => `<img src="${u}" class="slide-img" style="display:${i==0?'block':'none'}">`).join('');
            setInterval(() => {
                const s = document.getElementsByClassName("slide-img");
                if (s.length < 2) return;
                s[slideIdx].style.display = "none";
                slideIdx = (slideIdx + 1) % s.length;
                s[slideIdx].style.display = "block";
            }, 4000);
        }
    });
}

function showHome() {
    document.getElementById('home-content').classList.remove('hidden');
    document.getElementById('items-view').classList.add('hidden');
}
