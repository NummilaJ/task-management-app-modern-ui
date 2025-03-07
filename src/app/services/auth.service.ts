import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { User, UserRole } from '../models/user.model';
import { v4 as uuidv4 } from 'uuid';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  private users = new BehaviorSubject<User[]>([]);
  private readonly USERS_STORAGE_KEY = 'users';
  private readonly CURRENT_USER_KEY = 'currentUser';

  constructor() {
    this.loadUsers();
    this.loadCurrentUser();
    
    // Jos käyttäjiä ei ole, luodaan admin
    if (this.users.value.length === 0) {
      this.createInitialAdmin();
    }
  }

  private loadUsers(): void {
    const storedUsers = localStorage.getItem(this.USERS_STORAGE_KEY);
    if (storedUsers) {
      this.users.next(JSON.parse(storedUsers));
    }
  }

  private loadCurrentUser(): void {
    const storedUser = localStorage.getItem(this.CURRENT_USER_KEY);
    if (storedUser) {
      this.currentUserSubject.next(JSON.parse(storedUser));
    }
  }

  private saveUsers(users: User[]): void {
    localStorage.setItem(this.USERS_STORAGE_KEY, JSON.stringify(users));
    this.users.next(users);
  }

  private createInitialAdmin(): void {
    const adminUser: User = {
      id: uuidv4(),
      username: 'admin',
      email: 'admin@example.com',
      password: 'admin', // HUOM: tämä pitäisi oikeasti salata
      role: UserRole.ADMIN,
      createdAt: new Date()
    };
    
    this.saveUsers([adminUser]);
    console.log('Admin-käyttäjä luotu:', adminUser);
  }

  login(username: string, password: string): Observable<User | null> {
    const foundUser = this.users.value.find(
      user => user.username === username && user.password === password
    );
    
    if (foundUser) {
      localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(foundUser));
      this.currentUserSubject.next(foundUser);
      return of(foundUser);
    }
    
    return of(null);
  }

  logout(): void {
    localStorage.removeItem(this.CURRENT_USER_KEY);
    this.currentUserSubject.next(null);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  createUser(newUser: Omit<User, 'id' | 'createdAt'>, creatorId: string): Observable<User> {
    const user: User = {
      ...newUser,
      id: uuidv4(),
      createdAt: new Date(),
      createdBy: creatorId
    };
    
    const currentUsers = this.users.value;
    this.saveUsers([...currentUsers, user]);
    
    return of(user);
  }

  isAdmin(): boolean {
    const currentUser = this.currentUserSubject.value;
    return currentUser?.role === UserRole.ADMIN;
  }

  getAllUsers(): Observable<User[]> {
    return this.users.asObservable();
  }

  updateUser(user: User): Observable<User> {
    const users = this.users.value;
    const index = users.findIndex(u => u.id === user.id);
    
    if (index !== -1) {
      users[index] = user;
      this.saveUsers(users);
      
      // Jos päivitetään kirjautunut käyttäjä, päivitä myös currentUser
      if (this.currentUserSubject.value?.id === user.id) {
        this.currentUserSubject.next(user);
        localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(user));
      }
      
      return of(user);
    }
    
    throw new Error('Käyttäjää ei löydy');
  }

  deleteUser(userId: string): Observable<void> {
    const users = this.users.value.filter(user => user.id !== userId);
    this.saveUsers(users);
    return of(void 0);
  }
} 