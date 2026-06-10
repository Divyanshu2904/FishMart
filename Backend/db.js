import pkg from 'pg';
import bcrypt from 'bcryptjs';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/fishmart',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Helper: multiple rows
export const query = async (text, params = []) => {
  const res = await pool.query(text, params);
  return res.rows;
};

// Helper: single row
export const get = async (text, params = []) => {
  const res = await pool.query(text, params);
  return res.rows[0] || null;
};

// Helper: insert/update/delete
export const run = async (text, params = []) => {
  const returningText = text.trim().toUpperCase().startsWith('INSERT') ? text + ' RETURNING id' : text;
  const res = await pool.query(returningText, params);
  return { id: res.rows[0]?.id, changes: res.rowCount };
};

export const initDB = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('buyer','seller')),
      rating REAL DEFAULT 5.0,
      verified INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      scientific_name TEXT,
      price REAL NOT NULL,
      unit TEXT DEFAULT 'kg',
      image TEXT,
      location TEXT,
      state TEXT,
      latitude REAL,
      longitude REAL,
      delivery_radius_km INTEGER DEFAULT 100,
      delivery_available BOOLEAN DEFAULT true,
      freshness TEXT CHECK(freshness IN ('fresh','live','frozen')),
      category TEXT CHECK(category IN ('freshwater','saltwater','shellfish','prawns')),
      description TEXT,
      in_stock INTEGER DEFAULT 1,
      weight TEXT,
      seller_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS orders (
      id SERIAL PRIMARY KEY,
      order_number TEXT UNIQUE NOT NULL,
      buyer_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      status TEXT DEFAULT 'placed' CHECK(status IN ('placed','confirmed','shipped','delivered')),
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      address TEXT NOT NULL,
      city TEXT NOT NULL,
      state TEXT NOT NULL,
      pin_code TEXT NOT NULL,
      phone TEXT NOT NULL,
      total_price REAL NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS order_items (
      id SERIAL PRIMARY KEY,
      order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
      seller_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      quantity INTEGER NOT NULL
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS reviews (
      id SERIAL PRIMARY KEY,
      product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
      seller_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      buyer_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      buyer_name TEXT NOT NULL,
      rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
      title TEXT NOT NULL,
      comment TEXT NOT NULL,
      helpful_count INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);

  const userCount = await get('SELECT COUNT(*) as count FROM users');
  if (parseInt(userCount.count) === 0) {
    await seedDatabase();
  }

  console.log('PostgreSQL database initialized.');
};

async function seedDatabase() {
  const pass = await bcrypt.hash('password123', 10);

  const sellers = [
    { name: 'Bengal Fresh Fish',      email: 'bengal@fishmart.com',    rating: 4.8 },
    { name: 'Bihar River Fish',        email: 'bihar@fishmart.com',     rating: 4.6 },
    { name: 'Mumbai Sea Catch',        email: 'mumbai@fishmart.com',    rating: 4.9 },
    { name: 'Goan Fishermen Co-op',    email: 'goa@fishmart.com',       rating: 4.7 },
    { name: 'Kerala Seafood Hub',      email: 'kerala@fishmart.com',    rating: 4.8 },
    { name: 'Premium Imports TN',      email: 'tamilnadu@fishmart.com', rating: 4.5 },
    { name: 'Coastal Karnataka Fresh', email: 'karnataka@fishmart.com', rating: 4.6 },
  ];

  const sellerMap = {};
  for (const s of sellers) {
    const res = await pool.query(
      'INSERT INTO users (name, email, password, role, rating, verified) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id',
      [s.name, s.email, pass, 'seller', s.rating, 1]
    );
    sellerMap[s.name] = res.rows[0].id;
  }

  await pool.query(
    'INSERT INTO users (name, email, password, role) VALUES ($1,$2,$3,$4)',
    ['Demo Buyer', 'buyer@fishmart.com', pass, 'buyer']
  );

  const products = [
    { name:'Rohu', scientific_name:'Labeo rohita', price:280, location:'Kolkata', state:'West Bengal', lat:22.5726, lng:88.3639, freshness:'fresh', sellerName:'Bengal Fresh Fish', category:'freshwater', description:'Fresh Rohu from Bengal fisheries.', image:'https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=400&h=300&fit=crop' },
    { name:'Catla', scientific_name:'Catla catla', price:320, location:'Patna', state:'Bihar', lat:25.5941, lng:85.1376, freshness:'live', sellerName:'Bihar River Fish', category:'freshwater', description:'Live Catla, tender and flavorful.', image:'https://images.unsplash.com/photo-1498654200943-1088dd4438ae?w=400&h=300&fit=crop' },
    { name:'Pomfret', scientific_name:'Pampus argenteus', price:850, location:'Mumbai', state:'Maharashtra', lat:19.0760, lng:72.8777, freshness:'fresh', sellerName:'Mumbai Sea Catch', category:'saltwater', description:'Premium white Pomfret from Arabian Sea.', image:'https://images.unsplash.com/photo-1534604973900-c43ab4c2e0ab?w=400&h=300&fit=crop' },
    { name:'King Fish (Surmai)', scientific_name:'Scomberomorus guttatus', price:650, location:'Panaji', state:'Goa', lat:15.4909, lng:73.8278, freshness:'fresh', sellerName:'Goan Fishermen Co-op', category:'saltwater', description:'Fresh Surmai, a Goan favorite.', image:'https://images.unsplash.com/photo-1559737558-2f5a35f4523b?w=400&h=300&fit=crop' },
    { name:'Tiger Prawns', scientific_name:'Penaeus monodon', price:780, location:'Kochi', state:'Kerala', lat:9.9312, lng:76.2673, freshness:'live', sellerName:'Kerala Seafood Hub', category:'prawns', description:'Jumbo tiger prawns from Kerala backwaters.', image:'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=400&h=300&fit=crop' },
    { name:'Salmon', scientific_name:'Salmo salar', price:1200, location:'Chennai', state:'Tamil Nadu', lat:13.0827, lng:80.2707, freshness:'frozen', sellerName:'Premium Imports TN', category:'saltwater', description:'Imported Atlantic Salmon, flash frozen.', image:'https://images.unsplash.com/photo-1574781330855-d0db8cc6a79c?w=400&h=300&fit=crop' },
    { name:'Hilsa', scientific_name:'Tenualosa ilisha', price:1500, location:'Kolkata', state:'West Bengal', lat:22.5726, lng:88.3639, freshness:'fresh', sellerName:'Bengal Fresh Fish', category:'freshwater', description:'The king of fish! Seasonal Hilsa.', image:'https://images.unsplash.com/photo-1510130387422-82bed34b37e9?w=400&h=300&fit=crop' },
    { name:'Mud Crab', scientific_name:'Scylla serrata', price:900, location:'Mangalore', state:'Karnataka', lat:12.9141, lng:74.8560, freshness:'live', sellerName:'Coastal Karnataka Fresh', category:'shellfish', description:'Live mud crabs, heavy and meaty.', image:'https://images.unsplash.com/photo-1559737558-2f5a35f4523b?w=400&h=300&fit=crop' },
  ];

  for (const p of products) {
    const sId = sellerMap[p.sellerName] || Object.values(sellerMap)[0];
    await pool.query(
      `INSERT INTO products (name,scientific_name,price,unit,image,location,state,latitude,longitude,freshness,category,description,in_stock,seller_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)`,
      [p.name, p.scientific_name, p.price, 'kg', p.image, p.location, p.state, p.lat, p.lng, p.freshness, p.category, p.description, 1, sId]
    );
  }
  console.log('Seed data inserted.');
}

export default pool;
