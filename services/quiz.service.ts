// ============================================
// Quiz Service
// ============================================

import { ApiResponse, PaginatedResponse, Quiz, QuizQuestion, QuizResult, QuizType } from '@/types';
import { apiService } from './api';

export class QuizService {
  // Get all quizzes
  async getAll(params?: {
    page?: number;
    limit?: number;
    studySetId?: string;
    type?: QuizType;
  }): Promise<ApiResponse<PaginatedResponse<Quiz>>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.studySetId) queryParams.append('study_set_id', params.studySetId);
    if (params?.type) queryParams.append('type', params.type);

    const query = queryParams.toString();
    return apiService.get<PaginatedResponse<Quiz>>(
      `/quizzes${query ? `?${query}` : ''}`
    );
  }

  // Get quiz by ID with questions
  async getById(id: string): Promise<ApiResponse<Quiz & { questions: QuizQuestion[] }>> {
    return apiService.get<Quiz & { questions: QuizQuestion[] }>(`/quizzes/${id}`);
  }

  // Create quiz
  async create(quiz: Partial<Quiz>): Promise<ApiResponse<Quiz>> {
    return apiService.post<Quiz>('/quizzes', quiz);
  }

  // Update quiz
  async update(id: string, quiz: Partial<Quiz>): Promise<ApiResponse<Quiz>> {
    return apiService.put<Quiz>(`/quizzes/${id}`, quiz);
  }

  // Delete quiz
  async delete(id: string): Promise<ApiResponse<void>> {
    return apiService.delete<void>(`/quizzes/${id}`);
  }

  // Generate quiz automatically from study set (AI)
  async generateFromStudySet(
    studySetId: string,
    type: QuizType,
    questionCount?: number
  ): Promise<ApiResponse<Quiz>> {
    return apiService.post<Quiz>('/quizzes/generate', {
      study_set_id: studySetId,
      type,
      question_count: questionCount,
    });
  }

  // Submit quiz result
  async submitResult(result: {
    quiz_id: string;
    answers: Array<{ question_id: string; answer_id?: string; answer_text?: string }>;
    time_taken?: number;
  }): Promise<ApiResponse<QuizResult>> {
    return apiService.post<QuizResult>('/quizzes/submit', result);
  }

  // Get quiz results history
  async getResults(
    quizId?: string,
    params?: { page?: number; limit?: number }
  ): Promise<ApiResponse<PaginatedResponse<QuizResult>>> {
    const queryParams = new URLSearchParams();
    if (quizId) queryParams.append('quiz_id', quizId);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const query = queryParams.toString();
    return apiService.get<PaginatedResponse<QuizResult>>(
      `/quizzes/results${query ? `?${query}` : ''}`
    );
  }
}

export const quizService = new QuizService();

