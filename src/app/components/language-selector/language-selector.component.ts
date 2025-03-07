import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LanguageService, Language } from '../../services/language.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-language-selector',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button 
      (click)="toggleLanguage()" 
      class="language-selector"
      title="{{ currentLanguage === 'en' ? 'Vaihda suomeksi' : 'Change to English' }}">
      <span class="flag">{{ currentLanguage === 'en' ? '🇬🇧' : '🇫🇮' }}</span>
      <span class="lang-code">{{ currentLanguage === 'en' ? 'EN' : 'FI' }}</span>
    </button>
  `,
  styles: [`
    .language-selector {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 4px 10px;
      background-color: rgba(59, 130, 246, 0.1);
      border-radius: 9999px;
      border: 1px solid rgba(59, 130, 246, 0.2);
      color: rgba(59, 130, 246, 1);
      font-weight: 500;
      transition: all 0.2s;
      cursor: pointer;
    }
    
    .language-selector:hover {
      background-color: rgba(59, 130, 246, 0.2);
      border-color: rgba(59, 130, 246, 0.3);
    }
    
    .flag {
      font-size: 16px;
      line-height: 1;
    }
    
    .lang-code {
      font-size: 12px;
      font-weight: bold;
    }
    
    :host-context(.dark) .language-selector {
      background-color: rgba(59, 130, 246, 0.1);
      border-color: rgba(59, 130, 246, 0.3);
      color: rgba(147, 197, 253, 1);
    }
    
    :host-context(.dark) .language-selector:hover {
      background-color: rgba(59, 130, 246, 0.15);
      border-color: rgba(59, 130, 246, 0.4);
    }
  `]
})
export class LanguageSelectorComponent implements OnInit, OnDestroy {
  currentLanguage: Language = 'en';
  private subscription: Subscription | null = null;
  
  constructor(private languageService: LanguageService) {}
  
  ngOnInit() {
    this.currentLanguage = this.languageService.getCurrentLanguage();
    this.subscription = this.languageService.currentLanguage$.subscribe(
      language => this.currentLanguage = language
    );
  }
  
  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
  
  toggleLanguage() {
    this.languageService.toggleLanguage();
  }
} 