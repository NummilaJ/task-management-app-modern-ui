import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil, Subscription } from 'rxjs';
import { ProjectService } from '../../services/project.service';
import { Project } from '../../models/project.model';
import { LanguageService } from '../../services/language.service';
import { ConfirmModalComponent } from '../confirm-modal/confirm-modal.component';
import { CategoryService } from '../../services/category.service';
import { Category } from '../../models/category.model';
import { ToastService } from '../../services/toast.service';

// Laajennettu rajapinta kategoriavalinnoille
interface CategoryWithSelected extends Category {
  selected: boolean;
}

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
             class="bg-gray-50 dark:bg-gray-700 rounded-lg p-5 mb-6 border border-blue-200 dark:border-blue-800 shadow-lg">
          <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-4">{{ translate('createNewProject') }}</h3>
          
          <div class="mb-4">
            <label for="projectName" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {{ translate('projectName') }} *
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
          
          <!-- Värin valinta -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {{ translate('projectColor') }}
            </label>
            <div class="flex flex-wrap gap-2">
              <div 
                *ngFor="let color of availableColors" 
                class="w-8 h-8 rounded-full cursor-pointer border-2 transition-all duration-200"
                [style.backgroundColor]="color"
                [style.borderColor]="selectedColor === color ? 'white' : color"
                [class.ring-2]="selectedColor === color"
                [class.ring-blue-500]="selectedColor === color"
                [class.ring-offset-2]="selectedColor === color"
                (click)="selectedColor = color">
              </div>
              <div 
                class="w-8 h-8 rounded-full cursor-pointer border-2 border-dashed border-gray-400 flex items-center justify-center text-gray-500 dark:text-gray-400"
                [class.ring-2]="selectedColor === null"
                [class.ring-blue-500]="selectedColor === null"
                (click)="selectedColor = null">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
              </div>
            </div>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {{ selectedColor ? translate('colorSelected') : translate('colorRandom') }}
            </p>
          </div>
          
          <!-- Projektikohtaiset kategoriat -->
          <div class="mb-5 p-4 border border-blue-100 dark:border-blue-900 rounded-lg bg-blue-50 dark:bg-blue-900/20">
            <label class="block text-base font-semibold text-blue-800 dark:text-blue-300 mb-2">
              {{ translate('projectCategories') }}
            </label>
            <p class="text-sm text-blue-700 dark:text-blue-400 mb-3">
              {{ translate('projectCategoriesHelp') }}
            </p>
            
            <div class="max-h-48 overflow-y-auto p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800">
              <div *ngFor="let category of categoriesWithSelected" class="flex items-center mb-2">
                <input type="checkbox" 
                       [id]="'category-' + category.id" 
                       [value]="category.id" 
                       [(ngModel)]="category.selected"
                       class="mr-2 h-4 w-4">
                <label [for]="'category-' + category.id" class="flex items-center cursor-pointer">
                  <div [style.backgroundColor]="category.color" class="w-4 h-4 rounded-full mr-2"></div>
                  <span>{{ category.name }}</span>
                </label>
              </div>
              <div *ngIf="categoriesWithSelected.length === 0" class="text-gray-500 dark:text-gray-400 text-sm py-2">
                {{ translate('noCategories') }}
              </div>
            </div>
          </div>
          
          <!-- Aloituspäivämäärä -->
          <div class="mb-4">
            <label for="startDate" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {{ translate('startDate') }}
            </label>
            <input type="date" 
                   id="startDate" 
                   [(ngModel)]="startDateInput" 
                   class="w-full p-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white" />
          </div>
          
          <!-- Määräaika -->
          <div class="mb-4">
            <label for="deadline" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {{ translate('deadline') }}
            </label>
            <input type="date" 
                   id="deadline" 
                   [(ngModel)]="deadlineInput" 
                   class="w-full p-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white" />
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
              
              <p *ngIf="project.description" class="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                {{ project.description }}
              </p>
              
              <!-- Päivämäärätiedot -->
              <div class="mt-auto space-y-1 pt-2">
                <div *ngIf="project.startDate" class="flex items-center text-xs text-gray-500 dark:text-gray-400">
                  <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                  <span>{{ translate('startDate') }}: {{ project.startDate | date:'dd.MM.yyyy' }}</span>
                </div>
                
                <div *ngIf="project.deadline" class="flex items-center text-xs text-red-500 dark:text-red-400">
                  <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                  <span>{{ translate('deadline') }}: {{ project.deadline | date:'dd.MM.yyyy' }}</span>
                </div>
              </div>
              
              <div class="mt-3 pt-2 border-t border-gray-200 dark:border-gray-600 flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>{{ project.taskIds.length || 0 }} {{ translate('tasks') }}</span>
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
  newProject: Partial<Project> = {};
  isCreatingProject = false;
  selectedProjectId: string | null = null;
  isConfirmModalOpen = false;
  projectToDelete: string | null = null;
  
  // Kategoriat
  categories: Category[] = [];
  categoriesWithSelected: CategoryWithSelected[] = [];
  selectedCategories: string[] = [];
  
  // Päivämääräkentät
  startDateInput: string | null = null;
  deadlineInput: string | null = null;

  // Väripaletti projektille
  availableColors: string[] = [
    '#FF5252', '#FF4081', '#E040FB', '#7C4DFF', 
    '#536DFE', '#448AFF', '#40C4FF', '#18FFFF', 
    '#64FFDA', '#69F0AE', '#B2FF59', '#EEFF41', 
    '#FFFF00', '#FFD740', '#FFAB40', '#FF6E40'
  ];
  selectedColor: string | null = null;

  private destroy$ = new Subject<void>();
  private languageSubscription: Subscription | null = null;

  constructor(
    private projectService: ProjectService,
    private router: Router,
    private languageService: LanguageService,
    private categoryService: CategoryService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadProjects();
    this.loadCategories();
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

  loadCategories(): void {
    this.categoryService.getCategories()
      .pipe(takeUntil(this.destroy$))
      .subscribe(categories => {
        this.categories = categories;
        // Muunnetaan kategoriat laajennettuun muotoon
        this.categoriesWithSelected = categories.map(cat => ({
          ...cat,
          selected: false
        }));
      });
  }

  startCreatingProject(): void {
    this.newProject = {
      name: '',
      description: '',
      taskIds: []
    };
    // Reset kategoriavalinnat
    this.categoriesWithSelected.forEach(cat => cat.selected = false);
    this.startDateInput = null;
    this.deadlineInput = null;
    this.selectedColor = null; // Reset värinvalinta
    this.isCreatingProject = true;
  }

  cancelCreatingProject(): void {
    this.isCreatingProject = false;
    this.newProject = {};
    this.startDateInput = null;
    this.deadlineInput = null;
    this.selectedColor = null; // Reset värinvalinta
  }

  createProject(): void {
    if (!this.newProject.name) return;
    
    // Kerää valitut kategoriat
    const selectedCategoryIds = this.categoriesWithSelected
      .filter(cat => cat.selected)
      .map(cat => cat.id);
    
    // Varmista, että kategoria-ID:t ovat määritelty vain jos niitä on valittu
    const categoryIds = selectedCategoryIds.length > 0 ? selectedCategoryIds : undefined;
    
    // Kopioi ensin uusi projekti olioon
    const projectData: Partial<Project> = {
      ...this.newProject,
      taskIds: []
    };
    
    // Lisää kategoriat erikseen
    if (selectedCategoryIds.length > 0) {
      projectData.categoryIds = selectedCategoryIds;
    }
    
    // Aseta päivämäärät jos annettu
    if (this.startDateInput) {
      projectData.startDate = new Date(this.startDateInput);
    }
    
    if (this.deadlineInput) {
      projectData.deadline = new Date(this.deadlineInput);
    }

    // Aseta väri jos valittu
    if (this.selectedColor) {
      projectData.color = this.selectedColor;
    }
    
    // Luo projekti
    this.projectService.addProject(projectData)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.isCreatingProject = false;
        this.selectedColor = null; // Reset värinvalinta
        this.loadProjects();
        this.toastService.success('projectCreatedSuccess');
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
        .subscribe(() => {
          this.loadProjects();
          this.toastService.success('projectDeletedSuccess');
        });
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