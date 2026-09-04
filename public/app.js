let chartInstance = null;

async function loadProducts() {
  try {
    const res = await fetch('/api/products');
    const products = await res.json();
    const grid = document.getElementById('productGrid');

    // ดักจับกรณี products ไม่ใช่ Array
    if (!Array.isArray(products) || products.length === 0) {
      grid.innerHTML = '<p style="color: var(--text-muted); text-align: center;">ไม่พบข้อมูลสินค้า</p>';
      return;
    }

    grid.innerHTML = products.map(p => `
      <div class="product-card">
        <small style="color: var(--text-muted);">${p.category || 'General'} // ${p.brand || ''}</small>
        <h3>${p.model || p.name || 'N/A'}</h3>
        <ul class="store-list">
          ${Array.isArray(p.prices) && p.prices.length > 0 ? p.prices.map(pr => `
            <li class="store-item">
              <span>${pr.store}</span>
              <strong>${pr.price ? '$' + Number(pr.price).toLocaleString() : 'ไม่มีสินค้า'}</strong>
            </li>
          `).join('') : `
            <li class="store-item">
              <span>ราคาล่าสุด</span>
              <strong>${p.price ? '$' + Number(p.price).toLocaleString() : 'ไม่มีข้อมูลราคา'}</strong>
            </li>
          `}
        </ul>
        <button class="btn-detail" onclick="openHistory(${p.id}, '${p.model || p.name}')">ดูประวัติราคาเชิงลึก</button>
      </div>
    `).join('');
  } catch (err) {
    console.error('Error loading products:', err);
  }
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