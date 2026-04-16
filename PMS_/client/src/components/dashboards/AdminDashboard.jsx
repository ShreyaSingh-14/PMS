import React, { useState, useEffect } from 'react';
import { Target, AlertTriangle, TrendingUp, Filter, FileText, Bell, CheckCircle, Settings, Download } from 'lucide-react';
import api from '../../api';
import { useModal } from '../../context/ModalContext';

const AdminDashboard = () => {
  const { showAlert, showConfirm } = useModal();
  const [stats, setStats] = useState(null);
  const [orgData, setOrgData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [statsRes, orgRes] = await Promise.all([
        api.get('/admin/dashboard-stats'),
        api.get('/admin/org-aggregation')
      ]);
      setStats(statsRes.data);
      setOrgData(orgRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleResolve = async (id) => {
    showConfirm('Resolve Flag', 'Confirm you wish to waive this red flag. This will clear it from the active queue.', async () => {
      try {
        await api.patch(`/admin/resolve-review/${id}`, { action: 'Waive' });
        // We await fetchData to ensure the UI updates BEFORE the success alert pops up
        await fetchData();
        showAlert('Resolved', 'Review flag has been successfully waived.');
      } catch (err) {
        showAlert('Error', 'Error resolving review flag.');
      }
    });
  };

  const handleExport = () => {
    // Basic export link using the api endpoint
    const tokenObj = JSON.parse(localStorage.getItem('pms_user') || '{}');
    api.get('/admin/export-csv', { responseType: 'blob' })
      .then(res => {
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'pms_report.csv');
        document.body.appendChild(link);
        link.click();
      });
  };

  if (loading || !stats || !orgData) return <div style={{padding: '2rem'}}>Loading enterprise dashboard data...</div>;

  return (
    <div className="animate-fade-in">
      {stats.complianceRate < 50 && (
        <div style={{background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger-color)', padding: '1rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--danger-color)', marginBottom: '1.5rem'}}>
          <Settings size={20} />
          <div>
            <h4 style={{fontWeight: 700, fontSize: '0.875rem'}}>Low Compliance Alert</h4>
            <p style={{fontSize: '0.75rem'}}>Organization compliance is below 50%. Review red-flag queues immediately.</p>
          </div>
        </div>
      )}

      <div className="grid-container">
        <div className="card delay-1">
          <div className="card-header">
            <span className="card-title">Org-Wide Compliance</span>
            <FileText className="sidebar-logo-icon" size={20} />
          </div>
          <div className="card-value">{stats.complianceRate}%</div>
          <div className="progress-container">
            <div className="progress-bar-bg">
              <div className="progress-bar-fill" style={{ width: `${stats.complianceRate}%` }}></div>
            </div>
          </div>
          <div className="card-trend mt-2">
            <TrendingUp size={16} className={stats.complianceRate >= 80 ? "trend-up" : "trend-down"} style={stats.complianceRate < 80 ? {color: 'var(--danger-color)'} : {}} />
            <span className={stats.complianceRate >= 80 ? "trend-up" : ""} style={stats.complianceRate < 80 ? {color: 'var(--danger-color)'} : {}}>Active Cycle Submission Rate</span>
          </div>
        </div>

        <div className="card delay-2">
          <div className="card-header">
            <span className="card-title">Red-Flagged Reviews</span>
            <AlertTriangle className="sidebar-logo-icon" style={{color: 'var(--danger-color)'}} size={20} />
          </div>
          <div className="card-value" style={{color: 'var(--danger-color)'}}>{stats.flaggedQueue}</div>
          <p className="card-trend text-secondary mt-1">Sentiment / low score flagged in open-ends</p>
        </div>

        <div className="card delay-3">
          <div className="card-header">
            <span className="card-title">Active Escalations</span>
            <Bell className="sidebar-logo-icon" style={{color: 'var(--warning-color)'}} size={20} />
          </div>
          <div className="card-value">{stats.pendingProbations + (stats.patternAlerts ? stats.patternAlerts.length : 0)}</div>
          <p className="card-trend text-secondary mt-1">Pending probation confirmations & pattern bounds</p>
        </div>
      </div>

      <div className="grid-container" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <div className="card delay-4">
          <div className="card-header" style={{ marginBottom: '1.5rem'}}>
            <h3 className="card-title" style={{fontSize: '1.125rem', color: 'var(--text-primary)', fontWeight: 800}}>Flagged Responses Queue</h3>
            <button className="btn btn-outline" style={{padding: '0.4rem 0.8rem', fontSize: '0.75rem'}}><Filter size={14}/> Sort by Severity</button>
          </div>
          <div className="list-group">
            {stats.flaggedDetails.length > 0 ? stats.flaggedDetails.map((rev) => (
              <div className="list-item" key={rev._id}>
                <div className="list-item-main">
                  <span className="list-item-title">{rev.subjectId?.name} - {rev.type}</span>
                  <span className="list-item-desc">Manager: {rev.managerId ? rev.managerId.name : 'Unassigned'} | Due: {new Date(rev.dueDate || rev.createdAt).toLocaleDateString()}</span>
                </div>
                <div style={{display: 'flex', gap: '0.5rem', alignItems: 'center'}}>
                    {rev.contextNote?.includes('Soft-Flag') && <span className="tag tag-warning" style={{fontSize: '0.7rem'}}>Soft Flag</span>}
                    <button className="btn btn-primary" style={{padding: '0.4rem 1rem', fontSize: '0.75rem'}} onClick={() => handleResolve(rev._id)}>Proceed: Resolve</button>
                </div>
              </div>
            )) : <p style={{fontSize: '0.9rem', color: 'var(--text-secondary)'}}>No active red flags.</p>}
            
            {stats.patternAlerts && stats.patternAlerts.map((alert, i) => (
              <div className="list-item" key={i}>
                <div className="list-item-main">
                  <span className="list-item-title">{alert.subject} - {alert.currentReview}</span>
                  <span className="list-item-desc">Pattern Detected: {alert.message}</span>
                </div>
                <button className="btn btn-outline" style={{padding: '0.4rem 0.8rem', fontSize: '0.75rem', borderColor: 'var(--danger-color)', color: 'var(--danger-color)'}}><AlertTriangle size={14}/> Investigate</button>
              </div>
            ))}
          </div>
        </div>

        <div className="card delay-4">
          <div className="card-header" style={{ marginBottom: '1.5rem'}}>
            <h3 className="card-title" style={{fontSize: '1.125rem', color: 'var(--text-primary)', fontWeight: 800}}>Org-Level Overview</h3>
          </div>
          <div className="list-group">
            <div className="list-item" style={{background: 'rgba(4, 102, 69, 0.03)', borderColor: 'var(--accent-color)'}}>
              <div className="list-item-main">
                <span className="list-item-title" style={{color: 'var(--accent-color)'}}>Company Goals ({orgData.Company.count})</span>
                <span className="list-item-desc">High-Level Objectives</span>
              </div>
              <span className="tag tag-success">{orgData.Company.avgCompletion}% Completed</span>
            </div>
            <div className="list-item">
              <div className="list-item-main">
                <span className="list-item-title">Team Goals ({orgData.Team.count})</span>
                <span className="list-item-desc">Cascaded Team Initiatives</span>
              </div>
              <span className="tag tag-warning">{orgData.Team.avgCompletion}% Completed</span>
            </div>
            <div className="list-item">
              <div className="list-item-main">
                <span className="list-item-title">Individual Goals ({orgData.Individual.count})</span>
                <span className="list-item-desc">Employee Key Results</span>
              </div>
              <span className="tag" style={{background: '#f1f5f9', color: '#475569'}}>{orgData.Individual.avgCompletion}% Completed</span>
            </div>
          </div>
          
          <div style={{marginTop: '2rem'}}>
             <button onClick={handleExport} className="btn btn-primary btn-full"><Download size={16}/> Export Compliance Report (CSV)</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
