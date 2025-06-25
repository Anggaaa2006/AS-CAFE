document.addEventListener("DOMContentLoaded", () => {
  const ordersContainer = document.getElementById("orders-list");

  function renderOrders() {
    const orders = JSON.parse(localStorage.getItem("orders") || "[]");

    if (!orders.length) {
      ordersContainer.innerHTML = "<p>Tidak ada pesanan.</p>";
      return;
    }

    ordersContainer.innerHTML = orders.map((order) => `
      <div class="order">
        <h3>Order ID: ${order.id}</h3>
        <p>Waktu: ${new Date(order.createdAt).toLocaleString()}</p>
        <ul>
          ${order.items.map(item => `
            <li>${item.name} - ${item.quantity} pcs - Rp${item.price}</li>
          `).join("")}
        </ul>
        <hr>
      </div>
    `).join("");
  }

  renderOrders();
});
