import apiClient from './api';
import type {
  Lesson,
  LessonCreate,
  LessonUpdate,
} from '../types/course';

class LessonService {
  async createLesson(courseId: string, lessonData: LessonCreate): Promise<Lesson> {
    const response = await apiClient.post<Lesson>(
      `/courses/${courseId}/lessons`,
      lessonData
    );
    return response.data;
  }

  async getLessonsByCourse(courseId: string): Promise<Lesson[]> {
    const response = await apiClient.get<Lesson[]>(`/courses/${courseId}/lessons`);
    return response.data;
  }

  async getLessonById(lessonId: string): Promise<Lesson> {
    const response = await apiClient.get<Lesson>(`/lessons/${lessonId}`);
    return response.data;
  }

  async updateLesson(lessonId: string, lessonData: LessonUpdate): Promise<Lesson> {
    const response = await apiClient.put<Lesson>(`/lessons/${lessonId}`, lessonData);
    return response.data;
  }

  async deleteLesson(lessonId: string): Promise<void> {
    await apiClient.delete(`/lessons/${lessonId}`);
  }
}

export default new LessonService();

