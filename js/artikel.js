document.addEventListener("DOMContentLoaded", () => {
  // Search functionality
  const searchInput = document.getElementById("searchInput")
  const searchBtn = document.getElementById("searchBtn")
  const articleCards = document.querySelectorAll(".article-card")

  function searchArticles() {
    const searchTerm = searchInput.value.toLowerCase()

    articleCards.forEach((card) => {
      const title = card.querySelector("h3").textContent.toLowerCase()
      const content = card.querySelector("p").textContent.toLowerCase()

      if (title.includes(searchTerm) || content.includes(searchTerm)) {
        card.style.display = "block"
      } else {
        card.style.display = "none"
      }
    })
  }

  searchBtn.addEventListener("click", searchArticles)
  searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      searchArticles()
    }
  })

  // Filter functionality
  const filterTags = document.querySelectorAll(".filter-tag")

  filterTags.forEach((tag) => {
    tag.addEventListener("click", () => {
      // Remove active class from all tags
      filterTags.forEach((t) => t.classList.remove("active"))

      // Add active class to clicked tag
      tag.classList.add("active")

      const filter = tag.getAttribute("data-filter")

      // Filter articles
      articleCards.forEach((card) => {
        if (filter === "all" || card.getAttribute("data-category") === filter) {
          card.style.display = "block"
        } else {
          card.style.display = "none"
        }
      })
    })
  })

  // Pagination
  const pageButtons = document.querySelectorAll(".page-btn")

  pageButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      if (btn.textContent !== "Next") {
        pageButtons.forEach((b) => b.classList.remove("active"))
        btn.classList.add("active")
      }
    })
  })
})
