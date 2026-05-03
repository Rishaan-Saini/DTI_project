let marketItems = [];

window.onload = function() {
    loadFromStorage();
    renderAvailable();
    renderSold();

    if (localStorage.getItem('marketTheme') === 'dark') {
        document.body.classList.add('dark-mode');
        document.getElementById('btn-theme').innerText = '☀️ Light Mode';
    }
};

// THIS FUNCTION HANDLES THE SWITCHING BETWEEN DIFFERENT SECTION ON MAIN PAGE
function showSection(sectionId) {
    // SHOWS ONLY THE SELECTED SECTION AND HIDES THE REST
    document.querySelectorAll('.section').forEach(sec => sec.classList.remove('active'));
    
    //THIS RESETS ALL NAV BUTTON SO NONE LOOKS SELETCED
    document.querySelectorAll('nav button').forEach(btn => btn.classList.remove('active'));
    
    // THIS DISPLAYS THE SECTION WE HAVE CLICKED ON
    document.getElementById(sectionId).classList.add('active');

    // HIGHLIGHTS THE SECTION THAT IS SELECTED
    const targetBtn = document.getElementById(`btn-${sectionId}`);
    if(targetBtn) targetBtn.classList.add('active');
}

// THIS IS TO TOGGLE DARK THEME
function toggleTheme() {
    const body = document.body;
    const themeBtn = document.getElementById('btn-theme');
    
    body.classList.toggle('dark-mode');
    
    if (body.classList.contains('dark-mode')) {
        localStorage.setItem('marketTheme', 'dark');
        themeBtn.innerText = '☀️ Light Mode';
    } else {
        localStorage.setItem('marketTheme', 'light');
        themeBtn.innerText = '🌙 Dark Mode';
    }
}

//THIS ADDS A NEW ITEM
async function handleAddItem(e) {
    e.preventDefault();

    const name = document.getElementById('itemName').value;
    const price = document.getElementById('itemPrice').value;
    const desc = document.getElementById('itemDesc').value;
    const fileInput = document.getElementById('itemImage');
    const file = fileInput.files[0];

    // THIS IS FOR SIZE VALIDATION
    if (file.size > 1048576) {
        alert("File is too large! Please select an image under 1MB.");
        return;
    }

    try {
        const base64Image = await convertBase64(file);
        
        const newItem = {
    id: Date.now().toString(),
    name: document.getElementById('itemName').value,
    price: document.getElementById('itemPrice').value,
    description: document.getElementById('itemDesc').value,
    image: base64Image,

    category: document.getElementById('category').value,
    condition: document.getElementById('condition').value,
    location: document.getElementById('location').value,
    owner: document.getElementById('sellerName').value,
    contact: document.getElementById('contact').value,

    status: 'available'
};

        marketItems.push(newItem);
        saveToStorage();
        document.getElementById('addItemForm').reset();
        renderAvailable();
        showSection('available');
        alert("Item listed successfully!");

    } catch (error) {
        alert("Error processing image. The storage might be full.");
    }
}

// THIS IS TO CONVERT IMAGE TO BASE 64 STRING
function convertBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

// THIS IS TO MARK AN ITEM AS SOLD
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

// SHOWS US THE GIRD OF ITEMS THAT ARE IN SHOP
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
    </div>

    <div class="card-action">
        <button onclick="toggleDetails('${item.id}')">Details</button>
        <button onclick="buyItem('${item.id}')" class="btn-buy">Buy Now</button>
        <button onclick="deleteItem('${item.id}')" class="btn-delete">Delete</button>
    </div>

    <div id="details-${item.id}" class="item-details" style="display:none;">
    <p><b>Description:</b> ${item.description}</p>
    <p><b>Category:</b> ${item.category}</p>
    <p><b>Condition:</b> ${item.condition}</p>
    <p><b>Owner:</b> ${item.owner}</p>
    <p><b>Location:</b> ${item.location}</p>
    <p><b>Contact:</b> ${item.contact}</p>
</div>
`;
        //THIS IS DONE TO SHOW ALL ITEM DETAILS ON THE GRID
        grid.appendChild(card);
    });
}

// IT RENDERS US THE LIST OF SOLD ITEMS
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

// PERMANENT DELETING
function deleteItem(id) {
    if(confirm("Are you sure you want to permanently delete this item? This will free up storage space.")) {
        
        marketItems = marketItems.filter(item => item.id !== id);
        
        // THIS SAVES A NEW ITEM TO LOCAL STORAGE
        saveToStorage();   
        const searchInput = document.getElementById('searchInput');
        const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
        
        renderAvailable(searchTerm);
        renderSold();
        //THIS RE-RENDERS TO SHOW US THAT THE ITEM IS GONE
    }
}

// LOCAL STORAGE
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

// MASTER CLEAR
function clearMaster() {
    if(confirm("WARNING: This will delete ALL available and sold items forever. Are you sure?")) {
        localStorage.removeItem('localMarketItems');
        marketItems = [];
        renderAvailable();
        renderSold();
        alert("All data cleared successfully.");
    }
}


function buyItem(id) {
    const itemIndex = marketItems.findIndex(item => item.id === id);

    if (itemIndex !== -1) {
        if(confirm("Do you want to buy this item?")) {
            marketItems[itemIndex].status = 'sold';

            saveToStorage();
            renderAvailable();
            renderSold();

            alert("Item purchased successfully!");
        }
    }
}

function toggleDetails(id) {
    const div = document.getElementById(`details-${id}`);

    if (div.style.display === "none") {
        div.style.display = "block";
    } else {
        div.style.display = "none";
    }
}
