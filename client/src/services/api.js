import { getToken } from './auth.js';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

async function request(endpoint, options = {}) {
	const token = getToken();
	const headers = {
		'Content-Type': 'application/json',
		...options.headers,
	};
	
	if (token) {
		headers.Authorization = `Bearer ${token}`;
	}

	const response = await fetch(`${API_URL}${endpoint}`, {
		...options,
		headers,
	});

	const data = await response.json();

	if (!response.ok) {
		const error = new Error(data.message || 'Request failed');
		error.response = { data, status: response.status };
		throw error;
	}

	return { data };
}

const api = {
	get: (endpoint) => request(endpoint, { method: 'GET' }),
	post: (endpoint, body) => request(endpoint, { method: 'POST', body: JSON.stringify(body) }),
	put: (endpoint, body) => request(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
	delete: (endpoint) => request(endpoint, { method: 'DELETE' }),
};

export default api;


