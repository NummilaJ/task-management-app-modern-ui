import { Component, EventEmitter, Input, Output, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaskState, TaskPriority } from '../../../models/task.model';
import { Category } from '../../../models/category.model';
import { Project } from '../../../models/project.model';
import { LanguageService } from '../../../services/language.service';
import { Subscription } from 'rxjs';

export interface FilterOptions {
  state?: TaskState[] | null;
  priority?: TaskPriority[] | null;
  category?: string | null;
  project?: string | null;
  assigneeFilter?: string | null;
  sortBy?: string;
  sortDirection?: boolean;
}

@Component({
  selector: 'app-task-filters',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
      <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">{{ translate('filterSettings') }}</h3>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Project Filter -->
        <div class="space-y-2">
          <label class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ translate('project') }}</label>
          <select [(ngModel)]="selectedProject" 
                  (change)="applyFilters()"
                  class="filter-select">
            <option [ngValue]="null">{{ translate('allProjects') }}</option>
            <option *ngFor="let project of projects" [ngValue]="project.id">
              {{ project.name }}
            </option>
          </select>
        </div>
        
        <!-- My Tasks Filter -->
        <div class="space-y-2">
          <label class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ translate('myTasks') }}</label>
          <select [(ngModel)]="selectedAssigneeFilter"
                  (change)="applyFilters()"
                  class="filter-select">
            <option [ngValue]="null">{{ translate('allTasks') }}</option>
            <option value="assigned">{{ translate('assignedToMe') }}</option>
            <option value="created">{{ translate('createdByMe') }}</option>
          </select>
        </div>
        
        <!-- State Filter - Visible only when showStateFilter is true -->
        <div *ngIf="showStateFilter" class="space-y-2">
          <label class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ translate('state') }}</label>
          <select [(ngModel)]="selectedState"
                  (change)="applyFilters()"
                  class="filter-select">
            <option [ngValue]="[]">{{ translate('allStates') }}</option>
            <option *ngFor="let state of taskStates" 
                    [ngValue]="[state]">
              <ng-container [ngSwitch]="state">
                <ng-container *ngSwitchCase="'TO_DO'">{{ translate('toDo') }}</ng-container>
                <ng-container *ngSwitchCase="'IN_PROGRESS'">{{ translate('inProgress') }}</ng-container>
                <ng-container *ngSwitchCase="'DONE'">{{ translate('done') }}</ng-container>
                <ng-container *ngSwitchDefault>{{state}}</ng-container>
              </ng-container>
            </option>
          </select>
        </div>

        <!-- Priority Filter -->
        <div class="space-y-2">
          <label class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ translate('priority') }}</label>
          <select [(ngModel)]="selectedPriority"
                  (change)="applyFilters()"
                  class="filter-select">
            <option [ngValue]="[]">{{ translate('allPriorities') }}</option>
            <option *ngFor="let priority of taskPriorities" 
                    [ngValue]="[priority]">
              <ng-container [ngSwitch]="priority">
                <ng-container *ngSwitchCase="'LOW'">{{ translate('low') }}</ng-container>
                <ng-container *ngSwitchCase="'MEDIUM'">{{ translate('medium') }}</ng-container>
                <ng-container *ngSwitchCase="'HIGH'">{{ translate('high') }}</ng-container>
                <ng-container *ngSwitchDefault>{{priority}}</ng-container>
              </ng-container>
            </option>
          </select>
        </div>

        <!-- Category Filter -->
        <div class="space-y-2">
          <label class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ translate('category') }}</label>
          <select [(ngModel)]="selectedCategory" 
                  (change)="applyFilters()"
                  class="filter-select">
            <option [ngValue]="null">{{ translate('allCategories') }}</option>
            <option *ngFor="let cat of categories" [ngValue]="cat.id">
              {{ cat.name }}
            </option>
          </select>
        </div>

        <!-- Sort By Filter -->
        <div class="space-y-2">
          <label class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ translate('sortBy') }}</label>
          <select [(ngModel)]="sortBy"
                  (change)="applyFilters()"
                  class="filter-select">
            <option value="createdAt">{{ translate('createdDate') }}</option>
            <option value="priority">{{ translate('priority') }}</option>
            <option value="title">{{ translate('title') }}</option>
            <option value="progress">{{ translate('progress') }}</option>
          </select>
        </div>

        <!-- Sort Direction -->
        <div class="space-y-2">
          <label class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ translate('direction') }}</label>
          <button (click)="toggleSortDirection()"
                  class="w-full h-10 px-3 rounded-md flex items-center justify-center bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-800/50 text-blue-700 dark:text-blue-300 transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                [class.transform]="!sortDirection" [class.rotate-180]="!sortDirection">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M3 4h13M3 8h9M3 12h5m0 0v6m0-6h14"></path>
            </svg>
            <span class="ml-2">{{ sortDirection ? translate('ascending') : translate('descending') }}</span>
          </button>
        </div>
      </div>

      <!-- Button to Clear All Filters -->
      <div class="mt-4 flex justify-end">
        <button (click)="clearAllFilters()" 
                class="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 rounded-md transition-all">
          {{ translate('clearFilters') }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .filter-select {
      @apply w-full h-10 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors;
    }
  `]
})
export class TaskFiltersComponent implements OnInit, OnDestroy {
  @Input() showStateFilter: boolean = true;
  @Input() taskStates = Object.values(TaskState);
  @Input() taskPriorities = Object.values(TaskPriority);
  @Input() categories: Category[] = [];
  @Input() projects: Project[] = [];

  @Input() selectedState: TaskState[] = [];
  @Input() selectedPriority: TaskPriority[] = [];
  @Input() selectedCategory: string | null = null;
  @Input() selectedProject: string | null = null;
  @Input() selectedAssigneeFilter: string | null = null;
  @Input() sortBy: string = 'createdAt';
  @Input() sortDirection: boolean = true;

  @Output() filtersChanged = new EventEmitter<FilterOptions>();

  private langSubscription: Subscription | null = null;

  constructor(private languageService: LanguageService) {}

  ngOnInit() {
    // Kuunnellaan kielen vaihtumista, jotta komponentti päivittyy automaattisesti
    this.langSubscription = this.languageService.currentLanguage$.subscribe(() => {
      // Komponentti päivittyy automaattisesti kun Angular havaitsee muutoksen
    });
  }

  ngOnDestroy() {
    // Siivotaan tilaukset muistivuotojen välttämiseksi
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
    }
  }

  translate(key: string): string {
    return this.languageService.translate(key);
  }

  applyFilters() {
    this.filtersChanged.emit({
      state: this.selectedState,
      priority: this.selectedPriority,
      category: this.selectedCategory,
      project: this.selectedProject,
      assigneeFilter: this.selectedAssigneeFilter,
      sortBy: this.sortBy,
      sortDirection: this.sortDirection
    });
  }

  toggleSortDirection() {
    this.sortDirection = !this.sortDirection;
    this.applyFilters();
  }

  clearAllFilters() {
    this.selectedState = [];
    this.selectedPriority = [];
    this.selectedCategory = null;
    this.selectedProject = null;
    this.selectedAssigneeFilter = null;
    this.sortBy = 'createdAt';
    this.sortDirection = true;
    this.applyFilters();
  }
} 