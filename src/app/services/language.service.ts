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
    tasks: { 
      en: 'Tasks', 
      fi: 'Tehtävät' 
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
      en: 'No category', 
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