import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Project } from '../models/project.model';
import { ProjectService } from './project.service';

@Injectable({
  providedIn: 'root'
})
export class ProjectContextService {
  // Aktiivinen projekti
  private activeProjectSubject = new BehaviorSubject<Project | null>(null);
  public activeProject$ = this.activeProjectSubject.asObservable();
  
  // Aktiivisen projektin ID tallennetaan local storageen
  private readonly STORAGE_KEY = 'activeProjectId';
  
  constructor(private projectService: ProjectService) {
    // Ladataan tallennettu aktiivinen projekti kun palvelu käynnistyy
    this.loadActiveProject();
  }
  
  /**
   * Lataa tallennetun aktiivisen projektin local storagesta
   */
  private loadActiveProject(): void {
    const savedProjectId = localStorage.getItem(this.STORAGE_KEY);
    
    if (savedProjectId) {
      this.projectService.getProjectById(savedProjectId).subscribe(project => {
        if (project) {
          this.activeProjectSubject.next(project);
        } else {
          // Jos projektia ei löydy, poistetaan tallennettu ID
          localStorage.removeItem(this.STORAGE_KEY);
        }
      });
    }
  }
  
  /**
   * Asettaa aktiivisen projektin
   */
  setActiveProject(project: Project | null): void {
    this.activeProjectSubject.next(project);
    
    if (project) {
      localStorage.setItem(this.STORAGE_KEY, project.id);
    } else {
      localStorage.removeItem(this.STORAGE_KEY);
    }
  }
  
  /**
   * Palauttaa aktiivisen projektin
   */
  getActiveProject(): Project | null {
    return this.activeProjectSubject.value;
  }
  
  /**
   * Tyhjentää aktiivisen projektin
   */
  clearActiveProject(): void {
    this.setActiveProject(null);
  }
} 