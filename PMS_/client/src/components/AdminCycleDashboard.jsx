import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/AdminCycleDashboard.css';

const AdminCycleDashboard = () => {
  const [cycles, setCycles] = useState([]);
  const [selectedCycle, setSelectedCycle] = useState(null);
  const [cycleDetail, setCycleDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionModal, setActionModal] = useState(null);
  const [selectedReviews, setSelectedReviews] = useState(new Set());
  const [extensionDate, setExtensionDate] = useState('');
  const [actionReason, setActionReason] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch all active cycles
  useEffect(() => {
    fetchActiveCycles();
  }, []);

  const fetchActiveCycles = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/cycles', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setCycles(response.data);
    } catch (error) {
      setErrorMessage('Failed to fetch cycles');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch cycle details with unsubmitted reviews
  const fetchCycleDetail = async (cycleId) => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/admin/cycles/${cycleId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setCycleDetail(response.data);
      setSelectedCycle(cycleId);
    } catch (error) {
      setErrorMessage('Failed to fetch cycle details');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Handle review selection
  const toggleReviewSelection = (reviewId) => {
    const newSelected = new Set(selectedReviews);
    if (newSelected.has(reviewId)) {
      newSelected.delete(reviewId);
    } else {
      newSelected.add(reviewId);
    }
    setSelectedReviews(newSelected);
  };

  // Select all unsubmitted reviews
  const selectAllReviews = () => {
    const allIds = new Set(cycleDetail.unsubmitted.map(r => r.reviewId));
    setSelectedReviews(allIds);
  };

  // Clear all selections
  const clearSelection = () => {
    setSelectedReviews(new Set());
  };

  // Bulk extend reviews
  const handleBulkExtend = async () => {
    if (selectedReviews.size === 0) {
      setErrorMessage('Please select at least one review');
      return;
    }

    if (!extensionDate) {
      setErrorMessage('Please select an extension date');
      return;
    }

    try {
      const response = await axios.post('/api/admin/reviews/bulk-extend', {
        reviewIds: Array.from(selectedReviews),
        newDeadline: extensionDate,
        reason: actionReason
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      setSuccessMessage(`Successfully extended ${response.data.reviews.length} reviews`);
      setActionModal(null);
      setSelectedReviews(new Set());
      setExtensionDate('');
      setActionReason('');
      fetchCycleDetail(selectedCycle);
    } catch (error) {
      setErrorMessage('Failed to extend reviews: ' + error.response?.data?.message);
    }
  };

  // Bulk waive reviews
  const handleBulkWaive = async () => {
    if (selectedReviews.size === 0) {
      setErrorMessage('Please select at least one review');
      return;
    }

    if (!actionReason) {
      setErrorMessage('Please provide a reason for waiving');
      return;
    }

    try {
      const response = await axios.post('/api/admin/reviews/bulk-waive', {
        reviewIds: Array.from(selectedReviews),
        reason: actionReason
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      setSuccessMessage(`Successfully waived ${response.data.reviews.length} reviews`);
      setActionModal(null);
      setSelectedReviews(new Set());
      setActionReason('');
      fetchCycleDetail(selectedCycle);
    } catch (error) {
      setErrorMessage('Failed to waive reviews: ' + error.response?.data?.message);
    }
  };

  // Close cycle
  const handleCloseCycle = async () => {
    if (!confirm('Are you sure you want to close this cycle? This action cannot be undone.')) return;

    try {
      await axios.patch(`/api/admin/cycles/${selectedCycle}/close`, {
        notes: actionReason
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      setSuccessMessage('Cycle closed successfully');
      setActionModal(null);
      setActionReason('');
      fetchActiveCycles();
      setSelectedCycle(null);
      setCycleDetail(null);
    } catch (error) {
      setErrorMessage('Failed to close cycle: ' + error.response?.data?.message);
    }
  };

  // View audit trail
  const viewAuditTrail = async (reviewId) => {
    try {
      const response = await axios.get(`/api/admin/reviews/${reviewId}/audit-trail`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      alert(`Audit Trail:\n${JSON.stringify(response.data.auditLog, null, 2)}`);
    } catch (error) {
      setErrorMessage('Failed to fetch audit trail');
    }
  };

  return (
    <div className="admin-cycle-dashboard">
      <h1>Admin Cycle Management</h1>

      {successMessage && (
        <div className="alert alert-success">
          {successMessage}
          <button onClick={() => setSuccessMessage('')}>×</button>
        </div>
      )}

      {errorMessage && (
        <div className="alert alert-error">
          {errorMessage}
          <button onClick={() => setErrorMessage('')}>×</button>
        </div>
      )}

      <div className="dashboard-container">
        {/* Cycles List */}
        <div className="cycles-panel">
          <h2>Active Cycles</h2>
          {loading && <p className="loading">Loading...</p>}
          {cycles.length === 0 && <p className="no-data">No active cycles</p>}
          
          <div className="cycles-list">
            {cycles.map(cycle => (
              <div
                key={cycle._id}
                className={`cycle-card ${selectedCycle === cycle._id ? 'active' : ''}`}
                onClick={() => fetchCycleDetail(cycle._id)}
              >
                <div className="cycle-header">
                  <h3>{cycle.name || `${cycle.type} ${cycle.month}/${cycle.year}`}</h3>
                  <span className={`status-badge ${cycle.status.toLowerCase()}`}>
                    {cycle.status}
                  </span>
                </div>
                <div className="cycle-dates">
                  <p>Close: {new Date(cycle.closeDate).toLocaleDateString()}</p>
                  <p>Finalize: {new Date(cycle.finalizeDate).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cycle Details */}
        {cycleDetail && (
          <div className="cycle-details-panel">
            <h2>Cycle Details</h2>
            
            {/* Statistics */}
            <div className="statistics">
              <div className="stat-card">
                <span className="stat-label">Total Reviews</span>
                <span className="stat-value">{cycleDetail.stats.totalEligible}</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Submitted</span>
                <span className="stat-value">{cycleDetail.stats.submitted}</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Pending</span>
                <span className="stat-value">{cycleDetail.stats.pending}</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Submit %</span>
                <span className="stat-value">{cycleDetail.stats.submitPercentage}%</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Flagged</span>
                <span className="stat-value">{cycleDetail.stats.flagged}</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Waived</span>
                <span className="stat-value">{cycleDetail.stats.waived}</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Extended</span>
                <span className="stat-value">{cycleDetail.stats.extended}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="action-buttons">
              <button
                className="btn btn-extend"
                onClick={() => setActionModal('extend')}
                disabled={selectedReviews.size === 0}
              >
                Extend Selected ({selectedReviews.size})
              </button>
              <button
                className="btn btn-waive"
                onClick={() => setActionModal('waive')}
                disabled={selectedReviews.size === 0}
              >
                Waive Selected ({selectedReviews.size})
              </button>
              <button
                className="btn btn-close"
                onClick={() => setActionModal('close')}
              >
                Close Cycle
              </button>
            </div>

            {/* Unsubmitted Reviews List */}
            <div className="unsubmitted-reviews">
              <h3>Unsubmitted Reviews ({cycleDetail.unsubmitted.length})</h3>

              {cycleDetail.unsubmitted.length === 0 ? (
                <p className="no-data">All reviews submitted!</p>
              ) : (
                <>
                  <div className="review-actions">
                    <button className="btn-small" onClick={selectAllReviews}>
                      Select All
                    </button>
                    <button className="btn-small" onClick={clearSelection}>
                      Clear Selection
                    </button>
                  </div>

                  <table className="reviews-table">
                    <thead>
                      <tr>
                        <th><input type="checkbox" onChange={selectAllReviews} /></th>
                        <th>Employee</th>
                        <th>Email</th>
                        <th>Type</th>
                        <th>Due Date</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cycleDetail.unsubmitted.map(review => (
                        <tr key={review.reviewId}>
                          <td>
                            <input
                              type="checkbox"
                              checked={selectedReviews.has(review.reviewId)}
                              onChange={() => toggleReviewSelection(review.reviewId)}
                            />
                          </td>
                          <td>{review.employeeName}</td>
                          <td>{review.employeeEmail}</td>
                          <td>{review.reviewType}</td>
                          <td>{new Date(review.dueDate).toLocaleDateString()}</td>
                          <td>
                            <span className={`status-label ${review.status.toLowerCase()}`}>
                              {review.status}
                            </span>
                          </td>
                          <td>
                            <button
                              className="btn-audit"
                              onClick={() => viewAuditTrail(review.reviewId)}
                            >
                              Audit Trail
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Action Modals */}
      {actionModal === 'extend' && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Extend Review Deadlines</h3>
            <div className="form-group">
              <label>New Deadline</label>
              <input
                type="date"
                value={extensionDate}
                onChange={(e) => setExtensionDate(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Reason (optional)</label>
              <textarea
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                placeholder="Reason for extension..."
                rows="3"
              />
            </div>
            <div className="modal-actions">
              <button className="btn btn-primary" onClick={handleBulkExtend}>
                Extend {selectedReviews.size} Reviews
              </button>
              <button className="btn btn-secondary" onClick={() => setActionModal(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {actionModal === 'waive' && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Waive Review Requirements</h3>
            <div className="form-group">
              <label>Reason (required)</label>
              <textarea
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                placeholder="Reason for waiving reviews..."
                rows="3"
              />
            </div>
            <div className="modal-actions">
              <button className="btn btn-primary" onClick={handleBulkWaive}>
                Waive {selectedReviews.size} Reviews
              </button>
              <button className="btn btn-secondary" onClick={() => setActionModal(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {actionModal === 'close' && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Close Review Cycle</h3>
            <p>
              Are you sure you want to close this cycle? This will:
              <ul>
                <li>Stop accepting new submissions</li>
                <li>Lock all review records</li>
                <li>Notify all managers</li>
              </ul>
            </p>
            <div className="form-group">
              <label>Notes (optional)</label>
              <textarea
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                placeholder="Add closing notes..."
                rows="3"
              />
            </div>
            <div className="modal-actions">
              <button className="btn btn-danger" onClick={handleCloseCycle}>
                Close Cycle
              </button>
              <button className="btn btn-secondary" onClick={() => setActionModal(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCycleDashboard;
