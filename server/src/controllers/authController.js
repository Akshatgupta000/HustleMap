import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';

// Generate unique extension ID
function generateExtensionId() {
  return 'hm_' + crypto.randomBytes(6).toString('hex');
}
// Ensure we generate a unique extensionId (avoid collisions)
async function getUniqueExtensionId() {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const candidate = generateExtensionId();
    const exists = await User.findOne({ extensionId: candidate }).lean();
    if (!exists) return candidate;
  }
  // Fallback in case of rare collision (very unlikely)
  return generateExtensionId();
}
// Register
export const register = async (req, res, next) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res
        .status(400)
        .json({ error: 'Email, password, and name are required' });
    }

    if (!process.env.JWT_SECRET?.trim()) {
      console.error('Register: JWT_SECRET is not configured');
      return res.status(503).json({ error: 'Server configuration error' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Create user
    const extensionId = generateExtensionId();
    const user = await User.create({ email, password, name, extensionId });

    // Generate JWT
    const token = jwt.sign(
      { id: user._id.toString(), email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' },
    );

    res.status(201).json({
      token,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        extensionId: user.extensionId,
      },
    });
  } catch (error) {
    console.error('Register error:', error.message);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    next(error);
  }
};

// Login
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (!process.env.JWT_SECRET?.trim()) {
      console.error('Login: JWT_SECRET is not configured');
      return res.status(503).json({ error: 'Server configuration error' });
    }

    // Find user (include password for comparison)
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isValid = await user.comparePassword(password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user._id.toString(), email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' },
    );

    res.json({
      token,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        extensionId: user.extensionId,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    next(error);
  }
};

// Get or generate an extension ID for the current user
export const getExtensionId = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Invalid or missing user context' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.extensionId) {
      user.extensionId = await getUniqueExtensionId();
      await user.save();
    }

    return res.json({ extensionId: user.extensionId });
  } catch (error) {
    console.error('GetExtensionId error:', error);
    next(error);
  }
};
