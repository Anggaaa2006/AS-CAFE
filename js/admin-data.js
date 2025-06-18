// Enhanced Data Management for AS CAFE Admin
class AdminData {
  constructor() {
    this.initializeData()
  }

  initializeData() {
    // Initialize sample data if not exists
    if (!localStorage.getItem("asCafeOrders")) {
      const sampleOrders = [
        {
          id: "001",
          customerName: "Budi Santoso",
          customerPhone: "081234567890",
          tableNumber: 5,
          status: "preparing",
          items: [
            { id: "1", name: "Kopi Signature", price: 25000, quantity: 1 },
            { id: "3", name: "Pasta Carbonara", price: 45000, quantity: 1 },
          ],
          total: 120000,
          createdAt: new Date().toISOString(),
        },
        {
          id: "002",
          customerName: "Siti Rahma",
          customerPhone: "081234567891",
          tableNumber: 3,
          status: "ready",
          items: [
            { id: "2", name: "Cappuccino", price: 35000, quantity: 1 },
            { id: "4", name: "Tiramisu", price: 40000, quantity: 1 },
          ],
          total: 80000,
          createdAt: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: "003",
          customerName: "Andi Wijaya",
          customerPhone: "081234567892",
          tableNumber: 7,
          status: "completed",
          items: [
            { id: "5", name: "Latte", price: 38000, quantity: 1 },
            { id: "6", name: "Chicken Sandwich", price: 42000, quantity: 1 },
          ],
          total: 90000,
          createdAt: new Date(Date.now() - 7200000).toISOString(),
        },
        {
          id: "004",
          customerName: "Maya Sari",
          customerPhone: "081234567893",
          tableNumber: 2,
          status: "pending",
          items: [
            { id: "7", name: "Americano", price: 30000, quantity: 1 },
            { id: "8", name: "Caesar Salad", price: 38000, quantity: 1 },
          ],
          total: 85000,
          createdAt: new Date(Date.now() - 1800000).toISOString(),
        },
        {
          id: "005",
          customerName: "Rudi Hartono",
          customerPhone: "081234567894",
          tableNumber: 4,
          status: "confirmed",
          items: [
            { id: "9", name: "Mocha", price: 40000, quantity: 1 },
            { id: "10", name: "Beef Burger", price: 55000, quantity: 1 },
          ],
          total: 108000,
          createdAt: new Date(Date.now() - 900000).toISOString(),
        },
      ]
      localStorage.setItem("asCafeOrders", JSON.stringify(sampleOrders))
    }

    if (!localStorage.getItem("asCafeReservations")) {
      const sampleReservations = [
        {
          id: "1",
          customerName: "Alice Johnson",
          customerPhone: "081234567892",
          customerEmail: "alice@example.com",
          date: new Date(Date.now() + 86400000).toISOString().split("T")[0],
          time: "19:00",
          guests: 4,
          tableNumber: 7,
          status: "confirmed",
          notes: "Birthday celebration",
          createdAt: new Date().toISOString(),
        },
        {
          id: "2",
          customerName: "Bob Wilson",
          customerPhone: "081234567893",
          customerEmail: "bob@example.com",
          date: new Date(Date.now() + 172800000).toISOString().split("T")[0],
          time: "12:30",
          guests: 2,
          tableNumber: 2,
          status: "pending",
          notes: "Window seat preferred",
          createdAt: new Date().toISOString(),
        },
      ]
      localStorage.setItem("asCafeReservations", JSON.stringify(sampleReservations))
    }

    if (!localStorage.getItem("asCafeMenu")) {
      const sampleMenu = [
        {
          id: "1",
          name: "Espresso",
          price: 25000,
          category: "coffee",
          description: "Rich and bold espresso shot",
          available: true,
          image: "/placeholder.svg?height=200&width=200",
        },
        {
          id: "2",
          name: "Cappuccino",
          price: 35000,
          category: "coffee",
          description: "Espresso with steamed milk and foam",
          available: true,
          image: "/placeholder.svg?height=200&width=200",
        },
        {
          id: "3",
          name: "Nasi Goreng",
          price: 45000,
          category: "food",
          description: "Indonesian fried rice with egg",
          available: true,
          image: "/placeholder.svg?height=200&width=200",
        },
        {
          id: "4",
          name: "Sandwich Club",
          price: 40000,
          category: "food",
          description: "Triple layer sandwich with chicken and vegetables",
          available: true,
          image: "/placeholder.svg?height=200&width=200",
        },
        {
          id: "5",
          name: "Latte",
          price: 38000,
          category: "coffee",
          description: "Espresso with steamed milk",
          available: true,
          image: "/placeholder.svg?height=200&width=200",
        },
        {
          id: "6",
          name: "Mie Ayam",
          price: 35000,
          category: "food",
          description: "Chicken noodle soup",
          available: true,
          image: "/placeholder.svg?height=200&width=200",
        },
      ]
      localStorage.setItem("asCafeMenu", JSON.stringify(sampleMenu))
    }

    // Add this after the existing menu initialization:
    if (!localStorage.getItem("asCafeCategories")) {
      const sampleCategories = [
        {
          id: "1",
          name: "Coffee",
          description: "Berbagai macam kopi berkualitas",
          icon: "fas fa-coffee",
          color: "#8B4513",
          order: 1,
          createdAt: new Date().toISOString(),
        },
        {
          id: "2",
          name: "Food",
          description: "Makanan lezat dan bergizi",
          icon: "fas fa-utensils",
          color: "#FF6B35",
          order: 2,
          createdAt: new Date().toISOString(),
        },
        {
          id: "3",
          name: "Dessert",
          description: "Pencuci mulut yang manis",
          icon: "fas fa-ice-cream",
          color: "#FF69B4",
          order: 3,
          createdAt: new Date().toISOString(),
        },
        {
          id: "4",
          name: "Beverage",
          description: "Minuman segar non-kopi",
          icon: "fas fa-glass-whiskey",
          color: "#4169E1",
          order: 4,
          createdAt: new Date().toISOString(),
        },
      ]
      localStorage.setItem("asCafeCategories", JSON.stringify(sampleCategories))
    }

    // Update existing menu items to include categoryId:
    if (!localStorage.getItem("asCafeMenuUpdated")) {
      const menu = this.getMenu()
      const updatedMenu = menu.map((item) => ({
        ...item,
        categoryId: item.category === "coffee" ? "1" : "2", // Map existing categories
        ingredients: item.name.includes("Espresso") ? "Kopi Arabica, Air" : "Bahan berkualitas",
        preparationTime: 5,
        recommended: Math.random() > 0.7,
        spicy: false,
        vegetarian: !item.name.toLowerCase().includes("ayam") && !item.name.toLowerCase().includes("chicken"),
      }))
      this.saveMenu(updatedMenu)
      localStorage.setItem("asCafeMenuUpdated", "true")
    }

    // Initialize Articles
    if (!localStorage.getItem("asCafeArticles")) {
      const sampleArticles = [
        {
          id: "1",
          title: "Menu Baru: Kopi Signature AS CAFE",
          category: "menu",
          status: "published",
          excerpt: "Nikmati cita rasa kopi signature terbaru dari AS CAFE dengan blend khusus yang menggugah selera.",
          content:
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
          image: "/placeholder.svg?height=300&width=400",
          createdAt: new Date().toISOString(),
        },
        {
          id: "2",
          title: "Promo Spesial Bulan Ini",
          category: "promo",
          status: "published",
          excerpt: "Dapatkan diskon 20% untuk semua menu makanan setiap hari Senin-Rabu.",
          content:
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
          image: "/placeholder.svg?height=300&width=400",
          createdAt: new Date(Date.now() - 86400000).toISOString(),
        },
      ]
      localStorage.setItem("asCafeArticles", JSON.stringify(sampleArticles))
    }

    // Initialize Users
    if (!localStorage.getItem("asCafeUsers")) {
      const sampleUsers = [
        {
          id: "1",
          name: "Admin AS CAFE",
          email: "admin@ascafe.com",
          phone: "081234567890",
          role: "admin",
          status: "active",
          createdAt: new Date().toISOString(),
        },
        {
          id: "2",
          name: "Staff Kasir",
          email: "kasir@ascafe.com",
          phone: "081234567891",
          role: "staff",
          status: "active",
          createdAt: new Date().toISOString(),
        },
      ]
      localStorage.setItem("asCafeUsers", JSON.stringify(sampleUsers))
    }

    // Initialize Settings
    if (!localStorage.getItem("asCafeSettings")) {
      const defaultSettings = {
        cafe: {
          name: "AS CAFE",
          address: "Jl. Contoh No. 123, Jakarta",
          phone: "021-12345678",
          email: "info@ascafe.com",
          openTime: "07:00",
          closeTime: "22:00",
        },
        system: {
          currency: "IDR",
          timezone: "Asia/Jakarta",
          language: "id",
        },
        notifications: {
          email: true,
          orders: true,
          reservations: true,
        },
      }
      localStorage.setItem("asCafeSettings", JSON.stringify(defaultSettings))
    }
  }

  // Orders CRUD
  getOrders() {
    return JSON.parse(localStorage.getItem("asCafeOrders") || "[]")
  }

  saveOrders(orders) {
    localStorage.setItem("asCafeOrders", JSON.stringify(orders))
  }

  addOrder(order) {
    const orders = this.getOrders()
    order.id = (orders.length + 1).toString().padStart(3, "0")
    order.createdAt = new Date().toISOString()
    orders.unshift(order)
    this.saveOrders(orders)
    return order
  }

  updateOrder(orderId, updatedOrder) {
    const orders = this.getOrders()
    const index = orders.findIndex((order) => order.id === orderId)
    if (index !== -1) {
      orders[index] = { ...orders[index], ...updatedOrder }
      this.saveOrders(orders)
      return orders[index]
    }
    return null
  }

  deleteOrder(orderId) {
    const orders = this.getOrders()
    const filteredOrders = orders.filter((order) => order.id !== orderId)
    this.saveOrders(filteredOrders)
    return true
  }

  // Reservations CRUD
  getReservations() {
    return JSON.parse(localStorage.getItem("asCafeReservations") || "[]")
  }

  saveReservations(reservations) {
    localStorage.setItem("asCafeReservations", JSON.stringify(reservations))
  }

  addReservation(reservation) {
    const reservations = this.getReservations()
    reservation.id = Date.now().toString()
    reservation.createdAt = new Date().toISOString()
    reservations.unshift(reservation)
    this.saveReservations(reservations)
    return reservation
  }

  updateReservation(reservationId, updatedReservation) {
    const reservations = this.getReservations()
    const index = reservations.findIndex((reservation) => reservation.id === reservationId)
    if (index !== -1) {
      reservations[index] = { ...reservations[index], ...updatedReservation }
      this.saveReservations(reservations)
      return reservations[index]
    }
    return null
  }

  deleteReservation(reservationId) {
    const reservations = this.getReservations()
    const filteredReservations = reservations.filter((reservation) => reservation.id !== reservationId)
    this.saveReservations(filteredReservations)
    return true
  }

  // Menu CRUD
  getMenu() {
    return JSON.parse(localStorage.getItem("asCafeMenu") || "[]")
  }

  saveMenu(menu) {
    localStorage.setItem("asCafeMenu", JSON.stringify(menu))
  }

  addProduct(product) {
    const menu = this.getMenu()
    product.id = Date.now().toString()
    menu.push(product)
    this.saveMenu(menu)
    return product
  }

  updateProduct(productId, updatedProduct) {
    const menu = this.getMenu()
    const index = menu.findIndex((product) => product.id === productId)
    if (index !== -1) {
      menu[index] = { ...menu[index], ...updatedProduct }
      this.saveMenu(menu)
      return menu[index]
    }
    return null
  }

  deleteProduct(productId) {
    const menu = this.getMenu()
    const filteredMenu = menu.filter((product) => product.id !== productId)
    this.saveMenu(filteredMenu)
    return true
  }

  // Articles CRUD
  getArticles() {
    return JSON.parse(localStorage.getItem("asCafeArticles") || "[]")
  }

  saveArticles(articles) {
    localStorage.setItem("asCafeArticles", JSON.stringify(articles))
  }

  addArticle(article) {
    const articles = this.getArticles()
    article.id = Date.now().toString()
    article.createdAt = new Date().toISOString()
    articles.unshift(article)
    this.saveArticles(articles)
    return article
  }

  updateArticle(articleId, updatedArticle) {
    const articles = this.getArticles()
    const index = articles.findIndex((article) => article.id === articleId)
    if (index !== -1) {
      articles[index] = { ...articles[index], ...updatedArticle }
      this.saveArticles(articles)
      return articles[index]
    }
    return null
  }

  deleteArticle(articleId) {
    const articles = this.getArticles()
    const filteredArticles = articles.filter((article) => article.id !== articleId)
    this.saveArticles(filteredArticles)
    return true
  }

  // Users CRUD
  getUsers() {
    return JSON.parse(localStorage.getItem("asCafeUsers") || "[]")
  }

  saveUsers(users) {
    localStorage.setItem("asCafeUsers", JSON.stringify(users))
  }

  addUser(user) {
    const users = this.getUsers()
    user.id = Date.now().toString()
    user.createdAt = new Date().toISOString()
    users.push(user)
    this.saveUsers(users)
    return user
  }

  updateUser(userId, updatedUser) {
    const users = this.getUsers()
    const index = users.findIndex((user) => user.id === userId)
    if (index !== -1) {
      users[index] = { ...users[index], ...updatedUser }
      this.saveUsers(users)
      return users[index]
    }
    return null
  }

  deleteUser(userId) {
    const users = this.getUsers()
    const filteredUsers = users.filter((user) => user.id !== userId)
    this.saveUsers(filteredUsers)
    return true
  }

  // Settings
  getSettings() {
    return JSON.parse(localStorage.getItem("asCafeSettings") || "{}")
  }

  updateSettings(section, settings) {
    const allSettings = this.getSettings()
    allSettings[section] = { ...allSettings[section], ...settings }
    localStorage.setItem("asCafeSettings", JSON.stringify(allSettings))
    return allSettings
  }

  // Utility functions
  formatCurrency(amount) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    })
      .format(amount)
      .replace("IDR", "Rp")
  }

  formatDate(dateString) {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  formatTime(dateString) {
    return new Date(dateString).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  getStatusBadge(status) {
    const statusMap = {
      pending: { class: "status-pending", text: "Pending" },
      preparing: { class: "status-preparing", text: "Diproses" },
      ready: { class: "status-ready", text: "Siap" },
      completed: { class: "status-completed", text: "Selesai" },
      cancelled: { class: "status-cancelled", text: "Dibatalkan" },
      confirmed: { class: "status-confirmed", text: "Dikonfirmasi" },
      active: { class: "status-confirmed", text: "Aktif" },
      inactive: { class: "status-cancelled", text: "Tidak Aktif" },
      published: { class: "status-confirmed", text: "Published" },
      draft: { class: "status-pending", text: "Draft" },
    }

    const statusInfo = statusMap[status] || { class: "status-pending", text: status }
    return `<span class="status-badge ${statusInfo.class}">${statusInfo.text}</span>`
  }

  // Categories CRUD
  getCategories() {
    return JSON.parse(localStorage.getItem("asCafeCategories") || "[]")
  }

  saveCategories(categories) {
    localStorage.setItem("asCafeCategories", JSON.stringify(categories))
  }

  addCategory(category) {
    const categories = this.getCategories()
    category.id = Date.now().toString()
    category.createdAt = new Date().toISOString()
    categories.push(category)
    this.saveCategories(categories)
    return category
  }

  updateCategory(categoryId, updatedCategory) {
    const categories = this.getCategories()
    const index = categories.findIndex((category) => category.id === categoryId)
    if (index !== -1) {
      categories[index] = { ...categories[index], ...updatedCategory }
      this.saveCategories(categories)
      return categories[index]
    }
    return null
  }

  deleteCategory(categoryId) {
    const categories = this.getCategories()
    const filteredCategories = categories.filter((category) => category.id !== categoryId)
    this.saveCategories(filteredCategories)
    return true
  }

  getCategoryById(categoryId) {
    const categories = this.getCategories()
    return categories.find((category) => category.id === categoryId)
  }

  // Enhanced Menu CRUD
  addMenuItem(menuItem) {
    const menu = this.getMenu()
    menuItem.id = Date.now().toString()
    menuItem.createdAt = new Date().toISOString()
    menu.push(menuItem)
    this.saveMenu(menu)
    return menuItem
  }

  updateMenuItem(menuItemId, updatedMenuItem) {
    const menu = this.getMenu()
    const index = menu.findIndex((item) => item.id === menuItemId)
    if (index !== -1) {
      menu[index] = { ...menu[index], ...updatedMenuItem }
      this.saveMenu(menu)
      return menu[index]
    }
    return null
  }

  deleteMenuItem(menuItemId) {
    const menu = this.getMenu()
    const filteredMenu = menu.filter((item) => item.id !== menuItemId)
    this.saveMenu(filteredMenu)
    return true
  }
}

// Initialize global data manager
const adminData = new AdminData()
