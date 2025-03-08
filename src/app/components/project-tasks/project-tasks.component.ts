import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { Subject, combineLatest, takeUntil } from 'rxjs';
import { TaskService } from '../../services/task.service';
import { ProjectService } from '../../services/project.service';
import { Project } from '../../models/project.model';
import { Task } from '../../models/task.model';
import { TaskListComponent } from '../task-list/task-list.component';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-project-tasks',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TaskListComponent],
  template: `
    <div class="space-y-6">
      <div class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
        <div class="flex justify-between items-center mb-6">
          <div class="flex items-center gap-3">
            <button (click)="goBack()" 
                    class="btn-secondary flex items-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
              {{ translate('back') }}
            </button>
            <h2 *ngIf="project" class="text-2xl font-bold text-gray-900 dark:text-white" [style.color]="project.color">
              {{ project.name }}
            </h2>
          </div>
          
          <a routerLink="/create" 
             class="btn-primary flex items-center gap-2 transform hover:scale-105">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
            </svg>
            {{ translate('newTask') }}
          </a>
        </div>
        
        <div *ngIf="project && project.description" class="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{{ translate('description') }}</h3>
          <p class="text-gray-600 dark:text-gray-300">{{ project.description }}</p>
        </div>
        
        <div class="flex flex-wrap gap-4 mb-6">
          <div class="bg-white dark:bg-gray-700 rounded-lg shadow p-4 min-w-[140px] border border-gray-200 dark:border-gray-600">
            <span class="text-sm text-gray-500 dark:text-gray-400 block mb-1">{{ translate('tasks') }}</span>
            <span class="text-2xl font-bold text-gray-900 dark:text-white">{{ projectTasks.length }}</span>
          </div>
          
          <div class="bg-white dark:bg-gray-700 rounded-lg shadow p-4 min-w-[140px] border border-gray-200 dark:border-gray-600">
            <span class="text-sm text-gray-500 dark:text-gray-400 block mb-1">{{ translate('created') }}</span>
            <span class="text-md font-medium text-gray-900 dark:text-white">{{ project?.createdAt | date:'dd.MM.yyyy' }}</span>
          </div>
        </div>
        
        <div *ngIf="loading" class="py-8 flex justify-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
        
        <div *ngIf="!loading">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">{{ translate('projectTasks') }}</h3>
          
          <div *ngIf="projectTasks.length === 0" class="bg-gray-50 dark:bg-gray-700 rounded-lg p-8 text-center">
            <svg class="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
            </svg>
            <p class="text-gray-500 dark:text-gray-400 mb-4">{{ translate('noTasksInProject') }}</p>
            <div class="flex justify-center">
              <a routerLink="/create" class="btn-primary flex items-center gap-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                </svg>
                {{ translate('createTask') }}
              </a>
            </div>
          </div>
          
          <app-task-list 
            *ngIf="projectTasks.length > 0"
            [tasks]="projectTasks" 
            (taskChanged)="onTaskChange()"
            [showProjectColumn]="false"
          ></app-task-list>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./project-tasks.component.scss']
})
export class ProjectTasksComponent implements OnInit, OnDestroy {
  project: Project | null = null;
  tasks: Task[] = [];
  projectTasks: Task[] = [];
  projectId: string | null = null;
  loading = true;

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private projectService: ProjectService,
    private taskService: TaskService,
    private languageService: LanguageService
  ) {}

  ngOnInit(): void {
    this.route.paramMap
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        this.projectId = params.get('id');
        if (this.projectId) {
          this.loadProjectAndTasks(this.projectId);
        } else {
          this.router.navigate(['/projects']);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadProjectAndTasks(projectId: string): void {
    this.loading = true;
    
    combineLatest([
      this.projectService.getProjectById(projectId),
      this.taskService.getTasks()
    ])
    .pipe(takeUntil(this.destroy$))
    .subscribe(([project, tasks]) => {
      this.project = project;
      
      if (project) {
        this.projectTasks = tasks.filter(task => task.projectId === projectId);
      } else {
        this.projectTasks = [];
        this.router.navigate(['/projects']);
      }
      
      this.loading = false;
    });
  }

  goBack(): void {
    this.router.navigate(['/projects']);
  }

  // Metodi, jota voidaan kutsua TaskList-komponentista, kun tehtävä muuttuu
  onTaskChange(): void {
    if (this.projectId) {
      this.loadProjectAndTasks(this.projectId);
    }
  }

  translate(key: string): string {
    return this.languageService.translate(key);
  }
} 