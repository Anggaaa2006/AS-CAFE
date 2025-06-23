// Menu Page JavaScript
class MenuManager {
    constructor() {
        this.products = [];
        this.categories = [];
        this.currentCategory = 'all';
        this.init();
    }

    init() {
        this.loadData();
        this.setupEventListeners();
        this.renderCategories();
        this.renderProducts();
    }

    loadData() {
        if (window.adminDataManager) {
            this.products = window.adminDataManager.getProducts();
            this.categories = window.adminDataManager.getCategories();
        } else {
            // Fallback data
            this.products = this.getDefaultProducts();
            this.categories = this.getDefaultCategories();
        }
    }

    getDefaultProducts() {
        return [
            {
                id: 'prod_001',
                name: 'Espresso',
                category: 'coffee',
                price: 25000,
                description: 'Kopi hitam kental dengan cita rasa kuat',
                image: '/placeholder.svg?height=200&width=300',
                status: 'available'
            },
            {
                id: 'prod_002',
                name: 'Cappuccino',
                category: 'coffee',
                price: 35000,
                description: 'Espresso dengan steamed milk dan foam yang lembut',
                image: '/placeholder.svg?height=200&width=300',
                status: 'available'
            },
            {
                id: 'prod_003',
                name: 'Pasta Carbonara',
                category: 'food',
                price: 65000,
                description: 'Pasta dengan saus krim, telur, dan bacon',
                image: '/placeholder.svg?height=200&width=300',
                status: 'available'
            },
            {
                id: 'prod_004',
                name: 'Tiramisu',
                category: 'dessert',
                price: 45000,
                description: 'Dessert Italia dengan lapisan kopi dan mascarpone',
                image: '/placeholder.svg?height=200&width=300',
                status: 'available'
            }
        ];
    }

    getDefaultCategories() {
        return [
            { id: 'all', name: 'Semua', icon: 'fas fa-th' },
            { id: 'coffee', name: 'Kopi', icon: 'fas fa-coffee' },
            { id: 'food', name: 'Makanan', icon: 'fas fa-utensils' },
            { id: 'dessert', name: 'Dessert', icon: 'fas fa-birthday-cake' },
            { id: 'drinks', name: 'Minuman', icon: 'fas fa-glass-water' }
        ];
    }

    setupEventListeners() {
        // Category filter buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('category-tab')) {
                this.handleCategoryChange(e);
            }
        });
    }

    handleCategoryChange(e) {
        e.preventDefault();
        
        // Remove active class from all tabs
        document.querySelectorAll('.category-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        
        // Add active class to clicked tab
        e.target.classList.add('active');
        
        // Update current category
        this.currentCategory = e.target.dataset.category;
        
        // Re-render products
        this.renderProducts();
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

        if (this.currentCategory !== 'all') {
            filteredProducts = filteredProducts.filter(product => 
                product.category === this.currentCategory
            );
        }

        if (filteredProducts.length === 0) {
            menuGrid.innerHTML = `
                <div class="empty-menu">
                    <i class="fas fa-coffee"></i>
                    <h3>Tidak ada menu tersedia</h3>
                    <p>Silakan pilih kategori lain atau kembali lagi nanti.</p>
                </div>
            `;
            return;
        }

        menuGrid.innerHTML = filteredProducts.map(product => `
            <div class="menu-item enhanced-card" data-category="${product.category}">
                <div class="menu-image">
                    <img src="${product.image}" alt="${product.name}" loading="lazy">
                    <div class="menu-overlay">
                        <button class="quick-view-btn" onclick="menuManager.showProductDetail('${product.id}')">
                            <i class="fas fa-eye"></i>
                            Quick View
                        </button>
                    </div>
                    ${product.isRecommended ? '<div class="recommended-badge">Rekomendasi</div>' : ''}
                </div>
                <div class="menu-info">
                    <div class="menu-header">
                        <h3>${product.name}</h3>
                        <div class="menu-price">Rp ${this.formatPrice(product.price)}</div>
                    </div>
                    <p class="menu-description">${product.description}</p>
                    ${product.tags ? `
                        <div class="menu-tags">
                            ${product.tags.slice(0, 3).map(tag => `<span class="tag">${tag}</span>`).join('')}
                        </div>
                    ` : ''}
                    <div class="menu-meta">
                        ${product.preparationTime ? `
                            <span class="prep-time">
                                <i class="fas fa-clock"></i>
                                ${product.preparationTime} min
                            </span>
                        ` : ''}
                        ${product.calories ? `
                            <span class="calories">
                                <i class="fas fa-fire"></i>
                                ${product.calories} kcal
                            </span>
                        ` : ''}
                    </div>
                    <div class="menu-actions">
                        <button class="add-to-cart enhanced-btn">
                            <i class="fas fa-plus"></i>
                            <span>Tambah ke Keranjang</span>
                        </button>
                        <button class="favorite-btn" onclick="menuManager.toggleFavorite('${product.id}')">
                            <i class="far fa-heart"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');

        // Add animation to cards
        this.animateCards();
    }

    animateCards() {
        const cards = document.querySelectorAll('.menu-item');
        cards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                card.style.transition = 'all 0.5s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }

    showProductDetail(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;

        // Create modal
        const modal = document.createElement('div');
        modal.className = 'product-modal';
        modal.innerHTML = `
            <div class="modal-overlay" onclick="this.parentElement.remove()"></div>
            <div class="modal-content">
                <button class="modal-close" onclick="this.closest('.product-modal').remove()">
                    <i class="fas fa-times"></i>
                </button>
                <div class="product-detail">
                    <div class="product-image-large">
                        <img src="${product.image}" alt="${product.name}">
                    </div>
                    <div class="product-info-detail">
                        <h2>${product.name}</h2>
                        <div class="product-price-large">Rp ${this.formatPrice(product.price)}</div>
                        <p class="product-description-full">${product.description}</p>
                        
                        ${product.ingredients ? `
                            <div class="ingredients">
                                <h4>Bahan:</h4>
                                <p>${product.ingredients}</p>
                            </div>
                        ` : ''}
                        
                        <div class="product-details-grid">
                            ${product.preparationTime ? `
                                <div class="detail-item">
                                    <i class="fas fa-clock"></i>
                                    <span>Waktu: ${product.preparationTime} menit</span>
                                </div>
                            ` : ''}
                            ${product.calories ? `
                                <div class="detail-item">
                                    <i class="fas fa-fire"></i>
                                    <span>Kalori: ${product.calories} kcal</span>
                                </div>
                            ` : ''}
                            ${product.isVegetarian ? `
                                <div class="detail-item">
                                    <i class="fas fa-leaf"></i>
                                    <span>Vegetarian</span>
                                </div>
                            ` : ''}
                            ${product.isSpicy ? `
                                <div class="detail-item">
                                    <i class="fas fa-pepper-hot"></i>
                                    <span>Pedas</span>
                                </div>
                            ` : ''}
                        </div>
                        
                        <div class="quantity-selector">
                            <label>Jumlah:</label>
                            <div class="quantity-controls">
                                <button onclick="this.nextElementSibling.stepDown()">-</button>
                                <input type="number" value="1" min="1" max="10">
                                <button onclick="this.previousElementSibling.stepUp()">+</button>
                            </div>
                        </div>
                        
                        <button class="add-to-cart-large" onclick="menuManager.addToCartFromModal('${product.id}', this)">
                            <i class="fas fa-shopping-cart"></i>
                            Tambah ke Keranjang
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        
        // Animate modal
        setTimeout(() => modal.classList.add('show'), 10);
    }

    addToCartFromModal(productId, button) {
        const modal = button.closest('.product-modal');
        const quantity = modal.querySelector('input[type="number"]').value;
        const product = this.products.find(p => p.id === productId);
        
        if (product && window.app) {
            for (let i = 0; i < quantity; i++) {
                window.app.addToCart(product);
            }
            
            window.app.showNotification(`${product.name} (${quantity}x) ditambahkan ke keranjang!`, 'success');
            modal.remove();
        }
    }

    toggleFavorite(productId) {
        const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
        const index = favorites.indexOf(productId);
        
        if (index === -1) {
            favorites.push(productId);
            this.showNotification('Ditambahkan ke favorit!', 'success');
        } else {
            favorites.splice(index, 1);
            this.showNotification('Dihapus dari favorit!', 'info');
        }
        
        localStorage.setItem('favorites', JSON.stringify(favorites));
        this.updateFavoriteButtons();
    }

    updateFavoriteButtons() {
        const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
        document.querySelectorAll('.favorite-btn').forEach(btn => {
            const productId = btn.getAttribute('onclick').match(/'([^']+)'/)[1];
            const icon = btn.querySelector('i');
            
            if (favorites.includes(productId)) {
                icon.className = 'fas fa-heart';
                btn.classList.add('favorited');
            } else {
                icon.className = 'far fa-heart';
                btn.classList.remove('favorited');
            }
        });
    }

    formatPrice(price) {
        return new Intl.NumberFormat('id-ID').format(price);
    }

    showNotification(message, type) {
        if (window.app) {
            window.app.showNotification(message, type);
        }
    }
}

// Initialize menu manager
const menuManager = new MenuManager();

// Enhanced menu styles
const enhancedMenuStyles = `
.enhanced-card {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    border-radius: 16px;
    overflow: hidden;
    background: #fff;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.enhanced-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

.menu-image {
    position: relative;
    overflow: hidden;
    height: 220px;
}

.menu-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.3s ease;
}

.menu-item:hover .menu-overlay {
    opacity: 1;
}

.quick-view-btn {
    background: #c8a97e;
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 25px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 8px;
}

.quick-view-btn:hover {
    background: #b89669;
    transform: scale(1.05);
}

.recommended-badge {
    position: absolute;
    top: 12px;
    left: 12px;
    background: linear-gradient(135deg, #ff6b35, #f7931e);
    color: white;
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.menu-info {
    padding: 24px;
}

.menu-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 12px;
}

.menu-header h3 {
    font-size: 1.3rem;
    font-weight: 600;
    color: #2c3e50;
    margin: 0;
    flex: 1;
}

.menu-price {
    font-size: 1.2rem;
    font-weight: 700;
    color: #c8a97e;
    margin-left: 12px;
}

.menu-description {
    color: #6c757d;
    line-height: 1.5;
    margin-bottom: 16px;
    font-size: 0.95rem;
}

.menu-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-bottom: 16px;
}

.tag {
    background: #f8f9fa;
    color: #6c757d;
    padding: 4px 10px;
    border-radius: 12px;
    font-size: 11px;
    font-weight: 500;
}

.menu-meta {
    display: flex;
    gap: 16px;
    margin-bottom: 20px;
    font-size: 0.85rem;
    color: #6c757d;
}

.menu-meta span {
    display: flex;
    align-items: center;
    gap: 4px;
}

.menu-actions {
    display: flex;
    gap: 12px;
    align-items: center;
}

.enhanced-btn {
    flex: 1;
    background: linear-gradient(135deg, #c8a97e, #b89669);
    color: white;
    border: none;
    padding: 12px 20px;
    border-radius: 25px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
}

.enhanced-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(200, 169, 126, 0.3);
}

.favorite-btn {
    width: 44px;
    height: 44px;
    border: 2px solid #e9ecef;
    background: white;
    border-radius: 50%;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #6c757d;
}

.favorite-btn:hover,
.favorite-btn.favorited {
    border-color: #e74c3c;
    color: #e74c3c;
    background: #fff5f5;
}

.category-tabs {
    display: flex;
    gap: 12px;
    margin-bottom: 40px;
    flex-wrap: wrap;
    justify-content: center;
}

.category-tab {
    background: white;
    border: 2px solid #e9ecef;
    color: #6c757d;
    padding: 12px 24px;
    border-radius: 25px;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 500;
}

.category-tab:hover,
.category-tab.active {
    background: #c8a97e;
    border-color: #c8a97e;
    color: white;
    transform: translateY(-2px);
}

.empty-menu {
    grid-column: 1 / -1;
    text-align: center;
    padding: 60px 20px;
    color: #6c757d;
}

.empty-menu i {
    font-size: 4rem;
    margin-bottom: 20px;
    opacity: 0.5;
}

.empty-menu h3 {
    font-size: 1.5rem;
    margin-bottom: 10px;
    color: #2c3e50;
}

.product-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1000;
    opacity: 0;
    transition: opacity 0.3s ease;
}

.product-modal.show {
    opacity: 1;
}

.modal-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(5px);
}

.modal-content {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: white;
    border-radius: 20px;
    max-width: 800px;
    width: 90%;
    max-height: 90vh;
    overflow-y: auto;
}

.modal-close {
    position: absolute;
    top: 20px;
    right: 20px;
    background: rgba(0, 0, 0, 0.1);
    border: none;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    cursor: pointer;
    z-index: 10;
    transition: background 0.3s ease;
}

.modal-close:hover {
    background: rgba(0, 0, 0, 0.2);
}

.product-detail {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 40px;
    padding: 40px;
}

.product-image-large img {
    width: 100%;
    height: 300px;
    object-fit: cover;
    border-radius: 12px;
}

.product-info-detail h2 {
    font-size: 2rem;
    color: #2c3e50;
    margin-bottom: 12px;
}

.product-price-large {
    font-size: 1.8rem;
    font-weight: 700;
    color: #c8a97e;
    margin-bottom: 20px;
}

.product-description-full {
    color: #6c757d;
    line-height: 1.6;
    margin-bottom: 24px;
}

.ingredients {
    margin-bottom: 24px;
}

.ingredients h4 {
    color: #2c3e50;
    margin-bottom: 8px;
}

.product-details-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-bottom: 24px;
}

.detail-item {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #6c757d;
    font-size: 0.9rem;
}

.quantity-selector {
    margin-bottom: 24px;
}

.quantity-selector label {
    display: block;
    margin-bottom: 8px;
    font-weight: 600;
    color: #2c3e50;
}

.quantity-controls {
    display: flex;
    align-items: center;
    gap: 12px;
}

.quantity-controls button {
    width: 40px;
    height: 40px;
    border: 2px solid #e9ecef;
    background: white;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    transition: all 0.3s ease;
}

.quantity-controls button:hover {
    border-color: #c8a97e;
    color: #c8a97e;
}

.quantity-controls input {
    width: 80px;
    height: 40px;
    text-align: center;
    border: 2px solid #e9ecef;
    border-radius: 8px;
    font-weight: 600;
}

.add-to-cart-large {
    width: 100%;
    background: linear-gradient(135deg, #c8a97e, #b89669);
    color: white;
    border: none;
    padding: 16px 24px;
    border-radius: 12px;
    font-size: 1.1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
}

.add-to-cart-large:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(200, 169, 126, 0.3);
}

@media (max-width: 768px) {
    .product-detail {
        grid-template-columns: 1fr;
        gap: 24px;
        padding: 24px;
    }
    
    .product-details-grid {
        grid-template-columns: 1fr;
    }
    
    .category-tabs {
        gap: 8px;
    }
    
    .category-tab {
        padding: 10px 16px;
        font-size: 0.9rem;
    }
}
`;

// Add enhanced styles
const styleSheet = document.createElement('style');
styleSheet.textContent = enhancedMenuStyles;
document.head.appendChild(styleSheet);