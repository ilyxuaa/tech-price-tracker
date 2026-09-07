const express = require('express');
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();

// 1. รองรับการอ่านข้อมูล JSON จากฟอร์ม
app.use(express.json());

// 2. สั่งให้ Express ดึงไฟล์หน้าเว็บจากโฟลเดอร์ public อัตโนมัติ
app.use(express.static(path.join(__dirname, 'public')));

// 3. เชื่อมต่อ PostgreSQL Database
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

// 4. สั่งรัน init.sql อัตโนมัติสร้างตาราง
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

// --- Middleware ตรวจสิทธิ์ Admin ---
function verifyAdmin(req, res, next) {
  const token = req.headers['authorization'];
  if (!token) return res.status(401).json({ message: 'Access Denied' });

  try {
    const verified = jwt.verify(token, 'SECRET_KEY_HERE');
    if (verified.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: Admin only' });
    }
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).json({ message: 'Invalid Token' });
  }
}

// 5. API Endpoints
// ดึงข้อมูลสินค้า
app.get('/api/products', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products ORDER BY id ASC');
    res.json(result.rows || []);
  } catch (err) {
    console.error(err);
    res.status(500).json([]);
  }
});

// Register
app.post('/api/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query(
      'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3)',
      [username, email, hashedPassword]
    );
    res.json({ message: 'User registered successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error registering user' });
  }
});

// Login
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    
    if (result.rows.length === 0) {
      return res.status(400).json({ message: 'User not found' });
    }

    const user = result.rows[0];
    const validPass = await bcrypt.compare(password, user.password_hash);
    
    if (!validPass) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, 'SECRET_KEY_HERE');
    res.json({ token, role: user.role });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Database issue or table missing' });
  }
});

// Admin เพิ่มสินค้า
app.post('/api/admin/products', verifyAdmin, async (req, res) => {
  try {
    const { category, brand, model, price } = req.body;
    await pool.query(
      'INSERT INTO products (category, brand, model, price) VALUES ($1, $2, $3, $4)',
      [category, brand, model, price]
    );
    res.json({ message: 'Product added successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error adding product' });
  }
});

// 6. สั่งเปิด Server ค้างไว้
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});