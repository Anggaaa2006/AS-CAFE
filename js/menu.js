// Menu data
const menuData = {
  coffee: [
    {
      id: 1,
      name: "Kopi Signature",
      price: 35000,
      image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&h=200&fit=crop",
      category: "coffee",
      description: "Kopi premium dengan cita rasa khas AS CAFE",
    },
    {
      id: 2,
      name: "Cappuccino",
      price: 28000,
      image: "https://images.unsplash.com/photo-1534778101976-62847782c213?w=300&h=200&fit=crop",
      category: "coffee",
      description: "Espresso dengan foam susu yang creamy",
    },
    {
      id: 3,
      name: "Cold Brew",
      price: 32000,
      image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=300&h=200&fit=crop",
      category: "coffee",
      description: "Kopi dingin dengan ekstraksi lambat",
    },
  ],
  food: [
    {
      id: 4,
      name: "Pasta Carbonara",
      price: 65000,
      image: "https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=300&h=200&fit=crop",
      category: "food",
      description: "Pasta dengan saus krim dan bacon",
    },
    {
      id: 5,
      name: "Nasi Goreng Special",
      price: 45000,
      image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=300&h=200&fit=crop",
      category: "food",
      description: "Nasi goreng dengan telur dan ayam",
    },
  ],
  dessert: [
    {
      id: 6,
      name: "Tiramisu",
      price: 45000,
      image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=300&h=200&fit=crop",
      category: "dessert",
      description: "Dessert Italia dengan kopi dan mascarpone",
    },
  ],
  drink: [
    {
      id: 7,
      name: "Lemon Tea",
      price: 18000,
      image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=300&h=200&fit=crop",
      category: "drink",
      description: "Teh segar dengan perasan lemon",
    },
  ],
}

// Cart functionality
let cart = JSON.parse(localStorage.getItem("asCart")) || []

// Initialize menu
document.addEventListener("DOMContentLoaded", () => {
  loadMenu()
  updateCartUI()
  setupCategoryFilter()
})

function loadMenu(category = "all") {
  const menuGrid = document.getElementById("menuGrid")
  if (!menuGrid) return

  let allItems = []

  // Combine all menu items
  Object.values(menuData).forEach((categoryItems) => {
    allItems = allItems.concat(categoryItems)
  })

  // Filter by category
  const filteredItems = category === "all" ? allItems : allItems.filter((item) => item.category === category)

  menuGrid.innerHTML = filteredItems
    .map(
      (item) => `
    <div class="menu-item" data-category="${item.category}">
      <div class="menu-image">
        <img src="${item.image}" alt="${item.name}" loading="lazy">
      </div>
      <div class="menu-content">
        <h3>${item.name}</h3>
        <p>${item.description}</p>
        <div class="menu-price">Rp ${item.price.toLocaleString("id-ID")}</div>
        <button class="add-to-cart-btn" onclick="addToCart(${item.id})">
          <i class="fas fa-plus"></i>
          Tambah ke Keranjang
        </button>
      </div>
    </div>
  `,
    )
    .join("")
}

function setupCategoryFilter() {
  const filterBtns = document.querySelectorAll(".filter-btn")
  filterBtns.forEach((btn) => {
    btn.addEventListener("click", function () {
      // Remove active class from all buttons
      filterBtns.forEach((b) => b.classList.remove("active"))
      // Add active class to clicked button
      this.classList.add("active")
      // Load menu for selected category
      loadMenu(this.dataset.category)
    })
  })
}

function addToCart(itemId) {
  // Find item in menu data
  let item = null
  Object.values(menuData).forEach((categoryItems) => {
    const found = categoryItems.find((i) => i.id === itemId)
    if (found) item = found
  })

  if (!item) return

  // Check if item already in cart
  const existingItem = cart.find((cartItem) => cartItem.id === itemId)

  if (existingItem) {
    existingItem.quantity += 1
  } else {
    cart.push({
      ...item,
      quantity: 1,
    })
  }

  // Save to localStorage
  localStorage.setItem("asCart", JSON.stringify(cart))

  // Update UI
  updateCartUI()

  // Show success message
  showToast(`${item.name} ditambahkan ke keranjang`)
}

function updateCartUI() {
  const cartCount = document.getElementById("cartCount")
  const cartItems = document.getElementById("cartItems")
  const cartTotal = document.getElementById("cartTotal")
  const checkoutBtn = document.getElementById("checkoutBtn")

  if (!cartCount) return

  // Update cart count
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)
  cartCount.textContent = totalItems

  if (!cartItems) return

  // Update cart items
  if (cart.length === 0) {
    cartItems.innerHTML = '<div class="empty-cart">Keranjang kosong</div>'
    if (cartTotal) cartTotal.textContent = "0"
    if (checkoutBtn) checkoutBtn.disabled = true
    return
  }

  cartItems.innerHTML = cart
    .map(
      (item) => `
    <div class="cart-item">
      <img src="${item.image}" alt="${item.name}">
      <div class="item-details">
        <h4>${item.name}</h4>
        <div class="item-price">Rp ${item.price.toLocaleString("id-ID")}</div>
      </div>
      <div class="quantity-controls">
        <button onclick="updateQuantity(${item.id}, -1)">-</button>
        <span>${item.quantity}</span>
        <button onclick="updateQuantity(${item.id}, 1)">+</button>
      </div>
      <button class="remove-item" onclick="removeFromCart(${item.id})">
        <i class="fas fa-trash"></i>
      </button>
    </div>
  `,
    )
    .join("")

  // Update total
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  if (cartTotal) cartTotal.textContent = total.toLocaleString("id-ID")
  if (checkoutBtn) checkoutBtn.disabled = false
}

function updateQuantity(itemId, change) {
  const item = cart.find((cartItem) => cartItem.id === itemId)
  if (!item) return

  item.quantity += change

  if (item.quantity <= 0) {
    removeFromCart(itemId)
    return
  }

  localStorage.setItem("asCart", JSON.stringify(cart))
  updateCartUI()
}

function removeFromCart(itemId) {
  cart = cart.filter((item) => item.id !== itemId)
  localStorage.setItem("asCart", JSON.stringify(cart))
  updateCartUI()
}

function toggleCart() {
  const cartSidebar = document.getElementById("cartSidebar")
  const cartOverlay = document.getElementById("cartOverlay")

  if (cartSidebar && cartOverlay) {
    cartSidebar.classList.toggle("active")
    cartOverlay.classList.toggle("active")
  }
}

function goToCheckout() {
  if (cart.length === 0) return
  window.location.href = "keranjang.html"
}

function showToast(message) {
  // Create toast element
  const toast = document.createElement("div")
  toast.className = "toast"
  toast.textContent = message

  // Add to body
  document.body.appendChild(toast)

  // Show toast
  setTimeout(() => toast.classList.add("show"), 100)

  // Hide and remove toast
  setTimeout(() => {
    toast.classList.remove("show")
    setTimeout(() => {
      if (document.body.contains(toast)) {
        document.body.removeChild(toast)
      }
    }, 300)
  }, 3000)
}
