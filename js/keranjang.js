// Shopping Cart JavaScript
class ShoppingCart {
    constructor() {
        this.cart = JSON.parse(localStorage.getItem('cart')) || [];
        this.init();
    }

    init() {
        this.renderCart();
        this.setupEventListeners();
        this.updateSummary();
        this.loadCheckoutData();
    }

    loadCheckoutData() {
        // Load checkout data if available
        const checkoutData = JSON.parse(localStorage.getItem('checkoutData'));
        if (checkoutData && checkoutData.items) {
            this.cart = checkoutData.items;
            this.saveCart();
            this.renderCart();
            this.updateSummary();
        }
    }

    setupEventListeners() {
        // Quantity controls
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('qty-btn')) {
                this.handleQuantityChange(e);
            }
            
            if (e.target.classList.contains('remove-btn')) {
                this.handleRemoveItem(e);
            }
        });

        // Quantity input changes
        document.addEventListener('change', (e) => {
            if (e.target.classList.contains('qty-input')) {
                this.handleQuantityInput(e);
            }
        });

        // Delivery option changes
        document.addEventListener('change', (e) => {
            if (e.target.name === 'delivery') {
                this.handleDeliveryChange(e);
            }
        });

        // Promo code
        const applyPromoBtn = document.getElementById('applyPromo');
        if (applyPromoBtn) {
            applyPromoBtn.addEventListener('click', () => this.applyPromoCode());
        }

        // Checkout button
        const checkoutBtn = document.querySelector('.checkout-btn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => this.proceedToCheckout());
        }
    }

    renderCart() {
        const cartItemsContainer = document.querySelector('.cart-items');
        const emptyCart = document.querySelector('.empty-cart');
        
        if (this.cart.length === 0) {
            if (cartItemsContainer) cartItemsContainer.style.display = 'none';
            if (emptyCart) emptyCart.style.display = 'block';
            return;
        }

        if (cartItemsContainer) cartItemsContainer.style.display = 'block';
        if (emptyCart) emptyCart.style.display = 'none';

        if (!cartItemsContainer) return;

        cartItemsContainer.innerHTML = this.cart.map(item => `
            <div class="cart-item" data-id="${item.id}">
                <div class="item-image">
                    <img src="${item.image}" alt="${item.name}">
                </div>
                <div class="item-details">
                    <h3>${item.name}</h3>
                    <p>${item.description}</p>
                    ${this.renderItemOptions(item)}
                </div>
                <div class="item-quantity">
                    <button class="qty-btn minus" data-action="decrease" data-id="${item.id}">-</button>
                    <input type="number" value="${item.quantity}" min="1" class="qty-input" data-id="${item.id}">
                    <button class="qty-btn plus" data-action="increase" data-id="${item.id}">+</button>
                </div>
                <div class="item-price">
                    <span class="price">${this.formatCurrency(item.price * item.quantity)}</span>
                </div>
                <div class="item-remove">
                    <button class="remove-btn" data-id="${item.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    renderItemOptions(item) {
        if (!item.options) return '';

        return `
            <div class="item-options">
                ${item.options.map(option => `
                    <label>
                        <input type="${option.type}" name="${option.name}" value="${option.value}" ${option.checked ? 'checked' : ''}>
                        ${option.label}
                    </label>
                `).join('')}
            </div>
        `;
    }

    handleQuantityChange(e) {
        const action = e.target.dataset.action;
        const itemId = e.target.dataset.id;
        const item = this.cart.find(item => item.id === itemId);
        
        if (!item) return;

        if (action === 'increase') {
            item.quantity += 1;
        } else if (action === 'decrease' && item.quantity > 1) {
            item.quantity -= 1;
        }

        this.saveCart();
        this.renderCart();
        this.updateSummary();
        this.updateCartCount();
        this.notifyAdmin('cartUpdate', { action, item });
    }

    handleQuantityInput(e) {
        const itemId = e.target.dataset.id;
        const newQuantity = parseInt(e.target.value);
        const item = this.cart.find(item => item.id === itemId);
        
        if (!item || newQuantity < 1) return;

        item.quantity = newQuantity;
        this.saveCart();
        this.updateSummary();
        this.updateCartCount();
        this.notifyAdmin('cartUpdate', { action: 'quantityChange', item });
    }

    handleRemoveItem(e) {
        const itemId = e.target.dataset.id;
        const item = this.cart.find(item => item.id === itemId);
        
        this.cart = this.cart.filter(item => item.id !== itemId);
        
        this.saveCart();
        this.renderCart();
        this.updateSummary();
        this.updateCartCount();
        
        this.showNotification('Item berhasil dihapus dari keranjang', 'info');
        this.notifyAdmin('cartUpdate', { action: 'remove', item });
    }

    handleDeliveryChange(e) {
        const deliveryType = e.target.value;
        const deliverySection = document.getElementById('deliverySection');
        const pickupSection = document.getElementById('pickupSection');
        const deliveryFeeRow = document.getElementById('deliveryFeeRow');
        
        if (deliveryType === 'delivery') {
            if (deliverySection) deliverySection.style.display = 'block';
            if (pickupSection) pickupSection.style.display = 'none';
            if (deliveryFeeRow) deliveryFeeRow.style.display = 'flex';
        } else {
            if (deliverySection) deliverySection.style.display = 'none';
            if (pickupSection) pickupSection.style.display = 'block';
            if (deliveryFeeRow) deliveryFeeRow.style.display = 'none';
        }
        
        this.updateSummary();
    }

    applyPromoCode() {
        const promoInput = document.getElementById('promoInput');
        const promoCode = promoInput.value.trim().toUpperCase();
        
        if (!promoCode) {
            this.showNotification('Masukkan kode promo terlebih dahulu', 'error');
            return;
        }

        // Check valid promo codes
        const validPromos = {
            'WELCOME10': { discount: 0.1, description: 'Diskon 10% untuk pelanggan baru' },
            'SAVE20': { discount: 0.2, description: 'Diskon 20% untuk pembelian minimal Rp 100.000' },
            'COFFEE15': { discount: 0.15, description: 'Diskon 15% untuk menu kopi' }
        };

        const promo = validPromos[promoCode];
        if (!promo) {
            this.showNotification('Kode promo tidak valid', 'error');
            return;
        }

        // Apply promo
        this.appliedPromo = promo;
        this.appliedPromoCode = promoCode;
        this.updateSummary();
        this.showNotification(`Kode promo ${promoCode} berhasil diterapkan!`, 'success');
        
        promoInput.value = '';
        this.notifyAdmin('promoApplied', { code: promoCode, promo });
    }

    updateSummary() {
        const subtotal = this.getSubtotal();
        const serviceFee = 5000;
        const deliveryFee = this.getDeliveryFee();
        const tax = Math.round(subtotal * 0.11);
        const promoDiscount = this.getPromoDiscount(subtotal);
        const total = subtotal + serviceFee + deliveryFee + tax - promoDiscount;

        // Update summary elements
        const subtotalEl = document.getElementById('subtotalAmount');
        if (subtotalEl) subtotalEl.textContent = this.formatCurrency(subtotal);

        const taxEl = document.getElementById('taxAmount');
        if (taxEl) taxEl.textContent = this.formatCurrency(tax);

        const totalEl = document.getElementById('totalAmount');
        if (totalEl) totalEl.textContent = this.formatCurrency(total);

        // Update cart summary in sidebar
        this.updateCartSummary(subtotal, serviceFee, deliveryFee, tax, promoDiscount, total);
    }

    updateCartSummary(subtotal, serviceFee, deliveryFee, tax, promoDiscount, total) {
        const summaryRows = document.querySelectorAll('.summary-row');
        
        summaryRows.forEach(row => {
            const label = row.querySelector('span:first-child')?.textContent;
            const valueEl = row.querySelector('span:last-child');
            
            if (!valueEl) return;
            
            if (label?.includes('Subtotal')) {
                valueEl.textContent = this.formatCurrency(subtotal);
            } else if (label?.includes('PPN')) {
                valueEl.textContent = this.formatCurrency(tax);
            } else if (label?.includes('Total')) {
                valueEl.textContent = this.formatCurrency(total);
            }
        });

        // Add promo discount row if applied
        if (promoDiscount > 0) {
            this.addPromoDiscountRow(promoDiscount);
        }
    }

    addPromoDiscountRow(discount) {
        const summaryCard = document.querySelector('.summary-card');
        if (!summaryCard) return;

        // Remove existing promo row
        const existingPromoRow = summaryCard.querySelector('.promo-discount-row');
        if (existingPromoRow) existingPromoRow.remove();

        // Add new promo row
        const promoRow = document.createElement('div');
        promoRow.className = 'summary-row promo-discount-row';
        promoRow.innerHTML = `
            <span>Diskon Promo (${this.appliedPromoCode})</span>
            <span style="color: #27ae60;">-${this.formatCurrency(discount)}</span>
        `;

        const totalRow = summaryCard.querySelector('.summary-row.total');
        if (totalRow) {
            totalRow.parentNode.insertBefore(promoRow, totalRow);
        }
    }

    getSubtotal() {
        return this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    getDeliveryFee() {
        const deliveryOption = document.querySelector('input[name="delivery"]:checked');
        return deliveryOption?.value === 'delivery' ? 15000 : 0;
    }

    getPromoDiscount(subtotal) {
        if (!this.appliedPromo) return 0;
        return Math.round(subtotal * this.appliedPromo.discount);
    }

    proceedToCheckout() {
        if (this.cart.length === 0) {
            this.showNotification('Keranjang Anda kosong!', 'error');
            return;
        }

        // Save cart data for checkout
        const checkoutData = {
            items: this.cart,
            subtotal: this.getSubtotal(),
            serviceFee: 5000,
            deliveryFee: this.getDeliveryFee(),
            tax: Math.round(this.getSubtotal() * 0.11),
            promoDiscount: this.getPromoDiscount(this.getSubtotal()),
            appliedPromo: this.appliedPromo,
            appliedPromoCode: this.appliedPromoCode,
            deliveryType: document.querySelector('input[name="delivery"]:checked')?.value || 'pickup'
        };

        localStorage.setItem('checkoutData', JSON.stringify(checkoutData));
        
        // Notify admin about checkout
        this.notifyAdmin('checkout', checkoutData);
        
        // Redirect to checkout
        window.location.href = 'pembayaran.html';
    }

    notifyAdmin(action, data) {
        // Send notification to admin system
        if (window.adminDataManager) {
            let message = '';
            let type = 'info';
            
            switch (action) {
                case 'cartUpdate':
                    message = `Keranjang diperbarui: ${data.item.name}`;
                    break;
                case 'promoApplied':
                    message = `Kode promo ${data.code} diterapkan`;
                    type = 'success';
                    break;
                case 'checkout':
                    message = `Pelanggan melanjutkan ke checkout dengan ${data.items.length} item`;
                    type = 'warning';
                    break;
            }
            
            window.adminDataManager.addNotification({
                type: type,
                title: 'Aktivitas Keranjang',
                message: message,
                timestamp: new Date().toISOString(),
                data: data
            });
        }

        // Trigger cart update event
        window.dispatchEvent(new CustomEvent('cartUpdated', {
            detail: {
                action: action,
                data: data,
                cartTotal: this.getSubtotal(),
                itemCount: this.cart.length
            }
        }));
    }

    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.cart));
    }

    updateCartCount() {
        const cartCount = this.cart.reduce((total, item) => total + item.quantity, 0);
        const cartCountElements = document.querySelectorAll('.cart-count');
        
        cartCountElements.forEach(element => {
            element.textContent = cartCount;
            element.style.display = cartCount > 0 ? 'flex' : 'none';
        });
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount);
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
}

// Initialize shopping cart
const shoppingCart = new ShoppingCart();

// Enhanced cart styles
const cartStyles = `
.cart-item {
    transition: all 0.3s ease;
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 20px;
    background: #fff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    border-left: 4px solid transparent;
}

.cart-item:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    border-left-color: #c8a97e;
    transform: translateX(5px);
}

.item-options {
    margin-top: 12px;
}

.item-options label {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
    font-size: 0.9rem;
    color: #6c757d;
    cursor: pointer;
    transition: color 0.3s ease;
}

.item-options label:hover {
    color: #c8a97e;
}

.qty-btn {
    transition: all 0.2s ease;
    border-radius: 6px;
}

.qty-btn:hover {
    background-color: #c8a97e !important;
    color: #fff !important;
    transform: scale(1.1);
    box-shadow: 0 2px 8px rgba(200, 169, 126, 0.3);
}

.remove-btn {
    transition: all 0.2s ease;
    border-radius: 6px;
}

.remove-btn:hover {
    background-color: #dc3545 !important;
    transform: scale(1.1);
    box-shadow: 0 2px 8px rgba(220, 53, 69, 0.3);
}

.promo-discount-row {
    background-color: #e8f5e8;
    padding: 8px 12px;
    border-radius: 6px;
    margin: 8px 0;
    border-left: 3px solid #27ae60;
}

.checkout-btn {
    position: relative;
    overflow: hidden;
    background: linear-gradient(135deg, #c8a97e 0%, #b89669 100%);
    transition: all 0.3s ease;
}

.checkout-btn::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
    transition: left 0.5s;
}

.checkout-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(200, 169, 126, 0.4);
}

.checkout-btn:hover::before {
    left: 100%;
}

.summary-card {
    background: linear-gradient(135deg, #fff 0%, #f8f9fa 100%);
    border: 1px solid #e9ecef;
}

.summary-row {
    padding: 8px 0;
    border-bottom: 1px solid #f1f3f4;
}

.summary-row:last-child {
    border-bottom: none;
}

.summary-row.total {
    background: linear-gradient(135deg, #c8a97e 0%, #b89669 100%);
    color: white;
    padding: 15px;
    margin: 15px -30px -30px -30px;
    border-radius: 0 0 10px 10px;
}

@media (max-width: 768px) {
    .cart-item {
        padding: 16px;
    }
    
    .cart-item:hover {
        transform: none;
    }
}
`;

// Add cart styles
const cartStyleSheet = document.createElement('style');
cartStyleSheet.textContent = cartStyles;
document.head.appendChild(cartStyleSheet);