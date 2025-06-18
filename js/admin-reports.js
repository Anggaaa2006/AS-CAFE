import { Chart } from "@/components/ui/chart"
// Reports functionality
let salesChart, productsChart

document.addEventListener("DOMContentLoaded", () => {
  loadReportStats()
  initializeCharts()
  loadDetailReport()
})

function loadReportStats() {
  const period = document.getElementById("reportPeriod").value
  const orders = adminData.getOrders()
  const filteredOrders = filterOrdersByPeriod(orders, period)
  const completedOrders = filteredOrders.filter((order) => order.status === "completed")

  const periodRevenue = completedOrders.reduce((sum, order) => sum + order.total, 0)
  const periodOrders = filteredOrders.length
  const uniqueCustomers = new Set(completedOrders.map((order) => order.customerName)).size

  // Find best selling product
  const productSales = {}
  completedOrders.forEach((order) => {
    order.items.forEach((item) => {
      productSales[item.name] = (productSales[item.name] || 0) + item.quantity
    })
  })

  const bestProduct = Object.keys(productSales).reduce((a, b) => (productSales[a] > productSales[b] ? a : b), "-")

  document.getElementById("periodRevenue").textContent = adminData.formatCurrency(periodRevenue)
  document.getElementById("periodOrders").textContent = periodOrders
  document.getElementById("periodCustomers").textContent = uniqueCustomers
  document.getElementById("bestProduct").textContent = bestProduct
}

function filterOrdersByPeriod(orders, period) {
  const now = new Date()
  const startDate = new Date()

  switch (period) {
    case "today":
      startDate.setHours(0, 0, 0, 0)
      break
    case "week":
      startDate.setDate(now.getDate() - 7)
      break
    case "month":
      startDate.setMonth(now.getMonth() - 1)
      break
    case "year":
      startDate.setFullYear(now.getFullYear() - 1)
      break
  }

  return orders.filter((order) => new Date(order.createdAt) >= startDate)
}

function initializeCharts() {
  // Sales Chart
  const salesCtx = document.getElementById("salesChart").getContext("2d")
  salesChart = new Chart(salesCtx, {
    type: "line",
    data: {
      labels: [],
      datasets: [
        {
          label: "Penjualan",
          data: [],
          borderColor: "#3498db",
          backgroundColor: "rgba(52, 152, 219, 0.1)",
          tension: 0.4,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: false,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  })

  // Products Chart
  const productsCtx = document.getElementById("productsChart").getContext("2d")
  productsChart = new Chart(productsCtx, {
    type: "doughnut",
    data: {
      labels: [],
      datasets: [
        {
          data: [],
          backgroundColor: ["#3498db", "#e74c3c", "#27ae60", "#f39c12", "#9b59b6"],
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "bottom",
        },
      },
    },
  })

  updateCharts()
}

function updateCharts() {
  const period = document.getElementById("reportPeriod").value
  const orders = adminData.getOrders()
  const filteredOrders = filterOrdersByPeriod(orders, period)
  const completedOrders = filteredOrders.filter((order) => order.status === "completed")

  // Update sales chart
  const salesData = generateSalesData(completedOrders, period)
  salesChart.data.labels = salesData.labels
  salesChart.data.datasets[0].data = salesData.data
  salesChart.update()

  // Update products chart
  const productsData = generateProductsData(completedOrders)
  productsChart.data.labels = productsData.labels
  productsChart.data.datasets[0].data = productsData.data
  productsChart.update()
}

function generateSalesData(orders, period) {
  const data = {}

  orders.forEach((order) => {
    const date = new Date(order.createdAt)
    let key

    switch (period) {
      case "today":
        key = date.getHours() + ":00"
        break
      case "week":
        key = date.toLocaleDateString("id-ID", { weekday: "short" })
        break
      case "month":
        key = date.getDate()
        break
      case "year":
        key = date.toLocaleDateString("id-ID", { month: "short" })
        break
    }

    data[key] = (data[key] || 0) + order.total
  })

  return {
    labels: Object.keys(data),
    data: Object.values(data),
  }
}

function generateProductsData(orders) {
  const productSales = {}

  orders.forEach((order) => {
    order.items.forEach((item) => {
      productSales[item.name] = (productSales[item.name] || 0) + item.quantity
    })
  })

  // Get top 5 products
  const sortedProducts = Object.entries(productSales)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)

  return {
    labels: sortedProducts.map(([name]) => name),
    data: sortedProducts.map(([, quantity]) => quantity),
  }
}

function loadDetailReport() {
  const period = document.getElementById("reportPeriod").value
  const orders = adminData.getOrders()
  const filteredOrders = filterOrdersByPeriod(orders, period)

  // Group by date
  const dailyData = {}
  filteredOrders.forEach((order) => {
    const date = new Date(order.createdAt).toISOString().split("T")[0]
    if (!dailyData[date]) {
      dailyData[date] = {
        orders: 0,
        revenue: 0,
        customers: new Set(),
      }
    }

    dailyData[date].orders++
    if (order.status === "completed") {
      dailyData[date].revenue += order.total
    }
    dailyData[date].customers.add(order.customerName)
  })

  const tbody = document.getElementById("detailReportBody")
  tbody.innerHTML = Object.entries(dailyData)
    .sort(([a], [b]) => new Date(b) - new Date(a))
    .map(
      ([date, data]) => `
            <tr>
                <td>${adminData.formatDate(date)}</td>
                <td>${data.orders}</td>
                <td>${adminData.formatCurrency(data.revenue)}</td>
                <td>${data.customers.size}</td>
                <td>${adminData.formatCurrency(data.orders > 0 ? data.revenue / data.orders : 0)}</td>
            </tr>
        `,
    )
    .join("")
}

function updateReports() {
  loadReportStats()
  updateCharts()
  loadDetailReport()
}

function exportReport() {
  const period = document.getElementById("reportPeriod").value
  const orders = adminData.getOrders()
  const filteredOrders = filterOrdersByPeriod(orders, period)

  const csvContent =
    "data:text/csv;charset=utf-8," +
    "Tanggal,ID Pesanan,Pelanggan,Total,Status\n" +
    filteredOrders
      .map(
        (order) =>
          `${order.createdAt},AS${order.id.padStart(3, "0")},${order.customerName},${order.total},${order.status}`,
      )
      .join("\n")

  const encodedUri = encodeURI(csvContent)
  const link = document.createElement("a")
  link.setAttribute("href", encodedUri)
  link.setAttribute("download", `laporan_${period}_ascafe.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
