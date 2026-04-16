import React, { useState, useEffect } from 'react';
import { Target, AlertTriangle, TrendingUp, Edit3, MessageSquare, Clock, CheckSquare, Square } from 'lucide-react';
import api from '../../api';

const EmployeeDashboard = () => {
  const [goals, setGoals] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [gRes, rRes] = await Promise.all([
         api.get('/goals/my-goals').catch(e => ({ data: [] })),
         api.get('/reviews/pending').catch(e => ({ data: [] }))
      ]);
      setGoals(Array.isArray(gRes.data) ? gRes.data : []);
      setReviews(Array.isArray(rRes.data) ? rRes.data : []);
    } catch (err) {
      console.error("Dashboard Global Error:", err);
      setError("Unable to sync dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleSubtask = async (goalId, subtaskId) => {
    try {
       await api.patch(`/goals/${goalId}/subtasks/${subtaskId}/toggle`);
       await fetchData();
    } catch (err) {
       console.error("Subtask Toggle Error", err);
    }
  };

  if (loading) return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '400px'}}>
      <div className="avatar animate-float" style={{marginBottom: '1rem'}}>
        <Target size={24}/>
      </div>
      <p style={{color: 'var(--text-secondary)', fontWeight: 600}}>Syncing your performance profile...</p>
    </div>
  );

  const activeGoals = (goals || []).filter(g => g && g.status === 'Active');
  const totalWeight = activeGoals.reduce((acc, g) => acc + (Number(g.weightage) || 0), 0);
  const completionSum = activeGoals.reduce((acc, g) => acc + (Number(g.completionPercentage) || 0), 0);
  const totalComp = activeGoals.length > 0 ? (completionSum / activeGoals.length) : 0;

  return (
    <div className="animate-fade-in">
      {error && (
        <div className="card mb-4" style={{borderColor: 'var(--danger-color)', background: 'rgba(220, 38, 38, 0.05)'}}>
          <p style={{color: 'var(--danger-color)', fontSize: '0.9rem'}}>⚠️ {error}</p>
        </div>
      )}

      <div className="grid-container">
        <div className="card delay-1">
          <div className="card-header">
            <span className="card-title">Overall Performance Progress</span>
            <Target className="sidebar-logo-icon" size={20} />
          </div>
          <div className="card-value">{Math.round(totalComp)}%</div>
          <div className="progress-container">
            <div className="progress-bar-bg">
              <div className="progress-bar-fill" style={{ width: `${Math.min(totalComp, 100)}%` }}></div>
            </div>
          </div>
          <div className="card-trend mt-2">
            <TrendingUp size={16} className="trend-up" />
            <span className="trend-up">{totalComp >= 10 ? 'Impact Tracking' : 'Cycle Setup'}</span>
          </div>
        </div>

        <div className="card delay-2">
          <div className="card-header">
            <span className="card-title">Pending Action Items</span>
            <AlertTriangle className="sidebar-logo-icon" size={20} />
          </div>
          <div className="card-value">{reviews.length}</div>
          <div className="list-group mt-2">
             {reviews.length === 0 ? (
               <p style={{fontSize: '0.8rem', color: 'var(--text-secondary)'}}>No pending self-reflections.</p>
             ) : reviews.slice(0, 2).map(r => (
               <div className="list-item" key={r._id} style={{ padding: '0.5rem', background: 'transparent', borderBottom: '1px solid var(--border-color)', borderRadius: '0' }}>
                 <span className="list-item-title text-sm" style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}><Clock size={14}/> {r.type}</span>
                 <span className="tag tag-warning">Required</span>
               </div>
             ))}
          </div>
        </div>
      </div>

      <div className="grid-container" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <div className="card delay-3">
          <div className="card-header" style={{ marginBottom: '1.5rem'}}>
            <h3 className="card-title" style={{fontSize: '1.125rem', color: 'var(--text-primary)', fontWeight: 800}}>Personal Roadmap</h3>
            <span className={`tag ${totalWeight === 100 ? 'tag-success' : 'tag-danger'}`} style={{fontSize: '0.7rem'}}>
              {totalWeight}% Target
            </span>
          </div>
          <div className="list-group">
            {goals.length === 0 ? (
              <div style={{textAlign: 'center', padding: '1rem', border: '1px dashed var(--border-color)', borderRadius: '0.5rem'}}>
                <p style={{fontSize: '0.85rem', color: 'var(--text-secondary)'}}>Your goal list is empty.</p>
              </div>
            ) : goals.filter(g => g && g._id).map(goal => (
              <div key={goal._id} style={{marginBottom: '1rem', padding: '1rem', background: 'rgba(0,0,0,0.02)', borderRadius: '0.75rem', border: '1px solid rgba(0,0,0,0.04)'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem'}}>
                  <span style={{fontWeight: 700, fontSize: '0.95rem'}}>{goal.title || 'Untitled Goal'}</span>
                  <span className={`tag tag-${goal.status === 'Active' ? 'success' : 'warning'}`} style={{fontSize: '0.65rem'}}>{goal.status || 'Draft'}</span>
                </div>
                
                {/* Subtasks Checklist */}
                <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.75rem'}}>
                   {goal.subtasks?.filter(st => st && st._id).map(st => (
                     <div key={st._id} 
                          onClick={() => handleToggleSubtask(goal._id, st._id)}
                          style={{display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', opacity: st.isCompleted ? 0.6 : 1}}
                     >
                        {st.isCompleted ? <CheckSquare size={16} color="var(--success-color)"/> : <Square size={16} color="var(--text-secondary)"/>}
                        <span style={{fontSize: '0.85rem', textDecoration: st.isCompleted ? 'line-through' : 'none', color: st.isCompleted ? 'var(--text-secondary)' : 'var(--text-primary)'}}>
                          {st.title}
                        </span>
                     </div>
                   ))}
                   {(!goal.subtasks || goal.subtasks.length === 0) && (
                     <p style={{fontSize: '0.75rem', color: 'var(--text-secondary)', fontStyle: 'italic'}}>No sub-tasks defined for this objective.</p>
                   )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card delay-4">
          <div className="card-header" style={{ marginBottom: '1.5rem'}}>
            <h3 className="card-title" style={{fontSize: '1.125rem', color: 'var(--text-primary)', fontWeight: 800}}>Performance Insights</h3>
          </div>
          <div className="list-group">
             <div style={{padding: '1.25rem', background: 'var(--bg-color)', borderRadius: '0.75rem', border: '1px solid var(--border-color)'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem'}}>
                  <MessageSquare size={18} color="var(--accent-color)" />
                  <span style={{fontWeight: 700, fontSize: '0.9rem'}}>Cycle Status</span>
                </div>
                <p style={{fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5}}>
                  Check off subtasks in your <strong>Roadmap</strong> to automatically update your progress percentages. Your manager will see these updates in real-time.
                </p>
             </div>
             <p style={{fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem', paddingLeft: '0.5rem'}}>
               Visit the <strong>Goals (GMS)</strong> tab for a full phased view of your lifecycle.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
