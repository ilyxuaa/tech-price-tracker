const express = require('express');
const { Pool } = require('pg');
const path = require('path');

const app = express();
const port = 3000;

// เชื่อมต่อฐานข้อมูล SQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://admin:secretpassword@localhost:5432/tech_pricedb'
});

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// API ดึงรายการสินค้าทั้งหมดพร้อมเปรียบเทียบราคา 4 ร้าน
app.get('/api/products', async (req, res) => {
  try {
    const queryText = `
      SELECT p.id, p.brand, p.model, c.name as category,
             json_agg(json_build_object('store', sp.store_name, 'price', sp.price, 'url', sp.product_url)) as prices
      FROM products p
      JOIN categories c ON p.category_id = c.id
      LEFT JOIN store_prices sp ON p.id = sp.product_id
      GROUP BY p.id, c.name;
    `;
    const { rows } = await pool.query(queryText);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API ดึงประวัติราคาเชิงลึกสำหรับทำกราฟ
app.get('/api/products/:id/history', async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await pool.query(
      'SELECT store_name, price, recorded_at FROM price_history WHERE product_id = $1 ORDER BY recorded_at ASC',
      [id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});