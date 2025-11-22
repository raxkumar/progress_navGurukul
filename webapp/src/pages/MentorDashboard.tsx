import React, { useEffect, useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  CircularProgress,
} from '@mui/material';
import { Add, School, People, CheckCircle } from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import courseService from '../services/courseService';
import type { Course } from '../types/course';

const MentorDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const data = await courseService.getMyCourses();
      setCourses(data);
    } catch (error) {
      console.error('Failed to load courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = () => {
    navigate('/mentor/courses/new');
  };

  const handleViewCourse = (courseId: string) => {
    navigate(`/mentor/courses/${courseId}`);
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
              Manage your courses and track student progress
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleCreateCourse}
            size="large"
          >
            Create Course
          </Button>
        </Box>

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
                      {courses.length}
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Total courses created
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <People sx={{ fontSize: 40, color: 'success.main', mr: 2 }} />
                  <Box>
                    <Typography variant="h6" fontWeight={600}>
                      Students
                    </Typography>
                    <Typography variant="h4" fontWeight={700}>
                      0
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Total enrolled students
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <CheckCircle sx={{ fontSize: 40, color: 'warning.main', mr: 2 }} />
                  <Box>
                    <Typography variant="h6" fontWeight={600}>
                      Pending
                    </Typography>
                    <Typography variant="h4" fontWeight={700}>
                      0
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Pending enrollment requests
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Courses List */}
          <Grid item xs={12}>
            <Typography variant="h5" gutterBottom fontWeight={600} sx={{ mt: 2 }}>
              My Courses
            </Typography>

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : courses.length === 0 ? (
              <Card>
                <CardContent sx={{ textAlign: 'center', py: 4 }}>
                  <School sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    No courses yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Create your first course to get started
                  </Typography>
                  <Button variant="contained" startIcon={<Add />} onClick={handleCreateCourse}>
                    Create Course
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Grid container spacing={2}>
                {courses.map((course) => (
                  <Grid item xs={12} md={6} key={course._id}>
                    <Card sx={{ cursor: 'pointer', '&:hover': { boxShadow: 4 } }}>
                      <CardContent onClick={() => handleViewCourse(course._id)}>
                        <Typography variant="h6" gutterBottom fontWeight={600}>
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
                            mb: 2
                          }}
                        >
                          {course.description}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Created: {new Date(course.created_at).toLocaleDateString()}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Grid>
        </Grid>
      </Container>
    </Layout>
  );
};

export default MentorDashboard;
