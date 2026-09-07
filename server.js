const express = require('express');
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const app = express();
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

// --- Middleware ตรวจสิทธิ์ Admin ---
function verifyAdmin(req, res, next) {
  const token = req.headers['authorization'];
  if (!token) return res.status(401).send('Access Denied');

  try {
    const verified = jwt.verify(token, 'SECRET_KEY_HERE');
    if (verified.role !== 'admin') {
      return res.status(403).send('Forbidden: Admin only');
    }
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).send('Invalid Token');
  }
}

// --- API สำหรับ Register / Login (เพิ่มไว้ตรงนี้) ---
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
    res.status(500).send('Error registering user');
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    if (result.rows.length === 0) return res.status(400).send('User not found');

    const user = result.rows[0];
    const validPass = await bcrypt.compare(password, user.password_hash);
    if (!validPass) return res.status(400).send('Invalid password');

    const token = jwt.sign({ id: user.id, role: user.role }, 'SECRET_KEY_HERE');
    res.json({ token, role: user.role });
  } catch (err) {
    res.status(500).send('Error logging in');
  }
});

// --- app.listen() ต้องอยู่ล่างสุดเสมอ! ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 