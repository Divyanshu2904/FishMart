import express from 'express';
import { run, query, get } from '../db.js';
import { sellerAuth } from '../middleware/auth.js';

const router = express.Router();

// Coordinates lookup map for standard seeded seller locations in India
const locationCoordinates = {
  'kolkata': { lat: 22.5726, lon: 88.3639 },
  'patna': { lat: 25.5941, lon: 85.1376 },
  'mumbai': { lat: 19.0760, lon: 72.8777 },
  'goa': { lat: 15.2993, lon: 74.1240 },
  'kochi': { lat: 9.9312, lon: 76.2673 },
  'chennai': { lat: 13.0827, lon: 80.2707 },
  'karwar': { lat: 14.8080, lon: 74.1300 },
  'mangalore': { lat: 12.9141, lon: 74.8560 },
};

// Haversine formula to compute distance in km
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Math.round(d * 10) / 10;
};

// Helper to format DB product row to frontend Product structure
const formatProduct = (row, userLat, userLon) => {
  let distance = undefined;
  if (userLat && userLon) {
    let pLat = row.latitude;
    let pLon = row.longitude;
    if (pLat === null || pLat === undefined || pLon === null || pLon === undefined) {
      const loc = (row.location || '').toLowerCase().trim();
      const coords = locationCoordinates[loc] || locationCoordinates['mumbai']; // default fallback
      pLat = coords.lat;
      pLon = coords.lon;
    }
    distance = calculateDistance(userLat, userLon, pLat, pLon);
  }

  const deliveryRadius = row.delivery_radius_km !== undefined && row.delivery_radius_km !== null ? row.delivery_radius_km : 100;
  const deliveryAvailable = distance !== undefined ? (distance <= deliveryRadius) : true;

  return {
    id: row.id.toString(),
    name: row.name,
    scientificName: row.scientific_name || undefined,
    price: row.price,
    unit: row.unit,
    image: row.image,
    location: row.location,
    state: row.state,
    latitude: row.latitude,
    longitude: row.longitude,
    deliveryRadius,
    deliveryAvailable,
    freshness: row.freshness,
    seller: {
      id: 's' + row.seller_id,
      name: row.seller_name,
      rating: row.seller_rating || 5.0,
      verified: !!row.seller_verified,
    },
    category: row.category,
    description: row.description,
    inStock: !!row.in_stock,
    weight: row.weight || undefined,
    distance,
  };
};

// @route   GET api/products
// @desc    Get all products (with optional filtering)
router.get('/', async (req, res) => {
  const { category, freshness, state, search, page, limit, userLat, userLon, nearMe, minPrice, maxPrice } = req.query;

  let sql = `
    SELECT p.*, u.name as seller_name, u.rating as seller_rating, u.verified as seller_verified
    FROM products p
    JOIN users u ON p.seller_id = u.id
    WHERE p.in_stock = 1
  `;
  const params = [];
  let idx = 1;

  if (category && category !== 'all') {
    sql += ` AND p.category = $${idx++}`;
    params.push(category);
  }

  if (freshness && freshness !== 'all') {
    sql += ` AND p.freshness = $${idx++}`;
    params.push(freshness);
  }

  if (state && state !== 'All India') {
    sql += ` AND (p.state = $${idx++} OR p.location = $${idx++})`;
    params.push(state, state);
  }

  if (search) {
    sql += ` AND (p.name ILIKE $${idx++} OR p.description ILIKE $${idx++})`;
    params.push(`%${search}%`, `%${search}%`);
  }

  if (minPrice) {
    sql += ` AND p.price >= $${idx++}`;
    params.push(parseFloat(minPrice));
  }

  if (maxPrice) {
    sql += ` AND p.price <= $${idx++}`;
    params.push(parseFloat(maxPrice));
  }

  try {
    const rows = await query(sql, params);
    
    // Format products and calculate distances if coordinates are provided
    const uLat = userLat ? parseFloat(userLat) : null;
    const uLon = userLon ? parseFloat(userLon) : null;
    let formattedProducts = rows.map(r => formatProduct(r, uLat, uLon));

    // If nearMe is true, sort products by distance (nearest first)
    if (nearMe === 'true' && uLat && uLon) {
      formattedProducts = formattedProducts.sort((a, b) => (a.distance || 99999) - (b.distance || 99999));
    }

    if (page || limit) {
      const pageNum = parseInt(page) || 1;
      const limitNum = parseInt(limit) || 8;
      const startIndex = (pageNum - 1) * limitNum;
      const paginatedItems = formattedProducts.slice(startIndex, startIndex + limitNum);
      return res.json({
        products: paginatedItems,
        totalProducts: formattedProducts.length,
        totalPages: Math.ceil(formattedProducts.length / limitNum),
        currentPage: pageNum,
        limit: limitNum
      });
    }

    res.json(formattedProducts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching products' });
  }
});

// @route   GET api/products/:id
// @desc    Get single product by ID
router.get('/:id', async (req, res) => {
  const { userLat, userLon } = req.query;
  try {
    const row = await get(
      `SELECT p.*, u.name as seller_name, u.rating as seller_rating, u.verified as seller_verified
       FROM products p
       JOIN users u ON p.seller_id = u.id
       WHERE p.id = $1`,
      [req.params.id]
    );

    if (!row) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const uLat = userLat ? parseFloat(userLat) : null;
    const uLon = userLon ? parseFloat(userLon) : null;
    res.json(formatProduct(row, uLat, uLon));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching product details' });
  }
});

// @route   POST api/products
// @desc    Create a product (Sellers only)
router.post('/', sellerAuth, async (req, res) => {
  const { name, scientificName, price, unit, image, location, state, latitude, longitude, deliveryRadius, freshness, category, description, weight } = req.body;

  if (!name || !price || !location || !state || !freshness || !category) {
    return res.status(400).json({ message: 'Please enter all required fields' });
  }

  try {
    const result = await run(
      `INSERT INTO products (name, scientific_name, price, unit, image, location, state, latitude, longitude, delivery_radius_km, freshness, category, description, weight, seller_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
      [
        name,
        scientificName || null,
        parseFloat(price),
        unit || 'kg',
        image || 'https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=400&h=300&fit=crop',
        location,
        state,
        latitude !== undefined && latitude !== '' ? parseFloat(latitude) : null,
        longitude !== undefined && longitude !== '' ? parseFloat(longitude) : null,
        deliveryRadius !== undefined && deliveryRadius !== '' ? parseInt(deliveryRadius) : 100,
        freshness,
        category,
        description || '',
        weight || null,
        req.user.id,
      ]
    );

    const newProd = await get(
      `SELECT p.*, u.name as seller_name, u.rating as seller_rating, u.verified as seller_verified
       FROM products p
       JOIN users u ON p.seller_id = u.id
       WHERE p.id = $1`,
      [result.id]
    );

    res.status(201).json(formatProduct(newProd));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error creating product listing' });
  }
});

// @route   PUT api/products/:id
// @desc    Update a product (Owner seller only)
router.put('/:id', sellerAuth, async (req, res) => {
  const { name, scientificName, price, unit, image, location, state, latitude, longitude, deliveryRadius, freshness, category, description, weight, inStock } = req.body;

  try {
    // Check ownership
    const product = await get('SELECT * FROM products WHERE id = $1', [req.params.id]);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.seller_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this listing' });
    }

    const inStockVal = inStock !== undefined ? (inStock ? 1 : 0) : product.in_stock;

    await run(
      `UPDATE products
       SET name = $1, scientific_name = $2, price = $3, unit = $4, image = $5, location = $6, state = $7, latitude = $8, longitude = $9, delivery_radius_km = $10, freshness = $11, category = $12, description = $13, weight = $14, in_stock = $15
       WHERE id = $16`,
      [
        name || product.name,
        scientificName !== undefined ? scientificName : product.scientific_name,
        price !== undefined ? parseFloat(price) : product.price,
        unit || product.unit,
        image || product.image,
        location || product.location,
        state || product.state,
        latitude !== undefined && latitude !== '' ? parseFloat(latitude) : product.latitude,
        longitude !== undefined && longitude !== '' ? parseFloat(longitude) : product.longitude,
        deliveryRadius !== undefined && deliveryRadius !== '' ? parseInt(deliveryRadius) : product.delivery_radius_km,
        freshness || product.freshness,
        category || product.category,
        description !== undefined ? description : product.description,
        weight !== undefined ? weight : product.weight,
        inStockVal,
        req.params.id,
      ]
    );

    const updatedProd = await get(
      `SELECT p.*, u.name as seller_name, u.rating as seller_rating, u.verified as seller_verified
       FROM products p
       JOIN users u ON p.seller_id = u.id
       WHERE p.id = $1`,
      [req.params.id]
    );

    res.json(formatProduct(updatedProd));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error updating product listing' });
  }
});

// @route   DELETE api/products/:id
// @desc    Delete a product (Owner seller only)
router.delete('/:id', sellerAuth, async (req, res) => {
  try {
    // Check ownership
    const product = await get('SELECT * FROM products WHERE id = $1', [req.params.id]);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.seller_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this listing' });
    }

    await run('DELETE FROM products WHERE id = $1', [req.params.id]);
    res.json({ message: 'Product listing deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error deleting product' });
  }
});

export default router;
