import apiClient from './api';

export interface StudentStats {
  _id: string;
  student_id: string;
  total_enrolled_courses: number;
  total_approved_courses: number;
  total_completed_lessons: number;
  total_available_lessons: number;
  overall_progress_percentage: number;
  last_updated: string;
}

class StudentStatsService {
  async getMyStats(): Promise<StudentStats> {
    const response = await apiClient.get<StudentStats>('/student-stats/my-stats');
    return response.data;
  }

  async recalculateStats(): Promise<void> {
    await apiClient.post('/student-stats/recalculate');
  }
}

export default new StudentStatsService();

