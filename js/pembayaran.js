document.addEventListener("DOMContentLoaded", () => {
  // Load checkout data from localStorage
  const checkoutData = JSON.parse(localStorage.getItem("checkoutData") || "{}")

  // Populate order items
  populateOrderItems(checkoutData.items || [])

  // Set delivery method
  setDeliveryMethod(checkoutData.delivery || "pickup")

  // Form elements
  const checkoutForm = document.getElementById("checkoutForm")
  const deliverySection = document.getElementById("deliverySection")
  const pickupSection = document.getElementById("pickupSection")
  const pickupTimeSelect = document.getElementById("pickupTime")
  const customTimeGroup = document.getElementById("customTimeGroup")
  const paymentMethods = document.querySelectorAll('input[name="paymentMethod"]')

  // Show/hide sections based on delivery method
  function setDeliveryMethod(method) {
    if (method === "delivery") {
      deliverySection.style.display = "block"
      pickupSection.style.display = "none"
      document.getElementById("deliveryFeeRow").style.display = "flex"
      document.getElementById("deliveryMethod").innerHTML = `
        <i class="fas fa-truck"></i>
        <div>
          <strong>Delivery</strong>
          <small>30-45 menit</small>
        </div>
      `
    } else {
      deliverySection.style.display = "none"
      pickupSection.style.display = "block"
      document.getElementById("deliveryFeeRow").style.display = "none"
      document.getElementById("deliveryMethod").innerHTML = `
        <i class="fas fa-store"></i>
        <div>
          <strong>Ambil di Tempat</strong>
          <small>Siap dalam 15-20 menit</small>
        </div>
      `
    }
    updateTotals()
  }

  // Pickup time change handler
  pickupTimeSelect.addEventListener("change", () => {
    if (pickupTimeSelect.value === "custom") {
      customTimeGroup.style.display = "block"
      document.getElementById("customTime").required = true
    } else {
      customTimeGroup.style.display = "none"
      document.getElementById("customTime").required = false
    }
  })

  // Payment method change handlers
  paymentMethods.forEach((method) => {
    method.addEventListener("change", () => {
      hideAllPaymentDetails()

      if (method.value === "transfer") {
        document.getElementById("transferDetails").style.display = "block"
      } else if (method.value === "ewallet") {
        document.getElementById("ewalletDetails").style.display = "block"
      } else if (method.value === "qris") {
        document.getElementById("qrisDetails").style.display = "block"
      }
    })
  })

  function hideAllPaymentDetails() {
    document.getElementById("transferDetails").style.display = "none"
    document.getElementById("ewalletDetails").style.display = "none"
    document.getElementById("qrisDetails").style.display = "none"
  }

  // Populate order items
  function populateOrderItems(items) {
    const orderItemsContainer = document.getElementById("orderItems")
    orderItemsContainer.innerHTML = ""

    items.forEach((item) => {
      const orderItem = document.createElement("div")
      orderItem.className = "order-item"

      const optionsText =
        item.options && item.options.length > 0 ? ` (${item.options.map((opt) => opt.name).join(", ")})` : ""

      orderItem.innerHTML = `
        <div class="item-info">
          <h4>${item.name}</h4>
          <small>${optionsText}</small>
        </div>
        <div class="item-quantity">x${item.quantity}</div>
        <div class="item-price">${item.price}</div>
      `

      orderItemsContainer.appendChild(orderItem)
    })
  }

  // Update totals
  function updateTotals() {
    const subtotal = 195000 // This should be calculated from actual items
    const serviceCharge = 5000
    const deliveryFee = checkoutData.delivery === "delivery" ? 15000 : 0
    const tax = Math.round((subtotal + serviceCharge + deliveryFee) * 0.11)
    const total = subtotal + serviceCharge + deliveryFee + tax

    document.getElementById("subtotalAmount").textContent = `Rp ${subtotal.toLocaleString()}`
    document.getElementById("taxAmount").textContent = `Rp ${tax.toLocaleString()}`
    document.getElementById("totalAmount").textContent = `Rp ${total.toLocaleString()}`
  }

  // Form submission
  checkoutForm.addEventListener("submit", (e) => {
    e.preventDefault()

    // Validate form
    if (!validateForm()) {
      return
    }

    // Collect form data
    const formData = new FormData(checkoutForm)
    const orderData = {
      customer: {
        firstName: formData.get("firstName"),
        lastName: formData.get("lastName"),
        email: formData.get("email"),
        phone: formData.get("phone"),
      },
      delivery: {
        method: checkoutData.delivery,
        address: formData.get("address"),
        city: formData.get("city"),
        postalCode: formData.get("postalCode"),
        notes: formData.get("notes"),
        pickupTime: formData.get("pickupTime"),
        customTime: formData.get("customTime"),
      },
      payment: {
        method: formData.get("paymentMethod"),
      },
      items: checkoutData.items,
      total: document.getElementById("totalAmount").textContent,
      orderDate: new Date().toISOString(),
      orderId: generateOrderId(),
      status: "pending",
    }

    // Save order to localStorage
    const orders = JSON.parse(localStorage.getItem("orders") || "[]")
    orders.push(orderData)
    localStorage.setItem("orders", JSON.stringify(orders))

    // Clear cart
    localStorage.removeItem("cartItems")
    localStorage.removeItem("checkoutData")

    // Show success message and redirect
    showSuccessMessage(orderData.orderId)
  })

  // Form validation - update this section
  function validateForm() {
    const requiredFields = checkoutForm.querySelectorAll("[required]")
    let isValid = true

    requiredFields.forEach((field) => {
      if (!field.value.trim()) {
        field.style.borderColor = "#ff4757"
        isValid = false
      } else {
        field.style.borderColor = "#ddd"
      }
    })

    // Update button state
    const submitButton = document.querySelector(".place-order-btn")
    if (isValid) {
      submitButton.disabled = false
      submitButton.style.opacity = "1"
      submitButton.style.cursor = "pointer"
    } else {
      submitButton.disabled = true
      submitButton.style.opacity = "0.6"
      submitButton.style.cursor = "not-allowed"
    }

    return isValid
  }

  // Add real-time validation
  document.addEventListener("input", (e) => {
    if (e.target.closest("#checkoutForm")) {
      validateForm()
    }
  })

  // Initialize validation on page load
  document.addEventListener("DOMContentLoaded", () => {
    validateForm() // Check initial state
  })

  function generateOrderId() {
    const timestamp = Date.now().toString(36)
    const random = Math.random().toString(36).substr(2, 5)
    return `AS${timestamp}${random}`.toUpperCase()
  }

  function showSuccessMessage(orderId) {
    // Create success modal
    const modal = document.createElement("div")
    modal.className = "success-modal"
    modal.innerHTML = `
    <div class="modal-content">
      <div class="success-icon">
        <i class="fas fa-check-circle"></i>
      </div>
      <h2>Pesanan Berhasil Dibuat!</h2>
      <p>Nomor pesanan Anda: <strong>${orderId}</strong></p>
      <p>Kami akan segera memproses pesanan Anda. Terima kasih telah mempercayai AS CAFE!</p>
      <div class="modal-buttons">
        <button onclick="window.location.href='pesanan-saya.html'" class="btn btn-primary">
          Lihat Pesanan Saya
        </button>
        <button onclick="window.location.href='index.html'" class="btn btn-secondary">
          Kembali ke Beranda
        </button>
      </div>
    </div>
  `

    document.body.appendChild(modal)

    // Add modal styles
    const modalStyles = document.createElement("style")
    modalStyles.textContent = `
      .success-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
      }
      
      .modal-content {
        background-color: #fff;
        padding: 40px;
        border-radius: 10px;
        text-align: center;
        max-width: 500px;
        margin: 20px;
      }
      
      .success-icon {
        font-size: 4rem;
        color: #28a745;
        margin-bottom: 20px;
      }
      
      .modal-content h2 {
        margin-bottom: 20px;
        color: #333;
      }
      
      .modal-content p {
        margin-bottom: 15px;
        color: #666;
      }
      
      .modal-buttons {
        display: flex;
        gap: 15px;
        justify-content: center;
        margin-top: 30px;
      }
      
      .modal-buttons .btn {
        padding: 12px 25px;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        font-weight: 600;
        transition: all 0.3s ease;
      }
      
      .modal-buttons .btn-primary {
        background-color: #c8a97e;
        color: #fff;
      }
      
      .modal-buttons .btn-secondary {
        background-color: #6c757d;
        color: #fff;
      }
    `
    document.head.appendChild(modalStyles)
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

  // Initialize
  updateTotals()
})
