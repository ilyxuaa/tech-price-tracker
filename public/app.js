let chartInstance = null;

async function loadProducts() {
  const res = await fetch('/api/products');
  const products = await res.json();
  const grid = document.getElementById('productGrid');
  
  grid.innerHTML = products.map(p => `
    <div class="product-card">
      <small style="color: var(--text-muted);">${p.category} // ${p.brand}</small>
      <h3>${p.model}</h3>
      <ul class="store-list">
        ${p.prices.map(pr => `
          <li class="store-item">
            <span>${pr.store}</span>
            <strong>${pr.price ? '฿' + Number(pr.price).toLocaleString() : 'ไม่มีสินค้า'}</strong>
          </li>
        `).join('')}
      </ul>
      <button class="btn-detail" onclick="openHistory(${p.id}, '${p.model}')">ดูประวัติราคาเชิงลึก</button>
    </div>
  `).join('');
}

async function openHistory(productId, modelName) {
  document.getElementById('modalTitle').innerText = modelName;
  document.getElementById('graphModal').style.display = 'flex';

  const res = await fetch(`/api/products/${productId}/history`);
  const history = await res.json();

  const labels = history.map(h => new Date(h.recorded_at).toLocaleDateString('th-TH'));
  const prices = history.map(h => h.price);

  const ctx = document.getElementById('priceChart').getContext('2d');
  if (chartInstance) chartInstance.destroy();

  chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'ราคา (บาท)',
        data: prices,
        borderColor: '#38BDF8',
        backgroundColor: 'rgba(56, 189, 248, 0.1)',
        fill: true,
        tension: 0.1
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: { grid: { color: '#2D3748' }, ticks: { color: '#ECEFF4' } },
        x: { grid: { color: '#2D3748' }, ticks: { color: '#ECEFF4' } }
      }
    }
  });
}

function closeModal() {
  document.getElementById('graphModal').style.display = 'none';
}

loadProducts();