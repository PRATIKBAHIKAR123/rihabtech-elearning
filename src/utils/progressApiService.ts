import apiClient from './axiosInterceptor';
import { API_BASE_URL } from '../lib/api';

export interface StudentProgress {
  id: number;
  userId: number;
  courseId: number;
  sectionIndex: number;
  lectureIndex: number;
  progress: number; // 0-100
  totalLectures: number;
  completedSections: number[];
  completedLectures: Record<number, number[]>; // sectionIndex -> [lectureIndices]
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProgressRequest {
  courseId: number;
  sectionIndex: number;
  lectureIndex: number;
  isCompleted: boolean;
}

export interface ProgressResponse {
  success: boolean;
  message: string;
  progress?: StudentProgress;
}

class ProgressApiService {
  private readonly BASE_URL = `${API_BASE_URL}progress`;

  /**
   * Get progress for a specific course
   */
  async getProgress(courseId: number): Promise<StudentProgress | null> {
    try {
      const response = await apiClient.get(`${this.BASE_URL}/course/${courseId}`);
      return response.data || null;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      console.error('Error fetching progress:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch progress');
    }
  }

  /**
   * Update progress (mark lecture as completed/incomplete)
   */
  async updateProgress(data: UpdateProgressRequest): Promise<ProgressResponse> {
    try {
      const response = await apiClient.post(`${this.BASE_URL}/update`, data);
      return response.data;
    } catch (error: any) {
      console.error('Error updating progress:', error);
      throw new Error(error.response?.data?.message || 'Failed to update progress');
    }
  }

  /**
   * Get all progress for the current user
   */
  async getMyProgress(): Promise<StudentProgress[]> {
    try {
      const response = await apiClient.get(`${this.BASE_URL}/my-progress`);
      return response.data || [];
    } catch (error: any) {
      console.error('Error fetching user progress:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch progress');
    }
  }
}

export const progressApiService = new ProgressApiService();

