import apiClient from './api';
import type {
  Enrollment,
  EnrollmentCreate,
  CourseWithProgress,
} from '../types/course';
import type { PaginatedResponse } from '../types/pagination';

class EnrollmentService {
  async createEnrollment(enrollmentData: EnrollmentCreate): Promise<Enrollment> {
    const response = await apiClient.post<Enrollment>(
      '/enrollments',
      enrollmentData
    );
    return response.data;
  }

  async requestEnrollment(enrollmentData: EnrollmentCreate): Promise<Enrollment> {
    return this.createEnrollment(enrollmentData);
  }

  async getMyEnrollments(): Promise<Enrollment[]> {
    const response = await apiClient.get<Enrollment[]>('/enrollments/my-enrollments');
    return response.data;
  }

  async getMyEnrolledCourses(page: number = 1, limit: number = 10): Promise<PaginatedResponse<CourseWithProgress>> {
    const response = await apiClient.get<PaginatedResponse<CourseWithProgress>>('/enrollments/my-courses', {
      params: { page, limit }
    });
    return response.data;
  }

  async getCourseEnrollments(courseId: string): Promise<Enrollment[]> {
    const response = await apiClient.get<Enrollment[]>(`/enrollments/courses/${courseId}`);
    return response.data;
  }

  async getPendingEnrollments(): Promise<Enrollment[]> {
    const response = await apiClient.get<Enrollment[]>('/enrollments/pending');
    return response.data;
  }

  async getEnrolledStudentsCount(): Promise<number> {
    const response = await apiClient.get<number>('/enrollments/students-count');
    return response.data;
  }

  async approveEnrollment(enrollmentId: string): Promise<Enrollment> {
    const response = await apiClient.put<Enrollment>(
      `/enrollments/${enrollmentId}/approve`
    );
    return response.data;
  }

  async rejectEnrollment(enrollmentId: string): Promise<Enrollment> {
    const response = await apiClient.put<Enrollment>(
      `/enrollments/${enrollmentId}/reject`
    );
    return response.data;
  }
}

export default new EnrollmentService();

