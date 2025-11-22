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
  LinearProgress,
  Chip,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from '@mui/material';
import {
  ArrowBack,
  CheckCircle,
  PictureAsPdf,
  VideoLibrary,
  Slideshow,
  Description,
  MoreHoriz,
  Close,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import courseService from '../../services/courseService';
import lessonService from '../../services/lessonService';
import progressService from '../../services/progressService';
import type { Course, Lesson, Progress, LessonType } from '../../types/course';
import { ROUTES } from '../../config/constants';

const StudentCourseDetail: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [progress, setProgress] = useState<Map<string, Progress>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [completing, setCompleting] = useState(false);
  const [courseProgress, setCourseProgress] = useState({
    total: 0,
    completed: 0,
    percentage: 0,
  });

  useEffect(() => {
    if (courseId) {
      fetchCourseData();
    }
  }, [courseId]);

  const fetchCourseData = async () => {
    if (!courseId) return;

    try {
      setLoading(true);
      setError(null);

      // Fetch course details
      const courseData = await courseService.getCourseById(courseId);
      setCourse(courseData);

      // Fetch lessons
      const lessonsData = await lessonService.getLessonsByCourse(courseId);
      setLessons(lessonsData);

      // Fetch progress
      const progressData = await progressService.getMyProgress(courseId);
      const progressMap = new Map<string, Progress>();
      progressData.forEach((p) => {
        progressMap.set(p.lesson_id, p);
      });
      setProgress(progressMap);

      // Calculate progress stats
      const completed = progressData.filter((p) => p.completed).length;
      const total = lessonsData.length;
      const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
      setCourseProgress({ total, completed, percentage });
    } catch (err: any) {
      console.error('Error fetching course data:', err);
      setError(err.response?.data?.detail || 'Failed to fetch course data');
    } finally {
      setLoading(false);
    }
  };

  const handleLessonClick = (lesson: Lesson) => {
    setSelectedLesson(lesson);
  };

  const handleCompleteLesson = async () => {
    if (!selectedLesson || !courseId) return;

    try {
      setCompleting(true);
      setError(null);

      await progressService.markLessonComplete(selectedLesson._id);

      // Refresh progress data
      await fetchCourseData();
      setSelectedLesson(null);
    } catch (err: any) {
      console.error('Error completing lesson:', err);
      setError(err.response?.data?.detail || 'Failed to mark lesson as complete');
    } finally {
      setCompleting(false);
    }
  };

  const getLessonIcon = (type: LessonType) => {
    switch (type) {
      case 'PDF':
        return <PictureAsPdf color="error" />;
      case 'VIDEO':
        return <VideoLibrary color="primary" />;
      case 'PPT':
        return <Slideshow color="warning" />;
      case 'DOCUMENT':
        return <Description color="info" />;
      default:
        return <MoreHoriz />;
    }
  };

  const isLessonCompleted = (lessonId: string) => {
    return progress.get(lessonId)?.completed || false;
  };

  return (
    <Layout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate(ROUTES.STUDENT_DASHBOARD)}
          sx={{ mb: 3 }}
        >
          Back to Dashboard
        </Button>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : !course ? (
          <Alert severity="error">Course not found</Alert>
        ) : (
          <>
            {/* Course Header */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h4" fontWeight={600} gutterBottom>
                  {course.title}
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                  {course.description}
                </Typography>

                {/* Progress Stats Cards */}
                <Grid container spacing={2} sx={{ mt: 2, mb: 3 }}>
                  <Grid item xs={12} sm={4}>
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        bgcolor: 'primary.light',
                        textAlign: 'center',
                      }}
                    >
                      <Typography variant="h3" fontWeight={700} color="primary.dark">
                        {courseProgress.total}
                      </Typography>
                      <Typography variant="body2" color="primary.dark">
                        Total Lessons
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        bgcolor: 'success.light',
                        textAlign: 'center',
                      }}
                    >
                      <Typography variant="h3" fontWeight={700} color="success.dark">
                        {courseProgress.completed}
                      </Typography>
                      <Typography variant="body2" color="success.dark">
                        Completed
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        bgcolor: 'warning.light',
                        textAlign: 'center',
                      }}
                    >
                      <Typography variant="h3" fontWeight={700} color="warning.dark">
                        {courseProgress.total - courseProgress.completed}
                      </Typography>
                      <Typography variant="body2" color="warning.dark">
                        Remaining
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>

                {/* Progress Bar */}
                <Box sx={{ mt: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" fontWeight={600} color="text.primary">
                      Your Progress
                    </Typography>
                    <Typography variant="body2" fontWeight={600} color="primary.main">
                      {courseProgress.percentage}% Complete
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={courseProgress.percentage}
                    sx={{ 
                      height: 12, 
                      borderRadius: 6,
                      bgcolor: 'grey.200',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 6,
                        bgcolor: courseProgress.percentage === 100 ? 'success.main' : 'primary.main'
                      }
                    }}
                  />
                  {courseProgress.percentage === 100 && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, gap: 1 }}>
                      <CheckCircle color="success" fontSize="small" />
                      <Typography variant="caption" color="success.main" fontWeight={600}>
                        🎉 Congratulations! You've completed all lessons in this course!
                      </Typography>
                    </Box>
                  )}
                  {courseProgress.percentage > 0 && courseProgress.percentage < 100 && (
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      Keep going! You're {courseProgress.percentage}% of the way there.
                    </Typography>
                  )}
                  {courseProgress.percentage === 0 && (
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      Start your learning journey! Complete your first lesson below.
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </Card>

            {/* Lessons List */}
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h5" fontWeight={600}>
                    Course Lessons
                  </Typography>
                  <Chip
                    label={`${courseProgress.completed} of ${courseProgress.total} completed`}
                    color={courseProgress.percentage === 100 ? 'success' : 'primary'}
                    variant="outlined"
                  />
                </Box>

                {lessons.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                    No lessons available yet
                  </Typography>
                ) : (
                  <List>
                    {lessons.map((lesson, index) => {
                      const completed = isLessonCompleted(lesson._id);
                      return (
                        <ListItem
                          key={lesson._id}
                          disablePadding
                          sx={{
                            mb: 1,
                            border: 1,
                            borderColor: completed ? 'success.light' : 'divider',
                            borderRadius: 2,
                            bgcolor: completed ? 'action.hover' : 'background.paper',
                            transition: 'all 0.3s',
                            '&:hover': {
                              borderColor: completed ? 'success.main' : 'primary.main',
                              boxShadow: 1,
                            },
                          }}
                          secondaryAction={
                            completed ? (
                              <Chip
                                icon={<CheckCircle />}
                                label="Completed"
                                color="success"
                                size="small"
                                sx={{ mr: 1 }}
                              />
                            ) : (
                              <Chip
                                label="Start"
                                color="primary"
                                variant="outlined"
                                size="small"
                                sx={{ mr: 1 }}
                              />
                            )
                          }
                        >
                          <ListItemButton 
                            onClick={() => handleLessonClick(lesson)}
                            sx={{ py: 2 }}
                          >
                            <ListItemIcon>
                              <Box
                                sx={{
                                  width: 48,
                                  height: 48,
                                  borderRadius: '50%',
                                  bgcolor: completed ? 'success.main' : 'primary.light',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  mr: 1,
                                  boxShadow: completed ? 2 : 0,
                                }}
                              >
                                {completed ? (
                                  <CheckCircle sx={{ color: 'white' }} />
                                ) : (
                                  getLessonIcon(lesson.type)
                                )}
                              </Box>
                            </ListItemIcon>
                            <ListItemText
                              primary={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                  <Typography 
                                    fontWeight={600} 
                                    sx={{ 
                                      textDecoration: completed ? 'line-through' : 'none',
                                      color: completed ? 'text.secondary' : 'text.primary'
                                    }}
                                  >
                                    Lesson {index + 1}: {lesson.title}
                                  </Typography>
                                  <Chip 
                                    label={lesson.type} 
                                    size="small" 
                                    variant="outlined"
                                    sx={{ height: 20 }}
                                  />
                                </Box>
                              }
                              secondary={
                                <Box>
                                  <Typography variant="body2" color="text.secondary">
                                    {lesson.description}
                                  </Typography>
                                  {lesson.duration && (
                                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                                      ⏱️ Duration: {lesson.duration} minutes
                                    </Typography>
                                  )}
                                </Box>
                              }
                            />
                          </ListItemButton>
                        </ListItem>
                      );
                    })}
                  </List>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {/* Lesson Viewer Dialog */}
        <Dialog
          open={!!selectedLesson}
          onClose={() => setSelectedLesson(null)}
          maxWidth="md"
          fullWidth
        >
          {selectedLesson && (
            <>
              <DialogTitle>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {getLessonIcon(selectedLesson.type)}
                    <Typography variant="h6" fontWeight={600}>
                      {selectedLesson.title}
                    </Typography>
                  </Box>
                  <IconButton onClick={() => setSelectedLesson(null)}>
                    <Close />
                  </IconButton>
                </Box>
              </DialogTitle>
              <DialogContent>
                <Chip label={selectedLesson.type} color="primary" size="small" sx={{ mb: 2 }} />
                <Typography variant="body1" paragraph>
                  {selectedLesson.description}
                </Typography>

                {/* Dummy Content Display */}
                <Box
                  sx={{
                    bgcolor: 'grey.100',
                    p: 4,
                    borderRadius: 2,
                    textAlign: 'center',
                    minHeight: 300,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {getLessonIcon(selectedLesson.type)}
                  <Typography variant="h6" sx={{ mt: 2 }} color="text.secondary">
                    {selectedLesson.type} Content Placeholder
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    This is a dummy component. Actual content will be implemented later.
                  </Typography>
                </Box>

                {isLessonCompleted(selectedLesson._id) && (
                  <Alert severity="success" sx={{ mt: 2 }}>
                    You have completed this lesson!
                  </Alert>
                )}
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setSelectedLesson(null)}>Close</Button>
                {!isLessonCompleted(selectedLesson._id) && (
                  <Button
                    variant="contained"
                    onClick={handleCompleteLesson}
                    disabled={completing}
                    startIcon={completing ? <CircularProgress size={20} /> : <CheckCircle />}
                  >
                    Mark as Complete
                  </Button>
                )}
              </DialogActions>
            </>
          )}
        </Dialog>
      </Container>
    </Layout>
  );
};

export default StudentCourseDetail;

