const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema(
	{
		user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
		company: { type: String, required: true, trim: true },
		position: { type: String, required: true, trim: true },
		status: {
			type: String,
			enum: ['Saved', 'Applied', 'Interview', 'Offer', 'Rejected'],
			default: 'Saved',
		},
		dateApplied: { type: Date },
		notes: { type: String, trim: true },
		// Enhanced fields for better tracking
		applicationSource: { 
			type: String, 
			enum: ['LinkedIn', 'Company Website', 'Indeed', 'Glassdoor', 'Referral', 'Other'],
			default: 'Other'
		},
		lastFollowUp: { type: Date },
		nextFollowUp: { type: Date },
		interviewDate: { type: Date },
		responseReceived: { type: Boolean, default: false },
		priority: { 
			type: String, 
			enum: ['Low', 'Medium', 'High'], 
			default: 'Medium' 
		},
		salary: { type: String, trim: true },
		location: { type: String, trim: true },
		jobUrl: { type: String, trim: true },
	},
	{ timestamps: true }
);

module.exports = mongoose.model('Job', JobSchema);


