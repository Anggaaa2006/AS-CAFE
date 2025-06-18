// Reservations management functionality
let currentEditingReservation = null

// Assuming adminData is defined elsewhere, possibly in a separate script
// For example:
// import adminData from './admin-data';
// Or:
// const adminData = { ... };

document.addEventListener("DOMContentLoaded", () => {
  loadReservations()
  setupEventListeners()
})

function setupEventListeners() {
  // Search functionality
  document.getElementById("searchReservations").addEventListener("input", filterReservations)

  // Form submission
  document.getElementById("reservationForm").addEventListener("submit", handleReservationSubmit)

  // Modal close events
  window.addEventListener("click", (event) => {
    const modal = document.getElementById("reservationModal")
    if (event.target === modal) {
      closeReservationModal()
    }
  })
}

function loadReservations() {
  const reservations = adminData.getReservations()
  displayReservations(reservations)
}

function displayReservations(reservations) {
  const container = document.getElementById("reservationsList")

  if (reservations.length === 0) {
    container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-calendar"></i>
                <h3>Belum ada reservasi</h3>
                <p>Klik tombol "Tambah Reservasi" untuk membuat reservasi baru</p>
            </div>
        `
    return
  }

  container.innerHTML = reservations
    .map(
      (reservation) => `
        <div class="reservation-card">
            <div class="card-header-info">
                <div class="customer-info">
                    <h3>${reservation.customerName}</h3>
                    <p><i class="fas fa-envelope"></i> ${reservation.customerEmail}</p>
                    <p><i class="fas fa-phone"></i> ${reservation.customerPhone}</p>
                </div>
                <div class="card-actions">
                    ${adminData.getStatusBadge(reservation.status)}
                    <button class="btn btn-primary" onclick="editReservation('${reservation.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-danger" onclick="deleteReservation('${reservation.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            
            <div class="reservation-details">
                <div class="detail-item">
                    <i class="fas fa-calendar"></i>
                    <span>${reservation.date}</span>
                </div>
                <div class="detail-item">
                    <i class="fas fa-clock"></i>
                    <span>${reservation.time}</span>
                </div>
                <div class="detail-item">
                    <i class="fas fa-users"></i>
                    <span>${reservation.guests} tamu</span>
                </div>
                <div class="detail-item">
                    <i class="fas fa-table"></i>
                    <span>Meja ${reservation.tableNumber || "Belum ditentukan"}</span>
                </div>
            </div>
            
            ${
              reservation.notes
                ? `
                <div class="reservation-notes">
                    <h4>Catatan:</h4>
                    <p>${reservation.notes}</p>
                </div>
            `
                : ""
            }
        </div>
    `,
    )
    .join("")
}

function filterReservations() {
  const searchTerm = document.getElementById("searchReservations").value.toLowerCase()
  const statusFilter = document.getElementById("statusFilter").value
  const reservations = adminData.getReservations()

  const filteredReservations = reservations.filter((reservation) => {
    const matchesSearch =
      reservation.customerName.toLowerCase().includes(searchTerm) ||
      reservation.customerPhone.includes(searchTerm) ||
      reservation.customerEmail.toLowerCase().includes(searchTerm)
    const matchesStatus = !statusFilter || reservation.status === statusFilter

    return matchesSearch && matchesStatus
  })

  displayReservations(filteredReservations)
}

function showReservationForm() {
  currentEditingReservation = null
  document.getElementById("modalTitle").textContent = "Tambah Reservasi Baru"
  document.getElementById("reservationForm").reset()

  // Set minimum date to today
  const today = new Date().toISOString().split("T")[0]
  document.getElementById("reservationDate").min = today

  document.getElementById("reservationModal").style.display = "block"
}

function editReservation(reservationId) {
  const reservations = adminData.getReservations()
  const reservation = reservations.find((r) => r.id === reservationId)

  if (reservation) {
    currentEditingReservation = reservation

    document.getElementById("modalTitle").textContent = "Edit Reservasi"
    document.getElementById("customerName").value = reservation.customerName
    document.getElementById("customerPhone").value = reservation.customerPhone
    document.getElementById("customerEmail").value = reservation.customerEmail
    document.getElementById("reservationDate").value = reservation.date
    document.getElementById("reservationTime").value = reservation.time
    document.getElementById("guestCount").value = reservation.guests
    document.getElementById("tableNumber").value = reservation.tableNumber || ""
    document.getElementById("reservationStatus").value = reservation.status
    document.getElementById("notes").value = reservation.notes || ""

    document.getElementById("reservationModal").style.display = "block"
  }
}

function deleteReservation(reservationId) {
  if (confirm("Apakah Anda yakin ingin menghapus reservasi ini?")) {
    adminData.deleteReservation(reservationId)
    loadReservations()
  }
}

function closeReservationModal() {
  document.getElementById("reservationModal").style.display = "none"
  currentEditingReservation = null
}

function handleReservationSubmit(event) {
  event.preventDefault()

  const reservationData = {
    customerName: document.getElementById("customerName").value,
    customerPhone: document.getElementById("customerPhone").value,
    customerEmail: document.getElementById("customerEmail").value,
    date: document.getElementById("reservationDate").value,
    time: document.getElementById("reservationTime").value,
    guests: Number.parseInt(document.getElementById("guestCount").value),
    tableNumber: Number.parseInt(document.getElementById("tableNumber").value) || null,
    status: document.getElementById("reservationStatus").value,
    notes: document.getElementById("notes").value,
  }

  if (currentEditingReservation) {
    adminData.updateReservation(currentEditingReservation.id, reservationData)
  } else {
    adminData.addReservation(reservationData)
  }

  closeReservationModal()
  loadReservations()
}
