import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6">
      <div class="w-full max-w-md">
        <!-- Logo / Brändäys -->
        <div class="text-center mb-8">
          <div class="inline-block p-4 bg-blue-500 rounded-full mb-4">
            <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
            </svg>
          </div>
          <h2 class="text-3xl font-extrabold text-gray-900 dark:text-white">Task Manager</h2>
          <p class="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Kirjaudu sisään jatkaaksesi
          </p>
        </div>
      
        <div class="bg-white dark:bg-gray-800 py-8 px-6 shadow-xl rounded-xl">
          <div *ngIf="errorMessage" class="mb-6 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-3 rounded-lg text-sm">
            {{errorMessage}}
          </div>
          
          <form class="space-y-6" (ngSubmit)="onSubmit()">
            <div>
              <label for="username" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Käyttäjätunnus</label>
              <div class="mt-1">
                <input id="username" name="username" type="text" [(ngModel)]="username" required
                      class="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-900 dark:text-white sm:text-sm" 
                      placeholder="admin">
              </div>
            </div>
            
            <div>
              <label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Salasana</label>
              <div class="mt-1">
                <input id="password" name="password" type="password" [(ngModel)]="password" required
                      class="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-900 dark:text-white sm:text-sm"
                      placeholder="••••••••">
              </div>
            </div>
            
            <div>
              <button type="submit" 
                    class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                Kirjaudu sisään
              </button>
            </div>
          </form>
        </div>
        
        <div class="mt-4 text-center text-xs text-gray-600 dark:text-gray-400">
          <p>Demo-käyttäjä: admin / salasana: admin</p>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  errorMessage: string = '';
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}
  
  onSubmit() {
    if (!this.username || !this.password) {
      this.errorMessage = 'Syötä käyttäjätunnus ja salasana';
      return;
    }
    
    this.authService.login(this.username, this.password).subscribe(user => {
      if (user) {
        this.router.navigate(['/']);
      } else {
        this.errorMessage = 'Virheellinen käyttäjätunnus tai salasana';
      }
    });
  }
} 