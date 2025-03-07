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
    <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div class="max-w-md w-full space-y-8 p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
        <div class="text-center">
          <h2 class="text-3xl font-bold text-gray-900 dark:text-white">Kirjaudu sisään</h2>
          <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Käytä tunnusta ja salasanaa kirjautuaksesi järjestelmään
          </p>
        </div>
        
        <div *ngIf="errorMessage" class="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-3 rounded-lg">
          {{errorMessage}}
        </div>
        
        <form class="mt-8 space-y-6" (ngSubmit)="onSubmit()">
          <div class="space-y-4">
            <div>
              <label for="username" class="text-sm font-medium text-gray-700 dark:text-gray-300">Käyttäjätunnus</label>
              <input id="username" name="username" type="text" [(ngModel)]="username" required
                     class="input-field w-full mt-1">
            </div>
            
            <div>
              <label for="password" class="text-sm font-medium text-gray-700 dark:text-gray-300">Salasana</label>
              <input id="password" name="password" type="password" [(ngModel)]="password" required
                     class="input-field w-full mt-1">
            </div>
          </div>
          
          <div>
            <button type="submit" 
                    class="w-full btn-primary py-3">
              Kirjaudu
            </button>
          </div>
        </form>
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