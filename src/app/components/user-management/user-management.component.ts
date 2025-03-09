import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User, UserRole } from '../../models/user.model';
import { LanguageService } from '../../services/language.service';
import { ConfirmModalComponent } from '../confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmModalComponent],
  template: `
    <div *ngIf="!isAdmin" class="text-center py-10">
      <h2 class="text-2xl font-bold text-red-600 dark:text-red-400">{{ translate('accessDenied') }}</h2>
      <p class="mt-2 text-gray-600 dark:text-gray-400">{{ translate('adminOnlyAccess') }}</p>
    </div>
    
    <div *ngIf="isAdmin" class="space-y-8">
      <div class="flex justify-between items-center">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">{{ translate('userManagement') }}</h2>
        <button (click)="showNewUserForm = true" class="btn-primary">
          <svg class="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
          {{ translate('createUser') }}
        </button>
      </div>
      
      <!-- Uuden käyttäjän lomake -->
      <div *ngIf="showNewUserForm" class="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-xl shadow-sm">
        <h3 class="text-lg font-semibold mb-4 text-gray-900 dark:text-white">{{ translate('newUser') }}</h3>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">{{ translate('username') }}</label>
            <input type="text" [(ngModel)]="newUser.username" class="input-field w-full mt-1">
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">{{ translate('email') }}</label>
            <input type="email" [(ngModel)]="newUser.email" class="input-field w-full mt-1">
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">{{ translate('password') }}</label>
            <input type="password" [(ngModel)]="newUser.password" class="input-field w-full mt-1">
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">{{ translate('role') }}</label>
            <select [(ngModel)]="newUser.role" class="input-field w-full mt-1">
              <option [ngValue]="UserRole.USER">{{ translate('user') }}</option>
              <option [ngValue]="UserRole.ADMIN">{{ translate('admin') }}</option>
            </select>
          </div>
        </div>
        
        <div class="flex justify-end mt-6 space-x-4">
          <button (click)="showNewUserForm = false" class="btn-light">
            {{ translate('cancel') }}
          </button>
          <button (click)="createUser()" class="btn-primary">
            {{ translate('save') }}
          </button>
        </div>
      </div>
      
      <!-- Käyttäjälista -->
      <div class="overflow-x-auto">
        <table class="min-w-full bg-white dark:bg-gray-800 rounded-xl shadow-sm">
          <thead class="bg-gray-50 dark:bg-gray-700/50">
            <tr>
              <th class="py-3.5 px-4 text-left text-sm font-semibold text-gray-900 dark:text-white">{{ translate('username') }}</th>
              <th class="py-3.5 px-4 text-left text-sm font-semibold text-gray-900 dark:text-white">{{ translate('email') }}</th>
              <th class="py-3.5 px-4 text-left text-sm font-semibold text-gray-900 dark:text-white">{{ translate('role') }}</th>
              <th class="py-3.5 px-4 text-left text-sm font-semibold text-gray-900 dark:text-white">{{ translate('created') }}</th>
              <th class="py-3.5 px-4 text-right text-sm font-semibold text-gray-900 dark:text-white">{{ translate('actions') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr *ngFor="let user of users" class="hover:bg-gray-50 dark:hover:bg-gray-700/20">
              <td class="py-4 px-4 text-sm text-gray-900 dark:text-white">{{user.username}}</td>
              <td class="py-4 px-4 text-sm text-gray-900 dark:text-white">{{user.email}}</td>
              <td class="py-4 px-4 text-sm">
                <span [ngClass]="{
                  'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300': user.role === UserRole.ADMIN,
                  'bg-gray-100 text-gray-800 dark:bg-gray-700/50 dark:text-gray-300': user.role === UserRole.USER
                }" class="px-2 py-1 rounded-full text-xs font-medium">
                  {{user.role === UserRole.ADMIN ? translate('admin') : translate('user')}}
                </span>
              </td>
              <td class="py-4 px-4 text-sm text-gray-500 dark:text-gray-400">
                {{user.createdAt | date:'d.M.yyyy HH:mm'}}
              </td>
              <td class="py-4 px-4 text-right text-sm font-medium">
                <button *ngIf="currentUser?.id !== user.id" 
                        (click)="startDeleteUser(user.id)"
                        class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 ml-3">
                  {{ translate('deleteUser') }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Vahvistusmodaali käyttäjän poistamiseen -->
      <app-confirm-modal
        [isOpen]="isConfirmDeleteOpen"
        [title]="translate('deleteUser')"
        [message]="translate('confirmDeleteUser')"
        (confirm)="confirmDeleteUser()"
        (cancel)="cancelDeleteUser()">
      </app-confirm-modal>
    </div>
  `
})
export class UserManagementComponent implements OnInit {
  users: User[] = [];
  currentUser: User | null = null;
  isAdmin = false;
  showNewUserForm = false;
  UserRole = UserRole; // Eksportoidaan template:en käytettäväksi
  
  isConfirmDeleteOpen = false;
  userIdToDelete: string | null = null;
  
  newUser: Omit<User, 'id' | 'createdAt'> = {
    username: '',
    email: '',
    password: '',
    role: UserRole.USER
  };
  
  constructor(
    private authService: AuthService,
    private router: Router,
    private languageService: LanguageService
  ) {}
  
  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.isAdmin = this.authService.isAdmin();
      
      if (!user) {
        this.router.navigate(['/login']);
      } else if (!this.isAdmin) {
        this.router.navigate(['/']);
      }
    });
    
    this.loadUsers();
  }
  
  translate(key: string): string {
    return this.languageService.translate(key);
  }
  
  loadUsers() {
    this.authService.getAllUsers().subscribe(users => {
      this.users = users;
    });
  }
  
  createUser() {
    if (!this.currentUser) return;
    
    if (!this.newUser.username || !this.newUser.email || !this.newUser.password) {
      // Tähän voisi lisätä virheilmoituksen
      return;
    }
    
    this.authService.createUser(this.newUser, this.currentUser.id).subscribe(() => {
      this.showNewUserForm = false;
      this.newUser = {
        username: '',
        email: '',
        password: '',
        role: UserRole.USER
      };
      this.loadUsers();
    });
  }
  
  startDeleteUser(userId: string) {
    this.userIdToDelete = userId;
    this.isConfirmDeleteOpen = true;
  }
  
  confirmDeleteUser() {
    if (this.userIdToDelete) {
      this.authService.deleteUser(this.userIdToDelete).subscribe(() => {
        this.loadUsers();
        this.cancelDeleteUser();
      });
    }
  }
  
  cancelDeleteUser() {
    this.isConfirmDeleteOpen = false;
    this.userIdToDelete = null;
  }
} 