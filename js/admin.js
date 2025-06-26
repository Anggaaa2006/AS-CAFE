document.addEventListener("DOMContentLoaded", () => {
  // Sidebar toggle functionality
  const sidebarToggle = document.querySelector(".sidebar-toggle")
  const sidebar = document.querySelector(".admin-sidebar")

  if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener("click", () => {
      sidebar.classList.toggle("active")
    })

    // Close sidebar when clicking outside on mobile
    document.addEventListener("click", (e) => {
      if (window.innerWidth <= 992) {
        if (!sidebar.contains(e.target) && !sidebarToggle.contains(e.target)) {
          sidebar.classList.remove("active")
        }
      }
    })
  }

  // Active navigation highlighting
  const currentPage = window.location.pathname.split("/").pop()
  const navLinks = document.querySelectorAll(".sidebar-nav a")

  navLinks.forEach((link) => {
    const href = link.getAttribute("href")
    if (href === currentPage) {
      link.parentElement.classList.add("active")
    }
  })

  // Notification functionality
  const notificationBtn = document.querySelector(".notification-btn")
  if (notificationBtn) {
    notificationBtn.addEventListener("click", () => {
      // Show notifications dropdown
      showNotifications()
    })
  }

  // Data table functionality
  initializeDataTables()

  // Form validation
  initializeFormValidation()

  // Search functionality
  initializeSearch()
})

function showNotifications() {
  // Create notifications dropdown
  const dropdown = document.createElement("div")
  dropdown.className = "notifications-dropdown"
  dropdown.innerHTML = `
    <div class="notification-header">
      <h4>Notifikasi</h4>
      <button class="mark-all-read">Tandai Semua Dibaca</button>
    </div>
    <div class="notification-list">
      <div class="notification-item unread">
        <i class="fas fa-shopping-cart"></i>
        <div class="notification-content">
          <p>Pesanan baru dari Budi Santoso</p>
          <small>2 menit yang lalu</small>
        </div>
      </div>
      <div class="notification-item unread">
        <i class="fas fa-star"></i>
        <div class="notification-content">
          <p>Review baru: 5 bintang</p>
          <small>5 menit yang lalu</small>
        </div>
      </div>
      <div class="notification-item">
        <i class="fas fa-user"></i>
        <div class="notification-content">
          <p>Pengguna baru mendaftar</p>
          <small>10 menit yang lalu</small>
        </div>
      </div>
    </div>
    <div class="notification-footer">
      <a href="#">Lihat Semua Notifikasi</a>
    </div>
  `

  // Position and show dropdown
  const notificationBtn = document.querySelector(".notification-btn")
  const rect = notificationBtn.getBoundingClientRect()

  dropdown.style.position = "fixed"
  dropdown.style.top = rect.bottom + 10 + "px"
  dropdown.style.right = window.innerWidth - rect.right + "px"
  dropdown.style.zIndex = "1000"

  document.body.appendChild(dropdown)

  // Add styles
  const styles = document.createElement("style")
  styles.textContent = `
    .notifications-dropdown {
      background: #fff;
      border-radius: 8px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.2);
      width: 350px;
      max-height: 400px;
      overflow-y: auto;
    }
    
    .notification-header {
      padding: 15px 20px;
      border-bottom: 1px solid #e9ecef;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .notification-header h4 {
      margin: 0;
      color: #2c3e50;
    }
    
    .mark-all-read {
      background: none;
      border: none;
      color: #c8a97e;
      cursor: pointer;
      font-size: 0.9rem;
    }
    
    .notification-item {
      padding: 15px 20px;
      border-bottom: 1px solid #f8f9fa;
      display: flex;
      align-items: flex-start;
      gap: 12px;
      transition: background-color 0.3s ease;
    }
    
    .notification-item:hover {
      background-color: #f8f9fa;
    }
    
    .notification-item.unread {
      background-color: #f0f8ff;
    }
    
    .notification-item i {
      color: #c8a97e;
      margin-top: 2px;
    }
    
    .notification-content p {
      margin: 0 0 5px 0;
      color: #2c3e50;
      font-size: 0.9rem;
    }
    
    .notification-content small {
      color: #6c757d;
      font-size: 0.8rem;
    }
    
    .notification-footer {
      padding: 15px 20px;
      text-align: center;
      border-top: 1px solid #e9ecef;
    }
    
    .notification-footer a {
      color: #c8a97e;
      text-decoration: none;
      font-weight: 600;
    }
  `
  document.head.appendChild(styles)

  // Close dropdown when clicking outside
  setTimeout(() => {
    document.addEventListener("click", function closeDropdown(e) {
      if (!dropdown.contains(e.target) && !notificationBtn.contains(e.target)) {
        document.body.removeChild(dropdown)
        document.head.removeChild(styles)
        document.removeEventListener("click", closeDropdown)
      }
    })
  }, 100)
}

function initializeDataTables() {
  // Add sorting functionality to tables
  const tables = document.querySelectorAll(".data-table table, .orders-table table")

  tables.forEach((table) => {
    const headers = table.querySelectorAll("th")

    headers.forEach((header, index) => {
      header.style.cursor = "pointer"
      header.addEventListener("click", () => {
        sortTable(table, index)
      })
    })
  })
}

function sortTable(table, columnIndex) {
  const tbody = table.querySelector("tbody")
  const rows = Array.from(tbody.querySelectorAll("tr"))

  const isAscending = table.getAttribute("data-sort-direction") !== "asc"
  table.setAttribute("data-sort-direction", isAscending ? "asc" : "desc")

  rows.sort((a, b) => {
    const aValue = a.cells[columnIndex].textContent.trim()
    const bValue = b.cells[columnIndex].textContent.trim()

    if (!isNaN(aValue) && !isNaN(bValue)) {
      return isAscending ? aValue - bValue : bValue - aValue
    }

    return isAscending ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
  })

  rows.forEach((row) => tbody.appendChild(row))
}

function initializeFormValidation() {
  const forms = document.querySelectorAll("form")

  forms.forEach((form) => {
    form.addEventListener("submit", (e) => {
      if (!validateForm(form)) {
        e.preventDefault()
      }
    })

    // Real-time validation
    const inputs = form.querySelectorAll("input, select, textarea")
    inputs.forEach((input) => {
      input.addEventListener("blur", () => {
        validateField(input)
      })
    })
  })
}

function validateForm(form) {
  const requiredFields = form.querySelectorAll("[required]")
  let isValid = true

  requiredFields.forEach((field) => {
    if (!validateField(field)) {
      isValid = false
    }
  })

  return isValid
}

function validateField(field) {
  const value = field.value.trim()
  let isValid = true
  let errorMessage = ""

  // Remove existing error
  removeFieldError(field)

  // Required validation
  if (field.hasAttribute("required") && !value) {
    isValid = false
    errorMessage = "Field ini wajib diisi"
  }

  // Email validation
  if (field.type === "email" && value) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(value)) {
      isValid = false
      errorMessage = "Format email tidak valid"
    }
  }

  // Phone validation
  if (field.type === "tel" && value) {
    const phoneRegex = /^[0-9+\-\s()]+$/
    if (!phoneRegex.test(value)) {
      isValid = false
      errorMessage = "Format nomor telepon tidak valid"
    }
  }

  // Show error if invalid
  if (!isValid) {
    showFieldError(field, errorMessage)
  }

  return isValid
}

function showFieldError(field, message) {
  field.style.borderColor = "#dc3545"

  const errorElement = document.createElement("div")
  errorElement.className = "field-error"
  errorElement.textContent = message
  errorElement.style.color = "#dc3545"
  errorElement.style.fontSize = "0.8rem"
  errorElement.style.marginTop = "5px"

  field.parentNode.appendChild(errorElement)
}

function removeFieldError(field) {
  field.style.borderColor = "#ddd"
  const existingError = field.parentNode.querySelector(".field-error")
  if (existingError) {
    existingError.remove()
  }
}

function initializeSearch() {
  const searchInputs = document.querySelectorAll(".search-box input")

  searchInputs.forEach((input) => {
    input.addEventListener("input", (e) => {
      const searchTerm = e.target.value.toLowerCase()
      const table = e.target.closest(".data-table").querySelector("table")
      const rows = table.querySelectorAll("tbody tr")

      rows.forEach((row) => {
        const text = row.textContent.toLowerCase()
        row.style.display = text.includes(searchTerm) ? "" : "none"
      })
    })
  })
}

// Utility functions
function showAlert(message, type = "success") {
  const alert = document.createElement("div")
  alert.className = `alert alert-${type}`
  alert.textContent = message

  alert.style.position = "fixed"
  alert.style.top = "20px"
  alert.style.right = "20px"
  alert.style.padding = "15px 20px"
  alert.style.borderRadius = "5px"
  alert.style.zIndex = "10000"
  alert.style.minWidth = "300px"

  if (type === "success") {
    alert.style.backgroundColor = "#d4edda"
    alert.style.color = "#155724"
    alert.style.border = "1px solid #c3e6cb"
  } else if (type === "error") {
    alert.style.backgroundColor = "#f8d7da"
    alert.style.color = "#721c24"
    alert.style.border = "1px solid #f5c6cb"
  }

  document.body.appendChild(alert)

  setTimeout(() => {
    alert.remove()
  }, 5000)
}

function confirmDelete(message = "Apakah Anda yakin ingin menghapus item ini?") {
  return confirm(message)
}

// Export functions for use in other files
window.adminUtils = {
  showAlert,
  confirmDelete,
  validateForm,
  sortTable,
}