import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from '../../../services/toast.service';
import { Subscription } from 'rxjs';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed top-6 right-6 z-50 flex flex-col gap-2 items-end max-w-sm">
      <div *ngFor="let toast of toasts" 
          [@fadeInOut]
          class="toast rounded-lg shadow-lg p-4 flex items-start gap-3 w-full"
          [ngClass]="{
            'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200': toast.type === 'success',
            'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200': toast.type === 'error',
            'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200': toast.type === 'warning',
            'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200': toast.type === 'info'
          }">
        
        <!-- Ikoni -->
        <div class="flex-shrink-0 mt-0.5">
          <!-- Success icon -->
          <svg *ngIf="toast.type === 'success'" class="w-5 h-5 text-green-500 dark:text-green-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
          
          <!-- Error icon -->
          <svg *ngIf="toast.type === 'error'" class="w-5 h-5 text-red-500 dark:text-red-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
          
          <!-- Warning icon -->
          <svg *ngIf="toast.type === 'warning'" class="w-5 h-5 text-yellow-500 dark:text-yellow-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
          </svg>
          
          <!-- Info icon -->
          <svg *ngIf="toast.type === 'info'" class="w-5 h-5 text-blue-500 dark:text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
        
        <!-- Sisältö -->
        <div class="flex-1">
          <p class="text-sm font-medium">{{ toast.message }}</p>
        </div>
        
        <!-- Sulkunappi -->
        <button (click)="removeToast(toast.id)" 
                class="ml-auto -mx-1.5 -my-1.5 p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
          <svg class="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .toast {
      max-width: 24rem;
      backdrop-filter: blur(4px);
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
  `],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(20px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0, transform: 'translateX(20px)' }))
      ])
    ])
  ]
})
export class ToastComponent implements OnInit, OnDestroy {
  toasts: Toast[] = [];
  private subscription: Subscription | null = null;

  constructor(private toastService: ToastService) {}

  ngOnInit() {
    this.subscription = this.toastService.toasts$.subscribe(toasts => {
      this.toasts = toasts;
    });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  removeToast(id: string) {
    this.toastService.remove(id);
  }
}
