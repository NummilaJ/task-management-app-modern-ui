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
        { id: '1', name: 'Work', color: CATEGORY_COLORS[0], description: 'Work related tasks' },
        { id: '2', name: 'Personal', color: CATEGORY_COLORS[4], description: 'Personal tasks' },
        { id: '3', name: 'Shopping', color: CATEGORY_COLORS[2], description: 'Shopping lists and tasks' }
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