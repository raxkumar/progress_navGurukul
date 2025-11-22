import React, { useEffect, useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Alert,
  CircularProgress,
  Chip,
} from '@mui/material';
import {
  ArrowBack,
  Add,
  Edit,
  Delete,
  PlayCircle,
  PictureAsPdf,
  Slideshow,
  Description,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import courseService from '../../services/courseService';
import lessonService from '../../services/lessonService';
import type { Course, Lesson, LessonType } from '../../types/course';
import { LessonType as LessonTypeEnum } from '../../types/course';

const CourseDetail: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Dialog states
  const [openDialog, setOpenDialog] = useState(false);
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonDescription, setLessonDescription] = useState('');
  const [lessonType, setLessonType] = useState<LessonType>(LessonTypeEnum.PDF);
  const [lessonDuration, setLessonDuration] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (courseId) {
      loadCourseData();
    }
  }, [courseId]);

  const loadCourseData = async () => {
    if (!courseId) return;
    
    try {
      setLoading(true);
      const [courseData, lessonsData] = await Promise.all([
        courseService.getCourseById(courseId),
        lessonService.getLessonsByCourse(courseId),
      ]);
      setCourse(courseData);
      setLessons(lessonsData);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load course data');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = () => {
    setLessonTitle('');
    setLessonDescription('');
    setLessonType(LessonTypeEnum.PDF);
    setLessonDuration('');
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleCreateLesson = async () => {
    if (!courseId || !lessonTitle.trim() || !lessonDescription.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      
      const newLesson = await lessonService.createLesson(courseId, {
        title: lessonTitle.trim(),
        description: lessonDescription.trim(),
        type: lessonType,
        order: lessons.length, // Auto-assign order
        duration: lessonDuration ? parseInt(lessonDuration) : undefined,
      });

      setLessons([...lessons, newLesson]);
      handleCloseDialog();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create lesson');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (!window.confirm('Are you sure you want to delete this lesson?')) return;

    try {
      await lessonService.deleteLesson(lessonId);
      setLessons(lessons.filter((l) => l._id !== lessonId));
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete lesson');
    }
  };

  const getLessonIcon = (type: LessonType) => {
    switch (type) {
      case LessonTypeEnum.VIDEO:
        return <PlayCircle />;
      case LessonTypeEnum.PDF:
        return <PictureAsPdf />;
      case LessonTypeEnum.PPT:
        return <Slideshow />;
      default:
        return <Description />;
    }
  };

  if (loading) {
    return (
      <Layout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  if (!course) {
    return (
      <Layout>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Alert severity="error">Course not found</Alert>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <Box sx={{ mb: 3 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/mentor/dashboard')}
            sx={{ mb: 2 }}
          >
            Back to Dashboard
          </Button>
        </Box>

        <Grid container spacing={3}>
          {/* Course Info */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <Box>
                    <Typography variant="h4" gutterBottom fontWeight={600}>
                      {course.title}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" paragraph>
                      {course.description}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Created: {new Date(course.created_at).toLocaleDateString()}
                    </Typography>
                  </Box>
                  <Chip label={`${lessons.length} Lessons`} color="primary" />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Lessons Section */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h5" fontWeight={600}>
                Lessons
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={handleOpenDialog}
              >
                Add Lesson
              </Button>
            </Box>

            {lessons.length === 0 ? (
              <Card>
                <CardContent sx={{ textAlign: 'center', py: 4 }}>
                  <Description sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    No lessons yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Add your first lesson to get started
                  </Typography>
                  <Button variant="contained" startIcon={<Add />} onClick={handleOpenDialog}>
                    Add Lesson
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <List>
                  {lessons.map((lesson, index) => (
                    <ListItem
                      key={lesson._id}
                      divider={index < lessons.length - 1}
                      secondaryAction={
                        <IconButton
                          edge="end"
                          onClick={() => handleDeleteLesson(lesson._id)}
                          color="error"
                        >
                          <Delete />
                        </IconButton>
                      }
                    >
                      <Box sx={{ mr: 2, color: 'primary.main' }}>
                        {getLessonIcon(lesson.type)}
                      </Box>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="subtitle1" fontWeight={600}>
                              {lesson.title}
                            </Typography>
                            <Chip label={lesson.type} size="small" />
                          </Box>
                        }
                        secondary={
                          <>
                            <Typography variant="body2" color="text.secondary">
                              {lesson.description}
                            </Typography>
                            {lesson.duration && (
                              <Typography variant="caption" color="text.secondary">
                                Duration: {lesson.duration} minutes
                              </Typography>
                            )}
                          </>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </Card>
            )}
          </Grid>
        </Grid>

        {/* Add Lesson Dialog */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>Add New Lesson</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Lesson Title"
              fullWidth
              value={lessonTitle}
              onChange={(e) => setLessonTitle(e.target.value)}
              required
            />
            <TextField
              margin="dense"
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={lessonDescription}
              onChange={(e) => setLessonDescription(e.target.value)}
              required
            />
            <FormControl fullWidth margin="dense">
              <InputLabel>Lesson Type</InputLabel>
              <Select
                value={lessonType}
                label="Lesson Type"
                onChange={(e) => setLessonType(e.target.value as LessonType)}
              >
                <MenuItem value={LessonTypeEnum.PDF}>PDF</MenuItem>
                <MenuItem value={LessonTypeEnum.VIDEO}>Video</MenuItem>
                <MenuItem value={LessonTypeEnum.PPT}>PowerPoint</MenuItem>
                <MenuItem value={LessonTypeEnum.DOCUMENT}>Document</MenuItem>
                <MenuItem value={LessonTypeEnum.OTHER}>Other</MenuItem>
              </Select>
            </FormControl>
            <TextField
              margin="dense"
              label="Duration (minutes)"
              type="number"
              fullWidth
              value={lessonDuration}
              onChange={(e) => setLessonDuration(e.target.value)}
              helperText="Optional"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} disabled={submitting}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateLesson}
              variant="contained"
              disabled={submitting}
            >
              {submitting ? 'Creating...' : 'Create Lesson'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Layout>
  );
};

export default CourseDetail;

