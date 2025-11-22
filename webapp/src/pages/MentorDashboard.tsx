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
  Alert,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Snackbar,
} from '@mui/material';
import { Add, School, People, CheckCircle, HourglassEmpty, Check, Close } from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import courseService from '../services/courseService';
import enrollmentService from '../services/enrollmentService';
import type { Course, Enrollment } from '../types/course';

const MentorDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrollmentRequests, setEnrollmentRequests] = useState<Enrollment[]>([]);
  const [showEnrollmentsDialog, setShowEnrollmentsDialog] = useState(false);
  const [processing, setProcessing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [coursesData, enrollmentsData] = await Promise.all([
        courseService.getMyCourses(),
        enrollmentService.getPendingEnrollments(),
      ]);
      setCourses(coursesData);
      setEnrollmentRequests(enrollmentsData);
    } catch (error) {
      console.error('Failed to load data:', error);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveEnrollment = async (enrollmentId: string) => {
    try {
      setProcessing(enrollmentId);
      setError(null);
      await enrollmentService.approveEnrollment(enrollmentId);
      setSuccessMessage('Enrollment approved successfully!');
      // Refresh data
      await loadData();
    } catch (err: any) {
      console.error('Error approving enrollment:', err);
      setError(err.response?.data?.detail || 'Failed to approve enrollment');
    } finally {
      setProcessing(null);
    }
  };

  const handleRejectEnrollment = async (enrollmentId: string) => {
    try {
      setProcessing(enrollmentId);
      setError(null);
      await enrollmentService.rejectEnrollment(enrollmentId);
      setSuccessMessage('Enrollment rejected');
      // Refresh data
      await loadData();
    } catch (err: any) {
      console.error('Error rejecting enrollment:', err);
      setError(err.response?.data?.detail || 'Failed to reject enrollment');
    } finally {
      setProcessing(null);
    }
  };

  const handleCreateCourse = () => {
    navigate('/mentor/courses/new');
  };

  const handleViewCourse = (courseId: string) => {
    navigate(`/mentor/courses/${courseId}`);
  };

  const getCourseTitle = (courseId: string) => {
    const course = courses.find((c) => c._id === courseId);
    return course?.title || 'Unknown Course';
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

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
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
                      {loading ? '...' : courses.length}
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
            <Card
              sx={{
                height: '100%',
                cursor: enrollmentRequests.length > 0 ? 'pointer' : 'default',
                '&:hover': enrollmentRequests.length > 0 ? { boxShadow: 4 } : {},
              }}
              onClick={() => enrollmentRequests.length > 0 && setShowEnrollmentsDialog(true)}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <HourglassEmpty sx={{ fontSize: 40, color: 'warning.main', mr: 2 }} />
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" fontWeight={600}>
                      Pending
                    </Typography>
                    <Typography variant="h4" fontWeight={700}>
                      {loading ? '...' : enrollmentRequests.length}
                    </Typography>
                  </Box>
                  {enrollmentRequests.length > 0 && (
                    <Chip label="Review" color="warning" size="small" />
                  )}
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

        {/* Enrollment Requests Dialog */}
        <Dialog
          open={showEnrollmentsDialog}
          onClose={() => setShowEnrollmentsDialog(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" fontWeight={600}>
                Pending Enrollment Requests
              </Typography>
              <IconButton onClick={() => setShowEnrollmentsDialog(false)}>
                <Close />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent>
            {enrollmentRequests.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <CheckCircle sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  No Pending Requests
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  All enrollment requests have been processed
                </Typography>
              </Box>
            ) : (
              <List>
                {enrollmentRequests.map((enrollment) => (
                  <ListItem
                    key={enrollment._id}
                    sx={{
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 1,
                      mb: 1,
                    }}
                    secondaryAction={
                      <Box>
                        <IconButton
                          color="success"
                          onClick={() => handleApproveEnrollment(enrollment._id)}
                          disabled={processing === enrollment._id}
                        >
                          {processing === enrollment._id ? (
                            <CircularProgress size={24} />
                          ) : (
                            <Check />
                          )}
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={() => handleRejectEnrollment(enrollment._id)}
                          disabled={processing === enrollment._id}
                        >
                          <Close />
                        </IconButton>
                      </Box>
                    }
                  >
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography fontWeight={600}>
                            {getCourseTitle(enrollment.course_id)}
                          </Typography>
                          <Chip label="Pending" color="warning" size="small" />
                        </Box>
                      }
                      secondary={
                        <Typography variant="body2" color="text.secondary">
                          Student ID: {enrollment.student_id}
                          <br />
                          Requested: {new Date(enrollment.requested_at).toLocaleString()}
                        </Typography>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowEnrollmentsDialog(false)}>Close</Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={!!successMessage}
          autoHideDuration={4000}
          onClose={() => setSuccessMessage(null)}
          message={successMessage}
        />
      </Container>
    </Layout>
  );
};

export default MentorDashboard;
