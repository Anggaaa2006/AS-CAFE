import { Chart } from "@/components/ui/chart"
document.addEventListener("DOMContentLoaded", () => {
  // Initialize charts
  initializeSalesChart()
  initializeProductsChart()

  // Load dashboard data
  loadDashboardStats()

  // Auto-refresh data every 30 seconds
  setInterval(loadDashboardStats, 30000)
})

function initializeSalesChart() {
  const ctx = document.getElementById("salesChart")
  if (!ctx) return

  new Chart(ctx, {
    type: "line",
    data: {
      labels: ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"],
      datasets: [
        {
          label: "Penjualan (Rp)",
          data: [8500000, 9200000, 7800000, 10500000, 12000000, 15500000, 13200000],
          borderColor: "#c8a97e",
          backgroundColor: "rgba(200, 169, 126, 0.1)",
          borderWidth: 3,
          fill: true,
          tension: 0.4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: (value) => "Rp " + (value / 1000000).toFixed(1) + "M",
          },
        },
      },
    },
  })
}

function initializeProductsChart() {
  const ctx = document.getElementById("productsChart")
  if (!ctx) return

  new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Kopi", "Makanan", "Dessert", "Minuman"],
      datasets: [
        {
          data: [45, 25, 15, 15],
          backgroundColor: ["#c8a97e", "#e8d5b7", "#f4e8d0", "#f9f2e7"],
          borderWidth: 0,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            padding: 20,
            usePointStyle: true,
          },
        },
      },
    },
  })
}

function loadDashboardStats() {
  // Simulate loading real-time data
  const stats = {
    ordersToday: Math.floor(Math.random() * 50) + 120,
    revenueToday: (Math.random() * 5 + 10).toFixed(1),
    totalCustomers: Math.floor(Math.random() * 100) + 1200,
    averageRating: (Math.random() * 0.5 + 4.5).toFixed(1),
  }

  // Update stats cards
  updateStatCard(0, stats.ordersToday, "+12%")
  updateStatCard(1, `Rp ${stats.revenueToday}M`, "+8%")
  updateStatCard(2, stats.totalCustomers.toLocaleString(), "+5%")
  updateStatCard(3, stats.averageRating, "0%")

  // Update recent orders
  updateRecentOrders()
}

function updateStatCard(index, value, change) {
  const statCards = document.querySelectorAll(".stat-card")
  if (statCards[index]) {
    const valueElement = statCards[index].querySelector("h3")
    const changeElement = statCards[index].querySelector(".stat-change")

    if (valueElement) valueElement.textContent = value
    if (changeElement) changeElement.textContent = change
  }
}

function updateRecentOrders() {
  // Simulate real-time order updates
  const orderStatuses = ["pending", "confirmed", "preparing", "ready", "completed"]
  const rows = document.querySelectorAll(".orders-table tbody tr")

  rows.forEach((row) => {
    const statusBadge = row.querySelector(".status-badge")
    if (statusBadge && Math.random() < 0.1) {
      // 10% chance to update status
      const currentStatus = statusBadge.className.split(" ")[1]
      const currentIndex = orderStatuses.indexOf(currentStatus)

      if (currentIndex < orderStatuses.length - 1) {
        const newStatus = orderStatuses[currentIndex + 1]
        statusBadge.className = `status-badge ${newStatus}`
        statusBadge.textContent = getStatusText(newStatus)
      }
    }
  })
}

function getStatusText(status) {
  const statusMap = {
    pending: "Menunggu",
    confirmed: "Dikonfirmasi",
    preparing: "Diproses",
    ready: "Siap",
    completed: "Selesai",
  }
  return statusMap[status] || status
}

// Chart filter functionality
document.addEventListener("change", (e) => {
  if (e.target.classList.contains("chart-filter")) {
    const filterValue = e.target.value
    // Update chart data based on filter
    updateChartData(filterValue)
  }
})

function updateChartData(period) {
  // Simulate different data for different periods
  const salesChart = Chart.getChart("salesChart")
  if (salesChart) {
    let newData, newLabels

    switch (period) {
      case "7 Hari Terakhir":
        newLabels = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"]
        newData = [8500000, 9200000, 7800000, 10500000, 12000000, 15500000, 13200000]
        break
      case "30 Hari Terakhir":
        newLabels = ["Minggu 1", "Minggu 2", "Minggu 3", "Minggu 4"]
        newData = [45000000, 52000000, 48000000, 58000000]
        break
      case "3 Bulan Terakhir":
        newLabels = ["Bulan 1", "Bulan 2", "Bulan 3"]
        newData = [180000000, 195000000, 210000000]
        break
    }

    salesChart.data.labels = newLabels
    salesChart.data.datasets[0].data = newData
    salesChart.update()
  }
}
