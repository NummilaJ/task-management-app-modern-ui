import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Task, TaskState, TaskPriority, Subtask } from '../../models/task.model';
import { Category } from '../../models/category.model';
import { Project } from '../../models/project.model';
import { TaskService } from '../../services/task.service';
import { AuthService } from '../../services/auth.service';
import { ProjectService } from '../../services/project.service';
import { User } from '../../models/user.model';
import { Comment } from '../../models/comment.model';
import { TaskCommentsComponent } from '../task-comments/task-comments.component';
import { ConfirmModalComponent } from '../confirm-modal/confirm-modal.component';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-task-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, TaskCommentsComponent, ConfirmModalComponent],
  template: `
    <div *ngIf="isOpen && task" 
         class="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
         (click)="closeModal()">
      <div class="bg-white dark:bg-gray-800 w-full max-w-2xl max-h-[80vh] overflow-y-auto rounded-xl shadow-2xl" 
           (click)="$event.stopPropagation()">
        <div class="relative">
          <!-- Header with gradient background -->
          <div class="absolute inset-0 rounded-t-xl bg-gradient-to-b from-blue-500/10 to-transparent dark:from-blue-400/10 h-24"></div>
          
          <div class="relative p-4 space-y-4">
            <!-- Header -->
            <div class="flex justify-between items-start">
              <div class="flex-1">
                <input *ngIf="isEditing && editedTask"
                       [(ngModel)]="editedTask.title"
                       class="text-xl font-bold w-full input-field mb-1"
                       placeholder="Task title">
                <h2 *ngIf="!isEditing" 
                    class="text-xl font-bold text-gray-900 dark:text-white">
                  {{task.title}}
                </h2>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {{ translate('created') }}: {{task.createdAt | date:'d.M.yyyy HH:mm'}}
                </p>
              </div>
              <div class="flex items-center space-x-2">
                <button (click)="closeModal()" 
                        class="btn-icon btn-ghost text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
            </div>

            <!-- Content -->
            <div class="space-y-4">
              <!-- Status and Priority in one row -->
              <div class="flex justify-between gap-3">
                <div class="flex-1">
                  <span class="text-xs text-gray-500 dark:text-gray-400 block mb-1">{{ translate('status') }}</span>
                  
                  <div *ngIf="isEditing && editedTask" class="flex space-x-2 mb-2">
                    <label class="inline-flex items-center cursor-pointer p-1 rounded-lg" 
                           [ngClass]="{'bg-yellow-100 dark:bg-yellow-900/30': editedTask.state === TaskState.TO_DO}">
                      <input type="radio" 
                             name="taskState" 
                             [value]="TaskState.TO_DO" 
                             [(ngModel)]="editedTask.state"
                             class="form-radio h-3 w-3 text-yellow-600">
                      <span class="ml-1 text-xs">To Do</span>
                    </label>
                    
                    <label class="inline-flex items-center cursor-pointer p-1 rounded-lg"
                           [ngClass]="{'bg-blue-100 dark:bg-blue-900/30': editedTask.state === TaskState.IN_PROGRESS}">
                      <input type="radio" 
                             name="taskState" 
                             [value]="TaskState.IN_PROGRESS" 
                             [(ngModel)]="editedTask.state"
                             class="form-radio h-3 w-3 text-blue-600">
                      <span class="ml-1 text-xs">In Progress</span>
                    </label>
                    
                    <label class="inline-flex items-center cursor-pointer p-1 rounded-lg"
                           [ngClass]="{'bg-green-100 dark:bg-green-900/30': editedTask.state === TaskState.DONE}">
                      <input type="radio" 
                             name="taskState" 
                             [value]="TaskState.DONE" 
                             [(ngModel)]="editedTask.state"
                             class="form-radio h-3 w-3 text-green-600">
                      <span class="ml-1 text-xs">Done</span>
                    </label>
                  </div>
                  
                  <div *ngIf="!isEditing" class="flex space-x-1">
                    <div class="px-2 py-1 rounded-full text-xs font-medium"
                         [ngClass]="{
                           'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200': task.state === TaskState.TO_DO,
                           'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200': task.state === TaskState.IN_PROGRESS,
                           'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200': task.state === TaskState.DONE
                         }">
                      <div class="flex items-center">
                        <svg *ngIf="task.state === TaskState.TO_DO" class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                        </svg>
                        <svg *ngIf="task.state === TaskState.IN_PROGRESS" class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <svg *ngIf="task.state === TaskState.DONE" class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        {{task.state === TaskState.TO_DO ? 'To Do' : task.state === TaskState.IN_PROGRESS ? 'In Progress' : 'Done'}}
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <span class="text-xs text-gray-500 dark:text-gray-400 block mb-1">{{ translate('priority') }}</span>
                  <select *ngIf="isEditing && editedTask"
                          [(ngModel)]="editedTask.priority"
                          class="input-field text-sm">
                    <option [value]="'LOW'">{{ translate('low') }}</option>
                    <option [value]="'MEDIUM'">{{ translate('medium') }}</option>
                    <option [value]="'HIGH'">{{ translate('high') }}</option>
                  </select>
                  <span *ngIf="!isEditing"
                        class="badge"
                        [ngClass]="{
                          'badge-high': task.priority === 'HIGH',
                          'badge-medium': task.priority === 'MEDIUM',
                          'badge-low': task.priority === 'LOW'
                        }">
                    {{task.priority}}
                  </span>
                </div>
              </div>

              <!-- Assignee and Category -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span class="text-xs text-gray-500 dark:text-gray-400 block mb-1">{{ translate('assignee') }}</span>
                  <div class="flex items-center">
                    <svg class="w-4 h-4 mr-1 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                    </svg>
                    <select *ngIf="isEditing && editedTask"
                           [(ngModel)]="editedTask.assignee"
                           class="input-field flex-1 text-sm">
                      <option [ngValue]="null">Not assigned</option>
                      <option *ngFor="let user of users" 
                              [ngValue]="user.id">
                        {{user.username}}
                      </option>
                    </select>
                    <span *ngIf="!isEditing" 
                          class="text-sm text-gray-900 dark:text-white">
                      {{getAssigneeName(task.assignee) || translate('notAssigned')}}
                    </span>
                  </div>
                </div>
                <div>
                  <span class="text-xs text-gray-500 dark:text-gray-400 block mb-1">{{ translate('category') }}</span>
                  <div class="flex items-center">
                    <svg class="w-4 h-4 mr-1 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
                    </svg>
                    <select *ngIf="isEditing && editedTask"
                            [(ngModel)]="editedTask.category"
                            class="input-field text-sm">
                      <option value="">{{ translate('noCategory') }}</option>
                      <option *ngFor="let category of filteredCategories"
                              [value]="category.id">
                        {{category.name}}
                      </option>
                    </select>
                    <div *ngIf="!isEditing">
                      <div *ngIf="task.category && getCategory(task.category) as category"
                           [style.backgroundColor]="category.color"
                           class="inline-flex items-center px-2 py-1 rounded-full text-xs text-white">
                        {{category.name}}
                      </div>
                      <span *ngIf="!task.category" class="text-sm text-gray-500 dark:text-gray-400">
                        {{ translate('noCategory') }}
                      </span>
                    </div>
                  </div>
                </div>
                
                <!-- Projekti -->
                <div>
                  <span class="text-xs text-gray-500 dark:text-gray-400 block mb-1">Projekti</span>
                  <div class="flex items-center">
                    <svg class="w-4 h-4 mr-1 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path>
                    </svg>
                    <select *ngIf="isEditing && editedTask"
                            [(ngModel)]="editedTask.projectId"
                            (change)="onProjectChange()"
                            class="input-field text-sm">
                      <option value="">Ei projektia</option>
                      <option *ngFor="let project of projects"
                              [value]="project.id">
                        {{project.name}}
                      </option>
                    </select>
                    <div *ngIf="!isEditing">
                      <div *ngIf="task.projectId && getProject(task.projectId) as project"
                           class="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs text-white"
                           [style.backgroundColor]="project.color">
                        {{project.name}}
                      </div>
                      <span *ngIf="!task.projectId" class="text-sm text-gray-500 dark:text-gray-400">
                        Ei projektia
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Scheduled Date -->
              <div>
                <span class="text-xs text-gray-500 dark:text-gray-400 block mb-1">{{ translate('scheduledDate') }}</span>
                <div class="flex items-center">
                  <svg class="w-4 h-4 mr-1 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                  <!-- Syöte näytetään vain jos muokkaaminen on sallittua (ei projektin lukitsemaa) -->
                  <input *ngIf="isEditing && editedTask && !datesLockedByProject"
                         type="date"
                         [value]="scheduledDate || ''"
                         (input)="scheduledDate = $any($event.target).value"
                         class="input-field text-sm">
                  <!-- Näytetään lukittu-ilmoitus muokkaustilassa -->
                  <div *ngIf="isEditing && editedTask && datesLockedByProject" class="text-sm flex items-center">
                    <span *ngIf="scheduledDate" class="text-gray-700 dark:text-gray-300 mr-2">
                      {{ scheduledDate }}
                    </span>
                    <span *ngIf="!scheduledDate" class="text-gray-500 dark:text-gray-400 mr-2">
                      {{ translate('noScheduledDate') }}
                    </span>
                    <svg class="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                    </svg>
                  </div>
                  <!-- Lukittu-ilmoitus kentän alla -->
                  <div *ngIf="isEditing && datesLockedByProject" class="absolute mt-8 text-xs text-amber-500 dark:text-amber-400 italic">
                    {{ translate('projectDateLock') }}
                  </div>
                  <!-- Katselutila -->
                  <div *ngIf="!isEditing" class="text-sm">
                    <span *ngIf="task?.scheduledDate" class="text-gray-900 dark:text-gray-100">
                      {{ formatDateForDisplay(task.scheduledDate) }}
                    </span>
                    <span *ngIf="!task?.scheduledDate" class="text-gray-500 dark:text-gray-400">
                      {{ translate('noScheduledDate') }}
                    </span>
                  </div>
                </div>
              </div>
                
              <!-- Deadline -->
                <div>
                  <span class="text-xs text-gray-500 dark:text-gray-400 block mb-1">{{ translate('deadline') }}</span>
                  <div class="flex items-center">
                    <svg class="w-4 h-4 mr-1 text-red-500 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                    <!-- Syöte näytetään vain jos muokkaaminen on sallittua (ei projektin lukitsemaa) -->
                    <input *ngIf="isEditing && editedTask && !datesLockedByProject"
                           type="date"
                           [value]="deadlineDate || ''"
                           (input)="deadlineDate = $any($event.target).value"
                           class="input-field text-sm">
                    <!-- Näytetään lukittu-ilmoitus muokkaustilassa -->
                    <div *ngIf="isEditing && editedTask && datesLockedByProject" class="text-sm flex items-center">
                      <span *ngIf="deadlineDate" class="text-red-500 dark:text-red-400 mr-2">
                        {{ deadlineDate }}
                      </span>
                      <span *ngIf="!deadlineDate" class="text-gray-500 dark:text-gray-400 mr-2">
                        {{ translate('noDeadline') }}
                      </span>
                      <svg class="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                      </svg>
                    </div>
                    <!-- Lukittu-ilmoitus kentän alla -->
                    <div *ngIf="isEditing && datesLockedByProject" class="absolute mt-8 text-xs text-amber-500 dark:text-amber-400 italic">
                      {{ translate('projectDateLock') }}
                    </div>
                    <!-- Katselutila -->
                    <div *ngIf="!isEditing" class="text-sm">
                      <span *ngIf="task?.deadline" class="text-red-500 dark:text-red-400">
                        {{ formatDateForDisplay(task.deadline) }}
                      </span>
                      <span *ngIf="!task?.deadline" class="text-gray-500 dark:text-gray-400">
                        {{ translate('noDeadline') }}
                      </span>
                    </div>
                  </div>
                </div>

              <!-- Description -->
              <div>
                <span class="text-xs text-gray-500 dark:text-gray-400 block mb-1">{{ translate('description') }}</span>
                <textarea *ngIf="isEditing && editedTask"
                         [(ngModel)]="editedTask.description"
                         rows="3"
                         class="input-field w-full text-sm min-h-[100px]"
                         [placeholder]="translate('taskDescription')"></textarea>
                <div *ngIf="!isEditing" 
                     class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-sm text-gray-700 dark:text-gray-300 max-h-28 overflow-y-auto">
                  {{task.description || translate('noDescriptionProvided')}}
                </div>
              </div>

              <!-- Progress Bar -->
              <div class="space-y-1">
                <div class="flex justify-between items-center">
                  <span class="text-xs text-gray-500 dark:text-gray-400">Progress</span>
                  <span class="text-xs font-medium text-gray-700 dark:text-gray-300">{{task.progress}}%</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700">
                  <div class="bg-blue-600 h-1.5 rounded-full" 
                       [style.width]="task.progress + '%'"></div>
                </div>
              </div>

              <!-- Collapsible sections -->
              <div class="space-y-3">
                <!-- Subtasks -->
                <details class="group">
                  <summary class="flex justify-between items-center cursor-pointer list-none">
                    <span class="text-sm font-medium text-gray-800 dark:text-white">{{ translate('subtasks') }}</span>
                    <div class="flex items-center">
                      <svg class="w-4 h-4 transform transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                      </svg>
                    </div>
                  </summary>
                  
                  <div class="pt-3">
                    <!-- Add New Subtask Form -->
                    <div *ngIf="showSubtaskForm" class="flex items-center space-x-2 mb-2">
                      <input [(ngModel)]="newSubtaskTitle"
                             (keyup.enter)="submitNewSubtask()"
                             class="input-field flex-1 text-sm"
                             [placeholder]="translate('enterSubtaskTitle')">
                      <button (click)="submitNewSubtask()"
                              class="btn-sm bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-3 py-2 rounded-lg shadow-sm transition-all">
                        {{ translate('add') }}
                      </button>
                      <button (click)="cancelNewSubtask()"
                              class="btn-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-3 py-2 rounded-lg shadow-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-all">
                        {{ translate('cancel') }}
                      </button>
                    </div>

                    <!-- Subtasks List -->
                    <div class="space-y-1 max-h-40 overflow-y-auto">
                      <div *ngFor="let subtask of task.subtasks"
                           class="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <input type="checkbox"
                               [checked]="subtask.completed"
                               (change)="toggleSubtask(subtask)"
                               class="form-checkbox h-4 w-4 text-blue-600 rounded border-gray-300 dark:border-gray-600 focus:ring-blue-500">
                        <span [class.line-through]="subtask.completed"
                              [class.text-gray-500]="subtask.completed"
                              class="flex-1 text-sm">
                          {{subtask.title}}
                        </span>
                        <button (click)="deleteSubtask(subtask)"
                                class="p-1 rounded-full bg-gray-100 hover:bg-red-100 dark:bg-gray-800 dark:hover:bg-red-900/30 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors">
                          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                          </svg>
                        </button>
                      </div>
                    </div>
                    
                    <!-- Add button at the bottom -->
                    <button 
                      *ngIf="!showSubtaskForm"
                      (click)="addNewSubtask()"
                      class="mt-2 inline-flex items-center justify-center w-full px-3 py-2 text-sm font-medium rounded-lg shadow-sm text-white bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400 transition-all">
                      <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                      </svg>
                      {{ translate('addSubtask') }}
                    </button>
                  </div>
                </details>
                
                <!-- Comments section -->
                <details class="group">
                  <summary class="flex justify-between items-center cursor-pointer list-none">
                    <span class="text-sm font-medium text-gray-800 dark:text-white">{{ translate('comments') }}</span>
                    <div class="flex items-center">
                      <svg class="w-4 h-4 transform transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                      </svg>
                    </div>
                  </summary>
                  
                  <div class="pt-3">
                    <app-task-comments 
                      [task]="task" 
                      (commentAdded)="addComment($event)" 
                      (commentDeleted)="deleteComment($event)">
                    </app-task-comments>
                  </div>
                </details>
              </div>

              <!-- Footer -->
              <div class="flex justify-end space-x-2 pt-3 border-t border-gray-200 dark:border-gray-700">
                <button *ngIf="isEditing"
                        (click)="cancelEdit()"
                        class="btn-light text-xs py-1 px-3">
                  Cancel
                </button>
                <button *ngIf="!isEditing"
                        (click)="closeModal()"
                        class="btn-light text-xs py-1 px-3">
                  Close
                </button>
                <button *ngIf="!isEditing"
                        (click)="startEdit()"
                        class="btn-info text-xs py-1 px-3">
                  Edit
                </button>
                <button *ngIf="isEditing"
                        (click)="toggleEdit()"
                        class="btn-success text-xs py-1 px-3">
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Vahvistusmodaali alitehtävän poistolle -->
    <app-confirm-modal
      *ngIf="isConfirmModalOpen && subtaskToDelete"
      [isOpen]="isConfirmModalOpen"
      [title]="translate('deleteSubtask')"
      [message]="translate('deleteSubtaskConfirmation')"
      (confirm)="confirmDeleteSubtask()"
      (cancel)="cancelDeleteSubtask()">
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
export class TaskModalComponent implements OnInit {
  @Input() task: Task | null = null;
  @Input() isOpen = false;
  @Input() categories: Category[] = [];
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<Task>();

  TaskState = TaskState;

  isEditing = false;
  editedTask: Task | null = null;
  showSubtaskForm = false;
  newSubtaskTitle = '';
  users: User[] = [];
  projects: Project[] = [];
  isConfirmModalOpen = false;
  subtaskToDelete: Subtask | null = null;
  
  // Kategorioiden käsittely
  allCategories: Category[] = [];
  filteredCategories: Category[] = [];
  
  // Päivämäärien käsittely
  deadlineDate: string | null = null;
  scheduledDate: string | null = null;
  
  // Projektin tiedot
  currentProject: Project | null = null;
  datesLockedByProject = false;

  constructor(
    private taskService: TaskService,
    private authService: AuthService,
    private projectService: ProjectService,
    private languageService: LanguageService
  ) {}

  ngOnInit() {
    this.loadUsers();
    this.loadProjects();
    this.allCategories = [...this.categories]; // Tallennetaan kaikki kategoriat
    this.filteredCategories = [...this.categories]; // Alustetaan suodatetut kategoriat
  }

  loadUsers() {
    this.authService.getAllUsers().subscribe(users => {
      this.users = users;
    });
  }

  loadProjects() {
    this.projectService.getProjects().subscribe(projects => {
      this.projects = projects;
      
      // Jos tehtävällä on projekti, tarkistetaan sen päivämäärät
      if (this.task?.projectId) {
        this.checkProjectDates();
      }
    });
  }

  // Tarkistaa onko tehtävän päivämäärät lukittu projektin vuoksi
  checkProjectDates() {
    if (!this.task?.projectId) {
      this.datesLockedByProject = false;
      this.currentProject = null;
      return;
    }
    
    const project = this.projects.find(p => p.id === this.task?.projectId);
    this.currentProject = project || null;
    
    // Päivämäärät lukitaan, jos projektilla on määritetyt päivämäärät
    this.datesLockedByProject = !!(
      (project?.deadline || project?.startDate)
    );
    
    console.log('Project dates check:', { 
      projectId: this.task?.projectId, 
      project, 
      datesLocked: this.datesLockedByProject 
    });
  }

  getCategory(categoryId: string): Category | undefined {
    return this.categories.find(c => c.id === categoryId);
  }

  getProject(projectId: string | null): Project | undefined {
    if (!projectId) return undefined;
    return this.projects.find(p => p.id === projectId);
  }

  getAssigneeName(userId: string | null): string | null {
    if (!userId) return null;
    const user = this.users.find(u => u.id === userId);
    return user ? user.username : null;
  }

  toggleEdit() {
    if (this.isEditing && this.editedTask) {
      this.saveChanges();
    } else {
      this.startEdit();
    }
  }

  // Täysin uusi lähestymistapa päivämäärien käsittelyyn
  formatDateForDisplay(date: Date | null): string {
    if (!date) return '';
    
    // Varmistetaan että date on Date-objekti
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    
    return `${day}.${month}.${year}`;
  }
  
  formatDateForInput(date: Date | null): string {
    if (!date) return '';
    
    // Varmistetaan että date on Date-objekti
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    
    return `${year}-${month}-${day}`;
  }
  
  parseDate(dateString: string): Date | null {
    if (!dateString || dateString.trim() === '') return null;
    
    // Yritetään parsia yyyy-mm-dd muoto
    if (dateString.includes('-')) {
      try {
        const [year, month, day] = dateString.split('-').map(num => parseInt(num, 10));
        return new Date(year, month - 1, day);
      } catch (e) {
        console.error('Virhe päivämäärän parsimisessa:', e);
        return null;
      }
    }
    
    // Yritetään parsia dd.mm.yyyy muoto
    if (dateString.includes('.')) {
      try {
        const [day, month, year] = dateString.split('.').map(num => parseInt(num, 10));
        return new Date(year, month - 1, day);
      } catch (e) {
        console.error('Virhe päivämäärän parsimisessa:', e);
        return null;
      }
    }
    
    return null;
  }

  startEdit() {
    if (!this.task) return;
    
    console.log("Aloitetaan muokkaus, tehtävä:", this.task);
    this.editedTask = { ...this.task };
    
    // Tarkistetaan projektin päivämäärät
    this.checkProjectDates();
    
    // Suodata kategoriat projektin mukaan
    this.filterCategoriesByProject(this.editedTask.projectId);
    
    // Muunnetaan päivämäärät string-muotoon
    if (this.task.deadline) {
      try {
        const deadline = new Date(this.task.deadline);
        console.log("Alkuperäinen deadline:", deadline);
        
        // Muotoillaan päivämäärä turvallisesti YYYY-MM-DD muotoon
        const year = deadline.getFullYear();
        const month = String(deadline.getMonth() + 1).padStart(2, '0');
        const day = String(deadline.getDate()).padStart(2, '0');
        this.deadlineDate = `${year}-${month}-${day}`;
        
        console.log("Muunnettu deadline string:", this.deadlineDate);
      } catch (e) {
        console.error("Virhe deadline-päivämäärän käsittelyssä:", e);
        this.deadlineDate = null;
      }
    } else {
      this.deadlineDate = null;
    }
    
    if (this.task.scheduledDate) {
      try {
        const scheduledDate = new Date(this.task.scheduledDate);
        console.log("Alkuperäinen scheduledDate:", scheduledDate);
        
        // Muotoillaan päivämäärä turvallisesti YYYY-MM-DD muotoon
        const year = scheduledDate.getFullYear();
        const month = String(scheduledDate.getMonth() + 1).padStart(2, '0');
        const day = String(scheduledDate.getDate()).padStart(2, '0');
        this.scheduledDate = `${year}-${month}-${day}`;
        
        console.log("Muunnettu scheduledDate string:", this.scheduledDate);
      } catch (e) {
        console.error("Virhe scheduledDate-päivämäärän käsittelyssä:", e);
        this.scheduledDate = null;
      }
    } else {
      this.scheduledDate = null;
    }
    
    this.isEditing = true;
  }

  cancelEdit() {
    this.isEditing = false;
    this.editedTask = null;
    this.deadlineDate = null;
    this.scheduledDate = null;
  }

  closeModal() {
    if (this.isEditing) {
      this.cancelEdit();
    }
    this.close.emit();
  }

  addNewSubtask() {
    this.showSubtaskForm = true;
  }

  submitNewSubtask() {
    if (this.task && this.newSubtaskTitle.trim()) {
      this.taskService.addSubtask(this.task.id, this.newSubtaskTitle.trim())
        .subscribe(updatedTask => {
          this.task = updatedTask;
          this.showSubtaskForm = false;
          this.newSubtaskTitle = '';
        });
    }
  }

  cancelNewSubtask() {
    this.showSubtaskForm = false;
    this.newSubtaskTitle = '';
  }

  toggleSubtask(subtask: Subtask) {
    if (!this.task) return;
    
    this.taskService.toggleSubtask(this.task.id, subtask.id).subscribe(updatedTask => {
      if (this.task) {
        this.task = updatedTask;
      }
    });
  }
  
  addComment(comment: Comment) {
    if (!this.task) return;
    
    this.taskService.addComment(this.task.id, comment).subscribe(updatedTask => {
      if (this.task) {
        this.task = updatedTask;
      }
    });
  }
  
  deleteComment(commentId: string) {
    if (!this.task) return;
    
    this.taskService.deleteComment(this.task.id, commentId).subscribe(updatedTask => {
      if (this.task) {
        this.task = updatedTask;
      }
    });
  }
  
  deleteSubtask(subtask: Subtask) {
    this.subtaskToDelete = subtask;
    this.isConfirmModalOpen = true;
  }
  
  confirmDeleteSubtask() {
    if (this.task && this.subtaskToDelete) {
      this.taskService.deleteSubtask(this.task.id, this.subtaskToDelete.id)
        .subscribe(updatedTask => {
          this.task = updatedTask;
          this.closeDeleteSubtaskModal();
        });
    }
  }
  
  cancelDeleteSubtask() {
    this.closeDeleteSubtaskModal();
  }
  
  closeDeleteSubtaskModal() {
    this.isConfirmModalOpen = false;
    this.subtaskToDelete = null;
  }

  saveChanges() {
    if (this.editedTask) {
      console.log("Tallennetaan muutokset, syötetyt päivämäärät:");
      console.log("deadlineDate:", this.deadlineDate);
      console.log("scheduledDate:", this.scheduledDate);
      
      // Päivitä deadline ja scheduledDate kentät vain jos ne eivät ole lukittuja
      if (!this.datesLockedByProject) {
        this.editedTask.deadline = this.parseDate(this.deadlineDate || '');
        this.editedTask.scheduledDate = this.parseDate(this.scheduledDate || '');
        
        console.log("Muunnetut Date-objektit:");
        console.log("deadline:", this.editedTask.deadline);
        console.log("scheduledDate:", this.editedTask.scheduledDate);
      } else {
        console.log("Päivämääräkentät lukittu projektin vuoksi - ei päivitetä");
      }
      
      this.save.emit(this.editedTask);
      this.isEditing = false;
      this.editedTask = null;
      this.deadlineDate = null;
      this.scheduledDate = null;
    }
  }

  translate(key: string): string {
    return this.languageService.translate(key);
  }

  // Suodattaa kategoriat projektin mukaan
  filterCategoriesByProject(projectId: string | null) {
    // Jos projektia ei ole valittu, näytetään kaikki kategoriat
    if (!projectId) {
      this.filteredCategories = [...this.allCategories];
      return;
    }
    
    // Etsi projekti
    const project = this.projects.find(p => p.id === projectId);
    if (!project || !project.categoryIds || project.categoryIds.length === 0) {
      // Jos projektilla ei ole määriteltyjä kategorioita, näytetään kaikki
      this.filteredCategories = [...this.allCategories];
    } else {
      // Näytetään vain projektin sallimat kategoriat
      this.filteredCategories = this.allCategories.filter(
        cat => project.categoryIds?.includes(cat.id)
      );
      
      // Jos tehtävän kategoria ei kuulu projektille sallittuihin kategorioihin,
      // poistetaan se
      if (this.editedTask && this.editedTask.category && 
          !project.categoryIds.includes(this.editedTask.category)) {
        this.editedTask.category = null;
      }
    }
  }
  
  // Käsittelee projektin vaihtumisen
  onProjectChange() {
    if (!this.editedTask) return;
    
    // Tarkista projektin päivämäärät
    this.checkProjectDates();
    
    // Suodata kategoriat projektin mukaan
    this.filterCategoriesByProject(this.editedTask.projectId);
  }
} 