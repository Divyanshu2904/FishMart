import express from 'express';
import { query, get, run } from '../db.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// GET /api/reviews/product/:productId - Get reviews for a product
router.get('/product/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const reviews = await query(
      `SELECT * FROM reviews WHERE product_id = ? ORDER BY created_at DESC`,
      [productId]
    );

    // Map fields to match frontend interface
    const formattedReviews = reviews.map(r => ({
      id: r.id.toString(),
      productId: r.product_id ? r.product_id.toString() : undefined,
      sellerId: r.seller_id ? r.seller_id.toString() : undefined,
      userName: r.author_name,
      userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=50&h=50&fit=crop',
      rating: r.rating,
      title: r.title || 'Product Review',
      comment: r.comment,
      date: new Date(r.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      helpful: r.helpful || 0,
      verified: true
    }));

    res.json(formattedReviews);
  } catch (err) {
    console.error('Error fetching product reviews:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/reviews/seller/:sellerId - Get reviews for a seller
router.get('/seller/:sellerId', async (req, res) => {
  try {
    const { sellerId } = req.params;
    const reviews = await query(
      `SELECT * FROM reviews WHERE seller_id = ? AND product_id IS NULL ORDER BY created_at DESC`,
      [sellerId]
    );

    const formattedReviews = reviews.map(r => ({
      id: r.id.toString(),
      sellerId: r.seller_id ? r.seller_id.toString() : undefined,
      userName: r.author_name,
      userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=50&h=50&fit=crop',
      rating: r.rating,
      title: r.title || 'Seller Review',
      comment: r.comment,
      date: new Date(r.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      helpful: r.helpful || 0,
      verified: true
    }));

    res.json(formattedReviews);
  } catch (err) {
    console.error('Error fetching seller reviews:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/reviews/product/:productId - Add a review for a product
router.post('/product/:productId', auth, async (req, res) => {
  try {
    const { productId } = req.params;
    const { rating, title, comment } = req.body;
    const authorName = req.user.name || 'Anonymous';

    if (!rating || !comment) {
      return res.status(400).json({ message: 'Rating and comment are required' });
    }

    // Get the product's seller_id
    const product = await get('SELECT seller_id FROM products WHERE id = ?', [productId]);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const result = await run(
      `INSERT INTO reviews (product_id, seller_id, rating, title, comment, author_name)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [productId, product.seller_id, rating, title, comment, authorName]
    );

    // Fetch the inserted review
    const newReview = await get('SELECT * FROM reviews WHERE id = ?', [result.id]);

    // Recalculate average seller rating
    const avgRatingRow = await get('SELECT AVG(rating) as avg_rating FROM reviews WHERE seller_id = ?', [product.seller_id]);
    if (avgRatingRow && avgRatingRow.avg_rating) {
      await run('UPDATE users SET rating = ? WHERE id = ?', [Math.round(avgRatingRow.avg_rating * 10) / 10, product.seller_id]);
    }

    res.status(201).json({
      id: newReview.id.toString(),
      productId: newReview.product_id.toString(),
      sellerId: newReview.seller_id.toString(),
      userName: newReview.author_name,
      userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=50&h=50&fit=crop',
      rating: newReview.rating,
      title: newReview.title || 'Product Review',
      comment: newReview.comment,
      date: new Date(newReview.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      helpful: 0,
      verified: true
    });
  } catch (err) {
    console.error('Error creating product review:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/reviews/seller/:sellerId - Add a review for a seller
router.post('/seller/:sellerId', auth, async (req, res) => {
  try {
    const { sellerId } = req.params;
    const { rating, title, comment } = req.body;
    const authorName = req.user.name || 'Anonymous';

    if (!rating || !comment) {
      return res.status(400).json({ message: 'Rating and comment are required' });
    }

    const result = await run(
      `INSERT INTO reviews (seller_id, rating, title, comment, author_name)
       VALUES (?, ?, ?, ?, ?)`,
      [sellerId, rating, title, comment, authorName]
    );

    const newReview = await get('SELECT * FROM reviews WHERE id = ?', [result.id]);

    // Recalculate average seller rating
    const avgRatingRow = await get('SELECT AVG(rating) as avg_rating FROM reviews WHERE seller_id = ?', [sellerId]);
    if (avgRatingRow && avgRatingRow.avg_rating) {
      await run('UPDATE users SET rating = ? WHERE id = ?', [Math.round(avgRatingRow.avg_rating * 10) / 10, sellerId]);
    }

    res.status(201).json({
      id: newReview.id.toString(),
      sellerId: newReview.seller_id.toString(),
      userName: newReview.author_name,
      userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=50&h=50&fit=crop',
      rating: newReview.rating,
      title: newReview.title || 'Seller Review',
      comment: newReview.comment,
      date: new Date(newReview.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      helpful: 0,
      verified: true
    });
  } catch (err) {
    console.error('Error creating seller review:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
