import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type Language = 'fi' | 'en';

interface Translations {
  [key: string]: {
    en: string;
    fi: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private languageSubject = new BehaviorSubject<Language>(this.loadLanguage());
  currentLanguage$ = this.languageSubject.asObservable();
  
  private translations: Translations = {
    // Navigaatio
    mainMenu: {
      en: 'Main Menu',
      fi: 'Päävalikko'
    },
    management: {
      en: 'Management',
      fi: 'Hallinta'
    },
    tasks: { 
      en: 'Tasks', 
      fi: 'Tehtävät' 
    },
    kanban: { 
      en: 'Kanban', 
      fi: 'Kanban' 
    },
    kanbanBoard: { 
      en: 'Kanban Board', 
      fi: 'Kanban-taulu' 
    },
    addTask: { 
      en: 'Create Task', 
      fi: 'Luo tehtävä' 
    },
    newTask: { 
      en: 'New Task', 
      fi: 'Uusi tehtävä' 
    },
    categories: { 
      en: 'Categories', 
      fi: 'Kategoriat' 
    },
    users: { 
      en: 'Users', 
      fi: 'Käyttäjät' 
    },
    tableView: { 
      en: 'Table View', 
      fi: 'Taulukkönäkymä'
    },
    
    // Suodattimet
    filterSettings: { 
      en: 'Filter Settings', 
      fi: 'Suodatusasetukset' 
    },
    state: { 
      en: 'State', 
      fi: 'Tila' 
    },
    allStates: { 
      en: 'All States', 
      fi: 'Kaikki tilat' 
    },
    priority: { 
      en: 'Priority', 
      fi: 'Prioriteetti' 
    },
    allPriorities: { 
      en: 'All Priorities', 
      fi: 'Kaikki prioriteetit' 
    },
    category: { 
      en: 'Category', 
      fi: 'Kategoria' 
    },
    allCategories: { 
      en: 'All Categories', 
      fi: 'Kaikki kategoriat' 
    },
    myTasks: { 
      en: 'My Tasks', 
      fi: 'Omat tehtävät' 
    },
    allTasks: { 
      en: 'All Tasks', 
      fi: 'Kaikki tehtävät' 
    },
    assignedToMe: { 
      en: 'Assigned to me', 
      fi: 'Minulle määrätyt' 
    },
    createdByMe: { 
      en: 'Created by me', 
      fi: 'Minun luomani' 
    },
    sortBy: { 
      en: 'Sort By', 
      fi: 'Järjestä' 
    },
    direction: { 
      en: 'Direction', 
      fi: 'Suunta' 
    },
    ascending: { 
      en: 'Ascending', 
      fi: 'Nouseva' 
    },
    descending: { 
      en: 'Descending', 
      fi: 'Laskeva' 
    },
    clearFilters: { 
      en: 'Clear Filters', 
      fi: 'Tyhjennä suodattimet' 
    },
    
    // Tehtävätilat
    toDo: { 
      en: 'To Do', 
      fi: 'Tekemättä' 
    },
    inProgress: { 
      en: 'In Progress', 
      fi: 'Kesken' 
    },
    done: { 
      en: 'Done', 
      fi: 'Valmis' 
    },
    
    // Prioriteetit
    high: { 
      en: 'High', 
      fi: 'Korkea' 
    },
    medium: { 
      en: 'Medium', 
      fi: 'Keskitaso' 
    },
    low: { 
      en: 'Low', 
      fi: 'Matala' 
    },
    
    // Napit ja toiminnot
    save: { 
      en: 'Save', 
      fi: 'Tallenna' 
    },
    cancel: { 
      en: 'Cancel', 
      fi: 'Peruuta' 
    },
    delete: { 
      en: 'Delete', 
      fi: 'Poista' 
    },
    deleteTask: { 
      en: 'Delete Task', 
      fi: 'Poista tehtävä' 
    },
    deleteTaskConfirmation: { 
      en: 'Are you sure you want to delete this task? This action cannot be undone.', 
      fi: 'Haluatko varmasti poistaa tämän tehtävän? Tätä toimintoa ei voi kumota.' 
    },
    setAsToDo: { 
      en: 'Set as To Do', 
      fi: 'Aseta tekemättömäksi' 
    },
    setAsInProgress: { 
      en: 'Set as In Progress', 
      fi: 'Aseta keskeneräiseksi' 
    },
    setAsDone: { 
      en: 'Set as Done', 
      fi: 'Aseta valmiiksi' 
    },
    addComment: { 
      en: 'Add Comment', 
      fi: 'Lisää kommentti' 
    },
    deleteComment: { 
      en: 'Delete Comment', 
      fi: 'Poista kommentti' 
    },
    
    // Näkymätekstit
    noCategory: { 
      en: 'No Category', 
      fi: 'Ei kategoriaa' 
    },
    notAssigned: { 
      en: 'Not assigned', 
      fi: 'Ei määritetty' 
    },
    createdAt: { 
      en: 'Created', 
      fi: 'Luotu' 
    },
    createdDate: {
      en: 'Created Date',
      fi: 'Luontipäivä'
    },
    assignee: { 
      en: 'Assignee', 
      fi: 'Vastuuhenkilö' 
    },
    progress: { 
      en: 'Progress', 
      fi: 'Edistyminen' 
    },
    title: { 
      en: 'Title', 
      fi: 'Otsikko' 
    },
    description: { 
      en: 'Description', 
      fi: 'Kuvaus' 
    },
    dueDate: { 
      en: 'Due Date', 
      fi: 'Määräaika' 
    },
    previous: { 
      en: 'Previous', 
      fi: 'Edellinen' 
    },
    next: { 
      en: 'Next', 
      fi: 'Seuraava' 
    },
    showing: { 
      en: 'Showing', 
      fi: 'Näytetään' 
    },
    of: { 
      en: 'of', 
      fi: 'yhteensä' 
    },
    itemsPerPage: {
      en: 'Items per page',
      fi: 'Tehtäviä per sivu'
    },
    login: { 
      en: 'Login', 
      fi: 'Kirjaudu sisään' 
    },
    logout: { 
      en: 'Logout', 
      fi: 'Kirjaudu ulos' 
    },
    totalTasks: { 
      en: 'Total Tasks', 
      fi: 'Tehtäviä yhteensä' 
    },
    completed: { 
      en: 'Completed', 
      fi: 'Valmiita' 
    },
    
    // Tumma tila
    switchToDarkMode: { 
      en: 'Switch to Dark Mode', 
      fi: 'Vaihda tummaan tilaan' 
    },
    switchToLightMode: { 
      en: 'Switch to Light Mode', 
      fi: 'Vaihda vaaleaan tilaan' 
    },
    
    // Tehtävän luonti -sivu
    addTaskDescription: {
      en: 'Add a new task to your list',
      fi: 'Lisää uusi tehtävä listaasi'
    },
    viewAllTasks: { 
      en: 'View All Tasks', 
      fi: 'Näytä kaikki tehtävät' 
    },
    enterTaskTitle: { 
      en: 'Enter task title', 
      fi: 'Syötä tehtävän otsikko' 
    },
    enterTaskDescription: { 
      en: 'Enter task description', 
      fi: 'Syötä tehtävän kuvaus' 
    },
    createTask: { 
      en: 'Create Task', 
      fi: 'Luo tehtävä' 
    },
    
    // Dashboard
    dashboard: {
      en: 'Dashboard',
      fi: 'Dashboard'
    },
    tasksByStatus: {
      en: 'Tasks by Status',
      fi: 'Tehtävät tiloittain'
    },
    statusDistribution: {
      en: 'Status Distribution',
      fi: 'Tilojen jakauma'
    },
    tasksByPriority: {
      en: 'Tasks by Priority',
      fi: 'Tehtävät prioriteetin mukaan'
    },
    priorityDistribution: {
      en: 'Priority Distribution',
      fi: 'Prioriteettien jakauma'
    },
    recentTasks: {
      en: 'Recent Tasks',
      fi: 'Viimeisimmät tehtävät'
    },
    viewAll: {
      en: 'View All',
      fi: 'Näytä kaikki'
    },
    quickActions: {
      en: 'Quick Actions',
      fi: 'Pikavalinnat'
    },
    createTaskDesc: {
      en: 'Create a new task',
      fi: 'Luo uusi tehtävä'
    },
    kanbanDesc: {
      en: 'Manage your tasks visually',
      fi: 'Hallitse tehtäviäsi visuaalisesti'
    },
    categoriesDesc: {
      en: 'Organize with categories',
      fi: 'Järjestä kategorioilla'
    },
    // Kategoriahallinta
    manageCategories: {
      en: 'Manage Categories',
      fi: 'Hallitse kategorioita'
    },
    categoryName: {
      en: 'Name',
      fi: 'Nimi'
    },
    categoryColor: {
      en: 'Color',
      fi: 'Väri'
    },
    enterCategoryName: {
      en: 'Enter category name',
      fi: 'Syötä kategorian nimi'
    },
    selectColor: {
      en: 'Select color',
      fi: 'Valitse väri'
    },
    addCategory: {
      en: 'Add Category',
      fi: 'Lisää kategoria'
    },
    editCategory: {
      en: 'Edit Category',
      fi: 'Muokkaa kategoriaa'
    },
    deleteCategory: {
      en: 'Delete Category',
      fi: 'Poista kategoria'
    },
    confirmDeleteCategory: {
      en: 'Are you sure you want to delete this category?',
      fi: 'Haluatko varmasti poistaa tämän kategorian?'
    },
    completionRate: {
      en: 'completion rate',
      fi: 'valmistumisaste'
    },
    noRecentTasks: {
      en: 'No recent tasks found',
      fi: 'Ei viimeaikaisia tehtäviä'
    },
    highPriorityTasks: {
      en: 'High Priority',
      fi: 'Korkea prioriteetti'
    },
    
    // Activity Log
    activityLog: {
      en: 'Activity Log',
      fi: 'Aktiviteettiloki'
    },
    recentActivities: {
      en: 'Recent Activities',
      fi: 'Viimeisimmät tapahtumat'
    },
    taskCreated: {
      en: 'created a task',
      fi: 'lisäsi tehtävän'
    },
    taskUpdated: {
      en: 'updated a task',
      fi: 'päivitti tehtävää'
    },
    taskDeleted: {
      en: 'deleted a task',
      fi: 'poisti tehtävän'
    },
    subtaskAdded: {
      en: 'added a subtask',
      fi: 'lisäsi alitehtävän'
    },
    subtaskCompleted: {
      en: 'completed a subtask',
      fi: 'merkitsi alitehtävän valmiiksi'
    },
    subtaskDeleted: {
      en: 'deleted a subtask',
      fi: 'poisti alitehtävän'
    },
    commentAdded: {
      en: 'added a comment',
      fi: 'lisäsi kommentin'
    },
    commentDeleted: {
      en: 'deleted a comment',
      fi: 'poisti kommentin'
    },
    statusChanged: {
      en: 'changed status of',
      fi: 'muutti tehtävän tilan'
    },
    noActivities: {
      en: 'No recent activities',
      fi: 'Ei viimeaikaisia tapahtumia'
    },
    yesterday: {
      en: 'Yesterday',
      fi: 'Eilen'
    },
    showMore: {
      en: 'Show more',
      fi: 'Näytä lisää'
    },
    showLess: {
      en: 'Show less',
      fi: 'Näytä vähemmän'
    },
    
    // Tehtäväkortin käännökset
    subtasks: {
      en: 'Subtasks',
      fi: 'Alitehtävät'
    },
    enterSubtaskTitle: {
      en: 'Enter subtask title',
      fi: 'Syötä alitehtävän otsikko'
    },
    add: {
      en: 'Add',
      fi: 'Lisää'
    },
    addSubtask: {
      en: 'Add Subtask',
      fi: 'Lisää alitehtävä'
    },
    status: {
      en: 'Status',
      fi: 'Tila'
    },
    taskDescription: {
      en: 'Task description',
      fi: 'Tehtävän kuvaus'
    },
    noDescriptionProvided: {
      en: 'No description provided',
      fi: 'Ei kuvausta'
    },
    deleteSubtask: {
      en: 'Delete Subtask',
      fi: 'Poista alitehtävä'
    },
    deleteSubtaskConfirmation: {
      en: 'Are you sure you want to delete this subtask? This action cannot be undone.',
      fi: 'Haluatko varmasti poistaa tämän alitehtävän? Tätä toimenpidettä ei voi kumota.'
    },
    comments: {
      en: 'Comments',
      fi: 'Kommentit'
    },
    noCommentsYet: {
      en: 'No comments yet',
      fi: 'Ei kommentteja vielä'
    },
    addAComment: {
      en: 'Add a comment...',
      fi: 'Lisää kommentti...'
    },
    pressCtrlEnterToSend: {
      en: 'Press Ctrl+Enter to send',
      fi: 'Paina Ctrl+Enter lähettääksesi'
    },
    comment: {
      en: 'Comment',
      fi: 'Kommentoi'
    },
    needLoginToComment: {
      en: 'You need to be logged in to add comments',
      fi: 'Sinun täytyy kirjautua sisään lisätäksesi kommentteja'
    },
    created: {
      en: 'Created',
      fi: 'Luotu'
    },
    // Projektit
    projects: {
      en: 'Projects',
      fi: 'Projektit'
    },
    project: {
      en: 'Project',
      fi: 'Projekti'
    },
    projectName: {
      en: 'Project Name',
      fi: 'Projektin nimi'
    },
    enterProjectName: {
      en: 'Enter project name',
      fi: 'Syötä projektin nimi'
    },
    enterProjectDescription: {
      en: 'Enter project description',
      fi: 'Syötä projektin kuvaus'
    },
    createFirstProject: {
      en: 'Create First Project',
      fi: 'Luo ensimmäinen projekti'
    },
    newProject: {
      en: 'New Project',
      fi: 'Uusi projekti'
    },
    noProjects: {
      en: 'No projects. Create a new project to get started.',
      fi: 'Ei projekteja. Luo uusi projekti aloittaaksesi.'
    },
    projectTasks: {
      en: 'Project Tasks',
      fi: 'Projektin tehtävät'
    },
    noTasksInProject: {
      en: 'No tasks in this project yet.',
      fi: 'Tässä projektissa ei ole vielä tehtäviä.'
    },
    allProjects: {
      en: 'All Projects',
      fi: 'Kaikki projektit'
    },
    activeProjects: {
      en: 'Active Projects',
      fi: 'Aktiiviset projektit'
    },
    viewAllProjects: {
      en: 'View all projects',
      fi: 'Näytä kaikki projektit'
    },
    viewDetails: {
      en: 'View details',
      fi: 'Näytä tiedot'
    },
    confirmDeleteProject: {
      en: 'Are you sure you want to delete this project? Tasks will remain but will no longer be associated with this project.',
      fi: 'Haluatko varmasti poistaa tämän projektin? Tehtävät säilyvät, mutta niitä ei enää liitetä tähän projektiin.'
    },
    // Päivämäärät ja aikataulut
    deadline: { 
      en: 'Deadline', 
      fi: 'Määräaika' 
    },
    scheduledDate: { 
      en: 'Scheduled date', 
      fi: 'Suunniteltu päivä' 
    },
    startDate: { 
      en: 'Start date', 
      fi: 'Aloituspäivä' 
    },
    noDeadline: { 
      en: 'No deadline set', 
      fi: 'Ei määräaikaa' 
    },
    noStartDate: {
      en: 'No start date',
      fi: 'Ei aloituspäivää'
    },
    noScheduledDate: { 
      en: 'No scheduled date', 
      fi: 'Ei suunniteltua päivää' 
    },
    projectDateLock: {
      en: 'Date locked by project settings',
      fi: 'Päivämäärä lukittu projektin asetuksista'
    },
    projectCategories: {
      en: 'Project Categories',
      fi: 'Projektin kategoriat'
    },
    projectCategoriesHelp: {
      en: 'Select which categories can be used in this project',
      fi: 'Valitse mitkä kategoriat ovat käytettävissä tässä projektissa'
    },
    noProjectCategories: {
      en: 'No categories selected for this project',
      fi: 'Tälle projektille ei ole valittu kategorioita'
    },
    noCategories: {
      en: 'No categories available',
      fi: 'Ei saatavilla olevia kategorioita'
    },
    noDescription: {
      en: 'No description',
      fi: 'Ei kuvausta'
    },
    createNewProject: {
      en: 'Create New Project',
      fi: 'Luo uusi projekti'
    },
    activeProject: {
      en: 'Active Project',
      fi: 'Aktiivinen projekti'
    },
    projectColor: {
      en: 'Project Color',
      fi: 'Projektin väri'
    },
    colorSelected: {
      en: 'Color selected. This color will be used for the project.',
      fi: 'Väri valittu. Tätä väriä käytetään projektille.'
    },
    colorRandom: {
      en: 'No color selected. A random color will be used.',
      fi: 'Väriä ei valittu. Käytetään satunnaista väriä.'
    },
    // Toast-ilmoitukset
    taskCreatedSuccess: {
      en: 'Task created successfully',
      fi: 'Tehtävä luotu onnistuneesti'
    },
    taskUpdatedSuccess: {
      en: 'Task updated successfully',
      fi: 'Tehtävä päivitetty onnistuneesti'
    },
    taskDeletedSuccess: {
      en: 'Task deleted successfully',
      fi: 'Tehtävä poistettu onnistuneesti'
    },
    projectCreatedSuccess: {
      en: 'Project created successfully',
      fi: 'Projekti luotu onnistuneesti'
    },
    projectUpdatedSuccess: {
      en: 'Project updated successfully',
      fi: 'Projekti päivitetty onnistuneesti'
    },
    projectDeletedSuccess: {
      en: 'Project deleted successfully',
      fi: 'Projekti poistettu onnistuneesti'
    },
    categoryCreatedSuccess: {
      en: 'Category created successfully',
      fi: 'Kategoria luotu onnistuneesti'
    },
    categoryUpdatedSuccess: {
      en: 'Category updated successfully',
      fi: 'Kategoria päivitetty onnistuneesti'
    },
    categoryDeletedSuccess: {
      en: 'Category deleted successfully',
      fi: 'Kategoria poistettu onnistuneesti'
    },
    operationSuccess: {
      en: 'Operation completed successfully',
      fi: 'Toiminto suoritettu onnistuneesti'
    },
    operationError: {
      en: 'An error occurred',
      fi: 'Tapahtui virhe'
    },
    // Projektin hallinta
    createProject: {
      en: 'Create Project',
      fi: 'Luo projekti'
    },
    editProject: {
      en: 'Edit Project',
      fi: 'Muokkaa projektia'
    },
    deleteProject: {
      en: 'Delete Project',
      fi: 'Poista projekti'
    },
    
    // Käyttäjähallinta
    userManagement: {
      en: 'User Management',
      fi: 'Käyttäjähallinta'
    },
    createUser: {
      en: 'Create User',
      fi: 'Luo käyttäjä'
    },
    editUser: {
      en: 'Edit User',
      fi: 'Muokkaa käyttäjää'
    },
    deleteUser: {
      en: 'Delete User',
      fi: 'Poista käyttäjä'
    },
    confirmDeleteUser: {
      en: 'Are you sure you want to delete this user?',
      fi: 'Haluatko varmasti poistaa tämän käyttäjän?'
    },
    username: {
      en: 'Username',
      fi: 'Käyttäjätunnus'
    },
    password: {
      en: 'Password',
      fi: 'Salasana'
    },
    email: {
      en: 'Email',
      fi: 'Sähköposti'
    },
    role: {
      en: 'Role',
      fi: 'Rooli'
    },
    admin: {
      en: 'Admin',
      fi: 'Järjestelmänvalvoja'
    },
    user: {
      en: 'User',
      fi: 'Käyttäjä'
    },
    
    // Käyttäjähallinnan lisäkäännökset
    newUser: {
      en: 'New User',
      fi: 'Uusi käyttäjä'
    },
    accessDenied: {
      en: 'Access Denied',
      fi: 'Pääsy estetty'
    },
    adminOnlyAccess: {
      en: 'Only administrators have access to this view.',
      fi: 'Vain järjestelmänvalvojilla on pääsy tähän näkymään.'
    },
  };
  
  constructor() {}
  
  private loadLanguage(): Language {
    const savedLanguage = localStorage.getItem('language') as Language;
    return savedLanguage || 'en';
  }
  
  setLanguage(language: Language): void {
    localStorage.setItem('language', language);
    this.languageSubject.next(language);
  }
  
  translate(key: string): string {
    const translation = this.translations[key];
    if (!translation) {
      console.warn(`Translation key not found: ${key}`);
      return key;
    }
    return translation[this.getCurrentLanguage()];
  }
  
  getCurrentLanguage(): Language {
    return this.languageSubject.value;
  }
  
  toggleLanguage(): void {
    const currentLang = this.getCurrentLanguage();
    this.setLanguage(currentLang === 'en' ? 'fi' : 'en');
  }
} 