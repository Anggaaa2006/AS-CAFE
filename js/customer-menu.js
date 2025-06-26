// Customer Menu functionality
let cart = []
let currentItem = null
let modalQuantity = 1

// Assuming adminData is defined elsewhere, e.g., in a separate script file
// or as a global variable. If not, you'll need to import or define it here.
// For example:
// import adminData from './admin-data'; // If it's an ES module
// Or:
const adminData = window.adminData // If it's a global variable

document.addEventListener("DOMContentLoaded", () => {
  loadCategories()
  loadMenu()
  setupEventListeners()
  loadCart()
})

function setupEventListeners() {
  // Cart icon click
  document.querySelector(".cart-icon").addEventListener("click", toggleCart)

  // Modal close on outside click
  window.addEventListener("click", (event) => {
    const modal = document.getElementById("itemModal")
    if (event.target === modal) {
      closeItemModal()
    }
  })
}

function loadCategories() {
  const categories = adminData.getCategories()
  const filterContainer = document.getElementById("categoryFilters")

  // Keep the "All Items" button and add categories
  const allButton = filterContainer.querySelector('[data-category="all"]')

  categories
    .sort((a, b) => a.order - b.order)
    .forEach((category) => {
      const button = document.createElement("button")
      button.className = "filter-btn"
      button.setAttribute("data-category", category.id)
      button.innerHTML = `
                <i class="${category.icon}" style="color: ${category.color}"></i>
                ${category.name}
            `
      button.addEventListener("click", () => filterByCategory(category.id))
      filterContainer.appendChild(button)
    })
}

function loadMenu() {
  const menu = adminData.getMenu()
  const availableMenu = menu.filter((item) => item.available)
  displayMenu(availableMenu)
}

function displayMenu(menuItems) {
  const menuGrid = document.getElementById("menuGrid")

  if (menuItems.length === 0) {
    menuGrid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-utensils"></i>
                <h3>No items available</h3>
                <p>Please check back later</p>
            </div>
        `
    return
  }

  menuGrid.innerHTML = menuItems
    .map((item) => {
      const category = adminData.getCategoryById(item.categoryId)
      return `
            <div class="menu-item" onclick="openItemModal('${item.id}')">
                <div class="menu-item-image">
                    <img src="${item.image || "/placeholder.svg?height=200&width=300"}" alt="${item.name}">
                    <div class="menu-badges">
                        ${item.recommended ? '<span class="badge badge-recommended">Recommended</span>' : ""}
                        ${item.spicy ? '<span class="badge badge-spicy">🌶️ Spicy</span>' : ""}
                        ${item.vegetarian ? '<span class="badge badge-vegetarian">🌱 Vegetarian</span>' : ""}
                    </div>
                </div>
                <div class="menu-item-content">
                    <div class="menu-item-header">
                        <h3 class="menu-item-name">${item.name}</h3>
                        <div class="menu-item-price">${adminData.formatCurrency(item.price)}</div>
                    </div>
                    
                    ${
                      category
                        ? `
                        <div class="menu-item-category" style="color: ${category.color}">
                            <i class="${category.icon}"></i>
                            ${category.name}
                        </div>
                    `
                        : ""
                    }
                    
                    <p class="menu-item-description">${item.description}</p>
                    
                    ${
                      item.calories || item.preparationTime
                        ? `
                        <div class="menu-item-meta">
                            ${item.calories ? `<span><i class="fas fa-fire"></i> ${item.calories} cal</span>` : ""}
                            ${item.preparationTime ? `<span><i class="fas fa-clock"></i> ${item.preparationTime} min</span>` : ""}
                        </div>
                    `
                        : ""
                    }
                    
                    ${
                      item.tags
                        ? `
                        <div class="menu-item-tags">
                            ${item.tags
                              .split(",")
                              .map((tag) => `<span class="tag">${tag.trim()}</span>`)
                              .join("")}
                        </div>
                    `
                        : ""
                    }
                    
                    <button class="add-to-cart" onclick="event.stopPropagation(); addToCart('${item.id}')">
                        <i class="fas fa-plus"></i> Add to Cart
                    </button>
                </div>
            </div>
        `
    })
    .join("")
}

function filterByCategory(categoryId) {
  // Update active button
  document.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.classList.remove("active")
  })

  if (categoryId === "all") {
    document.querySelector('[data-category="all"]').classList.add("active")
    loadMenu()
  } else {
    document.querySelector(`[data-category="${categoryId}"]`).classList.add("active")
    const menu = adminData.getMenu()
    const filteredMenu = menu.filter((item) => item.available && item.categoryId === categoryId)
    displayMenu(filteredMenu)
  }
}

function openItemModal(itemId) {
  const menu = adminData.getMenu()
  const item = menu.find((m) => m.id === itemId)

  if (!item) return

  currentItem = item
  modalQuantity = 1

  const category = adminData.getCategoryById(item.categoryId)

  document.getElementById("modalItemName").textContent = item.name
  document.getElementById("modalItemImage").src = item.image || "/placeholder.svg?height=300&width=400"
  document.getElementById("modalItemDescription").textContent = item.description
  document.getElementById("modalItemPrice").textContent = adminData.formatCurrency(item.price)
  document.getElementById("modalQuantity").textContent = modalQuantity

  // Meta information
  let metaHtml = ""
  if (item.calories) metaHtml += `<span><i class="fas fa-fire"></i> ${item.calories} calories</span>`
  if (item.preparationTime) metaHtml += `<span><i class="fas fa-clock"></i> ${item.preparationTime} minutes</span>`
  if (item.ingredients) metaHtml += `<span><i class="fas fa-leaf"></i> ${item.ingredients}</span>`
  if (category)
    metaHtml += `<span style="color: ${category.color}"><i class="${category.icon}"></i> ${category.name}</span>`
  document.getElementById("modalItemMeta").innerHTML = metaHtml

  // Tags
  let tagsHtml = ""
  if (item.recommended) tagsHtml += '<span class="badge badge-recommended">Recommended</span>'
  if (item.spicy) tagsHtml += '<span class="badge badge-spicy">🌶️ Spicy</span>'
  if (item.vegetarian) tagsHtml += '<span class="badge badge-vegetarian">🌱 Vegetarian</span>'
  if (item.tags) {
    tagsHtml += item.tags
      .split(",")
      .map((tag) => `<span class="tag">${tag.trim()}</span>`)
      .join("")
  }
  document.getElementById("modalItemTags").innerHTML = tagsHtml

  document.getElementById("itemModal").style.display = "block"
}

function closeItemModal() {
  document.getElementById("itemModal").style.display = "none"
  currentItem = null
  modalQuantity = 1
}

function increaseQuantity() {
  modalQuantity++
  document.getElementById("modalQuantity").textContent = modalQuantity
}

function decreaseQuantity() {
  if (modalQuantity > 1) {
    modalQuantity--
    document.getElementById("modalQuantity").textContent = modalQuantity
  }
}

function addToCart(itemId, quantity = 1) {
  const menu = adminData.getMenu()
  const item = menu.find((m) => m.id === itemId)

  if (!item || !item.available) return

  const existingItem = cart.find((cartItem) => cartItem.id === itemId)

  if (existingItem) {
    existingItem.quantity += quantity
  } else {
    cart.push({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
      quantity: quantity,
    })
  }

  updateCartDisplay()
  saveCart()

  // Show success feedback
  showNotification(`${item.name} added to cart!`, "success")
}

function addToCartFromModal() {
  if (currentItem) {
    addToCart(currentItem.id, modalQuantity)
    closeItemModal()
  }
}

function removeFromCart(itemId) {
  cart = cart.filter((item) => item.id !== itemId)
  updateCartDisplay()
  saveCart()
}

function updateCartQuantity(itemId, newQuantity) {
  const item = cart.find((cartItem) => cartItem.id === itemId)
  if (item) {
    if (newQuantity <= 0) {
      removeFromCart(itemId)
    } else {
      item.quantity = newQuantity
      updateCartDisplay()
      saveCart()
    }
  }
}

function updateCartDisplay() {
  const cartCount = document.getElementById("cartCount")
  const cartItems = document.getElementById("cartItems")
  const cartTotal = document.getElementById("cartTotal")

  // Update cart count
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)
  cartCount.textContent = totalItems
  cartCount.style.display = totalItems > 0 ? "flex" : "none"

  // Update cart items
  if (cart.length === 0) {
    cartItems.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-shopping-cart"></i>
                <h3>Your cart is empty</h3>
                <p>Add some delicious items!</p>
            </div>
        `
  } else {
    cartItems.innerHTML = cart
      .map(
        (item) => `
            <div class="cart-item">
                <div class="cart-item-image">
                    <img src="${item.image || "/placeholder.svg?height=60&width=60"}" alt="${item.name}">
                </div>
                <div class="cart-item-details">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">${adminData.formatCurrency(item.price)}</div>
                    <div class="cart-item-controls">
                        <button onclick="updateCartQuantity('${item.id}', ${item.quantity - 1})">-</button>
                        <span>${item.quantity}</span>
                        <button onclick="updateCartQuantity('${item.id}', ${item.quantity + 1})">+</button>
                        <button onclick="removeFromCart('${item.id}')" style="margin-left: auto; color: #e74c3c;">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `,
      )
      .join("")
  }

  // Update total
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  cartTotal.textContent = adminData.formatCurrency(total)
}

function toggleCart() {
  const cartSidebar = document.getElementById("cartSidebar")
  cartSidebar.classList.toggle("open")
}

// Update the checkout function to properly handle the payment flow
function checkout() {
  if (cart.length === 0) {
    showNotification("Your cart is empty!", "error")
    return
  }

  // Enable the checkout button and show loading state
  const checkoutBtn = document.querySelector(".checkout-btn")
  if (checkoutBtn) {
    checkoutBtn.disabled = false
    checkoutBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...'
  }

  // Save cart to localStorage for payment page
  saveCart()

  // Add a small delay to show processing state
  setTimeout(() => {
    // Redirect to QRIS payment page
    window.location.href = "payment-qris.html"
  }, 1000)
}

function saveCart() {
  localStorage.setItem("customerCart", JSON.stringify(cart))
}

function loadCart() {
  const savedCart = localStorage.getItem("customerCart")
  if (savedCart) {
    cart = JSON.parse(savedCart)
    updateCartDisplay()
  }
}

function showNotification(message, type = "info") {
  const notification = document.createElement("div")
  notification.className = `notification notification-${type}`
  notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === "success" ? "#27ae60" : type === "error" ? "#e74c3c" : "#3498db"};
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
      document.body.removeChild(notification)
    }, 300)
  }, 3000)
}

// Initialize filter for "All Items"
document.addEventListener("DOMContentLoaded", () => {
  document.querySelector('[data-category="all"]').addEventListener("click", () => filterByCategory("all"))
})