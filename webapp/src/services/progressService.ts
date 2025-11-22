import apiClient from './api';
import type {
  Progress,
  CourseProgress,
} from '../types/course';

class ProgressService {
  async markLessonComplete(lessonId: string): Promise<Progress> {
    const response = await apiClient.post<Progress>(
      `/progress/lessons/${lessonId}/complete`
    );
    return response.data;
  }

  async getCourseProgress(courseId: string): Promise<CourseProgress> {
    const response = await apiClient.get<CourseProgress>(
      `/progress/courses/${courseId}`
    );
    return response.data;
  }

  async getCourseProgressDetails(courseId: string): Promise<Progress[]> {
    const response = await apiClient.get<Progress[]>(
      `/progress/courses/${courseId}/details`
    );
    return response.data;
  }

  async getStudentProgressMentor(
    studentId: string,
    courseId: string
  ): Promise<CourseProgress> {
    const response = await apiClient.get<CourseProgress>(
      `/progress/students/${studentId}/courses/${courseId}`
    );
    return response.data;
  }
}

export default new ProgressService();

