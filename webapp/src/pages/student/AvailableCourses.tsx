import React, { useEffect, useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  CircularProgress,
  Alert,
  Chip,
  CardActions,
  Snackbar,
} from '@mui/material';
import { CheckCircle, HourglassEmpty, School } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import courseService from '../../services/courseService';
import enrollmentService from '../../services/enrollmentService';
import type { Course, Enrollment } from '../../types/course';
import { ROUTES } from '../../config/constants';

const AvailableCourses: React.FC = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Map<string, Enrollment>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [enrolling, setEnrolling] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all courses
      const allCourses = await courseService.getAllCourses();
      setCourses(allCourses);

      // Fetch my enrollments
      const myEnrollments = await enrollmentService.getMyEnrollments();
      const enrollmentMap = new Map<string, Enrollment>();
      myEnrollments.forEach((enrollment) => {
        enrollmentMap.set(enrollment.course_id, enrollment);
      });
      setEnrollments(enrollmentMap);
    } catch (err: any) {
      console.error('Error fetching courses:', err);
      setError(err.response?.data?.detail || 'Failed to fetch courses');
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (courseId: string) => {
    try {
      setEnrolling(courseId);
      setError(null);
      const enrollment = await enrollmentService.createEnrollment({ course_id: courseId });
      
      // Update enrollments map
      setEnrollments(new Map(enrollments.set(courseId, enrollment)));
      setSuccessMessage('Enrollment request submitted! Awaiting mentor approval.');
    } catch (err: any) {
      console.error('Error enrolling in course:', err);
      setError(err.response?.data?.detail || 'Failed to enroll in course');
    } finally {
      setEnrolling(null);
    }
  };

  const getEnrollmentStatus = (courseId: string) => {
    return enrollments.get(courseId);
  };

  return (
    <Layout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
            Available Courses
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Browse and enroll in courses to start your learning journey
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : courses.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <School sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom color="text.secondary">
              No courses available yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Check back later for new courses
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {courses.map((course) => {
              const enrollment = getEnrollmentStatus(course._id);
              const isEnrolling = enrolling === course._id;

              return (
                <Grid item xs={12} md={6} lg={4} key={course._id}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                        <Typography variant="h6" fontWeight={600} sx={{ flexGrow: 1 }}>
                          {course.title}
                        </Typography>
                        {enrollment && (
                          <Chip
                            icon={
                              enrollment.status === 'APPROVED' ? (
                                <CheckCircle sx={{ fontSize: 16 }} />
                              ) : (
                                <HourglassEmpty sx={{ fontSize: 16 }} />
                              )
                            }
                            label={enrollment.status}
                            color={
                              enrollment.status === 'APPROVED'
                                ? 'success'
                                : enrollment.status === 'PENDING'
                                ? 'warning'
                                : 'error'
                            }
                            size="small"
                          />
                        )}
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {course.description}
                      </Typography>
                    </CardContent>
                    <CardActions>
                      {enrollment ? (
                        enrollment.status === 'APPROVED' ? (
                          <Button
                            fullWidth
                            variant="contained"
                            onClick={() => navigate(ROUTES.STUDENT_COURSE_DETAIL.replace(':courseId', course._id))}
                          >
                            View Course
                          </Button>
                        ) : enrollment.status === 'PENDING' ? (
                          <Button fullWidth variant="outlined" disabled>
                            Awaiting Approval
                          </Button>
                        ) : (
                          <Button
                            fullWidth
                            variant="outlined"
                            onClick={() => handleEnroll(course._id)}
                            disabled={isEnrolling}
                          >
                            {isEnrolling ? <CircularProgress size={24} /> : 'Request Again'}
                          </Button>
                        )
                      ) : (
                        <Button
                          fullWidth
                          variant="contained"
                          onClick={() => handleEnroll(course._id)}
                          disabled={isEnrolling}
                        >
                          {isEnrolling ? <CircularProgress size={24} /> : 'Enroll Now'}
                        </Button>
                      )}
                    </CardActions>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}

        <Snackbar
          open={!!successMessage}
          autoHideDuration={6000}
          onClose={() => setSuccessMessage(null)}
          message={successMessage}
        />
      </Container>
    </Layout>
  );
};

export default AvailableCourses;

