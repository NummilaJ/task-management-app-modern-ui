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
import { CategoryService } from '../../services/category.service';
import { Category } from '../../models/category.model';
import { ProjectContextService } from '../../services/project-context.service';

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
          
          <a [routerLink]="['/create']" [queryParams]="{projectId: projectId}" 
             class="btn-primary flex items-center gap-2 transform hover:scale-105">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
            </svg>
            {{ translate('newTask') }}
          </a>
        </div>
        
        <div *ngIf="project && project.description" class="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div class="flex justify-between items-center mb-2">
            <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ translate('description') }}</h3>
            <button *ngIf="!editingDescription" (click)="editDescription()" class="text-blue-500 hover:text-blue-700">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
              </svg>
            </button>
          </div>
          <div *ngIf="!editingDescription">
            <p class="text-gray-600 dark:text-gray-300 whitespace-pre-line">{{ project.description }}</p>
          </div>
          <div *ngIf="editingDescription" class="mt-2">
            <textarea 
              [(ngModel)]="descriptionInput" 
              rows="4" 
              class="w-full p-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white">
            </textarea>
            <div class="flex gap-2 mt-2">
              <button (click)="saveDescription()" class="btn-xs btn-success">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </button>
              <button (click)="cancelEditDescription()" class="btn-xs btn-danger">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        <!-- Näytetään tyhjä kuvaus muokkausnappulalla jos projektilla ei ole kuvausta -->
        <div *ngIf="project && !project.description" class="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div class="flex justify-between items-center mb-2">
            <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ translate('description') }}</h3>
            <button *ngIf="!editingDescription" (click)="editDescription()" class="text-blue-500 hover:text-blue-700">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
              </svg>
            </button>
          </div>
          <div *ngIf="!editingDescription">
            <p class="text-gray-500 dark:text-gray-400 italic">{{ translate('noDescription') }}</p>
          </div>
          <div *ngIf="editingDescription" class="mt-2">
            <textarea 
              [(ngModel)]="descriptionInput" 
              rows="4" 
              class="w-full p-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white">
            </textarea>
            <div class="flex gap-2 mt-2">
              <button (click)="saveDescription()" class="btn-xs btn-success">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </button>
              <button (click)="cancelEditDescription()" class="btn-xs btn-danger">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        <!-- Projektin kategoriat -->
        <div *ngIf="project" class="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div class="flex justify-between items-center mb-2">
            <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ translate('projectCategories') }}</h3>
            <button *ngIf="!editingCategories" (click)="editCategories()" class="text-blue-500 hover:text-blue-700">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
              </svg>
            </button>
          </div>
          
          <!-- Näytetään projektin kategoriat -->
          <div *ngIf="!editingCategories">
            <div *ngIf="projectCategories.length > 0" class="flex flex-wrap gap-2">
              <div *ngFor="let category of projectCategories" 
                   class="px-2 py-1 rounded-full flex items-center"
                   [style.backgroundColor]="category.color + '33'"
                   [style.borderColor]="category.color"
                   style="border-width: 1px;">
                <div [style.backgroundColor]="category.color" class="w-2 h-2 rounded-full mr-1"></div>
                <span class="text-sm" [style.color]="category.color">{{ category.name }}</span>
              </div>
            </div>
            <p *ngIf="projectCategories.length === 0" class="text-gray-500 dark:text-gray-400 italic">
              {{ translate('noProjectCategories') }}
            </p>
          </div>
          
          <!-- Kategoriavalintalista -->
          <div *ngIf="editingCategories" class="mt-2">
            <div class="max-h-48 overflow-y-auto p-2 border border-gray-300 dark:border-gray-600 rounded-md 
                       bg-white dark:bg-gray-800">
              <div *ngFor="let category of allCategories" class="flex items-center mb-2">
                <input type="checkbox" 
                       [id]="'category-' + category.id" 
                       [checked]="isCategorySelected(category.id)"
                       (change)="toggleCategory(category.id)"
                       class="mr-2">
                <label [for]="'category-' + category.id" class="flex items-center cursor-pointer">
                  <div [style.backgroundColor]="category.color" class="w-3 h-3 rounded-full mr-2"></div>
                  <span>{{ category.name }}</span>
                </label>
              </div>
              <div *ngIf="allCategories.length === 0" class="text-gray-500 dark:text-gray-400 text-sm py-2">
                {{ translate('noCategories') }}
              </div>
            </div>
            <div class="flex gap-2 mt-2">
              <button (click)="saveCategories()" class="btn-xs btn-success">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </button>
              <button (click)="cancelEditCategories()" class="btn-xs btn-danger">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
          </div>
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
          
          <!-- Projektin aloituspäivämäärä -->
          <div class="bg-white dark:bg-gray-700 rounded-lg shadow p-4 min-w-[180px] border border-gray-200 dark:border-gray-600">
            <div class="flex justify-between items-start">
              <span class="text-sm text-gray-500 dark:text-gray-400 block mb-1">{{ translate('startDate') }}</span>
              <button *ngIf="!editingStartDate" (click)="editStartDate()" class="text-blue-500 hover:text-blue-700">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                </svg>
              </button>
            </div>
            <div *ngIf="!editingStartDate">
              <span *ngIf="project?.startDate" class="text-md font-medium text-gray-900 dark:text-white">
                {{ project?.startDate | date:'dd.MM.yyyy' }}
              </span>
              <span *ngIf="!project?.startDate" class="text-sm text-gray-500 dark:text-gray-400">
                {{ translate('noStartDate') }}
              </span>
            </div>
            <div *ngIf="editingStartDate" class="flex gap-2 mt-1">
              <input type="date" [(ngModel)]="startDateInput" class="input-field text-sm">
              <button (click)="saveStartDate()" class="btn-xs btn-success">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </button>
              <button (click)="cancelEditStartDate()" class="btn-xs btn-danger">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
          </div>
          
          <!-- Projektin määräaika -->
          <div class="bg-white dark:bg-gray-700 rounded-lg shadow p-4 min-w-[180px] border border-gray-200 dark:border-gray-600">
            <div class="flex justify-between items-start">
              <span class="text-sm text-gray-500 dark:text-gray-400 block mb-1">{{ translate('deadline') }}</span>
              <button *ngIf="!editingDeadline" (click)="editDeadline()" class="text-blue-500 hover:text-blue-700">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                </svg>
              </button>
            </div>
            <div *ngIf="!editingDeadline">
              <span *ngIf="project?.deadline" class="text-md font-medium text-red-500 dark:text-red-400">
                {{ project?.deadline | date:'dd.MM.yyyy' }}
              </span>
              <span *ngIf="!project?.deadline" class="text-sm text-gray-500 dark:text-gray-400">
                {{ translate('noDeadline') }}
              </span>
            </div>
            <div *ngIf="editingDeadline" class="flex gap-2 mt-1">
              <input type="date" [(ngModel)]="deadlineInput" class="input-field text-sm">
              <button (click)="saveDeadline()" class="btn-xs btn-success">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </button>
              <button (click)="cancelEditDeadline()" class="btn-xs btn-danger">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
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
              <a [routerLink]="['/create']" [queryParams]="{projectId: projectId}" class="btn-primary flex items-center gap-2">
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
            [hideTaskForm]="true"
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
  
  // Päivämääräkenttien muokkaus
  editingStartDate = false;
  editingDeadline = false;
  editingDescription = false;
  editingCategories = false;
  startDateInput: string | null = null;
  deadlineInput: string | null = null;
  descriptionInput: string = '';
  
  // Kategoriat
  categories: Category[] = [];
  projectCategories: Category[] = [];
  allCategories: Category[] = [];

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private projectService: ProjectService,
    private taskService: TaskService,
    private languageService: LanguageService,
    private categoryService: CategoryService,
    private projectContextService: ProjectContextService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.projectId = id;
        this.loadProjectAndTasks(id);
        this.loadCategories();
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
    
    const project$ = this.projectService.getProjectById(projectId);
    const tasks$ = this.taskService.getTasks();
    
    combineLatest([project$, tasks$])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([project, tasks]) => {
        this.project = project;
        
        if (project) {
          // Aseta aktiivinen projekti kun projektin tiedot ladataan
          this.projectContextService.setActiveProject(project);
          
          this.projectTasks = tasks.filter(task => task.projectId === projectId);
          this.updateProjectCategories();
        } else {
          this.projectTasks = [];
          this.router.navigate(['/projects']);
        }
        
        this.loading = false;
      });
  }
  
  loadCategories(): void {
    this.categoryService.getCategories()
      .pipe(takeUntil(this.destroy$))
      .subscribe(categories => {
        this.allCategories = categories;
        this.updateProjectCategories();
      });
  }
  
  updateProjectCategories(): void {
    if (this.project && this.project.categoryIds && this.allCategories.length > 0) {
      this.projectCategories = this.allCategories.filter(
        category => this.project?.categoryIds?.includes(category.id)
      );
    } else {
      this.projectCategories = this.allCategories;
    }
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

  // Aloituspäivämäärän muokkaus
  editStartDate(): void {
    if (!this.project || !this.project.startDate) {
      this.startDateInput = null;
    } else {
      const date = new Date(this.project.startDate);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      this.startDateInput = `${year}-${month}-${day}`;
    }
    this.editingStartDate = true;
  }

  saveStartDate(): void {
    if (!this.project) return;
    
    let startDate: Date | null = null;
    if (this.startDateInput) {
      startDate = new Date(this.startDateInput);
    }
    
    this.projectService.setProjectStartDate(this.project.id, startDate).subscribe(
      updatedProject => {
        if (updatedProject) {
          this.project = updatedProject;
          this.editingStartDate = false;
        }
      }
    );
  }

  cancelEditStartDate(): void {
    this.editingStartDate = false;
    this.startDateInput = null;
  }

  // Määräajan muokkaus
  editDeadline(): void {
    if (!this.project || !this.project.deadline) {
      this.deadlineInput = null;
    } else {
      const date = new Date(this.project.deadline);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      this.deadlineInput = `${year}-${month}-${day}`;
    }
    this.editingDeadline = true;
  }

  saveDeadline(): void {
    if (!this.project) return;
    
    let deadline: Date | null = null;
    if (this.deadlineInput) {
      deadline = new Date(this.deadlineInput);
    }
    
    this.projectService.setProjectDeadline(this.project.id, deadline).subscribe(
      updatedProject => {
        if (updatedProject) {
          this.project = updatedProject;
          this.editingDeadline = false;
        }
      }
    );
  }

  cancelEditDeadline(): void {
    this.editingDeadline = false;
    this.deadlineInput = null;
  }

  // Projektin kuvaus
  editDescription(): void {
    this.descriptionInput = this.project?.description || '';
    this.editingDescription = true;
  }
  
  saveDescription(): void {
    if (!this.project) return;
    
    const updatedProject: Project = {
      ...this.project,
      description: this.descriptionInput.trim()
    };
    
    this.projectService.updateProject(updatedProject)
      .pipe(takeUntil(this.destroy$))
      .subscribe(project => {
        this.project = project;
        this.editingDescription = false;
      });
  }
  
  cancelEditDescription(): void {
    this.editingDescription = false;
  }
  
  // Projektin kategoriat
  editCategories(): void {
    this.editingCategories = true;
  }
  
  toggleCategory(categoryId: string): void {
    if (!this.project) return;
    
    if (!this.project.categoryIds) {
      this.project = {
        ...this.project,
        categoryIds: [categoryId]
      };
      return;
    }
    
    const currentCategoryIds = [...this.project.categoryIds];
    
    if (currentCategoryIds.includes(categoryId)) {
      this.project = {
        ...this.project,
        categoryIds: currentCategoryIds.filter(id => id !== categoryId)
      };
    } else {
      this.project = {
        ...this.project,
        categoryIds: [...currentCategoryIds, categoryId]
      };
    }
  }
  
  isCategorySelected(categoryId: string): boolean {
    return this.project?.categoryIds?.includes(categoryId) || false;
  }
  
  saveCategories(): void {
    if (!this.project) return;
    
    this.projectService.updateProject(this.project)
      .pipe(takeUntil(this.destroy$))
      .subscribe(project => {
        this.project = project;
        this.updateProjectCategories();
        this.editingCategories = false;
      });
  }
  
  cancelEditCategories(): void {
    // Palauta alkuperäinen projekti-objekti
    if (this.projectId) {
      this.projectService.getProjectById(this.projectId)
        .pipe(takeUntil(this.destroy$))
        .subscribe(project => {
          this.project = project;
          this.editingCategories = false;
        });
    } else {
      this.editingCategories = false;
    }
  }
} 