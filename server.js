const express = require('express');
const { Pool } = require('pg');
const path = require('path');

const app = express();
// สั่งรันไฟล์ init.sql เข้าฐานข้อมูลอัตโนมัติเมื่อเริ่มเซิร์ฟเวอร์
const fs = require('fs');
async function autoInitDb() {
  try {
    const sqlPath = path.join(__dirname, 'init.sql');
    if (fs.existsSync(sqlPath)) {
      const sql = fs.readFileSync(sqlPath, 'utf8');
      await pool.query(sql);
      console.log('Database auto-initialized successfully!');
    }
  } catch (err) {
    console.error('Error auto-initializing database:', err);
  }
}
autoInitDb();