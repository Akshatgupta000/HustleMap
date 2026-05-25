import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import { sendOTPEmail } from '../utils/mailer.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
      console.warn(`[Login] Failed login attempt: User not found (${email})`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isValid = await user.comparePassword(password);
    if (!isValid) {
      console.warn(`[Login] Failed login attempt: Incorrect password for ${email}`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user._id.toString(), email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' },
    );

    console.log(`[Login] Successful login for: ${email}`);

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
    console.error(`[Login Error] Exception for email ${req.body?.email}:`, error);
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

// Get User Profile (Resume and Notes)
export const getUserProfile = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Invalid or missing user context' });
    }

    const user = await User.findById(userId).select('resumeUrl generalNotes name email');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({
      name: user.name,
      email: user.email,
      resumeUrl: user.resumeUrl,
      generalNotes: user.generalNotes
    });
  } catch (error) {
    console.error('GetUserProfile error:', error);
    next(error);
  }
};

// Update User Profile (Resume and Notes)
export const updateUserProfile = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Invalid or missing user context' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (req.body.name !== undefined) {
      user.name = req.body.name;
    }

    if (req.body.generalNotes !== undefined) {
      user.generalNotes = req.body.generalNotes;
    }

    if (req.file) {
      // req.file contains the uploaded file info from multer
      // Store relative path so frontend can construct full URL
      user.resumeUrl = '/uploads/' + req.file.filename;
    }

    await user.save();

    return res.json({
      message: 'Profile updated successfully',
      name: user.name,
      email: user.email,
      resumeUrl: user.resumeUrl,
      generalNotes: user.generalNotes
    });
  } catch (error) {
    console.error('UpdateUserProfile error:', error);
    next(error);
  }
};

// Delete Resume
export const deleteResume = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Invalid or missing user context' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.resumeUrl) {
      const filename = path.basename(user.resumeUrl);
      const filePath = path.join(__dirname, '..', '..', 'uploads', filename);
      
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      
      user.resumeUrl = undefined;
      await user.save();
    }

    return res.json({
      message: 'Resume deleted successfully',
      resumeUrl: user.resumeUrl,
    });
  } catch (error) {
    console.error('DeleteResume error:', error);
    next(error);
  }
};

// Request OTP for password reset
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'No accounts found' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store in DB with 15-minute expiry
    user.resetPasswordOtp = otp;
    user.resetPasswordOtpExpires = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    // Send email (falls back to console log if SMTP details are missing)
    await sendOTPEmail(user.email, otp);

    return res.json({ message: 'OTP sent to your email for password reset verification' });
  } catch (error) {
    console.error('ForgotPassword error:', error);
    next(error);
  }
};

// Verify OTP without resetting password
export const verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required' });
    }

    const user = await User.findOne({ email }).select('+resetPasswordOtp +resetPasswordOtpExpires');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify OTP
    console.log(`[verifyOtp] Comparing DB OTP: "${user.resetPasswordOtp}" (type: ${typeof user.resetPasswordOtp}) with User OTP: "${otp}" (type: ${typeof otp})`);
    if (!user.resetPasswordOtp || String(user.resetPasswordOtp).trim() !== String(otp).trim()) {
      console.warn(`[verifyOtp] Mismatch! DB OTP is "${user.resetPasswordOtp}", but User sent "${otp}"`);
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    // Check expiration
    if (new Date() > user.resetPasswordOtpExpires) {
      return res.status(400).json({ error: 'OTP has expired. Please request a new one' });
    }

    return res.json({ message: 'OTP verified successfully' });
  } catch (error) {
    console.error('VerifyOtp error:', error);
    next(error);
  }
};

// Reset password using OTP
export const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ error: 'Email, OTP, and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    // Retrieve user including reset fields
    const user = await User.findOne({ email }).select('+resetPasswordOtp +resetPasswordOtpExpires');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify OTP
    console.log(`[resetPassword] Comparing DB OTP: "${user.resetPasswordOtp}" (type: ${typeof user.resetPasswordOtp}) with User OTP: "${otp}" (type: ${typeof otp})`);
    if (!user.resetPasswordOtp || String(user.resetPasswordOtp).trim() !== String(otp).trim()) {
      console.warn(`[resetPassword] Mismatch! DB OTP is "${user.resetPasswordOtp}", but User sent "${otp}"`);
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    // Check expiration
    if (new Date() > user.resetPasswordOtpExpires) {
      return res.status(400).json({ error: 'OTP has expired. Please request a new one' });
    }

    // Update password (pre-save hook will hash it)
    user.password = newPassword;

    // Clear OTP fields
    user.resetPasswordOtp = undefined;
    user.resetPasswordOtpExpires = undefined;
    await user.save();

    return res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('ResetPassword error:', error);
    next(error);
  }
};
