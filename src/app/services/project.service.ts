import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Project } from '../models/project.model';
import { Task } from '../models/task.model';
import { TaskService } from './task.service';
import { v4 as uuidv4 } from 'uuid';
import { ActivityLogService } from './activity-log.service';
import { ActivityType } from '../models/activity-log.model';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private projects = new BehaviorSubject<Project[]>([]);
  private readonly STORAGE_KEY = 'projects';

  constructor(
    private taskService: TaskService,
    private activityLogService: ActivityLogService
  ) {
    this.loadProjects();
  }

  private loadProjectsFromStorage(): Project[] {
    const projectsJson = localStorage.getItem(this.STORAGE_KEY);
    if (!projectsJson) {
      return [];
    }
    
    try {
      const parsedProjects: Project[] = JSON.parse(projectsJson);
      console.log(`Loaded ${parsedProjects.length} projects from storage`);
      
      return parsedProjects.map(project => ({
        ...project,
        createdAt: new Date(project.createdAt)
      }));
    } catch (e) {
      console.error('Error parsing projects from storage:', e);
      return [];
    }
  }

  private loadProjects() {
    const storedProjects = this.loadProjectsFromStorage();
    this.projects.next(storedProjects);
  }

  private saveProjects(projects: Project[]) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(projects));
      console.log(`Saved ${projects.length} projects to storage`);
    } catch (e) {
      console.error('Error saving projects to storage:', e);
    }
  }

  getProjects(): Observable<Project[]> {
    return this.projects.asObservable();
  }

  getProjectById(id: string): Observable<Project | null> {
    return this.projects.pipe(
      map(projects => projects.find(p => p.id === id) || null)
    );
  }

  addProject(project: Partial<Project>): Observable<Project> {
    const newProject: Project = {
      id: uuidv4(),
      name: project.name || 'Uusi projekti',
      description: project.description || '',
      createdAt: new Date(),
      createdBy: project.createdBy || null,
      taskIds: [],
      color: project.color || this.getRandomColor()
    };

    const updatedProjects = [...this.projects.value, newProject];
    this.projects.next(updatedProjects);
    this.saveProjects(updatedProjects);

    this.activityLogService.addActivity({
      type: ActivityType.PROJECT_CREATED,
      timestamp: new Date(),
      userId: newProject.createdBy || 'anonymous',
      details: {
        projectId: newProject.id,
        projectName: newProject.name
      }
    });

    return of(newProject);
  }

  updateProject(project: Project): Observable<Project> {
    const updatedProjects = this.projects.value.map(p => 
      p.id === project.id ? { ...project } : p
    );
    
    this.projects.next(updatedProjects);
    this.saveProjects(updatedProjects);

    this.activityLogService.addActivity({
      type: ActivityType.PROJECT_UPDATED,
      timestamp: new Date(),
      userId: project.createdBy || 'anonymous',
      details: {
        projectId: project.id,
        projectName: project.name
      }
    });

    return of(project);
  }

  deleteProject(id: string): Observable<void> {
    const projectToDelete = this.projects.value.find(p => p.id === id);
    if (!projectToDelete) {
      return of(undefined);
    }

    // Poista projekti
    const updatedProjects = this.projects.value.filter(p => p.id !== id);
    this.projects.next(updatedProjects);
    this.saveProjects(updatedProjects);

    // Päivitä tehtävät, jotka kuuluivat projektiin
    this.taskService.getTasks().subscribe(tasks => {
      const projectTasks = tasks.filter(task => task.projectId === id);
      
      // Aseta jokaisen tehtävän projectId nulliksi
      projectTasks.forEach(task => {
        this.taskService.updateTask({
          ...task,
          projectId: null
        }).subscribe();
      });
    });

    this.activityLogService.addActivity({
      type: ActivityType.PROJECT_DELETED,
      timestamp: new Date(),
      userId: 'system',
      details: {
        projectId: id,
        projectName: projectToDelete.name
      }
    });

    return of(undefined);
  }

  addTaskToProject(projectId: string, taskId: string): Observable<Project> {
    const project = this.projects.value.find(p => p.id === projectId);
    if (!project) {
      return of(null as unknown as Project);
    }

    // Lisää tehtävä projektiin jos sitä ei vielä ole
    if (!project.taskIds.includes(taskId)) {
      const updatedProject = {
        ...project,
        taskIds: [...project.taskIds, taskId]
      };

      return this.updateProject(updatedProject);
    }

    return of(project);
  }

  removeTaskFromProject(projectId: string, taskId: string): Observable<Project> {
    const project = this.projects.value.find(p => p.id === projectId);
    if (!project) {
      return of(null as unknown as Project);
    }

    const updatedProject = {
      ...project,
      taskIds: project.taskIds.filter(id => id !== taskId)
    };

    return this.updateProject(updatedProject);
  }

  getTasksForProject(projectId: string): Observable<string[]> {
    return this.projects.pipe(
      map(projects => {
        const project = projects.find(p => p.id === projectId);
        return project ? project.taskIds : [];
      })
    );
  }

  private getRandomColor(): string {
    const colors = [
      '#FF5252', '#FF4081', '#E040FB', '#7C4DFF', 
      '#536DFE', '#448AFF', '#40C4FF', '#18FFFF', 
      '#64FFDA', '#69F0AE', '#B2FF59', '#EEFF41', 
      '#FFFF00', '#FFD740', '#FFAB40', '#FF6E40'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }
} 