import { Injectable, Injector } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Task, TaskState, TaskPriority, Subtask } from '../models/task.model';
import { Comment } from '../models/comment.model';
import { v4 as uuidv4 } from 'uuid';
import { ActivityLogService } from './activity-log.service';
import { ActivityType } from '../models/activity-log.model';
import { ProjectService } from './project.service';

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
    private activityLogService: ActivityLogService,
    private injector: Injector
  ) {
    this.loadTasks();
  }

  private loadTasksFromStorage(): Task[] {
    const tasksJson = localStorage.getItem(this.STORAGE_KEY);
    if (!tasksJson) {
      return [];
    }
    
    try {
      // Parsitaan JSON-merkkijono Task-objekteiksi
      const parsedTasks: Task[] = JSON.parse(tasksJson);
      console.log(`Loaded ${parsedTasks.length} tasks from storage`);
      
      // Luodaan täysin erilliset kopiot jokaisesta tehtävästä
      return parsedTasks.map(parsedTask => {
        // Varmistetaan, että ID on aina string-tyyppinen
        const taskId = String(parsedTask.id);
        
        // Parsitaan state string-arvosta takaisin enumeraatioksi
        let taskState: TaskState;
        if (typeof parsedTask.state === 'string') {
          // Jos state on string, vertaa stringejä
          if (parsedTask.state === 'TO_DO') {
            taskState = TaskState.TO_DO;
          } else if (parsedTask.state === 'IN_PROGRESS') {
            taskState = TaskState.IN_PROGRESS;
          } else if (parsedTask.state === 'DONE') {
            taskState = TaskState.DONE;
          } else {
            console.warn(`Unknown task state string: ${parsedTask.state}, defaulting to TO_DO`);
            taskState = TaskState.TO_DO;
          }
        } else {
          // Jos state on jo enumeraatioarvo
          taskState = parsedTask.state as TaskState;
        }
        
        // Parsitaan priority string-arvosta takaisin enumeraatioksi
        let taskPriority: TaskPriority;
        if (typeof parsedTask.priority === 'string') {
          // Jos priority on string, vertaa stringejä
          if (parsedTask.priority === 'LOW') {
            taskPriority = TaskPriority.LOW;
          } else if (parsedTask.priority === 'MEDIUM') {
            taskPriority = TaskPriority.MEDIUM;
          } else if (parsedTask.priority === 'HIGH') {
            taskPriority = TaskPriority.HIGH;
          } else {
            console.warn(`Unknown task priority string: ${parsedTask.priority}, defaulting to MEDIUM`);
            taskPriority = TaskPriority.MEDIUM;
          }
        } else {
          // Jos priority on jo enumeraatioarvo
          taskPriority = parsedTask.priority as TaskPriority;
        }
        
        // Luo uusi Task-objekti, jossa on konvertoidut päivämäärät ja oikeat enumeraatioarvot
        const task: Task = {
          id: taskId, // Käytä varmistettua string-ID:tä
          title: parsedTask.title,
          description: parsedTask.description,
          assignee: parsedTask.assignee ? String(parsedTask.assignee) : null, // Varmista, että assignee on string tai null
          assigneeName: parsedTask.assigneeName,
          state: taskState, // Käytä oikein konvertoitua enumeraatioarvoa
          priority: taskPriority, // Käytä oikein konvertoitua enumeraatioarvoa
          category: parsedTask.category ? String(parsedTask.category) : null, // Varmista, että category on string tai null
          projectId: parsedTask.projectId ? String(parsedTask.projectId) : null, // Varmista, että projectId on string tai null
          createdAt: new Date(parsedTask.createdAt),
          createdBy: parsedTask.createdBy ? String(parsedTask.createdBy) : null, // Varmista, että createdBy on string tai null
          progress: parsedTask.progress,
          
          // Luodaan erilliset kopiot alitehtävistä
          subtasks: (parsedTask.subtasks || []).map(subtask => ({
            id: String(subtask.id), // Varmista, että ID on string
            title: subtask.title,
            completed: subtask.completed,
            createdAt: new Date(subtask.createdAt)
          })),
          
          // Luodaan erilliset kopiot kommenteista
          comments: (parsedTask.comments || []).map(comment => {
            // Varmista että kaikki kentät ovat oikein määritelty
            return {
              id: String(comment.id), // Varmista, että ID on string
              taskId: String(parsedTask.id), // Varmista että taskId on asetettu ja on string
              userId: String(comment.userId), // Varmista, että userId on string
              text: comment.text || '', // Käytä text-kenttää
              userName: comment.userName || '', // Käytä userName-kenttää (tai tyhjää)
              createdAt: new Date(comment.createdAt)
            };
          })
        };
        
        return task;
      });
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
    console.log(`Saving ${tasks.length} tasks to storage`);
    
    // Luodaan kopio päivämäärien ja objektien varmistamiseksi
    const serializedTasks = tasks.map(task => {
      // Varmistetaan, että enumeraatioarvot käsitellään oikein
      let taskState: TaskState;
      if (typeof task.state === 'string') {
        if (task.state === 'TO_DO') {
          taskState = TaskState.TO_DO;
        } else if (task.state === 'IN_PROGRESS') {
          taskState = TaskState.IN_PROGRESS;
        } else if (task.state === 'DONE') {
          taskState = TaskState.DONE;
        } else {
          console.warn(`Unknown task state: ${task.state} in saveTasks, defaulting to TO_DO`);
          taskState = TaskState.TO_DO;
        }
      } else {
        taskState = task.state;
      }
      
      let taskPriority: TaskPriority;
      if (typeof task.priority === 'string') {
        if (task.priority === 'LOW') {
          taskPriority = TaskPriority.LOW;
        } else if (task.priority === 'MEDIUM') {
          taskPriority = TaskPriority.MEDIUM;
        } else if (task.priority === 'HIGH') {
          taskPriority = TaskPriority.HIGH;
        } else {
          console.warn(`Unknown task priority: ${task.priority} in saveTasks, defaulting to MEDIUM`);
          taskPriority = TaskPriority.MEDIUM;
        }
      } else {
        taskPriority = task.priority;
      }
      
      // Luodaan täysin uusi kopio tehtävästä
      const taskCopy = {
        id: String(task.id), // Varmista, että ID on string
        title: task.title,
        description: task.description,
        assignee: task.assignee ? String(task.assignee) : null, // Varmista, että assignee on string tai null
        assigneeName: task.assigneeName,
        state: taskState, // Käytä varmistettua enumeraatioarvoa
        priority: taskPriority, // Käytä varmistettua enumeraatioarvoa
        category: task.category ? String(task.category) : null, // Varmista, että category on string tai null
        projectId: task.projectId ? String(task.projectId) : null, // Varmista, että projectId on string tai null
        createdAt: task.createdAt,
        createdBy: task.createdBy ? String(task.createdBy) : null, // Varmista, että createdBy on string tai null
        progress: task.progress,
        
        // Kopioidaan myös alitehtävät ja kommentit
        subtasks: task.subtasks?.map(subtask => ({
          id: String(subtask.id), // Varmista, että ID on string
          title: subtask.title,
          completed: subtask.completed,
          createdAt: subtask.createdAt
        })) || [],
        comments: task.comments?.map(comment => ({
          id: String(comment.id), // Varmista, että ID on string
          taskId: String(comment.taskId), // Varmista, että taskId on string
          userId: String(comment.userId), // Varmista, että userId on string
          text: comment.text,
          userName: comment.userName,
          createdAt: comment.createdAt
        })) || []
      };
      
      return taskCopy;
    });
    
    // Tallennetaan localStorage:een
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(serializedTasks));
    
    // Päivitetään subjektit - käytä serializedTasks-kopiota tässäkin
    this.tasks.next(serializedTasks);
    this.updateStats(serializedTasks);
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
    // Varmistetaan että tehtävällä on uniikki ID
    if (!task.id) {
      task.id = uuidv4(); // Generoidaan uniikki ID
    }
    
    console.log(`Adding new task with ID: ${task.id}`);
    
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
    
    // Päivitetään projektiobjektin taskIds-lista, jos tehtävällä on projekti
    if (task.projectId) {
      // Importoi ja kutsu ProjectService:n addTaskToProject metodia
      const projectService = this.injector.get(ProjectService);
      projectService.addTaskToProject(task.projectId, task.id).subscribe();
    }
    
    return of(task);
  }

  updateTask(task: Task): Observable<Task> {
    console.log(`Updating task: ${task.id}, ${task.title}`);
    // Haetaan kaikki tehtävät
    const allTasks = this.tasks.getValue();

    // Etsi tehtävän indeksi
    const existingTaskIndex = allTasks.findIndex(t => String(t.id) === String(task.id));
    
    // Jos tehtävää ei löydy, ilmoita ja palauta null
    if (existingTaskIndex === -1) {
      console.error(`Task with id ${task.id} not found`);
      return of(null as any);
    }
    
    console.log(`Found task at index: ${existingTaskIndex}`);
    
    // Hae vanha tehtävä vertailuja varten
    const oldTask = allTasks[existingTaskIndex];
    
    // Varmistetaan, että state on oikea enumeraatioarvo
    let taskState: TaskState;
    if (typeof task.state === 'string') {
      if (task.state === 'TO_DO') {
        taskState = TaskState.TO_DO;
      } else if (task.state === 'IN_PROGRESS') {
        taskState = TaskState.IN_PROGRESS;
      } else if (task.state === 'DONE') {
        taskState = TaskState.DONE;
      } else {
        console.warn(`Unknown task state string in updateTask: ${task.state}, using original state`);
        taskState = oldTask.state;
      }
    } else {
      taskState = task.state;
    }
    
    // Varmistetaan, että priority on oikea enumeraatioarvo
    let taskPriority: TaskPriority;
    if (typeof task.priority === 'string') {
      if (task.priority === 'LOW') {
        taskPriority = TaskPriority.LOW;
      } else if (task.priority === 'MEDIUM') {
        taskPriority = TaskPriority.MEDIUM;
      } else if (task.priority === 'HIGH') {
        taskPriority = TaskPriority.HIGH;
      } else {
        console.warn(`Unknown task priority string in updateTask: ${task.priority}, using original priority`);
        taskPriority = oldTask.priority;
      }
    } else {
      taskPriority = task.priority;
    }
    
    // Luo uusi tehtäväkopio, joka korvaa vanhan - käytä syvää kopiointia
    const updatedTask: Task = JSON.parse(JSON.stringify({
      id: task.id,
      title: task.title,
      description: task.description,
      assignee: task.assignee,
      assigneeName: task.assigneeName,
      state: taskState,
      priority: taskPriority,
      category: task.category,
      projectId: task.projectId,
      createdAt: new Date(task.createdAt).toISOString(),
      createdBy: task.createdBy,
      progress: task.progress || 0,
      subtasks: task.subtasks || [],
      comments: task.comments || []
    }));
    
    // Käsittele projektiyhteyden muutos
    const projectService = this.injector.get(ProjectService);
    
    // Jos projekti on vaihtunut, päivitä projektien taskIds-taulukot
    if (oldTask.projectId !== updatedTask.projectId) {
      console.log(`Project changed from ${oldTask.projectId} to ${updatedTask.projectId}`);
      
      // Jos vanha projekti oli olemassa, poista tehtävä sieltä
      if (oldTask.projectId) {
        projectService.removeTaskFromProject(oldTask.projectId, task.id).subscribe();
      }
      
      // Jos uusi projekti on olemassa, lisää tehtävä sinne
      if (updatedTask.projectId) {
        projectService.addTaskToProject(updatedTask.projectId, task.id).subscribe();
      }
    }
    
    // Korvaa vanha tehtävä päivitetyllä
    const updatedTasks = allTasks.map(t => 
      String(t.id) === String(task.id) ? updatedTask : t
    );
    
    // Tallenna päivitetty lista
    this.tasks.next(updatedTasks);
    this.saveTasks(updatedTasks);
    
    console.log(`Task updated successfully`);
    
    // Lisää aktiviteettiloki tarpeen mukaan
    if (oldTask.state !== updatedTask.state && updatedTask.state === TaskState.DONE) {
      // Tehtävä merkitty valmiiksi
      this.activityLogService.addActivity(
        ActivityType.STATUS_CHANGED,
        updatedTask.id,
        updatedTask.title,
        TaskState.DONE
      );
    } else {
      // Tavallinen päivitys
      this.activityLogService.addActivity(
        ActivityType.TASK_UPDATED,
        updatedTask.id,
        updatedTask.title
      );
    }
    
    // Palauta päivitetty tehtävä
    return of(updatedTask);
  }

  updateTaskState(taskId: string, state: TaskState): Observable<Task> {
    console.log(`Updating task state for task ID: ${taskId} to ${state}`);
    // Haetaan kaikki tehtävät
    const allTasks = this.tasks.getValue();
    console.log(`Total tasks in state: ${allTasks.length}`);
    
    // Debug: tulostetaan kaikki tehtävä-ID:t
    allTasks.forEach((task, index) => {
      console.log(`Task ${index}: id=${task.id}, title=${task.title}, state=${task.state}`);
    });
    
    // Muutetaan tehtävän hakemista varmemmaksi - käytetään find-metodia indeksin sijaan
    // ja varmistetaan, että hakemme oikeaa tehtävää
    const existingTask = allTasks.find(task => String(task.id) === String(taskId));
    
    // Jos tehtävää ei löydy, ilmoita ja palauta null
    if (!existingTask) {
      console.error(`Task with id ${taskId} not found`);
      return of(null as any);
    }
    
    console.log(`Found task: ${existingTask.title}, current state: ${existingTask.state}`);
    
    // Määritetään oikea TaskState-enumeraatioarvo (varmuuden vuoksi)
    let targetState: TaskState;
    if (typeof state === 'string') {
      // Jos state on string, vertaa stringejä
      if (state === 'TO_DO') {
        targetState = TaskState.TO_DO;
      } else if (state === 'IN_PROGRESS') {
        targetState = TaskState.IN_PROGRESS;
      } else if (state === 'DONE') {
        targetState = TaskState.DONE;
      } else {
        console.warn(`Unknown state string value: ${state}, defaulting to TO_DO`);
        targetState = TaskState.TO_DO;
      }
    } else {
      // Jos state on jo enumeraatioarvo
      targetState = state;
    }
    
    console.log(`Target state: ${targetState}`);
    
    // Jos tila on jo sama, ei tehdä mitään
    if (existingTask.state === targetState) {
      console.log("State already matches, no change needed");
      return of(existingTask);
    }
    
    // Luo kopio tehtävästä päivitetyllä tilalla
    const updatedTask: Task = {
      ...existingTask, // Käytetään spread-operaattoria tehtävän kopioimiseen
      state: targetState // Päivitetään vain tila
    };
    
    console.log(`Updated task state to: ${updatedTask.state}`);
    
    // Luodaan uusi tehtävälista, jossa alkuperäinen tehtävä on korvattu päivitetyllä
    const updatedTasks = allTasks.map(task => 
      String(task.id) === String(taskId) ? updatedTask : task
    );
    
    // Tallenna päivitetty lista
    this.tasks.next(updatedTasks);
    this.saveTasks(updatedTasks);
    
    // Lisää aktiviteettiloki tilan muutoksesta
    this.activityLogService.addActivity(
      ActivityType.STATUS_CHANGED,
      updatedTask.id,
      updatedTask.title,
      targetState
    );
    
    // Palauta päivitetty tehtävä
    return of(updatedTask);
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
    console.log(`Deleting task: ${id}`);
    
    // Haetaan kaikki tehtävät
    const allTasks = this.tasks.getValue();
    
    // Etsi poistettava tehtävä
    const taskToDelete = allTasks.find(t => String(t.id) === String(id));
    
    // Jos tehtävää ei löydy, ilmoita ja palauta
    if (!taskToDelete) {
      console.error(`Task with id ${id} not found for deletion`);
      return of(undefined);
    }
    
    // Jos tehtävä kuuluu projektiin, poista se projektin taskIds-taulukosta
    if (taskToDelete.projectId) {
      const projectService = this.injector.get(ProjectService);
      projectService.removeTaskFromProject(taskToDelete.projectId, id).subscribe();
    }
    
    // Poista tehtävä listasta
    const updatedTasks = allTasks.filter(t => String(t.id) !== String(id));
    
    // Tallenna päivitetty lista
    this.tasks.next(updatedTasks);
    this.saveTasks(updatedTasks);
    
    // Kirjaa aktiviteetti
    this.activityLogService.addActivity({
      type: ActivityType.TASK_DELETED,
      timestamp: new Date(),
      userId: 'system',
      details: {
        taskId: id,
        taskTitle: taskToDelete.title
      }
    });
    
    return of(undefined);
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

  getTaskById(id: string): Observable<Task | null> {
    console.log(`Etsitään tehtävää ID:llä: ${id}`);
    const allTasks = this.tasks.getValue();
    const task = allTasks.find(t => String(t.id) === String(id));
    
    if (!task) {
      console.warn(`Tehtävää ID:llä ${id} ei löytynyt`);
      return of(null);
    }
    
    console.log(`Tehtävä löytyi:`, task);
    return of(task);
  }
} 