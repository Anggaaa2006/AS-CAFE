// Enhanced Admin Data Management System with Real-time Web Integration
class AdminDataManager {
    constructor() {
        this.initializeData();
        this.setupEventListeners();
        this.setupRealTimeSync();
    }

    initializeData() {
        // Initialize default data if not exists
        if (!localStorage.getItem('adminData')) {
            const defaultData = {
                orders: [],
                products: this.getDefaultProducts(),
                users: this.getDefaultUsers(),
                reservations: [],
                articles: this.getDefaultArticles(),
                categories: this.getDefaultCategories(),
                settings: this.getDefaultSettings(),
                transactions: [],
                notifications: []
            };
            localStorage.setItem('adminData', JSON.stringify(defaultData));
        }
        
        // Sync with web data
        this.syncWithWebData();
    }

    syncWithWebData() {
        // Sync cart data from web
        const webCart = JSON.parse(localStorage.getItem('cart') || '[]');
        if (webCart.length > 0) {
            this.addNotification({
                type: 'info',
                title: 'Aktivitas Keranjang',
                message: `Ada ${webCart.length} item di keranjang pelanggan`,
                timestamp: new Date().toISOString()
            });
        }

        // Sync reservations from web
        const webReservations = JSON.parse(localStorage.getItem('reservations') || '[]');
        const adminData = this.getData();
        
        // Merge web reservations with admin data
        webReservations.forEach(reservation => {
            const exists = adminData.reservations.find(r => r.id === reservation.id);
            if (!exists) {
                adminData.reservations.push(reservation);
            }
        });
        
        this.saveData(adminData);
    }

    setupRealTimeSync() {
        // Listen for storage changes from web
        window.addEventListener('storage', (e) => {
            if (e.key === 'cart') {
                this.handleCartChange(e.newValue);
            } else if (e.key === 'reservations') {
                this.handleReservationChange(e.newValue);
            } else if (e.key === 'orders') {
                this.handleOrderChange(e.newValue);
            }
        });

        // Periodic sync every 5 seconds
        setInterval(() => {
            this.syncWithWebData();
        }, 5000);
    }

    handleCartChange(newCartData) {
        if (newCartData) {
            const cart = JSON.parse(newCartData);
            this.addNotification({
                type: 'info',
                title: 'Keranjang Diperbarui',
                message: `Keranjang sekarang memiliki ${cart.length} item`,
                timestamp: new Date().toISOString()
            });
        }
    }

    handleReservationChange(newReservationData) {
        if (newReservationData) {
            const reservations = JSON.parse(newReservationData);
            const adminData = this.getData();
            
            // Find new reservations
            reservations.forEach(reservation => {
                const exists = adminData.reservations.find(r => r.id === reservation.id);
                if (!exists) {
                    adminData.reservations.push(reservation);
                    this.addNotification({
                        type: 'success',
                        title: 'Reservasi Baru',
                        message: `Reservasi baru dari ${reservation.name}`,
                        timestamp: new Date().toISOString()
                    });
                }
            });
            
            this.saveData(adminData);
        }
    }

    handleOrderChange(newOrderData) {
        if (newOrderData) {
            const orders = JSON.parse(newOrderData);
            const adminData = this.getData();
            
            // Find new orders
            orders.forEach(order => {
                const exists = adminData.orders.find(o => o.id === order.id);
                if (!exists) {
                    adminData.orders.push(order);
                    this.addNotification({
                        type: 'success',
                        title: 'Pesanan Baru',
                        message: `Pesanan baru dari ${order.customerName}`,
                        timestamp: new Date().toISOString()
                    });
                }
            });
            
            this.saveData(adminData);
        }
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
                status: 'available',
                ingredients: 'Biji kopi arabica premium',
                calories: 5,
                preparationTime: 3,
                tags: ['hot', 'strong', 'classic'],
                isSpicy: false,
                isVegetarian: true,
                isRecommended: true,
                createdAt: new Date().toISOString()
            },
            {
                id: 'prod_002',
                name: 'Cappuccino',
                category: 'coffee',
                price: 35000,
                description: 'Espresso dengan steamed milk dan foam yang lembut, perpaduan sempurna',
                image: '/placeholder.svg?height=200&width=300',
                status: 'available',
                ingredients: 'Espresso, susu segar, foam',
                calories: 120,
                preparationTime: 5,
                tags: ['hot', 'creamy', 'popular'],
                isSpicy: false,
                isVegetarian: true,
                isRecommended: true,
                createdAt: new Date().toISOString()
            },
            {
                id: 'prod_003',
                name: 'Latte',
                category: 'coffee',
                price: 35000,
                description: 'Espresso dengan susu steamed dan sedikit foam, creamy dan smooth',
                image: '/placeholder.svg?height=200&width=300',
                status: 'available',
                ingredients: 'Espresso, susu steamed',
                calories: 150,
                preparationTime: 5,
                tags: ['hot', 'mild', 'creamy'],
                isSpicy: false,
                isVegetarian: true,
                isRecommended: false,
                createdAt: new Date().toISOString()
            },
            {
                id: 'prod_004',
                name: 'Americano',
                category: 'coffee',
                price: 30000,
                description: 'Espresso dengan tambahan air panas, untuk pecinta kopi hitam',
                image: '/placeholder.svg?height=200&width=300',
                status: 'available',
                ingredients: 'Espresso, air panas',
                calories: 10,
                preparationTime: 3,
                tags: ['hot', 'black', 'simple'],
                isSpicy: false,
                isVegetarian: true,
                isRecommended: false,
                createdAt: new Date().toISOString()
            },
            {
                id: 'prod_005',
                name: 'Cold Brew',
                category: 'coffee',
                price: 30000,
                description: 'Kopi yang diseduh dengan air dingin selama 12 jam',
                image: '/placeholder.svg?height=200&width=300',
                status: 'available',
                ingredients: 'Biji kopi cold brew, air dingin',
                calories: 5,
                preparationTime: 2,
                tags: ['cold', 'smooth', 'refreshing'],
                isSpicy: false,
                isVegetarian: true,
                isRecommended: true,
                createdAt: new Date().toISOString()
            },
            {
                id: 'prod_006',
                name: 'Pasta Carbonara',
                category: 'food',
                price: 65000,
                description: 'Pasta dengan saus krim, telur, dan bacon crispy yang menggugah selera',
                image: '/placeholder.svg?height=200&width=300',
                status: 'available',
                ingredients: 'Pasta, bacon, telur, krim, keju parmesan',
                calories: 580,
                preparationTime: 15,
                tags: ['hot', 'creamy', 'italian'],
                isSpicy: false,
                isVegetarian: false,
                isRecommended: true,
                createdAt: new Date().toISOString()
            },
            {
                id: 'prod_007',
                name: 'Chicken Sandwich',
                category: 'food',
                price: 55000,
                description: 'Sandwich dengan ayam panggang dan sayuran segar, sehat dan lezat',
                image: '/placeholder.svg?height=200&width=300',
                status: 'available',
                ingredients: 'Roti, ayam panggang, selada, tomat, mayo',
                calories: 450,
                preparationTime: 10,
                tags: ['hot', 'protein', 'healthy'],
                isSpicy: false,
                isVegetarian: false,
                isRecommended: false,
                createdAt: new Date().toISOString()
            },
            {
                id: 'prod_008',
                name: 'Tiramisu',
                category: 'dessert',
                price: 45000,
                description: 'Dessert Italia dengan lapisan kopi dan mascarpone yang lembut',
                image: '/placeholder.svg?height=200&width=300',
                status: 'available',
                ingredients: 'Ladyfinger, mascarpone, kopi, cokelat',
                calories: 320,
                preparationTime: 5,
                tags: ['sweet', 'coffee', 'italian'],
                isSpicy: false,
                isVegetarian: true,
                isRecommended: true,
                createdAt: new Date().toISOString()
            }
        ];
    }

    getDefaultCategories() {
        return [
            {
                id: 'cat_001',
                name: 'Coffee',
                description: 'Berbagai jenis kopi premium',
                icon: 'fas fa-coffee',
                color: '#8B4513',
                order: 1,
                isActive: true
            },
            {
                id: 'cat_002',
                name: 'Food',
                description: 'Makanan utama dan ringan',
                icon: 'fas fa-utensils',
                color: '#FF6B35',
                order: 2,
                isActive: true
            },
            {
                id: 'cat_003',
                name: 'Dessert',
                description: 'Makanan penutup dan kue',
                icon: 'fas fa-birthday-cake',
                color: '#FF69B4',
                order: 3,
                isActive: true
            },
            {
                id: 'cat_004',
                name: 'Drinks',
                description: 'Minuman non-kopi',
                icon: 'fas fa-glass-water',
                color: '#4169E1',
                order: 4,
                isActive: true
            }
        ];
    }

    getDefaultUsers() {
        return [
            {
                id: 'user_001',
                name: 'Admin AS CAFE',
                email: 'admin@ascafe.com',
                phone: '+62812345678',
                role: 'admin',
                status: 'active',
                joinedAt: new Date().toISOString()
            }
        ];
    }

    getDefaultArticles() {
        return [
            {
                id: 'art_001',
                title: 'Rahasia Kopi yang Sempurna',
                category: 'tips',
                excerpt: 'Panduan lengkap untuk membuat kopi yang sempurna di rumah',
                content: 'Konten artikel lengkap...',
                image: '/placeholder.svg?height=400&width=800',
                status: 'published',
                author: 'Admin AS CAFE',
                createdAt: new Date().toISOString()
            }
        ];
    }

    getDefaultSettings() {
        return {
            cafeName: 'AS CAFE',
            address: 'Jl. Tunjungan No. 26, Surabaya',
            phone: '+6231 206 0803 0405',
            email: 'info@ascafe.com',
            openTime: '08:00',
            closeTime: '22:00',
            currency: 'IDR',
            timezone: 'Asia/Jakarta',
            language: 'id',
            notifications: {
                email: true,
                orders: true,
                reservations: true
            }
        };
    }

    setupEventListeners() {
        // Listen for cart updates
        window.addEventListener('cartUpdated', (event) => {
            this.handleCartUpdate(event.detail);
        });

        // Listen for order creation
        window.addEventListener('orderCreated', (event) => {
            this.handleOrderCreation(event.detail);
        });
    }

    handleCartUpdate(cartData) {
        // Update admin dashboard with cart activity
        this.addNotification({
            type: 'info',
            title: 'Aktivitas Keranjang',
            message: `Item ditambahkan ke keranjang: ${cartData.itemName || 'Item'}`,
            timestamp: new Date().toISOString()
        });
    }

    handleOrderCreation(orderData) {
        // Add order to admin system
        const adminData = this.getData();
        const newOrder = {
            id: this.generateOrderId(),
            ...orderData,
            status: 'pending',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        adminData.orders.unshift(newOrder);
        this.saveData(adminData);

        // Add notification
        this.addNotification({
            type: 'success',
            title: 'Pesanan Baru',
            message: `Pesanan baru dari ${orderData.customerName}`,
            timestamp: new Date().toISOString(),
            orderId: newOrder.id
        });

        // Trigger dashboard update
        window.dispatchEvent(new CustomEvent('dashboardUpdate', {
            detail: { type: 'newOrder', order: newOrder }
        }));
    }

    generateOrderId() {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 1000);
        return `AS${timestamp}${random}`;
    }

    addNotification(notification) {
        const adminData = this.getData();
        notification.id = `notif_${Date.now()}`;
        notification.read = false;
        adminData.notifications.unshift(notification);
        
        // Keep only last 50 notifications
        if (adminData.notifications.length > 50) {
            adminData.notifications = adminData.notifications.slice(0, 50);
        }
        
        this.saveData(adminData);
        
        // Update notification badge
        this.updateNotificationBadge();
    }

    updateNotificationBadge() {
        const badge = document.getElementById('notificationBadge');
        if (badge) {
            const unreadCount = this.getUnreadNotificationCount();
            if (unreadCount > 0) {
                badge.textContent = unreadCount;
                badge.style.display = 'flex';
            } else {
                badge.style.display = 'none';
            }
        }
    }

    getUnreadNotificationCount() {
        const adminData = this.getData();
        return adminData.notifications.filter(n => !n.read).length;
    }

    getData() {
        return JSON.parse(localStorage.getItem('adminData') || '{}');
    }

    saveData(data) {
        localStorage.setItem('adminData', JSON.stringify(data));
        
        // Trigger sync event for web
        window.dispatchEvent(new CustomEvent('adminDataUpdated', {
            detail: data
        }));
    }

    // Public methods for accessing data
    getOrders() {
        return this.getData().orders || [];
    }

    getProducts() {
        return this.getData().products || [];
    }

    getCategories() {
        return this.getData().categories || [];
    }

    getUsers() {
        return this.getData().users || [];
    }

    getArticles() {
        return this.getData().articles || [];
    }

    getSettings() {
        return this.getData().settings || {};
    }

    getNotifications() {
        return this.getData().notifications || [];
    }

    // CRUD operations
    addProduct(product) {
        const adminData = this.getData();
        product.id = `prod_${Date.now()}`;
        product.createdAt = new Date().toISOString();
        adminData.products.push(product);
        this.saveData(adminData);
        
        // Sync to web menu
        this.syncProductsToWeb();
        
        return product;
    }

    updateProduct(id, updates) {
        const adminData = this.getData();
        const index = adminData.products.findIndex(p => p.id === id);
        if (index !== -1) {
            adminData.products[index] = { ...adminData.products[index], ...updates };
            this.saveData(adminData);
            
            // Sync to web menu
            this.syncProductsToWeb();
            
            return adminData.products[index];
        }
        return null;
    }

    deleteProduct(id) {
        const adminData = this.getData();
        adminData.products = adminData.products.filter(p => p.id !== id);
        this.saveData(adminData);
        
        // Sync to web menu
        this.syncProductsToWeb();
    }

    syncProductsToWeb() {
        // Update web menu with admin products
        const products = this.getProducts();
        localStorage.setItem('webMenuProducts', JSON.stringify(products));
        
        // Trigger web menu update
        window.dispatchEvent(new CustomEvent('menuProductsUpdated', {
            detail: products
        }));
    }

    updateOrderStatus(orderId, status) {
        const adminData = this.getData();
        const order = adminData.orders.find(o => o.id === orderId);
        if (order) {
            order.status = status;
            order.updatedAt = new Date().toISOString();
            this.saveData(adminData);
            
            // Sync to web orders
            const webOrders = JSON.parse(localStorage.getItem('orders') || '[]');
            const webOrderIndex = webOrders.findIndex(o => o.id === orderId);
            if (webOrderIndex !== -1) {
                webOrders[webOrderIndex].status = status;
                webOrders[webOrderIndex].updatedAt = new Date().toISOString();
                localStorage.setItem('orders', JSON.stringify(webOrders));
            }
            
            // Add notification
            this.addNotification({
                type: 'info',
                title: 'Status Pesanan Diperbarui',
                message: `Pesanan ${orderId} diubah ke ${status}`,
                timestamp: new Date().toISOString(),
                orderId: orderId
            });
        }
    }
}

// Initialize admin data manager
window.adminDataManager = new AdminDataManager();