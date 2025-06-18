// Menu management functionality
let currentEditingMenu = null
let currentEditingCategory = null

// Assuming adminData is defined elsewhere, possibly in a separate file or inline script
// For example:
// const adminData = { ... };

document.addEventListener("DOMContentLoaded", () => {
  loadMenuStats()
  loadCategories()
  loadMenu()
  setupEventListeners()
})

function setupEventListeners() {
  document.getElementById("searchMenu").addEventListener("input", filterMenu)
  document.getElementById("menuForm").addEventListener("submit", handleMenuSubmit)
  document.getElementById("categoryForm").addEventListener("submit", handleCategorySubmit)

  window.addEventListener("click", (event) => {
    const menuModal = document.getElementById("menuModal")
    const categoryModal = document.getElementById("categoryModal")
    if (event.target === menuModal) {
      closeMenuModal()
    }
    if (event.target === categoryModal) {
      closeCategoryModal()
    }
  })
}

function loadMenuStats() {
  const menu = adminData.getMenu()
  const categories = adminData.getCategories()
  const orders = adminData.getOrders()

  const totalMenuItems = menu.length
  const availableItems = menu.filter((item) => item.available).length
  const totalCategories = categories.length

  // Find most popular item from orders
  const itemSales = {}
  orders.forEach((order) => {
    order.items.forEach((item) => {
      itemSales[item.name] = (itemSales[item.name] || 0) + item.quantity
    })
  })

  const popularItem =
    Object.keys(itemSales).length > 0
      ? Object.keys(itemSales).reduce((a, b) => (itemSales[a] > itemSales[b] ? a : b))
      : "-"

  document.getElementById("totalMenuItems").textContent = totalMenuItems
  document.getElementById("availableItems").textContent = availableItems
  document.getElementById("totalCategories").textContent = totalCategories
  document.getElementById("popularItem").textContent = popularItem
}

function loadCategories() {
  const categories = adminData.getCategories()
  displayCategories(categories)
  updateCategoryFilters(categories)
}

function displayCategories(categories) {
  const container = document.getElementById("categoriesList")

  if (categories.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-tags"></i>
        <h3>Belum ada kategori</h3>
        <p>Tambah kategori untuk mengorganisir menu</p>
      </div>
    `
    return
  }

  container.innerHTML = categories
    .sort((a, b) => a.order - b.order)
    .map(
      (category) => `
        <div class="category-card" style="border-left: 4px solid ${category.color}">
          <div class="category-header">
            <div class="category-icon" style="color: ${category.color}">
              <i class="${category.icon}"></i>
            </div>
            <div class="category-info">
              <h4>${category.name}</h4>
              <p>${category.description}</p>
            </div>
            <div class="category-actions">
              <button class="btn btn-sm btn-primary" onclick="editCategory('${category.id}')">
                <i class="fas fa-edit"></i>
              </button>
              <button class="btn btn-sm btn-danger" onclick="deleteCategory('${category.id}')">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
          <div class="category-stats">
            <span class="menu-count">${getMenuCountByCategory(category.id)} menu</span>
          </div>
        </div>
      `,
    )
    .join("")
}

function updateCategoryFilters(categories) {
  const categoryFilter = document.getElementById("categoryFilter")
  const menuCategorySelect = document.getElementById("menuCategory")

  // Update filter dropdown
  categoryFilter.innerHTML =
    '<option value="">Semua Kategori</option>' +
    categories.map((cat) => `<option value="${cat.id}">${cat.name}</option>`).join("")

  // Update menu form category dropdown
  menuCategorySelect.innerHTML =
    '<option value="">Pilih Kategori</option>' +
    categories.map((cat) => `<option value="${cat.id}">${cat.name}</option>`).join("")
}

function getMenuCountByCategory(categoryId) {
  const menu = adminData.getMenu()
  return menu.filter((item) => item.categoryId === categoryId).length
}

function loadMenu() {
  const menu = adminData.getMenu()
  displayMenu(menu)
}

function displayMenu(menu) {
  const container = document.getElementById("menuList")

  if (menu.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-utensils"></i>
        <h3>Belum ada menu</h3>
        <p>Klik tombol "Tambah Menu" untuk menambah menu baru</p>
      </div>
    `
    return
  }

  container.innerHTML = menu
    .map((item) => {
      const category = adminData.getCategoryById(item.categoryId)
      return `
          <div class="menu-item-card">
            <div class="menu-image">
              <img src="${item.image || "/placeholder.svg?height=200&width=200"}" alt="${item.name}">
              <div class="menu-badges">
                ${item.available ? '<span class="badge badge-success">Tersedia</span>' : '<span class="badge badge-danger">Tidak Tersedia</span>'}
                ${item.recommended ? '<span class="badge badge-warning">Rekomendasi</span>' : ""}
                ${item.spicy ? '<span class="badge badge-spicy">🌶️ Pedas</span>' : ""}
                ${item.vegetarian ? '<span class="badge badge-vegetarian">🌱 Vegetarian</span>' : ""}
              </div>
            </div>
            <div class="menu-content">
              <div class="menu-header">
                <h3>${item.name}</h3>
                <div class="menu-price">${adminData.formatCurrency(item.price)}</div>
              </div>
              <div class="menu-category" style="color: ${category?.color || "#95a5a6"}">
                <i class="${category?.icon || "fas fa-utensils"}"></i>
                ${category?.name || "Tanpa Kategori"}
              </div>
              <p class="menu-description">${item.description}</p>
              
              ${
                item.ingredients
                  ? `
                <div class="menu-ingredients">
                  <strong>Bahan:</strong> ${item.ingredients}
                </div>
              `
                  : ""
              }
              
              <div class="menu-meta">
                ${item.calories ? `<span><i class="fas fa-fire"></i> ${item.calories} kal</span>` : ""}
                ${item.preparationTime ? `<span><i class="fas fa-clock"></i> ${item.preparationTime} menit</span>` : ""}
              </div>
              
              ${
                item.tags
                  ? `
                <div class="menu-tags">
                  ${item.tags
                    .split(",")
                    .map((tag) => `<span class="tag">${tag.trim()}</span>`)
                    .join("")}
                </div>
              `
                  : ""
              }
              
              <div class="menu-actions">
                <button class="btn btn-primary" onclick="editMenu('${item.id}')">
                  <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn btn-danger" onclick="deleteMenu('${item.id}')">
                  <i class="fas fa-trash"></i> Hapus
                </button>
                <button class="btn btn-secondary" onclick="toggleMenuStatus('${item.id}')">
                  <i class="fas fa-toggle-${item.available ? "on" : "off"}"></i>
                  ${item.available ? "Nonaktifkan" : "Aktifkan"}
                </button>
              </div>
            </div>
          </div>
        `
    })
    .join("")
}

function filterMenu() {
  const searchTerm = document.getElementById("searchMenu").value.toLowerCase()
  const categoryFilter = document.getElementById("categoryFilter").value
  const statusFilter = document.getElementById("statusFilter").value
  const priceFilter = document.getElementById("priceFilter").value
  const menu = adminData.getMenu()

  const filteredMenu = menu.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm) ||
      item.description.toLowerCase().includes(searchTerm) ||
      (item.ingredients && item.ingredients.toLowerCase().includes(searchTerm))

    const matchesCategory = !categoryFilter || item.categoryId === categoryFilter

    const matchesStatus =
      !statusFilter ||
      (statusFilter === "available" && item.available) ||
      (statusFilter === "unavailable" && !item.available)

    let matchesPrice = true
    if (priceFilter) {
      const price = item.price
      switch (priceFilter) {
        case "0-25000":
          matchesPrice = price < 25000
          break
        case "25000-50000":
          matchesPrice = price >= 25000 && price <= 50000
          break
        case "50000-100000":
          matchesPrice = price >= 50000 && price <= 100000
          break
        case "100000+":
          matchesPrice = price > 100000
          break
      }
    }

    return matchesSearch && matchesCategory && matchesStatus && matchesPrice
  })

  displayMenu(filteredMenu)
}

// Menu CRUD Functions
function showMenuForm() {
  currentEditingMenu = null
  document.getElementById("modalTitle").textContent = "Tambah Menu Baru"
  document.getElementById("menuForm").reset()
  document.getElementById("menuModal").style.display = "block"
}

function editMenu(menuId) {
  const menu = adminData.getMenu()
  const item = menu.find((m) => m.id === menuId)

  if (item) {
    currentEditingMenu = item
    document.getElementById("modalTitle").textContent = "Edit Menu"
    document.getElementById("menuName").value = item.name
    document.getElementById("menuCategory").value = item.categoryId
    document.getElementById("menuPrice").value = item.price
    document.getElementById("menuStatus").value = item.available ? "available" : "unavailable"
    document.getElementById("menuDescription").value = item.description
    document.getElementById("menuImage").value = item.image || ""
    document.getElementById("menuIngredients").value = item.ingredients || ""
    document.getElementById("menuCalories").value = item.calories || ""
    document.getElementById("menuPreparationTime").value = item.preparationTime || ""
    document.getElementById("menuTags").value = item.tags || ""
    document.getElementById("menuSpicy").checked = item.spicy || false
    document.getElementById("menuVegetarian").checked = item.vegetarian || false
    document.getElementById("menuRecommended").checked = item.recommended || false

    document.getElementById("menuModal").style.display = "block"
  }
}

function deleteMenu(menuId) {
  if (confirm("Apakah Anda yakin ingin menghapus menu ini?")) {
    adminData.deleteMenuItem(menuId)
    loadMenuStats()
    loadMenu()
  }
}

function toggleMenuStatus(menuId) {
  const menu = adminData.getMenu()
  const item = menu.find((m) => m.id === menuId)

  if (item) {
    adminData.updateMenuItem(menuId, { available: !item.available })
    loadMenuStats()
    loadMenu()
  }
}

function closeMenuModal() {
  document.getElementById("menuModal").style.display = "none"
  currentEditingMenu = null
}

function handleMenuSubmit(event) {
  event.preventDefault()

  const menuData = {
    name: document.getElementById("menuName").value,
    categoryId: document.getElementById("menuCategory").value,
    price: Number.parseInt(document.getElementById("menuPrice").value),
    available: document.getElementById("menuStatus").value === "available",
    description: document.getElementById("menuDescription").value,
    image: document.getElementById("menuImage").value,
    ingredients: document.getElementById("menuIngredients").value,
    calories: Number.parseInt(document.getElementById("menuCalories").value) || null,
    preparationTime: Number.parseInt(document.getElementById("menuPreparationTime").value) || null,
    tags: document.getElementById("menuTags").value,
    spicy: document.getElementById("menuSpicy").checked,
    vegetarian: document.getElementById("menuVegetarian").checked,
    recommended: document.getElementById("menuRecommended").checked,
  }

  if (currentEditingMenu) {
    adminData.updateMenuItem(currentEditingMenu.id, menuData)
  } else {
    adminData.addMenuItem(menuData)
  }

  closeMenuModal()
  loadMenuStats()
  loadMenu()
}

// Category CRUD Functions
function showCategoryForm() {
  currentEditingCategory = null
  document.getElementById("categoryModalTitle").textContent = "Tambah Kategori Baru"
  document.getElementById("categoryForm").reset()
  document.getElementById("categoryModal").style.display = "block"
}

function editCategory(categoryId) {
  const categories = adminData.getCategories()
  const category = categories.find((c) => c.id === categoryId)

  if (category) {
    currentEditingCategory = category
    document.getElementById("categoryModalTitle").textContent = "Edit Kategori"
    document.getElementById("categoryName").value = category.name
    document.getElementById("categoryDescription").value = category.description
    document.getElementById("categoryIcon").value = category.icon
    document.getElementById("categoryColor").value = category.color
    document.getElementById("categoryOrder").value = category.order

    document.getElementById("categoryModal").style.display = "block"
  }
}

function deleteCategory(categoryId) {
  const menuCount = getMenuCountByCategory(categoryId)

  if (menuCount > 0) {
    alert(`Tidak dapat menghapus kategori ini karena masih ada ${menuCount} menu yang menggunakan kategori ini.`)
    return
  }

  if (confirm("Apakah Anda yakin ingin menghapus kategori ini?")) {
    adminData.deleteCategory(categoryId)
    loadCategories()
    loadMenu()
  }
}

function closeCategoryModal() {
  document.getElementById("categoryModal").style.display = "none"
  currentEditingCategory = null
}

function handleCategorySubmit(event) {
  event.preventDefault()

  const categoryData = {
    name: document.getElementById("categoryName").value,
    description: document.getElementById("categoryDescription").value,
    icon: document.getElementById("categoryIcon").value,
    color: document.getElementById("categoryColor").value,
    order: Number.parseInt(document.getElementById("categoryOrder").value),
  }

  if (currentEditingCategory) {
    adminData.updateCategory(currentEditingCategory.id, categoryData)
  } else {
    adminData.addCategory(categoryData)
  }

  closeCategoryModal()
  loadCategories()
}

function exportMenu() {
  const menu = adminData.getMenu()
  const categories = adminData.getCategories()

  const exportData = {
    menu,
    categories,
    exportDate: new Date().toISOString(),
  }

  const csvContent =
    "data:text/csv;charset=utf-8," +
    "Nama,Kategori,Harga,Status,Deskripsi,Bahan,Kalori,Waktu Persiapan\n" +
    menu
      .map((item) => {
        const category = categories.find((c) => c.id === item.categoryId)
        return `"${item.name}","${category?.name || "Tanpa Kategori"}",${item.price},"${item.available ? "Tersedia" : "Tidak Tersedia"}","${item.description}","${item.ingredients || ""}","${item.calories || ""}","${item.preparationTime || ""}"`
      })
      .join("\n")

  const encodedUri = encodeURI(csvContent)
  const link = document.createElement("a")
  link.setAttribute("href", encodedUri)
  link.setAttribute("download", "menu_ascafe.csv")
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
