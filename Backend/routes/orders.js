import express from 'express';
import jwt from 'jsonwebtoken';
import { run, query, get } from '../db.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Helper to generate a unique order number (e.g., FM-2026-001234)
const generateOrderNumber = () => {
  const year = new Date().getFullYear();
  const rand = Math.floor(100000 + Math.random() * 900000);
  return `FM-${year}-${rand}`;
};

// @route   POST api/orders/checkout
// @desc    Place an order
router.post('/checkout', async (req, res) => {
  const { shippingAddress, items } = req.body;

  if (!shippingAddress || !items || items.length === 0) {
    return res.status(400).json({ message: 'Missing shipping address or cart items' });
  }

  const { firstName, lastName, address, city, state, pinCode, phone } = shippingAddress;

  if (!firstName || !lastName || !address || !city || !state || !pinCode || !phone) {
    return res.status(400).json({ message: 'All shipping address fields are required' });
  }

  // Attempt to parse auth token if present
  let buyerId = null;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretkeyforfishmart');
      buyerId = decoded.id;
    } catch (err) {
      // Ignore token error, proceed as guest
    }
  }

  try {
    // Calculate total price and verify products
    let totalPrice = 0;
    const itemsToInsert = [];

    for (const item of items) {
      const dbProd = await get('SELECT * FROM products WHERE id = ?', [item.product.id]);
      if (!dbProd) {
        return res.status(400).json({ message: `Product ${item.product.name} not found` });
      }
      const quantity = parseInt(item.quantity) || 1;
      const price = dbProd.price;
      totalPrice += price * quantity;
      
      itemsToInsert.push({
        productId: dbProd.id,
        sellerId: dbProd.seller_id,
        name: dbProd.name,
        price: price,
        quantity: quantity
      });
    }

    const orderNumber = generateOrderNumber();

    // Insert order record
    const orderResult = await run(
      `INSERT INTO orders (order_number, buyer_id, status, first_name, last_name, address, city, state, pin_code, phone, total_price)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [orderNumber, buyerId, 'placed', firstName, lastName, address, city, state, pinCode, phone, totalPrice]
    );

    const orderId = orderResult.id;

    // Insert order items
    for (const item of itemsToInsert) {
      await run(
        `INSERT INTO order_items (order_id, product_id, seller_id, name, price, quantity)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [orderId, item.productId, item.sellerId, item.name, item.price, item.quantity]
      );
    }

    res.status(201).json({
      message: 'Order placed successfully',
      orderId,
      orderNumber,
      totalPrice
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error processing order' });
  }
});

// @route   GET api/orders/track/:orderNumber
// @desc    Get order status and details by order number
router.get('/track/:orderNumber', async (req, res) => {
  try {
    const order = await get('SELECT * FROM orders WHERE order_number = ?', [req.params.orderNumber]);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const items = await query(
      `SELECT name, price, quantity FROM order_items WHERE order_id = ?`,
      [order.id]
    );

    // Format dates nicely
    const orderDate = new Date(order.created_at);
    const estDeliveryDate = new Date(orderDate);
    estDeliveryDate.setDate(orderDate.getDate() + 3);

    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const orderDateStr = orderDate.toLocaleDateString('en-US', options);
    const estDeliveryDateStr = estDeliveryDate.toLocaleDateString('en-US', options);

    // Build timeline dynamically
    const statusOrder = ['placed', 'confirmed', 'shipped', 'delivered'];
    const currentStatusIndex = statusOrder.indexOf(order.status);

    const timeline = [
      {
        status: 'Order Placed',
        date: orderDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        time: orderDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        completed: currentStatusIndex >= 0,
        current: order.status === 'placed',
      },
      {
        status: 'Order Confirmed',
        date: currentStatusIndex >= 1 ? orderDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '',
        time: currentStatusIndex >= 1 ? '11:15 AM' : '',
        completed: currentStatusIndex >= 1,
        current: order.status === 'confirmed',
      },
      {
        status: 'Shipped',
        date: currentStatusIndex >= 2 ? new Date(orderDate.getTime() + 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '',
        time: currentStatusIndex >= 2 ? '09:00 AM' : '',
        completed: currentStatusIndex >= 2,
        current: order.status === 'shipped',
      },
      {
        status: 'Delivered',
        date: currentStatusIndex >= 3 ? estDeliveryDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Expected',
        time: currentStatusIndex >= 3 ? '02:30 PM' : '',
        completed: currentStatusIndex >= 3,
        current: order.status === 'delivered',
      },
    ];

    res.json({
      id: order.order_number,
      status: order.status,
      orderDate: orderDateStr,
      estimatedDelivery: estDeliveryDateStr,
      items: items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price
      })),
      shippingAddress: `${order.address}, ${order.city}, ${order.state} ${order.pin_code}`,
      timeline
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error retrieving tracking status' });
  }
});

export default router;
