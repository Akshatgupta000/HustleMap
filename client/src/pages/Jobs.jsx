import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api.js';
import { showToast } from '../components/Toast.jsx';

const STATUS_OPTIONS = ['Saved', 'Applied', 'Interview', 'Offer', 'Rejected'];
const STATUS_COLORS = {
	'Saved': 'bg-gray-100 text-gray-800',
	'Applied': 'bg-blue-100 text-blue-800',
	'Interview': 'bg-yellow-100 text-yellow-800',
	'Offer': 'bg-green-100 text-green-800',
	'Rejected': 'bg-red-100 text-red-800'
};

export default function Jobs() {
	const [jobs, setJobs] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [filter, setFilter] = useState('all');

	async function fetchJobs() {
		try {
			const { data } = await api.get('/jobs');
			setJobs(data.jobs || []);
		} catch (err) {
			setError(err.response?.data?.message || 'Failed to load jobs');
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => {
		fetchJobs();
	}, []);

	async function handleDelete(id) {
		if (!confirm('Delete this job?')) return;
		try {
			await api.delete(`/jobs/${id}`);
			fetchJobs();
			showToast('Job deleted successfully', 'success');
		} catch (err) {
			showToast('Failed to delete job', 'error');
		}
	}

	async function handleStatusUpdate(jobId, newStatus) {
		try {
			await api.put(`/jobs/${jobId}`, { status: newStatus });
			fetchJobs();
			showToast(`Status updated to ${newStatus}`, 'success');
		} catch (err) {
			showToast('Failed to update status', 'error');
		}
	}

	function formatDate(dateString) {
		if (!dateString) return '';
		const date = new Date(dateString);
		return date.toLocaleDateString();
	}

	const filteredJobs = filter === 'all' ? jobs : jobs.filter(job => job.status === filter);

	if (loading) {
		return (
			<div className="flex items-center justify-center h-64">
				<div className="text-gray-600">Loading...</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="text-red-600 p-4 bg-red-50 rounded-lg">
				{error}
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-bold text-gray-900">Job Applications</h1>
				<Link 
					to="/jobs/new" 
					className="bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700 transition-colors"
				>
					Add Job
				</Link>
			</div>

			{/* Filters */}
			<div className="flex flex-wrap gap-2">
				<button
					onClick={() => setFilter('all')}
					className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
						filter === 'all' 
							? 'bg-blue-600 text-white' 
							: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
					}`}
				>
					All ({jobs.length})
				</button>
				{STATUS_OPTIONS.map(status => {
					const count = jobs.filter(job => job.status === status).length;
					return (
						<button
							key={status}
							onClick={() => setFilter(status)}
							className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
								filter === status 
									? 'bg-blue-600 text-white' 
									: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
							}`}
						>
							{status} ({count})
						</button>
					);
				})}
			</div>

			{/* Job Cards Grid */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{filteredJobs.map((job) => (
					<div
						key={job._id || job.id}
						className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow"
					>
						<div className="space-y-4">
							{/* Company and Position */}
							<div>
								<h3 className="font-semibold text-gray-900 text-lg">
									{job.company}
								</h3>
								<p className="text-gray-600 text-sm mt-1">{job.position}</p>
							</div>

							{/* Status Badge */}
							<div className="flex items-center justify-between">
								<span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[job.status] || STATUS_COLORS.Saved}`}>
									{job.status}
								</span>
								{job.dateApplied && (
									<span className="text-xs text-gray-500">
										{formatDate(job.dateApplied)}
									</span>
								)}
							</div>

							{/* Notes Preview */}
							{job.notes && (
								<div className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
									<p className="line-clamp-2">{job.notes}</p>
								</div>
							)}

							{/* Actions */}
							<div className="flex items-center gap-2 pt-2 border-t border-gray-200">
								<select
									value={job.status}
									onChange={(e) => handleStatusUpdate(job.id || job._id, e.target.value)}
									className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
								>
									{STATUS_OPTIONS.map(status => (
										<option key={status} value={status}>{status}</option>
									))}
								</select>

								<Link
									to={`/jobs/${job.id || job._id}`}
									className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
								>
									Edit
								</Link>

								<button
									onClick={() => handleDelete(job.id || job._id)}
									className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
								>
									Delete
								</button>
							</div>
						</div>
					</div>
				))}
			</div>

			{/* Empty State */}
			{filteredJobs.length === 0 && (
				<div className="text-center py-12">
					<div className="text-gray-400 text-6xl mb-4">📋</div>
					<h3 className="text-lg font-medium text-gray-900 mb-2">
						{filter === 'all' ? 'No job applications yet' : `No ${filter.toLowerCase()} applications`}
					</h3>
					<p className="text-gray-600 mb-4">
						{filter === 'all' 
							? 'Start tracking your job applications by adding your first job.'
							: `You don't have any applications with status "${filter}".`
						}
					</p>
					{filter === 'all' && (
						<Link 
							to="/jobs/new" 
							className="bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700 transition-colors"
						>
							Add Your First Job
						</Link>
					)}
				</div>
			)}
		</div>
	);
}
