document.addEventListener("DOMContentLoaded", () => {
  // Set minimum date to today
  const dateInput = document.getElementById("reservationDate")
  const today = new Date().toISOString().split("T")[0]
  const maxDate = new Date()
  maxDate.setDate(maxDate.getDate() + 30)
  const maxDateStr = maxDate.toISOString().split("T")[0]

  dateInput.min = today
  dateInput.max = maxDateStr

  // Table selection functionality
  const tableItems = document.querySelectorAll(".table-item")
  const selectedTableInput = document.getElementById("selectedTable")
  const guestCountSelect = document.getElementById("guestCount")

  let selectedTable = null

  tableItems.forEach((table) => {
    table.addEventListener("click", () => {
      if (table.classList.contains("occupied") || table.classList.contains("reserved")) {
        return
      }

      // Remove previous selection
      tableItems.forEach((t) => t.classList.remove("selected"))

      // Select current table
      table.classList.add("selected")
      selectedTable = {
        number: table.dataset.table,
        capacity: table.dataset.capacity,
      }

      selectedTableInput.value = `Meja ${selectedTable.number} (${selectedTable.capacity} orang)`

      // Auto-select guest count if not selected
      if (!guestCountSelect.value && selectedTable.capacity <= 8) {
        guestCountSelect.value = selectedTable.capacity
      }
    })
  })

  // Guest count change handler
  guestCountSelect.addEventListener("change", () => {
    const guestCount = Number.parseInt(guestCountSelect.value)
    if (guestCount) {
      filterTablesByCapacity(guestCount)
    }
  })

  function filterTablesByCapacity(guestCount) {
    tableItems.forEach((table) => {
      const capacity = Number.parseInt(table.dataset.capacity)
      const isAvailable = table.classList.contains("available")

      if (isAvailable) {
        if (capacity >= guestCount) {
          table.style.opacity = "1"
          table.style.pointerEvents = "auto"
        } else {
          table.style.opacity = "0.5"
          table.style.pointerEvents = "none"
        }
      }
    })
  }

  // Date and time validation
  dateInput.addEventListener("change", updateAvailableTimeSlots)
  document.getElementById("reservationTime").addEventListener("change", checkTableAvailability)

  function updateAvailableTimeSlots() {
    const selectedDate = dateInput.value
    const timeSelect = document.getElementById("reservationTime")
    const options = timeSelect.querySelectorAll("option")

    if (selectedDate === today) {
      const currentHour = new Date().getHours()
      const currentMinute = new Date().getMinutes()

      options.forEach((option) => {
        if (option.value) {
          const [hour, minute] = option.value.split(":").map(Number)
          const timeInMinutes = hour * 60 + minute
          const currentTimeInMinutes = currentHour * 60 + currentMinute + 60 // Add 1 hour buffer

          if (timeInMinutes < currentTimeInMinutes) {
            option.disabled = true
            option.textContent = option.value + " (Tidak tersedia)"
          } else {
            option.disabled = false
            option.textContent = option.value
          }
        }
      })
    } else {
      options.forEach((option) => {
        option.disabled = false
        if (option.value) {
          option.textContent = option.value
        }
      })
    }
  }

  function checkTableAvailability() {
    // Simulate checking table availability for selected date/time
    const date = dateInput.value
    const time = document.getElementById("reservationTime").value

    if (date && time) {
      // Simulate some tables being unavailable at certain times
      const unavailableTables = getUnavailableTables(date, time)

      tableItems.forEach((table) => {
        const tableNumber = table.dataset.table
        const wasAvailable = table.classList.contains("available")

        // Reset classes
        table.classList.remove("occupied", "reserved", "available")

        if (unavailableTables.includes(tableNumber)) {
          table.classList.add("reserved")
        } else {
          table.classList.add("available")
        }
      })
    }
  }

  function getUnavailableTables(date, time) {
    // Simulate unavailable tables based on date and time
    const unavailable = []

    // Weekend dinner times are busier
    const selectedDate = new Date(date)
    const isWeekend = selectedDate.getDay() === 0 || selectedDate.getDay() === 6
    const hour = Number.parseInt(time.split(":")[0])

    if (isWeekend && hour >= 18) {
      unavailable.push("3", "5")
    }

    if (hour >= 12 && hour <= 14) {
      unavailable.push("3")
    }

    return unavailable
  }

  // Form submission
  const reservationForm = document.getElementById("reservationForm")
  reservationForm.addEventListener("submit", (e) => {
    e.preventDefault()

    if (!validateReservationForm()) {
      return
    }

    const formData = new FormData(reservationForm)
    const reservationData = {
      table: selectedTable,
      date: formData.get("date"),
      time: formData.get("time"),
      guests: formData.get("guests"),
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      occasion: formData.get("occasion"),
      requests: formData.get("requests"),
      timestamp: new Date().toISOString(),
      status: "pending",
      reservationId: generateReservationId(),
    }

    // Save reservation
    const reservations = JSON.parse(localStorage.getItem("reservations") || "[]")
    reservations.push(reservationData)
    localStorage.setItem("reservations", JSON.stringify(reservations))

    // Show success message
    showSuccessModal(reservationData.reservationId)
  })

  function validateReservationForm() {
    let isValid = true

    // Check if table is selected
    if (!selectedTable) {
      showNotification("Silakan pilih meja terlebih dahulu", "error")
      isValid = false
    }

    // Validate required fields
    const requiredFields = reservationForm.querySelectorAll("[required]")
    requiredFields.forEach((field) => {
      if (!field.value.trim()) {
        field.style.borderColor = "#dc3545"
        isValid = false
      } else {
        field.style.borderColor = "#ddd"
      }
    })

    // Check terms agreement
    const termsCheckbox = reservationForm.querySelector('input[name="terms"]')
    if (!termsCheckbox.checked) {
      showNotification("Anda harus menyetujui syarat dan ketentuan", "error")
      isValid = false
    }

    if (!isValid) {
      showNotification("Mohon lengkapi semua field yang wajib diisi", "error")
    }

    return isValid
  }

  function generateReservationId() {
    const timestamp = Date.now().toString(36)
    const random = Math.random().toString(36).substr(2, 5)
    return `RSV${timestamp}${random}`.toUpperCase()
  }

  function showSuccessModal(reservationId) {
    const modal = document.createElement("div")
    modal.className = "success-modal"
    modal.innerHTML = `
      <div class="modal-content">
        <div class="success-icon">
          <i class="fas fa-check-circle"></i>
        </div>
        <h2>Reservasi Berhasil!</h2>
        <p>Nomor reservasi Anda: <strong>${reservationId}</strong></p>
        <p>Kami akan menghubungi Anda dalam 15 menit untuk konfirmasi.</p>
        <div class="modal-buttons">
          <button onclick="window.location.href='index.html'" class="btn btn-primary">
            Kembali ke Beranda
          </button>
          <button onclick="closeModal()" class="btn btn-secondary">
            Tutup
          </button>
        </div>
      </div>
    `

    document.body.appendChild(modal)

    // Add modal styles
    const modalStyles = document.createElement("style")
    modalStyles.textContent = `
      .success-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
      }
      
      .modal-content {
        background-color: #fff;
        padding: 40px;
        border-radius: 10px;
        text-align: center;
        max-width: 500px;
        margin: 20px;
      }
      
      .success-icon {
        font-size: 4rem;
        color: #28a745;
        margin-bottom: 20px;
      }
      
      .modal-content h2 {
        margin-bottom: 20px;
        color: #333;
      }
      
      .modal-content p {
        margin-bottom: 15px;
        color: #666;
      }
      
      .modal-buttons {
        display: flex;
        gap: 15px;
        justify-content: center;
        margin-top: 30px;
      }
    `
    document.head.appendChild(modalStyles)

    // Global close function
    window.closeModal = () => {
      document.body.removeChild(modal)
      document.head.removeChild(modalStyles)
      reservationForm.reset()
      tableItems.forEach((t) => t.classList.remove("selected"))
      selectedTable = null
      selectedTableInput.value = ""
    }
  }

  function showNotification(message, type = "success") {
    const notification = document.createElement("div")
    notification.className = `notification ${type}`
    notification.textContent = message

    document.body.appendChild(notification)

    setTimeout(() => {
      notification.classList.add("show")
    }, 10)

    setTimeout(() => {
      notification.classList.remove("show")
      setTimeout(() => {
        document.body.removeChild(notification)
      }, 300)
    }, 3000)
  }

  // Initialize
  updateAvailableTimeSlots()
})
