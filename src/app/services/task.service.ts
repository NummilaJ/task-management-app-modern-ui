import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Task, TaskState, TaskPriority, Subtask } from '../models/task.model';
import { Comment } from '../models/comment.model';
import { v4 as uuidv4 } from 'uuid';
import { ActivityLogService } from './activity-log.service';
import { ActivityType } from '../models/activity-log.model';

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

  constructor(
    private activityLogService: ActivityLogService
  ) {
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
    const allTasks = this.tasks.getValue();
    const newTasks = [...allTasks, task];
    
    this.saveTasks(newTasks);
    this.tasks.next(newTasks);
    this.updateStats(newTasks);
    
    // Lisätään aktiviteettiloki
    this.activityLogService.addActivity(
      ActivityType.TASK_CREATED,
      task.id,
      task.title
    );
    
    return of(task);
  }

  updateTask(task: Task): Observable<Task> {
    const allTasks = this.tasks.getValue();
    const oldTask = allTasks.find(t => t.id === task.id);
    const updatedTasks = allTasks.map(t => t.id === task.id ? task : t);
    
    this.saveTasks(updatedTasks);
    this.tasks.next(updatedTasks);
    this.updateStats(updatedTasks);
    
    // Tarkistetaan, onko kyseessä tilan muutos "valmiiksi" 
    if (oldTask && oldTask.state !== task.state && task.state === TaskState.DONE) {
      // Lisätään STATUS_CHANGED aktiviteetti, jos tehtävä on merkitty valmiiksi
      this.activityLogService.addActivity(
        ActivityType.STATUS_CHANGED,
        task.id,
        task.title,
        TaskState.DONE // Tallennetaan DONE-tila details-kenttään
      );
    } else {
      // Lisätään tavallinen päivitysaktiviteetti
      this.activityLogService.addActivity(
        ActivityType.TASK_UPDATED,
        task.id,
        task.title
      );
    }
    
    return of(task);
  }

  updateTaskState(taskId: string, state: TaskState): Observable<Task> {
    const task = this.tasks.getValue().find(t => t.id === taskId);
    if (!task) {
      return of(null as any);
    }
    
    // Lisätään aktiviteettiloki tilan muutoksesta - tallennetaan uusi tila details-kenttään
    this.activityLogService.addActivity(
      ActivityType.STATUS_CHANGED,
      task.id,
      task.title,
      state // Tallennetaan uusi tila details-kenttään
    );
    
    return this.updateTask({ ...task, state });
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
    const allTasks = this.tasks.getValue();
    const task = allTasks.find(t => t.id === id);
    const newTasks = allTasks.filter(t => t.id !== id);
    
    this.saveTasks(newTasks);
    this.tasks.next(newTasks);
    this.updateStats(newTasks);
    
    // Lisätään aktiviteettiloki
    if (task) {
      this.activityLogService.addActivity(
        ActivityType.TASK_DELETED,
        task.id,
        task.title
      );
    }
    
    return of(void 0);
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
    const allTasks = this.tasks.getValue();
    const task = allTasks.find(t => t.id === taskId);
    
    if (!task) {
      return of(null as any);
    }
    
    const newSubtask: Subtask = {
      id: uuidv4(),
      title,
      completed: false,
      createdAt: new Date()
    };
    
    const updatedTask = {
      ...task,
      subtasks: [...(task.subtasks || []), newSubtask]
    };
    
    // Lisätään aktiviteettiloki
    this.activityLogService.addActivity(
      ActivityType.SUBTASK_ADDED,
      task.id,
      task.title,
      newSubtask.title
    );
    
    return this.updateTask(updatedTask);
  }

  completeSubtask(taskId: string, subtaskId: string, completed: boolean): Observable<Task> {
    const allTasks = this.tasks.getValue();
    const task = allTasks.find(t => t.id === taskId);
    
    if (!task || !task.subtasks) {
      return of(null as any);
    }
    
    const updatedSubtasks = task.subtasks.map(st => {
      if (st.id === subtaskId) {
        const updatedSubtask = { ...st, completed };
        
        // Lisätään aktiviteetti vain kun merkitään valmiiksi
        if (completed) {
          this.activityLogService.addActivity(
            ActivityType.SUBTASK_COMPLETED,
            task.id,
            task.title,
            st.title
          );
        }
        
        return updatedSubtask;
      }
      return st;
    });
    
    const updatedTask = { ...task, subtasks: updatedSubtasks };
    return this.updateTask(updatedTask);
  }

  deleteSubtask(taskId: string, subtaskId: string): Observable<Task> {
    const allTasks = this.tasks.getValue();
    const task = allTasks.find(t => t.id === taskId);
    
    if (!task || !task.subtasks) {
      return of(null as any);
    }
    
    const subtask = task.subtasks.find(st => st.id === subtaskId);
    const updatedSubtasks = task.subtasks.filter(st => st.id !== subtaskId);
    const updatedTask = { ...task, subtasks: updatedSubtasks };
    
    // Lisätään aktiviteettiloki
    if (subtask) {
      this.activityLogService.addActivity(
        ActivityType.SUBTASK_DELETED,
        task.id,
        task.title,
        subtask.title
      );
    }
    
    return this.updateTask(updatedTask);
  }

  addComment(taskId: string, comment: Comment): Observable<Task> {
    const allTasks = this.tasks.getValue();
    const task = allTasks.find(t => t.id === taskId);
    
    if (!task) {
      return of(null as any);
    }
    
    const updatedTask = {
      ...task,
      comments: [...(task.comments || []), comment]
    };
    
    // Lisätään aktiviteettiloki - välitetään kommentin teksti details-kentässä
    this.activityLogService.addActivity(
      ActivityType.COMMENT_ADDED,
      task.id,
      task.title,
      comment.text
    );
    
    return this.updateTask(updatedTask).pipe(
      // Poistetaan updateTask-metodin automaattinen aktiviteettiloki
      map(result => {
        // Tämä on tarpeen, jottei aktiviteettilokia luoda tuplakappaletta
        return result;
      })
    );
  }
  
  deleteComment(taskId: string, commentId: string): Observable<Task> {
    const allTasks = this.tasks.getValue();
    const task = allTasks.find(t => t.id === taskId);
    
    if (!task || !task.comments) {
      return of(null as any);
    }
    
    const comment = task.comments.find(c => c.id === commentId);
    const updatedComments = task.comments.filter(c => c.id !== commentId);
    const updatedTask = { ...task, comments: updatedComments };
    
    // Lisätään aktiviteettiloki - välitetään poistetun kommentin teksti details-kentässä
    if (comment) {
      this.activityLogService.addActivity(
        ActivityType.COMMENT_DELETED,
        task.id,
        task.title,
        comment.text
      );
    }
    
    return this.updateTask(updatedTask).pipe(
      // Poistetaan updateTask-metodin automaattinen aktiviteettiloki
      map(result => {
        // Tämä on tarpeen, jottei aktiviteettilokia luoda tuplakappaletta
        return result;
      })
    );
  }

  toggleSubtask(taskId: string, subtaskId: string): Observable<Task> {
    const allTasks = this.tasks.getValue();
    const task = allTasks.find(t => t.id === taskId);
    
    if (!task || !task.subtasks) {
      return of(null as any);
    }
    
    const subtask = task.subtasks.find(st => st.id === subtaskId);
    if (!subtask) {
      return of(null as any);
    }
    
    // Käännä subtaskin tila päinvastaiseksi
    const newCompleted = !subtask.completed;
    
    // Käytä olemassa olevaa completeSubtask metodia
    return this.completeSubtask(taskId, subtaskId, newCompleted);
  }
} 