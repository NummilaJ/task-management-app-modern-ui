import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { LanguageService } from './language.service';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  timeout: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toasts: Toast[] = [];
  private toastsSubject = new BehaviorSubject<Toast[]>([]);
  public toasts$ = this.toastsSubject.asObservable();

  constructor(private languageService: LanguageService) {}

  /**
   * Näyttää onnistumisilmoituksen
   * @param message Ilmoituksen viesti tai käännösavain
   * @param timeout Millisekunteina, kauanko ilmoitus näkyy
   */
  success(message: string, timeout: number = 3000): void {
    this.show(message, 'success', timeout);
  }

  /**
   * Näyttää virheilmoituksen
   * @param message Ilmoituksen viesti tai käännösavain
   * @param timeout Millisekunteina, kauanko ilmoitus näkyy
   */
  error(message: string, timeout: number = 5000): void {
    this.show(message, 'error', timeout);
  }

  /**
   * Näyttää varoitusilmoituksen
   * @param message Ilmoituksen viesti tai käännösavain
   * @param timeout Millisekunteina, kauanko ilmoitus näkyy
   */
  warning(message: string, timeout: number = 4000): void {
    this.show(message, 'warning', timeout);
  }

  /**
   * Näyttää info-ilmoituksen
   * @param message Ilmoituksen viesti tai käännösavain
   * @param timeout Millisekunteina, kauanko ilmoitus näkyy
   */
  info(message: string, timeout: number = 3000): void {
    this.show(message, 'info', timeout);
  }

  /**
   * Näyttää ilmoituksen
   * @param message Ilmoituksen viesti tai käännösavain
   * @param type Ilmoituksen tyyppi
   * @param timeout Millisekunteina, kauanko ilmoitus näkyy
   */
  private show(message: string, type: 'success' | 'error' | 'warning' | 'info', timeout: number): void {
    // Tarkista onko viesti käännösavain
    const translatedMessage = this.languageService.translate(message);
    const finalMessage = translatedMessage === message ? message : translatedMessage;
    
    const id = this.generateId();
    const toast: Toast = { id, message: finalMessage, type, timeout };
    
    this.toasts = [...this.toasts, toast];
    this.toastsSubject.next(this.toasts);
    
    // Aseta ajastin ilmoituksen poistamiselle
    setTimeout(() => {
      this.remove(id);
    }, timeout);
  }

  /**
   * Poistaa ilmoituksen
   * @param id Poistettavan ilmoituksen ID
   */
  remove(id: string): void {
    this.toasts = this.toasts.filter(toast => toast.id !== id);
    this.toastsSubject.next(this.toasts);
  }

  /**
   * Luo uniikin ID:n ilmoitukselle
   */
  private generateId(): string {
    return Math.random().toString(36).substring(2, 9);
  }
}
