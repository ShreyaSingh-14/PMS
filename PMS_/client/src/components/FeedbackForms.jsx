import React, { useState, useEffect } from 'react';
import { CalendarClock, Clock, CheckCircle, X, Users, PieChart, MessageSquare } from 'lucide-react';
import api from '../api';
import { useModal } from '../context/ModalContext';

const FeedbackForms = ({ userRole }) => {
  const { showAlert, showConfirm, showPrompt } = useModal();
  const [pendingReviews, setPendingReviews] = useState([]);
  const [history, setHistory] = useState([]);
  const [probations, setProbations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReview, setSelectedReview] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ progress: '', rating: 'Meets' });

  const fetchData = async () => {
    try {
      if (userRole === 'Employee' || userRole === 'Manager') {
        const pRes = await api.get('/reviews/pending');
        const hRes = await api.get('/reviews/history');
        setPendingReviews(Array.isArray(pRes.data) ? pRes.data : []);
        setHistory(Array.isArray(hRes.data) ? hRes.data : []);
      } else if (userRole === 'Admin') {
        const adminRes = await api.get('/admin/active-probations');
        setProbations(Array.isArray(adminRes.data) ? adminRes.data : []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [userRole]);

  const openForm = (review) => {
    setSelectedReview(review);
    setFormData({ 
        progress: userRole === 'Manager' ? (review.managerFeedback?.comments || '') : (review.selfFeedback?.progress || ''), 
        rating: userRole === 'Manager' ? (review.managerFeedback?.rating || 'Meets') : (review.selfFeedback?.rating || 'Meets')
    });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    try {
      if (userRole === 'Employee') {
        await api.post(`/reviews/${selectedReview._id}/self-feedback`, formData);
      } else {
        await api.post(`/reviews/${selectedReview._id}/manager-feedback`, { 
            comments: formData.progress, 
            rating: formData.rating 
        });
      }
      setShowModal(false);
      await fetchData();
    } catch (err) {
      showAlert('Submission Failed', err.response?.data?.message || "Error submitting feedback.");
    }
  };

  const scheduleDiscussion = async (id) => {
    showPrompt('Schedule Discussion', 'Enter discussion date (YYYY-MM-DD):', async (date) => {
      try {
        await api.patch(`/reviews/${id}/schedule`, { date });
        await fetchData();
        showAlert('Success', 'Discussion successfully scheduled.');
      } catch (error) {
        showAlert('Error', "Error scheduling discussion");
      }
    }, '2026-05-15');
  };

  const confirmProbation = async (userId, decision) => {
    showConfirm('Confirm Decision', `Are you sure you want to ${decision} this probation?`, async () => {
        try {
          await api.patch(`/admin/probation/${userId}`, { decision });
          await fetchData();
          showAlert('Decision Recorded', `User probation status updated to: ${decision}`);
        } catch (error) {
          showAlert('Error', "Error recording probation decision");
        }
    });
  };

  if (loading) return <div style={{padding: '2rem'}}>Loading Feedback Engine...</div>;

  const renderEmployeeView = () => {
    const activeRequests = pendingReviews.filter(r => r.status === 'Pending');
    return (
      <div className="animate-fade-in">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Feedback Engine</h2>
            <p style={{color: 'var(--text-secondary)', fontSize: '0.9rem'}}>Complete your self-evaluations and browse shared manager feedback.</p>
          </div>
        </div>

        <div style={{display: 'flex', flexDirection: 'column', gap: '3rem'}}>
           <section className="phase-section">
              <div className="phase-header">
                <div className="phase-number pending">1</div>
                <h3 style={{fontSize: '1.1rem', fontWeight: 800}}>Self-Evaluation Requests</h3>
              </div>
              <div className="list-group">
                  {activeRequests.length === 0 ? (
                    <div className="card" style={{textAlign: 'center', padding: '2rem', borderStyle: 'dashed'}}>
                      <p style={{fontSize: '0.9rem', color: 'var(--text-secondary)'}}>You are all caught up. No pending self-evaluations for this cycle.</p>
                    </div>
                  ) : activeRequests.map(rev => (
                    <div className="list-item" key={rev._id} style={{ borderLeft: '4px solid var(--warning-color)' }}>
                        <div className="list-item-main">
                        <span className="list-item-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CalendarClock size={16}/> {rev.type} Review</span>
                        <span className="list-item-desc">Please share your perspective. Due: {new Date(rev.dueDate || rev.createdAt).toLocaleDateString()}</span>
                        </div>
                        <button className="btn btn-primary" onClick={() => openForm(rev)} style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}>Proceed: Open Form</button>
                    </div>
                  ))}
              </div>
           </section>

           <section className="phase-section">
              <div className="phase-header">
                <div className="phase-number history">2</div>
                <h3 style={{fontSize: '1.1rem', fontWeight: 800}}>Unified Review History</h3>
              </div>
              <div className="grid-container" style={{gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))'}}>
                  {history.length === 0 ? <p style={{fontSize: '0.9rem', color: 'var(--text-secondary)'}}>No historical records available yet.</p> : history.map(rev => (
                    <div className="card" key={rev._id} style={{padding: '1.5rem', border: '1px solid var(--border-color)'}}>
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem'}}>
                          <div>
                            <h4 style={{fontWeight: 800}}>{rev.type}</h4>
                            <p style={{fontSize: '0.75rem', color: 'var(--text-secondary)'}}>Finalized on {new Date(rev.updatedAt).toLocaleDateString()}</p>
                          </div>
                          <span className="tag tag-success" style={{background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success-color)', border: 'none'}}>{rev.managerFeedback?.rating || 'Unrated'}</span>
                        </div>
                        <p style={{fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.5, height: '3rem', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'}}>
                           {rev.managerFeedback?.comments || 'No manager feedback provided.'}
                        </p>
                        <button className="btn btn-outline btn-full" style={{ fontSize: '0.75rem' }} onClick={() => showAlert(`${rev.type} Details`, `Your Reflection: ${rev.selfFeedback?.progress}\n\nManager Feedback: ${rev.managerFeedback?.comments}`)}>View Full Record</button>
                    </div>
                  ))}
              </div>
           </section>
        </div>
      </div>
    );
  };

  const renderManagerView = () => {
    return (
      <div className="animate-fade-in">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Team Feedback Pipeline</h2>
            <p style={{color: 'var(--text-secondary)', fontSize: '0.9rem'}}>Manage your team's feedback lifecycle and ongoing review discussions.</p>
          </div>
        </div>

        <div style={{display: 'flex', flexDirection: 'column', gap: '3rem'}}>
           <section className="phase-section">
              <div className="phase-header">
                <div className="phase-number pending">1</div>
                <h3 style={{fontSize: '1.1rem', fontWeight: 800}}>Team Review Queue</h3>
                {pendingReviews.length > 0 && <span className="tag tag-danger">{pendingReviews.length} Action Required</span>}
              </div>
              <div className="list-group">
                {pendingReviews.length === 0 ? (
                   <div className="card" style={{textAlign: 'center', padding: '2rem', borderStyle: 'dashed'}}>
                      <p style={{fontSize: '0.9rem', color: 'var(--text-secondary)'}}>Queue empty. You are current on all team reviews.</p>
                   </div>
                ) : pendingReviews.map(rev => (
                  <div className="list-item" key={rev._id} style={{borderLeft: `4px solid ${rev.status === 'Submitted' ? 'var(--accent-color)' : 'var(--warning-color)'}`}}>
                    <div className="list-item-main">
                      <span className="list-item-title" style={{fontWeight: 800}}>{rev.subjectId?.name} — {rev.type}</span>
                      <span className="list-item-desc">Status: <span className={`tag ${rev.status === 'Submitted' ? 'tag-success' : 'tag-warning'}`} style={{fontSize: '0.65rem'}}>{rev.status === 'Submitted' ? 'READY FOR RATING' : 'AWAITING EMPLOYEE SELF-FEEDBACK'}</span></span>
                    </div>
                    <div style={{display:'flex', gap:'0.5rem'}}>
                      {rev.status === 'Submitted' && <button className="btn btn-primary" onClick={() => openForm(rev)} style={{ padding: '0.5rem 1rem', fontSize: '0.75rem' }}>Proceed: Rate Member</button>}
                      {!rev.discussionDate ? (
                         <button className="btn btn-outline" onClick={() => scheduleDiscussion(rev._id)} style={{ padding: '0.5rem 1rem', fontSize: '0.75rem' }}><CalendarClock size={16}/> Schedule Call</button>
                      ) : (
                         <span className="tag tag-success" style={{display: 'flex', alignItems: 'center', gap: '0.25rem'}}><Clock size={14}/> Discussion set: {new Date(rev.discussionDate).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
           </section>

           <section className="phase-section">
              <div className="phase-header">
                <div className="phase-number history">2</div>
                <h3 style={{fontSize: '1.1rem', fontWeight: 800}}>Recent Team Records</h3>
              </div>
              <div className="card" style={{padding: '0', overflow: 'hidden', border: '1px solid var(--border-color)'}}>
                <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border-color)', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                      <th style={{ padding: '1rem' }}>Employee</th>
                      <th style={{ padding: '1rem' }}>Review Type</th>
                      <th style={{ padding: '1rem' }}>Rating Given</th>
                      <th style={{ padding: '1rem' }}>Status</th>
                      <th style={{ padding: '1rem' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.length === 0 ? <tr><td colSpan="5" style={{padding: '2rem', textAlign: 'center'}}>No historical records found for your team.</td></tr> : history.map(rev => (
                      <tr key={rev._id} style={{borderBottom: '1px solid rgba(0,0,0,0.03)'}}>
                        <td style={{ padding: '1rem', fontWeight: 600 }}>{rev.subjectId?.name}</td>
                        <td style={{ padding: '1rem' }}>{rev.type}</td>
                        <td style={{ padding: '1rem' }}><span className="tag tag-success">{rev.managerFeedback?.rating}</span></td>
                        <td style={{ padding: '1rem' }}><span className="tag" style={{background: '#f1f5f9', color: '#444'}}>Closed</span></td>
                        <td style={{ padding: '1rem', textAlign: 'right' }}>
                           <button className="btn btn-text" onClick={() => showAlert('Review Comments', rev.managerFeedback?.comments)} style={{ fontSize: '0.75rem', fontWeight: 800 }}>View Comments</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
           </section>
        </div>
      </div>
    );
  };

  const renderAdminView = () => {
    return (
      <div className="card" style={{minHeight: '200px', display: 'flex', flexDirection: 'column'}}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1.5rem', color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between' }}>
          Confirmation Queue 
          {probations.length > 0 && <span className="tag tag-warning">{probations.length} Pending</span>}
        </h3>
        <div className="list-group">
          {probations.length === 0 ? (
            <div style={{textAlign: 'center', padding: '3rem 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem'}} className="animate-fade-in">
              <div style={{width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(49, 184, 140, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <CheckCircle size={32} color="var(--success-color)" />
              </div>
              <div>
                <h4 style={{fontWeight: 800, fontSize: '1.1rem'}}>Queue Fully Cleared</h4>
                <p style={{fontSize: '0.9rem', color: 'var(--text-secondary)'}}>All required probation confirmation decisions have been recorded.</p>
              </div>
            </div>
          ) : probations.map(emp => (
            <div className="list-item" key={emp._id}>
              <div className="list-item-main">
                <span className="list-item-title">{emp.name}</span>
                <span className="list-item-desc">{emp.designation} • Status: {emp.probationStatus}</span>
              </div>
              <div style={{display: 'flex', gap: '0.5rem'}}>
                <button className="btn btn-primary" onClick={() => confirmProbation(emp._id, 'Confirm')} style={{ padding: '0.4rem 1rem', fontSize: '0.75rem' }}>Proceed: Confirm</button>
                <button className="btn btn-outline" onClick={() => confirmProbation(emp._id, 'Extend')} style={{ padding: '0.4rem 1rem', fontSize: '0.75rem' }}>Extend</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="animate-fade-in">
      {/* Structured Modal for Forms */}
      {showModal && (
        <div style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'}}>
            <div className="card" style={{width: '100%', maxWidth: '600px', padding: '2.5rem', position: 'relative'}}>
                <button onClick={() => setShowModal(false)} style={{position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)'}}><X size={20}/></button>
                <h2 style={{fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem'}}>{selectedReview.type} Review</h2>
                <p style={{fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '2rem'}}>
                    {userRole === 'Employee' ? 'Submit your self-reflection and progress against your active GMS goals.' : `Finalize rating and comments for ${selectedReview.subjectId?.name}.`}
                </p>

                <div className="form-group" style={{marginBottom: '1.5rem'}}>
                    <label className="form-label" style={{fontWeight: 700}}>{userRole === 'Employee' ? 'Reflections & Progress' : 'Manager Comments'}</label>
                    <textarea 
                        className="form-input" 
                        style={{minHeight: '150px', background: '#fafafa', borderRadius: '0.5rem'}}
                        placeholder="Be descriptive. Blank responses will be soft-flagged for Admin review."
                        value={formData.progress}
                        onChange={e => setFormData({...formData, progress: e.target.value})}
                    />
                </div>

                <div className="form-group" style={{marginBottom: '2rem'}}>
                    <label className="form-label" style={{fontWeight: 700}}>Performance Rating</label>
                    <div style={{display: 'flex', gap: '1rem'}}>
                        {['Below', 'Meets', 'Above'].map(r => (
                            <button 
                                key={r}
                                onClick={() => setFormData({...formData, rating: r})}
                                className={`btn ${formData.rating === r ? 'btn-primary' : 'btn-outline'}`}
                                style={{flex: 1, padding: '0.6rem', fontSize: '0.85rem'}}
                            >
                                {r}
                            </button>
                        ))}
                    </div>
                </div>

                <div style={{display: 'flex', gap: '1rem'}}>
                    <button className="btn btn-primary" style={{flex: 1}} onClick={handleSubmit}>Submit Final Form</button>
                    <button className="btn btn-text" style={{flex: 1}} onClick={() => setShowModal(false)}>Cancel</button>
                </div>
            </div>
        </div>
      )}

      {userRole === 'Employee' && renderEmployeeView()}
      {userRole === 'Manager' && renderManagerView()}
      {userRole === 'Admin' && renderAdminView()}
    </div>
  );
};

export default FeedbackForms;
