// ============================================
// Folder Service
// ============================================

import { ApiResponse, Folder, FolderItem } from '@/types';
import { apiService } from './api';

export class FolderService {
  // Get all folders
  async getAll(parentId?: string): Promise<ApiResponse<Folder[]>> {
    const query = parentId ? `?parent_id=${parentId}` : '';
    return apiService.get<Folder[]>(`/folders${query}`);
  }

  // Get folder by ID with items
  async getById(id: string): Promise<ApiResponse<Folder & { items: FolderItem[] }>> {
    return apiService.get<Folder & { items: FolderItem[] }>(`/folders/${id}`);
  }

  // Create folder
  async create(folder: Partial<Folder>): Promise<ApiResponse<Folder>> {
    return apiService.post<Folder>('/folders', folder);
  }

  // Update folder
  async update(id: string, folder: Partial<Folder>): Promise<ApiResponse<Folder>> {
    return apiService.put<Folder>(`/folders/${id}`, folder);
  }

  // Delete folder
  async delete(id: string): Promise<ApiResponse<void>> {
    return apiService.delete<void>(`/folders/${id}`);
  }

  // Add item to folder
  async addItem(
    folderId: string,
    item: { item_type: 'study_set' | 'quiz' | 'class'; item_id: string }
  ): Promise<ApiResponse<FolderItem>> {
    return apiService.post<FolderItem>(`/folders/${folderId}/items`, item);
  }

  // Remove item from folder
  async removeItem(folderId: string, itemId: string): Promise<ApiResponse<void>> {
    return apiService.delete<void>(`/folders/${folderId}/items/${itemId}`);
  }

  // Update item order
  async updateItemOrder(
    folderId: string,
    itemIds: string[]
  ): Promise<ApiResponse<FolderItem[]>> {
    return apiService.put<FolderItem[]>(`/folders/${folderId}/items/order`, {
      item_ids: itemIds,
    });
  }
}

export const folderService = new FolderService();

