import React, { useState, useEffect } from 'react';
import { Target, PlusCircle, CheckCircle, Edit3, Trash2, PieChart, Shield, CalendarClock, MessageSquare, Users, CheckSquare, Square } from 'lucide-react';
import api from '../api';
import { useModal } from '../context/ModalContext';

const GoalsGMS = ({ userRole }) => {
  const { showAlert, showConfirm, showPrompt } = useModal();
  const [goals, setGoals] = useState([]);
  const [teamGoals, setTeamGoals] = useState([]);
  const [orgData, setOrgData] = useState({ Company: {count: 0, avgCompletion: 0}, Team: {count: 0}, Individual: {count: 0} });
  const [loading, setLoading] = useState(true);

  // Forms
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  
  const fetchGoals = async () => {
    try {
      if (userRole === 'Employee') {
        const res = await api.get('/goals/my-goals');
        setGoals(Array.isArray(res.data) ? res.data : []);
      } else if (userRole === 'Manager') {
        const res = await api.get('/goals/team-goals');
        setTeamGoals(Array.isArray(res.data) ? res.data : []);
      } else if (userRole === 'Admin') {
        const res = await api.get('/admin/org-goals');
        setTeamGoals(Array.isArray(res.data) ? res.data : []);
      }
    } catch (err) {
      console.error("GMS Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, [userRole]);

  const handleCreateGoal = async (typeOverride = 'Individual') => {
    if (!newTitle.trim()) return showAlert('Validation Error', 'Goal objective is required.');
    
    showPrompt('Set Deadline', 'Enter Deadline (YYYY-MM-DD)', async (deadline) => {
      // Validate date format if provided
      if (deadline && !/^\d{4}-\d{2}-\d{2}$/.test(deadline)) {
        return showAlert('Invalid Format', 'Please use YYYY-MM-DD format.');
      }

      showPrompt('Add Subtasks', 'Enter subtasks (comma separated):', async (subtasks) => {
        try {
          const subtasksArray = (subtasks || '')
            .split(',')
            .map(t => t.trim())
            .filter(t => t.length > 0)
            .map(t => ({ title: t }));

          await api.post('/goals', {
            title: newTitle,
            description: `${userRole} Defined Goal`,
            type: typeOverride,
            deadline: (deadline && deadline.trim()) ? new Date(deadline) : undefined,
            subtasks: subtasksArray
          });
          setNewTitle('');
          setShowCreateForm(false);
          await fetchGoals();
        } catch (error) {
          const msg = error.response?.data?.message || error.message || 'Error creating goal';
          showAlert('Submission Failed', msg);
        }
      }, 'Subtask 1, Subtask 2');
    }, '2026-12-31');
  };

  const handleToggleSubtask = async (goalId, subtaskId) => {
    try {
       await api.patch(`/goals/${goalId}/subtasks/${subtaskId}/toggle`);
       await fetchGoals();
    } catch (err) {
       showAlert('Update Failed', 'Error toggling subtask');
    }
  };

  const handleAddAttribute = async (id, type) => {
    showPrompt(`Add ${type}`, `Enter ${type} for this goal:`, async (val) => {
        try {
          await api.patch(`/goals/${id}`, { [type]: val });
          await fetchGoals();
        } catch (err) {
          showAlert('Field Error', `Error adding ${type}`);
        }
    });
  };

  const handleApprove = async (id) => {
    showPrompt('Approve Goal', 'Enter approved weightage (1-100):', (w) => {
      showPrompt('Finalize Deadline', 'Adjust/Confirm Deadline (YYYY-MM-DD):', async (d) => {
        if (w) {
          try {
             await api.patch(`/goals/${id}/approve`, { 
                weightage: Number(w), 
                isRejected: false,
                deadline: d ? new Date(d) : undefined
             });
             await fetchGoals();
             showAlert('Goal Approved', 'Objective has been successfully activated and moved to the performance track.');
          } catch (err) {
             const msg = err.response?.data?.message || err.message || 'Error approving goal';
             showAlert('Approval Error', msg);
          }
        }
      }, '2026-12-31');
    });
  };

  const handleReject = async (id) => {
    showPrompt('Revision Required', 'Reason for rejection/revision:', async (r) => {
      if (r) {
        try {
           await api.patch(`/goals/${id}/approve`, { isRejected: true, reason: r });
           await fetchGoals();
        } catch (err) {
           showAlert('Error', 'Error rejecting goal');
        }
      }
    });
  };

  if (loading) return <div style={{padding: '2rem'}}>Initializing GMS Pipeline...</div>;

  if (userRole === 'Employee') {
    const safeGoals = (goals || []).filter(g => g && typeof g === 'object');
    const phase1 = safeGoals.filter(g => ['Draft', 'Pending Approval'].includes(g.status));
    const phase2 = safeGoals
      .filter(g => g.status === 'Active')
      .sort((a, b) => {
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return new Date(a.deadline) - new Date(b.deadline);
      });
    const phase3 = safeGoals.filter(g => ['Completed', 'Archived'].includes(g.status));
    const activeWeight = phase2.reduce((acc, g) => acc + (Number(g.weightage) || 0), 0);

    return (
      <div className="animate-fade-in">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>My Growth Pipeline</h2>
            <p style={{color: 'var(--text-secondary)', fontSize: '0.9rem'}}>Complete subtasks to automatically advance your completion percentage.</p>
          </div>
          <div style={{display: 'flex', alignItems: 'center', gap: '1.5rem'}}>
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-end'}}>
                <span style={{fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)'}}>ACTIVE WEIGHTAGE</span>
                <span style={{fontSize: '1.25rem', fontWeight: 800, color: activeWeight === 100 ? 'var(--success-color)' : 'var(--warning-color)'}}>
                    {activeWeight}% / 100%
                </span>
            </div>
            <button className="btn btn-primary" onClick={() => setShowCreateForm(!showCreateForm)}>
                <PlusCircle size={16}/> New Proposal
            </button>
          </div>
        </div>

        {showCreateForm && (
          <div className="card mb-4 animate-slide-up" style={{background: '#f8fafc', border: '1px dashed var(--accent-color)', marginBottom: '2.5rem', padding: '2rem'}}>
             <h3 style={{fontSize: '1.1rem', fontWeight: 800, marginBottom: '1rem'}}>Draft New Performance Goal</h3>
             <div style={{display: 'flex', gap: '1rem', marginBottom: '1rem'}}>
                <input type="text" className="form-input" style={{flex: 1}} placeholder="Goal Title (e.g., Master React Server Components)..." value={newTitle} onChange={e => setNewTitle(e.target.value)} />
             </div>
             <div style={{display: 'flex', gap: '1rem'}}>
                <button className="btn btn-primary" onClick={() => handleCreateGoal('Individual')}>Submit for Approval</button>
                <button className="btn btn-outline" onClick={() => setShowCreateForm(false)}>Discard</button>
             </div>
          </div>
        )}

        <div style={{display: 'flex', flexDirection: 'column', gap: '3rem'}}>
          <section className="phase-section">
            <div className="phase-header">
              <div className="phase-number pending">1</div>
              <h3 style={{fontSize: '1.1rem', fontWeight: 800}}>Discovery & Proposals</h3>
              <span className="tag" style={{background: 'rgba(0,0,0,0.05)', color: 'var(--text-secondary)'}}>{phase1.length} Items</span>
            </div>
            <div className="list-group">
              {phase1.length === 0 ? <p style={{fontSize: '0.9rem', color: 'var(--text-secondary)', padding: '1rem', border: '1px dashed #e2e8f0', borderRadius: '0.75rem'}}>No pending proposals. Click "New Proposal" to start.</p> : phase1.map(goal => (
                <div className="list-item" key={goal._id} style={{borderLeft: '4px solid var(--warning-color)'}}>
                  <div className="list-item-main">
                    <span className="list-item-title">{goal.title}</span>
                    <span className="list-item-desc">
                      Status: {goal.status === 'Draft' ? <span className="tag tag-danger">Needs Revision (Draft)</span> : <span className="tag tag-warning">Awaiting Manager Review</span>}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="phase-section">
            <div className="phase-header">
              <div className="phase-number">2</div>
              <h3 style={{fontSize: '1.1rem', fontWeight: 800}}>Active Performance Track</h3>
              <div style={{display: 'flex', gap: '0.5rem', alignItems: 'center'}}>
                 <span className="tag tag-success">{phase2.length} Goals Active</span>
                 <span style={{fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 800, textTransform: 'uppercase'}}>⏳ Sorted by Deadline</span>
              </div>
            </div>
            <div className="list-group">
              {phase2.length === 0 ? <p style={{fontSize: '0.9rem', color: 'var(--text-secondary)', padding: '1rem', border: '1px dashed #e2e8f0', borderRadius: '0.75rem'}}>No active goals. Once a proposal is approved, it will appear here.</p> : phase2.map(goal => (
                <div className="list-item" key={goal._id} style={{borderLeft: '4px solid var(--accent-color)', padding: '1.5rem', flexDirection: 'column', alignItems: 'flex-start'}}>
                  <div style={{width: '100%', display: 'flex', justifyContent: 'space-between', marginBottom: '1rem'}}>
                    <div style={{flex: 1}}>
                      <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem'}}>
                        <span className="list-item-title" style={{fontSize: '1.1rem'}}>{goal.title}</span>
                        <span style={{fontWeight: 800, color: 'var(--accent-color)'}}>{goal.completionPercentage || 0}%</span>
                      </div>
                      <div className="progress-bar-bg" style={{height: '8px'}}>
                        <div className="progress-bar-fill" style={{width: `${Math.min(goal.completionPercentage || 0, 100)}%`}}></div>
                      </div>
                      <div style={{marginTop: '1rem', display: 'flex', gap: '1.5rem', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600}}>
                         <span style={{display: 'flex', alignItems: 'center', gap: '0.25rem'}}><PieChart size={14}/> Weight: {goal.weightage || 0}%</span>
                         <span style={{display: 'flex', alignItems: 'center', gap: '0.25rem'}}><CalendarClock size={14}/> Due: {goal.deadline ? new Date(goal.deadline).toLocaleDateString() : 'No Deadline'}</span>
                         <button className="btn btn-text" onClick={() => handleAddAttribute(goal._id, 'note')} style={{fontSize: '0.75rem', fontWeight: 800}}>+ Add Note</button>
                      </div>
                    </div>
                  </div>

                  {/* Subtask To-Do List */}
                  <div className="subtask-list" style={{width: '100%', background: 'rgba(0,0,0,0.02)', padding: '1.25rem', borderRadius: '0.75rem', border: '1px solid rgba(0,0,0,0.04)', marginTop: '0.5rem'}}>
                    <p style={{fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-secondary)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em'}}>Goal Roadmap (To-Do List)</p>
                    <div style={{display: 'flex', flexDirection: 'column', gap: '0.75rem'}}>
                      {!goal.subtasks || goal.subtasks.length === 0 ? <p style={{fontSize: '0.85rem', color: 'var(--text-secondary)'}}>No subtasks defined. Progress must be tracked via notes.</p> : goal.subtasks.filter(st => st && st._id).map(st => (
                        <div key={st._id} 
                             onClick={() => handleToggleSubtask(goal._id, st._id)}
                             style={{display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', opacity: st.isCompleted ? 0.6 : 1}}
                        >
                           {st.isCompleted ? <CheckSquare size={18} color="var(--success-color)"/> : <Square size={18} color="var(--text-secondary)"/>}
                           <span style={{fontSize: '0.9rem', textDecoration: st.isCompleted ? 'line-through' : 'none', color: st.isCompleted ? 'var(--text-secondary)' : 'var(--text-primary)', fontWeight: st.isCompleted ? 400 : 500}}>
                             {st.title}
                           </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="phase-section" style={{opacity: phase3.length === 0 ? 0.5 : 1}}>
            <div className="phase-header">
              <div className="phase-number history">3</div>
              <h3 style={{fontSize: '1.1rem', fontWeight: 800}}>Finalized & Historical</h3>
            </div>
            <div className="list-group">
              {phase3.length === 0 ? <p style={{fontSize: '0.9rem', color: 'var(--text-secondary)'}}>No completed goals in this cycle yet.</p> : phase3.map(goal => (
                <div className="list-item" key={goal._id} style={{background: 'rgba(0,0,0,0.02)', border: '1px solid #e2e8f0'}}>
                  <div className="list-item-main">
                    <span className="list-item-title" style={{color: 'var(--text-secondary)'}}>{goal.title}</span>
                    <span className="list-item-desc">Completed with {goal.completionPercentage || 0}% attainment.</span>
                  </div>
                  <CheckCircle size={20} color="var(--success-color)" />
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    );
  }

  if (userRole === 'Manager' || userRole === 'Admin') {
    const safeGoals = (teamGoals || []).filter(g => g && typeof g === 'object');
    const pendingGoals = safeGoals.filter(g => ['Pending Approval', 'Pending'].includes(g.status));
    const activeGoals = safeGoals
      .filter(g => g.status === 'Active')
      .sort((a, b) => {
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return new Date(a.deadline) - new Date(b.deadline);
      });
    const completedGoals = safeGoals.filter(g => ['Completed', 'Archived'].includes(g.status));

    return (
      <div className="animate-fade-in">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{userRole === 'Admin' ? 'Master Performance Pipeline' : 'Team Performance Pipeline'}</h2>
            <p style={{color: 'var(--text-secondary)', fontSize: '0.9rem'}}>Review roadmap entries and adjust deadlines for optimal performance.</p>
          </div>
          {userRole === 'Manager' && <button className="btn btn-primary" onClick={() => setShowCreateForm(!showCreateForm)}><PlusCircle size={16}/> Cascade Team Goal</button>}
        </div>

        {showCreateForm && (
          <div className="card mb-4 animate-slide-up" style={{background: 'rgba(49, 184, 140, 0.05)', border: '1px dashed var(--accent-color)', marginBottom: '2rem', padding: '2rem'}}>
             <h3 style={{fontSize: '1.1rem', fontWeight: 800, marginBottom: '1rem'}}>Direct Cascade to All Team Members</h3>
             <input type="text" className="form-input" placeholder="Enter Team Goal Objective..." value={newTitle} onChange={e => setNewTitle(e.target.value)} style={{marginBottom: '1rem'}}/>
             <div style={{display: 'flex', gap: '1rem'}}>
                <button className="btn btn-primary" onClick={() => handleCreateGoal('Team')}>Push to Team</button>
                <button className="btn btn-outline" onClick={() => setShowCreateForm(false)}>Cancel</button>
             </div>
          </div>
        )}

        <div style={{display: 'flex', flexDirection: 'column', gap: '3rem'}}>
          <section className="phase-section">
            <div className="phase-header">
              <div className="phase-number pending">1</div>
              <h3 style={{fontSize: '1.1rem', fontWeight: 800}}>Goal Approval Queue</h3>
              {pendingGoals.length > 0 && <span className="tag tag-danger">{pendingGoals.length} Required</span>}
            </div>
            <div className="list-group">
              {pendingGoals.length === 0 ? <p style={{fontSize: '0.9rem', color: 'var(--text-secondary)', padding: '1.5rem', border: '1px dashed #e2e8f0', borderRadius: '0.75rem', textAlign: 'center'}}>Approval queue is clear. All roadmaps are reviewed.</p> : pendingGoals.map(goal => (
                <div className="list-item" key={goal._id} style={{borderLeft: '4px solid var(--warning-color)', flexDirection: 'column', alignItems: 'flex-start'}}>
                  <div style={{width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'}}>
                    <div className="list-item-main">
                      <span className="list-item-title" style={{display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem'}}><Users size={16}/> {goal.ownerId?.name || 'Team Member'}</span>
                      <span className="list-item-desc">Proposed Goal: <strong style={{color: 'var(--text-primary)'}}>{goal.title || 'Untitled'}</strong></span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn btn-primary" onClick={() => handleApprove(goal._id)} style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}><CheckCircle size={14}/> Approve & Adjust Deadline</button>
                      <button className="btn btn-outline" onClick={() => handleReject(goal._id)} style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', borderColor: 'var(--danger-color)', color: 'var(--danger-color)' }}>Request Revision</button>
                    </div>
                  </div>
                  
                  {/* RoadMap Preview for Manager */}
                  <div style={{width: '100%', padding: '1rem', background: '#f8fafc', borderRadius: '0.5rem', border: '1px solid #e2e8f0'}}>
                     <p style={{fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-secondary)', marginBottom: '0.5rem'}}>PROPOSED ROADMAP</p>
                     <div style={{display: 'flex', flexWrap: 'wrap', gap: '1rem'}}>
                        {goal.subtasks?.filter(s => s).map(st => (
                          <div key={st._id} style={{fontSize: '0.8rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.3rem'}}>
                            <div style={{width: '6px', height: '6px', borderRadius: '50%', background: 'var(--warning-color)'}}></div> {st.title}
                          </div>
                        ))}
                     </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="phase-section">
            <div className="phase-header">
              <div className="phase-number">2</div>
              <h3 style={{fontSize: '1.1rem', fontWeight: 800}}>In-Progress Performance</h3>
              <span style={{fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 800, textTransform: 'uppercase'}}>⏳ Sorted by Nearest Deadline</span>
            </div>
            <div className="card" style={{padding: '0', overflow: 'hidden', border: '1px solid var(--border-color)'}}>
              <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    <th style={{ padding: '1rem' }}>Team Member</th>
                    <th style={{ padding: '1rem' }}>Goal Roadmap</th>
                    <th style={{ padding: '1rem' }}>Impact</th>
                    <th style={{ padding: '1rem' }}>Completion</th>
                    <th style={{ padding: '1rem' }}>Deadline</th>
                  </tr>
                </thead>
                <tbody style={{fontSize: '0.9rem'}}>
                  {activeGoals.length === 0 ? <tr><td colSpan="5" style={{padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)'}}>No active team goals at this time.</td></tr> : activeGoals.map(goal => (
                    <tr key={goal._id} style={{borderBottom: '1px solid rgba(0,0,0,0.03)'}}>
                      <td style={{ padding: '1rem', fontWeight: 700 }}>{goal.ownerId?.name || ''}</td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{fontSize: '0.8rem'}}>
                          {goal.title}
                          <div style={{color: 'var(--text-secondary)', fontSize: '0.7rem', marginTop: '0.2rem'}}>
                            {goal.subtasks?.filter(s=>s && s.isCompleted).length} / {goal.subtasks?.length} steps done
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '1rem' }}><span className="tag tag-success" style={{background: 'rgba(49, 184, 140, 0.1)', color: 'var(--accent-color)'}}>{goal.weightage || 0}%</span></td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                          <div className="progress-bar-bg" style={{flex: 1, height: '6px'}}><div className="progress-bar-fill" style={{width: `${Math.min(goal.completionPercentage || 0, 100)}%`}}></div></div>
                          <span style={{fontSize: '0.75rem', fontWeight: 700}}>{goal.completionPercentage || 0}%</span>
                        </div>
                      </td>
                      <td style={{ padding: '1rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                          {goal.deadline ? new Date(goal.deadline).toLocaleDateString() : 'N/A'}
                          <Edit3 size={14} style={{cursor: 'pointer'}} onClick={() => handleApprove(goal._id)}/>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <section className="phase-section" style={{marginTop: '3rem', opacity: completedGoals.length === 0 ? 0.6 : 1}}>
            <div className="phase-header">
              <div className="phase-number history">3</div>
              <h3 style={{fontSize: '1.1rem', fontWeight: 800}}>Finalized & Historical</h3>
            </div>
            <div className="card" style={{padding: '0', overflow: 'hidden', border: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.01)'}}>
              <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '0.7rem', textTransform: 'uppercase' }}>
                    <th style={{ padding: '0.75rem 1rem' }}>Team Member</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Objective</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Outcome</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                  </tr>
                </thead>
                <tbody style={{fontSize: '0.85rem'}}>
                  {completedGoals.length === 0 ? (
                    <tr><td colSpan="4" style={{padding: '1.5rem', textAlign: 'center', color: 'var(--text-secondary)'}}>No historical records for this cycle.</td></tr>
                  ) : completedGoals.map(goal => (
                    <tr key={goal._id} style={{borderBottom: '1px solid rgba(0,0,0,0.03)'}}>
                      <td style={{ padding: '1rem', fontWeight: 600 }}>{goal.ownerId?.name || ''}</td>
                      <td style={{ padding: '1rem' }}>{goal.title}</td>
                      <td style={{ padding: '1rem' }}>
                         <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                            <CheckCircle size={14} color="var(--success-color)"/>
                            <span>100% Attainment</span>
                         </div>
                      </td>
                      <td style={{ padding: '1rem' }}><span className="tag tag-success">COMPLETED</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
      </div>
    );
  }

  return (
    <div className="card" style={{padding: '2rem'}}>
       <p className="text-secondary">Org-level configurations are restricted to Admin roles.</p>
    </div>
  );
};

export default GoalsGMS;
