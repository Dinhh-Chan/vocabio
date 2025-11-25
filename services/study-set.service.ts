// ============================================
// Study Set Service
// ============================================

import { ApiResponse, PaginatedResponse, StudySet, StudySetWithVocab } from '@/types';
import { apiService } from './api';

export class StudySetService {
  // Get all study sets
  async getAll(params?: {
    page?: number;
    limit?: number;
    search?: string;
    difficulty?: string;
  }): Promise<ApiResponse<PaginatedResponse<StudySet>>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.difficulty) queryParams.append('difficulty', params.difficulty);

    const query = queryParams.toString();
    return apiService.get<PaginatedResponse<StudySet>>(
      `/study-sets${query ? `?${query}` : ''}`
    );
  }

  // Get study set by ID with vocabularies
  async getById(id: string): Promise<ApiResponse<StudySetWithVocab>> {
    return apiService.get<StudySetWithVocab>(`/study-sets/${id}`);
  }

  // Create study set
  async create(studySet: Partial<StudySet>): Promise<ApiResponse<StudySet>> {
    return apiService.post<StudySet>('/study-sets', studySet);
  }

  // Update study set
  async update(id: string, studySet: Partial<StudySet>): Promise<ApiResponse<StudySet>> {
    return apiService.put<StudySet>(`/study-sets/${id}`, studySet);
  }

  // Delete study set
  async delete(id: string): Promise<ApiResponse<void>> {
    return apiService.delete<void>(`/study-sets/${id}`);
  }

  // Add vocabulary to study set
  async addVocabulary(studySetId: string, vocabularyId: string): Promise<ApiResponse<StudySet>> {
    return apiService.post<StudySet>(
      `/study-sets/${studySetId}/vocabularies`,
      { vocabulary_id: vocabularyId }
    );
  }

  // Remove vocabulary from study set
  async removeVocabulary(studySetId: string, vocabularyId: string): Promise<ApiResponse<StudySet>> {
    return apiService.delete<StudySet>(
      `/study-sets/${studySetId}/vocabularies/${vocabularyId}`
    );
  }

  // Update vocabulary order
  async updateVocabularyOrder(
    studySetId: string,
    vocabularyIds: string[]
  ): Promise<ApiResponse<StudySet>> {
    return apiService.put<StudySet>(
      `/study-sets/${studySetId}/vocabularies/order`,
      { vocabulary_ids: vocabularyIds }
    );
  }

  // Upload image
  async uploadImage(
    studySetId: string,
    imageFile: { uri: string; type: string; name: string }
  ): Promise<ApiResponse<StudySet>> {
    return apiService.uploadFile<StudySet>(
      `/study-sets/${studySetId}/image`,
      imageFile
    );
  }

  // Get study progress
  async getProgress(studySetId: string): Promise<ApiResponse<{
    total: number;
    mastered: number;
    learning: number;
    not_started: number;
  }>> {
    return apiService.get(`/study-sets/${studySetId}/progress`);
  }

  // Create study set with vocabularies
  async createWithVocabularies(data: {
    title: string;
    description?: string;
    difficulty?: number;
    isPublic?: boolean;
    vocabularies: Array<{
      word: string;
      wordLanguage: string;
      definition: string;
      definitionLanguage: string;
      ipa?: string;
      audioUrl?: string;
      priority?: number;
    }>;
  }): Promise<ApiResponse<StudySet>> {
    return apiService.post<StudySet>('/study-set/with-vocabularies', data);
  }

  // Get many study sets (for recent section)
  async getMany(): Promise<ApiResponse<StudySet[]>> {
    return apiService.get<StudySet[]>('/study-set/many');
  }

  // Get study set full info with vocabularies
  async getFullInfo(studySetId: string): Promise<ApiResponse<{
    studySet: {
      _id: string;
      userId: string;
      title: string;
      description?: string;
      difficulty: number;
      isPublic: boolean;
      createdAt: string;
      updatedAt: string;
      dataPartitionCode?: string;
    };
    vocabularies: Array<{
      _id: string;
      userId?: string;
      word: string;
      wordLanguage: string;
      definition: string;
      definitionLanguage: string;
      ipa?: string;
      audioUrl?: string;
      priority: number;
      [key: string]: any;
    }>;
    status?: 'continue' | 'done' | 'not_started'; // Status cho phần "Học tiếp"
  }>> {
    return apiService.get(`/study-set/${studySetId}/full-info`);
  }
}

export const studySetService = new StudySetService();

