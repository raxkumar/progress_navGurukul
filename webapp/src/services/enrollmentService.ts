import apiClient from './api';
import type {
  Enrollment,
  EnrollmentCreate,
  CourseWithProgress,
} from '../types/course';

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

  async getMyEnrolledCourses(): Promise<CourseWithProgress[]> {
    const response = await apiClient.get<CourseWithProgress[]>('/enrollments/my-courses');
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

