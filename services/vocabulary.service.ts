// ============================================
// Vocabulary Service
// ============================================

import { ApiResponse, PaginatedResponse, Vocabulary } from '@/types';
import { apiService } from './api';

export class VocabularyService {
  // Get all vocabularies
  async getAll(params?: {
    page?: number;
    limit?: number;
    search?: string;
    tags?: string[];
    topic?: string;
  }): Promise<ApiResponse<PaginatedResponse<Vocabulary>>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.tags) params.tags.forEach(tag => queryParams.append('tags', tag));
    if (params?.topic) queryParams.append('topic', params.topic);

    const query = queryParams.toString();
    return apiService.get<PaginatedResponse<Vocabulary>>(
      `/vocabularies${query ? `?${query}` : ''}`
    );
  }

  // Get vocabulary by ID
  async getById(id: string): Promise<ApiResponse<Vocabulary>> {
    return apiService.get<Vocabulary>(`/vocabularies/${id}`);
  }

  // Create vocabulary
  async create(vocabulary: Partial<Vocabulary>): Promise<ApiResponse<Vocabulary>> {
    return apiService.post<Vocabulary>('/vocabularies', vocabulary);
  }

  // Update vocabulary
  async update(id: string, vocabulary: Partial<Vocabulary>): Promise<ApiResponse<Vocabulary>> {
    return apiService.put<Vocabulary>(`/vocabularies/${id}`, vocabulary);
  }

  // Delete vocabulary
  async delete(id: string): Promise<ApiResponse<void>> {
    return apiService.delete<void>(`/vocabularies/${id}`);
  }

  // Add definition to vocabulary
  async addDefinition(
    vocabularyId: string,
    definition: { definition: string; example?: string; exampleTranslation?: string }
  ): Promise<ApiResponse<Vocabulary>> {
    return apiService.post<Vocabulary>(
      `/vocabularies/${vocabularyId}/definitions`,
      definition
    );
  }

  // Update definition
  async updateDefinition(
    vocabularyId: string,
    definitionId: string,
    definition: Partial<{ definition: string; example?: string; exampleTranslation?: string }>
  ): Promise<ApiResponse<Vocabulary>> {
    return apiService.put<Vocabulary>(
      `/vocabularies/${vocabularyId}/definitions/${definitionId}`,
      definition
    );
  }

  // Delete definition
  async deleteDefinition(
    vocabularyId: string,
    definitionId: string
  ): Promise<ApiResponse<Vocabulary>> {
    return apiService.delete<Vocabulary>(
      `/vocabularies/${vocabularyId}/definitions/${definitionId}`
    );
  }

  // Upload audio
  async uploadAudio(
    vocabularyId: string,
    audioFile: { uri: string; type: string; name: string }
  ): Promise<ApiResponse<Vocabulary>> {
    return apiService.uploadFile<Vocabulary>(
      `/vocabularies/${vocabularyId}/audio`,
      audioFile
    );
  }

  // Import from CSV/Excel
  async importFromFile(file: { uri: string; type: string; name: string }): Promise<ApiResponse<{ imported: number; errors: any[] }>> {
    return apiService.uploadFile<{ imported: number; errors: any[] }>(
      '/vocabularies/import',
      file
    );
  }

  // AI generate context
  async generateContext(words: string[]): Promise<ApiResponse<{ examples: string[]; contexts: string[] }>> {
    return apiService.post<{ examples: string[]; contexts: string[] }>(
      '/vocabularies/ai/generate-context',
      { words }
    );
  }

  // AI extract vocabulary from text
  async extractFromText(text: string): Promise<ApiResponse<Vocabulary[]>> {
    return apiService.post<Vocabulary[]>('/vocabularies/ai/extract', { text });
  }
}

export const vocabularyService = new VocabularyService();

