# Tehtävänhallintasovelluksen Tekninen Dokumentaatio

## 1. Yleiskuvaus
Sovellus on Angular-pohjainen tehtävänhallintajärjestelmä, joka mahdollistaa tehtävien luomisen, muokkaamisen ja seurannan. Sovellus tukee sekä vaalea- että tummaa teemaa sekä englannin ja suomen kieltä. Käyttäjät voivat luoda, hallinnoida ja seurata tehtäviään useissa eri näkymissä.

## 2. Tekninen Arkkitehtuuri

### 2.1 Käytetyt Teknologiat
- Angular (Standalone Components)
- Tailwind CSS
- TypeScript
- HTML5 & CSS3
- Local Storage (tietojen tallennukseen)

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
│   │   └── comment.model.ts
│   ├── services/
│   │   ├── task.service.ts
│   │   ├── theme.service.ts
│   │   ├── language.service.ts
│   │   ├── auth.service.ts
│   │   └── category.service.ts
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
  createdAt: string;
  createdBy: string;
  assignee: string | null;
  category: string | null;
  progress: number;
  comments: Comment[];
  subtasks: Subtask[];
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

### 3.2 Comment-malli
```typescript
interface Comment {
  id: string;
  text: string;
  createdAt: string;
  userId: string;
  userName?: string;
}
```

### 3.3 Subtask-malli
```typescript
interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}
```

### 3.4 User-malli
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

### 3.5 Category-malli
```typescript
interface Category {
  id: string;
  name: string;
  color: string;
}
```

## 4. Palvelut

### 4.1 TaskService
Keskeisimmät metodit:
```typescript
class TaskService {
  getTasks(): Observable<Task[]>;
  addTask(task: Task): Observable<Task>;
  updateTask(task: Task): Observable<Task>;
  deleteTask(id: string): Observable<void>;
  getStats(): Observable<TaskStats>;
}
```

### 4.2 ThemeService
```typescript
class ThemeService {
  theme$: Observable<'light' | 'dark'>;
  toggleTheme(): void;
  isDarkMode(): boolean;
  setTheme(theme: 'light' | 'dark'): void;
}
```

### 4.3 LanguageService
```typescript
class LanguageService {
  currentLanguage$: Observable<'en' | 'fi'>;
  translate(key: string): string;
  setLanguage(language: 'en' | 'fi'): void;
  getCurrentLanguage(): 'en' | 'fi';
  toggleLanguage(): void;
}
```

### 4.4 AuthService
```typescript
class AuthService {
  currentUser$: Observable<User | null>;
  login(username: string, password: string): Observable<User>;
  logout(): void;
  register(userDetails: any): Observable<User>;
  isAdmin(): boolean;
}
```

### 4.5 CategoryService
```typescript
class CategoryService {
  getCategories(): Observable<Category[]>;
  addCategory(category: Category): Observable<Category>;
  updateCategory(category: Category): Observable<Category>;
  deleteCategory(id: string): Observable<void>;
}
```

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

### 5.3 TaskViewComponent
- Tehtävien taulukkönäkymä
- Tehtävien suodatus ja järjestely
- Sivutustoiminnallisuus

### 5.4 KanbanViewComponent
- Tehtävien Kanban-näkymä
- Tehtävien raahaaminen tilasta toiseen
- Tehtävien suodatus

### 5.5 TaskModalComponent
- Tehtävän yksityiskohtainen näkymä ja muokkaus
- Näyttää kaikki tehtävän tiedot modaali-ikkunassa
- Alitehtävien hallinta
- Kommenttien näyttäminen

### 5.6 TaskCommentsComponent
- Kommenttien näyttäminen ja lisääminen
- Kommenttien poistaminen

### 5.7 LanguageSelectorComponent
- Kielenvalintapainike (suomi/englanti)
- Vaihto kielten välillä

### 5.8 TaskFiltersComponent
- Jaettu suodatuskomponentti eri näkymille
- Suodatus tilan, prioriteetin, kategorian ja vastuuhenkilön mukaan
- Järjestely eri kenttien mukaan

## 6. Monikielisyys

### 6.1 Kielen vaihto
- Tuki suomen ja englannin kielelle
- LanguageService hoitaa käännökset
- Kielivalinta tallentuu local storageen

### 6.2 Käännösavaimet
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
  // ...muut käännökset
}
```

## 7. Tyylimäärittelyt

### 7.1 Keskeiset CSS-luokat
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

### 7.2 Teemoitus
- Vaalea ja tumma teema
- Tailwind CSS:n dark:-määrittelyt
- Automaattinen teeman valinta käyttöjärjestelmän mukaan
- Manuaalinen teeman vaihto

## 8. Tärkeimmät toiminnallisuudet

1. Tehtävien hallinta:
   - Lisäys, poisto, muokkaus, tilan päivitys
   - Alitehtävien hallinta
   - Suodatus prioriteetin, tilan, kategorian ja vastuuhenkilön mukaan
   - Järjestely eri kenttien mukaan

2. Näkymät:
   - Taulukkonäkymä (TaskViewComponent)
   - Kanban-näkymä (KanbanViewComponent)
   - Lomake-näkymä (TaskListComponent)
   - Modaalinäkymä yksityiskohdille (TaskModalComponent)

3. Kommentointi:
   - Kommenttien lisäys tehtäviin
   - Kommenttien poisto (vain omien)

4. Käyttäjät:
   - Kirjautuminen ja käyttäjähallinta
   - Käyttäjäroolit (käyttäjä/admin)

5. Kategoriat:
   - Tehtävien luokittelu värillisiin kategorioihin

6. Tilastot:
   - Kokonaistehtävämäärä
   - Valmiit tehtävät
   - Keskeneräiset tehtävät

7. Teemoitus ja kielivalinnat:
   - Vaalea/tumma teema
   - Suomi/englanti-kielet
   - Automaattinen asetusten tallennus

## 9. Tietojen tallennus

Sovellus käyttää local storagea tietojen tallentamiseen, mikä mahdollistaa:
- Offline-käytön
- Tehtävien säilymisen selaimen sulkemisen jälkeen
- Käyttäjäasetusten säilyttämisen (kieli, teema)

Local storage -avaimet:
- `tasks`: Tehtävät JSON-muodossa
- `categories`: Kategoriat
- `users`: Käyttäjätiedot
- `currentUser`: Kirjautunut käyttäjä
- `language`: Valittu kieli (en/fi)
- `theme`: Valittu teema (light/dark)

## 10. Jatkokehitysmahdollisuudet

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

## 11. Käyttöönotto-ohjeet

1. Kloonaa repositorio:
```bash
git clone https://github.com/käyttäjätunnus/task-management-app-modern-ui.git
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

Tämän dokumentaation avulla voit luoda identtisen projektin toisessa ympäristössä. Muista tarkistaa Angular-version yhteensopivuus ja Tailwind CSS:n konfiguraatio projektin luonnin yhteydessä. 