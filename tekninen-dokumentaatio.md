# Tehtävänhallintasovelluksen Tekninen Dokumentaatio

## 1. Yleiskuvaus

Sovellus on Angular-pohjainen tehtävänhallintajärjestelmä, joka mahdollistaa tehtävien ja projektien luomisen, muokkaamisen ja seurannan. Sovellus tukee sekä vaalea- että tummaa teemaa sekä englannin ja suomen kieltä. Käyttäjät voivat luoda, hallinnoida ja seurata tehtäviään useissa eri näkymissä, ryhmitellä tehtäviä projekteihin sekä määrittää aloituspäiviä ja määräaikoja.

![Sovelluksen arkkitehtuuri](assets/architecture.png)

## 2. Tekninen Arkkitehtuuri

### 2.1 Käytetyt Teknologiat

- Angular (Standalone Components)
- Tailwind CSS
- TypeScript
- HTML5 & CSS3
- Local Storage (tietojen tallennukseen)
- RxJS (reaktiivinen ohjelmointi)

### 2.2 Komponenttirakenne

```
src/
├── app/
│   ├── components/
│   │   ├── task-list/
│   │   │   └── task-list.component.ts
│   │   ├── task-view/
│   │   │   └── task-view.component.ts
│   │   ├── task-modal/
│   │   │   └── task-modal.component.ts
│   │   ├── kanban-view/
│   │   │   └── kanban-view.component.ts
│   │   ├── project-list/
│   │   │   └── project-list.component.ts
│   │   ├── project-tasks/
│   │   │   └── project-tasks.component.ts
│   │   ├── dashboard/
│   │   │   └── dashboard.component.ts
│   │   ├── confirm-modal/
│   │   │   └── confirm-modal.component.ts
│   │   ├── language-selector/
│   │   │   └── language-selector.component.ts
│   │   ├── task-comments/
│   │   │   └── task-comments.component.ts
│   │   └── shared/
│   │       └── task-filters/
│   │           └── task-filters.component.ts
│   ├── models/
│   │   ├── task.model.ts
│   │   ├── user.model.ts
│   │   ├── category.model.ts
│   │   ├── project.model.ts
│   │   ├── comment.model.ts
│   │   └── activity-log.model.ts
│   ├── services/
│   │   ├── task.service.ts
│   │   ├── project.service.ts
│   │   ├── theme.service.ts
│   │   ├── language.service.ts
│   │   ├── auth.service.ts
│   │   ├── category.service.ts
│   │   └── activity-log.service.ts
│   └── app.component.ts
└── styles.css
```

## 3. Tietomallit

### 3.1 Task-malli

```typescript
interface Task {
  id: string;
  title: string;
  description: string;
  state: TaskState;
  priority: TaskPriority;
  assignee: string | null;
  assigneeName?: string;
  category: string | null;
  projectId: string | null;
  createdAt: Date;
  createdBy: string | null;
  deadline: Date | null;      // Tehtävän määräaika
  scheduledDate: Date | null; // Tehtävän suunniteltu aloituspäivä
  subtasks: Subtask[];
  comments: Comment[];
  progress: number;
}

enum TaskState {
  TO_DO = 'TO_DO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE'
}

enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH'
}
```

### 3.2 Project-malli

```typescript
interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  createdBy: string | null;
  taskIds: string[];          // Viittaukset projektiin kuuluviin tehtäviin
  color?: string;             // Värikoodi projektin visuaalista tunnistamista varten
  deadline?: Date | null;     // Projektin määräaika
  startDate?: Date | null;    // Projektin suunniteltu aloituspäivä
}
```

### 3.3 Comment-malli

```typescript
interface Comment {
  id: string;
  taskId: string;
  text: string;
  createdAt: Date;
  userId: string;
  userName?: string;
}
```

### 3.4 Subtask-malli

```typescript
interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  createdAt: Date;
}
```

### 3.5 User-malli

```typescript
interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
}

enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN'
}
```

### 3.6 Category-malli

```typescript
interface Category {
  id: string;
  name: string;
  color: string;
}
```

### 3.7 ActivityLog-malli

```typescript
interface ActivityLog {
  id: string;
  type: ActivityType;
  timestamp: Date;
  userId: string;
  details: any;
}

enum ActivityType {
  TASK_CREATED = 'TASK_CREATED',
  TASK_UPDATED = 'TASK_UPDATED',
  TASK_DELETED = 'TASK_DELETED',
  PROJECT_CREATED = 'PROJECT_CREATED',
  PROJECT_UPDATED = 'PROJECT_UPDATED',
  PROJECT_DELETED = 'PROJECT_DELETED'
}
```

![Tietomallien suhteet](assets/data-models.png)

## 4. Palvelut

### 4.1 TaskService

Tehtävien hallintaan liittyvät toiminnot:

```typescript
class TaskService {
  // Tehtävän perustoiminnot
  getTasks(): Observable<Task[]>;
  getTaskById(id: string): Observable<Task | null>;
  addTask(task: Task): Observable<Task>;
  updateTask(task: Task): Observable<Task>;
  deleteTask(id: string): Observable<void>;
  
  // Tehtävän tilatoiminnot
  updateTaskState(taskId: string, state: TaskState): Observable<Task>;
  updateAssignee(taskId: string, assignee: string): Observable<Task>;
  
  // Alitehtävien hallinta
  addSubtask(taskId: string, title: string): Observable<Task>;
  completeSubtask(taskId: string, subtaskId: string, completed: boolean): Observable<Task>;
  deleteSubtask(taskId: string, subtaskId: string): Observable<Task>;
  
  // Kommenttien hallinta
  addComment(taskId: string, comment: Comment): Observable<Task>;
  deleteComment(taskId: string, commentId: string): Observable<Task>;
  
  // Päivämäärien hallinta
  setDeadline(taskId: string, deadline: Date | null): Observable<Task>;
  setScheduledDate(taskId: string, scheduledDate: Date | null): Observable<Task>;
  getTasksByDateRange(startDate: Date, endDate: Date, useDeadline: boolean): Observable<Task[]>;
  getUpcomingDeadlines(): Observable<Task[]>;
  getOverdueTasks(): Observable<Task[]>;
  
  // Tilastot
  getStats(): Observable<TaskStats>;
}
```

### 4.2 ProjectService

Projektien hallintaan liittyvät toiminnot:

```typescript
class ProjectService {
  // Projektien perustoiminnot
  getProjects(): Observable<Project[]>;
  getProjectById(id: string): Observable<Project | null>;
  addProject(project: Partial<Project>): Observable<Project>;
  updateProject(project: Project): Observable<Project>;
  deleteProject(id: string): Observable<void>;
  
  // Projektin ja tehtävien suhteiden hallinta
  addTaskToProject(projectId: string, taskId: string): Observable<Project>;
  removeTaskFromProject(projectId: string, taskId: string): Observable<Project>;
  getTasksForProject(projectId: string): Observable<string[]>;
  
  // Päivämäärien hallinta
  setProjectDeadline(projectId: string, deadline: Date | null): Observable<Project>;
  setProjectStartDate(projectId: string, startDate: Date | null): Observable<Project>;
}
```

### 4.3 ThemeService

```typescript
class ThemeService {
  theme$: Observable<'light' | 'dark'>;
  toggleTheme(): void;
  isDarkMode(): boolean;
  setTheme(theme: 'light' | 'dark'): void;
}
```

### 4.4 LanguageService

```typescript
class LanguageService {
  currentLanguage$: Observable<'en' | 'fi'>;
  translate(key: string): string;
  setLanguage(language: 'en' | 'fi'): void;
  getCurrentLanguage(): 'en' | 'fi';
  toggleLanguage(): void;
}
```

### 4.5 AuthService

```typescript
class AuthService {
  currentUser$: Observable<User | null>;
  getAllUsers(): Observable<User[]>;
  login(username: string, password: string): Observable<User>;
  logout(): void;
  register(userDetails: any): Observable<User>;
  isAdmin(): boolean;
}
```

### 4.6 CategoryService

```typescript
class CategoryService {
  getCategories(): Observable<Category[]>;
  addCategory(category: Category): Observable<Category>;
  updateCategory(category: Category): Observable<Category>;
  deleteCategory(id: string): Observable<void>;
}
```

### 4.7 ActivityLogService

```typescript
class ActivityLogService {
  getActivityLog(): Observable<ActivityLog[]>;
  addActivity(type: ActivityType, targetId: string, targetName: string, details?: string): void;
  getRecentActivities(count: number): Observable<ActivityLog[]>;
}
```

![Palveluiden vuorovaikutus](assets/services-interaction.png)

## 5. Komponentit

### 5.1 AppComponent
- Sovelluksen pääkomponentti
- Sisältää navigaation ja tilastot
- Hallinnoi teeman ja kielen vaihtoa
- Sivupalkki toiminnallisuuksilla

### 5.2 TaskListComponent
Ominaisuudet:
- Tehtävien listaus
- Uuden tehtävän lisäys lomakkeella
- Tehtävien tilan päivitys ja poisto
- Määräajan ja aloituspäivän asettaminen

### 5.3 TaskViewComponent
- Tehtävien taulukkönäkymä
- Tehtävien suodatus ja järjestely
- Sivutustoiminnallisuus

### 5.4 KanbanViewComponent
- Tehtävien Kanban-näkymä
- Tehtävien raahaaminen tilasta toiseen
- Tehtävien suodatus

### 5.5 ProjectListComponent
- Projektien listausnäkymä
- Uuden projektin luominen
- Projektien tietojen näyttäminen
- Projektin poistaminen

### 5.6 ProjectTasksComponent
- Projektikohtaisten tehtävien näyttäminen
- Projektin tietojen muokkaus
- Projektin määräajan ja aloituspäivän hallinta
- Uusien tehtävien lisääminen projektiin

### 5.7 DashboardComponent
- Koostenäkymä tehtävistä ja projekteista
- Lähestyvät määräajat
- Myöhässä olevat tehtävät
- Viimeisimmät aktiviteetit

### 5.8 TaskModalComponent
- Tehtävän yksityiskohtainen näkymä ja muokkaus
- Näyttää kaikki tehtävän tiedot modaali-ikkunassa
- Alitehtävien hallinta
- Kommenttien näyttäminen
- Määräajan ja aloituspäivän muokkaus (paitsi jos projekti estää)

### 5.9 TaskCommentsComponent
- Kommenttien näyttäminen ja lisääminen
- Kommenttien poistaminen

### 5.10 LanguageSelectorComponent
- Kielenvalintapainike (suomi/englanti)
- Vaihto kielten välillä

### 5.11 TaskFiltersComponent
- Jaettu suodatuskomponentti eri näkymille
- Suodatus tilan, prioriteetin, kategorian ja vastuuhenkilön mukaan
- Järjestely eri kenttien mukaan

![Komponenttien vuorovaikutus](assets/components-interaction.png)

## 6. Projekti-tehtävä -integraatio

### 6.1 Projektin ja tehtävien suhteet
- Tehtävä voi kuulua yhteen projektiin
- Projektilla voi olla monta tehtävää
- Tehtävä sisältää viittauksen projektiinsa (projectId)
- Projekti sisältää viittaukset tehtäviinsä (taskIds-taulukko)

### 6.2 Päivämääräautomatiikka
- Jos projektille asetetaan määräaika, se vaikuttaa kaikkiin projektin tehtäviin
- Tehtävän deadline ei voi olla projektin deadlinen jälkeen
- Jos projektille asetetaan aloituspäivä, tehtävän aloituspäivä ei voi olla aiemmin
- Tehtävän, joka kuuluu projektiin jolla on päivämääräarvot, päivämääriä ei voi muokata

### 6.3 Projektipäivitykset
- Projektin tiedot (nimi, kuvaus) näytetään projektin tehtävien listauksen yhteydessä
- Projektin määräajan muuttuessa kaikki projektin tehtävät päivitetään
- Projektin poisto irrottaa tehtävät projektista mutta ei poista tehtäviä

## 7. Monikielisyys

### 7.1 Kielen vaihto
- Tuki suomen ja englannin kielelle
- LanguageService hoitaa käännökset
- Kielivalinta tallentuu local storageen

### 7.2 Käännösavaimet
Kaikki käyttöliittymän tekstit on määritelty avain-arvo-pareina:
```typescript
{
  tasks: { 
    en: 'Tasks', 
    fi: 'Tehtävät' 
  },
  kanbanBoard: { 
    en: 'Kanban Board', 
    fi: 'Kanban-taulu' 
  },
  projects: {
    en: 'Projects',
    fi: 'Projektit'
  },
  deadline: { 
    en: 'Deadline', 
    fi: 'Määräaika' 
  },
  startDate: { 
    en: 'Start date', 
    fi: 'Aloituspäivä' 
  },
  // ...muut käännökset
}
```

## 8. Tyylimäärittelyt

### 8.1 Keskeiset CSS-luokat
```css
.btn-primary
.btn-secondary
.btn-danger
.input-field
.card
.badge
.status-badge-done
.status-badge-in-progress
.status-badge-todo
.badge-high
.badge-medium
.badge-low
.filter-select
.kanban-column
.kanban-task
```

### 8.2 Teemoitus
- Vaalea ja tumma teema
- Tailwind CSS:n dark:-määrittelyt
- Automaattinen teeman valinta käyttöjärjestelmän mukaan
- Manuaalinen teeman vaihto

## 9. Tärkeimmät toiminnallisuudet

1. Tehtävien hallinta:
   - Lisäys, poisto, muokkaus, tilan päivitys
   - Alitehtävien hallinta
   - Suodatus prioriteetin, tilan, kategorian ja vastuuhenkilön mukaan
   - Järjestely eri kenttien mukaan
   - Määräajat ja aloituspäivät

2. Projektien hallinta:
   - Projektien luonti, muokkaus ja poisto
   - Projektin tehtävien listaus ja hallinta
   - Projektin määräaikojen ja aloituspäivien hallinta
   - Projektin tehtävien päivämäärien automaattinen hallinta

3. Näkymät:
   - Taulukkonäkymä (TaskViewComponent)
   - Kanban-näkymä (KanbanViewComponent)
   - Projektiluettelo (ProjectListComponent)
   - Projektikohtainen tehtävänäkymä (ProjectTasksComponent)
   - Kojelauta (DashboardComponent)
   - Modaalinen yksityiskohtanäkymä (TaskModalComponent)

4. Kommentointi:
   - Kommenttien lisäys tehtäviin
   - Kommenttien poisto (vain omien)

5. Käyttäjät:
   - Kirjautuminen ja käyttäjähallinta
   - Käyttäjäroolit (käyttäjä/admin)

6. Kategoriat:
   - Tehtävien luokittelu värillisiin kategorioihin

7. Aikataulutus:
   - Deadlinet ja aloituspäivät tehtäville
   - Projektikohtaiset deadlinet ja aloituspäivät
   - Lähestyvien deadlinien ja myöhässä olevien tehtävien näyttäminen

8. Aktiviteettiloki:
   - Toimintojen tallentaminen lokiin
   - Käyttäjien tekemien muutosten seuranta

9. Teemoitus ja kielivalinnat:
   - Vaalea/tumma teema
   - Suomi/englanti-kielet
   - Automaattinen asetusten tallennus

## 10. Tietojen tallennus

Sovellus käyttää local storagea tietojen tallentamiseen, mikä mahdollistaa:
- Offline-käytön
- Tehtävien säilymisen selaimen sulkemisen jälkeen
- Käyttäjäasetusten säilyttämisen (kieli, teema)

Local storage -avaimet:
- `tasks`: Tehtävät JSON-muodossa
- `projects`: Projektit JSON-muodossa
- `categories`: Kategoriat
- `users`: Käyttäjätiedot
- `currentUser`: Kirjautunut käyttäjä
- `activityLog`: Käyttäjätoimintojen loki
- `language`: Valittu kieli (en/fi)
- `theme`: Valittu teema (light/dark)

## 11. Jatkokehitysmahdollisuudet

1. Tietokantaintegraatio (Firebase, MongoDB)
2. Hakutoiminnallisuus
3. Tehtävien aikataulutus ja muistutukset
4. Laajennetut käyttäjäroolit ja oikeudet
5. Ilmoitusjärjestelmä
6. Tehtävien vienti/tuonti (CSV, Excel)
7. Mobiiliresponsiivisuuden parantaminen
8. Tehtävien toistuva ajastus
9. Integraatio muihin palveluihin (sähköposti, kalenteri)
10. Offline-synkronointi (PWA)
11. Drag-and-drop-toiminnot tehtävien ja projektien hallintaan
12. Gantt-kaavio projektien ja tehtävien visualisointiin

## 12. Käyttöönotto-ohjeet

1. Kloonaa repositorio:
```bash
git clone https://github.com/NummilaJ/task-management-app-modern-ui.git
```

2. Asenna riippuvuudet:
```bash
npm install
```

3. Käynnistä kehityspalvelin:
```bash
npm start
```

4. Avaa selaimessa:
```
http://localhost:4200/
```

5. Julkaise GitHub Pagesiin:
```bash
npm run deploy
```

Tämän dokumentaation avulla voit luoda identtisen projektin toisessa ympäristössä. Muista tarkistaa Angular-version yhteensopivuus ja Tailwind CSS:n konfiguraatio projektin luonnin yhteydessä. 