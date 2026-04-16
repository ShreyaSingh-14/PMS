import React, { useState, useEffect } from 'react';
import { Users, CheckCircle, AlertTriangle, TrendingUp, Filter, MessageSquare, Target } from 'lucide-react';
import api from '../../api';
import EmployeeDashboard from './EmployeeDashboard';

const ManagerDashboard = () => {
  const [viewMode, setViewMode] = useState('Team'); // 'Team' (Coach) or 'Personal' (Player)
  const [teamGoals, setTeamGoals] = useState([]);
  const [pendingReviews, setPendingReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        const [gRes, rRes] = await Promise.all([
          api.get('/goals/team-goals'),
          api.get('/reviews/pending')
        ]);
        setTeamGoals(Array.isArray(gRes.data) ? gRes.data : []);
        setPendingReviews(Array.isArray(rRes.data) ? rRes.data : []);
      } catch (err) {
        console.error(err);
        setTeamGoals([]);
        setPendingReviews([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTeamData();
  }, []);

  if (loading) return <div>Loading...</div>;

  const pendingApprovals = teamGoals.filter(g => g.status === 'Pending Approval');
  const avgComp = teamGoals.length ? teamGoals.reduce((acc, g) => acc + (g.completionPercentage || 0), 0) / teamGoals.length : 0;

  return (
    <div className="animate-fade-in">
      <div style={{display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', background: '#fff', padding: '0.25rem', borderRadius: '0.5rem', display: 'inline-flex', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'}}>
        <button className={`btn ${viewMode === 'Team' ? 'btn-primary' : 'btn-text'}`} onClick={() => setViewMode('Team')} style={{padding: '0.4rem 1rem', fontSize: '0.75rem'}}>Team Performance (Coach)</button>
        <button className={`btn ${viewMode === 'Personal' ? 'btn-primary' : 'btn-text'}`} onClick={() => setViewMode('Personal')} style={{padding: '0.4rem 1rem', fontSize: '0.75rem', color: viewMode === 'Personal' ? '#fff' : 'var(--text-secondary)'}}>My Performance (Player)</button>
      </div>

      {viewMode === 'Personal' ? (
        <EmployeeDashboard />
      ) : (
        <>
          <div className="grid-container">
            <div className="card delay-1">
              <div className="card-header">
                <span className="card-title">Team Goal Progress</span>
                <Users className="sidebar-logo-icon" size={20} />
              </div>
              <div className="card-value">{avgComp.toFixed(0)}%</div>
              <div className="progress-container">
                <div className="progress-bar-bg">
                  <div className="progress-bar-fill" style={{ width: `${avgComp}%` }}></div>
                </div>
              </div>
              <div className="card-trend mt-2">
                <TrendingUp size={16} className="trend-up" />
                <span className="trend-up">Tracking on pace</span>
              </div>
            </div>

            <div className="card delay-2">
              <div className="card-header">
                <span className="card-title">Pending Approvals</span>
                <CheckCircle className="sidebar-logo-icon" size={20} />
              </div>
              <div className="card-value">{pendingApprovals.length + pendingReviews.length}</div>
              <div className="list-group mt-2">
                <div className="list-item" style={{ padding: '0.5rem', background: 'transparent', borderBottom: '1px solid var(--border-color)', borderRadius: '0' }}>
                  <span className="list-item-title text-sm" style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}><Target size={14}/> {pendingApprovals.length} Goal Approvals</span>
                </div>
                <div className="list-item" style={{ padding: '0.5rem', background: 'transparent', borderRadius: '0', borderBottom: 'none' }}>
                  <span className="list-item-title text-sm" style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}><MessageSquare size={14}/> {pendingReviews.length} Final Ratings Due</span>
                  <span className="tag tag-warning">Urgent</span>
                </div>
              </div>
            </div>

            <div className="card delay-3">
              <div className="card-header">
                <span className="card-title">Escalations & Alerts</span>
                <AlertTriangle className="sidebar-logo-icon" style={{color: 'var(--danger-color)'}} size={20} />
              </div>
              <div className="card-value" style={{color: 'var(--danger-color)'}}>0</div>
              <p className="card-trend text-secondary mt-1">No missed deadlines</p>
            </div>
          </div>

          <div className="grid-container" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <div className="card delay-4">
              <div className="card-header" style={{ marginBottom: '1.5rem'}}>
                <h3 className="card-title" style={{fontSize: '1.125rem', color: 'var(--text-primary)', fontWeight: 800}}>Team Members Overview</h3>
                <button className="btn btn-outline" style={{padding: '0.4rem 0.8rem', fontSize: '0.75rem'}}><Filter size={14}/> Filter</button>
              </div>
              <div className="list-group">
                 <p className="text-sm text-secondary">See Goals (GMS) and Feedback Forms tabs for detailed team breakdowns.</p>
              </div>
            </div>

            <div className="card delay-4">
              <div className="card-header" style={{ marginBottom: '1.5rem'}}>
                <h3 className="card-title" style={{fontSize: '1.125rem', color: 'var(--text-primary)', fontWeight: 800}}>Goal Approval Queue</h3>
              </div>
              <div className="list-group">
                {pendingApprovals.map(goal => (
                  <div className="list-item" key={goal._id}>
                    <div className="list-item-main">
                      <span className="list-item-title">{goal.ownerId?.name}</span>
                      <span className="list-item-desc">Proposed: "{goal.title}"</span>
                    </div>
                    <div style={{display: 'flex', gap: '0.5rem'}}>
                      <span className="tag tag-warning">Action Required in GMS</span>
                    </div>
                  </div>
                ))}
                {pendingApprovals.length === 0 && <p className="text-sm text-secondary">No pending goal approvals.</p>}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ManagerDashboard;
