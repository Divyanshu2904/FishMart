import express from 'express';
import { run, query, get } from '../db.js';
import { sellerAuth } from '../middleware/auth.js';

const router = express.Router();

// Helper to format DB product row to frontend Product structure
const formatProduct = (row) => ({
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
  deliveryRadius: row.delivery_radius_km,
  deliveryAvailable: row.delivery_available,
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
});

// @route   GET api/seller/stats
// @desc    Get dashboard stats for seller
router.get('/stats', sellerAuth, async (req, res) => {
  try {
    const sellerId = req.user.id;

    // Active listings count
    const activeListingsRes = await get(
      'SELECT COUNT(*) as count FROM products WHERE seller_id = $1',
      [sellerId]
    );

    // Total orders count
    const totalOrdersRes = await get(
      'SELECT COUNT(DISTINCT order_id) as count FROM order_items WHERE seller_id = $1',
      [sellerId]
    );

    // Total revenue sum
    const totalRevenueRes = await get(
      'SELECT SUM(price * quantity) as total FROM order_items WHERE seller_id = $1',
      [sellerId]
    );

    const totalRevenue = totalRevenueRes.total || 0;
    const activeListings = activeListingsRes.count || 0;
    const totalOrders = totalOrdersRes.count || 0;

    res.json({
      totalOrders,
      totalRevenue: `₹${totalRevenue.toLocaleString('en-IN')}`,
      activeListings,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error retrieving seller stats' });
  }
});

// @route   GET api/seller/orders
// @desc    Get orders containing seller's items
router.get('/orders', sellerAuth, async (req, res) => {
  try {
    const sellerId = req.user.id;

    // Query orders that contain at least one item from this seller
    const ordersRes = await query(
      `SELECT DISTINCT o.id, o.order_number, o.first_name, o.last_name, o.status, o.total_price
       FROM orders o
       JOIN order_items oi ON o.id = oi.order_id
       WHERE oi.seller_id = $1
       ORDER BY o.created_at DESC`,
      [sellerId]
    );

    const formattedOrders = [];

    for (const order of ordersRes) {
      // Get the items belonging to this seller in this order
      const items = await query(
        'SELECT name, quantity, price FROM order_items WHERE order_id = $1 AND seller_id = $2',
        [order.id, sellerId]
      );

      const itemsStr = items.map(item => `${item.name} (${item.quantity}kg)`).join(', ');
      const sellerTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      formattedOrders.push({
        id: order.order_number,
        customer: `${order.first_name} ${order.last_name}`,
        items: itemsStr,
        total: `₹${sellerTotal.toLocaleString('en-IN')}`,
        status: order.status.charAt(0).toUpperCase() + order.status.slice(1),
      });
    }

    res.json(formattedOrders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error retrieving seller orders' });
  }
});

// @route   PUT api/seller/orders/:orderNumber/status
// @desc    Update status of an order
router.put('/orders/:orderNumber/status', sellerAuth, async (req, res) => {
  const { status } = req.body;
  const { orderNumber } = req.params;

  if (!status) {
    return res.status(400).json({ message: 'Status is required' });
  }

  const lowercaseStatus = status.toLowerCase();
  const validStatuses = ['placed', 'confirmed', 'shipped', 'delivered'];
  if (!validStatuses.includes(lowercaseStatus)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  try {
    // Verify that the order exists
    const order = await get('SELECT * FROM orders WHERE order_number = $1', [orderNumber]);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Verify that the seller has items in this order
    const sellerItem = await get(
      'SELECT id FROM order_items WHERE order_id = $1 AND seller_id = $2 LIMIT 1',
      [order.id, req.user.id]
    );

    if (!sellerItem) {
      return res.status(403).json({ message: 'Not authorized to update status for this order' });
    }

    // Update order status
    await run('UPDATE orders SET status = $1 WHERE id = $2', [lowercaseStatus, order.id]);

    res.json({ message: 'Order status updated successfully', status: lowercaseStatus });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error updating order status' });
  }
});

// @route   GET api/seller/profile/:sellerId
// @desc    Get seller details and products for public profile page
router.get('/profile/:sellerId', async (req, res) => {
  const rawId = req.params.sellerId;
  const parsedId = rawId.startsWith('s') ? rawId.substring(1) : rawId.replace('seller-', '');

  try {
    const seller = await get(
      'SELECT id, name, email, rating, verified, created_at FROM users WHERE id = $1 AND role = $2',
      [parsedId, 'seller']
    );

    if (!seller) {
      return res.status(404).json({ message: 'Seller not found' });
    }

    // Get active products for this seller
    const productsRes = await query(
      `SELECT p.*, u.name as seller_name, u.rating as seller_rating, u.verified as seller_verified
       FROM products p
       JOIN users u ON p.seller_id = u.id
       WHERE p.seller_id = $1`,
      [seller.id]
    );

    const formattedProducts = productsRes.map(formatProduct);

    // Mock additional details from user database or preset profiles
    const memberSinceDate = new Date(seller.created_at);
    const memberSinceStr = memberSinceDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    // Map location and description if not set
    let location = 'West Bengal, India';
    let description = `${seller.name} is a verified seller on FishMart, committed to providing the freshest catches directly from local fisheries.`;
    let specialties = ['Freshwater Fish'];

    // Provide detailed descriptions for default seeded sellers
    if (seller.name.includes('Bengal')) {
      location = 'Kolkata, West Bengal';
      description = 'Specializing in freshwater fish from the Ganges delta. Our Hilsa and Rohu are famous across the country for their authentic taste and freshness.';
      specialties = ['Hilsa', 'Rohu', 'Catla', 'Bhetki'];
    } else if (seller.name.includes('Mumbai')) {
      location = 'Mumbai, Maharashtra';
      description = 'We are a family-owned fishery with over 20 years of experience in providing the freshest catch from the Arabian Sea. Our commitment to quality and sustainability sets us apart.';
      specialties = ['Pomfret', 'Surmai', 'Prawns', 'Crabs'];
    } else if (seller.name.includes('Kerala')) {
      location = 'Kochi, Kerala';
      description = 'Direct from the backwaters of Kerala, we bring you the finest seafood including the famous Kerala prawns and pearl spot fish. Freshness guaranteed!';
      specialties = ['Pearl Spot', 'Kerala Prawns', 'Mussels', 'Squid'];
    } else if (seller.name.includes('Goa')) {
      location = 'Panaji, Goa';
      description = 'Fresh catches from the Goan coastline. We specialize in exotic seafood varieties that are perfect for coastal cuisine lovers.';
      specialties = ['Kingfish', 'Red Snapper', 'Lobster', 'Oysters'];
    } else if (seller.name.includes('Bihar')) {
      location = 'Patna, Bihar';
      description = 'Delicious freshwater fish caught daily from the Ganges and Son rivers. Clean, tasty, and perfect for family meals.';
      specialties = ['Catla', 'Rohu', 'Tangra'];
    }

    res.json({
      id: 'seller-' + seller.id,
      name: seller.name,
      avatar: `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face`,
      location,
      rating: seller.rating || 5.0,
      totalReviews: 24, // demo reviews
      verified: !!seller.verified,
      memberSince: memberSinceStr,
      description,
      specialties,
      totalSales: 89, // demo sales
      responseTime: 'Usually responds within 1 hour',
      products: formattedProducts
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error retrieving seller profile' });
  }
});

// @route   GET api/seller/listings
// @desc    Get all product listings for the logged-in seller
router.get('/listings', sellerAuth, async (req, res) => {
  try {
    const productsRes = await query(
      `SELECT p.*, u.name as seller_name, u.rating as seller_rating, u.verified as seller_verified
       FROM products p
       JOIN users u ON p.seller_id = u.id
       WHERE p.seller_id = $1`,
      [req.user.id]
    );

    const formattedProducts = productsRes.map(formatProduct);
    res.json(formattedProducts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error retrieving listings' });
  }
});

export default router;
