// QRIS Payment System
class QRISPayment {
  constructor() {
    this.orderData = null
    this.paymentTimer = null
    this.timeLeft = 15 * 60 // 15 minutes in seconds
    this.qrCode = null
    this.paymentStatus = "waiting"
    this.transactionId = null

    // Ensure adminData is available
    this.ensureAdminData()
    this.init()
  }

  ensureAdminData() {
    // Load admin-data.js if not already loaded
    if (typeof adminData === "undefined") {
      const script = document.createElement("script")
      script.src = "js/admin-data.js"
      script.onload = () => {
        window.adminData = new AdminData()
        this.init()
      }
      document.head.appendChild(script)
      return false
    }
    return true
  }

  init() {
    if (!this.ensureAdminData()) return

    this.loadOrderData()
    this.generateQRCode()
    this.startTimer()
    this.setupEventListeners()
    this.startPaymentStatusCheck()
  }

  loadOrderData() {
    // Get order data from localStorage or URL params
    const savedCart = localStorage.getItem("customerCart")
    if (savedCart) {
      const cart = JSON.parse(savedCart)
      this.orderData = {
        items: cart,
        subtotal: cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
      }

      // Calculate tax and service fee
      this.orderData.tax = Math.round(this.orderData.subtotal * 0.1)
      this.orderData.serviceFee = Math.round(this.orderData.subtotal * 0.05)
      this.orderData.total = this.orderData.subtotal + this.orderData.tax + this.orderData.serviceFee

      this.displayOrderSummary()
    } else {
      // Redirect back if no order data
      this.goBack()
    }
  }

  displayOrderSummary() {
    const orderItemsContainer = document.getElementById("orderItems")
    const subtotalElement = document.getElementById("subtotal")
    const taxElement = document.getElementById("tax")
    const serviceFeeElement = document.getElementById("serviceFee")
    const finalTotalElement = document.getElementById("finalTotal")

    // Display order items
    const adminData = window.adminData // Access adminData from the global scope
    orderItemsContainer.innerHTML = this.orderData.items
      .map(
        (item) => `
            <div class="order-item">
                <div class="item-info">
                    <h4>${item.name}</h4>
                    <p>${item.quantity}x ${adminData.formatCurrency(item.price)}</p>
                </div>
                <div class="item-price">
                    ${adminData.formatCurrency(item.price * item.quantity)}
                </div>
            </div>
        `,
      )
      .join("")

    // Display totals
    subtotalElement.textContent = adminData.formatCurrency(this.orderData.subtotal)
    taxElement.textContent = adminData.formatCurrency(this.orderData.tax)
    serviceFeeElement.textContent = adminData.formatCurrency(this.orderData.serviceFee)
    finalTotalElement.textContent = adminData.formatCurrency(this.orderData.total)
  }

  generateQRCode() {
    // Generate transaction ID
    this.transactionId = "TXN" + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase()

    // QRIS data format (simplified)
    const qrisData = {
      merchantId: "ASCAFE123456789",
      merchantName: "AS CAFE",
      amount: this.orderData.total,
      transactionId: this.transactionId,
      timestamp: new Date().toISOString(),
    }

    // Create QR code string (in real implementation, this would be proper QRIS format)
    const qrString = JSON.stringify(qrisData)

    // Generate QR code using QRCode.js library
    const qrContainer = document.getElementById("qrisCode")
    qrContainer.innerHTML = '<div id="qrcode"></div>'

    // Initialize QR code
    const QRCode = window.QRCode // Access QRCode from the global scope
    this.qrCode = new QRCode(document.getElementById("qrcode"), {
      text: qrString,
      width: 200,
      height: 200,
      colorDark: "#000000",
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.H,
    })

    console.log("QR Code generated for transaction:", this.transactionId)
  }

  startTimer() {
    const timerDisplay = document.getElementById("timerDisplay")
    const timerElement = document.querySelector(".timer")

    this.paymentTimer = setInterval(() => {
      this.timeLeft--

      const minutes = Math.floor(this.timeLeft / 60)
      const seconds = this.timeLeft % 60

      timerDisplay.textContent = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`

      // Warning when less than 5 minutes
      if (this.timeLeft <= 300) {
        timerElement.classList.add("warning")
      }

      // Time expired
      if (this.timeLeft <= 0) {
        this.handlePaymentTimeout()
      }
    }, 1000)
  }

  startPaymentStatusCheck() {
    // Simulate payment status checking every 5 seconds
    this.statusCheckInterval = setInterval(() => {
      this.checkPaymentStatus(false)
    }, 5000)
  }

  checkPaymentStatus(manual = true) {
    if (this.paymentStatus !== "waiting") return

    const checkBtn = document.querySelector(".check-payment-btn")
    if (manual && checkBtn) {
      checkBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Checking...'
      checkBtn.disabled = true
    }

    // Simulate API call delay
    setTimeout(() => {
      // Higher success rate for manual checks (70% success)
      // Lower success rate for auto checks (5% success) to simulate real payment timing
      const isSuccess = manual ? Math.random() > 0.3 : Math.random() > 0.95

      if (isSuccess) {
        this.handlePaymentSuccess()
      } else if (manual) {
        this.showPaymentPending()
      }

      if (manual && checkBtn) {
        checkBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Cek Status Pembayaran'
        checkBtn.disabled = false
      }
    }, 2000)
  }

  // Update the payment success handler to properly integrate with admin
  handlePaymentSuccess() {
    this.paymentStatus = "success"
    clearInterval(this.paymentTimer)
    clearInterval(this.statusCheckInterval)

    // Update payment status display
    const statusContainer = document.getElementById("paymentStatus")
    statusContainer.innerHTML = `
            <div class="status-success">
                <i class="fas fa-check-circle" style="font-size: 3rem; margin-bottom: 1rem; color: #27ae60;"></i>
                <h4>Pembayaran Berhasil!</h4>
                <p>Transaksi Anda telah dikonfirmasi</p>
                <p>Order ID: <strong>${this.transactionId}</strong></p>
            </div>
        `

    // Create order in admin system with proper data structure
    const orderData = {
      customerName: "Customer QRIS",
      customerPhone: "-",
      customerEmail: "-",
      tableNumber: 0, // For takeaway/pickup orders
      items: this.orderData.items,
      total: this.orderData.total,
      status: "confirmed",
      paymentMethod: "QRIS",
      paymentStatus: "paid",
      transactionId: this.transactionId,
      orderType: "pickup", // pickup or dine-in
      notes: "Paid via QRIS",
      createdAt: new Date().toISOString(),
    }

    // Add order to admin system
    if (window.adminData) {
      const addedOrder = window.adminData.addOrder(orderData)
      console.log("Order added to admin system:", addedOrder)

      // Trigger notification for admin
      this.triggerAdminNotification(addedOrder)
    }

    // Clear cart
    localStorage.removeItem("customerCart")

    // Show success modal
    setTimeout(() => {
      this.showSuccessModal()
    }, 1500)
  }

  // Add method to trigger admin notifications
  triggerAdminNotification(order) {
    // Create notification for admin
    const notification = {
      id: Date.now().toString(),
      type: "new_order",
      title: "Pesanan Baru",
      message: `Pesanan baru dari ${order.customerName} - ${window.adminData.formatCurrency(order.total)}`,
      orderId: order.id,
      timestamp: new Date().toISOString(),
      read: false,
      priority: "high",
    }

    // Save notification to localStorage
    let notifications = JSON.parse(localStorage.getItem("asCafeNotifications") || "[]")
    notifications.unshift(notification)

    // Keep only last 50 notifications
    if (notifications.length > 50) {
      notifications = notifications.slice(0, 50)
    }

    localStorage.setItem("asCafeNotifications", JSON.stringify(notifications))

    console.log("Admin notification created:", notification)
  }

  handlePaymentTimeout() {
    this.paymentStatus = "expired"
    clearInterval(this.paymentTimer)
    clearInterval(this.statusCheckInterval)

    const statusContainer = document.getElementById("paymentStatus")
    statusContainer.innerHTML = `
            <div class="status-failed">
                <i class="fas fa-clock" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                <h4>Waktu Pembayaran Habis</h4>
                <p>Silakan buat pesanan baru</p>
            </div>
        `

    setTimeout(() => {
      this.showFailedModal("Waktu pembayaran telah habis. Silakan buat pesanan baru.")
    }, 2000)
  }

  showPaymentPending() {
    this.showNotification("Pembayaran belum diterima. Silakan coba lagi.", "warning")
  }

  showSuccessModal() {
    const modal = document.getElementById("successModal")
    document.getElementById("transactionId").textContent = this.transactionId
    document.getElementById("transactionTime").textContent = new Date().toLocaleString("id-ID")
    const adminData = window.adminData // Access adminData from the global scope
    document.getElementById("transactionAmount").textContent = adminData.formatCurrency(this.orderData.total)
    modal.style.display = "block"
  }

  showFailedModal(reason) {
    const modal = document.getElementById("failedModal")
    document.getElementById("failureReason").textContent = reason
    modal.style.display = "block"
  }

  setupEventListeners() {
    // Close modals when clicking outside
    window.addEventListener("click", (event) => {
      const successModal = document.getElementById("successModal")
      const failedModal = document.getElementById("failedModal")

      if (event.target === successModal) {
        successModal.style.display = "none"
      }
      if (event.target === failedModal) {
        failedModal.style.display = "none"
      }
    })
  }

  downloadReceipt() {
    // Generate receipt data
    const receiptData = {
      merchantName: "AS CAFE",
      transactionId: this.transactionId,
      timestamp: new Date().toLocaleString("id-ID"),
      items: this.orderData.items,
      subtotal: this.orderData.subtotal,
      tax: this.orderData.tax,
      serviceFee: this.orderData.serviceFee,
      total: this.orderData.total,
      paymentMethod: "QRIS",
    }

    // Create receipt content
    let receiptContent = `
=================================
           AS CAFE
=================================
Transaction ID: ${receiptData.transactionId}
Date: ${receiptData.timestamp}
Payment: ${receiptData.paymentMethod}
=================================

ITEMS:
`

    receiptData.items.forEach((item) => {
      receiptContent += `${item.name}\n`
      const adminData = window.adminData // Access adminData from the global scope
      receiptContent += `  ${item.quantity}x ${adminData.formatCurrency(item.price)} = ${adminData.formatCurrency(item.price * item.quantity)}\n`
    })

    receiptContent += `
---------------------------------
Subtotal: ${adminData.formatCurrency(receiptData.subtotal)}
Tax (10%): ${adminData.formatCurrency(receiptData.tax)}
Service (5%): ${adminData.formatCurrency(receiptData.serviceFee)}
---------------------------------
TOTAL: ${adminData.formatCurrency(receiptData.total)}
=================================

Thank you for your purchase!
Visit us again at AS CAFE
        `

    // Download as text file
    const blob = new Blob([receiptContent], { type: "text/plain" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `receipt-${this.transactionId}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)

    this.showNotification("Receipt downloaded successfully!", "success")
  }

  retryPayment() {
    // Reset payment state
    this.paymentStatus = "waiting"
    this.timeLeft = 15 * 60

    // Hide failed modal
    document.getElementById("failedModal").style.display = "none"

    // Regenerate QR code
    this.generateQRCode()

    // Restart timer
    this.startTimer()
    this.startPaymentStatusCheck()

    // Reset status display
    const statusContainer = document.getElementById("paymentStatus")
    statusContainer.innerHTML = `
            <div class="status-waiting">
                <div class="loading-spinner"></div>
                <h4>Menunggu Pembayaran</h4>
                <p>Silakan scan QR code dan selesaikan pembayaran</p>
            </div>
        `
  }

  goBack() {
    if (this.paymentTimer) clearInterval(this.paymentTimer)
    if (this.statusCheckInterval) clearInterval(this.statusCheckInterval)

    // Go back to previous page or menu
    if (document.referrer) {
      window.history.back()
    } else {
      window.location.href = "customer-menu.html"
    }
  }

  goToHome() {
    window.location.href = "customer-menu.html"
  }

  showNotification(message, type = "info") {
    const notification = document.createElement("div")
    notification.className = `notification notification-${type}`
    notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: ${type === "success" ? "#27ae60" : type === "error" ? "#e74c3c" : type === "warning" ? "#f39c12" : "#3498db"};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            z-index: 1003;
            transform: translateX(400px);
            transition: transform 0.3s;
        `
    notification.textContent = message

    document.body.appendChild(notification)

    setTimeout(() => {
      notification.style.transform = "translateX(0)"
    }, 100)

    setTimeout(() => {
      notification.style.transform = "translateX(400px)"
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification)
        }
      }, 300)
    }, 3000)
  }
}

// Global functions for HTML onclick events
function goBack() {
  qrisPayment.goBack()
}

function checkPaymentStatus() {
  qrisPayment.checkPaymentStatus(true)
}

function downloadReceipt() {
  qrisPayment.downloadReceipt()
}

function retryPayment() {
  qrisPayment.retryPayment()
}

function goToHome() {
  qrisPayment.goToHome()
}

// Initialize QRIS payment system
let qrisPayment
document.addEventListener("DOMContentLoaded", () => {
  qrisPayment = new QRISPayment()
  window.adminData = {
    // Mock adminData for demonstration
    formatCurrency: (amount) => {
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
      }).format(amount)
    },
    addOrder: (order) => {
      console.log("Order added:", order)
    },
  }
  window.QRCode = require("qrcodejs")
})