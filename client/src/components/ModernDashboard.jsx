import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api.js';
import { showToast } from './Toast.jsx';

export default function ModernDashboard() {
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const { data } = await api.get('/jobs');
      setJobs(data.jobs || []);
    } catch (err) {
      showToast('Failed to load dashboard data', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = () => {
    const totalJobs = jobs.length;
    const totalApplied = jobs.filter(job => job.status === 'Applied').length;
    const totalInterview = jobs.filter(job => job.status === 'Interview').length;
    const totalOffer = jobs.filter(job => job.status === 'Offer').length;
    const totalRejected = jobs.filter(job => job.status === 'Rejected').length;
    const totalSaved = jobs.filter(job => job.status === 'Saved').length;

    const appliedToInterviewRate = totalApplied > 0 
      ? Math.round((totalInterview / totalApplied) * 100) 
      : 0;

    return {
      totalJobs,
      totalApplied,
      totalInterview,
      totalOffer,
      totalRejected,
      totalSaved,
      appliedToInterviewRate
    };
  };

  const stats = calculateStats();
  const recentJobs = jobs.slice(0, 5);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Track your job application progress</p>
        </div>
        <div className="flex space-x-3">
          <Link
            to="/jobs"
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            View All Jobs
          </Link>
          <Link
            to="/jobs/new"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add Job
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="text-sm font-medium text-gray-500 mb-2">Total Applications</div>
          <div className="text-3xl font-bold text-gray-900">{stats.totalJobs}</div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="text-sm font-medium text-gray-500 mb-2">Applied</div>
          <div className="text-3xl font-bold text-blue-600">{stats.totalApplied}</div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="text-sm font-medium text-gray-500 mb-2">Interviews</div>
          <div className="text-3xl font-bold text-yellow-600">{stats.totalInterview}</div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="text-sm font-medium text-gray-500 mb-2">Offers</div>
          <div className="text-3xl font-bold text-green-600">{stats.totalOffer}</div>
        </div>
      </div>

      {/* Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Breakdown</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Applied</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">{stats.totalApplied}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Interview</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">{stats.totalInterview}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Offer</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">{stats.totalOffer}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Rejected</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">{stats.totalRejected}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Saved</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">{stats.totalSaved}</span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {recentJobs.length > 0 ? (
              recentJobs.map((job) => (
                <div
                  key={job._id || job.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900">{job.company}</h4>
                    <p className="text-xs text-gray-500">{job.position}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    job.status === 'Applied' ? 'bg-blue-100 text-blue-800' :
                    job.status === 'Interview' ? 'bg-yellow-100 text-yellow-800' :
                    job.status === 'Offer' ? 'bg-green-100 text-green-800' :
                    job.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {job.status}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-gray-500">No recent activity</p>
                <p className="text-xs text-gray-400 mt-1">Start by adding your first job application.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Interview Rate */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Interview Rate</h3>
        <div className="text-3xl font-bold text-gray-900">{stats.appliedToInterviewRate}%</div>
        <p className="text-sm text-gray-600 mt-2">
          {stats.totalInterview} out of {stats.totalApplied} applications led to interviews
        </p>
      </div>
    </div>
  );
}
