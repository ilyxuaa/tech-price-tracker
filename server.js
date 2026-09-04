const express = require('express');
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const app = express();

// 1. เชื่อมต่อ PostgreSQL Database
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

// 2. สั่งรัน init.sql อัตโนมัติ พร้อมดักจับข้อผิดพลาด
async function autoInitDb() {
  try {
    const sqlPath = path.join(__dirname, 'init.sql');
    if (fs.existsSync(sqlPath)) {
      const sql = fs.readFileSync(sqlPath, 'utf8');
      await pool.query(sql);
      console.log('Database auto-initialized successfully!');
    }
  } catch (err) {
    console.log('Database already initialized or duplicate keys skipped.');
  }
}
autoInitDb();

// 3. กำหนด Static Folder สำหรับหน้าเว็บ (Public UI)
app.use(express.static(path.join(__dirname, 'public')));

// 4. API Endpoint ดึงข้อมูลสินค้า
app.get('/api/products', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products ORDER BY id ASC');
    // ส่งเฉพาะ Array ข้อมูลกลับไป
    res.json(result.rows || []);
  } catch (err) {
    console.error('Database query error:', err);
    // ถ้า DB มีปัญหา ให้ส่ง Array เปล่ากลับไปแทนเพื่อป้องกัน Frontend ค้าง
    res.status(500).json([]);
  }
});

// 5. สั่งให้ Express ฟังพอร์ต 24 ชั่วโมง (ป้องกัน App exited early)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});