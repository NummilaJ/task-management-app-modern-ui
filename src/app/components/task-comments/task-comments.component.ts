import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Comment } from '../../models/comment.model';
import { Task } from '../../models/task.model';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-task-comments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <h3 class="text-lg font-medium text-gray-900 dark:text-white">Comments</h3>
      
      <!-- Kommenttien lista -->
      <div class="space-y-4 max-h-[300px] overflow-y-auto pr-2">
        <div *ngIf="!task?.comments?.length" class="text-gray-500 dark:text-gray-400 text-center py-6">
          <svg class="w-12 h-12 mx-auto mb-2 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" 
                 d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
          </svg>
          <p>No comments yet</p>
        </div>
        
        <div *ngFor="let comment of task?.comments || []" class="comment-item p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <div class="flex justify-between items-start mb-2">
            <div class="flex items-center">
              <div class="flex-shrink-0 h-8 w-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <span class="text-sm font-medium text-blue-700 dark:text-blue-300">
                  {{(comment.userName ? comment.userName.substring(0, 1) : 'U').toUpperCase()}}
                </span>
              </div>
              <div class="ml-3">
                <p class="text-sm font-medium text-gray-900 dark:text-white">
                  {{comment.userName}}
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  {{comment.createdAt | date:'d.M.yyyy HH:mm'}}
                </p>
              </div>
            </div>
            <button *ngIf="canDeleteComment(comment)" 
                    (click)="deleteComment(comment)"
                    class="text-sm text-gray-400 hover:text-red-500 dark:hover:text-red-400">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          <div class="pl-11">
            <p class="text-gray-700 dark:text-gray-300 whitespace-pre-line">{{comment.text}}</p>
          </div>
        </div>
      </div>
      
      <!-- Uuden kommentin lisääminen -->
      <div *ngIf="currentUser" class="mt-4">
        <div class="flex items-start space-x-3">
          <div class="flex-shrink-0 h-8 w-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
            <span class="text-sm font-medium text-blue-700 dark:text-blue-300">
              {{currentUser.username.substring(0, 1).toUpperCase()}}
            </span>
          </div>
          <div class="flex-1">
            <textarea
              [(ngModel)]="newCommentText"
              rows="2"
              placeholder="Add a comment..."
              (keydown)="handleKeyEvent($event)"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white transition-colors duration-200"
            ></textarea>
            <div class="flex justify-between mt-2">
              <small class="text-gray-500 dark:text-gray-400">Press Ctrl+Enter to send</small>
              <button
                (click)="addComment()"
                [disabled]="!newCommentText.trim()"
                class="btn-primary btn-sm px-4"
                [ngClass]="{'opacity-50 cursor-not-allowed': !newCommentText.trim()}"
              >
                Comment
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div *ngIf="!currentUser" class="mt-4 text-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
        <p class="text-sm text-gray-600 dark:text-gray-400">You need to be logged in to add comments</p>
      </div>
    </div>
  `,
  styles: [`
    .comment-item {
      transition: background-color 0.2s ease;
    }
    
    .comment-item:hover {
      background-color: rgba(0, 0, 0, 0.02);
    }
    
    .dark .comment-item:hover {
      background-color: rgba(255, 255, 255, 0.03);
    }
  `]
})
export class TaskCommentsComponent implements OnInit {
  @Input() task: Task | null = null;
  @Output() commentAdded = new EventEmitter<Comment>();
  @Output() commentDeleted = new EventEmitter<string>();
  
  newCommentText: string = '';
  currentUser: User | null = null;
  
  constructor(private authService: AuthService) {}
  
  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }
  
  addComment() {
    if (!this.task || !this.currentUser || !this.newCommentText.trim()) {
      return;
    }
    
    const newComment: Comment = {
      id: uuidv4(),
      taskId: this.task.id,
      userId: this.currentUser.id,
      userName: this.currentUser.username,
      text: this.newCommentText.trim(),
      createdAt: new Date()
    };
    
    this.commentAdded.emit(newComment);
    this.newCommentText = '';
  }
  
  deleteComment(comment: Comment) {
    if (this.canDeleteComment(comment)) {
      this.commentDeleted.emit(comment.id);
    }
  }
  
  canDeleteComment(comment: Comment): boolean {
    // Käyttäjä voi poistaa vain omia kommenttejaan tai ylläpitäjä voi poistaa minkä tahansa
    return this.currentUser !== null && 
           (comment.userId === this.currentUser.id || this.authService.isAdmin());
  }
  
  handleKeyEvent(event: KeyboardEvent): void {
    // Lisää kommentti, kun painetaan Ctrl+Enter
    if (event.key === 'Enter' && event.ctrlKey) {
      event.preventDefault();
      this.addComment();
    }
  }
} 