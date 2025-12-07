import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api.js';
import { showToast } from '../components/Toast.jsx';

const STATUS_OPTIONS = ['Saved', 'Applied', 'Interview', 'Offer', 'Rejected'];

export default function JobForm() {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = Boolean(id);

    const [form, setForm] = useState({ 
        company: '', 
        applicationSource: '', 
        position: '', 
        status: 'Saved', 
        dateApplied: '', 
        notes: '' 
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!isEdit) return;
        (async () => {
            try {
                const { data } = await api.get('/jobs');
                const job = data.jobs.find((j) => (j._id === id || j.id === id));
                if (job) {
                    setForm({
                        company: job.company || '',
                        applicationSource: job.applicationSource || job.application_source || '',
                        position: job.position || '',
                        status: job.status || 'Saved',
                        dateApplied: job.dateApplied || job.date_applied 
                            ? new Date(job.dateApplied || job.date_applied).toISOString().slice(0, 10) 
                            : '',
                        notes: job.notes || '',
                    });
                }
            } catch (err) {
                showToast('Failed to load job', 'error');
            }
        })();
    }, [id, isEdit]);

    const validateField = (field, value) => {
        const newErrors = { ...errors };
        switch (field) {
            case 'company':
                if (!value.trim()) {
                    newErrors.company = 'Company name is required';
                } else if (value.trim().length < 2) {
                    newErrors.company = 'Company name must be at least 2 characters';
                } else {
                    delete newErrors.company;
                }
                break;
            case 'applicationSource':
                if (value.trim() && value.trim().length < 2) {
                    newErrors.applicationSource = 'Source must be at least 2 characters';
                } else {
                    delete newErrors.applicationSource;
                }
                break;
            case 'position':
                if (!value.trim()) {
                    newErrors.position = 'Position is required';
                } else if (value.trim().length < 2) {
                    newErrors.position = 'Position must be at least 2 characters';
                } else {
                    delete newErrors.position;
                }
                break;
            default:
                break;
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    function updateField(field, value) {
        setForm((prev) => ({ ...prev, [field]: value }));
        validateField(field, value);
    }

    const isFormValid = () => {
        return form.company.trim() && form.position.trim() && 
               Object.keys(errors).filter(e => e !== 'applicationSource').length === 0;
    };

    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);

        const isCompanyValid = validateField('company', form.company);
        const isSourceValid = validateField('applicationSource', form.applicationSource);
        const isPositionValid = validateField('position', form.position);

        if (!isCompanyValid || !isPositionValid || !isSourceValid) {
            setLoading(false);
            showToast('Please fix the errors before submitting', 'error');
            return;
        }

        try {
            if (isEdit) {
                await api.put(`/jobs/${id}`, {
                    ...form,
                    dateApplied: form.dateApplied || undefined,
                });
                showToast('Job updated successfully!', 'success');
            } else {
                await api.post('/jobs', {
                    ...form,
                    dateApplied: form.dateApplied || undefined,
                });
                showToast('Job added successfully!', 'success');
            }
            setTimeout(() => {
                navigate('/jobs');
            }, 1000);
        } catch (err) {
            showToast(err.response?.data?.message || 'Save failed', 'error');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-2xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => navigate('/jobs')}
                        className="p-2 hover:bg-white rounded-lg transition-colors"
                    >
                        ← Back
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">
                            {isEdit ? 'Edit Job' : 'Add New Job'}
                        </h1>
                        <p className="text-gray-600 mt-1">
                            {isEdit ? 'Update your job application details' : 'Track your next career opportunity'}
                        </p>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                        {/* Company Field */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Company Name *
                            </label>
                            <input
                                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                    errors.company
                                        ? 'border-red-300 bg-red-50'
                                        : 'border-gray-300'
                                }`}
                                placeholder="e.g., Google, Microsoft, Apple"
                                value={form.company}
                                onChange={(e) => updateField('company', e.target.value)}
                            />
                            {errors.company && (
                                <p className="text-sm text-red-600">{errors.company}</p>
                            )}
                        </div>

                        {/* Application Source Field */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Application Source
                            </label>
                            <input
                                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                    errors.applicationSource
                                        ? 'border-red-300 bg-red-50'
                                        : 'border-gray-300'
                                }`}
                                placeholder="e.g., LinkedIn, Company Website, Referral"
                                value={form.applicationSource}
                                onChange={(e) => updateField('applicationSource', e.target.value)}
                            />
                            {errors.applicationSource && (
                                <p className="text-sm text-red-600">{errors.applicationSource}</p>
                            )}
                        </div>

                        {/* Position Field */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Position Title *
                            </label>
                            <input
                                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                    errors.position
                                        ? 'border-red-300 bg-red-50'
                                        : 'border-gray-300'
                                }`}
                                placeholder="e.g., Software Engineer, Product Manager"
                                value={form.position}
                                onChange={(e) => updateField('position', e.target.value)}
                            />
                            {errors.position && (
                                <p className="text-sm text-red-600">{errors.position}</p>
                            )}
                        </div>

                        {/* Status Selector */}
                        <div className="space-y-3">
                            <label className="block text-sm font-medium text-gray-700">
                                Application Status
                            </label>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                {STATUS_OPTIONS.map((status) => {
                                    const isActive = form.status === status;
                                    return (
                                        <button
                                            key={status}
                                            type="button"
                                            onClick={() => updateField('status', status)}
                                            className={`p-3 rounded-lg border-2 transition-colors ${
                                                isActive
                                                    ? 'bg-blue-600 text-white border-blue-600'
                                                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-gray-300'
                                            }`}
                                        >
                                            <span className="text-sm font-medium">{status}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Date Applied */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Date Applied
                            </label>
                            <input
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                type="date"
                                value={form.dateApplied}
                                onChange={(e) => updateField('dateApplied', e.target.value)}
                            />
                        </div>

                        {/* Notes */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Notes (Optional)
                            </label>
                            <textarea
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                rows="4"
                                placeholder="Add any additional notes about this application..."
                                value={form.notes}
                                onChange={(e) => updateField('notes', e.target.value)}
                            />
                        </div>

                        {/* Submit Button */}
                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={loading || !isFormValid()}
                                className={`w-full py-4 px-6 rounded-lg font-semibold text-white transition-colors ${
                                    loading || !isFormValid()
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-blue-600 hover:bg-blue-700'
                                }`}
                            >
                                {loading ? (
                                    <span>Loading...</span>
                                ) : (
                                    <span>{isEdit ? 'Update Job' : 'Add Job'}</span>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
