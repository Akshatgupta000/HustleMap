import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import NotificationSystem from './components/NotificationSystem.jsx';
import ToastContainer from './components/Toast.jsx';
import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Jobs from './pages/Jobs.jsx';
import JobForm from './pages/JobForm.jsx';
import { getToken } from './services/auth.js';

function PrivateRoute({ children }) {
	const token = getToken();
	return token ? children : <Navigate to="/login" replace />;
}

export default function App() {
	const token = getToken();
	
	return (
		<div className="min-h-screen bg-slate-50">
			{/* Only show navbar for authenticated routes */}
			{token && <Navbar />}
			<div className={token ? "p-4" : ""}>
				<Routes>
					<Route path="/" element={<Landing />} />
					<Route path="/login" element={<Login />} />
					<Route path="/register" element={<Register />} />
					<Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
					<Route path="/jobs" element={<PrivateRoute><Jobs /></PrivateRoute>} />
					<Route path="/jobs/new" element={<PrivateRoute><JobForm /></PrivateRoute>} />
					<Route path="/jobs/:id" element={<PrivateRoute><JobForm /></PrivateRoute>} />
				</Routes>
			</div>
			{/* Show notifications only when user is logged in */}
			{token && <NotificationSystem />}
			{/* Toast notifications */}
			<ToastContainer />
		</div>
	);
}


