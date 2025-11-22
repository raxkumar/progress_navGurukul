import React, { useEffect, useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Alert,
  Paper,
  Chip,
} from '@mui/material';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  Label,
} from 'recharts';
import { CheckCircle, TrendingUp, HourglassEmpty, ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { Button } from '@mui/material';
import Layout from '../../components/layout/Layout';
import enrollmentService from '../../services/enrollmentService';
import progressService from '../../services/progressService';
import type { CourseWithProgress } from '../../types/course';
import { ROUTES } from '../../config/constants';

interface CourseCompletionData {
  name: string;
  value: number;
  color: string;
  courses: CourseWithProgress[];
}

const Analytics: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [enrolledCourses, setEnrolledCourses] = useState<CourseWithProgress[]>([]);
  const [completionData, setCompletionData] = useState<CourseCompletionData[]>([]);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all enrolled courses by paginating (max 100 per page)
      let allCourses: CourseWithProgress[] = [];
      let currentPage = 1;
      let totalPages = 1;

      // Fetch first page to get total pages
      const firstResponse = await enrollmentService.getMyEnrolledCourses(currentPage, 100);
      allCourses = [...firstResponse.items];
      totalPages = firstResponse.total_pages;

      // Fetch remaining pages if any
      while (currentPage < totalPages) {
        currentPage++;
        const response = await enrollmentService.getMyEnrolledCourses(currentPage, 100);
        allCourses = [...allCourses, ...response.items];
      }

      const courses = allCourses;

      // Only process approved courses
      const approvedCourses = courses.filter(
        (course) => course.enrollment?.status === 'APPROVED'
      );

      // Fetch progress for each approved course
      const coursesWithProgress = await Promise.all(
        approvedCourses.map(async (course) => {
          try {
            const progress = await progressService.getCourseProgress(course._id);
            return { ...course, progress };
          } catch (err) {
            return course;
          }
        })
      );

      setEnrolledCourses(coursesWithProgress);

      // Calculate completion status
      const completed = coursesWithProgress.filter(
        (course) => course.progress?.completion_percentage === 100
      );
      const inProgress = coursesWithProgress.filter(
        (course) =>
          course.progress &&
          course.progress.completion_percentage > 0 &&
          course.progress.completion_percentage < 100
      );
      const notStarted = coursesWithProgress.filter(
        (course) => !course.progress || course.progress.completion_percentage === 0
      );

      const data: CourseCompletionData[] = [
        {
          name: 'Completed',
          value: completed.length,
          color: '#4caf50',
          courses: completed,
        },
        {
          name: 'In Progress',
          value: inProgress.length,
          color: '#2196f3',
          courses: inProgress,
        },
        {
          name: 'Not Started',
          value: notStarted.length,
          color: '#9e9e9e',
          courses: notStarted,
        },
      ].filter((item) => item.value > 0); // Only show categories with courses

      setCompletionData(data);
    } catch (err: any) {
      console.error('Error fetching analytics data:', err);
      setError(err.response?.data?.detail || 'Failed to fetch analytics data');
    } finally {
      setLoading(false);
    }
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <Paper sx={{ p: 2 }}>
          <Typography variant="body2" fontWeight={600}>
            {data.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {data.value} course{data.value !== 1 ? 's' : ''}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {data.courses.length > 0 && (
              <>
                {data.courses.slice(0, 3).map((course: CourseWithProgress) => (
                  <div key={course._id}>• {course.title}</div>
                ))}
                {data.courses.length > 3 && (
                  <div>... and {data.courses.length - 3} more</div>
                )}
              </>
            )}
          </Typography>
        </Paper>
      );
    }
    return null;
  };

  const totalCourses = enrolledCourses.length;
  const completionPercentage =
    totalCourses > 0
      ? Math.round(
          (completionData.find((d) => d.name === 'Completed')?.value || 0 / totalCourses) * 100
        )
      : 0;

  return (
    <Layout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() => navigate(ROUTES.STUDENT_DASHBOARD)}
            sx={{ mb: 3 }}
          >
            Back to Dashboard
          </Button>
          <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
            Learning Analytics
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Track your course completion status and progress
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress size={60} />
          </Box>
        ) : enrolledCourses.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom color="text.secondary">
              No approved courses yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Enroll in courses to start tracking your progress
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate(ROUTES.STUDENT_COURSES)}
            >
              Browse Courses
            </Button>
          </Paper>
        ) : (
          <>
            {/* Summary Statistics */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={4}>
                <Card sx={{ height: '100%', bgcolor: 'success.light' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <CheckCircle sx={{ fontSize: 32, color: 'success.dark', mr: 2 }} />
                      <Box>
                        <Typography variant="h5" fontWeight={700} color="success.dark">
                          {completionData.find((d) => d.name === 'Completed')?.value || 0}
                        </Typography>
                        <Typography variant="body2" color="success.dark">
                          Completed
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={4}>
                <Card sx={{ height: '100%', bgcolor: 'primary.light' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <TrendingUp sx={{ fontSize: 32, color: 'primary.dark', mr: 2 }} />
                      <Box>
                        <Typography variant="h5" fontWeight={700} color="primary.dark">
                          {completionData.find((d) => d.name === 'In Progress')?.value || 0}
                        </Typography>
                        <Typography variant="body2" color="primary.dark">
                          In Progress
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={4}>
                <Card sx={{ height: '100%', bgcolor: 'grey.300' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <HourglassEmpty sx={{ fontSize: 32, color: 'grey.700', mr: 2 }} />
                      <Box>
                        <Typography variant="h5" fontWeight={700} color="grey.700">
                          {completionData.find((d) => d.name === 'Not Started')?.value || 0}
                        </Typography>
                        <Typography variant="body2" color="grey.700">
                          Not Started
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Pie Chart */}
            <Card sx={{ p: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom fontWeight={600}>
                  Course Completion Status
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Distribution of your {totalCourses} enrolled course
                  {totalCourses !== 1 ? 's' : ''}
                </Typography>

                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie
                      data={completionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={140}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, value, percent }) =>
                        `${name}: ${value} (${(percent * 100).toFixed(0)}%)`
                      }
                      labelLine={true}
                    >
                      {completionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                      <Label
                        value={`${totalCourses}`}
                        position="center"
                        style={{
                          fontSize: '32px',
                          fontWeight: 'bold',
                          fill: '#666',
                        }}
                      />
                      <Label
                        value="Total Courses"
                        position="center"
                        dy={25}
                        style={{
                          fontSize: '14px',
                          fill: '#999',
                        }}
                      />
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      iconType="circle"
                      formatter={(value, entry: any) => (
                        <span style={{ color: '#666', fontWeight: 500 }}>
                          {value} ({entry.payload.value})
                        </span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Course List by Category */}
            <Box sx={{ mt: 4 }}>
              {completionData.map((category) => (
                <Card key={category.name} sx={{ mb: 3 }}>
                  <CardContent>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        mb: 2,
                      }}
                    >
                      <Typography variant="h6" fontWeight={600}>
                        {category.name} Courses
                      </Typography>
                      <Chip
                        label={`${category.value} course${category.value !== 1 ? 's' : ''}`}
                        sx={{
                          bgcolor: category.color,
                          color: 'white',
                          fontWeight: 600,
                        }}
                      />
                    </Box>
                    <Grid container spacing={2}>
                      {category.courses.map((course) => (
                        <Grid item xs={12} sm={6} md={4} key={course._id}>
                          <Card
                            variant="outlined"
                            sx={{
                              cursor: 'pointer',
                              '&:hover': { boxShadow: 2 },
                              borderColor: category.color,
                              borderWidth: 2,
                            }}
                            onClick={() =>
                              navigate(
                                ROUTES.STUDENT_COURSE_DETAIL.replace(':courseId', course._id)
                              )
                            }
                          >
                            <CardContent>
                              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                                {course.title}
                              </Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                }}
                              >
                                {course.description}
                              </Typography>
                              {course.progress && (
                                <Box sx={{ mt: 2 }}>
                                  <Typography variant="caption" color="text.secondary">
                                    {course.progress.completed_lessons}/{course.progress.total_lessons}{' '}
                                    lessons • {Math.round(course.progress.completion_percentage)}%
                                  </Typography>
                                </Box>
                              )}
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </>
        )}
      </Container>
    </Layout>
  );
};

export default Analytics;

