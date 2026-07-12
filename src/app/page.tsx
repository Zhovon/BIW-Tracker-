'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { Task, ActivityLog } from '../types';
import { DashboardOverview } from '../components/DashboardOverview';
import { TaskBoard } from '../components/TaskBoard';
import { DailyScheduler } from '../components/DailyScheduler';
import { AuditLogs } from '../components/AuditLogs';

// Helper to check if credentials are still default placeholders
const isSandboxMode = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return !url || url.includes('your-project-id') || !key || key.includes('your-supabase-anon-key');
};

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [currentUser, setCurrentUser] = useState<string>('Shahadat');
  const [theme, setTheme] = useState<'dark-gold' | 'warm-light'>('warm-light');
  const [isSandbox, setIsSandbox] = useState<boolean>(true);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Synchronize document theme attribute
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme === 'warm-light' ? 'warm-light' : 'dark-gold');
  }, [theme]);

  // Initial load and subscription setup
  useEffect(() => {
    const sandbox = isSandboxMode();
    setIsSandbox(sandbox);

    if (sandbox) {
      // Load sandbox mock data from localStorage or create defaults
      const localTasks = localStorage.getItem('jurnal_sandbox_tasks');
      const localLogs = localStorage.getItem('jurnal_sandbox_logs');

      if (localTasks) {
        setTasks(JSON.parse(localTasks));
      } else {
        const defaultTasks: Task[] = [
          {
            id: '1',
            title: 'Task Brief: BIW Cover Photos for Social Media',
            description: 'Nanobanana AI + Pinterest reference. AI subscription for video promised.',
            assignee: 'Shifat',
            status: 'pending',
            priority: 'high',
            category: 'Instruction / Brief',
            due_time: new Date(new Date().setHours(10, 0, 0, 0)).toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: '2',
            title: 'BIW v2 Facebook Cover - Gent\'s Zone',
            description: 'Sent via Canva link for review. Bashundhara 3rd Floor.',
            assignee: 'Shifat',
            status: 'completed',
            priority: 'medium',
            category: 'Facebook Cover Design',
            due_time: new Date(new Date().setHours(14, 0, 0, 0)).toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: '3',
            title: 'Skin Barrier Carousel',
            description: '6-Habit Carousel. Voice feedback received.',
            assignee: 'Shifat',
            status: 'in_progress',
            priority: 'high',
            category: 'Educational Carousel',
            due_time: new Date(new Date().setHours(9, 0, 0, 0)).toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: '4',
            title: 'Customer Testimonial Cards - Mh Tanvir & Faiza',
            description: 'Query raised on modifying negative/short reviews',
            assignee: 'Shifat',
            status: 'pending',
            priority: 'low',
            category: 'Testimonial / Review Post',
            due_time: new Date(new Date().setHours(16, 0, 0, 0)).toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: 's5',
            title: 'Tania "Radiant Glow" myth-truth slide',
            description: 'Female Slot 1',
            assignee: 'Shahadat',
            status: 'completed',
            priority: 'medium',
            category: 'Social Media',
            due_time: new Date('2026-06-26T10:00:00Z').toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: 's6',
            title: 'Rafiq portrait & facials myth-truth slide',
            description: 'Male Slot 1 — Rafiq portrait; Slot 2 — facials myth-truth slide',
            assignee: 'Shahadat',
            status: 'completed',
            priority: 'medium',
            category: 'Social Media',
            due_time: new Date('2026-06-27T10:00:00Z').toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: 's7',
            title: 'Kamal mirror portrait & Keratin vs Rebonding',
            description: 'Male Slot 1 — Kamal mirror portrait; Slot 2 — Keratin vs Rebonding 4-slide carousel',
            assignee: 'Shahadat',
            status: 'completed',
            priority: 'medium',
            category: 'Social Media',
            due_time: new Date('2026-06-28T10:00:00Z').toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: 's8',
            title: 'Kamal skin truth carousel & Niacinamide vs Vit C',
            description: 'Male Slot 1 — Kamal skin truth carousel; Slot 2 — cold therapy carousel; Female Slot 1 — Niacinamide vs Vit C; Slot 2 — 90-day glass-skin carousel',
            assignee: 'Shahadat',
            status: 'completed',
            priority: 'high',
            category: 'Social Media',
            due_time: new Date('2026-06-29T10:00:00Z').toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: 's9',
            title: 'Water-glass myth carousel & serum macro',
            description: 'Female Slot 1 — water-glass myth carousel; Slot 2 — serum macro "The Ritual"',
            assignee: 'Shahadat',
            status: 'completed',
            priority: 'medium',
            category: 'Social Media',
            due_time: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: 's12',
            title: 'Father-son "The Conversation" & steam bath ritual',
            description: 'Male Slot 1 — father-son "The Conversation"; Slot 2 — steam bath ritual hero',
            assignee: 'Shahadat',
            status: 'completed',
            priority: 'medium',
            category: 'Social Media',
            due_time: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: 's14',
            title: 'Kamal Heritage Gold identity carousel',
            description: 'Male Slot 1 — Kamal Heritage Gold identity carousel; Slot 2 — "MORE is not always better"; Female Slot 2 — microneedling 6-slide carousel',
            assignee: 'Shahadat',
            status: 'completed',
            priority: 'medium',
            category: 'Social Media',
            due_time: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: 's15',
            title: 'SPF flat-lay / Zain rebuild',
            description: 'Male Slot 1 — SPF flat-lay / Zain rebuild',
            assignee: 'Shahadat',
            status: 'completed',
            priority: 'medium',
            category: 'Social Media',
            due_time: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: 's16',
            title: 'Female Slot builds',
            description: 'Female Slot builds',
            assignee: 'Shahadat',
            status: 'completed',
            priority: 'medium',
            category: 'Social Media',
            due_time: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: 's18',
            title: 'Chandan bath Heritage Gold static',
            description: 'Slot 1 — chandan bath Heritage Gold static (Slot 2 dropped, barbering)',
            assignee: 'Shahadat',
            status: 'completed',
            priority: 'medium',
            category: 'Social Media',
            due_time: new Date('2026-07-09T10:00:00Z').toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: 's19',
            title: 'Water-splash humour & cold plunge',
            description: 'Slot 1 — water-splash humour; Slot 2 — cold plunge',
            assignee: 'Shahadat',
            status: 'completed',
            priority: 'medium',
            category: 'Social Media',
            due_time: new Date('2026-07-10T10:00:00Z').toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: 's20',
            title: 'Kamal lifestyle (Dhaka setting fix)',
            description: 'Slot 1 — Kamal lifestyle (Dhaka setting fix); Slot 2 — cold water typographic slide',
            assignee: 'Shahadat',
            status: 'completed',
            priority: 'medium',
            category: 'Social Media',
            due_time: new Date('2026-07-11T10:00:00Z').toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: 's23',
            title: '4 skin types 6-slide carousel',
            description: 'Slot 1 — 4 skin types 6-slide carousel + hair loss PIL asset (Slot 2 deferred, barbering)',
            assignee: 'Shahadat',
            status: 'completed',
            priority: 'medium',
            category: 'Social Media',
            due_time: new Date('2026-07-14T10:00:00Z').toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: 's24',
            title: '2×2 bath comparison grid frame',
            description: 'Slot 1 — 2×2 bath comparison grid frame + 4 Nano Banana prompts',
            assignee: 'Shahadat',
            status: 'completed',
            priority: 'medium',
            category: 'Social Media',
            due_time: new Date('2026-07-15T10:00:00Z').toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }
        ];
        setTasks(defaultTasks);
        localStorage.setItem('jurnal_sandbox_tasks', JSON.stringify(defaultTasks));
      }

      if (localLogs) {
        setLogs(JSON.parse(localLogs));
      } else {
        const defaultLogs: ActivityLog[] = [
          {
            id: 'l1',
            task_id: '3',
            user_name: 'Shifat',
            action: 'create',
            details: 'Added task "Prepare back office coffee roster" and assigned it to Shifat',
            created_at: new Date(Date.now() - 3600000).toISOString(),
          },
          {
            id: 'l2',
            task_id: '3',
            user_name: 'Shifat',
            action: 'update_status',
            details: 'Marked "Prepare back office coffee roster" as Completed',
            created_at: new Date(Date.now() - 1800000).toISOString(),
          },
        ];
        setLogs(defaultLogs);
        localStorage.setItem('jurnal_sandbox_logs', JSON.stringify(defaultLogs));
      }
      setIsConnected(true);
    } else {
      // Supabase Active Database Mode
      const fetchInitialData = async () => {
        try {
          const { data: tasksData, error: tasksError } = await supabase
            .from('tasks')
            .select('*');
          if (tasksError) throw tasksError;
          setTasks(tasksData || []);

          const { data: logsData, error: logsError } = await supabase
            .from('activity_logs')
            .select('*');
          if (logsError) throw logsError;
          setLogs(logsData || []);
          setIsConnected(true);
        } catch (err: any) {
          console.error('Database connection failed, falling back to local storage:', err?.message || err?.details || err);
          setIsSandbox(true);
        }
      };

      fetchInitialData();

      // Subscribe to real-time events
      const taskSubscription = supabase
        .channel('schema-db-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'tasks' },
          (payload) => {
            if (payload.eventType === 'INSERT') {
              setTasks((current) => [...current, payload.new as Task]);
            } else if (payload.eventType === 'UPDATE') {
              setTasks((current) =>
                current.map((t) => (t.id === payload.new.id ? (payload.new as Task) : t))
              );
            } else if (payload.eventType === 'DELETE') {
              setTasks((current) => current.filter((t) => t.id !== payload.old.id));
            }
          }
        )
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'activity_logs' },
          (payload) => {
            setLogs((current) => [payload.new as ActivityLog, ...current]);
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            setIsConnected(true);
          } else {
            setIsConnected(false);
          }
        });

      return () => {
        supabase.removeChannel(taskSubscription);
      };
    }
  }, []);

  // CRUD operation triggers (Sandbox / DB aware)
  const handleAddTask = async (taskData: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => {
    const logDetails = `Added task "${taskData.title}" and assigned to ${taskData.assignee}`;
    
    if (isSandbox) {
      const newTask: Task = {
        ...taskData,
        id: Math.random().toString(36).substr(2, 9),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      const newLog: ActivityLog = {
        id: Math.random().toString(36).substr(2, 9),
        task_id: newTask.id,
        user_name: currentUser,
        action: 'create',
        details: logDetails,
        created_at: new Date().toISOString(),
      };

      const updatedTasks = [...tasks, newTask];
      const updatedLogs = [newLog, ...logs];

      setTasks(updatedTasks);
      setLogs(updatedLogs);

      localStorage.setItem('jurnal_sandbox_tasks', JSON.stringify(updatedTasks));
      localStorage.setItem('jurnal_sandbox_logs', JSON.stringify(updatedLogs));
    } else {
      try {
        const { data: newTasks, error: taskError } = await supabase
          .from('tasks')
          .insert([taskData])
          .select();
        
        if (taskError) throw taskError;

        if (newTasks && newTasks.length > 0) {
          const newLogData = {
            task_id: newTasks[0].id,
            user_name: currentUser,
            action: 'create',
            details: logDetails,
          };
          await supabase.from('activity_logs').insert([newLogData]);
        }
      } catch (err) {
        console.error('Error adding task:', err);
      }
    }
  };

  const handleUpdateTask = async (id: string, updates: Partial<Task>) => {
    const original = tasks.find((t) => t.id === id);
    if (!original) return;

    let logAction: ActivityLog['action'] = 'update_status';
    let logDetails = `Modified task "${original.title}" details`;

    if (updates.status && updates.status !== original.status) {
      logAction = 'update_status';
      logDetails = `Changed status of "${original.title}" from ${original.status.replace('_', ' ')} to ${updates.status.replace('_', ' ')}`;
    } else if (updates.due_time && updates.due_time !== original.due_time) {
      logAction = 'update_time';
      logDetails = `Rescheduled task "${original.title}" to ${new Date(updates.due_time).toLocaleString()}`;
    }

    if (isSandbox) {
      const updatedTasks = tasks.map((t) => {
        if (t.id === id) {
          return {
            ...t,
            ...updates,
            updated_at: new Date().toISOString(),
          };
        }
        return t;
      });

      const newLog: ActivityLog = {
        id: Math.random().toString(36).substr(2, 9),
        task_id: id,
        user_name: currentUser,
        action: logAction,
        details: logDetails,
        created_at: new Date().toISOString(),
      };

      const updatedLogs = [newLog, ...logs];

      setTasks(updatedTasks);
      setLogs(updatedLogs);

      localStorage.setItem('jurnal_sandbox_tasks', JSON.stringify(updatedTasks));
      localStorage.setItem('jurnal_sandbox_logs', JSON.stringify(updatedLogs));
    } else {
      try {
        const { error: taskError } = await supabase
          .from('tasks')
          .update({
            ...updates,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id);

        if (taskError) throw taskError;

        const newLogData = {
          task_id: id,
          user_name: currentUser,
          action: logAction,
          details: logDetails,
        };
        await supabase.from('activity_logs').insert([newLogData]);
      } catch (err) {
        console.error('Error updating task:', err);
      }
    }
  };

  const handleDeleteTask = async (id: string) => {
    const original = tasks.find((t) => t.id === id);
    if (!original) return;
    const logDetails = `Deleted task "${original.title}"`;

    if (isSandbox) {
      const updatedTasks = tasks.filter((t) => t.id !== id);
      const newLog: ActivityLog = {
        id: Math.random().toString(36).substr(2, 9),
        task_id: null,
        user_name: currentUser,
        action: 'delete',
        details: logDetails,
        created_at: new Date().toISOString(),
      };

      const updatedLogs = [newLog, ...logs];

      setTasks(updatedTasks);
      setLogs(updatedLogs);

      localStorage.setItem('jurnal_sandbox_tasks', JSON.stringify(updatedTasks));
      localStorage.setItem('jurnal_sandbox_logs', JSON.stringify(updatedLogs));
    } else {
      try {
        const { error: taskError } = await supabase
          .from('tasks')
          .delete()
          .eq('id', id);

        if (taskError) throw taskError;

        const newLogData = {
          user_name: currentUser,
          action: 'delete',
          details: logDetails,
        };
        await supabase.from('activity_logs').insert([newLogData]);
      } catch (err) {
        console.error('Error deleting task:', err);
      }
    }
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark-gold' ? 'warm-light' : 'dark-gold'));
  };

  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'BIW Back Office Overview';
      case 'tasks':
        return 'Task Board (Kanban)';
      case 'schedule':
        return 'Daily Schedule Timeline';
      case 'logs':
        return 'Owner Audit Logs & Timeline';
      default:
        return 'BIW Back Office Tracking System';
    }
  };

  return (
    <div className="app-container">
      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div className="mobile-sidebar-overlay" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* Sidebar navigation */}
      <aside className={`app-sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
        <button className="mobile-close-sidebar-btn" onClick={() => setIsMobileMenuOpen(false)}>
          &times;
        </button>

        <div className="brand-section" style={{ justifyContent: 'center' }}>
          <img
            src="/biw-logo.jpeg"
            alt="Beauty Intelligent Wellness"
            style={{ width: '140px', height: '140px', objectFit: 'contain', display: 'block', margin: '0 auto' }}
          />
        </div>

        <nav>
          <ul className="nav-links">
            <li>
              <button
                className={`nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('dashboard');
                  setIsMobileMenuOpen(false);
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '8px' }}>
                  <rect x="3" y="3" width="7" height="9" />
                  <rect x="14" y="3" width="7" height="5" />
                  <rect x="14" y="12" width="7" height="9" />
                  <rect x="3" y="16" width="7" height="5" />
                </svg>
                Dashboard
              </button>
            </li>
            <li>
              <button
                className={`nav-btn ${activeTab === 'tasks' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('tasks');
                  setIsMobileMenuOpen(false);
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '8px' }}>
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <line x1="9" y1="3" x2="9" y2="21" />
                  <line x1="15" y1="3" x2="15" y2="21" />
                </svg>
                Tasks Kanban
              </button>
            </li>
            <li>
              <button
                className={`nav-btn ${activeTab === 'schedule' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('schedule');
                  setIsMobileMenuOpen(false);
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '8px' }}>
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                Daily Schedule
              </button>
            </li>
            <li>
              <button
                className={`nav-btn ${activeTab === 'logs' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('logs');
                  setIsMobileMenuOpen(false);
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '8px' }}>
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
                Owner Audit Logs
              </button>
            </li>
          </ul>
        </nav>

        {/* Sidebar Footer Controls */}
        <div className="sidebar-footer">
          <div className="theme-toggle-box">
            <span style={{ color: 'var(--text-secondary)' }}>Theme Mode</span>
            <button className="toggle-switch-btn" onClick={toggleTheme}>
              {theme === 'dark-gold' ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="5" />
                    <line x1="12" y1="1" x2="12" y2="3" />
                    <line x1="12" y1="21" x2="12" y2="23" />
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                    <line x1="1" y1="12" x2="3" y2="12" />
                    <line x1="21" y1="12" x2="23" y2="12" />
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                  </svg>
                  Light Gold
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                  </svg>
                  Dark Gold
                </>
              )}
            </button>
          </div>

          <div className="user-selector-box">
            <span className="selector-label">Role Switcher</span>
            <select
              className="custom-select"
              value={currentUser}
              onChange={(e) => setCurrentUser(e.target.value)}
            >
              <option value="Shahadat">Shahadat (Operator)</option>
              <option value="Ratul">Ratul (Operator)</option>
              <option value="Shifat">Shifat (Operator)</option>
              <option value="Manager">Manager / Owner</option>
            </select>
          </div>
        </div>
      </aside>

    {/* Main viewport */}
    <main className="app-content">
      <header className="content-header">
        <button className="mobile-menu-btn" onClick={() => setIsMobileMenuOpen(true)}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        <div className="header-title-box">
          <h1>{getPageTitle()}</h1>
          <p>
            Signed in as: <strong style={{ color: 'var(--color-gold)' }}>{currentUser}</strong>
          </p>
        </div>

          <div className="header-status">
            {isSandbox && (
              <div className="sync-badge disconnected">
                <span className="sync-dot" style={{ backgroundColor: '#ff8c00', boxShadow: '0 0 8px #ff8c00' }} />
                <span>Sandbox Mode (LocalStorage)</span>
              </div>
            )}
            {!isSandbox && !isConnected && (
              <div className="sync-badge disconnected">
                <span className="sync-dot" style={{ backgroundColor: '#ff8c00', boxShadow: '0 0 8px #ff8c00' }} />
                <span>Connecting to Supabase...</span>
              </div>
            )}
          </div>
        </header>

        {/* Tab panels */}
        <section className="panel-container">
          {activeTab === 'dashboard' && (
            <DashboardOverview tasks={tasks} logs={logs} onSwitchTab={setActiveTab} />
          )}

          {activeTab === 'tasks' && (
            <TaskBoard
              tasks={tasks}
              currentUser={currentUser}
              onAddTask={handleAddTask}
              onUpdateTask={handleUpdateTask}
              onDeleteTask={handleDeleteTask}
            />
          )}

          {activeTab === 'schedule' && (
            <DailyScheduler tasks={tasks} onAddTask={handleAddTask} onUpdateTask={handleUpdateTask} />
          )}

          {activeTab === 'logs' && <AuditLogs logs={logs} />}
        </section>
      </main>
    </div>
  );
}
