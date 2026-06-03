import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, 'fishmart.db');

// Connect to SQLite
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    console.log('Connected to SQLite database.');
  }
});

// Database promise helpers
export const query = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

export const get = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

export const run = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
};

// Initialize DB schema & seed data
export const initDB = async () => {
  // Create tables
  await run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('buyer', 'seller')),
      rating REAL DEFAULT 5.0,
      verified INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      scientific_name TEXT,
      price REAL NOT NULL,
      unit TEXT DEFAULT 'kg',
      image TEXT,
      location TEXT,
      state TEXT,
      freshness TEXT CHECK(freshness IN ('fresh', 'live', 'frozen')),
      category TEXT CHECK(category IN ('freshwater', 'saltwater', 'shellfish', 'prawns')),
      description TEXT,
      in_stock INTEGER DEFAULT 1,
      weight TEXT,
      seller_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_number TEXT UNIQUE NOT NULL,
      buyer_id INTEGER,
      status TEXT DEFAULT 'placed' CHECK(status IN ('placed', 'confirmed', 'shipped', 'delivered')),
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      address TEXT NOT NULL,
      city TEXT NOT NULL,
      state TEXT NOT NULL,
      pin_code TEXT NOT NULL,
      phone TEXT NOT NULL,
      total_price REAL NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE SET NULL
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      product_id INTEGER,
      seller_id INTEGER,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      quantity INTEGER NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL,
      FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE SET NULL
    )
  `);

  // Seed default sellers and products if empty
  const userCount = await get('SELECT COUNT(*) as count FROM users');
  if (userCount.count === 0) {
    console.log('Seeding database with default sellers and products...');
    
    const hashedPassword = bcrypt.hashSync('password123', 10);
    
    // Seed default sellers
    const sellersSeed = [
      { name: 'Bengal Fresh Fish', email: 'bengal@fishmart.com', rating: 4.8, verified: 1 },
      { name: 'Bihar River Fish', email: 'bihar@fishmart.com', rating: 4.6, verified: 1 },
      { name: 'Mumbai Sea Catch', email: 'mumbai@fishmart.com', rating: 4.9, verified: 1 },
      { name: 'Goan Fishermen Co-op', email: 'goa@fishmart.com', rating: 4.7, verified: 1 },
      { name: 'Kerala Seafood Hub', email: 'kerala@fishmart.com', rating: 4.8, verified: 1 },
      { name: 'Premium Imports TN', email: 'tamilnadu@fishmart.com', rating: 4.5, verified: 1 },
      { name: 'Coastal Karnataka Fresh', email: 'karnataka@fishmart.com', rating: 4.6, verified: 1 },
    ];

    const sellerMap = {}; // Maps seed name to database ID

    for (const seller of sellersSeed) {
      const res = await run(
        'INSERT INTO users (name, email, password, role, rating, verified) VALUES (?, ?, ?, ?, ?, ?)',
        [seller.name, seller.email, hashedPassword, 'seller', seller.rating, seller.verified]
      );
      sellerMap[seller.name] = res.id;
    }

    // Seed default buyer
    await run(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      ['Demo Buyer', 'buyer@fishmart.com', hashedPassword, 'buyer']
    );

    // Seed default products
    const productsSeed = [
      {
        name: 'Rohu',
        scientific_name: 'Labeo rohita',
        price: 280,
        unit: 'kg',
        image: 'https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=400&h=300&fit=crop',
        location: 'Kolkata',
        state: 'West Bengal',
        freshness: 'fresh',
        sellerName: 'Bengal Fresh Fish',
        category: 'freshwater',
        description: 'Fresh Rohu fish, locally sourced from Bengal fisheries. Perfect for traditional curries.',
        in_stock: 1,
      },
      {
        name: 'Catla',
        scientific_name: 'Catla catla',
        price: 320,
        unit: 'kg',
        image: 'https://images.unsplash.com/photo-1498654200943-1088dd4438ae?w=400&h=300&fit=crop',
        location: 'Patna',
        state: 'Bihar',
        freshness: 'live',
        sellerName: 'Bihar River Fish',
        category: 'freshwater',
        description: 'Live Catla fish, known for its tender and flavorful meat. Ideal for special occasions.',
        in_stock: 1,
      },
      {
        name: 'Pomfret',
        scientific_name: 'Pampus argenteus',
        price: 850,
        unit: 'kg',
        image: 'https://images.unsplash.com/photo-1534604973900-c43ab4c2e0ab?w=400&h=300&fit=crop',
        location: 'Mumbai',
        state: 'Maharashtra',
        freshness: 'fresh',
        sellerName: 'Mumbai Sea Catch',
        category: 'saltwater',
        description: 'Premium white Pomfret, caught fresh from Arabian Sea. Delicate taste and texture.',
        in_stock: 1,
      },
      {
        name: 'King Fish (Surmai)',
        scientific_name: 'Scomberomorus guttatus',
        price: 650,
        unit: 'kg',
        image: 'https://images.unsplash.com/photo-1559737558-2f5a35f4523b?w=400&h=300&fit=crop',
        location: 'Goa',
        state: 'Goa',
        freshness: 'fresh',
        sellerName: 'Goan Fishermen Co-op',
        category: 'saltwater',
        description: 'Fresh Surmai, a Goan favorite. Perfect for grilling, frying or curry preparations.',
        in_stock: 1,
      },
      {
        name: 'Tiger Prawns',
        scientific_name: 'Penaeus monodon',
        price: 780,
        unit: 'kg',
        image: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=400&h=300&fit=crop',
        location: 'Kochi',
        state: 'Kerala',
        freshness: 'live',
        sellerName: 'Kerala Seafood Hub',
        category: 'prawns',
        description: 'Jumbo tiger prawns from Kerala backwaters. Sweet, succulent and perfect for any cuisine.',
        in_stock: 1,
      },
      {
        name: 'Salmon',
        scientific_name: 'Salmo salar',
        price: 1200,
        unit: 'kg',
        image: 'https://images.unsplash.com/photo-1574781330855-d0db8cc6a79c?w=400&h=300&fit=crop',
        location: 'Chennai',
        state: 'Tamil Nadu',
        freshness: 'frozen',
        sellerName: 'Premium Imports TN',
        category: 'saltwater',
        description: 'Imported Atlantic Salmon, flash frozen for freshness. Rich in Omega-3.',
        in_stock: 1,
      },
      {
        name: 'Hilsa',
        scientific_name: 'Tenualosa ilisha',
        price: 1500,
        unit: 'kg',
        image: 'https://images.unsplash.com/photo-1510130387422-82bed34b37e9?w=400&h=300&fit=crop',
        location: 'Kolkata',
        state: 'West Bengal',
        freshness: 'fresh',
        sellerName: 'Bengal Fresh Fish',
        category: 'freshwater',
        description: 'The king of fish! Seasonal Hilsa with its distinctive taste. A Bengali delicacy.',
        in_stock: 1,
      },
      {
        name: 'Crab (Mud)',
        scientific_name: 'Scylla serrata',
        price: 900,
        unit: 'kg',
        image: 'https://images.unsplash.com/photo-1559737558-2f5a35f4523b?w=400&h=300&fit=crop',
        location: 'Mangalore',
        state: 'Karnataka',
        freshness: 'live',
        sellerName: 'Coastal Karnataka Fresh',
        category: 'shellfish',
        description: 'Live mud crabs, heavy and meaty. Perfect for crab masala or butter garlic preparations.',
        in_stock: 1,
      },
    ];

    for (const prod of productsSeed) {
      const sId = sellerMap[prod.sellerName] || sellerMap['Bengal Fresh Fish'];
      await run(
        `INSERT INTO products (name, scientific_name, price, unit, image, location, state, freshness, category, description, in_stock, seller_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [prod.name, prod.scientific_name, prod.price, prod.unit, prod.image, prod.location, prod.state, prod.freshness, prod.category, prod.description, prod.in_stock, sId]
      );
    }
    console.log('Database seeded successfully.');
  }
};

export default db;
