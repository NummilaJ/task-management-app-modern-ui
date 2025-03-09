import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { TaskService } from '../../services/task.service';
import { CategoryService } from '../../services/category.service';
import { AuthService } from '../../services/auth.service';
import { ProjectService } from '../../services/project.service';
import { Task, TaskState, TaskPriority } from '../../models/task.model';
import { Category } from '../../models/category.model';
import { Project } from '../../models/project.model';
import { User } from '../../models/user.model';
import { TaskModalComponent } from '../task-modal/task-modal.component';
import { ConfirmModalComponent } from '../confirm-modal/confirm-modal.component';
import { TaskFiltersComponent, FilterOptions } from '../shared/task-filters/task-filters.component';
import { Observable, Subscription } from 'rxjs';
import { LanguageService } from '../../services/language.service';
import { ProjectContextService } from '../../services/project-context.service';

@Component({
  selector: 'app-task-view',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TaskModalComponent, ConfirmModalComponent, TaskFiltersComponent],
  template: `
    <div class="space-y-6">
      <!-- Hakupalkki ja suodattimet -->
      <div class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white">{{ translate('tasks') }}</h2>
          <div class="flex items-center gap-2">
            <a routerLink="/kanban" 
               class="btn-secondary flex items-center gap-2 mr-2 transform hover:scale-105">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>
              </svg>
              {{ translate('kanban') }}
            </a>
            <a routerLink="/create" 
               class="btn-primary flex items-center gap-2 transform hover:scale-105">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
              </svg>
              {{ translate('newTask') }}
            </a>
          </div>
        </div>

        <app-task-filters
          [categories]="categories"
          [projects]="projects"
          [taskStates]="taskStates"
          [taskPriorities]="taskPriorities"
          [selectedState]="selectedStates"
          [selectedPriority]="selectedPriorities"
          [selectedCategory]="selectedCategory"
          [selectedProject]="selectedProject"
          [selectedAssigneeFilter]="selectedAssigneeFilter"
          [sortBy]="sortBy"
          [sortDirection]="sortDirection"
          [showProjectFilter]="false"
          (filtersChanged)="handleFiltersChanged($event)">
        </app-task-filters>
      </div>

      <!-- Tehtävätaulukko -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th *ngFor="let header of tableHeaders"
                  class="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-200 transition-colors duration-200"
                  [class.text-right]="header.value === 'actions'"
                  (click)="setSorting(header.value)">
                <div class="flex items-center" [class.justify-end]="header.value === 'actions'">
                  <span>{{header.label}}</span>
                  <svg *ngIf="sortBy === header.value" 
                       class="w-4 h-4" 
                       [class.transform]="!sortDirection" 
                       [class.rotate-180]="!sortDirection"
                       fill="none" 
                       stroke="currentColor" 
                       viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </div>
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr *ngFor="let task of paginatedTasks"
                class="hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors duration-200"
                (click)="openTaskModal(task)">
              <td class="px-6 py-4">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-10 w-10">
                    <div class="h-full w-full rounded-full bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 flex items-center justify-center">
                      <span class="text-sm font-medium text-blue-600 dark:text-blue-200">{{task.progress}}%</span>
                    </div>
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900 dark:text-white">
                      {{task.title}}
                    </div>
                    <div class="text-sm text-gray-500 dark:text-gray-400">
                      {{task.description | slice:0:50}}{{task.description.length > 50 ? '...' : ''}}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="badge" [ngClass]="{
                  'badge-high': task.priority === 'HIGH',
                  'badge-medium': task.priority === 'MEDIUM',
                  'badge-low': task.priority === 'LOW'
                }">{{task.priority}}</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="badge" [ngClass]="{
                  'status-badge-done': task.state === TaskState.DONE,
                  'status-badge-in-progress': task.state === TaskState.IN_PROGRESS,
                  'status-badge-todo': task.state === TaskState.TO_DO
                }">{{task.state}}</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center space-x-2">
                  <ng-container *ngIf="task.category">
                    <div *ngIf="getCategoryById(task.category) as category"
                         [style.backgroundColor]="category.color"
                         class="w-3 h-3 rounded-full"></div>
                    <span class="text-sm text-gray-900 dark:text-white">
                      {{getCategoryById(task.category)?.name}}
                    </span>
                  </ng-container>
                  <span *ngIf="!task.category" class="text-sm text-gray-500">
                    {{ translate('noCategory') }}
                  </span>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center space-x-2">
                  <ng-container *ngIf="task.projectId">
                    <div *ngIf="getProjectById(task.projectId) as project"
                         [style.backgroundColor]="project.color"
                         class="w-3 h-3 rounded-full"></div>
                    <span class="text-sm text-gray-900 dark:text-white">
                      {{getProjectById(task.projectId)?.name}}
                    </span>
                  </ng-container>
                  <span *ngIf="!task.projectId" class="text-sm text-gray-500">
                    {{ translate('noProject') }}
                  </span>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                <div class="flex items-center space-x-2">
                  <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                  <span>{{getUserName(task.assignee) || translate('notAssigned')}}</span>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {{task.progress}}%
              </td>
              
              <!-- Scheduled Date sarake -->
              <td class="px-6 py-4 whitespace-nowrap">
                <div *ngIf="task.scheduledDate" class="text-sm text-gray-700 dark:text-gray-300 flex items-center space-x-1">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                  <span>{{task.scheduledDate | date:'dd.MM.yyyy'}}</span>
                </div>
                <span *ngIf="!task.scheduledDate" class="text-sm text-gray-500 dark:text-gray-400">-</span>
              </td>
              
              <!-- Deadline sarake -->
              <td class="px-6 py-4 whitespace-nowrap">
                <div *ngIf="task.deadline" class="text-sm text-red-500 dark:text-red-400 flex items-center space-x-1">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                  <span>{{task.deadline | date:'dd.MM.yyyy'}}</span>
                </div>
                <span *ngIf="!task.deadline" class="text-sm text-gray-500 dark:text-gray-400">-</span>
              </td>
              
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {{task.createdAt | date:'d.M.yyyy HH:mm'}}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right">
                <div class="flex items-center justify-end space-x-2">
                  <div class="flex space-x-1">
                    <button (click)="setTaskState(task, TaskState.TO_DO); $event.stopPropagation()"
                            title="{{ translate('setAsToDo') }}"
                            [ngClass]="{'text-yellow-600 dark:text-yellow-400': task.state === TaskState.TO_DO, 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300': task.state !== TaskState.TO_DO}"
                            class="btn-icon btn-ghost p-1">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                      </svg>
                    </button>
                    <button (click)="setTaskState(task, TaskState.IN_PROGRESS); $event.stopPropagation()"
                            title="{{ translate('setAsInProgress') }}"
                            [ngClass]="{'text-blue-600 dark:text-blue-400': task.state === TaskState.IN_PROGRESS, 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300': task.state !== TaskState.IN_PROGRESS}"
                            class="btn-icon btn-ghost p-1">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    </button>
                    <button (click)="setTaskState(task, TaskState.DONE); $event.stopPropagation()"
                            title="{{ translate('setAsDone') }}"
                            [ngClass]="{'text-green-600 dark:text-green-400': task.state === TaskState.DONE, 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300': task.state !== TaskState.DONE}"
                            class="btn-icon btn-ghost p-1">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    </button>
                  </div>
                  <button (click)="deleteTask(task); $event.stopPropagation()"
                          title="{{ translate('deleteTask') }}"
                          class="btn-icon btn-ghost p-1 text-red-500 hover:text-red-700">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Sivutuksen kontrollit -->
      <div class="flex items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg">
        <div class="flex items-center space-x-2">
          <button (click)="previousPage()"
                  [disabled]="currentPage === 1"
                  class="btn-secondary btn-sm">
            {{ translate('previous') }}
          </button>
          <div class="flex items-center space-x-1">
            <button *ngFor="let page of getPageNumbers()"
                    (click)="goToPage(page)"
                    [class]="currentPage === page ? 'btn-primary btn-sm' : 'btn-light btn-sm'">
              {{page}}
            </button>
          </div>
          <button (click)="nextPage()"
                  [disabled]="currentPage === totalPages"
                  class="btn-secondary btn-sm">
            {{ translate('next') }}
          </button>
        </div>
        <div class="flex items-center space-x-3">
          <div class="flex items-center space-x-2">
            <label for="items-per-page" class="text-sm text-gray-600 dark:text-gray-300">
              {{ translate('itemsPerPage') }}:
            </label>
            <select 
              id="items-per-page" 
              class="form-select text-sm rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:ring-blue-500 focus:border-blue-500"
              [(ngModel)]="itemsPerPage"
              (change)="changeItemsPerPage()">
              <option *ngFor="let option of itemsPerPageOptions" [value]="option">{{ option }}</option>
            </select>
          </div>
          <div class="text-sm text-gray-500 dark:text-gray-400">
            {{ translate('showing') }} {{startIndex + 1}}-{{min(endIndex, filteredTasks.length)}} {{ translate('of') }} {{filteredTasks.length}} {{ translate('tasks') }}
          </div>
        </div>
      </div>
    </div>

    <!-- Tehtävän muokkausmodaali -->
    <app-task-modal
      [task]="selectedTask"
      [isOpen]="isModalOpen"
      [categories]="categories"
      (close)="closeTaskModal()"
      (save)="saveTaskChanges($event)">
    </app-task-modal>

    <!-- Vahvistusmodaali -->
    <app-confirm-modal
      [isOpen]="isConfirmModalOpen"
      [title]="translate('deleteTask')"
      [message]="translate('deleteTaskConfirmation')"
      (confirm)="confirmDelete()"
      (cancel)="cancelDelete()">
    </app-confirm-modal>
  `,
  styles: [`
    .input-field {
      @apply px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200;
    }

    .badge {
      @apply px-2 py-1 text-xs font-medium rounded-full;
    }

    .badge-high {
      @apply bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200;
    }

    .badge-medium {
      @apply bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200;
    }

    .badge-low {
      @apply bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200;
    }

    .status-badge-done {
      @apply bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200;
    }

    .status-badge-in-progress {
      @apply bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200;
    }

    .status-badge-todo {
      @apply bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200;
    }
  `]
})
export class TaskViewComponent implements OnInit, OnDestroy {
  tasks: Task[] = [];
  filteredTasks: Task[] = [];
  paginatedTasks: Task[] = [];
  categories: Category[] = [];
  users: User[] = [];
  selectedTask: Task | null = null;
  isModalOpen = false;
  isConfirmModalOpen = false;
  taskToDelete: Task | null = null;
  currentUser: User | null = null;
  projects: Project[] = [];
  selectedProject: string | null = null;

  sortBy = 'createdAt';
  sortDirection = true; // true = nouseva, false = laskeva
  selectedStates: TaskState[] = [];
  selectedPriorities: TaskPriority[] = [];
  selectedCategory: string | null = null;
  selectedAssigneeFilter: string | null = null;

  currentPage = 1;
  itemsPerPage = 20;
  totalPages = 1;
  startIndex = 0;
  endIndex = 0;
  itemsPerPageOptions = [10, 20, 50];

  taskStates = Object.values(TaskState);
  taskPriorities = Object.values(TaskPriority);
  tableHeaders = [
    { label: 'Title', value: 'title' },
    { label: 'Priority', value: 'priority' },
    { label: 'Status', value: 'state' },
    { label: 'Category', value: 'category' },
    { label: 'Project', value: 'project' },
    { label: 'Assignee', value: 'assignee' },
    { label: 'Progress', value: 'progress' },
    { label: 'Scheduled', value: 'scheduledDate' },
    { label: 'Deadline', value: 'deadline' },
    { label: 'Created', value: 'createdAt' },
    { label: 'Actions', value: 'actions' }
  ];

  TaskState = TaskState;
  
  private languageSubscription: Subscription | null = null;
  
  constructor(
    private taskService: TaskService,
    private categoryService: CategoryService,
    private authService: AuthService,
    private projectService: ProjectService,
    private languageService: LanguageService,
    private projectContextService: ProjectContextService,
    private route: ActivatedRoute
  ) {}
  
  ngOnInit() {
    this.loadTasks();
    this.loadCategories();
    this.loadUsers();
    this.loadProjects();
    this.getCurrentUser();
    
    // Tilataan aktiivinen projekti
    this.projectContextService.activeProject$.subscribe(project => {
      if (project) {
        // Jos aktiivinen projekti vaihtuu, päivitetään projektisuodatin
        this.selectedProject = project.id;
      } else {
        // Jos aktiivinen projekti tyhjennetään, näytetään kaikki tehtävät
        this.selectedProject = null;
      }
      
      // Päivitä suodattimet ja tehtävät
      this.applyFilters();
    });
    
    this.languageSubscription = this.languageService.currentLanguage$.subscribe(() => {
      // Päivitä näkymä kun kieli vaihtuu
    });
  }
  
  ngOnDestroy() {
    if (this.languageSubscription) {
      this.languageSubscription.unsubscribe();
    }
  }
  
  translate(key: string): string {
    return this.languageService.translate(key);
  }

  loadTasks() {
    this.taskService.getTasks().subscribe(tasks => {
      this.tasks = tasks;
      this.applyFilters();
    });
  }

  loadCategories() {
    this.categoryService.getCategories().subscribe(categories => {
      this.categories = categories;
    });
  }

  loadUsers() {
    this.authService.getAllUsers().subscribe(users => {
      this.users = users;
    });
  }

  getCurrentUser() {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  loadProjects() {
    this.projectService.getProjects().subscribe(projects => {
      this.projects = projects;
    });
  }

  applyFilters() {
    let filtered = [...this.tasks];

    // Suodatus tilan mukaan
    if (this.selectedStates.length > 0) {
      filtered = filtered.filter(task => this.selectedStates.includes(task.state));
    }

    // Suodatus prioriteetin mukaan
    if (this.selectedPriorities.length > 0) {
      filtered = filtered.filter(task => this.selectedPriorities.includes(task.priority));
    }

    // Suodatus kategorian mukaan
    if (this.selectedCategory) {
      filtered = filtered.filter(task => task.category === this.selectedCategory);
    }
    
    // Suodatus projektin mukaan
    if (this.selectedProject) {
      filtered = filtered.filter(task => task.projectId === this.selectedProject);
    }
    // Huom: Kun selectedProject === null, näytetään kaikki tehtävät, mitään suodatusta ei tehdä projektin perusteella

    // Suodatus käyttäjän tehtävien mukaan
    if (this.selectedAssigneeFilter && this.currentUser) {
      if (this.selectedAssigneeFilter === 'assigned') {
        filtered = filtered.filter(task => task.assignee === this.currentUser?.id);
      } else if (this.selectedAssigneeFilter === 'created') {
        filtered = filtered.filter(task => task.createdBy === this.currentUser?.id);
      }
    }

    // Järjestäminen
    filtered = this.sortTasks(filtered);

    this.filteredTasks = filtered;
    this.updatePagination();
  }

  updatePagination() {
    this.totalPages = Math.ceil(this.filteredTasks.length / this.itemsPerPage);
    this.currentPage = Math.max(1, Math.min(this.currentPage, this.totalPages));
    this.startIndex = (this.currentPage - 1) * this.itemsPerPage;
    this.endIndex = this.startIndex + this.itemsPerPage;
    this.paginatedTasks = this.filteredTasks.slice(this.startIndex, this.endIndex);
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(this.totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  goToPage(page: number) {
    this.currentPage = page;
    this.updatePagination();
  }

  setSorting(value: string) {
    if (this.sortBy === value) {
      this.sortDirection = !this.sortDirection;
    } else {
      this.sortBy = value;
      this.sortDirection = true;
    }
    this.applyFilters();
  }

  getCategoryById(categoryId: string | null): Category | undefined {
    return this.categories.find(category => category.id === categoryId);
  }

  getUserName(userId: string | null): string | null {
    if (!userId) return null;
    const user = this.users.find(u => u.id === userId);
    return user ? user.username : null;
  }

  openTaskModal(task: Task) {
    this.selectedTask = { ...task };
    this.isModalOpen = true;
  }

  closeTaskModal() {
    this.selectedTask = null;
    this.isModalOpen = false;
  }

  saveTaskChanges(updatedTask: Task) {
    // Varmistetaan, että käytämme syvää kopiota tehtävästä
    const taskCopy = JSON.parse(JSON.stringify(updatedTask));
    this.taskService.updateTask(taskCopy).subscribe(() => {
      this.loadTasks();
      this.closeTaskModal();
    });
  }

  deleteTask(task: Task) {
    this.taskToDelete = task;
    this.isConfirmModalOpen = true;
  }

  confirmDelete() {
    if (this.taskToDelete) {
      this.taskService.deleteTask(this.taskToDelete.id);
      this.loadTasks();
      this.isConfirmModalOpen = false;
      this.taskToDelete = null;
    }
  }

  cancelDelete() {
    this.isConfirmModalOpen = false;
    this.taskToDelete = null;
  }

  setTaskState(task: Task, newState: TaskState) {
    if (task.state === newState) return; // Ei tehdä mitään jos tila on jo sama
    
    // Käytetään updateTaskState-metodia, joka on suunniteltu erityisesti
    // tehtävän tilan päivittämiseen. Tämä estää tehtävien sekoittumisen.
    this.taskService.updateTaskState(task.id, newState).subscribe(() => {
      this.loadTasks();
    });
  }

  min(a: number, b: number): number {
    return Math.min(a, b);
  }

  sortTasks(tasks: Task[]): Task[] {
    return tasks.sort((a, b) => {
      let comparison = 0;
      switch (this.sortBy) {
        case 'createdAt':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'priority':
          const priorityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };
          comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'progress':
          comparison = a.progress - b.progress;
          break;
      }
      return this.sortDirection ? comparison : -comparison;
    });
  }

  handleFiltersChanged(filters: FilterOptions) {
    this.selectedStates = filters.state || [];
    this.selectedPriorities = filters.priority || [];
    this.selectedCategory = filters.category !== undefined ? filters.category : null;
    this.selectedAssigneeFilter = filters.assigneeFilter !== undefined ? filters.assigneeFilter : null;
    this.sortBy = filters.sortBy || this.sortBy;
    this.sortDirection = filters.sortDirection !== undefined ? filters.sortDirection : this.sortDirection;
    
    this.applyFilters();
  }

  getProjectById(projectId: string | null): Project | undefined {
    if (!projectId) return undefined;
    return this.projects.find(p => p.id === projectId);
  }

  getProjectName(projectId: string | null): string {
    const project = this.getProjectById(projectId);
    return project ? project.name : 'Ei projektia';
  }

  changeItemsPerPage() {
    this.currentPage = 1; // Palautetaan ensimmäiselle sivulle kun vaihdetaan määrää
    this.updatePagination();
  }
} 