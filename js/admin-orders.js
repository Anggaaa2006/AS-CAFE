// Orders management functionality
let currentEditingOrder = null
let selectedItems = []

// Assuming adminData is defined elsewhere, likely in another script file.
// For the purpose of this example, we'll declare it here.
// In a real application, ensure it's properly imported or defined.
// Example: import adminData from './admin-data'; or similar.
const adminData = {
  getOrders: () => {
    // Replace with actual data retrieval logic
    return []
  },
  getStatusBadge: (status) => {
    // Replace with actual status badge generation logic
    return `<span>${status}</span>`
  },
  formatTime: (time) => {
    // Replace with actual time formatting logic
    return time
  },
  formatCurrency: (amount) => {
    // Replace with actual currency formatting logic
    return amount
  },
  getMenu: () => {
    return []
  },
  deleteOrder: (orderId) => {
    console.log("Deleting order with ID: " + orderId)
  },
  updateOrder: (orderId, orderData) => {
    console.log("Updating order with ID: " + orderId, orderData)
  },
  addOrder: (orderData) => {
    console.log("Adding order: ", orderData)
  },
}

document.addEventListener("DOMContentLoaded", () => {
  loadOrders()
  loadMenuItems()
  setupEventListeners()
})

function setupEventListeners() {
  // Search functionality
  document.getElementById("searchOrders").addEventListener("input", filterOrders)

  // Form submission
  document.getElementById("orderForm").addEventListener("submit", handleOrderSubmit)

  // Modal close events
  window.addEventListener("click", (event) => {
    const modal = document.getElementById("orderModal")
    if (event.target === modal) {
      closeOrderModal()
    }
  })
}

function loadOrders() {
  const orders = adminData.getOrders()
  displayOrders(orders)
}

function displayOrders(orders) {
  const container = document.getElementById("ordersList")

  if (orders.length === 0) {
    container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-shopping-cart"></i>
                <h3>Belum ada pesanan</h3>
                <p>Klik tombol "Tambah Pesanan" untuk membuat pesanan baru</p>
            </div>
        `
    return
  }

  container.innerHTML = orders
    .map(
      (order) => `
        <div class="order-card">
            <div class="card-header-info">
                <div class="customer-info">
                    <h3>${order.customerName}</h3>
                    <p><i class="fas fa-phone"></i> ${order.customerPhone}</p>
                </div>
                <div class="card-actions">
                    ${adminData.getStatusBadge(order.status)}
                    <button class="btn btn-primary" onclick="editOrder('${order.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-danger" onclick="deleteOrder('${order.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            
            <div class="order-details">
                <div class="detail-item">
                    <i class="fas fa-table"></i>
                    <span>Meja ${order.tableNumber || "N/A"}</span>
                </div>
                <div class="detail-item">
                    <i class="fas fa-clock"></i>
                    <span>${adminData.formatTime(order.createdAt)}</span>
                </div>
                <div class="detail-item">
                    <i class="fas fa-money-bill-wave"></i>
                    <span>${adminData.formatCurrency(order.total)}</span>
                </div>
            </div>
            
            <div class="order-items">
                <h4>Item Pesanan:</h4>
                <div class="item-list">
                    ${order.items
                      .map(
                        (item) => `
                        <div class="item-row">
                            <span class="item-name">${item.name} x${item.quantity}</span>
                            <span class="item-price">${adminData.formatCurrency(item.price * item.quantity)}</span>
                        </div>
                    `,
                      )
                      .join("")}
                    <div class="item-row total-row">
                        <span>Total:</span>
                        <span>${adminData.formatCurrency(order.total)}</span>
                    </div>
                </div>
            </div>
        </div>
    `,
    )
    .join("")
}

function filterOrders() {
  const searchTerm = document.getElementById("searchOrders").value.toLowerCase()
  const statusFilter = document.getElementById("statusFilter").value
  const orders = adminData.getOrders()

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.customerName.toLowerCase().includes(searchTerm) || order.customerPhone.includes(searchTerm)
    const matchesStatus = !statusFilter || order.status === statusFilter

    return matchesSearch && matchesStatus
  })

  displayOrders(filteredOrders)
}

function showOrderForm() {
  currentEditingOrder = null
  selectedItems = []
  document.getElementById("modalTitle").textContent = "Tambah Pesanan Baru"
  document.getElementById("orderForm").reset()
  updateSelectedItemsDisplay()
  document.getElementById("orderModal").style.display = "block"
}

function editOrder(orderId) {
  const orders = adminData.getOrders()
  const order = orders.find((o) => o.id === orderId)

  if (order) {
    currentEditingOrder = order
    selectedItems = [...order.items]

    document.getElementById("modalTitle").textContent = "Edit Pesanan"
    document.getElementById("customerName").value = order.customerName
    document.getElementById("customerPhone").value = order.customerPhone
    document.getElementById("tableNumber").value = order.tableNumber || ""
    document.getElementById("orderStatus").value = order.status

    updateSelectedItemsDisplay()
    document.getElementById("orderModal").style.display = "block"
  }
}

function deleteOrder(orderId) {
  if (confirm("Apakah Anda yakin ingin menghapus pesanan ini?")) {
    adminData.deleteOrder(orderId)
    loadOrders()
  }
}

function closeOrderModal() {
  document.getElementById("orderModal").style.display = "none"
  currentEditingOrder = null
  selectedItems = []
}

function loadMenuItems() {
  const menu = adminData.getMenu()
  const container = document.getElementById("menuItems")

  container.innerHTML = menu
    .filter((item) => item.available)
    .map(
      (item) => `
            <div class="menu-item" onclick="addMenuItem('${item.id}')">
                <h4>${item.name}</h4>
                <p>${adminData.formatCurrency(item.price)}</p>
            </div>
        `,
    )
    .join("")
}

function addMenuItem(itemId) {
  const menu = adminData.getMenu()
  const menuItem = menu.find((item) => item.id === itemId)

  if (menuItem) {
    const existingItem = selectedItems.find((item) => item.id === itemId)

    if (existingItem) {
      existingItem.quantity += 1
    } else {
      selectedItems.push({
        id: menuItem.id,
        name: menuItem.name,
        price: menuItem.price,
        quantity: 1,
      })
    }

    updateSelectedItemsDisplay()
  }
}

function updateItemQuantity(itemId, change) {
  const item = selectedItems.find((item) => item.id === itemId)

  if (item) {
    item.quantity += change

    if (item.quantity <= 0) {
      selectedItems = selectedItems.filter((item) => item.id !== itemId)
    }

    updateSelectedItemsDisplay()
  }
}

function removeItem(itemId) {
  selectedItems = selectedItems.filter((item) => item.id !== itemId)
  updateSelectedItemsDisplay()
}

function updateSelectedItemsDisplay() {
  const container = document.getElementById("itemsList")
  const totalElement = document.getElementById("orderTotal")

  if (selectedItems.length === 0) {
    container.innerHTML = "<p>Belum ada item yang dipilih</p>"
    totalElement.textContent = "0"
    return
  }

  container.innerHTML = selectedItems
    .map(
      (item) => `
        <div class="selected-item">
            <div>
                <strong>${item.name}</strong><br>
                <small>${adminData.formatCurrency(item.price)} x ${item.quantity}</small>
            </div>
            <div class="item-controls">
                <button type="button" class="quantity-btn" onclick="updateItemQuantity('${item.id}', -1)">
                    <i class="fas fa-minus"></i>
                </button>
                <span class="quantity">${item.quantity}</span>
                <button type="button" class="quantity-btn" onclick="updateItemQuantity('${item.id}', 1)">
                    <i class="fas fa-plus"></i>
                </button>
                <button type="button" class="remove-btn" onclick="removeItem('${item.id}')">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        </div>
    `,
    )
    .join("")

  const total = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  totalElement.textContent = total.toLocaleString()
}

function handleOrderSubmit(event) {
  event.preventDefault()

  if (selectedItems.length === 0) {
    alert("Pilih minimal satu item menu")
    return
  }

  const orderData = {
    customerName: document.getElementById("customerName").value,
    customerPhone: document.getElementById("customerPhone").value,
    tableNumber: Number.parseInt(document.getElementById("tableNumber").value) || null,
    status: document.getElementById("orderStatus").value,
    items: selectedItems,
    total: selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
  }

  if (currentEditingOrder) {
    adminData.updateOrder(currentEditingOrder.id, orderData)
  } else {
    adminData.addOrder(orderData)
  }

  closeOrderModal()
  loadOrders()
}