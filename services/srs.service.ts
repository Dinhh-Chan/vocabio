// ============================================
// SRS (Spaced Repetition System) Service
// ============================================

import { SRS_CONFIG } from '@/constants/config';
import { ApiResponse, SrsProgress, SrsQuality, Vocabulary } from '@/types';
import { apiService } from './api';

export class SrsService {
  // Get SRS progress for vocabulary
  async getProgress(vocabularyId: string): Promise<ApiResponse<SrsProgress>> {
    return apiService.get<SrsProgress>(`/srs/progress/${vocabularyId}`);
  }

  // Get all vocabularies due for review
  async getDueForReview(params?: {
    limit?: number;
    studySetId?: string;
  }): Promise<ApiResponse<Vocabulary[]>> {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.studySetId) queryParams.append('study_set_id', params.studySetId);

    const query = queryParams.toString();
    return apiService.get<Vocabulary[]>(`/srs/due${query ? `?${query}` : ''}`);
  }

  // Submit review result (SM-2 algorithm)
  async submitReview(
    vocabularyId: string,
    quality: SrsQuality
  ): Promise<ApiResponse<SrsProgress>> {
    return apiService.post<SrsProgress>('/srs/review', {
      vocabulary_id: vocabularyId,
      quality,
    });
  }

  // Get review statistics
  async getStatistics(): Promise<ApiResponse<{
    due_today: number;
    due_this_week: number;
    mastered: number;
    learning: number;
    new_cards: number;
  }>> {
    return apiService.get('/srs/statistics');
  }

  // Calculate next review date using SM-2 algorithm
  calculateNextReview(
    currentProgress: SrsProgress,
    quality: SrsQuality
  ): Partial<SrsProgress> {
    let { interval, easiness, repetitions } = currentProgress;

    // Update easiness factor
    const q = quality;
    const ef = easiness + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
    easiness = Math.max(SRS_CONFIG.MIN_EASINESS, ef);

    // Update repetitions and interval
    if (q < 3) {
      // Incorrect response - reset
      repetitions = 0;
      interval = 1;
    } else {
      repetitions += 1;
      if (repetitions === 1) {
        interval = 1;
      } else if (repetitions === 2) {
        interval = 6;
      } else {
        interval = Math.round(interval * easiness);
      }
    }

    // Calculate next review date
    const nextReviewAt = new Date();
    nextReviewAt.setDate(nextReviewAt.getDate() + interval);

    return {
      interval,
      easiness,
      repetitions,
      next_review_at: nextReviewAt.toISOString(),
      last_review_at: new Date().toISOString(),
    };
  }
}

export const srsService = new SrsService();

