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
  `,
  styles: [`
    .login-container {
      max-width: 400px;
      width: 90%;
      margin: 0 auto;
      padding-top: 10vh;
    }

    .login-card {
      background-color: white;
      border-radius: 16px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
      padding: 2rem;
      border: 1px solid rgba(229, 231, 235, 0.8);
      backdrop-filter: blur(10px);
    }

    .dark .login-card {
      background-color: rgba(31, 41, 55, 0.8);
      border-color: rgba(75, 85, 99, 0.8);
    }

    .app-title {
      font-family: var(--font-heading);
      font-weight: var(--font-bold);
      color: #4F46E5;
      font-size: 1.875rem;
      margin-bottom: 1.5rem;
      text-align: center;
      letter-spacing: -0.025em;
    }

    .dark .app-title {
      color: #818CF8;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    .form-label {
      display: block;
      margin-bottom: 0.5rem;
      font-family: var(--font-body);
      font-weight: var(--font-medium);
      color: #4B5563;
      font-size: 0.875rem;
    }

    .dark .form-label {
      color: #E5E7EB;
    }

    .input-field {
      width: 100%;
      padding: 0.75rem 1rem;
      border-radius: 8px;
      border: 2px solid #E5E7EB;
      background-color: white;
      font-size: 1rem;
      transition: all 0.3s;
      font-family: var(--font-body);
    }

    .input-field:focus {
      border-color: #4F46E5;
      box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.2);
      outline: none;
    }

    .dark .input-field {
      background-color: #374151;
      border-color: #4B5563;
      color: #F9FAFB;
    }

    .dark .input-field:focus {
      border-color: #818CF8;
      box-shadow: 0 0 0 3px rgba(129, 140, 248, 0.2);
    }

    .error-message {
      color: #EF4444;
      font-size: 0.875rem;
      margin-top: 0.5rem;
      font-family: var(--font-body);
    }

    .dark .error-message {
      color: #FCA5A5;
    }

    .btn-submit {
      width: 100%;
      background-color: #4F46E5;
      color: white;
      font-weight: var(--font-semibold);
      padding: 0.75rem 1rem;
      border-radius: 8px;
      margin-top: 1rem;
      transition: all 0.3s;
      cursor: pointer;
      border: none;
      font-family: var(--font-body);
      letter-spacing: -0.01em;
    }

    .btn-submit:hover {
      background-color: #4338CA;
      transform: translateY(-2px);
      box-shadow: 0 6px 15px rgba(79, 70, 229, 0.3);
    }

    .btn-submit:active {
      transform: translateY(0);
    }

    .dark .btn-submit {
      background-color: #6366F1;
    }

    .dark .btn-submit:hover {
      background-color: #5661F6;
      box-shadow: 0 6px 15px rgba(99, 102, 241, 0.4);
    }

    .register-link {
      text-align: center;
      margin-top: 1.5rem;
      font-size: 0.875rem;
      color: #6B7280;
      font-family: var(--font-body);
    }

    .dark .register-link {
      color: #9CA3AF;
    }

    .register-link a {
      color: #4F46E5;
      font-weight: var(--font-medium);
      text-decoration: none;
    }

    .register-link a:hover {
      text-decoration: underline;
    }

    .dark .register-link a {
      color: #818CF8;
    }

    .social-logins {
      margin-top: 2rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .social-login-btn {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0.75rem 1rem;
      border-radius: 8px;
      font-weight: var(--font-medium);
      transition: all 0.3s;
      cursor: pointer;
      gap: 0.75rem;
      font-family: var(--font-body);
    }

    .google-btn {
      background-color: white;
      color: #4B5563;
      border: 2px solid #E5E7EB;
    }

    .google-btn:hover {
      background-color: #F9FAFB;
      border-color: #D1D5DB;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
      transform: translateY(-2px);
    }

    .dark .google-btn {
      background-color: #374151;
      color: #E5E7EB;
      border-color: #4B5563;
    }

    .dark .google-btn:hover {
      background-color: #4B5563;
      border-color: #6B7280;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .separator {
      display: flex;
      align-items: center;
      text-align: center;
      margin: 1.5rem 0;
      color: #9CA3AF;
      font-size: 0.875rem;
      font-family: var(--font-body);
    }

    .separator::before,
    .separator::after {
      content: '';
      flex: 1;
      border-bottom: 1px solid #E5E7EB;
    }

    .separator::before {
      margin-right: 0.5rem;
    }

    .separator::after {
      margin-left: 0.5rem;
    }

    .dark .separator {
      color: #9CA3AF;
    }

    .dark .separator::before,
    .dark .separator::after {
      border-color: #4B5563;
    }
  `]
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