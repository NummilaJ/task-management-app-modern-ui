import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil, Subscription } from 'rxjs';
import { ProjectService } from '../../services/project.service';
import { Project } from '../../models/project.model';
import { LanguageService } from '../../services/language.service';
import { ConfirmModalComponent } from '../confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmModalComponent],
  template: `
    <div class="space-y-6">
      <div class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white">{{ translate('projects') }}</h2>
          <button (click)="startCreatingProject()" 
                  class="btn-primary flex items-center gap-2 transform hover:scale-105">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
            </svg>
            {{ translate('newProject') }}
          </button>
        </div>

        <!-- Projektin luontilomake -->
        <div *ngIf="isCreatingProject" 
             class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6 border border-gray-200 dark:border-gray-600">
          <div class="mb-4">
            <label for="projectName" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {{ translate('projectName') }}
            </label>
            <input type="text" 
                   id="projectName" 
                   [(ngModel)]="newProject.name" 
                   class="w-full p-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                   placeholder="{{ translate('enterProjectName') }}" />
          </div>
          
          <div class="mb-4">
            <label for="projectDescription" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {{ translate('description') }}
            </label>
            <textarea id="projectDescription" 
                      [(ngModel)]="newProject.description" 
                      rows="3"
                      class="w-full p-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                      placeholder="{{ translate('enterProjectDescription') }}"></textarea>
          </div>
          
          <div class="flex space-x-3">
            <button (click)="createProject()" 
                    class="btn-primary">
              {{ translate('save') }}
            </button>
            <button (click)="cancelCreatingProject()" 
                    class="btn-secondary">
              {{ translate('cancel') }}
            </button>
          </div>
        </div>

        <!-- Projektilista -->
        <div *ngIf="projects.length === 0 && !isCreatingProject" 
             class="flex flex-col items-center justify-center p-8 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <svg class="w-16 h-16 text-gray-400 dark:text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path>
          </svg>
          <p class="text-gray-500 dark:text-gray-400 mb-4">{{ translate('noProjects') }}</p>
          <button (click)="startCreatingProject()" 
                  class="btn-primary flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
            </svg>
            {{ translate('createFirstProject') }}
          </button>
        </div>

        <div *ngIf="projects.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div *ngFor="let project of projects" 
               class="bg-white dark:bg-gray-700 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-200 border border-gray-200 dark:border-gray-600 flex flex-col"
               [class.border-blue-500]="project.id === selectedProjectId"
               (click)="selectProject(project)">
            <div class="h-2" [style.backgroundColor]="project.color"></div>
            <div class="p-4 flex flex-col flex-grow">
              <div class="flex justify-between items-start mb-2">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{{ project.name }}</h3>
                <button (click)="deleteProject($event, project.id)" 
                        class="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                  </svg>
                </button>
              </div>
              
              <p *ngIf="project.description" 
                 class="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
                {{ project.description }}
              </p>
              <div class="mt-auto pt-2 flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-600">
                <span class="flex items-center">
                  <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                  </svg>
                  {{ getTaskCount(project) }} {{ translate('tasks') }}
                </span>
                <span>{{ project.createdAt | date:'dd.MM.yyyy' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Vahvistusmodaali projektin poistamiseen -->
      <app-confirm-modal
        [isOpen]="isConfirmModalOpen"
        [title]="translate('deleteProject')"
        [message]="translate('confirmDeleteProject')"
        (confirm)="confirmDeleteProject()"
        (cancel)="cancelDeleteProject()">
      </app-confirm-modal>
    </div>
  `,
  styleUrls: ['./project-list.component.scss']
})
export class ProjectListComponent implements OnInit, OnDestroy {
  projects: Project[] = [];
  newProject: Partial<Project> = { name: '', description: '' };
  isCreatingProject = false;
  selectedProjectId: string | null = null;
  isConfirmModalOpen = false;
  projectToDelete: string | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private projectService: ProjectService,
    private router: Router,
    private languageService: LanguageService
  ) {}

  ngOnInit(): void {
    this.loadProjects();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadProjects(): void {
    this.projectService.getProjects()
      .pipe(takeUntil(this.destroy$))
      .subscribe(projects => {
        this.projects = projects;
      });
  }

  startCreatingProject(): void {
    this.isCreatingProject = true;
    this.newProject = { name: '', description: '' };
  }

  cancelCreatingProject(): void {
    this.isCreatingProject = false;
  }

  createProject(): void {
    if (!this.newProject.name?.trim()) {
      return;
    }

    this.projectService.addProject(this.newProject)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.isCreatingProject = false;
        this.newProject = { name: '', description: '' };
      });
  }

  selectProject(project: Project): void {
    this.selectedProjectId = project.id;
    this.router.navigate(['/projects', project.id]);
  }

  deleteProject(event: Event, projectId: string): void {
    event.stopPropagation();
    this.projectToDelete = projectId;
    this.isConfirmModalOpen = true;
  }

  confirmDeleteProject(): void {
    if (this.projectToDelete) {
      this.projectService.deleteProject(this.projectToDelete)
        .pipe(takeUntil(this.destroy$))
        .subscribe();
      this.projectToDelete = null;
    }
    this.isConfirmModalOpen = false;
  }

  cancelDeleteProject(): void {
    this.isConfirmModalOpen = false;
    this.projectToDelete = null;
  }

  getTaskCount(project: Project): number {
    return project.taskIds.length;
  }
  
  translate(key: string): string {
    return this.languageService.translate(key);
  }
} 