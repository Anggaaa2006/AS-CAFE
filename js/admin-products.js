// Products management functionality
let currentEditingProduct = null

// Assuming adminData is defined elsewhere, likely in another script file.
// For the purpose of this example, we'll declare it here.
// In a real application, ensure it's properly imported or defined.
const adminData = {
  getMenu: () => {
    // Replace with actual data fetching logic
    return [
      {
        id: "1",
        name: "Product 1",
        category: "Category A",
        price: 100,
        description: "Description 1",
        available: true,
        image: "image1.jpg",
      },
      {
        id: "2",
        name: "Product 2",
        category: "Category B",
        price: 200,
        description: "Description 2",
        available: false,
        image: "image2.jpg",
      },
    ]
  },
  formatCurrency: (price) => {
    return `$${price.toFixed(2)}`
  },
  deleteProduct: (productId) => {
    console.log(`Deleting product with ID: ${productId}`)
    // Implement actual deletion logic here
  },
  updateProduct: (productId, productData) => {
    console.log(`Updating product with ID: ${productId}`, productData)
    // Implement actual update logic here
  },
  addProduct: (productData) => {
    console.log("Adding product:", productData)
    // Implement actual add logic here
  },
}

document.addEventListener("DOMContentLoaded", () => {
  loadProducts()
  setupEventListeners()
})

function setupEventListeners() {
  document.getElementById("searchProducts").addEventListener("input", filterProducts)
  document.getElementById("productForm").addEventListener("submit", handleProductSubmit)

  window.addEventListener("click", (event) => {
    const modal = document.getElementById("productModal")
    if (event.target === modal) {
      closeProductModal()
    }
  })
}

function loadProducts() {
  const products = adminData.getMenu()
  displayProducts(products)
}

function displayProducts(products) {
  const container = document.getElementById("productsList")

  if (products.length === 0) {
    container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-box"></i>
                <h3>Belum ada produk</h3>
                <p>Klik tombol "Tambah Produk" untuk menambah produk baru</p>
            </div>
        `
    return
  }

  container.innerHTML = products
    .map(
      (product) => `
        <div class="product-card">
            <div class="product-image">
                <img src="${product.image || "/placeholder.svg?height=200&width=200"}" alt="${product.name}">
                <div class="product-status ${product.available ? "available" : "unavailable"}">
                    ${product.available ? "Tersedia" : "Tidak Tersedia"}
                </div>
            </div>
            <div class="product-info">
                <div class="product-category">${product.category}</div>
                <h3>${product.name}</h3>
                <p>${product.description}</p>
                <div class="product-price">${adminData.formatCurrency(product.price)}</div>
                <div class="product-actions">
                    <button class="btn btn-primary" onclick="editProduct('${product.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-danger" onclick="deleteProduct('${product.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `,
    )
    .join("")
}

function filterProducts() {
  const searchTerm = document.getElementById("searchProducts").value.toLowerCase()
  const categoryFilter = document.getElementById("categoryFilter").value
  const statusFilter = document.getElementById("statusFilter").value
  const products = adminData.getMenu()

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm) || product.category.toLowerCase().includes(searchTerm)
    const matchesCategory = !categoryFilter || product.category === categoryFilter
    const matchesStatus =
      !statusFilter ||
      (statusFilter === "available" && product.available) ||
      (statusFilter === "unavailable" && !product.available)

    return matchesSearch && matchesCategory && matchesStatus
  })

  displayProducts(filteredProducts)
}

function showProductForm() {
  currentEditingProduct = null
  document.getElementById("modalTitle").textContent = "Tambah Produk Baru"
  document.getElementById("productForm").reset()
  document.getElementById("productModal").style.display = "block"
}

function editProduct(productId) {
  const products = adminData.getMenu()
  const product = products.find((p) => p.id === productId)

  if (product) {
    currentEditingProduct = product
    document.getElementById("modalTitle").textContent = "Edit Produk"
    document.getElementById("productName").value = product.name
    document.getElementById("productCategory").value = product.category
    document.getElementById("productPrice").value = product.price
    document.getElementById("productDescription").value = product.description
    document.getElementById("productImage").value = product.image || ""
    document.getElementById("productStatus").value = product.available ? "available" : "unavailable"

    document.getElementById("productModal").style.display = "block"
  }
}

function deleteProduct(productId) {
  if (confirm("Apakah Anda yakin ingin menghapus produk ini?")) {
    adminData.deleteProduct(productId)
    loadProducts()
  }
}

function closeProductModal() {
  document.getElementById("productModal").style.display = "none"
  currentEditingProduct = null
}

function handleProductSubmit(event) {
  event.preventDefault()

  const productData = {
    name: document.getElementById("productName").value,
    category: document.getElementById("productCategory").value,
    price: Number.parseInt(document.getElementById("productPrice").value),
    description: document.getElementById("productDescription").value,
    image: document.getElementById("productImage").value,
    available: document.getElementById("productStatus").value === "available",
  }

  if (currentEditingProduct) {
    adminData.updateProduct(currentEditingProduct.id, productData)
  } else {
    adminData.addProduct(productData)
  }

  closeProductModal()
  loadProducts()
}