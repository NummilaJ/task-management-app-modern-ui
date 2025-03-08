import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DragDropModule, CdkDragDrop, transferArrayItem } from '@angular/cdk/drag-drop';
import { TaskService } from '../../services/task.service';
import { CategoryService } from '../../services/category.service';
import { AuthService } from '../../services/auth.service';
import { Task, TaskState, TaskPriority } from '../../models/task.model';
import { Category } from '../../models/category.model';
import { User } from '../../models/user.model';
import { TaskModalComponent } from '../task-modal/task-modal.component';
import { TaskFiltersComponent, FilterOptions } from '../shared/task-filters/task-filters.component';
import { RouterModule } from '@angular/router';
import { LanguageService } from '../../services/language.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-kanban-view',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    DragDropModule, 
    TaskModalComponent, 
    RouterModule,
    TaskFiltersComponent
  ],
  template: `
    <div class="space-y-6">
      <!-- Otsikko ja suodattimet -->
      <div class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white">{{ translate('kanbanBoard') }}</h2>
          <div class="flex items-center gap-2">
            <a routerLink="/tasks" 
               class="btn-secondary flex items-center gap-2 transform hover:scale-105 mr-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path>
              </svg>
              {{ translate('tableView') }}
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
        
        <!-- Suodattimet -->
        <app-task-filters
          [showStateFilter]="false"
          [categories]="categories"
          [taskPriorities]="taskPriorities"
          [selectedPriority]="selectedPriority ? [selectedPriority] : []"
          [selectedCategory]="selectedCategory"
          [selectedAssigneeFilter]="selectedAssigneeFilter"
          [sortBy]="'createdAt'"
          [sortDirection]="true"
          (filtersChanged)="handleFiltersChanged($event)">
        </app-task-filters>
      </div>
      
      <!-- Kanban Board -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- To Do Column -->
        <div class="kanban-column bg-white dark:bg-gray-800 rounded-xl shadow-lg">
          <div class="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-t-xl border-b border-yellow-100 dark:border-yellow-900/30">
            <div class="flex justify-between items-center">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <svg class="w-5 h-5 mr-2 text-yellow-500 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                </svg>
                {{ translate('toDo') }}
              </h3>
              <span class="px-2.5 py-0.5 rounded-full bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200 text-sm font-medium">
                {{todoTasks.length}}
              </span>
            </div>
          </div>
          
          <div class="p-4 min-h-[50vh] max-h-[70vh] overflow-y-auto" 
               cdkDropList
               #todoList="cdkDropList"
               [cdkDropListData]="todoTasks"
               [cdkDropListConnectedTo]="[progressList, doneList]"
               (cdkDropListDropped)="drop($event, TaskState.TO_DO)"
               [id]="'todo'"
               [cdkDropListEnterPredicate]="canEnterList">
            <div *ngFor="let task of todoTasks" 
                 cdkDrag 
                 [cdkDragData]="task"
                 class="kanban-task p-4 mb-3 bg-white dark:bg-gray-700 rounded-lg shadow-md hover:shadow-lg cursor-move transition-all duration-200 border-l-4 border-yellow-400"
                 (click)="openTaskModal(task)">
              <div class="flex justify-between mb-2">
                <h4 class="font-medium text-gray-900 dark:text-white">{{task.title}}</h4>
                <div class="badge" [ngClass]="{
                  'badge-high': task.priority === TaskPriority.HIGH,
                  'badge-medium': task.priority === TaskPriority.MEDIUM,
                  'badge-low': task.priority === TaskPriority.LOW
                }">{{task.priority}}</div>
              </div>
              <p class="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">
                {{task.description}}
              </p>
              <div class="flex justify-between items-center">
                <div class="flex items-center space-x-2">
                  <ng-container *ngIf="task.category">
                    <div *ngIf="getCategoryById(task.category) as category"
                         [style.backgroundColor]="category.color"
                         class="w-3 h-3 rounded-full"></div>
                    <span class="text-xs text-gray-600 dark:text-gray-400">
                      {{getCategoryById(task.category)?.name}}
                    </span>
                  </ng-container>
                </div>
                <div *ngIf="task.assignee" class="flex items-center text-xs text-gray-500 dark:text-gray-400">
                  <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                  {{getUserName(task.assignee)}}
                </div>
              </div>
              <div *ngIf="task.progress > 0" class="mt-2">
                <div class="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700">
                  <div class="bg-blue-600 h-1.5 rounded-full" [style.width]="task.progress + '%'"></div>
                </div>
              </div>
            </div>
            <div *ngIf="todoTasks.length === 0" class="flex flex-col items-center justify-center py-8 text-gray-400 dark:text-gray-500">
              <svg class="w-12 h-12 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" 
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
              </svg>
              <p>No tasks</p>
            </div>
          </div>
        </div>
        
        <!-- In Progress Column -->
        <div class="kanban-column bg-white dark:bg-gray-800 rounded-xl shadow-lg">
          <div class="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-t-xl border-b border-blue-100 dark:border-blue-900/30">
            <div class="flex justify-between items-center">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <svg class="w-5 h-5 mr-2 text-blue-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                {{ translate('inProgress') }}
              </h3>
              <span class="px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 text-sm font-medium">
                {{inProgressTasks.length}}
              </span>
            </div>
          </div>
          
          <div class="p-4 min-h-[50vh] max-h-[70vh] overflow-y-auto" 
               cdkDropList
               #progressList="cdkDropList"
               [cdkDropListData]="inProgressTasks"
               [cdkDropListConnectedTo]="[todoList, doneList]"
               (cdkDropListDropped)="drop($event, TaskState.IN_PROGRESS)"
               [id]="'inprogress'"
               [cdkDropListEnterPredicate]="canEnterList">
            <div *ngFor="let task of inProgressTasks" 
                 cdkDrag 
                 [cdkDragData]="task"
                 class="kanban-task p-4 mb-3 bg-white dark:bg-gray-700 rounded-lg shadow-md hover:shadow-lg cursor-move transition-all duration-200 border-l-4 border-blue-400"
                 (click)="openTaskModal(task)">
              <div class="flex justify-between mb-2">
                <h4 class="font-medium text-gray-900 dark:text-white">{{task.title}}</h4>
                <div class="badge" [ngClass]="{
                  'badge-high': task.priority === TaskPriority.HIGH,
                  'badge-medium': task.priority === TaskPriority.MEDIUM,
                  'badge-low': task.priority === TaskPriority.LOW
                }">{{task.priority}}</div>
              </div>
              <p class="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">
                {{task.description}}
              </p>
              <div class="flex justify-between items-center">
                <div class="flex items-center space-x-2">
                  <ng-container *ngIf="task.category">
                    <div *ngIf="getCategoryById(task.category) as category"
                         [style.backgroundColor]="category.color"
                         class="w-3 h-3 rounded-full"></div>
                    <span class="text-xs text-gray-600 dark:text-gray-400">
                      {{getCategoryById(task.category)?.name}}
                    </span>
                  </ng-container>
                </div>
                <div *ngIf="task.assignee" class="flex items-center text-xs text-gray-500 dark:text-gray-400">
                  <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                  {{getUserName(task.assignee)}}
                </div>
              </div>
              <div *ngIf="task.progress > 0" class="mt-2">
                <div class="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700">
                  <div class="bg-blue-600 h-1.5 rounded-full" [style.width]="task.progress + '%'"></div>
                </div>
              </div>
            </div>
            <div *ngIf="inProgressTasks.length === 0" class="flex flex-col items-center justify-center py-8 text-gray-400 dark:text-gray-500">
              <svg class="w-12 h-12 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" 
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <p>No tasks</p>
            </div>
          </div>
        </div>
        
        <!-- Done Column -->
        <div class="kanban-column bg-white dark:bg-gray-800 rounded-xl shadow-lg">
          <div class="p-4 bg-green-50 dark:bg-green-900/20 rounded-t-xl border-b border-green-100 dark:border-green-900/30">
            <div class="flex justify-between items-center">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <svg class="w-5 h-5 mr-2 text-green-500 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                {{ translate('done') }}
              </h3>
              <span class="px-2.5 py-0.5 rounded-full bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200 text-sm font-medium">
                {{doneTasks.length}}
              </span>
            </div>
          </div>
          
          <div class="p-4 min-h-[50vh] max-h-[70vh] overflow-y-auto" 
               cdkDropList
               #doneList="cdkDropList"
               [cdkDropListData]="doneTasks"
               [cdkDropListConnectedTo]="[todoList, progressList]"
               (cdkDropListDropped)="drop($event, TaskState.DONE)"
               [id]="'done'"
               [cdkDropListEnterPredicate]="canEnterList">
            <div *ngFor="let task of doneTasks" 
                 cdkDrag 
                 [cdkDragData]="task"
                 class="kanban-task p-4 mb-3 bg-white dark:bg-gray-700 rounded-lg shadow-md hover:shadow-lg cursor-move transition-all duration-200 border-l-4 border-green-400"
                 (click)="openTaskModal(task)">
              <div class="flex justify-between mb-2">
                <h4 class="font-medium text-gray-900 dark:text-white">{{task.title}}</h4>
                <div class="badge" [ngClass]="{
                  'badge-high': task.priority === TaskPriority.HIGH,
                  'badge-medium': task.priority === TaskPriority.MEDIUM,
                  'badge-low': task.priority === TaskPriority.LOW
                }">{{task.priority}}</div>
              </div>
              <p class="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">
                {{task.description}}
              </p>
              <div class="flex justify-between items-center">
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
                <div class="flex items-center">
                  <svg class="w-4 h-4 text-gray-400 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                  <span class="text-xs text-gray-500 dark:text-gray-400">
                    {{getUserName(task.assignee) || translate('notAssigned')}}
                  </span>
                </div>
              </div>
              <div *ngIf="task.progress > 0" class="mt-2">
                <div class="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700">
                  <div class="bg-blue-600 h-1.5 rounded-full" [style.width]="task.progress + '%'"></div>
                </div>
              </div>
            </div>
            <div *ngIf="doneTasks.length === 0" class="flex flex-col items-center justify-center py-8 text-gray-400 dark:text-gray-500">
              <svg class="w-12 h-12 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" 
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <p>No tasks</p>
            </div>
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
  `,
  styles: [`
    .kanban-column {
      display: flex;
      flex-direction: column;
      height: calc(100vh - 240px);
    }
    
    .kanban-task {
      transition: box-shadow 0.2s ease, transform 0.2s ease;
    }
    
    .kanban-task:hover {
      transform: translateY(-2px);
    }
    
    .cdk-drag-preview {
      box-shadow: 0 5px 15px rgba(0,0,0,0.15);
      opacity: 0.8;
    }
    
    .cdk-drag-placeholder {
      opacity: 0.3;
    }
    
    .cdk-drag-animating {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }
    
    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `]
})
export class KanbanViewComponent implements OnInit, OnDestroy {
  tasks: Task[] = [];
  todoTasks: Task[] = [];
  inProgressTasks: Task[] = [];
  doneTasks: Task[] = [];
  
  categories: Category[] = [];
  users: User[] = [];
  currentUser: User | null = null;
  
  selectedTask: Task | null = null;
  isModalOpen = false;
  
  selectedPriority: TaskPriority | null = null;
  selectedCategory: string | null = null;
  selectedAssigneeFilter: string | null = null;
  
  TaskState = TaskState;
  TaskPriority = TaskPriority;
  taskPriorities = Object.values(TaskPriority);
  
  private languageSubscription: Subscription | null = null;
  
  constructor(
    private taskService: TaskService,
    private categoryService: CategoryService,
    private authService: AuthService,
    private languageService: LanguageService
  ) {}
  
  ngOnInit() {
    this.loadTasks();
    this.loadCategories();
    this.loadUsers();
    this.getCurrentUser();
    this.languageSubscription = this.languageService.currentLanguage$.subscribe(() => {
      // Komponentin päivitys kielen vaihtuessa
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
      // Tehdään syvä kopio kaikista tehtävistä viittausongelmien välttämiseksi
      this.tasks = JSON.parse(JSON.stringify(tasks));
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
  
  applyFilters() {
    // Tehdään syvä kopio, jotta varmistetaan ettei viittausongelmia tapahdu
    let filtered = JSON.parse(JSON.stringify(this.tasks));

    // Prioriteetti-suodatus
    if (this.selectedPriority) {
      filtered = filtered.filter((task: Task) => task.priority === this.selectedPriority);
    }

    // Kategoria-suodatus
    if (this.selectedCategory) {
      filtered = filtered.filter((task: Task) => task.category === this.selectedCategory);
    }

    // Käyttäjän tehtävien suodatus
    if (this.selectedAssigneeFilter && this.currentUser) {
      if (this.selectedAssigneeFilter === 'assigned') {
        filtered = filtered.filter((task: Task) => task.assignee === this.currentUser?.id);
      } else if (this.selectedAssigneeFilter === 'created') {
        filtered = filtered.filter((task: Task) => task.createdBy === this.currentUser?.id);
      }
    }

    // Jaa tehtävät tilan mukaan - kopioi erikseen jokaiseen sarakkeeseen
    this.todoTasks = filtered.filter((task: Task) => task.state === TaskState.TO_DO)
      .map((task: Task) => JSON.parse(JSON.stringify(task)));
    this.inProgressTasks = filtered.filter((task: Task) => task.state === TaskState.IN_PROGRESS)
      .map((task: Task) => JSON.parse(JSON.stringify(task)));
    this.doneTasks = filtered.filter((task: Task) => task.state === TaskState.DONE)
      .map((task: Task) => JSON.parse(JSON.stringify(task)));
  }
  
  drop(event: CdkDragDrop<Task[]>, newState: TaskState) {
    if (event.previousContainer === event.container) {
      // Ei muuteta tilaa, vain järjestetään uudelleen
      return;
    }
    
    const taskId = (event.item.data as Task).id;
    
    // Käytetään taskService.updateTaskState-metodia ja päivitetään näkymä uudella
    // tehtävähaulla vastauksena, ei yritetä päivittää paikallisia listoja suoraan
    this.taskService.updateTaskState(taskId, newState)
      .subscribe(() => {
        // Haetaan kaikki tehtävät uudelleen, mikä varmistaa ettei tehtävät sekoitu
        this.loadTasks();
      });
  }
  
  canEnterList(drag: any, drop: any): boolean {
    // Aina sallitaan raahaaminen (voisimme rajoittaa esim. käyttöoikeuksien perusteella)
    return true;
  }
  
  getCategoryById(categoryId: string | null): Category | undefined {
    if (!categoryId) return undefined;
    return this.categories.find(c => c.id === categoryId);
  }
  
  getUserName(userId: string | null): string | null {
    if (!userId) return null;
    const user = this.users.find(u => u.id === userId);
    return user ? user.username : null;
  }
  
  openTaskModal(task: Task) {
    this.selectedTask = task;
    this.isModalOpen = true;
  }
  
  closeTaskModal() {
    this.isModalOpen = false;
    this.selectedTask = null;
  }
  
  saveTaskChanges(updatedTask: Task) {
    // Varmistetaan, että käytämme syvää kopiota tehtävästä
    const taskCopy = JSON.parse(JSON.stringify(updatedTask));
    this.taskService.updateTask(taskCopy).subscribe(() => {
      this.loadTasks();
      this.closeTaskModal();
    });
  }

  handleFiltersChanged(filters: FilterOptions) {
    this.selectedPriority = filters.priority && filters.priority.length > 0 
      ? filters.priority[0] as TaskPriority 
      : null;
    this.selectedCategory = filters.category ?? null;
    this.selectedAssigneeFilter = filters.assigneeFilter ?? null;
    
    this.applyFilters();
  }
} 