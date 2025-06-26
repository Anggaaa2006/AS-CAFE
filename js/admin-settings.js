// Settings management functionality

document.addEventListener("DOMContentLoaded", () => {
  loadSettings()
  setupEventListeners()
})

// Assuming adminData is defined elsewhere, possibly in another script
// For example:
// import { adminData } from './admin-data.js';
// Or:
// const adminData = { ... };

// Mock adminData for demonstration purposes.  In a real application, this would be loaded or imported.
const adminData = {
  getSettings: () => {
    return {
      cafe: {
        name: "AS CAFE",
        address: "Jl. Example No. 123",
        phone: "021-1234567",
        email: "cafe@example.com",
        openTime: "07:00",
        closeTime: "22:00",
      },
      system: {
        currency: "IDR",
        timezone: "Asia/Jakarta",
        language: "id",
      },
      notifications: {
        email: true,
        orders: true,
        reservations: true,
      },
    }
  },
  updateSettings: (section, settings) => {
    console.log(`Settings updated for ${section}:`, settings)
  },
  getOrders: () => [],
  getReservations: () => [],
  getMenu: () => [],
  getArticles: () => [],
  getUsers: () => [],
  saveOrders: (orders) => {},
  saveReservations: (reservations) => {},
  initializeData: () => {
    console.log("Data initialized")
  },
}

function setupEventListeners() {
  document.getElementById("cafeSettingsForm").addEventListener("submit", saveCafeSettings)
  document.getElementById("systemSettingsForm").addEventListener("submit", saveSystemSettings)
  document.getElementById("notificationSettingsForm").addEventListener("submit", saveNotificationSettings)
}

function loadSettings() {
  const settings = adminData.getSettings()

  // Load cafe settings
  if (settings.cafe) {
    document.getElementById("cafeName").value = settings.cafe.name || "AS CAFE"
    document.getElementById("cafeAddress").value = settings.cafe.address || ""
    document.getElementById("cafePhone").value = settings.cafe.phone || ""
    document.getElementById("cafeEmail").value = settings.cafe.email || ""
    document.getElementById("openTime").value = settings.cafe.openTime || "07:00"
    document.getElementById("closeTime").value = settings.cafe.closeTime || "22:00"
  }

  // Load system settings
  if (settings.system) {
    document.getElementById("currency").value = settings.system.currency || "IDR"
    document.getElementById("timezone").value = settings.system.timezone || "Asia/Jakarta"
    document.getElementById("language").value = settings.system.language || "id"
  }

  // Load notification settings
  if (settings.notifications) {
    document.getElementById("emailNotifications").checked = settings.notifications.email !== false
    document.getElementById("orderNotifications").checked = settings.notifications.orders !== false
    document.getElementById("reservationNotifications").checked = settings.notifications.reservations !== false
  }
}

function saveCafeSettings(event) {
  event.preventDefault()

  const cafeSettings = {
    name: document.getElementById("cafeName").value,
    address: document.getElementById("cafeAddress").value,
    phone: document.getElementById("cafePhone").value,
    email: document.getElementById("cafeEmail").value,
    openTime: document.getElementById("openTime").value,
    closeTime: document.getElementById("closeTime").value,
  }

  adminData.updateSettings("cafe", cafeSettings)
  showNotification("Pengaturan cafe berhasil disimpan!", "success")
}

function saveSystemSettings(event) {
  event.preventDefault()

  const systemSettings = {
    currency: document.getElementById("currency").value,
    timezone: document.getElementById("timezone").value,
    language: document.getElementById("language").value,
  }

  adminData.updateSettings("system", systemSettings)
  showNotification("Pengaturan sistem berhasil disimpan!", "success")
}

function saveNotificationSettings(event) {
  event.preventDefault()

  const notificationSettings = {
    email: document.getElementById("emailNotifications").checked,
    orders: document.getElementById("orderNotifications").checked,
    reservations: document.getElementById("reservationNotifications").checked,
  }

  adminData.updateSettings("notifications", notificationSettings)
  showNotification("Pengaturan notifikasi berhasil disimpan!", "success")
}

function exportAllData() {
  if (confirm("Apakah Anda yakin ingin mengexport semua data?")) {
    const allData = {
      orders: adminData.getOrders(),
      reservations: adminData.getReservations(),
      menu: adminData.getMenu(),
      articles: adminData.getArticles(),
      users: adminData.getUsers(),
      settings: adminData.getSettings(),
      exportDate: new Date().toISOString(),
    }

    const dataStr = JSON.stringify(allData, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })

    const link = document.createElement("a")
    link.href = URL.createObjectURL(dataBlob)
    link.download = `ascafe_backup_${new Date().toISOString().split("T")[0]}.json`
    link.click()

    showNotification("Data berhasil diexport!", "success")
  }
}

function clearOldData() {
  if (confirm("Apakah Anda yakin ingin menghapus data lama (lebih dari 30 hari)?")) {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    // Clear old orders
    const orders = adminData.getOrders()
    const recentOrders = orders.filter((order) => new Date(order.createdAt) > thirtyDaysAgo)
    adminData.saveOrders(recentOrders)

    // Clear old reservations
    const reservations = adminData.getReservations()
    const recentReservations = reservations.filter((reservation) => new Date(reservation.createdAt) > thirtyDaysAgo)
    adminData.saveReservations(recentReservations)

    showNotification("Data lama berhasil dihapus!", "success")
  }
}

function resetAllData() {
  if (confirm("PERINGATAN: Ini akan menghapus SEMUA data! Apakah Anda yakin?")) {
    if (confirm("Konfirmasi sekali lagi: Semua data akan hilang permanen!")) {
      localStorage.clear()
      adminData.initializeData()
      showNotification("Semua data berhasil direset!", "warning")
      setTimeout(() => {
        window.location.reload()
      }, 2000)
    }
  }
}

function showNotification(message, type = "info") {
  const notification = document.createElement("div")
  notification.className = `notification notification-${type}`
  notification.innerHTML = `
        <i class="fas fa-${type === "success" ? "check-circle" : type === "warning" ? "exclamation-triangle" : "info-circle"}"></i>
        <span>${message}</span>
    `

  document.body.appendChild(notification)

  setTimeout(() => {
    notification.classList.add("show")
  }, 100)

  setTimeout(() => {
    notification.classList.remove("show")
    setTimeout(() => {
      document.body.removeChild(notification)
    }, 300)
  }, 3000)
}