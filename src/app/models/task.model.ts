import { Comment } from './comment.model';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  createdAt: Date;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assignee: string | null;
  assigneeName?: string;
  state: TaskState;
  priority: TaskPriority;
  category: string | null;
  projectId: string | null;
  createdAt: Date;
  createdBy: string | null;
  deadline: Date | null; // Tehtävän määräaika
  scheduledDate: Date | null; // Tehtävän suunniteltu aloituspäivä
  subtasks: Subtask[];
  comments: Comment[];
  progress: number; // Prosenttiluku 0-100 alitehtävien edistymisestä
}

export enum TaskState {
  TO_DO = 'TO_DO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE'
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH'
} 