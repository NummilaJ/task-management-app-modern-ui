import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Project } from '../../../models/project.model';
import { ProjectService } from '../../../services/project.service';
import { ProjectContextService } from '../../../services/project-context.service';
import { LanguageService } from '../../../services/language.service';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-project-selector',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="relative">
      <div class="flex items-center space-x-2 p-1">
        <label class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ translate('activeProject') }}:</label>
        <select 
          [(ngModel)]="selectedProjectId" 
          (change)="onProjectChange()"
          class="p-2 text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8">
          <option [ngValue]="null">{{ translate('allProjects') }}</option>
          <option *ngFor="let project of projects" [ngValue]="project.id">
            {{ project.name }}
          </option>
        </select>
      </div>
    </div>
  `,
  styles: [`
    .project-selector {
      @apply relative;
    }
  `]
})
export class ProjectSelectorComponent implements OnInit, OnDestroy {
  projects: Project[] = [];
  selectedProjectId: string | null = null;
  selectedProject: Project | null = null;
  
  private subscriptions: Subscription[] = [];
  
  constructor(
    private projectService: ProjectService,
    private projectContextService: ProjectContextService,
    private languageService: LanguageService
  ) {}
  
  ngOnInit(): void {
    // Ladataan projektit
    const projectsSub = this.projectService.getProjects().subscribe(projects => {
      this.projects = projects;
    });
    this.subscriptions.push(projectsSub);
    
    // Tilataan aktiivinen projekti
    const projectContextSub = this.projectContextService.activeProject$.subscribe(project => {
      this.selectedProject = project;
      this.selectedProjectId = project?.id || null;
    });
    this.subscriptions.push(projectContextSub);
  }
  
  ngOnDestroy(): void {
    // Puretaan tilaukset
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
  
  onProjectChange(): void {
    // Etsi valittu projekti
    const selectedProject = this.selectedProjectId 
      ? this.projects.find(p => p.id === this.selectedProjectId)
      : null;
      
    // Aseta aktiivinen projekti
    this.projectContextService.setActiveProject(selectedProject || null);
  }
  
  translate(key: string): string {
    return this.languageService.translate(key);
  }
} 