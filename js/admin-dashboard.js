// Import adminData or declare it
import adminData from "./admin-data.js" // Assuming adminData is exported from admin-data.js

// Dashboard functionality
document.addEventListener("DOMContentLoaded", () => {
  loadDashboardStats()
  loadRecentActivities()
})

function loadDashboardStats() {
  const orders = adminData.getOrders()
  const reservations = adminData.getReservations()

  // Calculate today's orders (including QRIS payments)
  const today = new Date().toDateString()
  const todayOrders = orders.filter((order) => new Date(order.createdAt).toDateString() === today)

  // Calculate today's reservations
  const todayDate = new Date().toISOString().split("T")[0]
  const todayReservations = reservations.filter((reservation) => reservation.date === todayDate)

  // Calculate total revenue (including QRIS payments)
  const totalRevenue = orders
    .filter((order) => order.status === "completed" || order.paymentStatus === "paid")
    .reduce((sum, order) => sum + order.total, 0)

  // Calculate active orders (including confirmed QRIS orders)
  const activeOrders = orders.filter((order) => ["pending", "preparing", "ready", "confirmed"].includes(order.status))

  // Update DOM
  document.getElementById("todayOrders").textContent = todayOrders.length
  document.getElementById("todayReservations").textContent = todayReservations.length
  document.getElementById("totalRevenue").textContent = adminData.formatCurrency(totalRevenue)
  document.getElementById("activeOrders").textContent = activeOrders.length
}

function loadRecentActivities() {
  const orders = adminData.getOrders()

  // Load recent orders in table format (including QRIS orders)
  const recentOrdersTable = document.getElementById("recentOrdersTable")
  const recentOrders = orders.slice(0, 5)

  if (recentOrders.length === 0) {
    recentOrdersTable.innerHTML = '<tr><td colspan="7" class="empty-state"><p>Belum ada pesanan</p></td></tr>'
  } else {
    recentOrdersTable.innerHTML = recentOrders
      .map(
        (order) => `
                <tr>
                    <td>#AS${order.id}</td>
                    <td>
                        ${order.customerName}
                        ${order.paymentMethod === "QRIS" ? '<span class="badge badge-qris">QRIS</span>' : ""}
                    </td>
                    <td>${order.items.map((item) => item.name).join(", ")}</td>
                    <td>${adminData.formatCurrency(order.total)}</td>
                    <td>${adminData.getStatusBadge(order.status)}</td>
                    <td>${adminData.formatTime(order.createdAt)}</td>
                    <td>
                        <button class="btn btn-sm btn-primary" onclick="viewOrder('${order.id}')">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-warning" onclick="editOrder('${order.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                    </td>
                </tr>
            `,
      )
      .join("")
  }
}

function viewOrder(orderId) {
  window.location.href = `admin-orders.html?view=${orderId}`
}

function editOrder(orderId) {
  window.location.href = `admin-orders.html?edit=${orderId}`
}

// Add auto-refresh for dashboard every 30 seconds
setInterval(() => {
  loadDashboardStats()
  loadRecentActivities()
}, 30000)
