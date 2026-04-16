import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from './context/AuthContext';
import { useModal } from './context/ModalContext';
import {
  LayoutDashboard,
  Target,
  MessageSquare,
  Bell,
  Settings,
  LogOut,
  ChevronRight,
  Shield,
  Zap,
  BarChart3,
  CalendarClock,
  RefreshCw,
  Activity,
  CheckCircle,
  Users,
  AlertTriangle,
  GitMerge,
  TrendingUp,
  Clock,
  FileText
} from 'lucide-react';
import './index.css';

// Import newly created separate Dashboard components
import EmployeeDashboard from './components/dashboards/EmployeeDashboard';
import ManagerDashboard from './components/dashboards/ManagerDashboard';
import AdminDashboard from './components/dashboards/AdminDashboard';
import GoalsGMS from './components/GoalsGMS';
import FeedbackForms from './components/FeedbackForms';

// --- Landing Page ---
const LandingPage = ({ onNavigate }) => {
  return (
    <div className="landing-page animate-fade-in" style={{ backgroundColor: '#fdfdfd', minHeight: '100vh', width: '100vw', overflowX: 'hidden' }}>

      {/* Top Navbar */}
      <nav className="landing-nav" style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '1.25rem 4rem', background: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(16px)', position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, borderBottom: '1px solid rgba(0,0,0,0.05)'
      }}>
        <div className="sidebar-logo" style={{ margin: 0, cursor: 'pointer' }}>
          <Target className="sidebar-logo-icon" size={28} />
          <span style={{ fontSize: '1.5rem' }}>PMS<span style={{ color: 'var(--secondary-color)' }}>.</span></span>
        </div>

        {/* Right Nav Options Wrap */}
        <div style={{ display: 'flex', gap: '3rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '2rem', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            <a href="#product" style={{ textDecoration: 'none', color: 'inherit', transition: 'color 0.2s' }} onMouseOver={e => e.target.style.color = 'var(--accent-color)'} onMouseOut={e => e.target.style.color = 'var(--text-secondary)'}>Product</a>
            <a href="#solutions" style={{ textDecoration: 'none', color: 'inherit', transition: 'color 0.2s' }} onMouseOver={e => e.target.style.color = 'var(--accent-color)'} onMouseOut={e => e.target.style.color = 'var(--text-secondary)'}>Solutions</a>
            <a href="#resources" style={{ textDecoration: 'none', color: 'inherit', transition: 'color 0.2s' }} onMouseOver={e => e.target.style.color = 'var(--accent-color)'} onMouseOut={e => e.target.style.color = 'var(--text-secondary)'}>Resources</a>
            <a href="#pricing" style={{ textDecoration: 'none', color: 'inherit', transition: 'color 0.2s' }} onMouseOver={e => e.target.style.color = 'var(--accent-color)'} onMouseOut={e => e.target.style.color = 'var(--text-secondary)'}>Pricing</a>
          </div>

          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            {/* <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.95rem' }} onClick={() => onNavigate('AUTH')}>Log in</button> */}
            <button className="btn btn-primary" style={{ boxShadow: '0 4px 14px 0 rgba(4, 102, 69, 0.35)', padding: '0.6rem 1.75rem' }} onClick={() => onNavigate('AUTH')}>Get Started</button>
          </div>
        </div>
      </nav>

      {/* Structured Hero Section - 2 Columns */}
      <main style={{
        padding: '10rem 4rem 4rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: '1300px', margin: '0 auto', gap: '3rem', position: 'relative', minHeight: 'calc(100vh - 100px)'
      }}>
        {/* Abstract Background Blob */}
        <div style={{ position: 'absolute', top: '0%', right: '-10%', width: '800px', height: '800px', background: 'radial-gradient(circle, rgba(49,184,140,0.12) 0%, rgba(4,102,69,0) 70%)', zIndex: 0 }}></div>

        <div style={{ flex: 1, zIndex: 1, maxWidth: '550px' }}>
          <div className="hero-badge animate-fade-in delay-1" style={{ border: '1px solid rgba(49, 184, 140, 0.3)', background: 'rgba(49, 184, 140, 0.1)', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Zap size={14} color="var(--accent-color)" /> The New Standard in Enterprise Performance
          </div>
          <h1 className="hero-title animate-fade-in delay-2" style={{ textAlign: 'left', fontSize: '3.6rem', letterSpacing: '-0.02em', lineHeight: 1.1, marginTop: '0', marginBottom: '1.5rem' }}>
            Unify Your Culture. <br />
            <span className="text-gradient">Automate Accountability.</span>
          </h1>
          <p className="hero-subtitle animate-fade-in delay-3" style={{ textAlign: 'left', margin: '0 0 2.5rem 0', maxWidth: '500px', fontSize: '1.2rem', lineHeight: 1.6 }}>
            Replace fragmented email threads and informal spreadsheets with an intelligent platform. Track probation, execute performance cycles, and cascade structured goals effortlessly.
          </p>
          <div className="hero-actions animate-fade-in delay-4" style={{ justifyContent: 'flex-start' }}>
            <button className="btn btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1.125rem', boxShadow: '0 8px 24px rgba(4, 102, 69, 0.25)' }} onClick={() => onNavigate('AUTH')}>
              Start Free Trial <ChevronRight size={18} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500 }}>
              <CheckCircle size={16} color="var(--success-color)" /> No credit card required.
            </div>
          </div>
        </div>

        {/* Hero Illustration / Dashboard Preview Robust Mockup */}
        <div className="animate-slide-in delay-4" style={{ flex: 1, position: 'relative', display: 'flex', justifyContent: 'flex-end', zIndex: 1 }}>
          <div style={{
            width: '100%', maxWidth: '600px',
            background: 'rgba(255,255,255,0.95)', border: '1px solid rgba(0,0,0,0.08)',
            borderRadius: '1rem', padding: '2rem', boxShadow: '0 32px 64px -12px rgba(4, 102, 69, 0.15)',
            backdropFilter: 'blur(16px)'
          }}>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700 }}>Org-Wide Compliance</span>
              <span className="tag tag-success" style={{ fontSize: '0.85rem', background: 'rgba(49, 184, 140, 0.15)', padding: '0.3rem 0.6rem' }}>92% On Track</span>
            </h3>
            <div style={{ background: '#f0f0f0', height: '12px', borderRadius: '6px', marginBottom: '2.5rem', overflow: 'hidden' }}>
              <div style={{ background: 'var(--accent-color)', width: '92%', height: '100%', borderRadius: '6px', transition: 'width 1s ease-in-out' }}></div>
            </div>

            <div style={{ display: 'flex', gap: '1.25rem' }}>
              <div style={{ flex: 1, padding: '1.5rem', background: '#fff', borderRadius: '0.75rem', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 8px 16px rgba(0,0,0,0.03)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}><Clock size={18} color="var(--warning-color)" /><span style={{ fontSize: '1rem', fontWeight: 800 }}>Day 60 Trigger</span></div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>Automated nudge sent to 14 active probation members.</p>
              </div>
              <div style={{ flex: 1, padding: '1.5rem', background: '#fff', borderRadius: '0.75rem', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 8px 16px rgba(0,0,0,0.03)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}><Target size={18} color="var(--accent-color)" /><span style={{ fontSize: '1rem', fontWeight: 800 }}>Q3 Cascade</span></div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>Sales Goal successfully mapped to 42 individuals.</p>
              </div>
            </div>
          </div>

          {/* Floating element 1 */}
          <div style={{
            position: 'absolute', left: '-40px', bottom: '-30px', width: '280px',
            background: '#fff', border: '1px solid rgba(0,0,0,0.08)',
            borderRadius: '1rem', padding: '1.25rem', boxShadow: '0 16px 32px -8px rgba(0,0,0,0.15)'
          }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--danger-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 4px 8px rgba(239, 68, 68, 0.3)', flexShrink: 0 }}><AlertTriangle size={20} /></div>
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>Pattern Detected</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0, marginTop: '0.2rem' }}>Escalating immediately to Admin</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Trust Badges Bar */}
      <section style={{ borderTop: '1px solid rgba(0,0,0,0.04)', borderBottom: '1px solid rgba(0,0,0,0.04)', padding: '3.5rem 0', background: '#fff', textAlign: 'center' }}>
        <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '2.5rem' }}>Trusted by agile performance teams securely worldwide</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '5rem', opacity: 0.3, filter: 'grayscale(100%)', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-1px' }}>AcmeCorp</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-1px' }}>Globex.io</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-1px' }}>Soylent Tech</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-1px' }}>Initech</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-1px' }}>StarkInd</div>
        </div>
      </section>

      {/* Product Section */}
      <section id="product" className="capabilities-section" style={{ paddingTop: '8rem', paddingBottom: '6rem', background: 'linear-gradient(180deg, #fcfcfc 0%, #f4f8f7 100%)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <h2 className="section-title" style={{ marginBottom: '1rem' }}>Why Switch to PMS?</h2>
          <p className="text-secondary" style={{ marginBottom: '4rem', fontSize: '1.25rem', maxWidth: '700px', margin: '0 auto 4rem' }}>Stop guessing who is off-track. Move from chaotic silos to structured, centralized, auditable data.</p>

          <div className="grid-container" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '2.5rem' }}>
            {/* Note: Using inline onMouseEnter to simulate modern SaaS card hover lifts */}

            {/* Red Card */}
            <div className="card" style={{ textAlign: 'left', borderTop: 'none', background: 'linear-gradient(145deg, rgba(239, 68, 68, 0.05) 0%, rgba(255, 255, 255, 1) 100%)', padding: '2.5rem', boxShadow: '0 16px 32px rgba(239, 68, 68, 0.05)', transition: 'all 0.3s ease', cursor: 'pointer', border: '1px solid rgba(239, 68, 68, 0.1)', borderRadius: '1.25rem' }} onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.boxShadow = '0 24px 48px rgba(239, 68, 68, 0.1)' }} onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 16px 32px rgba(239, 68, 68, 0.05)' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                <MessageSquare size={24} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>Informal Feedback Ends Here</h3>
              <p className="text-secondary" style={{ lineHeight: 1.6 }}>No more undocumented performance discussions. Capture 100% structured self and manager data cross-shared securely through automated checkpoints.</p>
            </div>

            {/* Yellow/Warning Card */}
            <div className="card" style={{ textAlign: 'left', borderTop: 'none', background: 'linear-gradient(145deg, rgba(245, 158, 11, 0.05) 0%, rgba(255, 255, 255, 1) 100%)', padding: '2.5rem', boxShadow: '0 16px 32px rgba(245, 158, 11, 0.05)', transition: 'all 0.3s ease', cursor: 'pointer', border: '1px solid rgba(245, 158, 11, 0.1)', borderRadius: '1.25rem' }} onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.boxShadow = '0 24px 48px rgba(245, 158, 11, 0.1)' }} onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 16px 32px rgba(245, 158, 11, 0.05)' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                <GitMerge size={24} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>Siloed Goals Fixed</h3>
              <p className="text-secondary" style={{ lineHeight: 1.6 }}>Cascading architecture meticulously links Company → Team → Individual Goals. Everyone knows exactly how their weighting counts toward the Org-level.</p>
            </div>

            {/* Green/Success Card */}
            <div className="card" style={{ textAlign: 'left', borderTop: 'none', background: 'linear-gradient(145deg, rgba(49, 184, 140, 0.05) 0%, rgba(255, 255, 255, 1) 100%)', padding: '2.5rem', boxShadow: '0 16px 32px rgba(49, 184, 140, 0.05)', transition: 'all 0.3s ease', cursor: 'pointer', border: '1px solid rgba(49, 184, 140, 0.1)', borderRadius: '1.25rem' }} onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.boxShadow = '0 24px 48px rgba(49, 184, 140, 0.1)' }} onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 16px 32px rgba(49, 184, 140, 0.05)' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(49, 184, 140, 0.1)', color: 'var(--success-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                <Clock size={24} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>Missed Probation Escalated</h3>
              <p className="text-secondary" style={{ lineHeight: 1.6 }}>Zero manual intervention needed. Our engine strictly fires Day 30/60/80 triggers. If ignored, the system rigorously escalates directly to Admin queues.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Solutions Section with Ambient Backdrop */}
      <section id="solutions" style={{
        padding: '4rem 4rem',
        background: 'linear-gradient(180deg, #fff 0%, rgba(4, 102, 69, 0.02) 100%)',
        borderTop: '1px solid rgba(0,0,0,0.04)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Subtle background element */}
        <div style={{ position: 'absolute', bottom: '-10%', left: '-10%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(49,184,140,0.03) 0%, rgba(255,255,255,0) 70%)', zIndex: 0 }}></div>

        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '8rem', position: 'relative', zIndex: 1 }}>
          <div style={{ flex: 1 }}>
            <h2 className="section-title" style={{ textAlign: 'left', marginBottom: '1.5rem', fontSize: '2.5rem', letterSpacing: '-0.02em' }}>Tailored Role Experiences</h2>
            <p className="text-secondary" style={{ fontSize: '1.125rem', marginBottom: '2.5rem', lineHeight: 1.6 }}>Every role sees exactly what they need. No bloated interfaces. Just distinct features engineered explicitly for their position in the hierarchy.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {/* Employee Feature */}
              <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(4, 102, 69, 0.08)', color: 'var(--accent-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Users size={24} /></div>
                <div>
                  <h4 style={{ fontSize: '1.125rem', fontWeight: 800 }}>Employee Empowerment</h4>
                  <p className="text-secondary" style={{ fontSize: '0.9rem', marginTop: '0.5rem', lineHeight: 1.5 }}>True end-user ownership via goal drafting, predictable form triggers, and transparent cross-shared historical evaluations.</p>
                </div>
              </div>
              {/* Manager Feature */}
              <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(49, 184, 140, 0.1)', color: 'var(--secondary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Activity size={24} /></div>
                <div>
                  <h4 style={{ fontSize: '1.125rem', fontWeight: 800 }}>Manager Visibility</h4>
                  <p className="text-secondary" style={{ fontSize: '0.9rem', marginTop: '0.5rem', lineHeight: 1.5 }}>Live team completion heatmaps, rapid one-click goal approval queues, and drastically simplified schedule reviews.</p>
                </div>
              </div>
              {/* Admin Feature */}
              <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(0, 31, 31, 0.08)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Shield size={24} /></div>
                <div>
                  <h4 style={{ fontSize: '1.125rem', fontWeight: 800 }}>Admin Compliance Control</h4>
                  <p className="text-secondary" style={{ fontSize: '0.9rem', marginTop: '0.5rem', lineHeight: 1.5 }}>Globally sentinel flagged responses across the entire org, deep GMS aggregations, and exportable HR metric reports.</p>
                </div>
              </div>
            </div>
          </div>
          {/* Simple Professional Visual - Mirroring Hero Structure */}
          <div style={{ flex: 1, position: 'relative', display: 'flex', justifyContent: 'flex-end', zIndex: 1 }}>
            <div style={{
              width: '100%', maxWidth: '580px',
              background: '#fff', border: '1px solid rgba(0,0,0,0.06)',
              borderRadius: '1.25rem', padding: '2.5rem', boxShadow: '0 32px 64px -12px rgba(4, 102, 69, 0.12)',
              position: 'relative'
            }}>
              <h3 style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 800 }}>Role-Based Command Hub</span>
                <span className="tag tag-success" style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}>Operational</span>
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Simplified Card 1 */}
                <div style={{ padding: '1.5rem', background: '#fcfcfc', borderRadius: '1rem', border: '1px solid rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                   <div style={{ background: 'rgba(4, 102, 69, 0.1)', width: '44px', height: '44px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                     <Users size={20} color="var(--accent-color)" />
                   </div>
                   <div>
                     <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)' }}>Employee Workspace</h4>
                     <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>Drafting goals & self-reflection cycles.</p>
                   </div>
                </div>

                {/* Simplified Card 2 */}
                <div style={{ padding: '1.5rem', background: '#fcfcfc', borderRadius: '1rem', border: '1px solid rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                   <div style={{ background: 'rgba(49, 184, 140, 0.1)', width: '44px', height: '44px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                     <Activity size={20} color="var(--secondary-color)" />
                   </div>
                   <div>
                     <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)' }}>Manager Oversight</h4>
                     <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>Approvals & team completion heatmaps.</p>
                   </div>
                </div>
              </div>

              {/* Small Floating Success Badge */}
              <div style={{
                position: 'absolute', top: '-15px', right: '30px', 
                background: 'var(--accent-color)', color: '#fff', 
                padding: '0.5rem 1rem', borderRadius: '2rem', fontSize: '0.75rem', 
                fontWeight: 800, boxShadow: '0 8px 16px rgba(4,102,69,0.3)'
              }}>
                PROTOCOL ACTIVE
              </div>
            </div>

            {/* Floating Role Element */}
            <div className="animate-float" style={{
              position: 'absolute', left: '-20px', bottom: '-40px', width: '240px',
              background: 'var(--text-primary)', color: '#fff', 
              borderRadius: '1rem', padding: '1.25rem', boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              zIndex: 3
            }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Shield size={18} color="var(--secondary-color)" /></div>
                <div>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 800, margin: 0 }}>Admin Logic</h4>
                  <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)', margin: 0 }}>12 Soft-Flags surface today</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Extreme Automation Features */}
      <section className="capabilities-section" style={{ background: 'var(--text-primary)', color: '#fff', padding: '8rem 4rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
            <h2 className="section-title" style={{ color: '#fff', fontSize: '2.5rem', marginBottom: '1rem' }}>Ruthless Automation & Compliance</h2>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.25rem' }}>Set it up once in your configuration, and never chase an employee again.</p>
          </div>

          <div className="grid-container" style={{ gridTemplateColumns: 'minmax(400px, 1fr) minmax(400px, 1fr)', gap: '3rem' }}>
            <div className="card" style={{ padding: '3rem', background: '#fff', color: 'var(--text-primary)', border: '1px solid rgba(0,0,0,0.05)', borderRadius: '1.25rem', boxShadow: '0 24px 48px rgba(0,0,0,0.1)' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '2.5rem', color: 'var(--text-primary)' }}>Intelligent Timeline Rules</h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div style={{ display: 'flex', gap: '1.25rem' }}>
                  <div style={{ background: 'rgba(4, 102, 69, 0.1)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><CalendarClock size={24} color="var(--accent-color)" /></div>
                  <div>
                    <h4 style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1.1rem' }}>Probation Monitor</h4>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.4rem', lineHeight: 1.6 }}>Hits the Employee and Manager on working Day 30, 60, and 80 exactly.</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1.25rem' }}>
                  <div style={{ background: 'rgba(4, 102, 69, 0.1)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><RefreshCw size={24} color="var(--accent-color)" /></div>
                  <div>
                    <h4 style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1.1rem' }}>Bi-Annual & Quarterly Cycles</h4>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.4rem', lineHeight: 1.6 }}>Parallel tracks cleanly mapped. Bi-annual running Aug/Feb. Distinct escalations fired dynamically.</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1.25rem' }}>
                  <div style={{ background: 'rgba(4, 102, 69, 0.1)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Bell size={24} color="var(--accent-color)" /></div>
                  <div>
                    <h4 style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1.1rem' }}>The "22nd Escalation Law"</h4>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.4rem', lineHeight: 1.6 }}>Gentle nudges drop on the 5th and 15th. Total system escalation strictly to HR on the 22nd.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card" style={{ padding: '3rem', background: '#fff', color: 'var(--text-primary)', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 24px 48px rgba(0,0,0,0.1)', borderRadius: '1.25rem' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '2.5rem', color: 'var(--text-primary)' }}>Enterprise Edge Strategies</h3>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '2rem', padding: 0 }}>
                <li style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div style={{ marginTop: '0.15rem' }}><CheckCircle size={22} color="var(--accent-color)" style={{ flexShrink: 0 }} /></div>
                  <span style={{ fontSize: '1.05rem', lineHeight: 1.5, color: 'var(--text-secondary)' }}><strong style={{ color: 'var(--text-primary)' }}>Leave Parsing:</strong> Probation clock auto-pauses intelligently during leave blocks.</span>
                </li>
                <li style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div style={{ marginTop: '0.15rem' }}><CheckCircle size={22} color="var(--accent-color)" style={{ flexShrink: 0 }} /></div>
                  <span style={{ fontSize: '1.05rem', lineHeight: 1.5, color: 'var(--text-secondary)' }}><strong style={{ color: 'var(--text-primary)' }}>Pattern Detection:</strong> Repeat flags across contiguous cycles are permanently tracked.</span>
                </li>
                <li style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div style={{ marginTop: '0.15rem' }}><CheckCircle size={22} color="var(--accent-color)" style={{ flexShrink: 0 }} /></div>
                  <span style={{ fontSize: '1.05rem', lineHeight: 1.5, color: 'var(--text-secondary)' }}><strong style={{ color: 'var(--text-primary)' }}>Mid-Cycle Joins:</strong> Grace periods mapped definitively for fair goal assignments.</span>
                </li>
                <li style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div style={{ marginTop: '0.15rem' }}><CheckCircle size={22} color="var(--accent-color)" style={{ flexShrink: 0 }} /></div>
                  <span style={{ fontSize: '1.05rem', lineHeight: 1.5, color: 'var(--text-secondary)' }}><strong style={{ color: 'var(--text-primary)' }}>Auto-flagging:</strong> Text blankness & deeply negative sentiment tags instantly surface to upper Admins.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Resources Section with Subtle Theme Gradient */}
      <section id="resources" style={{
        padding: '4rem 4rem',
        background: 'linear-gradient(135deg, #fff 0%, rgba(4, 102, 69, 0.03) 100%)',
        borderTop: '1px solid rgba(0,0,0,0.04)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative Background Blob */}
        <div style={{ position: 'absolute', top: '10%', right: '-5%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(49,184,140,0.05) 0%, rgba(255,255,255,0) 70%)', zIndex: 0 }}></div>

        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <h2 className="section-title" style={{ marginBottom: '0.5rem' }}>Resources</h2>
          <p className="text-secondary" style={{ marginBottom: '2.5rem', fontSize: '1.25rem' }}>Deep dives into performance strategy and platform guides.</p>

          <div className="grid-container" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '2.5rem' }}>
            {[
              { title: "The 2026 HR Playbook", desc: "A comprehensive guide to automating probation at scale with definitive legal-proof data.", tag: "GUIDE", icon: <FileText size={48} color="var(--accent-color)" /> },
              { title: "GMS Best Practices", desc: "How to weight goals for maximal impact and org-wide visibility.", tag: "STRATEGY", icon: <Target size={48} color="var(--secondary-color)" /> },
              { title: "API Documentation", desc: "Integrate PMS with your existing HRIS stack securely via REST.", tag: "TECH", icon: <Settings size={48} color="var(--text-secondary)" /> }
            ].map((r, i) => (
              <div key={i} className="card h-hover" style={{
                textAlign: 'left',
                padding: '2.5rem',
                border: '1px solid rgba(0,0,0,0.05)',
                background: '#fff',
                boxShadow: '0 10px 40px rgba(0,0,0,0.03)',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: '1.5rem',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
              }}>
                <div style={{ background: 'rgba(4,102,69,0.03)', height: '220px', borderRadius: '1rem', marginBottom: '1.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(0,0,0,0.02)' }}>
                  {r.icon}
                </div>
                <span style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--accent-color)', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>{r.tag}</span>
                <h4 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.75rem', letterSpacing: '-0.01em' }}>{r.title}</h4>
                <p className="text-secondary" style={{ fontSize: '0.95rem', lineHeight: 1.6, flexGrow: 1 }}>{r.desc}</p>
                <button className="btn btn-text" style={{ marginTop: '1.75rem', padding: 0, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>Learn More <ChevronRight size={16} /></button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" style={{ padding: '4rem 4rem', background: 'linear-gradient(180deg, #fff 0%, #f8fafc 100%)', borderTop: '1px solid rgba(0,0,0,0.04)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <h2 className="section-title" style={{ marginBottom: '0.5rem' }}>Pricing</h2>
          <p className="text-secondary" style={{ marginBottom: '2.5rem', fontSize: '1.25rem', maxWidth: '700px', margin: '0 auto 2.5rem' }}>Choose the plan that fits your organizational scale.</p>

          <div className="grid-container" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '2.5rem' }}>
            {/* Starter */}
            <div className="card" style={{ padding: '3rem', border: '1px solid rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column' }}>
              <h4 style={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '0.15em', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Starter</h4>
              <div style={{ fontSize: '3.5rem', fontWeight: 800, marginBottom: '2rem' }}>Free<span style={{ fontSize: '1.125rem', color: 'var(--text-secondary)', fontWeight: 500 }}>/mo</span></div>
              <ul style={{ listStyle: 'none', padding: 0, textAlign: 'left', marginBottom: '3rem', fontSize: '1rem', color: 'var(--text-secondary)', flexGrow: 1 }}>
                <li style={{ marginBottom: '1rem', display: 'flex', gap: '0.75rem' }}><CheckCircle size={18} color="var(--success-color)" /> Up to 10 Employees</li>
                <li style={{ marginBottom: '1rem', display: 'flex', gap: '0.75rem' }}><CheckCircle size={18} color="var(--success-color)" /> Basic Goal Tracking</li>
                <li style={{ marginBottom: '1rem', display: 'flex', gap: '0.75rem' }}><CheckCircle size={18} color="var(--success-color)" /> Probation Templates</li>
              </ul>
              <button className="btn btn-outline btn-full" style={{ padding: '1rem' }} onClick={() => onNavigate('AUTH')}>Get Started</button>
            </div>

            {/* Pro */}
            <div className="card" style={{ padding: '3rem', border: '2px solid var(--accent-color)', position: 'relative', overflow: 'hidden', boxShadow: '0 32px 64px -12px rgba(4, 102, 69, 0.15)', display: 'flex', flexDirection: 'column' }}>
              <div style={{ position: 'absolute', top: '1.5rem', right: '-3rem', background: 'var(--accent-color)', color: '#fff', padding: '0.5rem 4rem', transform: 'rotate(45deg)', fontSize: '0.75rem', fontWeight: 900, letterSpacing: '0.1em' }}>POPULAR</div>
              <h4 style={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '0.15em', color: 'var(--accent-color)', marginBottom: '1.5rem' }}>Professional</h4>
              <div style={{ fontSize: '3.5rem', fontWeight: 800, marginBottom: '2rem' }}>$12<span style={{ fontSize: '1.125rem', color: 'var(--text-secondary)', fontWeight: 500 }}>/user</span></div>
              <ul style={{ listStyle: 'none', padding: 0, textAlign: 'left', marginBottom: '3rem', fontSize: '1rem', color: 'var(--text-secondary)', flexGrow: 1 }}>
                <li style={{ marginBottom: '1rem', display: 'flex', gap: '0.75rem', color: 'var(--text-primary)' }}><CheckCircle size={18} color="var(--accent-color)" /> Unlimited Employees</li>
                <li style={{ marginBottom: '1rem', display: 'flex', gap: '0.75rem', color: 'var(--text-primary)' }}><CheckCircle size={18} color="var(--accent-color)" /> Advanced GMS Cascading</li>
                <li style={{ marginBottom: '1rem', display: 'flex', gap: '0.75rem', color: 'var(--text-primary)' }}><CheckCircle size={18} color="var(--accent-color)" /> Sentiment Analysis</li>
                <li style={{ marginBottom: '1rem', display: 'flex', gap: '0.75rem', color: 'var(--text-primary)' }}><CheckCircle size={18} color="var(--accent-color)" /> CSV/PDF Metrics</li>
              </ul>
              <button className="btn btn-primary btn-full" style={{ padding: '1rem', boxShadow: '0 8px 24px rgba(4, 102, 69, 0.2)' }} onClick={() => onNavigate('AUTH')}>Start Free Trial</button>
            </div>

            {/* Enterprise */}
            <div className="card" style={{ padding: '3rem', border: '1px solid rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column' }}>
              <h4 style={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '0.15em', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Enterprise</h4>
              <div style={{ fontSize: '3.5rem', fontWeight: 800, marginBottom: '2rem' }}>Custom</div>
              <ul style={{ listStyle: 'none', padding: 0, textAlign: 'left', marginBottom: '3rem', fontSize: '1rem', color: 'var(--text-secondary)', flexGrow: 1 }}>
                <li style={{ marginBottom: '1rem', display: 'flex', gap: '0.75rem' }}><CheckCircle size={18} color="var(--accent-color)" /> Dedicated Support</li>
                <li style={{ marginBottom: '1rem', display: 'flex', gap: '0.75rem' }}><CheckCircle size={18} color="var(--accent-color)" /> SSO & SCIM</li>
                <li style={{ marginBottom: '1rem', display: 'flex', gap: '0.75rem' }}><CheckCircle size={18} color="var(--accent-color)" /> Unlimited Workflows</li>
                <li style={{ marginBottom: '1rem', display: 'flex', gap: '0.75rem' }}><CheckCircle size={18} color="var(--accent-color)" /> Pattern Detection Pro</li>
              </ul>
              <button className="btn btn-outline btn-full" style={{ padding: '1rem' }} onClick={() => onNavigate('AUTH')}>Contact Sales</button>
            </div>
          </div>
        </div>
      </section>

      {/* Advanced SaaS Footer */}
      <footer style={{ background: '#021313', color: '#fff', paddingTop: '6rem', paddingBottom: '2.5rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '4rem', marginBottom: '5rem', padding: '0 2rem' }}>
          <div>
            <div className="sidebar-logo" style={{ margin: '0 0 1.5rem 0' }}>
              <Target className="sidebar-logo-icon" size={32} />
              <span style={{ fontSize: '1.5rem', fontWeight: 800 }}>PMS<span style={{ color: 'var(--secondary-color)' }}>.</span></span>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '2rem', maxWidth: '300px' }}>
              The definitive closed-loop framework for ambitious enterprises making confirmation decisions with definitive data.
            </p>
          </div>

          <div>
            <h4 style={{ fontWeight: 700, marginBottom: '1.5rem', color: '#fff' }}>Platform</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem', color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>
              <li style={{ cursor: 'pointer', transition: 'color 0.2s' }} onMouseOver={e => e.target.style.color = '#fff'} onMouseOut={e => e.target.style.color = 'rgba(255,255,255,0.6)'}>Goal Management</li>
              <li style={{ cursor: 'pointer', transition: 'color 0.2s' }} onMouseOver={e => e.target.style.color = '#fff'} onMouseOut={e => e.target.style.color = 'rgba(255,255,255,0.6)'}>Probation Monitor</li>
              <li style={{ cursor: 'pointer', transition: 'color 0.2s' }} onMouseOver={e => e.target.style.color = '#fff'} onMouseOut={e => e.target.style.color = 'rgba(255,255,255,0.6)'}>Performance Cycles</li>
              <li style={{ cursor: 'pointer', transition: 'color 0.2s' }} onMouseOver={e => e.target.style.color = '#fff'} onMouseOut={e => e.target.style.color = 'rgba(255,255,255,0.6)'}>Enterprise Security</li>
            </ul>
          </div>

          <div>
            <h4 style={{ fontWeight: 700, marginBottom: '1.5rem', color: '#fff' }}>Resources</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem', color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>
              <li style={{ cursor: 'pointer', transition: 'color 0.2s' }} onMouseOver={e => e.target.style.color = '#fff'} onMouseOut={e => e.target.style.color = 'rgba(255,255,255,0.6)'}>Help Center</li>
              <li style={{ cursor: 'pointer', transition: 'color 0.2s' }} onMouseOver={e => e.target.style.color = '#fff'} onMouseOut={e => e.target.style.color = 'rgba(255,255,255,0.6)'}>HR Playbook</li>
              <li style={{ cursor: 'pointer', transition: 'color 0.2s' }} onMouseOver={e => e.target.style.color = '#fff'} onMouseOut={e => e.target.style.color = 'rgba(255,255,255,0.6)'}>API Documentation</li>
            </ul>
          </div>

          <div>
            <h4 style={{ fontWeight: 700, marginBottom: '1.5rem', color: '#fff' }}>Company</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem', color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>
              <li style={{ cursor: 'pointer', transition: 'color 0.2s' }} onMouseOver={e => e.target.style.color = '#fff'} onMouseOut={e => e.target.style.color = 'rgba(255,255,255,0.6)'}>About Us</li>
              <li style={{ cursor: 'pointer', transition: 'color 0.2s' }} onMouseOver={e => e.target.style.color = '#fff'} onMouseOut={e => e.target.style.color = 'rgba(255,255,255,0.6)'}>Privacy Policy</li>
              <li style={{ cursor: 'pointer', transition: 'color 0.2s' }} onMouseOver={e => e.target.style.color = '#fff'} onMouseOut={e => e.target.style.color = 'rgba(255,255,255,0.6)'}>Terms of Service</li>
            </ul>
          </div>
        </div>

        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 2rem 0', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem' }}>© 2026 Enterprise Performance Systems. All rights reserved.</p>
          <button className="btn btn-primary" onClick={() => onNavigate('AUTH')} style={{ padding: '0.6rem 2rem', fontSize: '0.9rem', background: 'var(--secondary-color)', color: 'var(--text-primary)' }}>Start Free Trial</button>
        </div>
      </footer>
    </div>
  );
};

// --- Auth Page (Login / Register) ---
const AuthPage = ({ onLogin, onNavigate }) => {
  const { showAlert } = useModal();
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState('Employee');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, register } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLogin) {
      const res = await login(email, password);
      if (res.success) onLogin();
      else showAlert('Login Failed', res.message);
    } else {
      const res = await register({ name, email, password, role });
      if (res.success) onLogin();
      else showAlert('Registration Failed', res.message);
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', minHeight: '100vh', width: '100vw' }}>
      {/* Left Branding Side */}
      <div style={{ flex: 1, background: 'var(--text-primary)', color: '#fff', padding: '4rem', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
        {/* Decorative subtle blob */}
        <div style={{ position: 'absolute', bottom: '-20%', left: '-20%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(49,184,140,0.1) 0%, rgba(0,0,0,0) 70%)' }}></div>

        <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: 'auto' }} onClick={() => onNavigate('LANDING')}>
          <Target size={28} color="var(--accent-color)" />
          <span style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.5px' }}>PMS<span style={{ color: 'var(--secondary-color)' }}>.</span></span>
        </div>

        <div style={{ marginTop: '2rem', zIndex: 1, maxWidth: '500px' }}>
          <h1 style={{ fontSize: '3.1rem', fontWeight: 800, lineHeight: 1.1, marginBottom: '1.25rem', letterSpacing: '-1px' }}>
            Enterprise Performance, <br />All in one place.
          </h1>
          <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, marginBottom: '2.5rem' }}>
            Generate, customize, and execute goal cycles. Track compliance. Link structures together — and review instantly.
          </p>

          <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '32px', height: '32px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Target size={16} color="var(--secondary-color)" /></div>
              <span style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.9)' }}>Automated probation triggers</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '32px', height: '32px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Activity size={16} color="var(--secondary-color)" /></div>
              <span style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.9)' }}>Real-time completion analytics</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '32px', height: '32px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><MessageSquare size={16} color="var(--secondary-color)" /></div>
              <span style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.9)' }}>Goal cascades & cross-evaluations</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '32px', height: '32px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Shield size={16} color="var(--secondary-color)" /></div>
              <span style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.9)' }}>Enterprise system integrity</span>
            </li>
          </ul>
        </div>

        <div style={{ marginTop: 'auto', paddingTop: '3rem', borderTop: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>
          Unified Performance & Goal Platform · Built for scale
        </div>
      </div>

      {/* Right Auth Side */}
      <div style={{ flex: 1, background: '#fdfdfd', display: 'flex', flexDirection: 'column', padding: '1.5rem 2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
          <button style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 600, fontSize: '0.9rem' }} onClick={() => onNavigate('LANDING')}>
            ← Back to Home
          </button>
        </div>

        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: '1.25rem', padding: '2.25rem 2.5rem', width: '100%', maxWidth: '420px', boxShadow: '0 24px 48px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.05)' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.25rem', color: 'var(--text-primary)' }}>
              {isLogin ? 'Welcome back' : 'Create your account'}
            </h2>
            <p className="text-secondary" style={{ fontSize: '0.85rem', marginBottom: '1.75rem' }}>
              {isLogin ? 'Sign in to your PMS workspace' : 'Join your organization and securely track your goals.'}
            </p>

            <form onSubmit={handleSubmit}>
              {!isLogin && (
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label" style={{ marginBottom: '0.1rem', fontSize: '0.8rem' }}>Full name</label>
                  <input type="text" className="form-input" placeholder="Admin" style={{ background: '#fafafa', border: '1px solid rgba(0,0,0,0.08)', padding: '0.6rem 0.8rem' }} value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
              )}

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label" style={{ marginBottom: '0.1rem', fontSize: '0.8rem' }}>Email address</label>
                <input type="email" className="form-input" placeholder="you@company.com" style={{ background: '#fafafa', border: '1px solid rgba(0,0,0,0.08)', padding: '0.6rem 0.8rem' }} value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="form-label" style={{ marginBottom: '0.1rem', fontSize: '0.8rem' }}>Password</label>
                  {isLogin && <span style={{ fontSize: '0.75rem', color: 'var(--secondary-color)', cursor: 'pointer', fontWeight: 600 }}>Forgot password?</span>}
                </div>
                <input type="password" className="form-input" placeholder={isLogin ? "Enter your password" : "Min. 8 characters"} style={{ background: '#fafafa', border: '1px solid rgba(0,0,0,0.08)', padding: '0.6rem 0.8rem' }} value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>

              {!isLogin && (
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label" style={{ marginBottom: '0.1rem', fontSize: '0.8rem' }}>System Role</label>
                  <select className="form-select" style={{ background: '#fafafa', border: '1px solid rgba(0,0,0,0.08)', padding: '0.6rem 0.8rem' }} value={role} onChange={(e) => setRole(e.target.value)}>
                    <option value="Employee">Employee (Submitter)</option>
                    <option value="Manager">Manager (Reviewer)</option>
                    <option value="Admin">HR / Admin (Coordinator)</option>
                  </select>
                </div>
              )}

              <button type="submit" className="btn btn-primary btn-full" style={{ marginTop: '0.75rem', padding: '0.75rem', background: 'var(--text-primary)', color: '#fff', boxShadow: 'none', borderRadius: '0.5rem', fontWeight: 600 }}>
                {isLogin ? 'Sign in' : 'Create account'}
              </button>
            </form>

            <div style={{ marginTop: '1.25rem', fontSize: '0.8rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
              {isLogin ? "Don't have an account? " : "By registering you agree to our Terms of Service and Privacy Policy. Already have an account? "}
              <span
                style={{ color: 'var(--text-primary)', fontWeight: 700, cursor: 'pointer', marginLeft: '0.25rem' }}
                onClick={() => setIsLogin(!isLogin)}
              >
                {isLogin ? 'Create Account' : 'Sign in'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


// --- Main Application ---
const App = () => {
  const { user, logout } = useContext(AuthContext);
  const [currentView, setCurrentView] = useState(user ? 'DASHBOARD' : 'LANDING');
  const [activeTab, setActiveTab] = useState('Dashboard');

  const userRoleRaw = user ? user.role : 'Employee';
  const userRole = (userRoleRaw || 'Employee').charAt(0).toUpperCase() + (userRoleRaw || 'Employee').slice(1).toLowerCase();

  // Only redirect if transitioning from AUTH page after fresh login
  useEffect(() => {
    if (user && currentView === 'AUTH') {
      setCurrentView('DASHBOARD');
    }
  }, [user, currentView]);

  const navItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Goals (GMS)', icon: <Target size={20} /> },
    { name: 'Feedback Forms', icon: <MessageSquare size={20} /> },
    { name: 'Notifications', icon: <Bell size={20} /> },
  ];

  if (userRole === 'Admin') {
    navItems.push({ name: 'System Settings', icon: <Settings size={20} /> });
  }

  const handleLogin = () => {
    setCurrentView('DASHBOARD');
    setActiveTab('Dashboard');
  };

  const handleLogout = () => {
    logout();
    setCurrentView('LANDING');
    setActiveTab('Dashboard');
  };

  const renderDashboardContent = () => {
    const role = userRole;

    if (activeTab === 'Dashboard') {
      if (role === 'Employee') return <EmployeeDashboard />;
      if (role === 'Manager') return <ManagerDashboard />;
      if (role === 'Admin') return <AdminDashboard />;
    }

    if (activeTab === 'Goals (GMS)') {
      return <GoalsGMS userRole={role} />;
    }

    if (activeTab === 'Feedback Forms') {
      return <FeedbackForms userRole={role} />;
    }

    return (
      <div className="animate-fade-in delay-1" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '400px', background: 'var(--surface-color)', borderRadius: '1rem', border: '1px solid var(--border-color)' }}>
        <Settings size={48} className="sidebar-logo-icon" style={{ marginBottom: '1rem', opacity: 0.5 }} />
        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{activeTab} Module</h2>
        <p className="text-secondary text-center max-w-md">This view is currently under construction. Specific features for the {userRole} role will be available here soon.</p>
      </div>
    );
  };

  if (currentView === 'LANDING') {
    return <LandingPage onNavigate={setCurrentView} />;
  }

  if (currentView === 'AUTH') {
    return <AuthPage onLogin={handleLogin} onNavigate={setCurrentView} />;
  }

  return (
    <div className="app-container animate-fade-in">
      <aside className="sidebar">
        <div className="sidebar-logo" style={{ cursor: 'pointer' }} onClick={() => setCurrentView('LANDING')}>
          <Target className="sidebar-logo-icon" size={28} />
          <span>PMS<span style={{ color: 'var(--secondary-color)' }}>.</span></span>
        </div>

        <nav style={{ flex: 1 }}>
          {navItems.map((item) => (
            <div
              key={item.name}
              className={`nav-item ${activeTab === item.name ? 'active' : ''}`}
              onClick={() => setActiveTab(item.name)}
            >
              {item.icon}
              <span>{item.name}</span>
            </div>
          ))}
        </nav>

        <div className="nav-item" style={{ marginBottom: 0, marginTop: 'auto', color: 'var(--danger-color)' }} onClick={handleLogout}>
          <LogOut size={20} />
          <span>Logout</span>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>{activeTab}</h2>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.1rem' }}>/</span>
            <span style={{ color: 'var(--secondary-color)', fontSize: '0.85rem', fontWeight: 600, marginTop: '0.15rem' }}>{userRole} Workspace</span>
          </div>
          <div className="topbar-right">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>View as:</span>
              <select
                className="role-selector"
                value={userRole}
                onChange={() => showAlert('Role Access restricted', 'Your view is tied to your securely authenticated role. You cannot physically change it without logging into a separate account.')}
              >
                <option value="Employee">Employee Profile</option>
                <option value="Manager">Manager Profile</option>
                <option value="Admin">HR/Admin Profile</option>
              </select>
            </div>

            <div className="user-profile">
              <div className="avatar">
                {userRole.charAt(0)}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                  {userRole}
                  {userRole === 'Employee' && <span className="tag tag-success" style={{ fontSize: '0.6rem', padding: '0.1rem 0.3rem', marginLeft: '0.5rem' }}>Mid-Cycle Joiner</span>}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Active Setup</span>
              </div>
            </div>
          </div>
        </header>

        <div className="page-content">
          <div className="page-header animate-fade-in" style={{ marginBottom: '0.5rem' }}>
            <p className="page-subtitle" style={{ marginTop: 0 }}>
              {activeTab === 'Dashboard'
                ? `Welcome back, here is your ${userRole.toLowerCase()} overview.`
                : `Manage your ${activeTab.toLowerCase()} here.`}
            </p>
          </div>

          {renderDashboardContent()}
        </div>
      </main>
    </div>
  );
};

export default App;
