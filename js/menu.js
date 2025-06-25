// Enhanced Menu Page JavaScript with Admin Integration
class MenuManager {
    constructor() {
        this.products = [];
        this.categories = [];
        this.currentCategory = 'all';
        this.isLoading = false;
        this.init();
    }

    init() {
        this.loadData();
        this.setupEventListeners();
        this.renderCategories();
        this.renderProducts();
        this.setupCartConnection();
        this.setupAdminSync();
    }

    loadData() {
        // Load from admin data first
        if (window.adminDataManager) {
            this.products = window.adminDataManager.getProducts();
            this.categories = window.adminDataManager.getCategories();
        } else {
            // Check for synced web products
            const webProducts = JSON.parse(localStorage.getItem('webMenuProducts') || 'null');
            if (webProducts) {
                this.products = webProducts;
            } else {
                this.products = this.getDefaultProducts();
            }
            this.categories = this.getDefaultCategories();
        }
    }

    setupAdminSync() {
        // Listen for admin product updates
        window.addEventListener('menuProductsUpdated', (event) => {
            this.products = event.detail;
            this.renderProducts();
            this.showNotification('Menu telah diperbarui oleh admin', 'info');
        });

        // Listen for admin data updates
        window.addEventListener('adminDataUpdated', (event) => {
            if (event.detail.products) {
                this.products = event.detail.products;
                this.renderProducts();
            }
        });

        // Periodic sync with admin data
        setInterval(() => {
            this.syncWithAdmin();
        }, 10000); // Sync every 10 seconds
    }

    syncWithAdmin() {
        if (window.adminDataManager) {
            const adminProducts = window.adminDataManager.getProducts();
            if (JSON.stringify(adminProducts) !== JSON.stringify(this.products)) {
                this.products = adminProducts;
                this.renderProducts();
            }
        }
    }

    setupCartConnection() {
        // Listen for cart updates from admin
        window.addEventListener('adminCartUpdate', (event) => {
            this.handleAdminCartUpdate(event.detail);
        });

        // Send menu activity to admin
        this.notifyAdmin('menuPageVisit', {
            timestamp: new Date().toISOString(),
            totalProducts: this.products.length,
            categories: this.categories.length
        });
    }

    getDefaultProducts() {
        return [
            {
                id: 'prod_001',
                name: 'Espresso',
                category: 'coffee',
                price: 25000,
                description: 'Kopi hitam kental dengan cita rasa kuat dan aroma yang menggugah selera',
                image: '/placeholder.svg?height=200&width=300',
                status: 'available'
            },
            {
                id: 'prod_002',
                name: 'Cappuccino',
                category: 'coffee',
                price: 35000,
                description: 'Espresso dengan steamed milk dan foam yang lembut, perpaduan sempurna',
                image: '/placeholder.svg?height=200&width=300',
                status: 'available'
            },
            {
                id: 'prod_003',
                name: 'Latte',
                category: 'coffee',
                price: 35000,
                description: 'Espresso dengan susu steamed dan sedikit foam, creamy dan smooth',
                image: '/placeholder.svg?height=200&width=300',
                status: 'available'
            },
            {
                id: 'prod_004',
                name: 'Americano',
                category: 'coffee',
                price: 30000,
                description: 'Espresso dengan tambahan air panas, untuk pecinta kopi hitam',
                image: '/placeholder.svg?height=200&width=300',
                status: 'available'
            },
            {
                id: 'prod_005',
                name: 'Pasta Carbonara',
                category: 'food',
                price: 65000,
                description: 'Pasta dengan saus krim, telur, dan bacon crispy yang menggugah selera',
                image: '/placeholder.svg?height=200&width=300',
                status: 'available'
            },
            {
                id: 'prod_006',
                name: 'Chicken Sandwich',
                category: 'food',
                price: 55000,
                description: 'Sandwich dengan ayam panggang dan sayuran segar, sehat dan lezat',
                image: '/placeholder.svg?height=200&width=300',
                status: 'available'
            },
            {
                id: 'prod_007',
                name: 'Tiramisu',
                category: 'dessert',
                price: 45000,
                description: 'Dessert Italia dengan lapisan kopi dan mascarpone yang lembut',
                image: '/placeholder.svg?height=200&width=300',
                status: 'available'
            },
            {
                id: 'prod_008',
                name: 'Chocolate Lava Cake',
                category: 'dessert',
                price: 48000,
                description: 'Kue cokelat dengan lelehan cokelat di tengahnya, hangat dan manis',
                image: '/placeholder.svg?height=200&width=300',
                status: 'available'
            }
        ];
    }

    getDefaultCategories() {
        return [
            { id: 'coffee', name: 'Kopi', icon: 'fas fa-coffee' },
            { id: 'food', name: 'Makanan', icon: 'fas fa-utensils' },
            { id: 'dessert', name: 'Dessert', icon: 'fas fa-birthday-cake' },
            { id: 'drinks', name: 'Minuman', icon: 'fas fa-glass-water' }
        ];
    }

    setupEventListeners() {
        // Category filter buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('category-tab') || e.target.closest('.category-tab')) {
                this.handleCategoryChange(e);
            }

            if (e.target.classList.contains('add-to-cart') || e.target.closest('.add-to-cart')) {
                this.handleAddToCart(e);
            }
        });

        // Search functionality
        const searchInput = document.getElementById('menuSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.handleSearch(e.target.value);
            });
        }
    }

    handleCategoryChange(e) {
        e.preventDefault();
        
        const button = e.target.closest('.category-tab') || e.target;
        
        // Remove active class from all tabs
        document.querySelectorAll('.category-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        
        // Add active class to clicked tab
        button.classList.add('active');
        
        // Update current category
        this.currentCategory = button.dataset.category;
        
        // Show loading
        this.showLoading();
        
        // Re-render products with delay for smooth animation
        setTimeout(() => {
            this.renderProducts();
            this.notifyAdmin('categoryChanged', {
                category: this.currentCategory,
                timestamp: new Date().toISOString()
            });
        }, 300);
    }

    handleAddToCart(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const menuItem = e.target.closest('.menu-item');
        if (!menuItem) return;

        const productId = menuItem.dataset.id || this.extractProductIdFromCard(menuItem);
        const product = this.products.find(p => p.id === productId) || this.extractProductFromCard(menuItem);
        
        if (!product) return;

        // Check if product is available
        if (product.status !== 'available') {
            this.showNotification('Produk ini sedang tidak tersedia', 'error');
            return;
        }

        // Add visual feedback
        const button = e.target.closest('.add-to-cart');
        this.addToCartAnimation(button);

        // Add to cart
        if (window.app) {
            window.app.addToCart(product);
        } else {
            this.addToCartFallback(product);
        }

        // Notify admin
        this.notifyAdmin('productAddedToCart', {
            product: product,
            timestamp: new Date().toISOString()
        });

        this.showNotification(`${product.name} berhasil ditambahkan ke keranjang!`, 'success');
    }

    addToCartAnimation(button) {
        if (!button) return;

        // Save original content
        const originalContent = button.innerHTML;
        
        // Change to success state
        button.classList.add('success');
        button.innerHTML = '<i class="fas fa-check"></i> Ditambahkan!';
        button.disabled = true;
        
        // Reset after animation
        setTimeout(() => {
            button.classList.remove('success');
            button.innerHTML = originalContent;
            button.disabled = false;
        }, 1500);
    }

    extractProductIdFromCard(menuItem) {
        // Try to extract ID from various sources
        return menuItem.id || 
               menuItem.querySelector('[data-id]')?.dataset.id ||
               `prod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    extractProductFromCard(menuItem) {
        const name = menuItem.querySelector('h3')?.textContent || 'Unknown Product';
        const priceText = menuItem.querySelector('.menu-price')?.textContent || 'Rp 0';
        const price = parseInt(priceText.replace(/[^\d]/g, '')) || 0;
        const image = menuItem.querySelector('img')?.src || '/placeholder.svg';
        const description = menuItem.querySelector('p')?.textContent || '';
        const category = menuItem.dataset.category || 'other';

        return {
            id: this.extractProductIdFromCard(menuItem),
            name,
            price,
            image,
            description,
            category,
            quantity: 1,
            status: 'available'
        };
    }

    addToCartFallback(product) {
        // Fallback cart management if main app is not available
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        
        const existingItem = cart.find(item => item.id === product.id);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({ ...product, quantity: 1 });
        }
        
        localStorage.setItem('cart', JSON.stringify(cart));
        this.updateCartCount(cart);
        
        // Trigger storage event for admin sync
        window.dispatchEvent(new StorageEvent('storage', {
            key: 'cart',
            newValue: JSON.stringify(cart),
            oldValue: null,
            storageArea: localStorage
        }));
    }

    updateCartCount(cart) {
        const count = cart.reduce((total, item) => total + item.quantity, 0);
        const cartCountElements = document.querySelectorAll('.cart-count');
        
        cartCountElements.forEach(element => {
            element.textContent = count;
            element.style.display = count > 0 ? 'flex' : 'none';
        });
    }

    handleSearch(query) {
        this.searchQuery = query.toLowerCase();
        this.renderProducts();
    }

    showLoading() {
        const menuGrid = document.querySelector('.menu-grid');
        if (!menuGrid) return;

        this.isLoading = true;
        menuGrid.innerHTML = `
            <div class="menu-loading">
                <div class="loading-spinner"></div>
                Memuat menu...
            </div>
        `;
    }

    renderCategories() {
        const categoryTabs = document.querySelector('.category-tabs');
        if (!categoryTabs) return;

        const allCategories = [
            { id: 'all', name: 'Semua', icon: 'fas fa-th' },
            ...this.categories
        ];

        categoryTabs.innerHTML = allCategories.map(category => `
            <button class="category-tab ${category.id === 'all' ? 'active' : ''}" 
                    data-category="${category.id}">
                <i class="${category.icon}"></i>
                <span>${category.name}</span>
            </button>
        `).join('');
    }

    renderProducts() {
        const menuGrid = document.querySelector('.menu-grid');
        if (!menuGrid) return;

        let filteredProducts = this.products.filter(product => 
            product.status === 'available'
        );

        // Filter by category
        if (this.currentCategory !== 'all') {
            filteredProducts = filteredProducts.filter(product => 
                product.category === this.currentCategory
            );
        }

        // Filter by search query
        if (this.searchQuery) {
            filteredProducts = filteredProducts.filter(product =>
                product.name.toLowerCase().includes(this.searchQuery) ||
                product.description.toLowerCase().includes(this.searchQuery)
            );
        }

        if (filteredProducts.length === 0) {
            menuGrid.innerHTML = `
                <div class="empty-menu">
                    <i class="fas fa-search"></i>
                    <h3>Tidak ada menu ditemukan</h3>
                    <p>Silakan coba kategori lain atau ubah kata kunci pencarian.</p>
                </div>
            `;
            return;
        }

        menuGrid.innerHTML = filteredProducts.map((product, index) => `
            <div class="menu-item enhanced-card" 
                 data-category="${product.category}" 
                 data-id="${product.id}"
                 style="animation-delay: ${index * 0.1}s">
                <div class="menu-image">
                    <img src="${product.image}" alt="${product.name}" loading="lazy">
                    ${product.status !== 'available' ? '<div class="unavailable-overlay">Tidak Tersedia</div>' : ''}
                </div>
                <div class="menu-info">
                    <h3>${product.name}</h3>
                    <p class="menu-description">${product.description}</p>
                    <div class="menu-price">Rp ${this.formatPrice(product.price)}</div>
                    <button class="add-to-cart enhanced-btn" ${product.status !== 'available' ? 'disabled' : ''}>
                        <i class="fas fa-plus"></i>
                        <span>Tambah ke Keranjang</span>
                    </button>
                </div>
            </div>
        `).join('');

        this.isLoading = false;
        
        // Trigger animation
        setTimeout(() => {
            this.animateCards();
        }, 100);
    }

    animateCards() {
        const cards = document.querySelectorAll('.menu-item');
        cards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
            
            setTimeout(() => {
                card.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }

    notifyAdmin(action, data) {
        // Send notification to admin system
        if (window.adminDataManager) {
            let message = '';
            let type = 'info';
            
            switch (action) {
                case 'menuPageVisit':
                    message = `Halaman menu dikunjungi - ${data.totalProducts} produk tersedia`;
                    break;
                case 'categoryChanged':
                    message = `Kategori menu diubah ke: ${data.category}`;
                    break;
                case 'productAddedToCart':
                    message = `Produk ditambahkan ke keranjang: ${data.product.name}`;
                    type = 'success';
                    break;
            }
            
            window.adminDataManager.addNotification({
                type: type,
                title: 'Aktivitas Menu',
                message: message,
                timestamp: new Date().toISOString(),
                data: data
            });
        }

        // Trigger menu activity event
        window.dispatchEvent(new CustomEvent('menuActivity', {
            detail: {
                action: action,
                data: data,
                timestamp: new Date().toISOString()
            }
        }));
    }

    handleAdminCartUpdate(data) {
        // Handle updates from admin (e.g., product availability changes)
        if (data.type === 'productUpdate') {
            this.loadData();
            this.renderProducts();
        }
    }

    formatPrice(price) {
        return new Intl.NumberFormat('id-ID').format(price);
    }

    showNotification(message, type) {
        if (window.app) {
            window.app.showNotification(message, type);
        } else {
            // Fallback notification
            const notification = document.createElement('div');
            notification.className = `notification notification-${type}`;
            notification.innerHTML = `
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            `;

            document.body.appendChild(notification);

            // Show notification
            setTimeout(() => notification.classList.add('show'), 100);

            // Hide notification after 3 seconds
            setTimeout(() => {
                notification.classList.remove('show');
                setTimeout(() => notification.remove(), 300);
            }, 3000);
        }
    }
}

// Initialize menu manager
const menuManager = new MenuManager();

// Enhanced menu styles
const enhancedMenuStyles = `
.empty-menu {
    grid-column: 1 / -1;
    text-align: center;
    padding: 80px 20px;
    color: #6c757d;
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    border-radius: 20px;
    border: 2px dashed #dee2e6;
}

.empty-menu i {
    font-size: 4rem;
    margin-bottom: 20px;
    opacity: 0.5;
    color: #c8a97e;
}

.empty-menu h3 {
    font-size: 1.5rem;
    margin-bottom: 10px;
    color: #2c3e50;
}

.enhanced-card {
    position: relative;
    overflow: hidden;
}

.enhanced-btn {
    position: relative;
    overflow: hidden;
    z-index: 1;
}

.unavailable-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    font-size: 1.1rem;
}

.add-to-cart:disabled {
    background-color: #ccc;
    cursor: not-allowed;
    opacity: 0.6;
}

.add-to-cart:disabled:hover {
    background-color: #ccc;
    transform: none;
    box-shadow: none;
}

/* Floating Action Button Style for Mobile */
@media (max-width: 768px) {
    .add-to-cart {
        position: absolute;
        bottom: 15px;
        right: 15px;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        padding: 0;
        box-shadow: 0 4px 15px rgba(200, 169, 126, 0.4);
    }
    
    .add-to-cart span {
        display: none;
    }
    
    .add-to-cart i {
        font-size: 1.2rem;
    }
}

/* Success state animation */
.add-to-cart.success {
    background: linear-gradient(135deg, #27ae60 0%, #229954 100%);
    transform: scale(1.1);
}

/* Menu item hover effects */
.menu-item:hover {
    z-index: 10;
}

/* Category tab active state enhancement */
.category-tab.active {
    background: linear-gradient(135deg, #c8a97e 0%, #b89669 100%);
    color: white;
    box-shadow: 0 8px 25px rgba(200, 169, 126, 0.4);
}

/* Notification styles */
.notification {
    position: fixed;
    top: 20px;
    right: 20px;
    background: white;
    padding: 15px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    display: flex;
    align-items: center;
    gap: 10px;
    transform: translateX(400px);
    transition: transform 0.3s ease;
    z-index: 1001;
    max-width: 350px;
}

.notification.show {
    transform: translateX(0);
}

.notification-success {
    border-left: 4px solid #27ae60;
    color: #27ae60;
}

.notification-error {
    border-left: 4px solid #e74c3c;
    color: #e74c3c;
}

.notification-info {
    border-left: 4px solid #3498db;
    color: #3498db;
}

.notification i {
    font-size: 18px;
}

.notification span {
    flex: 1;
    font-weight: 500;
}
`;

// Add enhanced styles
const styleSheet = document.createElement('style');
styleSheet.textContent = enhancedMenuStyles;
document.head.appendChild(styleSheet);