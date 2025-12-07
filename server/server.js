const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { query } = require('./src/config/database-sqlite');
require('dotenv').config();

const authRoutes = require('./src/routes/auth');
const jobRoutes = require('./src/routes/jobs');
const { authenticate } = require('./src/middleware/auth');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Health check
app.get('/api/health', (req, res) => {
	res.json({ status: 'ok' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', authenticate, jobRoutes);

// Error handler (basic)
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
	console.error(err);
	res.status(err.status || 500).json({ message: err.message || 'Server error' });
});

const PORT = process.env.PORT || 5000;

// Test database connection
query('SELECT 1')
	.then(() => {
		console.log('Connected to SQLite database');
		app.listen(PORT, () => {
			console.log(`Server running on port ${PORT}`);
		});
	})
	.catch((err) => {
		console.error('Database connection error:', err.message);
		process.exit(1);
	});


