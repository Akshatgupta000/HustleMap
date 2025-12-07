const express = require('express');
const Job = require('../models/JobSQLite');

const router = express.Router();

// GET /api/jobs - list current user's jobs
router.get('/', async (req, res) => {
	try {
		const jobs = await Job.findByUserId(req.user.id);
		// Transform database fields to frontend format
		const transformedJobs = jobs.map(job => ({
			_id: job.id,
			id: job.id,
			company: job.company,
			position: job.position,
			status: job.status,
			dateApplied: job.date_applied,
			date_applied: job.date_applied,
			notes: job.notes,
			applicationSource: job.application_source,
			application_source: job.application_source,
			created_at: job.created_at,
			updated_at: job.updated_at
		}));
		return res.json({ jobs: transformedJobs });
	} catch (err) {
		return res.status(500).json({ message: err.message });
	}
});

// POST /api/jobs - create job
router.post('/', async (req, res) => {
	try {
		const { 
			company, position, status, dateApplied, notes, 
			applicationSource, priority, salary, location, jobUrl 
		} = req.body;
		if (!company || !position) return res.status(400).json({ message: 'Company and position are required' });
		const job = await Job.create({
			user_id: req.user.id,
			company,
			position,
			status: status || 'Saved',
			date_applied: dateApplied ? new Date(dateApplied) : undefined,
			notes,
			application_source: applicationSource || 'Other',
			priority: priority || 'Medium',
			salary,
			location,
			job_url: jobUrl,
		});
		// Transform to frontend format
		const transformed = {
			_id: job.id,
			id: job.id,
			company: job.company,
			position: job.position,
			status: job.status,
			dateApplied: job.date_applied,
			date_applied: job.date_applied,
			notes: job.notes,
			applicationSource: job.application_source,
			application_source: job.application_source
		};
		return res.status(201).json(transformed);
	} catch (err) {
		return res.status(500).json({ message: err.message });
	}
});

// PUT /api/jobs/:id - update job (ensure ownership)
router.put('/:id', async (req, res) => {
	try {
		const job = await Job.findByIdAndUserId(req.params.id, req.user.id);
		if (!job) return res.status(404).json({ message: 'Job not found' });
		
		const updates = {};
		const fields = [
			'company', 'position', 'status', 'dateApplied', 'notes',
			'applicationSource', 'priority', 'salary', 'location', 'jobUrl',
			'lastFollowUp', 'nextFollowUp', 'interviewDate', 'responseReceived'
		];
		
		fields.forEach((f) => {
			if (req.body[f] !== undefined) {
				// Map frontend field names to database field names
				const dbField = f === 'dateApplied' ? 'date_applied' :
							  f === 'applicationSource' ? 'application_source' :
							  f === 'jobUrl' ? 'job_url' :
							  f === 'lastFollowUp' ? 'last_follow_up' :
							  f === 'nextFollowUp' ? 'next_follow_up' :
							  f === 'interviewDate' ? 'interview_date' :
							  f === 'responseReceived' ? 'response_received' : f;
				
				updates[dbField] = req.body[f];
			}
		});
		
		const updatedJob = await job.update(updates);
		// Transform to frontend format
		const transformed = {
			_id: updatedJob.id,
			id: updatedJob.id,
			company: updatedJob.company,
			position: updatedJob.position,
			status: updatedJob.status,
			dateApplied: updatedJob.date_applied,
			date_applied: updatedJob.date_applied,
			notes: updatedJob.notes,
			applicationSource: updatedJob.application_source,
			application_source: updatedJob.application_source
		};
		return res.json(transformed);
	} catch (err) {
		return res.status(500).json({ message: err.message });
	}
});

// DELETE /api/jobs/:id - delete job (ensure ownership)
router.delete('/:id', async (req, res) => {
	try {
		console.log('Delete request received:', {
			jobId: req.params.id,
			userId: req.user?.id,
			userObject: req.user
		});
		const job = await Job.findByIdAndUserId(req.params.id, req.user.id);
		console.log('Find job result:', job);
		if (!job) return res.status(404).json({ message: 'Job not found' });
		await job.delete();
		return res.json({ message: 'Deleted' });
	} catch (err) {
		console.error('Delete job error:', err);
		return res.status(500).json({ message: err.message });
	}
});

module.exports = router;


