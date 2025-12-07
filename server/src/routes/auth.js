const express = require('express');
const jwt = require('jsonwebtoken');
// Choose user model based on DB_CLIENT env var: 'sqlite' (default), 'mysql', or 'pg'
let User;
const dbClient = process.env.DB_CLIENT || 'sqlite';
if (dbClient === 'mysql') {
	User = require('../models/UserMySQL');
} else if (dbClient === 'pg') {
	User = require('../models/UserSQL');
} else {
	User = require('../models/UserSQLite');
}

const router = express.Router();

function signToken(userId) {
	const secret = process.env.JWT_SECRET || 'dev-secret';
	return jwt.sign({ id: userId }, secret, { expiresIn: '7d' });
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
	try {
		const { name, email, password } = req.body;
		if (!name || !email || !password) {
			return res.status(400).json({ message: 'Name, email, and password are required' });
		}
		const existing = await User.findByEmail(email);
		if (existing) return res.status(400).json({ message: 'Email already registered' });
		const user = await User.create({ name, email, password });
		const token = signToken(user.id);
		return res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email } });
	} catch (err) {
		return res.status(500).json({ message: err.message });
	}
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
	try {
		const { email, password } = req.body;
		if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });
		const user = await User.findByEmail(email);
		if (!user) return res.status(400).json({ message: 'Invalid credentials' });
		const match = await user.comparePassword(password);
		if (!match) return res.status(400).json({ message: 'Invalid credentials' });
		const token = signToken(user.id);
		return res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
	} catch (err) {
		return res.status(500).json({ message: err.message });
	}
});

module.exports = router;


