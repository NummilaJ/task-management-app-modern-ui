import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private themeSubject = new BehaviorSubject<Theme>('light');
  public theme$ = this.themeSubject.asObservable();

  constructor() {
    // Tarkista järjestelmän teema ja tallennettu teema
    this.initializeTheme();
    
    // Kuuntele järjestelmän teeman muutoksia
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
      if (!localStorage.getItem('theme')) {
        this.setTheme(e.matches ? 'dark' : 'light');
      }
    });
  }

  private initializeTheme() {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    
    if (savedTheme) {
      // Käytetään tallennettua teemaa jos sellainen on
      this.setTheme(savedTheme);
    } else {
      // Käytetään järjestelmän teemaa, jos ei ole tallennettua
      this.setTheme(prefersDark ? 'dark' : 'light');
    }
  }

  setTheme(theme: Theme) {
    // Tallennetaan teema localStorageen
    localStorage.setItem('theme', theme);
    
    // Poistetaan kumpikin teemaluokka ja lisätään uusi luokka
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
    
    // Päivitetään teema kaikille tilaajille
    this.themeSubject.next(theme);
    
    // Debug-viesti konsoli (voidaan poistaa tuotannossa)
    console.log('Theme set to:', theme);
  }

  toggleTheme() {
    const currentTheme = this.themeSubject.value;
    this.setTheme(currentTheme === 'light' ? 'dark' : 'light');
  }

  isDarkMode(): boolean {
    return this.themeSubject.value === 'dark';
  }
} 