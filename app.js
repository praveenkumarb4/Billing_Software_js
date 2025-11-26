// State
let products = [];
let cart = [];

// Make functions global
window.loadDashboard = loadDashboard;
window.loadProducts = loadProducts;
window.loadPOS = loadPOS;
window.checkAuth = checkAuth; // Ensure checkAuth is also global if needed

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function () {
    try {
        // Check authentication first
        if (typeof checkAuth === 'function') {
            checkAuth();
        }

        loadDashboard();
    } catch (e) {
        console.error('Error in DOMContentLoaded:', e);
        document.getElementById('content-area').innerHTML = `<h1>Error initializing app: ${e.message}</h1>`;
    }
});

// Navigation
async function loadDashboard() {
    const content = document.getElementById('content-area');
    content.innerHTML = '<h1>Loading Dashboard...</h1>';

    try {
        const response = await fetch(`${API_BASE_URL}/dashboard/stats`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const stats = await response.json();

        content.innerHTML = `
            <h1>Dashboard</h1>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin-top: 2rem;">
                <div class="card">
                    <h3>Total Sales</h3>
                    <p style="font-size: 2rem; font-weight: bold; color: #2563eb;">₹${stats.totalSales}</p>
                    <p style="color: #6b7280;">Total</p>
                </div>
                <div class="card">
                    <h3>Total Orders</h3>
                    <p style="font-size: 2rem; font-weight: bold; color: #10b981;">${stats.totalOrders}</p>
                    <p style="color: #6b7280;">Total</p>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
        content.innerHTML = `
            <h1>Error Loading Dashboard</h1>
            <div class="card" style="margin-top: 2rem;">
                <p style="color: #dc2626; margin-bottom: 1rem;">Failed to load dashboard statistics.</p>
                <p style="color: #6b7280; font-size: 0.875rem;">Error: ${error.message}</p>
                <p style="color: #6b7280; font-size: 0.875rem; margin-top: 0.5rem;">
                    Please ensure the backend server is running at ${API_BASE_URL}
                </p>
                <button onclick="loadDashboard()" class="btn btn-primary" style="margin-top: 1rem;">Retry</button>
            </div>
        `;
    }
}

async function loadProducts() {
    const content = document.getElementById('content-area');
    content.innerHTML = '<h1>Loading...</h1>';

    try {
        const response = await fetch(`${API_BASE_URL}/products`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        products = await response.json();

        renderProductList(content);
    } catch (error) {
        console.error('Error loading products:', error);
        content.innerHTML = `
            <h1>Error Loading Products</h1>
            <div class="card" style="margin-top: 2rem;">
                <p style="color: #dc2626; margin-bottom: 1rem;">Failed to load products.</p>
                <p style="color: #6b7280; font-size: 0.875rem;">Error: ${error.message}</p>
                <button onclick="loadProducts()" class="btn btn-primary" style="margin-top: 1rem;">Retry</button>
            </div>
        `;
    }
}

function renderProductList(container) {
    container.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
            <h1>Products</h1>
            <div class="card" style="margin-bottom: 0; padding: 1rem;">
                <h3>Add New Product</h3>
                <form onsubmit="handleAddProduct(event)" style="display: flex; gap: 0.5rem; align-items: flex-end; margin-top: 1rem;">
                    <div>
                        <input type="text" id="new-name" placeholder="Name" class="form-control" required>
                    </div>
                    <div>
                        <input type="number" id="new-price" placeholder="Price" class="form-control" required>
                    </div>
                    <div>
                        <input type="number" id="new-stock" placeholder="Stock" class="form-control" required>
                    </div>
                    <button type="submit" class="btn btn-primary">Add</button>
                </form>
            </div>
        </div>

        <div class="card">
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Price</th>
                        <th>Stock</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${products.map(p => `
                        <tr>
                            <td>${p.name}</td>
                            <td>₹${p.price}</td>
                            <td>${p.stock}</td>
                            <td>
                                <button onclick="deleteProduct(${p.id})" class="btn btn-danger" style="padding: 0.25rem 0.5rem; font-size: 0.875rem;">Delete</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

async function handleAddProduct(event) {
    event.preventDefault();
    const name = document.getElementById('new-name').value;
    const price = document.getElementById('new-price').value;
    const stock = document.getElementById('new-stock').value;

    try {
        await fetch(`${API_BASE_URL}/products`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, price, stock })
        });
        loadProducts(); // Reload list
    } catch (error) {
        console.error('Error adding product:', error);
        alert('Failed to add product');
    }
}

async function deleteProduct(id) {
    if (!confirm('Are you sure?')) return;
    try {
        await fetch(`${API_BASE_URL}/products/${id}`, { method: 'DELETE' });
        loadProducts();
    } catch (error) {
        console.error('Error deleting product:', error);
    }
}

async function loadPOS() {
    // Fetch latest products first
    try {
        const response = await fetch(`${API_BASE_URL}/products`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        products = await response.json();
        cart = []; // Reset cart on load
        renderPOS();
    } catch (error) {
        console.error('Error fetching products for POS:', error);
        const content = document.getElementById('content-area');
        content.innerHTML = `
            <h1>Error Loading POS</h1>
            <div class="card" style="margin-top: 2rem;">
                <p style="color: #dc2626; margin-bottom: 1rem;">Failed to load POS system.</p>
                <p style="color: #6b7280; font-size: 0.875rem;">Error: ${error.message}</p>
                <button onclick="loadPOS()" class="btn btn-primary" style="margin-top: 1rem;">Retry</button>
            </div>
        `;
    }
}

function renderPOS() {
    const content = document.getElementById('content-area');
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    content.innerHTML = `
        <div class="pos-container">
            <div style="flex: 2; display: flex; flex-direction: column; gap: 1rem;">
                <div class="search-bar">
                    <input type="text" placeholder="Search products..." class="form-control" onkeyup="filterProducts(this.value)">
                </div>
                <div class="product-grid" id="pos-products">
                    ${products.map(p => `
                        <div class="product-card" onclick="openQuantityModal(${p.id})">
                            <div style="flex: 1;">
                                <h3 style="margin: 0; font-size: 1rem;">${p.name}</h3>
                            </div>
                            <div style="display: flex; gap: 2rem; align-items: center;">
                                <p style="color: #6b7280; margin: 0; min-width: 80px;">Stock: ${p.stock}</p>
                                <p style="color: #2563eb; font-weight: bold; margin: 0; min-width: 80px; text-align: right;">₹${p.price}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="cart-panel">
                <div style="padding: 1rem; border-bottom: 1px solid #e5e7eb;">
                    <h2>Current Bill</h2>
                    <div id="print-header" style="display: none; text-align: center;">
                        <h3>Grocery Shop</h3>
                        <p>123 Main St</p>
                        <hr style="margin: 1rem 0;">
                    </div>
                </div>
                
                <div class="cart-items">
                    ${cart.map(item => `
                        <div class="cart-item" onclick="editCartItem(${item.id})" style="cursor: pointer;">
                            <div>
                                <h4>${item.name}</h4>
                                <div style="font-size: 0.875rem; color: #6b7280;">
                                    ${item.quantity} x ₹${item.price.toFixed(2)}
                                </div>
                            </div>
                            <div style="display: flex; align-items: center; gap: 1rem;">
                                <span style="font-weight: 600;">₹${(item.price * item.quantity).toFixed(2)}</span>
                                <button onclick="event.stopPropagation(); removeFromCart(${item.id})" class="btn btn-danger" style="padding: 0.25rem 0.5rem;">×</button>
                            </div>
                        </div>
                    `).join('')}
                </div>

                <div class="cart-footer">
                    <div class="total-row">
                        <span>Total</span>
                        <span>₹${total.toFixed(2)}</span>
                    </div>
                    <div class="cart-actions" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                        <button onclick="window.print()" class="btn" style="background-color: #4b5563; color: white;">Print Bill</button>
                        <button onclick="checkout()" class="btn btn-primary">Checkout</button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function filterProducts(query) {
    const grid = document.getElementById('pos-products');
    const filtered = products.filter(p => p.name.toLowerCase().includes(query.toLowerCase()));

    grid.innerHTML = filtered.map(p => `
        <div class="product-card" onclick="openQuantityModal(${p.id})">
            <div style="flex: 1;">
                <h3 style="margin: 0; font-size: 1rem;">${p.name}</h3>
            </div>
            <div style="display: flex; gap: 2rem; align-items: center;">
                <p style="color: #6b7280; margin: 0; min-width: 80px;">Stock: ${p.stock}</p>
                <p style="color: #2563eb; font-weight: bold; margin: 0; min-width: 80px; text-align: right;">₹${p.price}</p>
            </div>
        </div>
    `).join('');
}

let currentProductId = null;
let isEditingCart = false;

function openQuantityModal(productId, isEdit = false) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    currentProductId = productId;
    isEditingCart = isEdit;

    const modal = document.getElementById('quantity-modal');
    document.getElementById('modal-title').textContent = isEdit ? 'Edit Quantity' : 'Add to Cart';
    document.getElementById('modal-product-name').textContent = product.name;
    document.getElementById('modal-product-price').textContent = product.price.toFixed(2);
    document.getElementById('modal-product-stock').textContent = product.stock;

    const cartItem = cart.find(item => item.id === productId);
    document.getElementById('modal-quantity').value = cartItem ? cartItem.quantity : 1;

    modal.classList.add('active');
    document.getElementById('modal-quantity').focus();
    document.getElementById('modal-quantity').select();
}

function closeQuantityModal() {
    document.getElementById('quantity-modal').classList.remove('active');
    currentProductId = null;
    isEditingCart = false;
}

function confirmAddToCart() {
    const quantity = parseFloat(document.getElementById('modal-quantity').value);

    if (!quantity || quantity <= 0) {
        alert('Please enter a valid quantity');
        return;
    }

    const product = products.find(p => p.id === currentProductId);
    if (quantity > product.stock) {
        alert('Insufficient stock available');
        return;
    }

    const existing = cart.find(item => item.id === currentProductId);
    if (existing) {
        existing.quantity = quantity;
    } else {
        cart.push({ ...product, quantity: quantity });
    }

    closeQuantityModal();
    renderPOS();
}

function editCartItem(productId) {
    openQuantityModal(productId, true);
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    renderPOS();
}

async function checkout() {
    if (cart.length === 0) return alert('Cart is empty');

    const billData = {
        items: cart.map(item => ({
            product: { id: item.id },
            quantity: item.quantity,
            price: item.price
        })),
        totalAmount: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    };

    try {
        await fetch(`${API_BASE_URL}/bills`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(billData)
        });
        alert('Bill saved successfully!');
        cart = [];
        loadPOS(); // Reload products to get updated stock
    } catch (error) {
        console.error('Error saving bill:', error);
        alert('Failed to save bill');
    }
}
