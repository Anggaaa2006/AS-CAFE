document.addEventListener("DOMContentLoaded", () => {
  // Load orders from localStorage
  const orders = JSON.parse(localStorage.getItem("orders") || "[]")

  // Filter elements
  const statusFilter = document.getElementById("statusFilter")
  const dateFilter = document.getElementById("dateFilter")
  const searchBtn = document.getElementById("searchBtn")
  const ordersContainer = document.getElementById("ordersContainer")
  const emptyState = document.getElementById("emptyState")

  // Initialize page
  displayOrders(orders)

  // Filter functionality
  statusFilter.addEventListener("change", filterOrders)
  dateFilter.addEventListener("change", filterOrders)
  searchBtn.addEventListener("click", filterOrders)

  function filterOrders() {
    const statusValue = statusFilter.value
    const dateValue = dateFilter.value

    let filteredOrders = orders

    // Filter by status
    if (statusValue !== "all") {
      filteredOrders = filteredOrders.filter((order) => order.status === statusValue)
    }

    // Filter by date
    if (dateValue) {
      filteredOrders = filteredOrders.filter((order) => {
        const orderDate = new Date(order.orderDate).toISOString().split("T")[0]
        return orderDate === dateValue
      })
    }

    displayOrders(filteredOrders)
  }

  function displayOrders(ordersToShow) {
    if (ordersToShow.length === 0) {
      ordersContainer.style.display = "none"
      emptyState.style.display = "block"
      return
    }

    ordersContainer.style.display = "flex"
    emptyState.style.display = "none"

    // Clear existing orders (except sample orders for demo)
    const dynamicOrders = ordersContainer.querySelectorAll(".order-card.dynamic")
    dynamicOrders.forEach((order) => order.remove())

    // Add new orders
    ordersToShow.forEach((order) => {
      const orderCard = createOrderCard(order)
      ordersContainer.appendChild(orderCard)
    })
  }

  function createOrderCard(order) {
    const orderCard = document.createElement("div")
    orderCard.className = "order-card dynamic"
    orderCard.setAttribute("data-status", order.status)

    const orderDate = new Date(order.orderDate).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })

    const statusText = getStatusText(order.status)
    const statusClass = order.status

    let itemsHTML = ""
    order.items.forEach((item) => {
      const optionsText =
        item.options && item.options.length > 0 ? ` (${item.options.map((opt) => opt.name).join(", ")})` : ""

      itemsHTML += `
        <div class="order-item">
          <img src="assets/images/placeholder.jpg" alt="${item.name}">
          <div class="item-details">
            <h4>${item.name}</h4>
            <p>${optionsText}</p>
            <span class="quantity">x${item.quantity}</span>
          </div>
          <div class="item-price">${item.price}</div>
        </div>
      `
    })

    const deliveryIcon = order.delivery.method === "delivery" ? "fas fa-truck" : "fas fa-store"
    const deliveryText = order.delivery.method === "delivery" ? `Delivery - ${order.delivery.address}` : "Pickup"

    const paymentIcon = getPaymentIcon(order.payment.method)
    const paymentText = getPaymentText(order.payment.method)

    orderCard.innerHTML = `
      <div class="order-header">
        <div class="order-info">
          <h3>Order #${order.orderId}</h3>
          <span class="order-date">${orderDate}</span>
        </div>
        <div class="order-status">
          <span class="status-badge ${statusClass}">${statusText}</span>
        </div>
      </div>
      
      <div class="order-items">
        ${itemsHTML}
      </div>
      
      <div class="order-summary">
        <div class="delivery-info">
          <i class="${deliveryIcon}"></i>
          <span>${deliveryText}</span>
        </div>
        <div class="payment-info">
          <i class="${paymentIcon}"></i>
          <span>${paymentText}</span>
        </div>
        <div class="total-amount">
          <strong>Total: ${order.total}</strong>
        </div>
      </div>
      
      <div class="order-actions">
        <button class="btn btn-outline" onclick="viewOrderDetail('${order.orderId}')">
          <i class="fas fa-eye"></i> Detail
        </button>
        ${getActionButtons(order)}
      </div>
    `

    return orderCard
  }

  function getStatusText(status) {
    const statusMap = {
      pending: "Menunggu Pembayaran",
      confirmed: "Dikonfirmasi",
      preparing: "Diproses",
      ready: "Siap",
      completed: "Selesai",
      cancelled: "Dibatalkan",
    }
    return statusMap[status] || status
  }

  function getPaymentIcon(method) {
    const iconMap = {
      cash: "fas fa-money-bill-wave",
      transfer: "fas fa-university",
      ewallet: "fas fa-mobile-alt",
      qris: "fas fa-qrcode",
    }
    return iconMap[method] || "fas fa-credit-card"
  }

  function getPaymentText(method) {
    const textMap = {
      cash: "Tunai",
      transfer: "Transfer Bank",
      ewallet: "E-Wallet",
      qris: "QRIS",
    }
    return textMap[method] || method
  }

  function getActionButtons(order) {
    let buttons = ""

    if (order.status === "pending") {
      buttons += `
        <button class="btn btn-primary" onclick="payNow('${order.orderId}')">
          <i class="fas fa-credit-card"></i> Bayar Sekarang
        </button>
        <button class="btn btn-danger" onclick="cancelOrder('${order.orderId}')">
          <i class="fas fa-times"></i> Batalkan
        </button>
      `
    } else if (order.status === "completed") {
      buttons += `
        <button class="btn btn-primary" onclick="reorder('${order.orderId}')">
          <i class="fas fa-redo"></i> Pesan Lagi
        </button>
        <button class="btn btn-secondary" onclick="downloadReceipt('${order.orderId}')">
          <i class="fas fa-download"></i> Struk
        </button>
      `
    } else if (order.status === "preparing" || order.status === "confirmed") {
      buttons += `
        <button class="btn btn-danger" onclick="cancelOrder('${order.orderId}')">
          <i class="fas fa-times"></i> Batalkan
        </button>
        <button class="btn btn-secondary" onclick="contactSupport('${order.orderId}')">
          <i class="fas fa-headset"></i> Bantuan
        </button>
      `
    }

    return buttons
  }
})

// Global functions for order actions
function viewOrderDetail(orderId) {
  // Create modal or redirect to detail page
  alert(`Viewing detail for order: ${orderId}`)
}

function reorder(orderId) {
  const orders = JSON.parse(localStorage.getItem("orders") || "[]")
  const order = orders.find((o) => o.orderId === orderId)

  if (order) {
    // Add items back to cart
    localStorage.setItem("cartItems", JSON.stringify(order.items))

    // Update cart count
    const cartCount = order.items.reduce((total, item) => total + item.quantity, 0)
    document.querySelector(".cart-count").textContent = cartCount

    showNotification("Item berhasil ditambahkan ke keranjang!")

    // Redirect to cart
    setTimeout(() => {
      window.location.href = "keranjang.html"
    }, 1500)
  }
}

function cancelOrder(orderId) {
  if (confirm("Apakah Anda yakin ingin membatalkan pesanan ini?")) {
    const orders = JSON.parse(localStorage.getItem("orders") || "[]")
    const orderIndex = orders.findIndex((o) => o.orderId === orderId)

    if (orderIndex !== -1) {
      orders[orderIndex].status = "cancelled"
      localStorage.setItem("orders", JSON.stringify(orders))

      showNotification("Pesanan berhasil dibatalkan")
      location.reload()
    }
  }
}

function payNow(orderId) {
  // Redirect to payment page with order ID
  window.location.href = `pembayaran.html?orderId=${orderId}`
}

function downloadReceipt(orderId) {
  // Generate and download receipt
  showNotification("Struk sedang diunduh...")
}

function contactSupport(orderId) {
  // Open WhatsApp or support chat
  const message = `Halo, saya butuh bantuan untuk pesanan #${orderId}`
  const whatsappUrl = `https://wa.me/6281234567890?text=${encodeURIComponent(message)}`
  window.open(whatsappUrl, "_blank")
}

function showNotification(message, type = "success") {
  const notification = document.createElement("div")
  notification.className = `notification ${type}`
  notification.textContent = message

  document.body.appendChild(notification)

  setTimeout(() => {
    notification.classList.add("show")
  }, 10)

  setTimeout(() => {
    notification.classList.remove("show")
    setTimeout(() => {
      document.body.removeChild(notification)
    }, 300)
  }, 3000)
}
