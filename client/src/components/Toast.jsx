import { useEffect, useState } from 'react';

let toastId = 0;
const toasts = [];
const listeners = [];

export function showToast(message, type = 'info', duration = 3000) {
	const id = ++toastId;
	const toast = { id, message, type, duration };
	toasts.push(toast);
	listeners.forEach(listener => listener([...toasts]));
	
	if (duration > 0) {
		setTimeout(() => {
			removeToast(id);
		}, duration);
	}
	
	return id;
}

export function removeToast(id) {
	const index = toasts.findIndex(toast => toast.id === id);
	if (index > -1) {
		toasts.splice(index, 1);
		listeners.forEach(listener => listener([...toasts]));
	}
}

export default function ToastContainer() {
	const [toastList, setToastList] = useState([]);

	useEffect(() => {
		listeners.push(setToastList);
		return () => {
			const index = listeners.indexOf(setToastList);
			if (index > -1) {
				listeners.splice(index, 1);
			}
		};
	}, []);

	return (
		<div className="fixed top-4 left-4 z-50 space-y-2">
			{toastList.map(toast => (
				<div
					key={toast.id}
					className={`p-4 rounded-lg shadow-lg border-l-4 max-w-sm transition-all duration-300 ${
						toast.type === 'success' 
							? 'bg-green-50 border-green-400 text-green-800'
							: toast.type === 'error'
							? 'bg-red-50 border-red-400 text-red-800'
							: toast.type === 'warning'
							? 'bg-yellow-50 border-yellow-400 text-yellow-800'
							: 'bg-blue-50 border-blue-400 text-blue-800'
					}`}
				>
					<div className="flex items-start justify-between">
						<p className="text-sm font-medium">{toast.message}</p>
						<button
							onClick={() => removeToast(toast.id)}
							className="ml-2 text-gray-400 hover:text-gray-600 text-lg"
						>
							×
						</button>
					</div>
				</div>
			))}
		</div>
	);
}
