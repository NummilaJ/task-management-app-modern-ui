import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from './services/auth.service';
import { TaskService } from './services/task.service';
import { User } from './models/user.model';
import { Task, TaskState } from './models/task.model';
import { Subscription } from 'rxjs';
import { LanguageService } from './services/language.service';
import { LanguageSelectorComponent } from './components/language-selector/language-selector.component';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, LanguageSelectorComponent],
  template: `
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      <!-- Sidebar -->
      <nav class="w-64 bg-white dark:bg-gray-800 shadow-lg h-screen fixed top-0 left-0 overflow-y-auto z-10">
        <div class="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h1 class="text-xl font-bold text-gray-900 dark:text-white">Task Manager</h1>
          <div class="flex items-center space-x-2">
            <app-language-selector></app-language-selector>
            
            <!-- Tumma tila -painike -->
            <button (click)="toggleTheme()" 
                    class="p-2 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 transition-all flex items-center justify-center"
                    title="{{ isDarkMode() ? translate('switchToLightMode') : translate('switchToDarkMode') }}">
              <svg *ngIf="isDarkMode()" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
              </svg>
              <svg *ngIf="!isDarkMode()" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
              </svg>
            </button>
          </div>
        </div>
        
        <div class="p-4">
          <ul class="space-y-1">
            <li>
              <a routerLink="/" 
                routerLinkActive="bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300"
                [routerLinkActiveOptions]="{exact: true}"
                class="block p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition-colors">
                <div class="flex items-center">
                  <svg class="w-5 h-5 mr-3 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                  </svg>
                  {{ translate('dashboard') }}
                </div>
              </a>
            </li>
            <li>
              <a routerLink="/tasks" 
                routerLinkActive="bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300"
                class="block p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition-colors">
                <div class="flex items-center">
                  <svg class="w-5 h-5 mr-3 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
                  </svg>
                  {{ translate('tasks') }}
                </div>
              </a>
            </li>
            <li>
              <a routerLink="/kanban" 
                routerLinkActive="bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300"
                class="block p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition-colors">
                <div class="flex items-center">
                  <svg class="w-5 h-5 mr-3 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>
                  </svg>
                  {{ translate('kanbanBoard') }}
                </div>
              </a>
            </li>
            <li>
              <a routerLink="/categories" 
                routerLinkActive="bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300"
                class="block p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition-colors">
                <div class="flex items-center">
                  <svg class="w-5 h-5 mr-3 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
                  </svg>
                  {{ translate('categories') }}
                </div>
              </a>
            </li>
            <li>
              <a routerLink="/users" 
                routerLinkActive="bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300"
                class="block p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition-colors">
                <div class="flex items-center">
                  <svg class="w-5 h-5 mr-3 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                  </svg>
                  {{ translate('users') }}
                </div>
              </a>
            </li>
          </ul>
        </div>
        
        <div class="p-4 mt-6 border-t border-gray-200 dark:border-gray-700">
          <div class="user-stats mb-6 bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
            <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">{{ translate('totalTasks') }} ({{ user?.username }})</h3>
            <div class="grid grid-cols-2 gap-4">
              <div class="bg-white dark:bg-gray-800 p-3 rounded-lg">
                <h4 class="text-xs font-medium text-gray-500 dark:text-gray-400">{{ translate('completed') }}</h4>
                <p class="text-xl font-bold text-green-500">{{ completedTasks }}</p>
              </div>
              <div class="bg-white dark:bg-gray-800 p-3 rounded-lg">
                <h4 class="text-xs font-medium text-gray-500 dark:text-gray-400">{{ translate('inProgress') }}</h4>
                <p class="text-xl font-bold text-blue-500">{{ inProgressTasks }}</p>
              </div>
            </div>
          </div>
          
          <div *ngIf="user">
            <button (click)="logout()" 
                    class="w-full p-2 mt-4 border border-red-200 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 dark:border-red-900/30 transition-colors">
              {{ translate('logout') }}
            </button>
          </div>
          <div *ngIf="!user">
            <a routerLink="/login" 
               class="block w-full p-2 mt-4 text-center border border-blue-200 rounded-lg text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 dark:border-blue-900/30 transition-colors">
              {{ translate('login') }}
            </a>
          </div>
        </div>
      </nav>

      <!-- Main Content -->
      <div class="ml-64 flex-grow p-6">
        <router-outlet></router-outlet>
      </div>
    </div>
  `,
  styles: []
})
export class AppComponent implements OnInit, OnDestroy {
  user: User | null = null;
  completedTasks: number = 0;
  inProgressTasks: number = 0;
  
  private languageSubscription: Subscription | null = null;
  private themeSubscription: Subscription | null = null;
  
  constructor(
    private authService: AuthService,
    private taskService: TaskService,
    private router: Router,
    private languageService: LanguageService,
    private themeService: ThemeService
  ) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.user = user;
      if (user) {
        this.loadUserStats();
      }
    });
    
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      // Navigaation jälkeen päivitetään tilastot
      if (this.user) {
        this.loadUserStats();
      }
    });
    
    this.languageSubscription = this.languageService.currentLanguage$.subscribe(() => {
      // Kielen vaihtuessa ei tarvitse erityisiä toimenpiteitä, Angular päivittää näkymän
    });
    
    this.themeSubscription = this.themeService.theme$.subscribe(() => {
      // Teeman vaihtuessa ei tarvitse erityisiä toimenpiteitä, ThemeService päivittää document-elementtiä
    });
  }
  
  ngOnDestroy() {
    if (this.languageSubscription) {
      this.languageSubscription.unsubscribe();
    }
    
    if (this.themeSubscription) {
      this.themeSubscription.unsubscribe();
    }
  }
  
  translate(key: string): string {
    return this.languageService.translate(key);
  }
  
  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
  
  private loadUserStats() {
    this.taskService.getTasks().subscribe(tasks => {
      // Rajataan vain käyttäjän tehtävät
      const userTasks = tasks.filter(task => task.assignee === this.user?.id);
      
      // Lasketaan valmiit ja kesken olevat tehtävät
      this.completedTasks = userTasks.filter(task => task.state === TaskState.DONE).length;
      this.inProgressTasks = userTasks.filter(task => task.state === TaskState.IN_PROGRESS).length;
    });
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }

  isDarkMode(): boolean {
    return this.themeService.isDarkMode();
  }
}
