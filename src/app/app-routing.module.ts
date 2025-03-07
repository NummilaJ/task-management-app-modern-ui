import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TaskListComponent } from './components/task-list/task-list.component';
import { TaskViewComponent } from './components/task-view/task-view.component';
import { CategoryManagerComponent } from './components/category-manager/category-manager.component';
import { LoginComponent } from './components/login/login.component';
import { UserManagementComponent } from './components/user-management/user-management.component';
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';
import { KanbanViewComponent } from './components/kanban-view/kanban-view.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';

export const routes: Routes = [
  { 
    path: '', 
    component: DashboardComponent,
    title: 'Task Management - Dashboard',
    canActivate: [AuthGuard]
  },
  {
    path: 'create',
    component: TaskListComponent,
    title: 'Task Management - Create Task',
    canActivate: [AuthGuard]
  },
  { 
    path: 'tasks', 
    component: TaskViewComponent,
    title: 'Task Management - All Tasks',
    canActivate: [AuthGuard]
  },
  { 
    path: 'tasks/:id', 
    component: TaskViewComponent,
    title: 'Task Management - Task Details',
    canActivate: [AuthGuard]
  },
  {
    path: 'kanban',
    component: KanbanViewComponent,
    title: 'Task Management - Kanban Board',
    canActivate: [AuthGuard]
  },
  {
    path: 'categories',
    component: CategoryManagerComponent,
    title: 'Task Management - Categories',
    canActivate: [AuthGuard]
  },
  {
    path: 'users',
    component: UserManagementComponent,
    title: 'Task Management - User Management',
    canActivate: [AuthGuard, AdminGuard]
  },
  {
    path: 'login',
    component: LoginComponent,
    title: 'Task Management - Login'
  },
  { 
    path: '**', 
    redirectTo: '' 
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
