// ============================================
// Statistics & Activity Service
// ============================================

import { Activity, ApiResponse, Statistics } from '@/types';
import { apiService } from './api';

export class StatisticsService {
  // Get user statistics
  async getStatistics(): Promise<ApiResponse<Statistics>> {
    return apiService.get<Statistics>('/statistics');
  }

  // Get activities
  async getActivities(params?: {
    startDate?: string;
    endDate?: string;
    limit?: number;
  }): Promise<ApiResponse<Activity[]>> {
    const queryParams = new URLSearchParams();
    if (params?.startDate) queryParams.append('start_date', params.startDate);
    if (params?.endDate) queryParams.append('end_date', params.endDate);
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const query = queryParams.toString();
    return apiService.get<Activity[]>(`/activities${query ? `?${query}` : ''}`);
  }

  // Get streak information
  async getStreak(): Promise<ApiResponse<{
    current_streak: number;
    longest_streak: number;
    last_study_date?: string;
  }>> {
    return apiService.get('/statistics/streak');
  }

  // Get study time chart data
  async getStudyTimeChart(days: number = 30): Promise<ApiResponse<Array<{
    date: string;
    time_spent: number;
  }>>> {
    return apiService.get(`/statistics/study-time?days=${days}`);
  }
}

export const statisticsService = new StatisticsService();

