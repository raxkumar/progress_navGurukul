import React, { useEffect, useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Paper,
  Button,
  CircularProgress,
  Alert,
  Chip,
  LinearProgress,
  CardActions,
  Pagination,
  Stack,
} from '@mui/material';
import { School, Assignment, TrendingUp, Add, CheckCircle, HourglassEmpty, Cancel, BarChart } from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import enrollmentService from '../services/enrollmentService';
import progressService from '../services/progressService';
import studentStatsService from '../services/studentStatsService';
import type { StudentStats } from '../services/studentStatsService';
import type { CourseWithProgress, EnrollmentStatus } from '../types/course';
import { ROUTES } from '../config/constants';

const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [enrolledCourses, setEnrolledCourses] = useState<CourseWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCourses, setTotalCourses] = useState(0);
  const limit = 6; // Show 6 courses per page
  const [studentStats, setStudentStats] = useState<StudentStats | null>(null);

  useEffect(() => {
    fetchData();
  }, [page]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch enrolled courses and stats in parallel
      const [coursesResponse, stats] = await Promise.all([
        enrollmentService.getMyEnrolledCourses(page, limit),
        studentStatsService.getMyStats(),
      ]);
      
      const courses = coursesResponse.items;
      setTotalPages(coursesResponse.total_pages);
      setTotalCourses(coursesResponse.total);
      setStudentStats(stats);
      
      // Fetch progress for each course
      const coursesWithProgress = await Promise.all(
        courses.map(async (course) => {
          try {
            const progress = await progressService.getCourseProgress(course._id);
            return { ...course, progress };
          } catch (err) {
            return course;
          }
        })
      );

      setEnrolledCourses(coursesWithProgress);
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError(err.response?.data?.detail || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getEnrollmentStatusIcon = (status: EnrollmentStatus) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircle sx={{ fontSize: 20 }} />;
      case 'PENDING':
        return <HourglassEmpty sx={{ fontSize: 20 }} />;
      case 'REJECTED':
        return <Cancel sx={{ fontSize: 20 }} />;
      default:
        return null;
    }
  };

  const getEnrollmentStatusColor = (status: EnrollmentStatus) => {
    switch (status) {
      case 'APPROVED':
        return 'success';
      case 'PENDING':
        return 'warning';
      case 'REJECTED':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Layout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
              Welcome, {user?.email}!
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Track your learning progress and achievements
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<BarChart />}
              onClick={() => navigate(ROUTES.STUDENT_ANALYTICS)}
            >
              View Analytics
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<Add />}
              onClick={() => navigate(ROUTES.STUDENT_COURSES)}
            >
              Enroll Courses
            </Button>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Stats Cards */}
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <School sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                  <Box>
                    <Typography variant="h6" fontWeight={600}>
                      Courses
                    </Typography>
                    <Typography variant="h4" fontWeight={700}>
                      {loading ? '...' : (studentStats?.total_enrolled_courses || 0)}
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Enrolled courses
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Assignment sx={{ fontSize: 40, color: 'success.main', mr: 2 }} />
                  <Box>
                    <Typography variant="h6" fontWeight={600}>
                      Lessons
                    </Typography>
                    <Typography variant="h4" fontWeight={700}>
                      {loading ? '...' : (studentStats?.total_completed_lessons || 0)}
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Completed lessons
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <TrendingUp sx={{ fontSize: 40, color: 'warning.main', mr: 2 }} />
                  <Box>
                    <Typography variant="h6" fontWeight={600}>
                      Progress
                    </Typography>
                    <Typography variant="h4" fontWeight={700}>
                      {loading ? '...' : `${Math.round(studentStats?.overall_progress_percentage || 0)}%`}
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Overall completion
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Enrolled Courses */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h5" fontWeight={600}>
                My Enrolled Courses
              </Typography>
            </Box>

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : enrolledCourses.length === 0 ? (
              <Paper sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h6" gutterBottom color="text.secondary">
                  No enrolled courses yet
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Start your learning journey by enrolling in courses
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<Add />}
                  onClick={() => navigate(ROUTES.STUDENT_COURSES)}
                >
                  Browse Courses
                </Button>
              </Paper>
            ) : (
              <Grid container spacing={3}>
                {enrolledCourses.map((course) => (
                  <Grid item xs={12} md={6} key={course._id}>
                    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                          <Typography variant="h6" fontWeight={600} sx={{ flexGrow: 1 }}>
                            {course.title}
                          </Typography>
                          {course.enrollment && (
                            <Chip
                              icon={getEnrollmentStatusIcon(course.enrollment.status)}
                              label={course.enrollment.status}
                              color={getEnrollmentStatusColor(course.enrollment.status) as any}
                              size="small"
                            />
                          )}
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {course.description}
                        </Typography>
                        {course.progress && (
                          <Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                              <Typography variant="body2" color="text.secondary">
                                Progress
                              </Typography>
                              <Typography variant="body2" fontWeight={600}>
                                {course.progress.completed_lessons}/{course.progress.total_lessons} lessons
                              </Typography>
                            </Box>
                            <LinearProgress
                              variant="determinate"
                              value={course.progress.completion_percentage}
                              sx={{ height: 8, borderRadius: 4 }}
                            />
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                              {Math.round(course.progress.completion_percentage)}% Complete
                            </Typography>
                          </Box>
                        )}
                      </CardContent>
                      <CardActions>
                        {course.enrollment?.status === 'APPROVED' ? (
                          <Button
                            fullWidth
                            variant="contained"
                            onClick={() => navigate(ROUTES.STUDENT_COURSE_DETAIL.replace(':courseId', course._id))}
                          >
                            Continue Learning
                          </Button>
                        ) : course.enrollment?.status === 'PENDING' ? (
                          <Button fullWidth variant="outlined" disabled>
                            Awaiting Approval
                          </Button>
                        ) : (
                          <Button fullWidth variant="outlined" disabled>
                            Enrollment Rejected
                          </Button>
                        )}
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
            
            {/* Pagination */}
            {!loading && enrolledCourses.length > 0 && totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Stack spacing={2}>
                  <Pagination 
                    count={totalPages} 
                    page={page} 
                    onChange={handlePageChange}
                    color="primary"
                    size="large"
                    showFirstButton
                    showLastButton
                  />
                  <Typography variant="body2" color="text.secondary" textAlign="center">
                    Showing page {page} of {totalPages} ({totalCourses} total courses)
                  </Typography>
                </Stack>
              </Box>
            )}
          </Grid>
        </Grid>
      </Container>
    </Layout>
  );
};

export default StudentDashboard;

