import React from 'react';
import { Task, ActivityLog } from '../types';

interface DashboardOverviewProps {
  tasks: Task[];
  logs: ActivityLog[];
  onSwitchTab: (tab: string) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  tasks,
  logs,
  onSwitchTab,
}) => {
  // Compute metrics
  const totalTasks = tasks.length;
  const pendingTasks = tasks.filter((t) => t.status === 'pending').length;
  const inProgressTasks = tasks.filter((t) => t.status === 'in_progress').length;
  const underReviewTasks = tasks.filter((t) => t.status === 'under_review').length;
  const completedTasks = tasks.filter((t) => t.status === 'completed').length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Compute category breakdown
  const categoryCounts: Record<string, number> = {};
  tasks.forEach((t) => {
    const cat = t.category || 'General';
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });

  const categories = Object.keys(categoryCounts);
  const maxCategoryCount = Math.max(...Object.values(categoryCounts), 1);

  // Compute recent logs (last 5)
  const recentLogs = [...logs]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  return (
    <div>
      {/* Metrics Row */}
      <div className="metrics-grid">
        <div className="metric-card" style={{ '--accent-color': '#d4af37' } as React.CSSProperties}>
          <div className="metric-label">Total Tasks</div>
          <div className="metric-value">{totalTasks}</div>
          <div className="metric-footer">Across all staff members</div>
        </div>
        <div className="metric-card" style={{ '--accent-color': '#4682b4' } as React.CSSProperties}>
          <div className="metric-label">In Progress</div>
          <div className="metric-value">{inProgressTasks}</div>
          <div className="metric-footer">Actively being worked on</div>
        </div>
        <div className="metric-card" style={{ '--accent-color': '#ba55d3' } as React.CSSProperties}>
          <div className="metric-label">Under Review</div>
          <div className="metric-value">{underReviewTasks}</div>
          <div className="metric-footer">Waiting for inspection</div>
        </div>
        <div className="metric-card" style={{ '--accent-color': '#2e8b57' } as React.CSSProperties}>
          <div className="metric-label">Completed</div>
          <div className="metric-value">{completedTasks}</div>
          <div className="metric-footer">{completionRate}% total completion rate</div>
        </div>
      </div>

      {/* Analytics Grid */}
      <div className="dashboard-grid">
        {/* Left Side: SVGs and Breakdown */}
        <div className="panel-card">
          <div className="card-header-box">
            <h3 className="card-title">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="20" x2="18" y2="10" />
                <line x1="12" y1="20" x2="12" y2="4" />
                <line x1="6" y1="20" x2="6" y2="14" />
              </svg>
              Operations Breakdown
            </h3>
            <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => onSwitchTab('tasks')}>
              Manage Tasks
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', alignItems: 'center', height: '100%' }}>
            {/* Completion rate donut chart (SVG) */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="180" height="180" viewBox="0 0 36 36">
                {/* Background circle */}
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="var(--bg-input)" strokeWidth="3" />
                {/* Progress circle */}
                <circle
                  cx="18"
                  cy="18"
                  r="15.915"
                  fill="none"
                  stroke="var(--color-gold)"
                  strokeWidth="3.2"
                  strokeDasharray={`${completionRate} ${100 - completionRate}`}
                  strokeDashoffset="0"
                  transform="rotate(-90 18 18)"
                  style={{ transition: 'stroke-dasharray 0.5s ease' }}
                />
                {/* Centered text in SVG */}
                <text
                  x="18"
                  y="16.5"
                  dominantBaseline="middle"
                  textAnchor="middle"
                  fill="var(--text-primary)"
                  fontSize="6.5"
                  fontWeight="800"
                  fontFamily="var(--font-title)"
                >
                  {completionRate}%
                </text>
                <text
                  x="18"
                  y="22.5"
                  dominantBaseline="middle"
                  textAnchor="middle"
                  fill="var(--text-secondary)"
                  fontSize="2.5"
                  fontWeight="600"
                  fontFamily="var(--font-body)"
                  letterSpacing="0.05em"
                  style={{ textTransform: 'uppercase' }}
                >
                  Done
                </text>
              </svg>
            </div>

            {/* Category Bars */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Categories:</h4>
              {categories.length === 0 ? (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No tasks categorized yet.</p>
              ) : (
                categories.map((cat) => {
                  const count = categoryCounts[cat];
                  const pct = Math.round((count / maxCategoryCount) * 100);
                  return (
                    <div key={cat} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                        <span style={{ fontWeight: 500 }}>{cat}</span>
                        <span style={{ color: 'var(--color-gold)' }}>{count} tasks</span>
                      </div>
                      <div style={{ height: '6px', background: 'var(--bg-input)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div
                          style={{
                            height: '100%',
                            width: `${pct}%`,
                            background: 'linear-gradient(90deg, var(--color-gold-dark), var(--color-gold))',
                            borderRadius: '3px',
                          }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Owner tracker (Recent activity log) */}
        <div className="panel-card">
          <div className="card-header-box" style={{ flexWrap: 'wrap', gap: '8px' }}>
            <h3 className="card-title" style={{ whiteSpace: 'nowrap', fontSize: '1.1rem' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              Owner Tracking (Live)
            </h3>
            <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => onSwitchTab('logs')}>
              See All Logs
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1, overflowY: 'auto' }}>
            {recentLogs.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, color: 'var(--text-muted)', padding: '20px 0' }}>
                <p style={{ fontSize: '0.9rem' }}>No recent activity.</p>
                <p style={{ fontSize: '0.75rem' }}>Actions are logged as team members work.</p>
              </div>
            ) : (
              recentLogs.map((log) => (
                <div
                  key={log.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    paddingBottom: '12px',
                    borderBottom: '1px solid var(--color-border)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--color-gold)' }}>{log.user_name}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-primary)' }}>{log.details}</p>
                  <div>
                    <span className={`log-action-badge ${log.action}`}>{log.action.replace('_', ' ')}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="panel-card" style={{ padding: '20px' }}>
        <h4 style={{ fontSize: '1rem', color: 'var(--color-gold)', marginBottom: '8px' }}>Active Back-Office Team Roles</h4>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
          This system is active for <strong>3 dedicated office operators</strong> (Shahadat, Ratul, Shifat) who assign, schedule, and complete items, and <strong>1 manager/owner</strong> who tracks timeline metrics. Switch roles via the left-hand role selector to simulate actions.
        </p>
      </div>
    </div>
  );
};
