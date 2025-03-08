import { User } from './user.model';
import { Task } from './task.model';

export enum ActivityType {
  TASK_CREATED = 'task_created',
  TASK_UPDATED = 'task_updated',
  TASK_DELETED = 'task_deleted',
  SUBTASK_ADDED = 'subtask_added',
  SUBTASK_COMPLETED = 'subtask_completed',
  SUBTASK_DELETED = 'subtask_deleted',
  COMMENT_ADDED = 'comment_added',
  COMMENT_DELETED = 'comment_deleted',
  STATUS_CHANGED = 'status_changed',
  PROJECT_CREATED = 'project_created',
  PROJECT_UPDATED = 'project_updated',
  PROJECT_DELETED = 'project_deleted'
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  type: ActivityType;
  timestamp: number;
  taskId?: string;
  taskTitle?: string;
  details?: string;
} 