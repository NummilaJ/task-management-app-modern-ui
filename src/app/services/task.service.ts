import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { Task, TaskState, TaskPriority, Subtask } from '../models/task.model';
import { Comment } from '../models/comment.model';
import { v4 as uuidv4 } from 'uuid';

export interface TaskStats {
  total: number;
  completed: number;
  inProgress: number;
  byPriority: {
    high: number;
    medium: number;
    low: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private tasks = new BehaviorSubject<Task[]>([]);
  private stats = new BehaviorSubject<TaskStats>({
    total: 0,
    completed: 0,
    inProgress: 0,
    byPriority: {
      high: 0,
      medium: 0,
      low: 0
    }
  });
  private readonly STORAGE_KEY = 'tasks';

  constructor() {
    this.loadTasks();
  }

  private loadTasksFromStorage(): Task[] {
    const tasksJson = localStorage.getItem(this.STORAGE_KEY);
    if (!tasksJson) {
      return [];
    }
    
    try {
      const tasks: Task[] = JSON.parse(tasksJson);
      
      // Muunnetaan string-päivämäärät Date-olioiksi
      return tasks.map(task => ({
        ...task,
        createdAt: new Date(task.createdAt),
        subtasks: (task.subtasks || []).map(subtask => ({
          ...subtask,
          createdAt: new Date(subtask.createdAt)
        })),
        comments: (task.comments || []).map(comment => ({
          ...comment,
          createdAt: new Date(comment.createdAt)
        }))
      }));
    } catch (error) {
      console.error('Error parsing tasks from localStorage:', error);
      return [];
    }
  }

  private loadTasks() {
    const tasks = this.loadTasksFromStorage();
    this.tasks.next(tasks);
    this.updateStats(tasks);
  }

  private saveTasks(tasks: Task[]) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(tasks));
    this.tasks.next(tasks);
    this.updateStats(tasks);
  }

  private updateStats(tasks: Task[]) {
    this.stats.next({
      total: tasks.length,
      completed: tasks.filter(task => task.state === TaskState.DONE).length,
      inProgress: tasks.filter(task => task.state === TaskState.IN_PROGRESS).length,
      byPriority: {
        high: tasks.filter(task => task.priority === TaskPriority.HIGH).length,
        medium: tasks.filter(task => task.priority === TaskPriority.MEDIUM).length,
        low: tasks.filter(task => task.priority === TaskPriority.LOW).length
      }
    });
  }

  getTasks(): Observable<Task[]> {
    return this.tasks.asObservable();
  }

  getTasksByAssignee(userId: string): Observable<Task[]> {
    return this.tasks.pipe(
      map(tasks => tasks.filter(task => task.assignee === userId))
    );
  }

  getTasksByCreator(userId: string): Observable<Task[]> {
    return this.tasks.pipe(
      map(tasks => tasks.filter(task => task.createdBy === userId))
    );
  }

  getStats(): Observable<TaskStats> {
    return this.stats.asObservable();
  }

  addTask(task: Task): Observable<Task> {
    const currentTasks = this.tasks.value;
    const newTask: Task = {
      ...task,
      id: uuidv4(),
      createdAt: new Date(),
      createdBy: task.createdBy,
      progress: 0,
      subtasks: task.subtasks || [],
      comments: task.comments || []
    };
    
    const updatedTasks = [...currentTasks, newTask];
    this.tasks.next(updatedTasks);
    this.saveTasks(updatedTasks);
    this.updateStats(updatedTasks);
    
    return of(newTask);
  }

  updateTask(task: Task): Observable<Task> {
    return new Observable(observer => {
      const tasks = this.loadTasksFromStorage();
      const index = tasks.findIndex(t => t.id === task.id);
      
      if (index !== -1) {
        tasks[index] = { ...task };
        this.saveTasks(tasks);
        observer.next(tasks[index]);
      }
      
      observer.complete();
    });
  }

  updateTaskState(taskId: string, state: TaskState): Observable<Task> {
    const tasks = this.tasks.value;
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      return this.updateTask({ ...task, state });
    }
    throw new Error(`Task with id ${taskId} not found`);
  }

  updateAssignee(taskId: string, assignee: string): Observable<Task> {
    const tasks = this.tasks.value;
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      return this.updateTask({ ...task, assignee });
    }
    throw new Error(`Task with id ${taskId} not found`);
  }

  deleteTask(id: string): Observable<void> {
    const tasks = this.tasks.value;
    this.saveTasks(tasks.filter(task => task.id !== id));
    return new BehaviorSubject<void>(undefined).asObservable();
  }

  exportTasks(): string {
    return JSON.stringify(this.tasks.getValue(), null, 2);
  }

  private calculateProgress(subtasks: Subtask[]): number {
    if (subtasks.length === 0) return 0;
    const completedCount = subtasks.filter(st => st.completed).length;
    return Math.round((completedCount / subtasks.length) * 100);
  }

  addSubtask(taskId: string, title: string): Observable<Task> {
    const tasks = this.tasks.value;
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    
    if (taskIndex === -1) {
      throw new Error(`Task with id ${taskId} not found`);
    }

    const newSubtask: Subtask = {
      id: Date.now().toString(),
      title,
      completed: false,
      createdAt: new Date()
    };

    const updatedTask = {
      ...tasks[taskIndex],
      subtasks: [...tasks[taskIndex].subtasks, newSubtask]
    };
    updatedTask.progress = this.calculateProgress(updatedTask.subtasks);

    tasks[taskIndex] = updatedTask;
    this.saveTasks(tasks);

    return new BehaviorSubject(updatedTask).asObservable();
  }

  toggleSubtask(taskId: string, subtaskId: string): Observable<Task> {
    const tasks = this.tasks.value;
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    
    if (taskIndex === -1) {
      throw new Error(`Task with id ${taskId} not found`);
    }

    const task = tasks[taskIndex];
    const subtaskIndex = task.subtasks.findIndex(st => st.id === subtaskId);

    if (subtaskIndex === -1) {
      throw new Error(`Subtask with id ${subtaskId} not found`);
    }

    const updatedSubtasks = [...task.subtasks];
    updatedSubtasks[subtaskIndex] = {
      ...updatedSubtasks[subtaskIndex],
      completed: !updatedSubtasks[subtaskIndex].completed
    };

    const updatedTask = {
      ...task,
      subtasks: updatedSubtasks,
      progress: this.calculateProgress(updatedSubtasks)
    };

    // Jos kaikki alitehtävät ovat valmiita, merkitään päätehtävä valmiiksi
    if (updatedTask.progress === 100 && updatedTask.state !== TaskState.DONE) {
      updatedTask.state = TaskState.DONE;
    }

    tasks[taskIndex] = updatedTask;
    this.saveTasks(tasks);

    return new BehaviorSubject(updatedTask).asObservable();
  }

  deleteSubtask(taskId: string, subtaskId: string): Observable<Task> {
    const tasks = this.tasks.value;
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    
    if (taskIndex === -1) {
      throw new Error(`Task with id ${taskId} not found`);
    }

    const task = tasks[taskIndex];
    const updatedSubtasks = task.subtasks.filter(st => st.id !== subtaskId);

    const updatedTask = {
      ...task,
      subtasks: updatedSubtasks,
      progress: this.calculateProgress(updatedSubtasks)
    };

    tasks[taskIndex] = updatedTask;
    this.saveTasks(tasks);

    return new BehaviorSubject(updatedTask).asObservable();
  }

  addComment(taskId: string, comment: Comment): Observable<Task> {
    const tasks = this.tasks.value;
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    
    if (taskIndex === -1) {
      throw new Error(`Task with id ${taskId} not found`);
    }
    
    const task = tasks[taskIndex];
    const updatedTask = {
      ...task,
      comments: [...(task.comments || []), comment]
    };
    
    tasks[taskIndex] = updatedTask;
    this.saveTasks(tasks);
    
    return new BehaviorSubject(updatedTask).asObservable();
  }
  
  deleteComment(taskId: string, commentId: string): Observable<Task> {
    const tasks = this.tasks.value;
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    
    if (taskIndex === -1) {
      throw new Error(`Task with id ${taskId} not found`);
    }
    
    const task = tasks[taskIndex];
    
    if (!task.comments) {
      return new BehaviorSubject(task).asObservable();
    }
    
    const updatedTask = {
      ...task,
      comments: task.comments.filter(c => c.id !== commentId)
    };
    
    tasks[taskIndex] = updatedTask;
    this.saveTasks(tasks);
    
    return new BehaviorSubject(updatedTask).asObservable();
  }
} 