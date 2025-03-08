import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoryService } from '../../services/category.service';
import { Category } from '../../models/category.model';
import { CATEGORY_COLORS } from '../../models/category.model';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-category-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <!-- Uuden kategorian lomake -->
      <div class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">{{ translate('manageCategories') }}</h2>
        <form (ngSubmit)="addCategory()" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="flex flex-col">
              <label class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{{ translate('categoryName') }}</label>
              <input type="text"
                     [(ngModel)]="newCategory.name"
                     name="name"
                     required
                     placeholder="{{ translate('enterCategoryName') }}"
                     class="input-field w-full bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500 rounded-lg transition-colors duration-200">
            </div>
            <div class="flex flex-col">
              <label class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{{ translate('categoryColor') }}</label>
              <div class="relative">
                <div (click)="toggleNewColorDropdown()"
                     class="input-field w-full bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500 rounded-lg transition-colors duration-200 cursor-pointer flex items-center justify-between">
                  <div class="flex items-center space-x-2">
                    <div class="w-4 h-4 rounded-full" [style.backgroundColor]="newCategory.color || '#000000'"></div>
                    <span>{{newCategory.color || translate('selectColor')}}</span>
                  </div>
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </div>
                <div *ngIf="isNewColorDropdownOpen" 
                     class="absolute z-10 mt-1 w-full bg-white dark:bg-gray-700 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600">
                  <div class="py-1">
                    <div *ngFor="let color of categoryColors"
                         (click)="selectColor(color)"
                         class="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer flex items-center space-x-2">
                      <div class="w-4 h-4 rounded-full" [style.backgroundColor]="color"></div>
                      <span>{{color}}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="flex justify-end">
            <button type="submit"
                    class="btn-primary"
                    [disabled]="!newCategory.name || !newCategory.color">
              {{ translate('addCategory') }}
            </button>
          </div>
        </form>
      </div>

      <!-- Kategorioiden taulukko -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{{ translate('categoryName') }}</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{{ translate('actions') }}</th>
              </tr>
            </thead>
            <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              <tr *ngFor="let category of categories" class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center space-x-2">
                    <div class="w-4 h-4 rounded-full" [style.backgroundColor]="category.color"></div>
                    <span class="text-sm text-gray-900 dark:text-white">{{category.name}}</span>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div class="flex justify-end space-x-2">
                    <button (click)="startEdit(category)"
                            class="btn-secondary btn-sm">
                      {{ translate('editCategory') }}
                    </button>
                    <button (click)="deleteCategory(category)"
                            class="btn-danger btn-sm ml-2">
                      {{ translate('deleteCategory') }}
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Muokkaus modal -->
      <div *ngIf="isEditing && editingCategory" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
        <div class="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md p-6 relative">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">{{ translate('editCategory') }}</h3>
          <form (ngSubmit)="saveEdit()">
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{{ translate('categoryName') }}</label>
              <input type="text"
                     [(ngModel)]="editingCategory!.name"
                     name="editName"
                     required
                     class="input-field w-full">
            </div>
            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{{ translate('categoryColor') }}</label>
              <div class="relative">
                <div (click)="toggleEditColorDropdown()"
                     class="input-field w-full flex items-center justify-between cursor-pointer">
                  <div class="flex items-center space-x-2">
                    <div class="w-4 h-4 rounded-full" [style.backgroundColor]="editingCategory.color || '#000000'"></div>
                    <span>{{editingCategory.color || translate('selectColor')}}</span>
                  </div>
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </div>
                <div *ngIf="isEditColorDropdownOpen" 
                     class="absolute z-10 mt-1 w-full bg-white dark:bg-gray-700 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600">
                  <div class="py-1">
                    <div *ngFor="let color of categoryColors"
                         (click)="selectColor(color)"
                         class="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer flex items-center space-x-2">
                      <div class="w-4 h-4 rounded-full" [style.backgroundColor]="color"></div>
                      <span>{{color}}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="flex justify-end space-x-2">
              <button type="button" (click)="cancelEdit()" class="btn-secondary">
                {{ translate('cancel') }}
              </button>
              <button type="submit" class="btn-primary" [disabled]="!editingCategory.name || !editingCategory.color">
                {{ translate('save') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .input-field {
      @apply px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200;
    }
  `]
})
export class CategoryManagerComponent implements OnInit {
  categories: Category[] = [];
  categoryColors = CATEGORY_COLORS;
  newCategory: Category = {
    id: '',
    name: '',
    color: '#000000'
  };
  editingCategory: Category | null = null;
  isEditing = false;
  isNewColorDropdownOpen = false;
  isEditColorDropdownOpen = false;

  constructor(
    private categoryService: CategoryService,
    private languageService: LanguageService
  ) {}

  ngOnInit() {
    this.loadCategories();
  }

  translate(key: string): string {
    return this.languageService.translate(key);
  }

  loadCategories() {
    this.categoryService.getCategories().subscribe(categories => {
      this.categories = categories;
    });
  }

  addCategory() {
    if (this.newCategory.name && this.newCategory.color) {
      this.categoryService.addCategory(this.newCategory);
      this.resetForm();
    }
  }

  startEdit(category: Category) {
    this.editingCategory = { ...category };
    this.isEditing = true;
  }

  saveEdit() {
    if (this.editingCategory) {
      this.categoryService.updateCategory(this.editingCategory);
      this.cancelEdit();
    }
  }

  cancelEdit() {
    this.isEditing = false;
    this.editingCategory = null;
  }

  deleteCategory(category: Category) {
    if (confirm(this.translate('confirmDeleteCategory'))) {
      this.categoryService.deleteCategory(category.id);
    }
  }

  resetForm() {
    this.newCategory = {
      id: '',
      name: '',
      color: '#000000'
    };
  }

  toggleNewColorDropdown() {
    this.isNewColorDropdownOpen = !this.isNewColorDropdownOpen;
    this.isEditColorDropdownOpen = false;
  }

  toggleEditColorDropdown() {
    this.isEditColorDropdownOpen = !this.isEditColorDropdownOpen;
    this.isNewColorDropdownOpen = false;
  }

  selectColor(color: string) {
    if (this.editingCategory) {
      this.editingCategory.color = color;
      this.isEditColorDropdownOpen = false;
    } else {
      this.newCategory.color = color;
      this.isNewColorDropdownOpen = false;
    }
  }
}
