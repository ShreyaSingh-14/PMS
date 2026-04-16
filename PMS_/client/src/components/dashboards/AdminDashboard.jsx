import React, { useState, useEffect } from 'react';
import { AlertTriangle, TrendingUp, Filter, FileText, Bell, CheckCircle, Settings, Download, X } from 'lucide-react';
import api from '../../api';
import { useModal } from '../../context/ModalContext';

// Helper: days between flaggedAt and now
const getDaysSinceFlagged = (flaggedAt) => {
  if (!flaggedAt) return null;
  return Math.floor((new Date() - new Date(flaggedAt)) / (1000 * 60 * 60 * 24));
};

// Reusable review side-by-side card
const ReviewSideCard = ({ data, label, borderColor, bgColor, tagClass }) => (
  <div style={{ background: bgColor, border: `1px solid ${borderColor}`, borderRadius: '0.75rem', padding: '1.5rem' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
      <h4 style={{ fontWeight: 800, fontSize: '0.9rem' }}>{label}</h4>
      <span className={`tag ${tagClass}`} style={{ fontSize: '0.65rem' }}>
        {data?.type?.replace(/_/g, ' ') || '—'}
      </span>
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div>
        <p style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Self Rating</p>
        <span className={`tag ${data?.selfRating === 'Below' ? 'tag-danger' : data?.selfRating === 'Above' ? 'tag-success' : 'tag-warning'}`} style={{ fontSize: '0.8rem' }}>
          {data?.selfRating || '—'}
        </span>
      </div>
      <div>
        <p style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Self Progress</p>
        <p style={{
          fontSize: '0.82rem', lineHeight: 1.5,
          color: data?.selfProgress ? 'var(--text-primary)' : 'var(--danger-color)',
          fontStyle: data?.selfProgress ? 'normal' : 'italic',
          background: 'rgba(0,0,0,0.03)', padding: '0.5rem 0.65rem', borderRadius: '0.375rem'
        }}>
          {data?.selfProgress || 'No response — soft-flagged'}
        </p>
      </div>
      <div>
        <p style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Manager Rating</p>
        <span className={`tag ${data?.managerRating === 'Below' ? 'tag-danger' : data?.managerRating === 'Above' ? 'tag-success' : 'tag-warning'}`} style={{ fontSize: '0.8rem' }}>
          {data?.managerRating || '—'}
        </span>
      </div>
      <div>
        <p style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Manager Comments</p>
        <p style={{
          fontSize: '0.82rem', lineHeight: 1.5, color: 'var(--text-primary)',
          background: 'rgba(0,0,0,0.03)', padding: '0.5rem 0.65rem', borderRadius: '0.375rem'
        }}>
          {data?.managerComments || 'Not submitted.'}
        </p>
      </div>
      {data?.contextNote && (
        <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', background: 'rgba(0,0,0,0.04)', padding: '0.4rem 0.6rem', borderRadius: '0.35rem' }}>
          {data.contextNote}
        </p>
      )}
      {data?.flaggedAt && (
        <p style={{ fontSize: '0.7rem', fontWeight: 700, color: borderColor }}>
          🚩 Flagged: {new Date(data.flaggedAt).toLocaleDateString()}
        </p>
      )}
    </div>
  </div>
);

const AdminDashboard = () => {
  const { showAlert, showConfirm } = useModal();
  const [stats, setStats] = useState(null);
  const [orgData, setOrgData] = useState(null);
  const [companyAggregations, setCompanyAggregations] = useState({ count: 0, avgCompletion: 0, totalWeightage: 0 });
  const [loading, setLoading] = useState(true);
  const [showInvestigateModal, setShowInvestigateModal] = useState(false);
  const [investigateData, setInvestigateData] = useState(null);

  const fetchData = async () => {
    try {
      const [statsRes, orgRes, compRes] = await Promise.all([
        api.get('/admin/dashboard-stats'),
        api.get('/admin/org-aggregation'),
        api.get('/admin/company-aggregations')
      ]);
      setStats(statsRes.data);
      setOrgData(orgRes.data);
      setCompanyAggregations(compRes.data || { count: 0, avgCompletion: 0, totalWeightage: 0 });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleInvestigate = (alert) => {
    setInvestigateData(alert);
    setShowInvestigateModal(true);
  };

  const handleResolve = async (id) => {
    showConfirm('Resolve Flag', 'Confirm you wish to waive this red flag. This will clear it from the active queue.', async () => {
      try {
        await api.patch(`/admin/resolve-review/${id}`, { action: 'Waive' });
        await fetchData();
        showAlert('Resolved', 'Review flag has been successfully waived.');
      } catch (err) {
        showAlert('Error', 'Error resolving review flag.');
      }
    });
  };

  const handleExport = () => {
    api.get('/admin/export-csv', { responseType: 'blob' }).then(res => {
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'pms_report.csv');
      document.body.appendChild(link);
      link.click();
    });
  };

  if (loading || !stats || !orgData) return (
    <div className="animate-fade-in" style={{ padding: '0' }}>
      {/* Skeleton KPI Cards */}
      <div className="grid-container" style={{ marginBottom: '1.5rem' }}>
        {[1, 2, 3].map(i => (
          <div key={i} className="card" style={{ gap: '0.75rem', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={skeletonStyle(120, 14)} />
              <div style={skeletonStyle(20, 20, '50%')} />
            </div>
            <div style={skeletonStyle(60, 36)} />
            <div style={skeletonStyle('100%', 8, 4)} />
            <div style={skeletonStyle(160, 12)} />
          </div>
        ))}
      </div>
      {/* Skeleton Main Panels */}
      <div className="grid-container" style={{ gridTemplateColumns: '1fr 1fr' }}>
        {[1, 2].map(i => (
          <div key={i} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={skeletonStyle(200, 18)} />
            {[1, 2, 3].map(j => (
              <div key={j} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderBottom: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <div style={skeletonStyle(180, 13)} />
                  <div style={skeletonStyle(130, 11)} />
                </div>
                <div style={skeletonStyle(70, 28, 6)} />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="animate-fade-in">

      {/* ── Repeat Flag Investigation Modal ──────────────────────────── */}
      {showInvestigateModal && investigateData && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.55)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
        }}>
          <div className="card" style={{
            width: '100%', maxWidth: '860px', padding: '2.5rem',
            position: 'relative', maxHeight: '88vh', overflowY: 'auto',
            borderTop: '4px solid var(--danger-color)'
          }}>
            <button
              onClick={() => setShowInvestigateModal(false)}
              style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
            >
              <X size={20} />
            </button>

            <div style={{ marginBottom: '1.75rem' }}>
              <span style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--danger-color)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                🚨 Repeat Flag Pattern Detected
              </span>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.25rem', marginTop: '0.5rem' }}>
                {investigateData.subject}
              </h2>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                This employee has been flagged across 2+ consecutive review cycles. Compare both submissions side by side to inform your action.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <ReviewSideCard
                data={investigateData.currentReview}
                label="Current Cycle"
                borderColor="rgba(239,68,68,0.45)"
                bgColor="rgba(239,68,68,0.03)"
                tagClass="tag-danger"
              />
              <ReviewSideCard
                data={investigateData.pastReview}
                label="Previous Cycle"
                borderColor="rgba(245,158,11,0.55)"
                bgColor="rgba(245,158,11,0.03)"
                tagClass="tag-warning"
              />
            </div>

            <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button className="btn btn-outline" onClick={() => setShowInvestigateModal(false)}>Close</button>
              <button
                className="btn btn-primary"
                style={{ background: 'var(--danger-color)', borderColor: 'var(--danger-color)' }}
                onClick={() => {
                  setShowInvestigateModal(false);
                  showAlert('Pattern Noted', 'Use the "Resolve" action in the Flagged Queue to formally Waive, Extend, or Escalate the related review records.');
                }}
              >
                <AlertTriangle size={15} /> Record & Escalate Pattern
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Low Compliance Banner ─────────────────────────────────────── */}
      {stats.complianceRate < 50 && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid var(--danger-color)', padding: '1rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--danger-color)', marginBottom: '1.5rem' }}>
          <Settings size={20} />
          <div>
            <h4 style={{ fontWeight: 700, fontSize: '0.875rem' }}>Low Compliance Alert</h4>
            <p style={{ fontSize: '0.75rem' }}>Organisation compliance is below 50%. Review red-flag queues immediately.</p>
          </div>
        </div>
      )}

      {/* ── KPI Cards ─────────────────────────────────────────────────── */}
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
            <TrendingUp size={16} className={stats.complianceRate >= 80 ? 'trend-up' : 'trend-down'} style={stats.complianceRate < 80 ? { color: 'var(--danger-color)' } : {}} />
            <span style={stats.complianceRate < 80 ? { color: 'var(--danger-color)' } : {}}>Active Cycle Submission Rate</span>
          </div>
        </div>

        <div className="card delay-2">
          <div className="card-header">
            <span className="card-title">Red-Flagged Reviews</span>
            <AlertTriangle className="sidebar-logo-icon" style={{ color: 'var(--danger-color)' }} size={20} />
          </div>
          <div className="card-value" style={{ color: 'var(--danger-color)' }}>{stats.flaggedQueue}</div>
          <p className="card-trend text-secondary mt-1">Sentiment / low score / blank response flags</p>
        </div>

        <div className="card delay-3">
          <div className="card-header">
            <span className="card-title">Active Escalations</span>
            <Bell className="sidebar-logo-icon" style={{ color: 'var(--warning-color)' }} size={20} />
          </div>
          <div className="card-value">{stats.pendingProbations + (stats.patternAlerts?.length || 0)}</div>
          <p className="card-trend text-secondary mt-1">Pending probation confirmations & pattern bounds</p>
        </div>
      </div>

      {/* ── Main Panels ───────────────────────────────────────────────── */}
      <div className="grid-container" style={{ gridTemplateColumns: '1fr 1fr' }}>

        {/* Flagged Responses Queue */}
        <div className="card delay-4">
          <div className="card-header" style={{ marginBottom: '1.5rem' }}>
            <h3 className="card-title" style={{ fontSize: '1.125rem', color: 'var(--text-primary)', fontWeight: 800 }}>Flagged Responses Queue</h3>
            <button className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}>
              <Filter size={14} /> Sort by Severity
            </button>
          </div>

          <div className="list-group">
            {/* Individual flagged reviews */}
            {stats.flaggedDetails.length > 0
              ? stats.flaggedDetails.map((rev) => {
                  const daysAgo = getDaysSinceFlagged(rev.flaggedAt);
                  const isAutoEscalated = rev.contextNote?.toUpperCase().includes('AUTO-ESCALATED');

                  return (
                    <div
                      className="list-item"
                      key={rev._id}
                      style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.5rem' }}
                    >
                      <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div className="list-item-main" style={{ flex: 1 }}>
                          <span className="list-item-title">{rev.subjectId?.name} — {rev.type}</span>
                          <span className="list-item-desc">
                            Manager: {rev.managerId ? rev.managerId.name : 'Unassigned'} | Due: {new Date(rev.dueDate || rev.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center', flexShrink: 0, marginLeft: '0.75rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                          {rev.contextNote?.includes('Soft-Flag') && (
                            <span className="tag tag-warning" style={{ fontSize: '0.6rem' }}>Soft Flag</span>
                          )}
                          {isAutoEscalated && (
                            <span className="tag" style={{ fontSize: '0.6rem', background: 'rgba(239,68,68,0.15)', color: 'var(--danger-color)', border: '1px solid rgba(239,68,68,0.3)' }}>
                              ⚠️ Auto-Escalated
                            </span>
                          )}
                          {daysAgo !== null && (
                            <span style={{
                              fontSize: '0.6rem', fontWeight: 800, padding: '0.2rem 0.45rem', borderRadius: '0.25rem',
                              background: daysAgo >= 7 ? 'rgba(239,68,68,0.12)' : daysAgo >= 3 ? 'rgba(245,158,11,0.12)' : 'rgba(0,0,0,0.05)',
                              color: daysAgo >= 7 ? 'var(--danger-color)' : daysAgo >= 3 ? 'var(--warning-color)' : 'var(--text-secondary)'
                            }}>
                              🕐 {daysAgo}d ago
                            </span>
                          )}
                          <button
                            className="btn btn-primary"
                            style={{ padding: '0.35rem 0.8rem', fontSize: '0.7rem' }}
                            onClick={() => handleResolve(rev._id)}
                          >
                            Resolve
                          </button>
                        </div>
                      </div>

                      {rev.contextNote && (
                        <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', background: 'rgba(0,0,0,0.03)', padding: '0.4rem 0.65rem', borderRadius: '0.35rem', width: '100%', margin: 0, lineHeight: 1.4 }}>
                          {rev.contextNote}
                        </p>
                      )}
                    </div>
                  );
                })
              : <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>No active red flags.</p>
            }

            {/* Pattern / repeat flag alerts */}
            {stats.patternAlerts?.map((alert, i) => (
              <div
                className="list-item"
                key={`pattern-${i}`}
                style={{ borderLeft: '4px solid var(--danger-color)', background: 'rgba(239,68,68,0.02)' }}
              >
                <div className="list-item-main">
                  <span className="list-item-title" style={{ color: 'var(--danger-color)' }}>
                    🚨 {alert.subject} — Repeat Flag
                  </span>
                  <span className="list-item-desc">
                    Current: <strong>{alert.currentReview?.type?.replace(/_/g, ' ') || alert.currentReview}</strong>
                    {' '}| Previous: <strong>{alert.pastReview?.type?.replace(/_/g, ' ') || alert.pastReview}</strong>
                  </span>
                </div>
                <button
                  className="btn btn-outline"
                  style={{ padding: '0.35rem 0.75rem', fontSize: '0.7rem', borderColor: 'var(--danger-color)', color: 'var(--danger-color)', flexShrink: 0 }}
                  onClick={() => handleInvestigate(alert)}
                >
                  <AlertTriangle size={13} /> Compare
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Org-Level Overview */}
        <div className="card delay-4">
          <div className="card-header" style={{ marginBottom: '1.5rem' }}>
            <h3 className="card-title" style={{ fontSize: '1.125rem', color: 'var(--text-primary)', fontWeight: 800 }}>Org-Level Overview</h3>
          </div>
          <div className="list-group">
            <div className="list-item" style={{ background: 'rgba(4,102,69,0.03)', borderColor: 'var(--accent-color)' }}>
              <div className="list-item-main">
                <span className="list-item-title" style={{ color: 'var(--accent-color)' }}>Company Goals ({companyAggregations.count})</span>
                <span className="list-item-desc">High-Level Objectives • {companyAggregations.totalWeightage}% Total Weight</span>
              </div>
              <span className="tag tag-success">{companyAggregations.avgCompletion}% Completed</span>
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
              <span className="tag" style={{ background: '#f1f5f9', color: '#475569' }}>{orgData.Individual.avgCompletion}% Completed</span>
            </div>
          </div>
          <div style={{ marginTop: '2rem' }}>
            <button onClick={handleExport} className="btn btn-primary btn-full">
              <Download size={16} /> Export Compliance Report (CSV)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
