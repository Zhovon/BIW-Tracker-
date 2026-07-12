import React, { useState } from 'react';
import { Task } from '../types';

interface TaskBoardProps {
  tasks: Task[];
  currentUser: string;
  onAddTask: (task: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  onUpdateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  onDeleteTask: (id: string) => Promise<void>;
}

export const TaskBoard: React.FC<TaskBoardProps> = ({
  tasks,
  currentUser,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
}) => {
  // Modal visibility
  const [isOpen, setIsOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignee, setAssignee] = useState('Shahadat');
  const [status, setStatus] = useState<Task['status']>('pending');
  const [priority, setPriority] = useState<Task['priority']>('medium');
  const [category, setCategory] = useState('Operations');
  const [dueTime, setDueTime] = useState('');

  // Filters
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setAssignee('Shahadat');
    setStatus('pending');
    setPriority('medium');
    setCategory('Operations');
    setDueTime('');
    setEditingTask(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsOpen(true);
  };

  const handleOpenEdit = (task: Task) => {
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description || '');
    setAssignee(task.assignee);
    setStatus(task.status);
    setPriority(task.priority);
    setCategory(task.category);
    setDueTime(task.due_time ? task.due_time.substring(0, 16) : '');
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const taskData = {
      title,
      description: description || null,
      assignee,
      status,
      priority,
      category,
      due_time: dueTime ? new Date(dueTime).toISOString() : null,
    };

    if (editingTask) {
      await onUpdateTask(editingTask.id, taskData);
    } else {
      await onAddTask(taskData);
    }
    setIsOpen(false);
    resetForm();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      await onDeleteTask(id);
      setIsOpen(false);
      resetForm();
    }
  };

  const moveTask = async (task: Task, direction: 'left' | 'right') => {
    const statuses: Task['status'][] = ['pending', 'in_progress', 'under_review', 'completed'];
    const currentIndex = statuses.indexOf(task.status);
    let newIndex = currentIndex;
    
    if (direction === 'left' && currentIndex > 0) {
      newIndex--;
    } else if (direction === 'right' && currentIndex < statuses.length - 1) {
      newIndex++;
    }

    if (newIndex !== currentIndex) {
      await onUpdateTask(task.id, { status: statuses[newIndex] });
    }
  };

  // Filter & Search logic
  const filteredTasks = tasks.filter((t) => {
    const matchesCategory = filterCategory === 'all' || t.category === filterCategory;
    const matchesPriority = filterPriority === 'all' || t.priority === filterPriority;
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      t.assignee.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesPriority && matchesSearch;
  });

  const uniqueCategories = Array.from(new Set(tasks.map((t) => t.category))).filter(Boolean);

  const renderColumn = (colStatus: Task['status'], name: string, dotColor: string) => {
    const colTasks = filteredTasks.filter((t) => t.status === colStatus);

    return (
      <div className="kanban-column" key={colStatus}>
        <div className="column-header">
          <div className="column-title-wrapper">
            <span className="column-dot" style={{ backgroundColor: dotColor } as React.CSSProperties} />
            <span className="column-name">{name}</span>
          </div>
          <span className="task-count">{colTasks.length}</span>
        </div>

        <div className="column-tasks">
          {colTasks.length === 0 ? (
            <div style={{ padding: '24px 8px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              No tasks in this column
            </div>
          ) : (
            colTasks.map((task) => (
              <div key={task.id} className="task-card" onClick={() => handleOpenEdit(task)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <span className="card-category">{task.category}</span>
                  <div className="card-badges">
                    <span className={`badge priority-badge ${task.priority}`}>{task.priority}</span>
                  </div>
                </div>

                <div className="card-title-text">{task.title}</div>
                {task.description && <p className="card-desc">{task.description}</p>}

                <div className="card-meta">
                  <div className="card-assignee">
                    <div className="assignee-avatar">{task.assignee.charAt(0)}</div>
                    <span>{task.assignee}</span>
                  </div>
                  {task.due_time && (
                    <span className="badge time-badge">
                      {new Date(task.due_time).toLocaleDateString([], { month: 'short', day: 'numeric' })} at{' '}
                      {new Date(task.due_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                    </span>
                  )}
                </div>

                {/* Move status selectors */}
                <div className="card-actions" onClick={(e) => e.stopPropagation()}>
                  {colStatus !== 'pending' && (
                    <button className="action-icon-btn" onClick={() => moveTask(task, 'left')} title="Move Left">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="15 18 9 12 15 6" />
                      </svg>
                    </button>
                  )}
                  {colStatus !== 'completed' && (
                    <button className="action-icon-btn" onClick={() => moveTask(task, 'right')} title="Move Right">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* Search and Filter Panel */}
      <div className="logs-filters" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', flex: 1 }}>
          <input
            type="text"
            placeholder="Search tasks, descriptions, or assignees..."
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <select
            className="custom-select"
            style={{ width: '160px' }}
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="all">All Categories</option>
            {uniqueCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <select
            className="custom-select"
            style={{ width: '160px' }}
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
          >
            <option value="all">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>
        
        {currentUser !== 'Manager' && (
          <button className="btn-primary" onClick={handleOpenAdd}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Task
          </button>
        )}
      </div>

      {/* Kanban Grid */}
      <div className="kanban-wrapper">
      <div className="kanban-grid">
        {renderColumn('pending', 'To Do', '#d4af37')}
        {renderColumn('in_progress', 'In Progress', '#4682b4')}
        {renderColumn('under_review', 'Under Review', '#ba55d3')}
        {renderColumn('completed', 'Completed', '#2e8b57')}
      </div>
      </div>

      {/* Modal Dialog Form */}
      {isOpen && (
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
          onClick={() => setIsOpen(false)}
        >
          <div
            className="panel-card"
            style={{
              width: '90%',
              maxWidth: '550px',
              boxShadow: 'var(--shadow-lg)',
              padding: '24px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                {editingTask ? 'Edit Task' : 'Create New Back-Office Task'}
              </h3>
              <button className="modal-close-btn" onClick={() => setIsOpen(false)}>
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group full-width">
                  <label htmlFor="task-title">Task Title</label>
                  <input
                    id="task-title"
                    type="text"
                    required
                    disabled={currentUser === 'Manager'}
                    className="form-input"
                    placeholder="Enter short descriptive task title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div className="form-group full-width">
                  <label htmlFor="task-description">Description</label>
                  <textarea
                    id="task-description"
                    rows={3}
                    disabled={currentUser === 'Manager'}
                    className="form-input"
                    style={{ resize: 'vertical' }}
                    placeholder="Provide detailed instructions or updates"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="task-assignee">Assignee</label>
                  <select
                    id="task-assignee"
                    disabled={currentUser === 'Manager'}
                    className="custom-select"
                    value={assignee}
                    onChange={(e) => setAssignee(e.target.value)}
                  >
                    <option value="Shahadat">Shahadat</option>
                    <option value="Ratul">Ratul</option>
                    <option value="Shifat">Shifat</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="task-category">Category</label>
                  <input
                    id="task-category"
                    type="text"
                    disabled={currentUser === 'Manager'}
                    className="form-input"
                    placeholder="Operations, Logistics, Support..."
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="task-status">Status</label>
                  <select
                    id="task-status"
                    className="custom-select"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as Task['status'])}
                  >
                    <option value="pending">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="under_review">Under Review</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="task-priority">Priority</label>
                  <select
                    id="task-priority"
                    disabled={currentUser === 'Manager'}
                    className="custom-select"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as Task['priority'])}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div className="form-group full-width">
                  <label htmlFor="task-due-time">Scheduled Date & Time</label>
                  <input
                    id="task-due-time"
                    type="datetime-local"
                    className="form-input"
                    value={dueTime}
                    onChange={(e) => setDueTime(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-actions">
                {editingTask && currentUser !== 'Manager' && (
                  <button
                    type="button"
                    className="btn-danger"
                    style={{ marginRight: 'auto' }}
                    onClick={() => handleDelete(editingTask.id)}
                  >
                    Delete Task
                  </button>
                )}
                <button type="button" className="btn-secondary" onClick={() => setIsOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingTask ? 'Save Changes' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
