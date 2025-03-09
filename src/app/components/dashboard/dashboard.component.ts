import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TaskService, TaskStats } from '../../services/task.service';
import { CategoryService } from '../../services/category.service';
import { AuthService } from '../../services/auth.service';
import { LanguageService } from '../../services/language.service';
import { ProjectService } from '../../services/project.service';
import { Task, TaskState, TaskPriority } from '../../models/task.model';
import { Category } from '../../models/category.model';
import { Project } from '../../models/project.model';
import { User } from '../../models/user.model';
import { Subscription } from 'rxjs';
import { ActivityLogService } from '../../services/activity-log.service';
import { ActivityLog, ActivityType } from '../../models/activity-log.model';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="space-y-8">
      <div class="flex justify-between items-center">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">{{ translate('dashboard') }}</h1>
      </div>

      <!-- Tehtävien tilastot -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <!-- Kaikki tehtävät -->
        <div class="stat-card bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-sm font-medium text-blue-600 dark:text-blue-400">{{ translate('totalTasks') }}</h3>
              <p class="text-3xl font-bold text-blue-700 dark:text-blue-300">{{stats?.total || 0}}</p>
            </div>
            <div class="p-3 rounded-full bg-blue-100 dark:bg-blue-800/40 text-blue-600 dark:text-blue-400">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
              </svg>
            </div>
          </div>
        </div>

        <!-- Valmiit tehtävät -->
        <div class="stat-card bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-sm font-medium text-green-600 dark:text-green-400">{{ translate('completed') }}</h3>
              <p class="text-3xl font-bold text-green-700 dark:text-green-300">{{stats?.completed || 0}}</p>
            </div>
            <div class="p-3 rounded-full bg-green-100 dark:bg-green-800/40 text-green-600 dark:text-green-400">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
          </div>
          <div class="mt-2 text-xs text-green-600 dark:text-green-400">
            {{getCompletionPercentage()}}% {{ translate('completionRate') }}
          </div>
        </div>

        <!-- Keskeneräiset tehtävät -->
        <div class="stat-card bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-sm font-medium text-yellow-600 dark:text-yellow-400">{{ translate('inProgress') }}</h3>
              <p class="text-3xl font-bold text-yellow-700 dark:text-yellow-300">{{stats?.inProgress || 0}}</p>
            </div>
            <div class="p-3 rounded-full bg-yellow-100 dark:bg-yellow-800/40 text-yellow-600 dark:text-yellow-400">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
          </div>
        </div>

        <!-- Tehtävät prioriteetin mukaan -->
        <div class="stat-card bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-sm font-medium text-red-600 dark:text-red-400">{{ translate('highPriorityTasks') }}</h3>
              <p class="text-3xl font-bold text-red-700 dark:text-red-300">{{stats?.byPriority?.high || 0}}</p>
            </div>
            <div class="p-3 rounded-full bg-red-100 dark:bg-red-800/40 text-red-600 dark:text-red-400">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Projektitiivistelmä -->
      <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-bold text-gray-900 dark:text-white">{{ translate('activeProjects') }}</h2>
          <a routerLink="/projects" 
             class="btn-primary flex items-center gap-2 transform hover:scale-105 text-sm px-3 py-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
            </svg>
            {{ translate('viewAllProjects') }}
          </a>
        </div>
        
        <div *ngIf="projects.length === 0" class="p-4 text-center text-gray-500 dark:text-gray-400">
          {{ translate('noProjects') }}
        </div>
        
        <div *ngIf="projects.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div *ngFor="let project of getRecentProjects()" 
               class="bg-gray-50 dark:bg-gray-700/50 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all relative">
            <div class="h-2" [style.backgroundColor]="project.color"></div>
            <div class="p-4">
              <div class="flex items-start justify-between">
                <h3 class="font-semibold text-gray-900 dark:text-white">{{ project.name }}</h3>
                <span class="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs font-medium px-2 py-1 rounded-full">
                  {{ getProjectTaskCount(project) }} {{ translate('tasks') }}
                </span>
              </div>
              <p *ngIf="project.description" class="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                {{ project.description }}
              </p>
              <div class="mt-3 flex justify-between items-center text-xs">
                <span class="text-gray-500 dark:text-gray-400">
                  {{ translate('created') }}: {{ project.createdAt | date:'dd.MM.yyyy' }}
                </span>
                <a [routerLink]="['/projects', project.id]" 
                   class="text-blue-600 dark:text-blue-400 hover:underline">
                  {{ translate('viewDetails') }} →
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Aktiviteettiloki -->
      <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
        <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-4">{{ translate('activityLog') }}</h2>
        <div class="space-y-3 max-h-[350px] overflow-y-auto pr-2">
          <div *ngIf="activities.length === 0" class="p-4 text-center text-gray-500 dark:text-gray-400">
            {{ translate('noActivities') }}
          </div>
          <div *ngFor="let activity of getVisibleActivities()" 
               class="p-3 border-b border-gray-100 dark:border-gray-700 last:border-none">
            <div class="flex items-start">
              <!-- Avatar/initials -->
              <div class="h-7 w-7 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-500 dark:text-blue-400 flex items-center justify-center text-xs font-medium">
                {{ activity.userName.charAt(0).toUpperCase() }}
              </div>
              
              <div class="ml-3 flex-1">
                <div class="text-sm flex justify-between items-start">
                  <div>
                    <span class="font-medium text-gray-800 dark:text-gray-200">{{ activity.userName }}</span>
                    <span class="text-gray-600 dark:text-gray-400 ml-1">
                      {{ getActivityText(activity) }}
                    </span>
                    <!-- Tehdään tehtävän nimestä linkki -->
                    <a *ngIf="activity.taskTitle" 
                       [routerLink]="['/tasks', activity.taskId]" 
                       class="ml-1 font-medium text-blue-600 dark:text-blue-400 hover:underline">
                      "{{ activity.taskTitle }}"
                    </a>
                    <!-- Näytetään "Merkitty valmiiksi" -ilmoitus -->
                    <span *ngIf="activity.type === 'status_changed' && activity.details === 'DONE'" 
                          class="ml-2 px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs rounded-full">
                      {{ translate('done') }}
                    </span>
                  </div>
                  <!-- Aikamerkintä selkeämmin esillä -->
                  <span class="text-xs text-gray-500 dark:text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full ml-2">
                    {{ formatDate(activity.timestamp) }}
                  </span>
                </div>
                <!-- Näytetään kommentin sisältö, jos kyseessä on kommentti -->
                <div *ngIf="(activity.type === 'comment_added' || activity.type === 'comment_deleted') && activity.details" 
                     class="mt-1 px-3 py-2 bg-gray-50 dark:bg-gray-700/50 rounded text-sm text-gray-600 dark:text-gray-300 border-l-2 border-blue-400 dark:border-blue-500">
                  "{{ activity.details }}"
                </div>
              </div>
            </div>
          </div>
          
          <!-- Näytä lisää / Näytä vähemmän -->
          <div *ngIf="activities.length > visibleActivitiesCount" class="text-center mt-3">
            <button (click)="toggleActivitiesView()" 
                    class="text-sm text-blue-600 dark:text-blue-400 hover:underline">
              {{ showAllActivities ? translate('showLess') : translate('showMore') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .stat-card {
      @apply p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200;
    }
    
    .quick-action-btn {
      @apply flex items-center space-x-4 p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border border-gray-100 dark:border-gray-700;
    }
    
    .task-status-chart {
      @apply flex justify-around items-end w-full h-full;
    }
    
    .chart-bar-container {
      @apply flex flex-col items-center justify-end w-1/4;
    }
    
    .chart-bar {
      @apply w-full relative flex justify-center items-start rounded-t-lg transition-all duration-500 ease-in-out;
      min-height: 30px;
    }
    
    .chart-value {
      @apply absolute top-2 text-white font-bold text-sm;
    }
    
    .chart-label {
      @apply mt-2 text-xs text-gray-600 dark:text-gray-400 font-medium;
    }
  `]
})
export class DashboardComponent implements OnInit, OnDestroy {
  // Luokan jäsenmuuttujat
  TaskState = TaskState;
  TaskPriority = TaskPriority;
  
  stats: TaskStats | null = null;
  tasks: Task[] = [];
  users: User[] = [];
  categories: Category[] = [];
  activities: ActivityLog[] = [];
  projects: Project[] = [];
  
  // Rajataan näytettävät aktiviteetit
  visibleActivitiesCount: number = 4;
  showAllActivities: boolean = false;
  
  currentUser: User | null = null;
  
  private subscriptions: Subscription[] = [];
  
  constructor(
    private taskService: TaskService,
    private categoryService: CategoryService,
    private authService: AuthService,
    private languageService: LanguageService,
    private activityLogService: ActivityLogService,
    private projectService: ProjectService
  ) {}
  
  ngOnInit() {
    // Tehtävien tilastot
    this.subscriptions.push(
      this.taskService.getStats().subscribe(stats => {
        this.stats = stats;
      })
    );

    // Tehtävät
    this.subscriptions.push(
      this.taskService.getTasks().subscribe(tasks => {
        this.tasks = tasks;
        // Lasketaan käyttäjätilastot
        this.calculateUserStats(tasks);
      })
    );

    // Projektit
    this.subscriptions.push(
      this.projectService.getProjects().subscribe(projects => {
        this.projects = projects;
      })
    );

    // Kategoriat
    this.subscriptions.push(
      this.categoryService.getCategories().subscribe(categories => {
        this.categories = categories;
      })
    );
    
    // Haetaan käyttäjän tehtävät
    this.subscriptions.push(
      this.authService.currentUser$.subscribe(user => {
        this.currentUser = user;
        
        if (user) {
          // Haetaan käyttäjäkohtaiset tehtävät
          this.taskService.getTasksByAssignee(user.id).subscribe(tasks => {
            this.tasks = tasks;
            
            // Päivitetään tilastot käyttäjän tehtävistä
            this.calculateUserStats(tasks);
          });
        }
      })
    );
    
    // Ladataan käyttäjät
    this.subscriptions.push(
      this.authService.getAllUsers().subscribe(users => {
        this.users = users;
      })
    );
    
    // Kielituki
    this.subscriptions.push(
      this.languageService.currentLanguage$.subscribe(() => {
        // Päivitetään, kun kieli vaihtuu
      })
    );
    
    // Aktiviteettien lataaminen
    this.subscriptions.push(
      this.activityLogService.getRecentActivities(10).subscribe(activities => {
        // Suodatetaan aktiviteetit näyttämään vain:
        // 1. Kommentit (COMMENT_ADDED, COMMENT_DELETED)
        // 2. Uudet tehtävät (TASK_CREATED)
        // 3. Valmistuneet tehtävät (STATUS_CHANGED, jossa tila on DONE)
        this.activities = activities.filter(activity => {
          if (activity.type === ActivityType.COMMENT_ADDED || 
              activity.type === ActivityType.COMMENT_DELETED || 
              activity.type === ActivityType.TASK_CREATED) {
            return true;
          }
          
          // Näytetään STATE_CHANGED vain jos tehtävä on merkitty valmiiksi
          if (activity.type === ActivityType.STATUS_CHANGED && 
              activity.details === TaskState.DONE) {
            return true;
          }
          
          return false;
        });
      })
    );
  }
  
  ngOnDestroy() {
    // Siivotaan tilaukset
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
  
  translate(key: string): string {
    return this.languageService.translate(key);
  }
  
  getCompletionPercentage(): number {
    if (!this.stats || this.stats.total === 0) return 0;
    return Math.round((this.stats.completed / this.stats.total) * 100);
  }
  
  getTaskCountByState(state: TaskState): number {
    return this.tasks.filter(task => task.state === state).length;
  }
  
  getTaskPercentageByState(state: TaskState): number {
    const count = this.getTaskCountByState(state);
    const totalCount = this.tasks.length;
    if (totalCount === 0) return 0;
    return Math.max(5, Math.round((count / totalCount) * 100)); // Min 5% to always show bar
  }
  
  getTaskCountByPriority(priority: TaskPriority): number {
    return this.tasks.filter(task => task.priority === priority).length;
  }
  
  getTaskPercentageByPriority(priority: TaskPriority): number {
    const count = this.getTaskCountByPriority(priority);
    const totalCount = this.tasks.length;
    if (totalCount === 0) return 0;
    return Math.max(5, Math.round((count / totalCount) * 100)); // Min 5% to always show bar
  }
  
  getUserName(userId: string | null): string | null {
    if (!userId) return null;
    const user = this.users.find(u => u.id === userId);
    return user ? user.username : null;
  }
  
  // Aktiviteettitekstin muodostaminen
  getActivityText(activity: ActivityLog): string {
    switch (activity.type) {
      case ActivityType.TASK_CREATED:
        return this.translate('taskCreated');
      case ActivityType.TASK_UPDATED:
        return this.translate('taskUpdated');
      case ActivityType.TASK_DELETED:
        return this.translate('taskDeleted');
      case ActivityType.SUBTASK_ADDED:
        return this.translate('subtaskAdded');
      case ActivityType.SUBTASK_COMPLETED:
        return this.translate('subtaskCompleted');
      case ActivityType.SUBTASK_DELETED:
        return this.translate('subtaskDeleted');
      case ActivityType.COMMENT_ADDED:
        return this.translate('commentAdded');
      case ActivityType.COMMENT_DELETED:
        return this.translate('commentDeleted');
      case ActivityType.STATUS_CHANGED:
        return this.translate('statusChanged');
      default:
        return activity.type;
    }
  }
  
  // Aikaleimojen formatointi
  formatDate(timestamp: number): string {
    const date = new Date(timestamp);
    const now = new Date();
    
    // Tänään
    if (date.toDateString() === now.toDateString()) {
      return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    }
    
    // Eilen
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return `${this.translate('yesterday')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    }
    
    // Muut päivät
    return `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  }
  
  // Laske käyttäjäkohtaiset tilastot
  private calculateUserStats(tasks: Task[]) {
    if (!tasks) return;
    
    // Kokonaismäärä
    const total = tasks.length;
    
    // Valmiit tehtävät
    const completed = tasks.filter(t => t.state === TaskState.DONE).length;
    
    // Keskeneräiset tehtävät
    const inProgress = tasks.filter(t => t.state === TaskState.IN_PROGRESS).length;
    
    // Prioriteetin mukaan
    const high = tasks.filter(t => t.priority === TaskPriority.HIGH).length;
    const medium = tasks.filter(t => t.priority === TaskPriority.MEDIUM).length;
    const low = tasks.filter(t => t.priority === TaskPriority.LOW).length;
    
    // Päivitetään käyttäjän tilastot
    this.stats = {
      total,
      completed,
      inProgress,
      byPriority: {
        high,
        medium,
        low
      }
    };
  }
  
  // Palauttaa näytettävät aktiviteetit
  getVisibleActivities(): ActivityLog[] {
    if (this.showAllActivities) {
      return this.activities;
    } else {
      return this.activities.slice(0, this.visibleActivitiesCount);
    }
  }
  
  // Vaihtaa aktiviteettien näkymää
  toggleActivitiesView(): void {
    this.showAllActivities = !this.showAllActivities;
  }

  getRecentProjects(): Project[] {
    return this.projects.slice(-3);
  }

  getProjectTaskCount(project: Project): number {
    return project.taskIds.length;
  }
} 