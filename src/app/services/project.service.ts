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
        createdAt: new Date(project.createdAt),
        deadline: project.deadline ? new Date(project.deadline) : null,
        startDate: project.startDate ? new Date(project.startDate) : null
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
      color: project.color || this.getRandomColor(),
      startDate: project.startDate || null,
      deadline: project.deadline || null,
      categoryIds: project.categoryIds || []
    };

    const updatedProjects = [...this.projects.value, newProject];
    this.projects.next(updatedProjects);
    this.saveProjects(updatedProjects);

    const activityDetails: any = {
      projectId: newProject.id,
      projectName: newProject.name
    };
    
    if (newProject.startDate) {
      activityDetails.startDate = newProject.startDate.toLocaleDateString();
    }
    
    if (newProject.deadline) {
      activityDetails.deadline = newProject.deadline.toLocaleDateString();
    }

    this.activityLogService.addActivity({
      type: ActivityType.PROJECT_CREATED,
      timestamp: new Date(),
      userId: newProject.createdBy || 'anonymous',
      details: activityDetails
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

      // Päivitä projekti
      const result = this.updateProject(updatedProject);
      
      // Päivitä tehtävän päivämäärät projektin mukaan
      this.taskService.getTaskById(taskId).subscribe(task => {
        if (task) {
          // Jos projektilla on deadline ja tehtävällä ei ole tai se on myöhemmin kuin projektin
          if (project.deadline && (!task.deadline || task.deadline > project.deadline)) {
            this.taskService.setDeadline(taskId, project.deadline).subscribe();
          }
          
          // Jos projektilla on aloituspäivä ja tehtävällä ei ole tai se on aiemmin kuin projektin
          if (project.startDate && (!task.scheduledDate || task.scheduledDate < project.startDate)) {
            this.taskService.setScheduledDate(taskId, project.startDate).subscribe();
          }
        }
      });
      
      return result;
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

  /**
   * Asettaa projektille määräajan
   * @param projectId Projektin ID
   * @param deadline Määräajan päivämäärä
   * @returns Päivitetty projekti
   */
  setProjectDeadline(projectId: string, deadline: Date | null): Observable<Project> {
    console.log(`Asetetaan määräaika projektille ${projectId}:`, deadline);
    const allProjects = this.projects.getValue();
    const projectIndex = allProjects.findIndex(p => p.id === projectId);
    
    if (projectIndex === -1) {
      console.error(`Projektia ID:llä ${projectId} ei löydy`);
      return of(null as unknown as Project);
    }
    
    const project = { ...allProjects[projectIndex] };
    project.deadline = deadline;
    
    const updatedProjects = [...allProjects];
    updatedProjects[projectIndex] = project;
    
    this.projects.next(updatedProjects);
    this.saveProjects(updatedProjects);
    
    // Päivitetään myös projektin tehtävien määräajat, jos deadline on asetettu
    if (deadline) {
      this.updateProjectTasksDeadline(project, deadline);
    }
    
    // Lisää aktiviteettilokin merkintä
    this.activityLogService.addActivity({
      type: ActivityType.PROJECT_UPDATED,
      timestamp: new Date(),
      userId: project.createdBy || 'anonymous',
      details: {
        projectId: project.id,
        projectName: project.name,
        action: deadline ? `Määräaika asetettu: ${deadline.toLocaleDateString()}` : 'Määräaika poistettu'
      }
    });
    
    return of(project);
  }

  /**
   * Asettaa projektille suunnitellun aloituspäivämäärän
   * @param projectId Projektin ID
   * @param startDate Suunniteltu aloituspäivämäärä
   * @returns Päivitetty projekti
   */
  setProjectStartDate(projectId: string, startDate: Date | null): Observable<Project> {
    console.log(`Asetetaan aloituspäivämäärä projektille ${projectId}:`, startDate);
    const allProjects = this.projects.getValue();
    const projectIndex = allProjects.findIndex(p => p.id === projectId);
    
    if (projectIndex === -1) {
      console.error(`Projektia ID:llä ${projectId} ei löydy`);
      return of(null as unknown as Project);
    }
    
    const project = { ...allProjects[projectIndex] };
    project.startDate = startDate;
    
    const updatedProjects = [...allProjects];
    updatedProjects[projectIndex] = project;
    
    this.projects.next(updatedProjects);
    this.saveProjects(updatedProjects);
    
    // Päivitetään myös projektin tehtävien aloituspäivät, jos startDate on asetettu
    if (startDate) {
      this.updateProjectTasksStartDate(project, startDate);
    }
    
    // Lisää aktiviteettilokin merkintä
    this.activityLogService.addActivity({
      type: ActivityType.PROJECT_UPDATED,
      timestamp: new Date(),
      userId: project.createdBy || 'anonymous',
      details: {
        projectId: project.id,
        projectName: project.name,
        action: startDate ? `Aloituspäivä asetettu: ${startDate.toLocaleDateString()}` : 'Aloituspäivä poistettu'
      }
    });
    
    return of(project);
  }

  /**
   * Päivittää projektin tehtävien määräajat projektin määräajan mukaan
   * Jos tehtävällä ei ole määräaikaa tai sen määräaika on projektin määräajan jälkeen
   * @param project Projekti
   * @param deadline Määräaika
   */
  private updateProjectTasksDeadline(project: Project, deadline: Date): void {
    // Käytetään taskService:ä tehtävien päivittämiseen
    const taskService = this.taskService;
    
    // Haetaan kaikki projektin tehtävät
    taskService.getTasks().subscribe(allTasks => {
      const projectTasks = allTasks.filter(task => project.taskIds.includes(task.id));
      
      projectTasks.forEach(task => {
        // Päivitetään vain jos tehtävällä ei ole deadline:a tai sen deadline on projektin jälkeen
        if (!task.deadline || task.deadline > deadline) {
          taskService.setDeadline(task.id, deadline).subscribe();
        }
      });
    });
  }

  /**
   * Päivittää projektin tehtävien aloituspäivät projektin aloituspäivän mukaan
   * Jos tehtävällä ei ole aloituspäivää tai sen aloituspäivä on ennen projektin aloituspäivää
   * @param project Projekti
   * @param startDate Aloituspäivä
   */
  private updateProjectTasksStartDate(project: Project, startDate: Date): void {
    // Käytetään taskService:ä tehtävien päivittämiseen
    const taskService = this.taskService;
    
    // Haetaan kaikki projektin tehtävät
    taskService.getTasks().subscribe(allTasks => {
      const projectTasks = allTasks.filter(task => project.taskIds.includes(task.id));
      
      projectTasks.forEach(task => {
        // Päivitetään vain jos tehtävällä ei ole aloituspäivää tai sen aloituspäivä on ennen projektin aloituspäivää
        if (!task.scheduledDate || task.scheduledDate < startDate) {
          taskService.setScheduledDate(task.id, startDate).subscribe();
        }
      });
    });
  }
} 