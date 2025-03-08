import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
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
import { LanguageService } from '../../services/language.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="space-y-6">
      <!-- Tehtävänluontiosio - näytetään vain jos hideTaskForm on false -->
      <div *ngIf="!hideTaskForm">
        <div class="flex justify-between items-center mb-8">
          <div>
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white">{{ translate('addTask') }}</h2>
            <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">{{ translate('addTaskDescription') }}</p>
          </div>
          <a routerLink="/tasks" 
             class="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
            </svg>
            {{ translate('viewAllTasks') }}
          </a>
        </div>

        <!-- Add Task Form -->
        <form (ngSubmit)="createTask()" class="space-y-6 mb-8">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Title -->
            <div class="col-span-2">
              <label for="title" class="block text-sm font-medium text-gray-700 dark:text-gray-300">{{ translate('title') }}</label>
              <input type="text" id="title" name="title" [(ngModel)]="newTask.title" 
                     class="mt-1 block w-full h-12 px-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
                     placeholder="{{ translate('enterTaskTitle') }}" required>
            </div>

            <!-- Description -->
            <div class="col-span-2">
              <label for="description" class="block text-sm font-medium text-gray-700 dark:text-gray-300">{{ translate('description') }}</label>
              <textarea id="description" name="description" [(ngModel)]="newTask.description"
                        class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        placeholder="{{ translate('enterTaskDescription') }}" rows="3"></textarea>
            </div>

            <!-- Assignee -->
            <div>
              <label for="assignee" class="block text-sm font-medium text-gray-700 dark:text-gray-300">{{ translate('assignee') }}</label>
              <select id="assignee" name="assignee" [(ngModel)]="newTask.assignee"
                      class="mt-1 block w-full h-12 px-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all">
                <option [ngValue]="null">{{ translate('notAssigned') }}</option>
                <option *ngFor="let user of users" [ngValue]="user.id">{{user.username}}</option>
              </select>
            </div>

            <!-- Priority -->
            <div class="col-span-1">
              <label for="priority" class="block text-sm font-medium text-gray-700 dark:text-gray-300">{{ translate('priority') }}</label>
              <select id="priority" name="priority" [(ngModel)]="newTask.priority"
                      class="mt-1 block w-full h-12 px-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all">
                <option *ngFor="let priority of taskPriorities" [value]="priority">{{ priority }}</option>
              </select>
            </div>

            <!-- Category -->
            <div class="col-span-1">
              <label for="category" class="block text-sm font-medium text-gray-700 dark:text-gray-300">{{ translate('category') }}</label>
              <select id="category" name="category" [(ngModel)]="newTask.category"
                      class="mt-1 block w-full h-12 px-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all">
                <option [value]="null">{{ translate('noCategory') }}</option>
                <option *ngFor="let category of categories" [value]="category.id">{{ category.name }}</option>
              </select>
            </div>
            
            <!-- Project -->
            <div class="col-span-1">
              <label for="project" class="block text-sm font-medium text-gray-700 dark:text-gray-300">{{ translate('project') }}</label>
              <select id="project" name="project" [(ngModel)]="newTask.projectId"
                      class="mt-1 block w-full h-12 px-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all">
                <option [value]="null">{{ translate('noProject') }}</option>
                <option *ngFor="let project of projects" [value]="project.id">{{ project.name }}</option>
              </select>
            </div>
            
            <!-- Scheduled Date -->
            <div class="col-span-1">
              <label for="scheduledDate" class="block text-sm font-medium text-gray-700 dark:text-gray-300">{{ translate('scheduledDate') }}</label>
              <input type="date" id="scheduledDate" name="scheduledDate" [(ngModel)]="scheduledDate" 
                     class="mt-1 block w-full h-12 px-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
                     placeholder="{{ translate('setScheduledDate') }}">
            </div>
            
            <!-- Deadline -->
            <div class="col-span-1">
              <label for="deadline" class="block text-sm font-medium text-gray-700 dark:text-gray-300">{{ translate('deadline') }}</label>
              <input type="date" id="deadline" name="deadline" [(ngModel)]="deadlineDate" 
                     class="mt-1 block w-full h-12 px-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
                     placeholder="{{ translate('setDeadline') }}">
            </div>

            <!-- Submit -->
            <div class="col-span-2">
              <button type="submit" [disabled]="!newTask.title"
                      class="w-full inline-flex justify-center py-3 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed">
                {{ translate('createTask') }}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`    .input-field {
      @apply px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200;
    }
  `]
})
export class TaskListComponent implements OnInit, OnDestroy {
  @Input() tasks: Task[] = [];
  @Input() showProjectColumn: boolean = true;
  @Input() hideTaskForm: boolean = false;
  @Output() taskChanged = new EventEmitter<void>();
  
  categories: Category[] = [];
  users: User[] = [];
  projects: Project[] = [];
  taskPriorities = Object.values(TaskPriority);
  private languageSubscription: Subscription | null = null;
  
  // Aikataulutusta varten
  deadlineDate: string | null = null;
  scheduledDate: string | null = null;

  newTask: Task = {
    id: '',
    title: '',
    description: '',
    assignee: null,
    priority: TaskPriority.MEDIUM,
    category: null,
    projectId: null,
    createdAt: new Date(),
    createdBy: null,
    deadline: null,
    scheduledDate: null,
    subtasks: [],
    comments: [],
    progress: 0,
    state: TaskState.TO_DO
  };

  currentUser: User | null = null;

  constructor(
    private taskService: TaskService,
    private categoryService: CategoryService,
    private authService: AuthService,
    private projectService: ProjectService,
    private languageService: LanguageService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.loadCategories();
    this.loadUsers();
    this.loadProjects();
    this.getCurrentUser();
    
    // Tarkistetaan onko query-parametreissa määritelty projekti
    this.route.queryParams.subscribe(params => {
      const projectId = params['projectId'];
      if (projectId) {
        this.newTask.projectId = projectId;
      }
    });
    
    this.languageSubscription = this.languageService.currentLanguage$.subscribe(() => {
      // Komponentti päivittyy automaattisesti kun kieli vaihtuu
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
  
  getProjectName(projectId: string | null): string {
    if (!projectId) return this.translate('noProject');
    const project = this.projects.find(p => p.id === projectId);
    return project ? project.name : this.translate('noProject');
  }

  createTask() {
    if (this.newTask.title && this.newTask.priority) {
      // Asetetaan tehtävän luoja
      this.newTask.createdBy = this.currentUser?.id || null;
      
      // Päivitetään deadline ja scheduledDate päivämäärät
      if (this.deadlineDate) {
        this.newTask.deadline = new Date(this.deadlineDate);
      } else {
        this.newTask.deadline = null;
      }
      
      if (this.scheduledDate) {
        this.newTask.scheduledDate = new Date(this.scheduledDate);
      } else {
        this.newTask.scheduledDate = null;
      }
      
      this.taskService.addTask(this.newTask);
      this.resetForm();
    }
  }

  resetForm() {
    this.newTask = {
      id: '',
      title: '',
      description: '',
      assignee: null,
      state: TaskState.TO_DO,
      priority: TaskPriority.MEDIUM,
      category: null,
      projectId: null,
      createdAt: new Date(),
      createdBy: null,
      deadline: null,
      scheduledDate: null,
      subtasks: [],
      comments: [],
      progress: 0
    };
    
    // Nollataan myös päivämääräkentät
    this.deadlineDate = null;
    this.scheduledDate = null;
  }
} 
