import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Category, CATEGORY_COLORS } from '../models/category.model';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private categories = new BehaviorSubject<Category[]>([]);
  private readonly STORAGE_KEY = 'categories';

  constructor() {
    this.loadCategories();
  }

  private loadCategories() {
    const storedCategories = localStorage.getItem(this.STORAGE_KEY);
    if (storedCategories) {
      this.categories.next(JSON.parse(storedCategories));
    } else {
      // Luodaan oletuskategoriat ensimmäisellä käynnistyskerralla
      const defaultCategories: Category[] = [
        { id: '1', name: 'Bug', color: CATEGORY_COLORS[0], description: 'Software bugs and issues' },
        { id: '2', name: 'Feature Request', color: CATEGORY_COLORS[4], description: 'New feature requests and enhancements' },
        { id: '3', name: 'Documentation', color: CATEGORY_COLORS[2], description: 'Documentation related tasks' },
        { id: '4', name: 'Testing', color: CATEGORY_COLORS[3], description: 'Testing and QA tasks' },
        { id: '5', name: 'UI/UX', color: CATEGORY_COLORS[7], description: 'User interface and experience tasks' },
        { id: '6', name: 'DevOps', color: CATEGORY_COLORS[5], description: 'Infrastructure and deployment tasks' },
        { id: '7', name: 'Security', color: CATEGORY_COLORS[6], description: 'Security related tasks and fixes' }
      ];
      this.saveCategories(defaultCategories);
    }
  }

  private saveCategories(categories: Category[]) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(categories));
    this.categories.next(categories);
  }

  getCategories(): Observable<Category[]> {
    return this.categories.asObservable();
  }

  getCategoryById(id: string): Category | undefined {
    return this.categories.value.find(cat => cat.id === id);
  }

  addCategory(category: Omit<Category, 'id'>): Observable<Category> {
    const newCategory: Category = {
      ...category,
      id: Date.now().toString()
    };
    const categories = [...this.categories.value, newCategory];
    this.saveCategories(categories);
    return new BehaviorSubject(newCategory).asObservable();
  }

  updateCategory(category: Category): Observable<Category> {
    const categories = this.categories.value;
    const index = categories.findIndex(c => c.id === category.id);
    if (index !== -1) {
      categories[index] = category;
      this.saveCategories(categories);
      return new BehaviorSubject(category).asObservable();
    }
    throw new Error(`Category with id ${category.id} not found`);
  }

  deleteCategory(id: string): Observable<void> {
    const categories = this.categories.value.filter(c => c.id !== id);
    this.saveCategories(categories);
    return new BehaviorSubject<void>(undefined).asObservable();
  }

  getAvailableColors(): string[] {
    return CATEGORY_COLORS;
  }
} 