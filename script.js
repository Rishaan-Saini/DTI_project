// Data Structure holding our items
let marketItems = [];

// Initialize App
window.onload = function() {
    loadFromStorage();
    renderAvailable();
    renderSold();

    if (localStorage.getItem('marketTheme') === 'dark') {
        document.body.classList.add('dark-mode');
        document.getElementById('btn-theme').innerText = '☀️ Light Mode';
    }
};

// Navigation Logic
function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(sec => sec.classList.remove('active'));
    // Remove active class from buttons
    document.querySelectorAll('nav button').forEach(btn => btn.classList.remove('active'));
    
    // Show target section
    document.getElementById(sectionId).classList.add('active');
    
    // Highlight active button (ignore master clear)
    const targetBtn = document.getElementById(`btn-${sectionId}`);
    if(targetBtn) targetBtn.classList.add('active');
}

// Toggle Dark Mode
function toggleTheme() {
    const body = document.body;
    const themeBtn = document.getElementById('btn-theme');
    
    // This adds the class if it's missing, or removes it if it's there
    body.classList.toggle('dark-mode');
    
    // Check if the class is currently active to save the preference
    if (body.classList.contains('dark-mode')) {
        localStorage.setItem('marketTheme', 'dark');
        themeBtn.innerText = '☀️ Light Mode';
    } else {
        localStorage.setItem('marketTheme', 'light');
        themeBtn.innerText = '🌙 Dark Mode';
    }
}

// Add New Item Logic
async function handleAddItem(e) {
    e.preventDefault();

    const name = document.getElementById('itemName').value;
    const price = document.getElementById('itemPrice').value;
    const desc = document.getElementById('itemDesc').value;
    const fileInput = document.getElementById('itemImage');
    const file = fileInput.files[0];

    // Size validation (1MB = 1048576 bytes)
    if (file.size > 1048576) {
        alert("File is too large! Please select an image under 1MB.");
        return;
    }

    try {
        const base64Image = await convertBase64(file);
        
        const newItem = {
            id: Date.now().toString(), // unique ID based on timestamp
            name: name,
            price: price,
            description: desc,
            image: base64Image,
            status: 'available' // 'available' or 'sold'
        };

        marketItems.push(newItem);
        saveToStorage();
        
        // Reset form and UI
        document.getElementById('addItemForm').reset();
        renderAvailable();
        showSection('available');
        alert("Item listed successfully!");

    } catch (error) {
        alert("Error processing image. The storage might be full.");
    }
}

// Convert Image to Base64 String
function convertBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

// Mark an item as sold
function markAsSold(id) {
    if(confirm("Are you sure you want to mark this item as sold?")) {
        const itemIndex = marketItems.findIndex(item => item.id === id);
        if (itemIndex !== -1) {
            marketItems[itemIndex].status = 'sold';
            saveToStorage();
            renderAvailable();
            renderSold();
        }
    }
}

// Render the Grid of Available Items
function renderAvailable() {
    const grid = document.getElementById('available-grid');
    grid.innerHTML = '';

    const availableItems = marketItems.filter(item => item.status === 'available');

    if (availableItems.length === 0) {
        grid.innerHTML = '<p>No items currently available.</p>';
        return;
    }

    availableItems.forEach(item => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <img src="${item.image}" alt="${item.name}">
            <div class="card-content">
                <h3>${item.name}</h3>
                <p class="card-price">₹${item.price}</p>
                <p>${item.description}</p>
            </div>
            <div class="card-action">
                <button onclick="markAsSold('${item.id}')">Mark Sold</button>
                <button onclick="deleteItem('${item.id}')" class="btn-delete">Delete</button>
            </div>
        `;
        grid.appendChild(card);
    });
}

// Render the List of Sold Items
function renderSold() {
    const list = document.getElementById('sold-list');
    list.innerHTML = '';

    const soldItems = marketItems.filter(item => item.status === 'sold');

    if (soldItems.length === 0) {
        list.innerHTML = '<li>No items sold yet.</li>';
        return;
    }

    soldItems.forEach(item => {
        const li = document.createElement('li');
        li.innerHTML = `
            <div>
                <span class="sold-name">${item.name}</span>
                <span class="sold-price" style="margin-left: 10px;">Sold for ₹${item.price}</span>
            </div>
            <button onclick="deleteItem('${item.id}')" class="btn-delete-small">Delete</button>
        `;
        list.appendChild(li);
    });
}

// Permanently Delete an Item
function deleteItem(id) {
    if(confirm("Are you sure you want to permanently delete this item? This will free up storage space.")) {
        // Filter out the item with the matching ID
        marketItems = marketItems.filter(item => item.id !== id);
        
        // Save the new, smaller list to storage
        saveToStorage();
        
        // Re-render the screens to show the item is gone
        // Note: If you haven't implemented the search bar yet, just use renderAvailable();
        const searchInput = document.getElementById('searchInput');
        const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
        
        renderAvailable(searchTerm);
        renderSold();
    }
}

// Local Storage Helpers
function saveToStorage() {
    try {
        localStorage.setItem('localMarketItems', JSON.stringify(marketItems));
    } catch (e) {
        alert("Storage limit reached! Please clear master storage or delete some items.");
    }
}

function loadFromStorage() {
    const stored = localStorage.getItem('localMarketItems');
    if (stored) {
        marketItems = JSON.parse(stored);
    }
}

// Master Clear
function clearMaster() {
    if(confirm("WARNING: This will delete ALL available and sold items forever. Are you sure?")) {
        localStorage.removeItem('localMarketItems');
        marketItems = [];
        renderAvailable();
        renderSold();
        alert("All data cleared successfully.");
    }
}