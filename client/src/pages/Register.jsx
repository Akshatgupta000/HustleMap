import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { setToken } from '../services/auth.js';
import api from '../services/api.js';

export default function Register() {
	const navigate = useNavigate();
	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);

	const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
	const validatePassword = (pwd) => pwd.length >= 8;
	const isValid = name.trim() && validateEmail(email) && validatePassword(password);

	async function handleSubmit(e) {
		e.preventDefault();
		setLoading(true);
		setError('');
		try {
			const { data } = await api.post('/auth/register', { name, email, password });
			setToken(data.token);
			navigate('/dashboard');
		} catch (err) {
			setError(err.response?.data?.message || 'Registration failed. Please try again.');
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
			<div className="w-full max-w-md bg-white rounded-lg shadow-lg border border-gray-200 p-8">
				{/* Header */}
				<div className="mb-8">
					<h1 className="text-2xl font-bold text-gray-900 mb-2">Create Account</h1>
					<p className="text-gray-600 text-sm">Join us today and get started</p>
				</div>

				{/* Error Alert */}
				{error && (
					<div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
						<p className="text-sm text-red-700">{error}</p>
					</div>
				)}

				{/* Form */}
				<form onSubmit={handleSubmit} className="space-y-5">
					{/* Name Field */}
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
						<input
							type="text"
							placeholder="John Doe"
							value={name}
							onChange={(e) => setName(e.target.value)}
							className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
						/>
					</div>

					{/* Email Field */}
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
						<input
							type="email"
							placeholder="you@example.com"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
						/>
					</div>

					{/* Password Field */}
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
						<input
							type="password"
							placeholder="Minimum 8 characters"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
						/>
						<p className="text-xs text-gray-500 mt-1">At least 8 characters for security</p>
					</div>

					{/* Submit Button */}
					<button
						type="submit"
						disabled={!isValid || loading}
						className={`w-full py-2.5 px-4 rounded-lg font-medium text-white text-sm transition-colors ${
							isValid && !loading
								? 'bg-blue-600 hover:bg-blue-700'
								: 'bg-gray-300 cursor-not-allowed'
						}`}
					>
						{loading ? 'Creating account...' : 'Create Account'}
					</button>
				</form>

				{/* Footer */}
				<p className="text-sm text-gray-600 text-center mt-6">
					Already have an account?{' '}
					<Link to="/login" className="text-blue-600 font-medium hover:text-blue-700">
						Sign In
					</Link>
				</p>
			</div>
		</div>
	);
}
