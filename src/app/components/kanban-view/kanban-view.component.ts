import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DragDropModule, CdkDragDrop, transferArrayItem } from '@angular/cdk/drag-drop';
import { TaskService } from '../../services/task.service';
import { CategoryService } from '../../services/category.service';
import { AuthService } from '../../services/auth.service';
import { ProjectService } from '../../services/project.service';
import { Task, TaskState, TaskPriority } from '../../models/task.model';
import { Category } from '../../models/category.model';
import { Project } from '../../models/project.model';
import { User } from '../../models/user.model';
import { TaskModalComponent } from '../task-modal/task-modal.component';
import { TaskFiltersComponent, FilterOptions } from '../shared/task-filters/task-filters.component';
import { RouterModule } from '@angular/router';
import { LanguageService } from '../../services/language.service';
import { Subscription } from 'rxjs';
import { ProjectContextService } from '../../services/project-context.service';

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
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white">{{ translate('kanban') }}</h2>
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
          [showProjectFilter]="false"
          [categories]="categories"
          [projects]="projects"
          [taskPriorities]="taskPriorities"
          [selectedPriority]="selectedPriority"
          [selectedCategory]="selectedCategory"
          [selectedProject]="selectedProject"
          [selectedAssigneeFilter]="selectedAssigneeFilter"
          [sortBy]="'createdAt'"
          [sortDirection]="true"
          (filtersChanged)="handleFiltersChanged($event)">
        </app-task-filters>
      </div>
      
      <!-- Kanban Board -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 overflow-x-auto max-w-full">
        <!-- To Do Column -->
        <div class="kanban-column bg-white dark:bg-gray-800 rounded-xl shadow-lg">
          <div class="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-t-xl border-b border-yellow-100 dark:border-yellow-900/30">
            <div class="flex justify-between items-center">
              <h3 class="text-base font-semibold text-gray-900 dark:text-white flex items-center">
                <svg class="w-4 h-4 mr-1.5 text-yellow-500 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                </svg>
                {{ translate('toDo') }}
              </h3>
              <span class="px-2 py-0.5 rounded-full bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200 text-xs font-medium">
                {{todoTasks.length}}
              </span>
            </div>
          </div>
          
          <div class="p-4 min-h-[200px] md:min-h-[50vh] max-h-[400px] md:max-h-[70vh] overflow-y-auto" 
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
                 class="kanban-task p-3 mb-2 bg-white dark:from-gray-700 dark:to-gray-750 rounded-lg border border-gray-100 shadow hover:shadow-md hover:-translate-y-1 cursor-move transition-all duration-200 border-l-4 border-yellow-400"
                 (click)="openTaskModal(task)">
              <div class="flex justify-between mb-1">
                <h4 class="font-medium text-sm text-gray-900 dark:text-white line-clamp-1">{{task.title}}</h4>
                <div class="badge" [ngClass]="{
                  'badge-high': task.priority === TaskPriority.HIGH,
                  'badge-medium': task.priority === TaskPriority.MEDIUM,
                  'badge-low': task.priority === TaskPriority.LOW
                }">{{task.priority}}</div>
              </div>
              <p class="text-xs text-gray-500 dark:text-gray-400 mb-2 line-clamp-2">
                {{task.description}}
              </p>
              
              <!-- Aikataulutiedot -->
              <div *ngIf="task.deadline || task.scheduledDate" class="text-xs text-gray-500 dark:text-gray-400 mb-2">
                <div *ngIf="task.scheduledDate" class="flex items-center space-x-1 mb-0.5">
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                  <span class="text-2xs">{{ translate('scheduledDate') }}: {{ task.scheduledDate | date:'dd.MM.yyyy' }}</span>
                </div>
                <div *ngIf="task.deadline" class="flex items-center space-x-1 text-red-500 dark:text-red-400 mb-0.5">
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                  <span class="text-2xs">{{ translate('deadline') }}: {{ task.deadline | date:'dd.MM.yyyy' }}</span>
                </div>
              </div>
              
              <div class="flex justify-between items-center">
                <div class="flex items-center space-x-1">
                  <ng-container *ngIf="task.category">
                    <div *ngIf="getCategoryById(task.category) as category"
                         [style.backgroundColor]="category.color"
                         class="w-2 h-2 rounded-full"></div>
                    <span class="text-2xs text-gray-600 dark:text-gray-400">
                      {{getCategoryById(task.category)?.name}}
                    </span>
                  </ng-container>
                </div>
                <div *ngIf="task.assignee" class="flex items-center text-2xs text-gray-500 dark:text-gray-400">
                  <svg class="w-2.5 h-2.5 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                  {{getUserName(task.assignee)}}
                </div>
              </div>
              <div *ngIf="task.progress > 0" class="mt-1">
                <div class="w-full bg-gray-200 rounded-full h-1 dark:bg-gray-700">
                  <div class="bg-blue-600 h-1 rounded-full" [style.width]="task.progress + '%'"></div>
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
          <div class="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-t-xl border-b border-blue-100 dark:border-blue-900/30">
            <div class="flex justify-between items-center">
              <h3 class="text-base font-semibold text-gray-900 dark:text-white flex items-center">
                <svg class="w-4 h-4 mr-1.5 text-blue-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                {{ translate('inProgress') }}
              </h3>
              <span class="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 text-xs font-medium">
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
                 class="kanban-task p-3 mb-2 bg-white dark:from-gray-700 dark:to-gray-750 rounded-lg border border-gray-100 shadow hover:shadow-md hover:-translate-y-1 cursor-move transition-all duration-200 border-l-4 border-blue-400"
                 (click)="openTaskModal(task)">
              <div class="flex justify-between mb-1">
                <h4 class="font-medium text-sm text-gray-900 dark:text-white line-clamp-1">{{task.title}}</h4>
                <div class="badge" [ngClass]="{
                  'badge-high': task.priority === TaskPriority.HIGH,
                  'badge-medium': task.priority === TaskPriority.MEDIUM,
                  'badge-low': task.priority === TaskPriority.LOW
                }">{{task.priority}}</div>
              </div>
              <p class="text-xs text-gray-500 dark:text-gray-400 mb-2 line-clamp-2">
                {{task.description}}
              </p>
              
              <!-- Aikataulutiedot -->
              <div *ngIf="task.deadline || task.scheduledDate" class="text-xs text-gray-500 dark:text-gray-400 mb-2">
                <div *ngIf="task.scheduledDate" class="flex items-center space-x-1 mb-0.5">
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                  <span class="text-2xs">{{ translate('scheduledDate') }}: {{ task.scheduledDate | date:'dd.MM.yyyy' }}</span>
                </div>
                <div *ngIf="task.deadline" class="flex items-center space-x-1 text-red-500 dark:text-red-400 mb-0.5">
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                  <span class="text-2xs">{{ translate('deadline') }}: {{ task.deadline | date:'dd.MM.yyyy' }}</span>
                </div>
              </div>
              
              <div class="flex justify-between items-center">
                <div class="flex items-center space-x-1">
                  <ng-container *ngIf="task.category">
                    <div *ngIf="getCategoryById(task.category) as category"
                         [style.backgroundColor]="category.color"
                         class="w-2 h-2 rounded-full"></div>
                    <span class="text-2xs text-gray-600 dark:text-gray-400">
                      {{getCategoryById(task.category)?.name}}
                    </span>
                  </ng-container>
                </div>
                <div *ngIf="task.assignee" class="flex items-center text-2xs text-gray-500 dark:text-gray-400">
                  <svg class="w-2.5 h-2.5 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                  {{getUserName(task.assignee)}}
                </div>
              </div>
              <div *ngIf="task.progress > 0" class="mt-1">
                <div class="w-full bg-gray-200 rounded-full h-1 dark:bg-gray-700">
                  <div class="bg-blue-600 h-1 rounded-full" [style.width]="task.progress + '%'"></div>
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
          <div class="p-3 bg-green-50 dark:bg-green-900/20 rounded-t-xl border-b border-green-100 dark:border-green-900/30">
            <div class="flex justify-between items-center">
              <h3 class="text-base font-semibold text-gray-900 dark:text-white flex items-center">
                <svg class="w-4 h-4 mr-1.5 text-green-500 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                {{ translate('done') }}
              </h3>
              <span class="px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200 text-xs font-medium">
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
                 class="kanban-task p-3 mb-2 bg-white dark:from-gray-700 dark:to-gray-750 rounded-lg border border-gray-100 shadow hover:shadow-md hover:-translate-y-1 cursor-move transition-all duration-200 border-l-4 border-green-400"
                 (click)="openTaskModal(task)">
              <div class="flex justify-between mb-1">
                <h4 class="font-medium text-sm text-gray-900 dark:text-white line-clamp-1">{{task.title}}</h4>
                <div class="badge" [ngClass]="{
                  'badge-high': task.priority === TaskPriority.HIGH,
                  'badge-medium': task.priority === TaskPriority.MEDIUM,
                  'badge-low': task.priority === TaskPriority.LOW
                }">{{task.priority}}</div>
              </div>
              <p class="text-xs text-gray-500 dark:text-gray-400 mb-2 line-clamp-2">
                {{task.description}}
              </p>
              
              <!-- Aikataulutiedot -->
              <div *ngIf="task.deadline || task.scheduledDate" class="text-xs text-gray-500 dark:text-gray-400 mb-2">
                <div *ngIf="task.scheduledDate" class="flex items-center space-x-1 mb-0.5">
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                  <span class="text-2xs">{{ translate('scheduledDate') }}: {{ task.scheduledDate | date:'dd.MM.yyyy' }}</span>
                </div>
                <div *ngIf="task.deadline" class="flex items-center space-x-1 text-red-500 dark:text-red-400 mb-0.5">
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                  <span class="text-2xs">{{ translate('deadline') }}: {{ task.deadline | date:'dd.MM.yyyy' }}</span>
                </div>
              </div>
              
              <div class="flex justify-between items-center">
                <div class="flex items-center space-x-1">
                  <ng-container *ngIf="task.category">
                    <div *ngIf="getCategoryById(task.category) as category"
                         [style.backgroundColor]="category.color"
                         class="w-2 h-2 rounded-full"></div>
                    <span class="text-2xs text-gray-600 dark:text-gray-400">
                      {{getCategoryById(task.category)?.name}}
                    </span>
                  </ng-container>
                </div>
                <div *ngIf="task.assignee" class="flex items-center text-2xs text-gray-500 dark:text-gray-400">
                  <svg class="w-2.5 h-2.5 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                  {{getUserName(task.assignee)}}
                </div>
              </div>
              <div *ngIf="task.progress > 0" class="mt-1">
                <div class="w-full bg-gray-200 rounded-full h-1 dark:bg-gray-700">
                  <div class="bg-blue-600 h-1 rounded-full" [style.width]="task.progress + '%'"></div>
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
      position: relative;
      overflow: hidden;
      background-image: linear-gradient(to bottom right, rgba(249, 250, 251, 0.8), rgba(255, 255, 255, 1));
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.06);
      backdrop-filter: blur(8px);
    }
    
    .kanban-task::before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-image: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23f1f5f9' fill-opacity='0.3' fill-rule='evenodd'/%3E%3C/svg%3E");
      opacity: 0.3;
      z-index: 0;
      pointer-events: none;
    }
    
    .kanban-task > * {
      position: relative;
      z-index: 1;
    }
    
    .kanban-task:hover {
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.03);
      border-color: rgba(229, 231, 235, 1);
    }
    
    /* Tumma teema */
    .dark .kanban-task {
      background-image: linear-gradient(to bottom right, rgba(55, 65, 81, 0.8), rgba(31, 41, 55, 0.9));
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
    }
    
    .dark .kanban-task::before {
      opacity: 0.1;
    }
    
    .dark .kanban-task:hover {
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.2), 0 4px 6px -2px rgba(0, 0, 0, 0.15);
    }
    
    .badge {
      @apply px-1.5 py-0.5 text-2xs font-medium rounded-full;
    }
    
    .badge-high {
      @apply bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200;
    }
    
    .badge-medium {
      @apply bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200;
    }
    
    .badge-low {
      @apply bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200;
    }
    
    .text-2xs {
      font-size: 0.65rem; /* 10.4px */
      line-height: 1rem; /* 16px */
    }
    
    .line-clamp-1 {
      display: -webkit-box;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
      overflow: hidden;
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
  projects: Project[] = [];
  users: User[] = [];
  currentUser: User | null = null;
  
  selectedTask: Task | null = null;
  isModalOpen = false;
  
  selectedPriority: TaskPriority[] = [];
  selectedCategory: string | null = null;
  selectedProject: string | null = null;
  selectedAssigneeFilter: string | null = null;
  
  TaskState = TaskState;
  TaskPriority = TaskPriority;
  taskPriorities = Object.values(TaskPriority);
  
  private languageSubscription: Subscription | null = null;
  
  constructor(
    private taskService: TaskService,
    private categoryService: CategoryService,
    private authService: AuthService,
    private projectService: ProjectService,
    private languageService: LanguageService,
    private projectContextService: ProjectContextService
  ) {}
  
  ngOnInit() {
    this.loadTasks();
    this.loadCategories();
    this.loadProjects();
    this.loadUsers();
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
  
  loadProjects() {
    this.projectService.getProjects().subscribe(projects => {
      this.projects = projects;
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
    if (this.selectedPriority && this.selectedPriority.length > 0) {
      filtered = filtered.filter((task: Task) => this.selectedPriority.includes(task.priority));
    }

    // Kategoria-suodatus
    if (this.selectedCategory) {
      filtered = filtered.filter((task: Task) => task.category === this.selectedCategory);
    }
    
    // Projekti-suodatus
    if (this.selectedProject) {
      filtered = filtered.filter((task: Task) => task.projectId === this.selectedProject);
    }
    // Huom: Kun selectedProject === null, näytetään kaikki tehtävät, mitään suodatusta ei tehdä projektin perusteella

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
    return this.categories.find(cat => cat.id === categoryId);
  }
  
  getProjectById(projectId: string | null): Project | undefined {
    if (!projectId) return undefined;
    return this.projects.find(proj => proj.id === projectId);
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
    this.selectedPriority = filters.priority || [];
    this.selectedCategory = filters.category !== undefined ? filters.category : null;
    this.selectedAssigneeFilter = filters.assigneeFilter !== undefined ? filters.assigneeFilter : null;
    
    this.applyFilters();
  }
} 