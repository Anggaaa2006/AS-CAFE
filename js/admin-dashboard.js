// Admin Dashboard JavaScript
class AdminDashboard {
    constructor() {
        this.stats = {
            todayOrders: 0,
            todayReservations: 0,
            totalRevenue: 0,
            activeOrders: 0
        };
        this.init();
    }

    init() {
        this.loadDashboardData();
        this.setupEventListeners();
        this.updateStats();
        this.loadRecentOrders();
        this.setupNotifications();
        this.startRealTimeUpdates();
        this.setupCartMonitoring();
    }

    setupEventListeners() {
        // Listen for dashboard updates
        window.addEventListener('dashboardUpdate', (event) => {
            this.handleDashboardUpdate(event.detail);
        });

        // Listen for cart activities
        window.addEventListener('cartUpdated', (event) => {
            this.handleCartActivity(event.detail);
        });

        // Listen for menu activities
        window.addEventListener('menuActivity', (event) => {
            this.handleMenuActivity(event.detail);
        });

        // Refresh button
        const refreshBtn = document.getElementById('refreshDashboard');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.refreshDashboard());
        }
    }

    setupCartMonitoring() {
        // Monitor cart activities in real-time
        setInterval(() => {
            this.checkCartActivities();
        }, 5000); // Check every 5 seconds
    }

    checkCartActivities() {
        // Check for recent cart activities
        const recentActivities = this.getRecentCartActivities();
        if (recentActivities.length > 0) {
            this.updateCartActivityStats(recentActivities);
        }
    }

    getRecentCartActivities() {
        // Get cart activities from the last 5 minutes
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        const notifications = window.adminDataManager?.getNotifications() || [];
        
        return notifications.filter(notification => 
            notification.title === 'Aktivitas Keranjang' &&
            new Date(notification.timestamp) > fiveMinutesAgo
        );
    }

    updateCartActivityStats(activities) {
        // Update dashboard with cart activity insights
        const cartActivityCard = document.getElementById('cartActivityCard');
        if (cartActivityCard) {
            const count = activities.length;
            cartActivityCard.querySelector('.stat-number').textContent = count;
        }
    }

    handleCartActivity(data) {
        // Handle real-time cart activities
        console.log('Cart Activity:', data);
        
        // Update live cart statistics
        this.updateLiveCartStats(data);
        
        // Show real-time notification
        this.showLiveNotification(`Aktivitas Keranjang: ${data.action}`, 'info');
        
        // Update recent activities
        this.addToRecentActivities({
            type: 'cart',
            action: data.action,
            data: data,
            timestamp: new Date().toISOString()
        });
    }

    handleMenuActivity(data) {
        // Handle menu page activities
        console.log('Menu Activity:', data);
        
        if (data.action === 'productAddedToCart') {
            this.updateProductPopularity(data.data.product);
        }
        
        // Add to activity feed
        this.addToRecentActivities({
            type: 'menu',
            action: data.action,
            data: data.data,
            timestamp: new Date().toISOString()
        });
    }

    updateLiveCartStats(data) {
        // Update live statistics based on cart activity
        const liveStatsContainer = document.getElementById('liveCartStats');
        if (!liveStatsContainer) {
            this.createLiveStatsContainer();
        }
        
        // Update cart activity counter
        const activityCounter = document.getElementById('cartActivityCounter');
        if (activityCounter) {
            const currentCount = parseInt(activityCounter.textContent) || 0;
            activityCounter.textContent = currentCount + 1;
        }
    }

    createLiveStatsContainer() {
        // Create live stats container if it doesn't exist
        const statsGrid = document.querySelector('.stats-grid');
        if (!statsGrid) return;
        
        const liveStatsCard = document.createElement('div');
        liveStatsCard.className = 'stat-card';
        liveStatsCard.id = 'liveCartStats';
        liveStatsCard.innerHTML = `
            <div class="stat-icon">
                <i class="fas fa-shopping-cart"></i>
            </div>
            <div class="stat-info">
                <h3 id="cartActivityCounter">0</h3>
                <p>Aktivitas Keranjang Live</p>
                <span class="stat-change positive">Real-time</span>
            </div>
        `;
        
        statsGrid.appendChild(liveStatsCard);
    }

    updateProductPopularity(product) {
        // Track product popularity
        const popularProducts = JSON.parse(localStorage.getItem('popularProducts')) || {};
        
        if (!popularProducts[product.id]) {
            popularProducts[product.id] = {
                name: product.name,
                category: product.category,
                addToCartCount: 0
            };
        }
        
        popularProducts[product.id].addToCartCount += 1;
        localStorage.setItem('popularProducts', JSON.stringify(popularProducts));
        
        // Update popular product display
        this.updatePopularProductDisplay();
    }

    updatePopularProductDisplay() {
        const popularProducts = JSON.parse(localStorage.getItem('popularProducts')) || {};
        const sortedProducts = Object.entries(popularProducts)
            .sort(([,a], [,b]) => b.addToCartCount - a.addToCartCount)
            .slice(0, 5);
        
        const popularProductsList = document.getElementById('popularProductsList');
        if (popularProductsList && sortedProducts.length > 0) {
            popularProductsList.innerHTML = sortedProducts.map(([id, product]) => `
                <div class="popular-product-item">
                    <span class="product-name">${product.name}</span>
                    <span class="add-count">${product.addToCartCount}x</span>
                </div>
            `).join('');
        }
    }

    addToRecentActivities(activity) {
        // Add activity to recent activities feed
        const recentActivities = JSON.parse(localStorage.getItem('recentActivities')) || [];
        recentActivities.unshift(activity);
        
        // Keep only last 50 activities
        if (recentActivities.length > 50) {
            recentActivities.splice(50);
        }
        
        localStorage.setItem('recentActivities', JSON.stringify(recentActivities));
        this.updateRecentActivitiesDisplay();
    }

    updateRecentActivitiesDisplay() {
        const recentActivities = JSON.parse(localStorage.getItem('recentActivities')) || [];
        const activitiesList = document.getElementById('recentActivitiesList');
        
        if (activitiesList && recentActivities.length > 0) {
            activitiesList.innerHTML = recentActivities.slice(0, 10).map(activity => `
                <div class="activity-item">
                    <div class="activity-icon ${activity.type}">
                        <i class="fas fa-${activity.type === 'cart' ? 'shopping-cart' : 'utensils'}"></i>
                    </div>
                    <div class="activity-content">
                        <p class="activity-description">${this.getActivityDescription(activity)}</p>
                        <span class="activity-time">${this.formatTimeAgo(activity.timestamp)}</span>
                    </div>
                </div>
            `).join('');
        }
    }

    getActivityDescription(activity) {
        switch (activity.action) {
            case 'cartUpdate':
                return `Item keranjang diperbarui`;
            case 'checkout':
                return `Pelanggan melanjutkan ke checkout`;
            case 'productAddedToCart':
                return `${activity.data.product?.name || 'Produk'} ditambahkan ke keranjang`;
            case 'categoryChanged':
                return `Kategori menu diubah ke ${activity.data.category}`;
            default:
                return `Aktivitas: ${activity.action}`;
        }
    }

    showLiveNotification(message, type = 'info') {
        // Show live notification in admin panel
        const notification = document.createElement('div');
        notification.className = `live-notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
            <button class="close-notification" onclick="this.parentElement.remove()">×</button>
        `;
        
        // Add to notification area
        let notificationArea = document.getElementById('liveNotificationArea');
        if (!notificationArea) {
            notificationArea = document.createElement('div');
            notificationArea.id = 'liveNotificationArea';
            notificationArea.className = 'live-notification-area';
            document.body.appendChild(notificationArea);
        }
        
        notificationArea.appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }

    loadDashboardData() {
        if (!window.adminDataManager) return;

        const orders = window.adminDataManager.getOrders();
        const today = new Date().toDateString();

        // Calculate today's orders
        this.stats.todayOrders = orders.filter(order => 
            new Date(order.createdAt).toDateString() === today
        ).length;

        // Calculate today's reservations
        const reservations = window.adminDataManager.getData().reservations || [];
        this.stats.todayReservations = reservations.filter(reservation => 
            new Date(reservation.createdAt).toDateString() === today
        ).length;

        // Calculate total revenue
        this.stats.totalRevenue = orders
            .filter(order => order.status === 'completed')
            .reduce((total, order) => total + (order.total || 0), 0);

        // Calculate active orders
        this.stats.activeOrders = orders.filter(order => 
            ['pending', 'confirmed', 'preparing'].includes(order.status)
        ).length;
    }

    updateStats() {
        // Update stat cards
        const todayOrdersEl = document.getElementById('todayOrders');
        if (todayOrdersEl) todayOrdersEl.textContent = this.stats.todayOrders;

        const todayReservationsEl = document.getElementById('todayReservations');
        if (todayReservationsEl) todayReservationsEl.textContent = this.stats.todayReservations;

        const totalRevenueEl = document.getElementById('totalRevenue');
        if (totalRevenueEl) totalRevenueEl.textContent = this.formatCurrency(this.stats.totalRevenue);

        const activeOrdersEl = document.getElementById('activeOrders');
        if (activeOrdersEl) activeOrdersEl.textContent = this.stats.activeOrders;
    }

    loadRecentOrders() {
        const recentOrdersTable = document.getElementById('recentOrdersTable');
        if (!recentOrdersTable || !window.adminDataManager) return;

        const orders = window.adminDataManager.getOrders()
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 10);

        if (orders.length === 0) {
            recentOrdersTable.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center">
                        <div class="empty-state">
                            <i class="fas fa-shopping-cart"></i>
                            <p>Belum ada pesanan</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        recentOrdersTable.innerHTML = orders.map(order => `
            <tr>
                <td><strong>${order.id}</strong></td>
                <td>${order.customerName}</td>
                <td>
                    <div class="order-items-summary">
                        ${order.items ? order.items.slice(0, 2).map(item => 
                            `<span class="item-name">${item.name}</span>`
                        ).join(', ') : 'N/A'}
                        ${order.items && order.items.length > 2 ? `<span class="more-items">+${order.items.length - 2} lainnya</span>` : ''}
                    </div>
                </td>
                <td><strong>${this.formatCurrency(order.total || 0)}</strong></td>
                <td>
                    <span class="status-badge status-${order.status}">
                        ${this.getStatusText(order.status)}
                    </span>
                </td>
                <td>${this.formatTime(order.createdAt)}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-action view" onclick="adminDashboard.viewOrder('${order.id}')" title="Lihat Detail">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn-action edit" onclick="adminDashboard.editOrderStatus('${order.id}')" title="Edit Status">
                            <i class="fas fa-edit"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    setupNotifications() {
        if (!window.adminDataManager) return;

        const notifications = window.adminDataManager.getNotifications();
        const unreadCount = notifications.filter(n => !n.read).length;

        // Update notification badge
        const badge = document.getElementById('notificationBadge');
        if (badge) {
            if (unreadCount > 0) {
                badge.textContent = unreadCount;
                badge.style.display = 'flex';
            } else {
                badge.style.display = 'none';
            }
        }

        // Setup notification bell click
        const notificationBell = document.getElementById('notificationBell');
        if (notificationBell) {
            notificationBell.addEventListener('click', () => this.showNotificationPanel());
        }
    }

    showNotificationPanel() {
        const notifications = window.adminDataManager.getNotifications().slice(0, 10);
        
        // Remove existing panel
        const existingPanel = document.querySelector('.notification-panel');
        if (existingPanel) {
            existingPanel.remove();
            return;
        }

        const panel = document.createElement('div');
        panel.className = 'notification-panel';
        panel.style.cssText = `
            position: absolute;
            top: 100%;
            right: 0;
            width: 380px;
            max-height: 500px;
            background: white;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
            z-index: 1000;
            overflow: hidden;
            border: 1px solid #e1e8ed;
        `;

        panel.innerHTML = `
            <div class="notification-header" style="padding: 16px 20px; border-bottom: 1px solid #e1e8ed; background: #f8f9fa;">
                <h3 style="margin: 0; font-size: 16px; color: #2c3e50;">Notifikasi</h3>
                <button onclick="adminDashboard.markAllAsRead()" style="background: none; border: none; color: #3498db; font-size: 12px; cursor: pointer;">
                    Tandai Semua Dibaca
                </button>
            </div>
            <div class="notification-list" style="max-height: 350px; overflow-y: auto;">
                ${notifications.length > 0 ? notifications.map(notification => `
                    <div class="notification-item ${!notification.read ? 'unread' : ''}" style="
                        display: flex;
                        align-items: flex-start;
                        padding: 12px 20px;
                        border-bottom: 1px solid #f1f3f4;
                        cursor: pointer;
                        transition: background-color 0.2s ease;
                        ${!notification.read ? 'background-color: #f0f8ff; border-left: 3px solid #3498db;' : ''}
                    " onclick="adminDashboard.markAsRead('${notification.id}')">
                        <div class="notification-icon" style="
                            width: 36px;
                            height: 36px;
                            border-radius: 50%;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            margin-right: 12px;
                            flex-shrink: 0;
                            background: ${this.getNotificationIconBg(notification.type)};
                            color: ${this.getNotificationIconColor(notification.type)};
                        ">
                            <i class="fas fa-${this.getNotificationIcon(notification.type)}"></i>
                        </div>
                        <div class="notification-content" style="flex: 1; min-width: 0;">
                            <div class="notification-title" style="font-weight: 600; font-size: 14px; color: #2c3e50; margin-bottom: 4px;">
                                ${notification.title}
                            </div>
                            <div class="notification-message" style="font-size: 13px; color: #7f8c8d; line-height: 1.4; margin-bottom: 4px;">
                                ${notification.message}
                            </div>
                            <div class="notification-time" style="font-size: 11px; color: #95a5a6;">
                                ${this.formatTimeAgo(notification.timestamp)}
                            </div>
                        </div>
                        ${!notification.read ? '<div class="unread-dot" style="width: 8px; height: 8px; background: #3498db; border-radius: 50%; margin-left: 8px; margin-top: 8px;"></div>' : ''}
                    </div>
                `).join('') : `
                    <div style="text-align: center; padding: 40px 20px; color: #95a5a6;">
                        <i class="fas fa-bell" style="font-size: 48px; margin-bottom: 16px; opacity: 0.5;"></i>
                        <p>Tidak ada notifikasi</p>
                    </div>
                `}
            </div>
        `;

        // Position panel relative to notification bell
        const notificationBell = document.getElementById('notificationBell');
        if (notificationBell) {
            notificationBell.style.position = 'relative';
            notificationBell.appendChild(panel);
        }

        // Close panel when clicking outside
        setTimeout(() => {
            document.addEventListener('click', function closePanel(e) {
                if (!panel.contains(e.target) && !notificationBell.contains(e.target)) {
                    panel.remove();
                    document.removeEventListener('click', closePanel);
                }
            });
        }, 100);
    }

    getNotificationIcon(type) {
        const icons = {
            success: 'check-circle',
            info: 'info-circle',
            warning: 'exclamation-triangle',
            error: 'times-circle'
        };
        return icons[type] || 'bell';
    }

    getNotificationIconBg(type) {
        const colors = {
            success: '#e8f5e8',
            info: '#e8f4fd',
            warning: '#fff3cd',
            error: '#fee'
        };
        return colors[type] || '#f8f9fa';
    }

    getNotificationIconColor(type) {
        const colors = {
            success: '#27ae60',
            info: '#3498db',
            warning: '#f39c12',
            error: '#e74c3c'
        };
        return colors[type] || '#6c757d';
    }

    markAsRead(notificationId) {
        if (!window.adminDataManager) return;

        const adminData = window.adminDataManager.getData();
        const notification = adminData.notifications.find(n => n.id === notificationId);
        if (notification) {
            notification.read = true;
            window.adminDataManager.saveData(adminData);
            this.setupNotifications();
        }
    }

    markAllAsRead() {
        if (!window.adminDataManager) return;

        const adminData = window.adminDataManager.getData();
        adminData.notifications.forEach(n => n.read = true);
        window.adminDataManager.saveData(adminData);
        this.setupNotifications();
        
        // Close notification panel
        const panel = document.querySelector('.notification-panel');
        if (panel) panel.remove();
    }

    handleDashboardUpdate(data) {
        if (data.type === 'newOrder') {
            this.loadDashboardData();
            this.updateStats();
            this.loadRecentOrders();
            this.setupNotifications();
            
            // Show toast notification
            this.showToast('Pesanan baru diterima!', 'success');
        }
    }

    viewOrder(orderId) {
        if (!window.adminDataManager) return;

        const order = window.adminDataManager.getOrders().find(o => o.id === orderId);
        if (!order) return;

        // Create modal
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'block';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Detail Pesanan ${order.id}</h3>
                    <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
                </div>
                <div class="modal-body">
                    <div class="order-detail-grid">
                        <div class="customer-info">
                            <h4>Informasi Pelanggan</h4>
                            <p><strong>Nama:</strong> ${order.customerName}</p>
                            <p><strong>Email:</strong> ${order.customerEmail}</p>
                            <p><strong>Telepon:</strong> ${order.customerPhone}</p>
                            ${order.deliveryAddress ? `<p><strong>Alamat:</strong> ${order.deliveryAddress}</p>` : ''}
                        </div>
                        <div class="order-info">
                            <h4>Informasi Pesanan</h4>
                            <p><strong>Status:</strong> <span class="status-badge status-${order.status}">${this.getStatusText(order.status)}</span></p>
                            <p><strong>Tanggal:</strong> ${this.formatDateTime(order.createdAt)}</p>
                            <p><strong>Metode Pembayaran:</strong> ${order.paymentMethod}</p>
                            <p><strong>Tipe Pengiriman:</strong> ${order.deliveryType === 'pickup' ? 'Ambil di Tempat' : 'Delivery'}</p>
                        </div>
                    </div>
                    
                    <div class="order-items-detail">
                        <h4>Item Pesanan</h4>
                        <table class="items-table">
                            <thead>
                                <tr>
                                    <th>Item</th>
                                    <th>Qty</th>
                                    <th>Harga</th>
                                    <th>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${order.items ? order.items.map(item => `
                                    <tr>
                                        <td>${item.name}</td>
                                        <td>${item.quantity}</td>
                                        <td>${this.formatCurrency(item.price)}</td>
                                        <td>${this.formatCurrency(item.price * item.quantity)}</td>
                                    </tr>
                                `).join('') : '<tr><td colspan="4">Tidak ada item</td></tr>'}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colspan="3"><strong>Subtotal</strong></td>
                                    <td><strong>${this.formatCurrency(order.subtotal || 0)}</strong></td>
                                </tr>
                                <tr>
                                    <td colspan="3"><strong>Pajak</strong></td>
                                    <td><strong>${this.formatCurrency(order.tax || 0)}</strong></td>
                                </tr>
                                <tr>
                                    <td colspan="3"><strong>Biaya Layanan</strong></td>
                                    <td><strong>${this.formatCurrency(order.serviceFee || 0)}</strong></td>
                                </tr>
                                <tr class="total-row">
                                    <td colspan="3"><strong>Total</strong></td>
                                    <td><strong>${this.formatCurrency(order.total || 0)}</strong></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                    
                    <div class="order-actions">
                        <select id="statusSelect" class="status-select">
                            <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
                            <option value="confirmed" ${order.status === 'confirmed' ? 'selected' : ''}>Dikonfirmasi</option>
                            <option value="preparing" ${order.status === 'preparing' ? 'selected' : ''}>Diproses</option>
                            <option value="ready" ${order.status === 'ready' ? 'selected' : ''}>Siap</option>
                            <option value="completed" ${order.status === 'completed' ? 'selected' : ''}>Selesai</option>
                            <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Dibatalkan</option>
                        </select>
                        <button class="btn btn-primary" onclick="adminDashboard.updateOrderStatus('${order.id}', document.getElementById('statusSelect').value)">
                            Update Status
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    editOrderStatus(orderId) {
        const newStatus = prompt('Masukkan status baru (pending, confirmed, preparing, ready, completed, cancelled):');
        if (newStatus) {
            this.updateOrderStatus(orderId, newStatus);
        }
    }

    updateOrderStatus(orderId, newStatus) {
        if (!window.adminDataManager) return;

        window.adminDataManager.updateOrderStatus(orderId, newStatus);
        this.loadRecentOrders();
        this.showToast(`Status pesanan ${orderId} berhasil diperbarui`, 'success');
        
        // Close modal if open
        const modal = document.querySelector('.modal');
        if (modal) modal.remove();
    }

    startRealTimeUpdates() {
        // Update dashboard every 30 seconds
        setInterval(() => {
            this.loadDashboardData();
            this.updateStats();
            this.loadRecentOrders();
        }, 30000);
    }

    refreshDashboard() {
        this.loadDashboardData();
        this.updateStats();
        this.loadRecentOrders();
        this.setupNotifications();
        this.updateRecentActivitiesDisplay();
        this.updatePopularProductDisplay();
        this.showToast('Dashboard berhasil diperbarui', 'success');
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: white;
            padding: 16px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 1001;
            transform: translateX(400px);
            transition: transform 0.3s ease;
            border-left: 4px solid ${type === 'success' ? '#27ae60' : type === 'error' ? '#e74c3c' : '#3498db'};
            color: ${type === 'success' ? '#27ae60' : type === 'error' ? '#e74c3c' : '#3498db'};
            font-weight: 500;
        `;
        toast.textContent = message;

        document.body.appendChild(toast);

        // Show toast
        setTimeout(() => toast.style.transform = 'translateX(0)', 100);

        // Hide toast after 3 seconds
        setTimeout(() => {
            toast.style.transform = 'translateX(400px)';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount);
    }

    formatTime(dateString) {
        return new Date(dateString).toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    formatDateTime(dateString) {
        return new Date(dateString).toLocaleString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    formatTimeAgo(dateString) {
        const now = new Date();
        const date = new Date(dateString);
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) return 'Baru saja';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} menit yang lalu`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} jam yang lalu`;
        return `${Math.floor(diffInSeconds / 86400)} hari yang lalu`;
    }

    getStatusText(status) {
        const statusTexts = {
            pending: 'Menunggu',
            confirmed: 'Dikonfirmasi',
            preparing: 'Diproses',
            ready: 'Siap',
            completed: 'Selesai',
            cancelled: 'Dibatalkan'
        };
        return statusTexts[status] || status;
    }
}

// Initialize admin dashboard
const adminDashboard = new AdminDashboard();

// Additional styles for live features
const liveFeatureStyles = `
.live-notification-area {
    position: fixed;
    top: 80px;
    right: 20px;
    z-index: 1002;
    max-width: 350px;
}

.live-notification {
    background: white;
    padding: 12px 16px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    gap: 10px;
    border-left: 4px solid #3498db;
    animation: slideInRight 0.3s ease;
}

.live-notification.success {
    border-left-color: #27ae60;
    color: #27ae60;
}

.live-notification.error {
    border-left-color: #e74c3c;
    color: #e74c3c;
}

.close-notification {
    background: none;
    border: none;
    color: #999;
    cursor: pointer;
    font-size: 16px;
    margin-left: auto;
}

.activity-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px;
    border-bottom: 1px solid #f1f3f4;
}

.activity-icon {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
}

.activity-icon.cart {
    background: #e8f4fd;
    color: #3498db;
}

.activity-icon.menu {
    background: #e8f5e8;
    color: #27ae60;
}

.activity-content {
    flex: 1;
}

.activity-description {
    margin: 0 0 4px 0;
    font-size: 14px;
    color: #2c3e50;
}

.activity-time {
    font-size: 12px;
    color: #95a5a6;
}

.popular-product-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
    border-bottom: 1px solid #f1f3f4;
}

.product-name {
    font-size: 14px;
    color: #2c3e50;
}

.add-count {
    font-size: 12px;
    color: #27ae60;
    font-weight: 600;
}

@keyframes slideInRight {
    from {
        transform: translateX(100%);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}
`;

// Add live feature styles
const liveStyleSheet = document.createElement('style');
liveStyleSheet.textContent = liveFeatureStyles;
document.head.appendChild(liveStyleSheet);