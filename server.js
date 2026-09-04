JavaScript
const express = require('express');
const { Pool } = require('pg');
const path = require('path');

const app = express();

// --- แทรกบรรทัดนี้ลงไป (สร้าง pool ก่อนเรียกใช้งาน) ---
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

// สั่งรันไฟล์ init.sql เข้าฐานข้อมูลอัตโนมัติเมื่อเริ่มเซิร์ฟเวอร์
const fs = require('fs');
async function autoInitDb() {
  try {
    const sqlPath = path.join(__dirname, 'init.sql');
    if (fs.existsSync(sqlPath)) {
      const sql = fs.readFileSync(sqlPath, 'utf8');
      await pool.query(sql); // ตอนนี้ pool จะถูกนิยามเรียบร้อยแล้ว
      console.log('Database auto-initialized successfully!');
    }
  } catch (err) {
    console.error('Error auto-initializing database:', err);
  }
}
autoInitDb();