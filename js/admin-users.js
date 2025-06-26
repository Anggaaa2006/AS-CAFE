// Users management functionality
let currentEditingUser = null

// Assuming adminData is defined in a separate file or globally
// For example: import adminData from './admin-data';
// Or: window.adminData = { ... };

document.addEventListener("DOMContentLoaded", () => {
  loadUsers()
  setupEventListeners()
})

function setupEventListeners() {
  document.getElementById("searchUsers").addEventListener("input", filterUsers)
  document.getElementById("userForm").addEventListener("submit", handleUserSubmit)

  window.addEventListener("click", (event) => {
    const modal = document.getElementById("userModal")
    if (event.target === modal) {
      closeUserModal()
    }
  })
}

function loadUsers() {
  const users = adminData.getUsers()
  displayUsers(users)
}

function displayUsers(users) {
  const tbody = document.getElementById("usersTableBody")

  if (users.length === 0) {
    tbody.innerHTML = `
            <tr>
                <td colspan="7" class="empty-state">
                    <i class="fas fa-users"></i>
                    <h3>Belum ada pengguna</h3>
                    <p>Klik tombol "Tambah User" untuk menambah pengguna baru</p>
                </td>
            </tr>
        `
    return
  }

  tbody.innerHTML = users
    .map(
      (user) => `
        <tr>
            <td>#${user.id}</td>
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td><span class="role-badge role-${user.role}">${user.role}</span></td>
            <td>${adminData.getStatusBadge(user.status)}</td>
            <td>${adminData.formatDate(user.createdAt)}</td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="editUser('${user.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteUser('${user.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `,
    )
    .join("")
}

function filterUsers() {
  const searchTerm = document.getElementById("searchUsers").value.toLowerCase()
  const roleFilter = document.getElementById("roleFilter").value
  const statusFilter = document.getElementById("statusFilter").value
  const users = adminData.getUsers()

  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm) || user.email.toLowerCase().includes(searchTerm)
    const matchesRole = !roleFilter || user.role === roleFilter
    const matchesStatus = !statusFilter || user.status === statusFilter

    return matchesSearch && matchesRole && matchesStatus
  })

  displayUsers(filteredUsers)
}

function showUserForm() {
  currentEditingUser = null
  document.getElementById("modalTitle").textContent = "Tambah User Baru"
  document.getElementById("userForm").reset()
  document.getElementById("userModal").style.display = "block"
}

function editUser(userId) {
  const users = adminData.getUsers()
  const user = users.find((u) => u.id === userId)

  if (user) {
    currentEditingUser = user
    document.getElementById("modalTitle").textContent = "Edit User"
    document.getElementById("userName").value = user.name
    document.getElementById("userEmail").value = user.email
    document.getElementById("userPhone").value = user.phone || ""
    document.getElementById("userRole").value = user.role
    document.getElementById("userStatus").value = user.status
    // Don't populate password for security

    document.getElementById("userModal").style.display = "block"
  }
}

function deleteUser(userId) {
  if (confirm("Apakah Anda yakin ingin menghapus pengguna ini?")) {
    adminData.deleteUser(userId)
    loadUsers()
  }
}

function closeUserModal() {
  document.getElementById("userModal").style.display = "none"
  currentEditingUser = null
}

function handleUserSubmit(event) {
  event.preventDefault()

  const userData = {
    name: document.getElementById("userName").value,
    email: document.getElementById("userEmail").value,
    phone: document.getElementById("userPhone").value,
    role: document.getElementById("userRole").value,
    status: document.getElementById("userStatus").value,
  }

  // Only include password if it's provided
  const password = document.getElementById("userPassword").value
  if (password) {
    userData.password = password
  }

  if (currentEditingUser) {
    adminData.updateUser(currentEditingUser.id, userData)
  } else {
    adminData.addUser(userData)
  }

  closeUserModal()
  loadUsers()
}