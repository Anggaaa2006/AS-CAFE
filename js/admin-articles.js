// Articles management functionality
let currentEditingArticle = null

// Assuming adminData is defined elsewhere, possibly in a separate file or inline script
// For example:
// const adminData = { ... };

document.addEventListener("DOMContentLoaded", () => {
  loadArticles()
  setupEventListeners()
})

function setupEventListeners() {
  document.getElementById("searchArticles").addEventListener("input", filterArticles)
  document.getElementById("articleForm").addEventListener("submit", handleArticleSubmit)

  window.addEventListener("click", (event) => {
    const modal = document.getElementById("articleModal")
    if (event.target === modal) {
      closeArticleModal()
    }
  })
}

// Declare adminData here or import it from another file
// For example:
// const adminData = {
//     getArticles: () => [],
//     formatDate: (date) => date.toLocaleDateString(),
//     deleteArticle: (id) => console.log(`Deleting article with id: ${id}`),
//     updateArticle: (id, data) => console.log(`Updating article with id: ${id} with data:`, data),
//     addArticle: (data) => console.log('Adding article:', data)
// };

function loadArticles() {
  const articles = adminData.getArticles()
  displayArticles(articles)
}

function displayArticles(articles) {
  const container = document.getElementById("articlesList")

  if (articles.length === 0) {
    container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-newspaper"></i>
                <h3>Belum ada artikel</h3>
                <p>Klik tombol "Tulis Artikel" untuk membuat artikel baru</p>
            </div>
        `
    return
  }

  container.innerHTML = articles
    .map(
      (article) => `
        <div class="article-card">
            <div class="article-image">
                <img src="${article.image || "/placeholder.svg?height=200&width=300"}" alt="${article.title}">
                <div class="article-status ${article.status}">
                    ${article.status === "published" ? "Published" : "Draft"}
                </div>
            </div>
            <div class="article-content">
                <div class="article-category">${article.category}</div>
                <h3>${article.title}</h3>
                <p>${article.excerpt}</p>
                <div class="article-meta">
                    <span><i class="fas fa-calendar"></i> ${adminData.formatDate(article.createdAt)}</span>
                </div>
                <div class="article-actions">
                    <button class="btn btn-primary" onclick="editArticle('${article.id}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-danger" onclick="deleteArticle('${article.id}')">
                        <i class="fas fa-trash"></i> Hapus
                    </button>
                </div>
            </div>
        </div>
    `,
    )
    .join("")
}

function filterArticles() {
  const searchTerm = document.getElementById("searchArticles").value.toLowerCase()
  const categoryFilter = document.getElementById("categoryFilter").value
  const articles = adminData.getArticles()

  const filteredArticles = articles.filter((article) => {
    const matchesSearch =
      article.title.toLowerCase().includes(searchTerm) || article.category.toLowerCase().includes(searchTerm)
    const matchesCategory = !categoryFilter || article.category === categoryFilter

    return matchesSearch && matchesCategory
  })

  displayArticles(filteredArticles)
}

function showArticleForm() {
  currentEditingArticle = null
  document.getElementById("modalTitle").textContent = "Tulis Artikel Baru"
  document.getElementById("articleForm").reset()
  document.getElementById("articleModal").style.display = "block"
}

function editArticle(articleId) {
  const articles = adminData.getArticles()
  const article = articles.find((a) => a.id === articleId)

  if (article) {
    currentEditingArticle = article
    document.getElementById("modalTitle").textContent = "Edit Artikel"
    document.getElementById("articleTitle").value = article.title
    document.getElementById("articleCategory").value = article.category
    document.getElementById("articleStatus").value = article.status
    document.getElementById("articleExcerpt").value = article.excerpt
    document.getElementById("articleContent").value = article.content
    document.getElementById("articleImage").value = article.image || ""

    document.getElementById("articleModal").style.display = "block"
  }
}

function deleteArticle(articleId) {
  if (confirm("Apakah Anda yakin ingin menghapus artikel ini?")) {
    adminData.deleteArticle(articleId)
    loadArticles()
  }
}

function closeArticleModal() {
  document.getElementById("articleModal").style.display = "none"
  currentEditingArticle = null
}

function handleArticleSubmit(event) {
  event.preventDefault()

  const articleData = {
    title: document.getElementById("articleTitle").value,
    category: document.getElementById("articleCategory").value,
    status: document.getElementById("articleStatus").value,
    excerpt: document.getElementById("articleExcerpt").value,
    content: document.getElementById("articleContent").value,
    image: document.getElementById("articleImage").value,
  }

  if (currentEditingArticle) {
    adminData.updateArticle(currentEditingArticle.id, articleData)
  } else {
    adminData.addArticle(articleData)
  }

  closeArticleModal()
  loadArticles()
}