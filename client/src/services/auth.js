const TOKEN_KEY = 'jt_token';

export function setToken(token) {
	localStorage.setItem(TOKEN_KEY, token);
}

export function getToken() {
	return localStorage.getItem(TOKEN_KEY);
}

export function logout() {
	localStorage.removeItem(TOKEN_KEY);
}


