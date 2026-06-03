import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { run, get } from '../db.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// @route   POST api/auth/signup
// @desc    Register a user
router.post('/signup', async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: 'Please enter all fields' });
  }

  if (role !== 'buyer' && role !== 'seller') {
    return res.status(400).json({ message: 'Invalid role' });
  }

  try {
    // Check if user exists
    const existingUser = await get('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert user
    // For sellers, start with verified = 0 (or 1 for default, let's set 1 for simple registration and verified status for demo purposes, or 0 and allow toggle)
    const verified = role === 'seller' ? 1 : 0; // Default verified to 1 for demo purposes so they show as verified
    const rating = role === 'seller' ? 5.0 : null;

    const result = await run(
      'INSERT INTO users (name, email, password, role, rating, verified) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, hashedPassword, role, rating, verified]
    );

    const newUser = await get('SELECT id, name, email, role, rating, verified FROM users WHERE id = ?', [result.id]);

    // Create JWT
    const token = jwt.sign(
      { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role },
      process.env.JWT_SECRET || 'supersecretkeyforfishmart',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        rating: newUser.rating,
        verified: !!newUser.verified,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// @route   POST api/auth/login
// @desc    Authenticate user & get token
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please enter all fields' });
  }

  try {
    // Check for user
    const user = await get('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create JWT
    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'supersecretkeyforfishmart',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        rating: user.rating,
        verified: !!user.verified,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// @route   GET api/auth/me
// @desc    Get current user
router.get('/me', auth, async (req, res) => {
  try {
    const user = await get('SELECT id, name, email, role, rating, verified FROM users WHERE id = ?', [req.user.id]);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      rating: user.rating,
      verified: !!user.verified,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching user details' });
  }
});

export default router;
