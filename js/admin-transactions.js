// Transactions management functionality

document.addEventListener("DOMContentLoaded", () => {
  loadTransactionStats()
  loadTransactions()
  setupEventListeners()
})

function setupEventListeners() {
  document.getElementById("searchTransactions").addEventListener("input", filterTransactions)
}

function loadTransactionStats() {
  const orders = adminData.getOrders()
  const completedOrders = orders.filter((order) => order.status === "completed")

  const totalRevenue = completedOrders.reduce((sum, order) => sum + order.total, 0)
  const totalTransactions = orders.length

  // Today's revenue
  const today = new Date().toDateString()
  const todayOrders = completedOrders.filter((order) => new Date(order.createdAt).toDateString() === today)
  const todayRevenue = todayOrders.reduce((sum, order) => sum + order.total, 0)

  // Average transaction
  const avgTransaction = completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0

  document.getElementById("totalRevenue").textContent = adminData.formatCurrency(totalRevenue)
  document.getElementById("totalTransactions").textContent = totalTransactions
  document.getElementById("todayRevenue").textContent = adminData.formatCurrency(todayRevenue)
  document.getElementById("avgTransaction").textContent = adminData.formatCurrency(avgTransaction)
}

function loadTransactions() {
  const orders = adminData.getOrders()
  displayTransactions(orders)
}

function displayTransactions(transactions) {
  const tbody = document.getElementById("transactionsTableBody")

  if (transactions.length === 0) {
    tbody.innerHTML = `
            <tr>
                <td colspan="7" class="empty-state">
                    <i class="fas fa-receipt"></i>
                    <h3>Belum ada transaksi</h3>
                </td>
            </tr>
        `
    return
  }

  tbody.innerHTML = transactions
    .map(
      (transaction) => `
        <tr>
            <td>#AS${transaction.id.padStart(3, "0")}</td>
            <td>${transaction.customerName}</td>
            <td>${transaction.items.length} item(s)</td>
            <td>${adminData.formatCurrency(transaction.total)}</td>
            <td>${adminData.getStatusBadge(transaction.status)}</td>
            <td>${adminData.formatTime(transaction.createdAt)}</td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="viewTransaction('${transaction.id}')">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        </tr>
    `,
    )
    .join("")
}

function filterTransactions() {
  const searchTerm = document.getElementById("searchTransactions").value.toLowerCase()
  const dateFilter = document.getElementById("dateFilter").value
  const statusFilter = document.getElementById("statusFilter").value
  const transactions = adminData.getOrders()

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.customerName.toLowerCase().includes(searchTerm) || transaction.id.includes(searchTerm)
    const matchesDate = !dateFilter || new Date(transaction.createdAt).toISOString().split("T")[0] === dateFilter
    const matchesStatus = !statusFilter || transaction.status === statusFilter

    return matchesSearch && matchesDate && matchesStatus
  })

  displayTransactions(filteredTransactions)
}

function viewTransaction(transactionId) {
  const transactions = adminData.getOrders()
  const transaction = transactions.find((t) => t.id === transactionId)

  if (transaction) {
    const detailHtml = `
            <div class="transaction-detail">
                <div class="detail-header">
                    <h4>Transaksi #AS${transaction.id.padStart(3, "0")}</h4>
                    ${adminData.getStatusBadge(transaction.status)}
                </div>
                
                <div class="detail-info">
                    <div class="info-row">
                        <span>Pelanggan:</span>
                        <span>${transaction.customerName}</span>
                    </div>
                    <div class="info-row">
                        <span>Telepon:</span>
                        <span>${transaction.customerPhone}</span>
                    </div>
                    <div class="info-row">
                        <span>Meja:</span>
                        <span>${transaction.tableNumber || "N/A"}</span>
                    </div>
                    <div class="info-row">
                        <span>Waktu:</span>
                        <span>${adminData.formatTime(transaction.createdAt)}</span>
                    </div>
                </div>

                <div class="detail-items">
                    <h5>Item Pesanan:</h5>
                    ${transaction.items
                      .map(
                        (item) => `
                        <div class="item-detail">
                            <span>${item.name} x${item.quantity}</span>
                            <span>${adminData.formatCurrency(item.price * item.quantity)}</span>
                        </div>
                    `,
                      )
                      .join("")}
                    <div class="item-total">
                        <span><strong>Total:</strong></span>
                        <span><strong>${adminData.formatCurrency(transaction.total)}</strong></span>
                    </div>
                </div>
            </div>
        `

    document.getElementById("transactionDetail").innerHTML = detailHtml
    document.getElementById("transactionModal").style.display = "block"
  }
}

function closeTransactionModal() {
  document.getElementById("transactionModal").style.display = "none"
}

function exportTransactions() {
  const transactions = adminData.getOrders()
  const csvContent =
    "data:text/csv;charset=utf-8," +
    "ID,Pelanggan,Telepon,Items,Total,Status,Waktu\n" +
    transactions
      .map(
        (t) =>
          `AS${t.id.padStart(3, "0")},${t.customerName},${t.customerPhone},${t.items.length},${t.total},${t.status},${t.createdAt}`,
      )
      .join("\n")

  const encodedUri = encodeURI(csvContent)
  const link = document.createElement("a")
  link.setAttribute("href", encodedUri)
  link.setAttribute("download", "transaksi_ascafe.csv")
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}