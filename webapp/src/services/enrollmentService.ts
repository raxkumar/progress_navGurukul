import apiClient from './api';
import type {
  Enrollment,
  EnrollmentCreate,
} from '../types/course';

class EnrollmentService {
  async requestEnrollment(enrollmentData: EnrollmentCreate): Promise<Enrollment> {
    const response = await apiClient.post<Enrollment>(
      '/enrollments',
      enrollmentData
    );
    return response.data;
  }

  async getMyEnrollments(): Promise<Enrollment[]> {
    const response = await apiClient.get<Enrollment[]>('/enrollments/my-enrollments');
    return response.data;
  }

  async getCourseEnrollments(courseId: string): Promise<Enrollment[]> {
    const response = await apiClient.get<Enrollment[]>(`/enrollments/courses/${courseId}`);
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

