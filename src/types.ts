export interface Task {
  id: string;
  title: string;
  description: string | null;
  assignee: string;
  status: 'pending' | 'in_progress' | 'under_review' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  due_time: string | null; // ISO string
  created_at: string;
  updated_at: string;
}

export interface ActivityLog {
  id: string;
  task_id: string | null;
  user_name: string;
  action: 'create' | 'update_status' | 'delete' | 'update_time';
  details: string;
  created_at: string;
}
