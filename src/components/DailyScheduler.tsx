import React, { useState } from 'react';
import { Task } from '../types';

interface DailySchedulerProps {
  tasks: Task[];
  onAddTask: (task: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  onUpdateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  currentUser: string;
}

export const DailyScheduler: React.FC<DailySchedulerProps> = ({
  tasks,
  onAddTask,
  onUpdateTask,
  currentUser,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [quickAddHour, setQuickAddHour] = useState(8);
  const [quickTitle, setQuickTitle] = useState('');
  const [quickAssignee, setQuickAssignee] = useState('Shahadat');
  const [quickCategory, setQuickCategory] = useState('Operations');

  // Change date helper
  const adjustDate = (days: number) => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + days);
    setSelectedDate(current.toISOString().split('T')[0]);
  };

  const setToday = () => {
    setSelectedDate(new Date().toISOString().split('T')[0]);
  };

  // Hours array from 08:00 to 20:00 (8 AM to 8 PM)
  const hours = Array.from({ length: 13 }, (_, i) => i + 8);

  // Filter tasks that belong to the selected date and have a due time
  const scheduledTasks = tasks.filter((task) => {
    if (!task.due_time) return false;
    const taskDate = new Date(task.due_time).toISOString().split('T')[0];
    return taskDate === selectedDate;
  });

  // Helper to map tasks to a specific hour block
  const getTasksForHour = (hour: number) => {
    return scheduledTasks.filter((task) => {
      if (!task.due_time) return false;
      const taskHour = new Date(task.due_time).getHours();
      return taskHour === hour;
    });
  };

  const handleOpenQuickAdd = (hour: number) => {
    setQuickAddHour(hour);
    setQuickTitle('');
    setQuickAssignee('Shahadat');
    setQuickCategory('Operations');
    setIsQuickAddOpen(true);
  };

  const handleQuickAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;

    // Create datetime
    const dueDateTime = new Date(selectedDate);
    dueDateTime.setHours(quickAddHour);
    dueDateTime.setMinutes(0);
    dueDateTime.setSeconds(0);

    const newTask = {
      title: quickTitle,
      description: `Quick-added from schedule slot: ${quickAddHour}:00`,
      assignee: quickAssignee,
      status: 'pending' as const,
      priority: 'medium' as const,
      category: quickCategory,
      due_time: dueDateTime.toISOString(),
    };

    await onAddTask(newTask);
    setIsQuickAddOpen(false);
  };

  // Convert 24h format to 12h for labels
  const formatHourLabel = (hour: number) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 === 0 ? 12 : hour % 12;
    return `${displayHour.toString().padStart(2, '0')}:00 ${period}`;
  };

  return (
    <div>
      {/* Date controls header */}
      <div className="scheduler-controls">
        <div className="date-navigator">
          <button className="scheduler-btn" onClick={() => adjustDate(-1)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Prev Day
          </button>
          <button className="scheduler-btn" onClick={setToday}>
            Today
          </button>
          <button className="scheduler-btn" onClick={() => adjustDate(1)}>
            Next Day
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span className="current-date-title">
            {new Date(selectedDate).toLocaleDateString([], {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </span>
          <input
            type="date"
            className="search-input"
            style={{ width: '160px', padding: '8px 12px' }}
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>
      </div>

      {/* Hourly timeline view */}
      <div className="scheduler-timeline">
        <div className="timeline-header">
          <div style={{ textAlign: 'right', paddingRight: '16px' }}>Hour</div>
          <div>Scheduled Back-Office Tasks & Timings</div>
        </div>

        {hours.map((hour) => {
          const hourTasks = getTasksForHour(hour);
          return (
            <div className="hour-row" key={hour}>
              <div className="hour-label">{formatHourLabel(hour)}</div>
              <div className="hour-content">
                {hourTasks.length === 0 ? (
                  currentUser === 'Shahadat' ? (
                    <button
                      className="btn-secondary"
                      style={{
                        padding: '4px 10px',
                        fontSize: '0.75rem',
                        opacity: 0.3,
                        border: '1px dashed var(--color-border)',
                        borderRadius: '4px',
                      }}
                      onClick={() => handleOpenQuickAdd(hour)}
                    >
                      + Schedule Task
                    </button>
                  ) : (
                    <div className="hour-empty-slot"></div>
                  )
                ) : (
                  hourTasks.map((task) => (
                    <div
                      key={task.id}
                      className="scheduled-task-block"
                      title={`Double-click to move to Completed`}
                      onDoubleClick={async () => {
                        if (task.status !== 'completed') {
                          await onUpdateTask(task.id, { status: 'completed' });
                        }
                      }}
                    >
                      <div className="scheduled-task-title">{task.title}</div>
                      <div className="scheduled-task-meta">
                        <span>{task.category} • Assignee: {task.assignee}</span>
                        <span
                          style={{
                            fontWeight: 700,
                            color:
                              task.status === 'completed'
                                ? 'var(--color-completed-text)'
                                : task.status === 'under_review'
                                ? 'var(--color-review-text)'
                                : task.status === 'in_progress'
                                ? 'var(--color-progress-text)'
                                : 'var(--color-pending-text)',
                          }}
                        >
                          {task.status.toUpperCase().replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Add Modal */}
      {isQuickAddOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(3px)',
            zIndex: 99,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onClick={() => setIsQuickAddOpen(false)}
        >
          <div
            className="panel-card"
            style={{
              width: '90%',
              maxWidth: '450px',
              boxShadow: 'var(--shadow-lg)',
              padding: '24px',
              backgroundColor: 'var(--bg-card)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                Quick Schedule Task at {formatHourLabel(quickAddHour)}
              </h3>
              <button className="modal-close-btn" onClick={() => setIsQuickAddOpen(false)}>
                &times;
              </button>
            </div>

            <form onSubmit={handleQuickAddSubmit}>
              <div className="form-grid" style={{ gridTemplateColumns: '1fr' }}>
                <div className="form-group">
                  <label htmlFor="quick-title">Task Title</label>
                  <input
                    id="quick-title"
                    type="text"
                    required
                    className="form-input"
                    placeholder="E.g. Clear customs document folder"
                    value={quickTitle}
                    onChange={(e) => setQuickTitle(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="quick-assignee">Assignee</label>
                  <select
                    id="quick-assignee"
                    className="custom-select"
                    value={quickAssignee}
                    onChange={(e) => setQuickAssignee(e.target.value)}
                  >
                    <option value="Shahadat">Shahadat</option>
                    <option value="Ratul">Ratul</option>
                    <option value="Shifat">Shifat</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="quick-category">Category</label>
                  <input
                    id="quick-category"
                    type="text"
                    className="form-input"
                    placeholder="Logistics, Accounting, Customer Support..."
                    value={quickCategory}
                    onChange={(e) => setQuickCategory(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-actions" style={{ marginTop: '20px' }}>
                <button type="button" className="btn-secondary" onClick={() => setIsQuickAddOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Schedule Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
