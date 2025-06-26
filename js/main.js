// Main JavaScript for AS CAFE Website
class ASCafeApp {
    constructor() {
        this.cart = JSON.parse(localStorage.getItem('cart')) || [];
        this.user = JSON.parse(localStorage.getItem('user')) || null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateCartCount();
        this.setupMobileMenu();
        this.setupUserDropdown();
        this.loadUserData();
    }

    setupEventListeners() {
        // Cart events
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('add-to-cart')) {
                this.handleAddToCart(e);
            }
        });

        // Form submissions
        const reservationForm = document.getElementById('reservationForm');
        if (reservationForm) {
            reservationForm.addEventListener('submit', (e) => this.handleReservation(e));
        }

        const newsletterForms = document.querySelectorAll('.newsletter-form');
        newsletterForms.forEach(form => {
            form.addEventListener('submit', (e) => this.handleNewsletter(e));
        });
    }

    setupMobileMenu() {
        const hamburger = document.querySelector('.hamburger');
        const menu = document.querySelector('.menu');

        if (hamburger && menu) {
            hamburger.addEventListener('click', () => {
                menu.classList.toggle('active');
                hamburger.classList.toggle('active');
            });
        }
    }

    setupUserDropdown() {
        const userIcon = document.querySelector('.user-icon');
        if (userIcon && this.user) {
            this.createUserDropdown(userIcon);
        }
    }

    createUserDropdown(userIcon) {
        const dropdown = document.createElement('div');
        dropdown.className = 'user-dropdown';
        dropdown.innerHTML = `
            <div class="user-avatar">
                <i class="fas fa-user"></i>
            </div>
            <div class="user-dropdown-content">
                <div class="user-info-header">
                    <div class="user-avatar-large">
                        <i class="fas fa-user"></i>
                    </div>
                    <div class="user-details">
                        <h4>${this.user.name}</h4>
                        <p>${this.user.email}</p>
                    </div>
                </div>
                <div class="dropdown-divider"></div>
                <div class="dropdown-menu-items">
                    <a href="pesanan-saya.html" class="dropdown-item">
                        <i class="fas fa-shopping-bag"></i>
                        <span>Pesanan Saya</span>
                    </a>
                    <a href="history-transaksi.html" class="dropdown-item">
                        <i class="fas fa-history"></i>
                        <span>Riwayat Transaksi</span>
                    </a>
                    <a href="pesanan-saya.html#profile" class="dropdown-item">
                        <i class="fas fa-user-edit"></i>
                        <span>Edit Profil</span>
                    </a>
                    <div class="dropdown-divider"></div>
                    <button class="dropdown-item" onclick="app.logout()">
                        <i class="fas fa-sign-out-alt"></i>
                        <span>Logout</span>
                    </button>
                </div>
            </div>
        `;

        userIcon.parentNode.replaceChild(dropdown, userIcon);
    }

    loadUserData() {
        if (this.user) {
            // Update user name displays
            const userNameElements = document.querySelectorAll('#userName');
            userNameElements.forEach(el => el.textContent = this.user.name);

            const userEmailElements = document.querySelectorAll('#userEmail');
            userEmailElements.forEach(el => el.textContent = this.user.email);
        }
    }

    handleAddToCart(e) {
        e.preventDefault();
        
        const productCard = e.target.closest('.product-card, .menu-item');
        if (!productCard) return;

        const product = this.extractProductData(productCard);
        this.addToCart(product);
        
        // Show success message
        this.showNotification('Produk berhasil ditambahkan ke keranjang!', 'success');
        
        // Trigger cart update event for admin
        window.dispatchEvent(new CustomEvent('cartUpdated', {
            detail: {
                itemName: product.name,
                itemPrice: product.price,
                cartTotal: this.getCartTotal()
            }
        }));
    }

    extractProductData(productCard) {
        const name = productCard.querySelector('h3')?.textContent || 'Unknown Product';
        const priceText = productCard.querySelector('.product-price, .menu-price')?.textContent || 'Rp 0';
        const price = parseInt(priceText.replace(/[^\d]/g, '')) || 0;
        const image = productCard.querySelector('img')?.src || '/placeholder.svg';
        const description = productCard.querySelector('p')?.textContent || '';

        return {
            id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name,
            price,
            image,
            description,
            quantity: 1
        };
    }

    addToCart(product) {
        const existingItem = this.cart.find(item => item.name === product.name);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.cart.push(product);
        }
        
        this.saveCart();
        this.updateCartCount();
    }

    removeFromCart(productId) {
        this.cart = this.cart.filter(item => item.id !== productId);
        this.saveCart();
        this.updateCartCount();
    }

    updateCartQuantity(productId, quantity) {
        const item = this.cart.find(item => item.id === productId);
        if (item) {
            if (quantity <= 0) {
                this.removeFromCart(productId);
            } else {
                item.quantity = quantity;
                this.saveCart();
                this.updateCartCount();
            }
        }
    }

    getCartTotal() {
        return this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    getCartItemCount() {
        return this.cart.reduce((total, item) => total + item.quantity, 0);
    }

    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.cart));
    }

    updateCartCount() {
        const cartCountElements = document.querySelectorAll('.cart-count');
        const count = this.getCartItemCount();
        
        cartCountElements.forEach(element => {
            element.textContent = count;
            element.style.display = count > 0 ? 'flex' : 'none';
        });
    }

    handleReservation(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const reservationData = {
            id: `res_${Date.now()}`,
            name: formData.get('name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            date: formData.get('date'),
            time: formData.get('time'),
            guests: formData.get('guests'),
            area: formData.get('area'),
            notes: formData.get('notes'),
            status: 'pending',
            createdAt: new Date().toISOString()
        };

        // Save reservation
        const reservations = JSON.parse(localStorage.getItem('reservations')) || [];
        reservations.push(reservationData);
        localStorage.setItem('reservations', JSON.stringify(reservations));

        // Add to admin data
        if (window.adminDataManager) {
            const adminData = window.adminDataManager.getData();
            adminData.reservations = adminData.reservations || [];
            adminData.reservations.push(reservationData);
            window.adminDataManager.saveData(adminData);

            // Add notification
            window.adminDataManager.addNotification({
                type: 'info',
                title: 'Reservasi Baru',
                message: `Reservasi baru dari ${reservationData.name}`,
                timestamp: new Date().toISOString()
            });
        }

        this.showNotification('Reservasi berhasil dibuat! Kami akan menghubungi Anda segera.', 'success');
        e.target.reset();
    }

    handleNewsletter(e) {
        e.preventDefault();
        
        const email = e.target.querySelector('input[type="email"]').value;
        
        // Save newsletter subscription
        const subscribers = JSON.parse(localStorage.getItem('newsletter_subscribers')) || [];
        if (!subscribers.includes(email)) {
            subscribers.push(email);
            localStorage.setItem('newsletter_subscribers', JSON.stringify(subscribers));
            this.showNotification('Terima kasih! Anda telah berlangganan newsletter kami.', 'success');
        } else {
            this.showNotification('Email Anda sudah terdaftar dalam newsletter kami.', 'info');
        }
        
        e.target.reset();
    }

    showNotification(message, type = 'info') {
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

    login(userData) {
        this.user = userData;
        localStorage.setItem('user', JSON.stringify(userData));
        this.loadUserData();
        this.setupUserDropdown();
    }

    logout() {
        this.user = null;
        localStorage.removeItem('user');
        window.location.href = 'index.html';
    }

    // Checkout process
    checkout() {
        if (this.cart.length === 0) {
            this.showNotification('Keranjang Anda kosong!', 'error');
            return;
        }

        // Redirect to payment page
        window.location.href = 'pembayaran.html';
    }

    // Create order from cart
    createOrder(customerData, paymentMethod = 'cash') {
        if (this.cart.length === 0) {
            throw new Error('Keranjang kosong');
        }

        const order = {
            id: this.generateOrderId(),
            customerName: customerData.name,
            customerEmail: customerData.email,
            customerPhone: customerData.phone,
            items: [...this.cart],
            subtotal: this.getCartTotal(),
            tax: Math.round(this.getCartTotal() * 0.1),
            serviceFee: 5000,
            total: this.getCartTotal() + Math.round(this.getCartTotal() * 0.1) + 5000,
            paymentMethod: paymentMethod,
            status: 'pending',
            createdAt: new Date().toISOString(),
            deliveryAddress: customerData.address || null,
            deliveryType: customerData.deliveryType || 'pickup'
        };

        // Save order
        const orders = JSON.parse(localStorage.getItem('orders')) || [];
        orders.push(order);
        localStorage.setItem('orders', JSON.stringify(orders));

        // Clear cart
        this.cart = [];
        this.saveCart();
        this.updateCartCount();

        // Trigger order creation event for admin
        window.dispatchEvent(new CustomEvent('orderCreated', {
            detail: order
        }));

        return order;
    }

    generateOrderId() {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 1000);
        return `AS${timestamp}${random}`;
    }
}

// Initialize app
const app = new ASCafeApp();

// Make app globally available
window.app = app;

// Notification styles
const notificationStyles = `
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

// Add notification styles to head
const styleSheet = document.createElement('style');
styleSheet.textContent = notificationStyles;
document.head.appendChild(styleSheet);