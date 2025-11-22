import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material';
import { ArrowBack, Save } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import courseService from '../../services/courseService';

const CreateCourse: React.FC = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim() || !description.trim()) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      const newCourse = await courseService.createCourse({
        title: title.trim(),
        description: description.trim(),
      });
      
      // Navigate to the new course detail page
      navigate(`/mentor/courses/${newCourse._id}`);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create course. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box sx={{ mb: 3 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/mentor/dashboard')}
            sx={{ mb: 2 }}
          >
            Back to Dashboard
          </Button>
          <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
            Create New Course
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Fill in the details to create a new course
          </Typography>
        </Box>

        <Card>
          <CardContent sx={{ p: 4 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Course Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                margin="normal"
                required
                autoFocus
                helperText="Enter a clear and descriptive title"
              />

              <TextField
                fullWidth
                label="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                margin="normal"
                required
                multiline
                rows={6}
                helperText="Describe what students will learn in this course"
              />

              <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/mentor/dashboard')}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={loading ? <CircularProgress size={20} /> : <Save />}
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Create Course'}
                </Button>
              </Box>
            </form>
          </CardContent>
        </Card>
      </Container>
    </Layout>
  );
};

export default CreateCourse;

