import React, { useState } from 'react';
import { ActivityLog } from '../types';

interface AuditLogsProps {
  logs: ActivityLog[];
}

export const AuditLogs: React.FC<AuditLogsProps> = ({ logs }) => {
  const [userFilter, setUserFilter] = useState('all');
  const [actionFilter, setActionFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Sort logs: newest first
  const sortedLogs = [...logs].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  // Filter logs
  const filteredLogs = sortedLogs.filter((log) => {
    const matchesUser = userFilter === 'all' || log.user_name === userFilter;
    const matchesAction = actionFilter === 'all' || log.action === actionFilter;
    const matchesSearch = log.details.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesUser && matchesAction && matchesSearch;
  });

  // Export reports helper (Markdown or CSV)
  const exportToCSV = () => {
    if (filteredLogs.length === 0) return;
    
    const headers = ['Timestamp', 'Operator', 'Action', 'Details'];
    const rows = filteredLogs.map((log) => [
      new Date(log.created_at).toLocaleString(),
      log.user_name,
      log.action,
      log.details.replace(/"/g, '""'), // escape quotes
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => `"${r.join('","')}"`)].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `jurnal_audit_report_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToMarkdown = () => {
    if (filteredLogs.length === 0) return;

    let markdown = `# Jurnal Audit Log Report\n`;
    markdown += `Generated on: ${new Date().toLocaleString()}\n\n`;
    markdown += `| Timestamp | Operator | Action | Details |\n`;
    markdown += `|---|---|---|---|\n`;

    filteredLogs.forEach((log) => {
      markdown += `| ${new Date(log.created_at).toLocaleString()} | **${log.user_name}** | \`${log.action}\` | ${log.details} |\n`;
    });

    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      `jurnal_audit_report_${new Date().toISOString().split('T')[0]}.md`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      {/* Logs Filters */}
      <div className="logs-filters" style={{ alignItems: 'center', justifyContent: 'space-between', display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
        <input
          type="text"
          placeholder="Search details..."
          className="search-input"
          style={{ minWidth: '200px', flex: '1 1 200px', margin: 0 }}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <select
          className="custom-select"
          style={{ width: '150px', flex: '0 0 auto', margin: 0 }}
          value={userFilter}
          onChange={(e) => setUserFilter(e.target.value)}
        >
          <option value="all">All Operators</option>
          <option value="Shahadat">Shahadat</option>
          <option value="Ratul">Ratul</option>
          <option value="Shifat">Shifat</option>
          <option value="Manager">Manager</option>
        </select>

        <select
          className="custom-select"
          style={{ width: '150px', flex: '0 0 auto', margin: 0 }}
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
        >
          <option value="all">All Actions</option>
          <option value="create">Create</option>
          <option value="update_status">Status Change</option>
          <option value="update_time">Rescheduled</option>
          <option value="delete">Deletion</option>
        </select>

        <div style={{ display: 'flex', gap: '10px', marginLeft: 'auto', flexWrap: 'wrap' }}>
          <button className="btn-secondary" onClick={exportToMarkdown}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '6px' }}>
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export Markdown
          </button>
          <button className="btn-primary" onClick={exportToCSV}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '6px' }}>
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export CSV
          </button>
        </div>
      </div>

      {/* Logs Table */}
      <div className="logs-table-container">
        {filteredLogs.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No logs matched your current filters.
          </div>
        ) : (
          <table className="logs-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Operator</th>
                <th>Action</th>
                <th>Audit Details</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr key={log.id}>
                  <td style={{ whiteSpace: 'nowrap', color: 'var(--text-muted)' }}>
                    {new Date(log.created_at).toLocaleString([], {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                      hour12: false,
                    })}
                  </td>
                  <td style={{ fontWeight: 600, color: 'var(--color-gold)' }}>{log.user_name}</td>
                  <td>
                    <span className={`log-action-badge ${log.action}`}>
                      {log.action.replace('_', ' ')}
                    </span>
                  </td>
                  <td style={{ width: '60%' }}>{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
