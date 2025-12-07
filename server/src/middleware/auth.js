const jwt = require('jsonwebtoken');

function authenticate(req, res, next) {
	const authHeader = req.headers.authorization || '';
	const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
	if (!token) return res.status(401).json({ message: 'No token provided' });
	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
		req.user = { id: decoded.id };
		return next();
	} catch (err) {
		return res.status(401).json({ message: 'Invalid token' });
	}
}

module.exports = { authenticate };


