export enum LessonType {
  PDF = 'PDF',
  VIDEO = 'VIDEO',
  PPT = 'PPT',
  DOCUMENT = 'DOCUMENT',
  OTHER = 'OTHER',
}

export enum EnrollmentStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export interface Course {
  _id: string;
  title: string;
  description: string;
  mentor_id: string;
  created_at: string;
  updated_at: string;
}

export interface CourseCreate {
  title: string;
  description: string;
}

export interface CourseUpdate {
  title?: string;
  description?: string;
}

export interface Lesson {
  _id: string;
  course_id: string;
  title: string;
  description: string;
  type: LessonType;
  order: number;
  duration?: number;
  created_at: string;
}

export interface LessonCreate {
  title: string;
  description: string;
  type: LessonType;
  order: number;
  duration?: number;
}

export interface LessonUpdate {
  title?: string;
  description?: string;
  type?: LessonType;
  order?: number;
  duration?: number;
}

export interface Enrollment {
  _id: string;
  student_id: string;
  course_id: string;
  status: EnrollmentStatus;
  requested_at: string;
  approved_at?: string;
  approved_by?: string;
}

export interface EnrollmentCreate {
  course_id: string;
}

export interface Progress {
  _id: string;
  student_id: string;
  lesson_id: string;
  course_id: string;
  completed: boolean;
  completed_at?: string;
}

export interface CourseProgress {
  course_id: string;
  total_lessons: number;
  completed_lessons: number;
  completion_percentage: number;
}

export interface CourseWithProgress extends Course {
  progress?: CourseProgress;
  enrollment?: Enrollment;
}

