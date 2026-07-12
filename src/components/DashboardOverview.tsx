import React, { useState } from 'react';
import { Task, ActivityLog } from '../types';

interface DashboardOverviewProps {
  tasks: Task[];
  logs: ActivityLog[];
  onSwitchTab: (tab: string) => void;
  currentUser: string;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  tasks,
  logs,
  onSwitchTab,
  currentUser,
}) => {
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [assigneeFilter, setAssigneeFilter] = useState<string>('All');

  // Filter tasks based on assignee filter (Owner can see all, others see their own unless they are dispatcher/Shahadat)
  const isManager = currentUser === 'Manager';
  const isDispatcher = currentUser === 'Shahadat';

  const visibleTasks = tasks.filter((t) => {
    if (assigneeFilter !== 'All') return t.assignee === assigneeFilter;
    if (isManager || isDispatcher) return true;
    return t.assignee === currentUser; // Fallback, though actually they can see all in this app anyway
  });

  const visibleLogs = logs.filter((l) => {
    if (assigneeFilter !== 'All') return l.user_name === assigneeFilter;
    return true;
  });

  // Compute metrics
  const totalTasks = visibleTasks.length;
  const pendingTasks = visibleTasks.filter((t) => t.status === 'pending').length;
  const inProgressTasks = visibleTasks.filter((t) => t.status === 'in_progress').length;
  const underReviewTasks = visibleTasks.filter((t) => t.status === 'under_review').length;
  const completedTasks = visibleTasks.filter((t) => t.status === 'completed').length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Compute category breakdown
  const categoryCounts: Record<string, number> = {};
  visibleTasks.forEach((t) => {
    const cat = t.category || 'General';
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });

  const categories = Object.keys(categoryCounts).sort((a, b) => categoryCounts[b] - categoryCounts[a]);
  const maxCategoryCount = Math.max(...Object.values(categoryCounts), 1);

  // Compute recent logs (last 5 or all for manager)
  const recentLogs = [...visibleLogs]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  
  const displayLogs = isManager ? recentLogs : recentLogs.slice(0, 5);

  const handleStatClick = (status: string | null) => {
    setStatusFilter(prev => prev === status ? null : status);
  };

  // Timeline grouping
  const timelineTasks = statusFilter 
    ? visibleTasks.filter(t => t.status === statusFilter)
    : visibleTasks;

  const groupedTasks = timelineTasks.reduce((acc, task) => {
    const dateObj = new Date(task.due_time || task.created_at);
    const dateStr = dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const dayStr = dateObj.toLocaleDateString('en-GB', { weekday: 'long' });
    const key = `${dateStr} (${dayStr})`;
    
    if (!acc[key]) acc[key] = { dateStr, dayStr, tasks: [] };
    acc[key].tasks.push(task);
    return acc;
  }, {} as Record<string, { dateStr: string; dayStr: string; tasks: Task[] }>);

  // Sort dates descending
  const sortedDateKeys = Object.keys(groupedTasks).sort((a, b) => {
    const dateA = new Date(groupedTasks[a].tasks[0].due_time || groupedTasks[a].tasks[0].created_at);
    const dateB = new Date(groupedTasks[b].tasks[0].due_time || groupedTasks[b].tasks[0].created_at);
    return dateB.getTime() - dateA.getTime();
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>System Overview</h2>
        {isManager && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Filter by Executive:</span>
            <select 
              className="custom-select" 
              style={{ width: 'auto', minWidth: '150px' }}
              value={assigneeFilter}
              onChange={(e) => setAssigneeFilter(e.target.value)}
            >
              <option value="All">All Staff</option>
              <option value="Shahadat">Shahadat</option>
              <option value="Ratul">Ratul</option>
              <option value="Shifat">Shifat</option>
            </select>
          </div>
        )}
      </div>

      {/* Metrics Row - Clickable Shifat Style */}
      <div className="metrics-grid">
        <div 
          className={`metric-card ${statusFilter === null || statusFilter === 'all' ? 'active-stat' : ''}`}
          style={{ '--accent-color': '#d4af37', cursor: 'pointer' } as React.CSSProperties}
          onClick={() => handleStatClick(null)}
        >
          <div className="metric-label">Total Tasks</div>
          <div className="metric-value">{totalTasks}</div>
          <div className="metric-footer">Across {assigneeFilter === 'All' ? 'all staff members' : assigneeFilter}</div>
        </div>
        <div 
          className={`metric-card ${statusFilter === 'in_progress' ? 'active-stat' : ''}`}
          style={{ '--accent-color': '#3a86ff', cursor: 'pointer' } as React.CSSProperties}
          onClick={() => handleStatClick('in_progress')}
        >
          <div className="metric-label">In Progress</div>
          <div className="metric-value">{inProgressTasks}</div>
          <div className="metric-footer">Currently active tasks</div>
        </div>
        <div 
          className={`metric-card ${statusFilter === 'under_review' ? 'active-stat' : ''}`}
          style={{ '--accent-color': '#e85d04', cursor: 'pointer' } as React.CSSProperties}
          onClick={() => handleStatClick('under_review')}
        >
          <div className="metric-label">Under Review</div>
          <div className="metric-value">{underReviewTasks}</div>
          <div className="metric-footer">Waiting for inspection</div>
        </div>
        <div 
          className={`metric-card ${statusFilter === 'completed' ? 'active-stat' : ''}`}
          style={{ '--accent-color': '#2e8b57', cursor: 'pointer' } as React.CSSProperties}
          onClick={() => handleStatClick('completed')}
        >
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

          <div className="ops-breakdown-grid">
            {/* Completion rate donut chart (SVG) */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="180" height="180" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="var(--bg-input)" strokeWidth="3" />
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
                <text x="18" y="16.5" dominantBaseline="middle" textAnchor="middle" fill="var(--text-primary)" fontSize="6.5" fontWeight="800" fontFamily="var(--font-title)">
                  {completionRate}%
                </text>
                <text x="18" y="22.5" dominantBaseline="middle" textAnchor="middle" fill="var(--text-secondary)" fontSize="2.5" fontWeight="600" fontFamily="var(--font-body)" letterSpacing="0.05em" style={{ textTransform: 'uppercase' }}>
                  Done
                </text>
              </svg>
            </div>

            {/* Category Bars (Shifat Style Breakdown) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Categories Output:</h4>
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
                            transition: 'width 0.4s ease'
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
              {isManager ? 'Full Audit Logs' : 'Recent Tracking'}
            </h3>
            {!isManager && (
              <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => onSwitchTab('logs')}>
                See All Logs
              </button>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1, overflowY: 'auto', maxHeight: isManager ? '400px' : '300px' }}>
            {displayLogs.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, color: 'var(--text-muted)', padding: '20px 0' }}>
                <p style={{ fontSize: '0.9rem' }}>No recent activity.</p>
                <p style={{ fontSize: '0.75rem' }}>Actions are logged as team members work.</p>
              </div>
            ) : (
              displayLogs.map((log) => (
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
                      {new Date(log.created_at).toLocaleDateString()} {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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

      {/* Shifat Style Timeline */}
      <div className="panel-card" style={{ padding: '24px' }}>
        <div style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '12px', marginBottom: '24px' }}>
          <h3 className="card-title" style={{ fontSize: '1.2rem', margin: 0 }}>The Run (Timeline)</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            {statusFilter ? `${timelineTasks.length} ${statusFilter.replace('_', ' ')} tasks` : `${timelineTasks.length} total tasks`}
            {assigneeFilter !== 'All' ? ` for ${assigneeFilter}` : ''}
          </p>
        </div>

        <div className="timeline-container">
          {sortedDateKeys.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>No tasks found for this view.</div>
          ) : (
            sortedDateKeys.map(key => {
              const { dateStr, dayStr, tasks: dayTasks } = groupedTasks[key];
              return (
                <div key={key} className="timeline-day">
                  <div className="timeline-date-col">
                    <div className="timeline-date">{dateStr}</div>
                    <div className="timeline-weekday">{dayStr}</div>
                  </div>
                  <div className="timeline-tasks-col">
                    {dayTasks.map(t => (
                      <div key={t.id} className="timeline-item">
                        <div className="timeline-item-content">
                          <div className="timeline-title">{t.title}</div>
                          <div className="timeline-meta">
                            <span className="timeline-cat">{t.category}</span>
                            <span className="timeline-assignee">{t.assignee}</span>
                          </div>
                        </div>
                        <div className={`status-badge status-${t.status}`}>
                          {t.status.replace('_', ' ')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

    </div>
  );
};
