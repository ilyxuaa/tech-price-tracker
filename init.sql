-- สร้างตารางเก็บหมวดหมู่
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL
);

-- สร้างตารางเก็บข้อมูลสินค้า
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    category_id INT REFERENCES categories(id),
    brand VARCHAR(50),
    model VARCHAR(100) NOT NULL,
    specs TEXT
);

-- สร้างตารางเก็บราคาจากร้านต่างๆ (IHAVECPU, JIB, ADVICE, BANANA)
CREATE TABLE IF NOT EXISTS store_prices (
    id SERIAL PRIMARY KEY,
    product_id INT REFERENCES products(id),
    store_name VARCHAR(50) NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    product_url TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- สร้างตารางเก็บประวัติราคาสำหรับวาดกราฟ
CREATE TABLE IF NOT EXISTS price_history (
    id SERIAL PRIMARY KEY,
    product_id INT REFERENCES products(id),
    store_name VARCHAR(50) NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    recorded_at DATE NOT NULL
);

-- ใส่ข้อมูล หมวดหมู่
INSERT INTO categories (id, name) VALUES 
(1, 'CPU'), (2, 'GPU'), (3, 'RAM'), (4, 'Mainboard'), 
(5, 'PSU'), (6, 'M.2 NVMe'), (7, 'HDD SATA'), (8, 'Case'), (9, 'Monitor');

-- ตัวอย่างใส่ข้อมูล CPU Intel 5 ชิ้น
INSERT INTO products (id, category_id, brand, model) VALUES
(1, 1, 'Intel', 'Core i5-13400F'),
(2, 1, 'Intel', 'Core i5-14600K'),
(3, 1, 'Intel', 'Core i7-13700K'),
(4, 1, 'Intel', 'Core i7-14700K'),
(5, 1, 'Intel', 'Core i9-14900K'),
-- CPU Ryzen 5 ชิ้น
(6, 1, 'AMD', 'Ryzen 5 5600X'),
(7, 1, 'AMD', 'Ryzen 5 7600X'),
(8, 1, 'AMD', 'Ryzen 7 5800X3D'),
(9, 1, 'AMD', 'Ryzen 7 7800X3D'),
(10, 1, 'AMD', 'Ryzen 9 7900X');

-- ข้อมูลตัวอย่างราคาร้านค้า (iHaveCPU, JIB, Advice, BaNANA)
INSERT INTO store_prices (product_id, store_name, price, product_url) VALUES
(1, 'iHaveCPU', 6190, '#'), (1, 'JIB', 6250, '#'), (1, 'Advice', 6150, '#'), (1, 'BaNANA', 6290, '#'),
(9, 'iHaveCPU', 14900, '#'), (9, 'JIB', 15200, '#'), (9, 'Advice', 14850, '#'), (9, 'BaNANA', 15100, '#');

-- ข้อมูลตัวอย่างประวัติราคาสำหรับกราฟ (ย้อนหลัง 3 เดือน)
INSERT INTO price_history (product_id, store_name, price, recorded_at) VALUES
(1, 'Advice', 6450, '2026-06-01'),
(1, 'Advice', 6300, '2026-07-01'),
(1, 'Advice', 6150, '2026-08-01'),
(9, 'Advice', 15900, '2026-06-01'),
(9, 'Advice', 15200, '2026-07-01'),
(9, 'Advice', 14850, '2026-08-01');

-- สร้างตาราง users
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);