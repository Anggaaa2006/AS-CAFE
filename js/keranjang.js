document.addEventListener("DOMContentLoaded", () => {
  // Cart functionality
  const cartItems = document.querySelectorAll(".cart-item")
  const checkoutBtn = document.querySelector(".checkout-btn")
  const promoInput = document.getElementById("promoInput")
  const applyPromoBtn = document.getElementById("applyPromo")

  // Update cart totals
  function updateCartTotals() {
    let subtotal = 0
    let itemCount = 0

    cartItems.forEach((item) => {
      if (item.style.display !== "none") {
        const priceElement = item.querySelector(".price")
        const qtyInput = item.querySelector(".qty-input")
        const price = Number.parseInt(priceElement.textContent.replace(/[^\d]/g, ""))
        const quantity = Number.parseInt(qtyInput.value)

        subtotal += price
        itemCount += quantity
      }
    })

    const serviceCharge = 5000
    const tax = Math.round(subtotal * 0.11)
    const total = subtotal + serviceCharge + tax

    // Update summary
    document.querySelector(".summary-row:nth-child(1) span:last-child").textContent = `Rp ${subtotal.toLocaleString()}`
    document.querySelector(".summary-row:nth-child(2) span:last-child").textContent =
      `Rp ${serviceCharge.toLocaleString()}`
    document.querySelector(".summary-row:nth-child(3) span:last-child").textContent = `Rp ${tax.toLocaleString()}`
    document.querySelector(".summary-row.total span:last-child").textContent = `Rp ${total.toLocaleString()}`
    document.querySelector(".summary-row:nth-child(1) span:first-child").textContent = `Subtotal (${itemCount} item)`

    // Update cart count in header
    document.querySelector(".cart-count").textContent = itemCount

    // Check if cart is empty
    const visibleItems = Array.from(cartItems).filter((item) => item.style.display !== "none")
    if (visibleItems.length === 0) {
      showEmptyCart()
    }
  }

  // Quantity controls
  cartItems.forEach((item) => {
    const minusBtn = item.querySelector(".qty-btn.minus")
    const plusBtn = item.querySelector(".qty-btn.plus")
    const qtyInput = item.querySelector(".qty-input")
    const removeBtn = item.querySelector(".remove-btn")

    // Decrease quantity
    minusBtn.addEventListener("click", () => {
      const currentQty = Number.parseInt(qtyInput.value)
      if (currentQty > 1) {
        qtyInput.value = currentQty - 1
        updateItemPrice(item)
        updateCartTotals()
      }
    })

    // Increase quantity
    plusBtn.addEventListener("click", () => {
      const currentQty = Number.parseInt(qtyInput.value)
      qtyInput.value = currentQty + 1
      updateItemPrice(item)
      updateCartTotals()
    })

    // Direct input change
    qtyInput.addEventListener("change", () => {
      if (Number.parseInt(qtyInput.value) < 1) {
        qtyInput.value = 1
      }
      updateItemPrice(item)
      updateCartTotals()
    })

    // Remove item
    removeBtn.addEventListener("click", () => {
      item.style.display = "none"
      updateCartTotals()
      showNotification("Item berhasil dihapus dari keranjang")
    })

    // Option changes
    const radioInputs = item.querySelectorAll('input[type="radio"]')
    const checkboxInputs = item.querySelectorAll('input[type="checkbox"]')

    radioInputs.forEach((radio) => {
      radio.addEventListener("change", () => {
        updateItemPrice(item)
        updateCartTotals()
      })
    })

    checkboxInputs.forEach((checkbox) => {
      checkbox.addEventListener("change", () => {
        updateItemPrice(item)
        updateCartTotals()
      })
    })
  })

  // Update individual item price based on options
  function updateItemPrice(item) {
    const basePrice = getBasePrice(item)
    const quantity = Number.parseInt(item.querySelector(".qty-input").value)
    const selectedOptions = getSelectedOptions(item)

    let totalPrice = basePrice
    selectedOptions.forEach((option) => {
      totalPrice += option.price
    })

    totalPrice *= quantity

    item.querySelector(".price").textContent = `Rp ${totalPrice.toLocaleString()}`
  }

  // Get base price for item
  function getBasePrice(item) {
    const itemName = item.querySelector("h3").textContent
    const basePrices = {
      "Kopi Signature": 35000,
      "Pasta Carbonara": 65000,
      Tiramisu: 45000,
    }
    return basePrices[itemName] || 0
  }

  // Get selected options and their prices
  function getSelectedOptions(item) {
    const options = []

    // Radio options (size)
    const selectedRadio = item.querySelector('input[type="radio"]:checked')
    if (selectedRadio && selectedRadio.value === "large") {
      options.push({ name: "Large", price: 5000 })
    }

    // Checkbox options (extras)
    const selectedCheckboxes = item.querySelectorAll('input[type="checkbox"]:checked')
    selectedCheckboxes.forEach((checkbox) => {
      if (checkbox.value === "cheese") {
        options.push({ name: "Extra Cheese", price: 10000 })
      } else if (checkbox.value === "bacon") {
        options.push({ name: "Extra Bacon", price: 15000 })
      }
    })

    return options
  }

  // Promo code functionality
  applyPromoBtn.addEventListener("click", () => {
    const promoCode = promoInput.value.trim().toUpperCase()
    const validPromoCodes = {
      WELCOME10: { discount: 0.1, description: "Diskon 10%" },
      NEWUSER: { discount: 0.15, description: "Diskon 15%" },
      ASCAFE20: { discount: 0.2, description: "Diskon 20%" },
    }

    if (validPromoCodes[promoCode]) {
      const promo = validPromoCodes[promoCode]
      applyDiscount(promo.discount, promo.description)
      showNotification(`Promo ${promoCode} berhasil diterapkan!`)
      promoInput.value = ""
    } else {
      showNotification("Kode promo tidak valid", "error")
    }
  })

  // Apply discount
  function applyDiscount(discountPercent, description) {
    const subtotalElement = document.querySelector(".summary-row:nth-child(1) span:last-child")
    const subtotal = Number.parseInt(subtotalElement.textContent.replace(/[^\d]/g, ""))
    const discountAmount = Math.round(subtotal * discountPercent)

    // Add discount row if not exists
    let discountRow = document.querySelector(".discount-row")
    if (!discountRow) {
      discountRow = document.createElement("div")
      discountRow.className = "summary-row discount-row"
      discountRow.innerHTML = `<span>${description}</span><span>-Rp ${discountAmount.toLocaleString()}</span>`

      const divider = document.querySelector(".summary-divider")
      divider.parentNode.insertBefore(discountRow, divider)
    } else {
      discountRow.innerHTML = `<span>${description}</span><span>-Rp ${discountAmount.toLocaleString()}</span>`
    }

    updateCartTotals()
  }

  // Delivery option change
  const deliveryOptions = document.querySelectorAll('input[name="delivery"]')
  deliveryOptions.forEach((option) => {
    option.addEventListener("change", () => {
      updateDeliveryFee()
    })
  })

  function updateDeliveryFee() {
    const selectedDelivery = document.querySelector('input[name="delivery"]:checked').value
    const deliveryFee = selectedDelivery === "delivery" ? 15000 : 0

    // Update or add delivery fee row
    let deliveryRow = document.querySelector(".delivery-fee-row")
    if (!deliveryRow && deliveryFee > 0) {
      deliveryRow = document.createElement("div")
      deliveryRow.className = "summary-row delivery-fee-row"

      const serviceRow = document.querySelector(".summary-row:nth-child(2)")
      serviceRow.parentNode.insertBefore(deliveryRow, serviceRow.nextSibling)
    }

    if (deliveryRow) {
      if (deliveryFee > 0) {
        deliveryRow.innerHTML = `<span>Biaya Pengiriman</span><span>Rp ${deliveryFee.toLocaleString()}</span>`
        deliveryRow.style.display = "flex"
      } else {
        deliveryRow.style.display = "none"
      }
    }

    updateCartTotals()
  }

  // Show empty cart
  function showEmptyCart() {
    document.querySelector(".cart-content").style.display = "none"
    document.querySelector(".empty-cart").style.display = "block"
  }

  // Checkout functionality
  checkoutBtn.addEventListener("click", () => {
    // Get cart data
    const cartData = {
      items: getCartItems(),
      delivery: document.querySelector('input[name="delivery"]:checked').value,
      total: document.querySelector(".summary-row.total span:last-child").textContent,
    }

    // Store in localStorage for checkout page
    localStorage.setItem("checkoutData", JSON.stringify(cartData))

    // Redirect to checkout
    window.location.href = "pembayaran.html"
  })

  // Get cart items data
  function getCartItems() {
    const items = []
    cartItems.forEach((item) => {
      if (item.style.display !== "none") {
        const name = item.querySelector("h3").textContent
        const quantity = Number.parseInt(item.querySelector(".qty-input").value)
        const price = item.querySelector(".price").textContent
        const options = getSelectedOptions(item)

        items.push({
          name,
          quantity,
          price,
          options,
        })
      }
    })
    return items
  }

  // Notification function
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

  // Initialize cart totals
  updateCartTotals()
})
