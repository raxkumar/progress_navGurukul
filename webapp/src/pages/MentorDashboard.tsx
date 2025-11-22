import React from 'react';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Paper,
} from '@mui/material';
import { People, Assessment, CheckCircle } from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import Layout from '../components/layout/Layout';

const MentorDashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <Layout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
            Welcome, {user?.email}!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage and track your students' progress
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {/* Placeholder Cards */}
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <People sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
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
                  Total students
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Assessment sx={{ fontSize: 40, color: 'success.main', mr: 2 }} />
                  <Box>
                    <Typography variant="h6" fontWeight={600}>
                      Courses
                    </Typography>
                    <Typography variant="h4" fontWeight={700}>
                      0
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Active courses
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
                      Completion
                    </Typography>
                    <Typography variant="h4" fontWeight={700}>
                      0%
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Average completion rate
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Main Content Area */}
          <Grid item xs={12}>
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h5" gutterBottom fontWeight={600}>
                Mentor Dashboard
              </Typography>
              <Typography variant="body1" color="text.secondary">
                This is your mentor dashboard. More features coming soon!
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Layout>
  );
};

export default MentorDashboard;

