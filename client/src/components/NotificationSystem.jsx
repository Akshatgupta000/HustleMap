import { useEffect, useState } from 'react';
import api from '../services/api.js';

export default function NotificationSystem() {
	const [notifications, setNotifications] = useState([]);
	const [jobs, setJobs] = useState([]);

	useEffect(() => {
		const token = localStorage.getItem('jt_token');
		if (!token) {
			// Skip notifications for unauthenticated users
			return;
		}

		// Request notification permission
		if ('Notification' in window && Notification.permission === 'default') {
			Notification.requestPermission();
		}

		// Fetch jobs for reminder calculations
		fetchJobs();
		
		// Check for reminders every 5 minutes
		const interval = setInterval(checkReminders, 5 * 60 * 1000);
		return () => clearInterval(interval);
	}, []);

	async function fetchJobs() {
		try {
			const token = localStorage.getItem('jt_token');
			if (!token) {
				// Skip fetching for unauthenticated users
				return;
			}
			const { data } = await api.get('/jobs');
			setJobs(data.jobs || []);
		} catch (err) {
			if (err.response?.status === 401) {
				// User is not authenticated, clear jobs
				setJobs([]);
			} else {
				console.error('Failed to fetch jobs for reminders:', err);
			}
		}
	}

	function checkReminders() {
		const newNotifications = [];
		const now = new Date();
		const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
		const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

		jobs.forEach(job => {
			if (!job.dateApplied) return;

			const appliedDate = new Date(job.dateApplied);
			const daysSinceApplied = Math.floor((now - appliedDate) / (1000 * 60 * 60 * 24));

			// Stale applications (14+ days with no updates)
			if (daysSinceApplied >= 14 && job.status === 'Applied') {
				newNotifications.push({
					id: `stale-${job._id}`,
					type: 'warning',
					title: 'Stale Application Alert',
					message: `${job.company} - ${job.position} hasn't been updated in ${daysSinceApplied} days. Consider following up.`,
					jobId: job._id,
					priority: 'high'
				});
			}

			// Follow-up suggestions based on industry standards
			if (daysSinceApplied === 7 && job.status === 'Applied') {
				newNotifications.push({
					id: `followup-${job._id}`,
					type: 'info',
					title: 'Follow-up Reminder',
					message: `It's been a week since you applied to ${job.company}. Consider sending a follow-up email.`,
					jobId: job._id,
					priority: 'medium'
				});
			}

			// Interview reminders (if we had interview dates)
			// This would require adding interview dates to the job model
		});

		// Update notifications state
		setNotifications(prev => {
			// Remove old notifications and add new ones
			const existingIds = new Set(prev.map(n => n.id));
			const newUniqueNotifications = newNotifications.filter(n => !existingIds.has(n.id));
			
			return [...prev, ...newUniqueNotifications];
		});

		// Show browser notifications for high priority items
		newNotifications.forEach(notification => {
			if (notification.priority === 'high' && Notification.permission === 'granted') {
				new Notification(notification.title, {
					body: notification.message,
					icon: '/favicon.ico',
					tag: notification.id
				});
			}
		});
	}

	function dismissNotification(id) {
		setNotifications(prev => prev.filter(n => n.id !== id));
	}

	function dismissAllNotifications() {
		setNotifications([]);
	}

	if (notifications.length === 0) return null;

	return (
		<div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
			{notifications.map(notification => (
				<div
					key={notification.id}
					className={`p-4 rounded-lg shadow-lg border-l-4 ${
						notification.type === 'warning' 
							? 'bg-yellow-50 border-yellow-400 text-yellow-800'
							: notification.type === 'error'
							? 'bg-red-50 border-red-400 text-red-800'
							: 'bg-blue-50 border-blue-400 text-blue-800'
					}`}
				>
					<div className="flex items-start justify-between">
						<div className="flex-1">
							<h4 className="font-semibold text-sm">{notification.title}</h4>
							<p className="text-sm mt-1">{notification.message}</p>
						</div>
						<button
							onClick={() => dismissNotification(notification.id)}
							className="ml-2 text-gray-400 hover:text-gray-600 text-lg"
						>
							×
						</button>
					</div>
					{notification.priority === 'high' && (
						<div className="mt-2 flex space-x-2">
							<button
								onClick={() => {
									// Navigate to job edit page
									window.location.href = `/jobs/${notification.jobId}`;
								}}
								className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 transition-colors"
							>
								Update Status
							</button>
						</div>
					)}
				</div>
			))}
			
			{notifications.length > 1 && (
				<button
					onClick={dismissAllNotifications}
					className="w-full text-xs text-gray-500 hover:text-gray-700 text-center py-1"
				>
					Dismiss all
				</button>
			)}
		</div>
	);
}
