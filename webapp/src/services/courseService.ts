import apiClient from './api';
import type {
  Course,
  CourseCreate,
  CourseUpdate,
} from '../types/course';

class CourseService {
  async createCourse(courseData: CourseCreate): Promise<Course> {
    const response = await apiClient.post<Course>('/courses', courseData);
    return response.data;
  }

  async getAllCourses(): Promise<Course[]> {
    const response = await apiClient.get<Course[]>('/courses');
    return response.data;
  }

  async getMyCourses(): Promise<Course[]> {
    const response = await apiClient.get<Course[]>('/courses/my-courses');
    return response.data;
  }

  async getCourseById(courseId: string): Promise<Course> {
    const response = await apiClient.get<Course>(`/courses/${courseId}`);
    return response.data;
  }

  async updateCourse(courseId: string, courseData: CourseUpdate): Promise<Course> {
    const response = await apiClient.put<Course>(`/courses/${courseId}`, courseData);
    return response.data;
  }

  async deleteCourse(courseId: string): Promise<void> {
    await apiClient.delete(`/courses/${courseId}`);
  }
}

export default new CourseService();

