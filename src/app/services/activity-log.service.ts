import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ActivityLog, ActivityType } from '../models/activity-log.model';
import { AuthService } from './auth.service';
import { v4 as uuidv4 } from 'uuid';

export interface ActivityDetails {
  taskId?: string;
  taskTitle?: string;
  projectId?: string;
  projectName?: string;
  [key: string]: any;
}

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
  
  // Ensimmäinen ylikuormitus - perinteinen tapa
  addActivity(type: ActivityType, taskId?: string, taskTitle?: string, details?: string): void;
  
  // Toinen ylikuormitus - objektiparametri projekteja varten
  addActivity(activityObject: { type: ActivityType, timestamp: Date, userId: string, details: ActivityDetails }): void;
  
  // Toteutus
  addActivity(typeOrActivity: any, taskId?: string, taskTitle?: string, details?: string): void {
    let newActivity: ActivityLog;
    
    // Tarkistetaan, onko suoraan annettu aktiviteettiobjekti
    if (typeof typeOrActivity === 'object' && 'type' in typeOrActivity && 'timestamp' in typeOrActivity) {
      const currentUser = this.authService.getCurrentUser();
      const activity = typeOrActivity;
      
      newActivity = {
        id: uuidv4(),
        userId: activity.userId || (currentUser ? currentUser.id : 'unknown'),
        userName: currentUser ? currentUser.username : 'Tuntematon käyttäjä',
        type: activity.type,
        timestamp: activity.timestamp.getTime(),
        taskId: activity.details?.taskId,
        taskTitle: activity.details?.taskTitle,
        details: JSON.stringify(activity.details)
      };
    } else {
      // Vanhan tyyppinen aktiviteetin lisäys
      const currentUser = this.authService.getCurrentUser();
      if (!currentUser) return;
      
      newActivity = {
        id: uuidv4(),
        userId: currentUser.id,
        userName: currentUser.username,
        type: typeOrActivity,
        timestamp: Date.now(),
        taskId: taskId,
        taskTitle: taskTitle,
        details: details
      };
    }
    
    const activities = [newActivity, ...this.activitiesSubject.getValue()];
    
    // Pidetään lokien määrä järkevänä - säilytetään max 100 viimeisintä
    const trimmedActivities = activities.slice(0, 100);
    
    this.activitiesSubject.next(trimmedActivities);
    this.saveActivities(trimmedActivities);
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