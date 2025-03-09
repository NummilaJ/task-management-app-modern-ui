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
import { ProjectSelectorComponent } from './components/shared/project-selector/project-selector.component';
import { ToastComponent } from './components/shared/toast/toast.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, LanguageSelectorComponent, ProjectSelectorComponent, ToastComponent],
  template: `
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col md:flex-row">
      <!-- Login / Kirjautumaton tila -->
      <div *ngIf="isLoginPage" class="min-h-screen w-full">
        <div class="absolute top-4 right-4 flex items-center space-x-2">
          <app-language-selector></app-language-selector>
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
        <router-outlet></router-outlet>
        <app-toast></app-toast>
      </div>

      <!-- Kirjautunut tila -->
      <ng-container *ngIf="!isLoginPage">
        <!-- Mobile header -->
        <div class="md:hidden bg-white dark:bg-gray-800 shadow-lg p-4 flex items-center justify-between">
          <button (click)="toggleSidebar()" class="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>
          <h1 class="text-xl font-bold text-gray-900 dark:text-white">Task Manager</h1>
          <div class="flex items-center">
            <app-language-selector></app-language-selector>
          </div>
        </div>
        
        <!-- Sidebar -->
        <nav [class]="'bg-white dark:bg-gray-800 shadow-lg h-screen overflow-y-auto z-20 flex flex-col transition-all duration-300 ' + 
                     (isMobile ? (sidebarOpen ? 'fixed top-0 left-0 w-64' : 'fixed top-0 -left-64 w-64') : 'w-64 fixed top-0 left-0')">
          <div class="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between shrink-0">
            <h1 class="text-xl font-bold text-gray-900 dark:text-white">Task Manager</h1>
            <div class="flex items-center space-x-2">
              <app-language-selector class="hidden md:block"></app-language-selector>
              
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
              
              <!-- Mobile sidebar close button -->
              <button (click)="toggleSidebar()" class="md:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
          </div>
          
          <!-- Käyttäjätiedot -->
          <div class="px-4 py-3 border-b border-gray-200 dark:border-gray-700 shrink-0">
            <div class="flex items-center">
              <div class="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold mr-3">
                {{ getUserInitials() }}
              </div>
              <div>
                <p class="font-medium text-gray-800 dark:text-white">{{ user?.username || 'Guest' }}</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">{{ user?.role || '' }}</p>
              </div>
            </div>
          </div>
          
          <!-- Aktiivinen projekti -->
          <div class="px-4 py-2 border-b border-gray-200 dark:border-gray-700 shrink-0">
            <app-project-selector></app-project-selector>
          </div>
          
          <!-- Valikko-osio -->
          <div class="py-4 px-4 flex-grow overflow-y-auto">
            <ul class="space-y-2">
              <!-- Päävalikko -->
              <li class="mb-2">
                <h3 class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider px-2 mb-1">{{ translate('mainMenu') }}</h3>
                <ul class="space-y-1">
                  <li>
                    <a routerLink="/" 
                      routerLinkActive="bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 font-medium"
                      [routerLinkActiveOptions]="{exact: true}"
                      class="flex items-center px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition-all group">
                      <svg class="w-5 h-5 mr-3 text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                      </svg>
                      <span>{{ translate('dashboard') }}</span>
                    </a>
                  </li>
                </ul>
              </li>
              
              <!-- Tehtävät -->
              <li class="mb-2">
                <h3 class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider px-2 mb-1">{{ translate('tasks') }}</h3>
                <ul class="space-y-1">
                  <li>
                    <a routerLink="/tasks" 
                      routerLinkActive="bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 font-medium"
                      class="flex items-center px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition-all group">
                      <svg class="w-5 h-5 mr-3 text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
                      </svg>
                      <span>{{ translate('tasks') }}</span>
                    </a>
                  </li>
                  
                  <li>
                    <a routerLink="/kanban" 
                      routerLinkActive="bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 font-medium"
                      class="flex items-center px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition-all group">
                      <svg class="w-5 h-5 mr-3 text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"></path>
                      </svg>
                      <span>{{ translate('kanban') }}</span>
                    </a>
                  </li>
                  
                  <li>
                    <a routerLink="/projects" 
                      routerLinkActive="bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 font-medium"
                      class="flex items-center px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition-all group">
                      <svg class="w-5 h-5 mr-3 text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                      </svg>
                      <span>{{ translate('projects') }}</span>
                    </a>
                  </li>
                </ul>
              </li>
              
              <!-- Hallinta -->
              <li class="mb-2">
                <h3 class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider px-2 mb-1">{{ translate('management') }}</h3>
                <ul class="space-y-1">
                  <li>
                    <a routerLink="/categories" 
                      routerLinkActive="bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 font-medium"
                      class="flex items-center px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition-all group">
                      <svg class="w-5 h-5 mr-3 text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
                      </svg>
                      <span>{{ translate('categories') }}</span>
                    </a>
                  </li>
                  
                  <li *ngIf="user && user.role === 'ADMIN'">
                    <a routerLink="/users" 
                      routerLinkActive="bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 font-medium"
                      class="flex items-center px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition-all group">
                      <svg class="w-5 h-5 mr-3 text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                      </svg>
                      <span>{{ translate('users') }}</span>
                    </a>
                  </li>
                </ul>
              </li>

              <!-- Logout -->
              <li class="mt-8">
                <button (click)="logout()" 
                  class="w-full flex items-center px-3 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-gray-700 dark:text-gray-200 hover:text-red-700 dark:hover:text-red-300 transition-all group">
                  <svg class="w-5 h-5 mr-3 text-gray-500 dark:text-gray-400 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                  </svg>
                  <span>{{ translate('logout') }}</span>
                </button>
              </li>
            </ul>
          </div>
        </nav>

        <!-- Main content -->
        <div class="flex-grow md:ml-64 p-4 md:p-6 transition-all duration-300">
          <!-- Overlay for mobile sidebar -->
          <div *ngIf="sidebarOpen" 
              (click)="toggleSidebar()"
              class="md:hidden fixed inset-0 bg-black bg-opacity-50 z-10"></div>
          
          <!-- Main content area -->
          <router-outlet></router-outlet>
          
          <!-- Toast notifications -->
          <app-toast></app-toast>
        </div>
      </ng-container>
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
    // Tarkista onko mobiililaite
    this.checkScreenSize();
    
    // Tarkkaile ikkunan kokoa
    window.addEventListener('resize', this.onResize.bind(this));
    
    // Kirjautuneen käyttäjän tietojen lataaminen
    this.authService.currentUser$.subscribe(user => {
      this.user = user;
      if (user) {
        this.loadUserStats();
      }
    });
    
    // Tarkista onko kirjautumissivu ja päivitä tila reittien muuttuessa
    this.checkIfLoginPage();
    
    // Reitinmuutokset
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        // Tarkista kirjautumissivu
        this.checkIfLoginPage();
        
        // Sulke sivuvalikon mobiilissa reitinmuutoksen yhteydessä
        if (this.isMobile && this.sidebarOpen) {
          this.sidebarOpen = false;
        }
      });
      
    // Kielen muutoksen seuraaminen
    this.languageSubscription = this.languageService.currentLanguage$.subscribe(() => {
      // Päivitetään kielimuutokset
    });
    
    // Teeman muutoksen seuraaminen
    this.themeSubscription = this.themeService.theme$.subscribe(() => {
      // Päivitetään teemamuutokset
    });
  }
  
  ngOnDestroy() {
    if (this.languageSubscription) {
      this.languageSubscription.unsubscribe();
    }
    
    if (this.themeSubscription) {
      this.themeSubscription.unsubscribe();
    }
    
    // Poistetaan resize-kuuntelija
    window.removeEventListener('resize', this.onResize.bind(this));
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

  getUserInitials(): string {
    if (this.user && this.user.username) {
      return this.user.username.split(' ').map(word => word.charAt(0)).join('').toUpperCase();
    }
    return '';
  }

  sidebarOpen: boolean = true;
  isMobile: boolean = false;

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  // Ikkunan koon tarkistus
  private checkScreenSize(): void {
    this.isMobile = window.innerWidth < 768; // md breakpoint Tailwindissa
    this.sidebarOpen = !this.isMobile; // Mobiilissa suljettu, desktop-näkymässä auki
  }
  
  // Ikkunan koon muutoksiin reagointi
  private onResize(): void {
    this.checkScreenSize();
  }

  isLoginPage: boolean = false;

  // Tarkistaa onko kyseessä kirjautumissivu
  private checkIfLoginPage(): void {
    this.isLoginPage = this.router.url.includes('/login');
  }
}
