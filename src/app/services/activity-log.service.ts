import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ActivityLog, ActivityType } from '../models/activity-log.model';
import { AuthService } from './auth.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable({
  providedIn: 'root'
})
export class ActivityLogService {
  private STORAGE_KEY = 'activityLogs';
  private activitiesSubject = new BehaviorSubject<ActivityLog[]>(this.loadActivities());
  
  constructor(private authService: AuthService) {}
  
  // Aktiviteettien hakeminen
  getActivities(): Observable<ActivityLog[]> {
    return this.activitiesSubject.asObservable();
  }
  
  // Viimeisimpien aktiviteettien hakeminen (rajoitettu määrä)
  getRecentActivities(count: number = 10): Observable<ActivityLog[]> {
    const activities = this.activitiesSubject.getValue()
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, count);
    
    return new BehaviorSubject<ActivityLog[]>(activities).asObservable();
  }
  
  // Uuden aktiviteetin lisääminen
  addActivity(type: ActivityType, taskId?: string, taskTitle?: string, details?: string): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return;
    
    const newActivity: ActivityLog = {
      id: uuidv4(),
      userId: currentUser.id,
      userName: currentUser.username,
      type,
      timestamp: Date.now(),
      taskId,
      taskTitle,
      details
    };
    
    const activities = [newActivity, ...this.activitiesSubject.getValue()];
    
    // Pidetään lokien määrä järkevänä - säilytetään max 100 viimeisintä
    const trimmedActivities = activities.slice(0, 100);
    
    this.saveActivities(trimmedActivities);
    this.activitiesSubject.next(trimmedActivities);
  }
  
  // Aktiviteettien lataaminen local storagesta
  private loadActivities(): ActivityLog[] {
    const storedData = localStorage.getItem(this.STORAGE_KEY);
    if (storedData) {
      try {
        return JSON.parse(storedData);
      } catch (e) {
        console.error('Virhe aktiviteettilokien lataamisessa:', e);
      }
    }
    return [];
  }
  
  // Aktiviteettien tallentaminen local storageen
  private saveActivities(activities: ActivityLog[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(activities));
  }
  
  // Aktiviteettien tyhjentäminen
  clearActivities(): void {
    this.saveActivities([]);
    this.activitiesSubject.next([]);
  }
} 