import { categoryRepository } from '../repositories/categoryRepository.js';
import { dbEngine } from '../database/sqlite.js';
import { menuCacheService } from './menuCacheService.js';
import { activityLogService } from './activityLogService.js';
import { lifecycleService } from './lifecycleService.js';

class CategoryService {
  getAllCategories() {
    // Return from fast cache rather than SQLite
    return menuCacheService.getMenuTree();
  }

  getCategoryById(id) {
    return categoryRepository.findById(id);
  }

  createCategory(data, userId) {
    return dbEngine.transaction(() => {
      const category = categoryRepository.create(data);
      
      activityLogService.logActivity(
        userId,
        'CATEGORY_CREATED',
        'CATALOG',
        category.id,
        { name: category.name }
      );


      menuCacheService.refresh();
      return category;
    });
  }

  updateCategory(id, data, userId) {
    return dbEngine.transaction(() => {
      const category = categoryRepository.update(id, data);
      
      activityLogService.logActivity(
        userId,
        'CATEGORY_UPDATED',
        'CATALOG',
        category.id,
        { updates: data }
      );


      menuCacheService.refresh();
      return category;
    });
  }

  deleteCategory(id, userId) {
    return dbEngine.transaction(() => {
      lifecycleService.softDelete('CATEGORY', id, userId);
    });
  }

  archiveCategory(id, userId) {
    return dbEngine.transaction(() => {
      lifecycleService.archive('CATEGORY', id, userId);
    });
  }

  publishCategory(id, userId) {
    return dbEngine.transaction(() => {
      lifecycleService.publish('CATEGORY', id, userId);
    });
  }
}

export const categoryService = new CategoryService();
