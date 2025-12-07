import { useState, useEffect } from 'react';

export default function AnalyticsWidgets({ jobs }) {
	const [weeklyGoal, setWeeklyGoal] = useState(5);
	const [analytics, setAnalytics] = useState({});

	useEffect(() => {
		if (jobs.length === 0) return;

		const now = new Date();
		const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
		const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
		const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

		// Calculate weekly applications
		const thisWeekApplications = jobs.filter(job => {
			if (!job.dateApplied) return false;
			const appliedDate = new Date(job.dateApplied);
			return appliedDate >= oneWeekAgo;
		}).length;

		// Calculate last week applications
		const lastWeekApplications = jobs.filter(job => {
			if (!job.dateApplied) return false;
			const appliedDate = new Date(job.dateApplied);
			return appliedDate >= twoWeeksAgo && appliedDate < oneWeekAgo;
		}).length;

		// Calculate response time (average days from application to response)
		const respondedJobs = jobs.filter(job => 
			job.status === 'Interview' || job.status === 'Offer' || job.status === 'Rejected'
		);
		
		let totalResponseTime = 0;
		let responseCount = 0;
		
		respondedJobs.forEach(job => {
			if (job.dateApplied) {
				const appliedDate = new Date(job.dateApplied);
				const responseDate = new Date(job.updatedAt); // Using updatedAt as proxy for response date
				const daysDiff = Math.floor((responseDate - appliedDate) / (1000 * 60 * 60 * 24));
				if (daysDiff > 0) {
					totalResponseTime += daysDiff;
					responseCount++;
				}
			}
		});

		const averageResponseTime = responseCount > 0 ? Math.round(totalResponseTime / responseCount) : 0;

		// Calculate application sources
		const sourceCounts = {};
		jobs.forEach(job => {
			const source = job.applicationSource || 'Other';
			sourceCounts[source] = (sourceCounts[source] || 0) + 1;
		});

		// Find best performing source
		const bestSource = Object.entries(sourceCounts).reduce((best, [source, count]) => {
			return count > (best.count || 0) ? { source, count } : best;
		}, { source: 'None', count: 0 });

		// Calculate interview-to-offer conversion rate
		const interviews = jobs.filter(job => job.status === 'Interview' || job.status === 'Offer').length;
		const offers = jobs.filter(job => job.status === 'Offer').length;
		const conversionRate = interviews > 0 ? Math.round((offers / interviews) * 100) : 0;

		// Calculate weekly goal progress
		const goalProgress = Math.min((thisWeekApplications / weeklyGoal) * 100, 100);

		setAnalytics({
			thisWeekApplications,
			lastWeekApplications,
			averageResponseTime,
			bestSource,
			conversionRate,
			goalProgress,
			interviews,
			offers
		});
	}, [jobs, weeklyGoal]);

	const getMotivationalMessage = () => {
		if (analytics.thisWeekApplications > analytics.lastWeekApplications) {
			const increase = analytics.thisWeekApplications - analytics.lastWeekApplications;
			return `You're applying ${increase} more than last week! 🚀`;
		} else if (analytics.thisWeekApplications === analytics.lastWeekApplications && analytics.thisWeekApplications > 0) {
			return "You're maintaining consistent application activity! 📈";
		} else if (analytics.thisWeekApplications < analytics.lastWeekApplications) {
			return "Keep up the momentum! Every application counts. 💪";
		}
		return "Start your job search journey today! 🌟";
	};

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
			{/* Weekly Goal Tracker */}
			<div className="bg-white border border-gray-200 rounded-xl p-6">
				<div className="flex items-center justify-between mb-4">
					<h3 className="text-lg font-semibold text-gray-900">Weekly Goal</h3>
					<input
						type="number"
						value={weeklyGoal}
						onChange={(e) => setWeeklyGoal(parseInt(e.target.value) || 5)}
						className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
						min="1"
						max="20"
					/>
				</div>
				<div className="relative">
					<div className="w-full bg-gray-200 rounded-full h-3">
						<div 
							className={`h-3 rounded-full transition-all duration-500 ${
								analytics.goalProgress >= 100 ? 'bg-green-500' : 
								analytics.goalProgress >= 75 ? 'bg-yellow-500' : 'bg-blue-500'
							}`}
							style={{ width: `${analytics.goalProgress}%` }}
						></div>
					</div>
					<div className="flex justify-between mt-2 text-sm text-gray-600">
						<span>{analytics.thisWeekApplications || 0} / {weeklyGoal}</span>
						<span>{Math.round(analytics.goalProgress || 0)}%</span>
					</div>
				</div>
			</div>

			{/* Average Response Time */}
			<div className="bg-white border border-gray-200 rounded-xl p-6">
				<h3 className="text-lg font-semibold text-gray-900 mb-4">Response Time</h3>
				<div className="text-center">
					<div className="text-3xl font-bold text-blue-600 mb-2">
						{analytics.averageResponseTime || 0}
					</div>
					<div className="text-sm text-gray-600">Average days to response</div>
					{analytics.averageResponseTime > 0 && (
						<div className="mt-2 text-xs text-gray-500">
							Based on {analytics.respondedJobs || 0} responses
						</div>
					)}
				</div>
			</div>

			{/* Best Performing Source */}
			<div className="bg-white border border-gray-200 rounded-xl p-6">
				<h3 className="text-lg font-semibold text-gray-900 mb-4">Best Source</h3>
				<div className="text-center">
					<div className="text-2xl font-bold text-green-600 mb-2">
						{analytics.bestSource?.source || 'None'}
					</div>
					<div className="text-sm text-gray-600">
						{analytics.bestSource?.count || 0} applications
					</div>
				</div>
			</div>

			{/* Conversion Rate */}
			<div className="bg-white border border-gray-200 rounded-xl p-6">
				<h3 className="text-lg font-semibold text-gray-900 mb-4">Conversion Rate</h3>
				<div className="text-center">
					<div className="text-3xl font-bold text-purple-600 mb-2">
						{analytics.conversionRate || 0}%
					</div>
					<div className="text-sm text-gray-600">Interview to Offer</div>
					<div className="mt-2 text-xs text-gray-500">
						{analytics.offers || 0} offers from {analytics.interviews || 0} interviews
					</div>
				</div>
			</div>

			{/* Motivational Insight */}
			<div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 md:col-span-2">
				<div className="flex items-center">
					<div className="text-4xl mr-4">🎯</div>
					<div>
						<h3 className="text-lg font-semibold text-gray-900 mb-2">Motivational Insight</h3>
						<p className="text-gray-700">{getMotivationalMessage()}</p>
					</div>
				</div>
			</div>
		</div>
	);
}
