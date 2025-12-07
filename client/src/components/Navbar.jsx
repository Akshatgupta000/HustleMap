import { Link, useNavigate } from 'react-router-dom';
import { getToken, logout } from '../services/auth.js';

export default function Navbar() {
    const navigate = useNavigate();
    const token = getToken();

    function handleLogout() {
        logout();
        navigate('/login');
    }

    return (
        <nav className="bg-white border-b border-slate-200">
            <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
                <Link to="/" className="font-bold text-lg">HustleMap</Link>
                <div className="flex items-center gap-6">
                    {token ? (
                        <>
                            <Link to="/dashboard" className="text-base font-medium">Dashboard</Link>
                            <Link to="/jobs" className="text-base font-medium">Jobs</Link>
                            <button onClick={handleLogout} className="text-base font-medium text-red-600">Logout</button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="text-base font-medium">Login</Link>
                            <Link to="/register" className="text-base font-medium">Register</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}
