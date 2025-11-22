import React from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  useTheme,
  alpha,
} from '@mui/material';
import {
  School,
  TrendingUp,
  People,
  Assessment,
  EmojiObjects,
  Speed,
  ArrowForward,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../config/constants';

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  const features = [
    {
      icon: <School sx={{ fontSize: 48 }} />,
      title: 'Course Management',
      description: 'Create and manage comprehensive courses with multiple lesson types',
    },
    {
      icon: <TrendingUp sx={{ fontSize: 48 }} />,
      title: 'Progress Tracking',
      description: 'Real-time progress monitoring with visual analytics and insights',
    },
    {
      icon: <People sx={{ fontSize: 48 }} />,
      title: 'Collaborative Learning',
      description: 'Connect mentors and students in a seamless learning experience',
    },
    {
      icon: <Assessment sx={{ fontSize: 48 }} />,
      title: 'Smart Analytics',
      description: 'Data-driven insights to optimize your learning journey',
    },
    {
      icon: <EmojiObjects sx={{ fontSize: 48 }} />,
      title: 'Personalized Path',
      description: 'Tailored learning experiences based on your goals and pace',
    },
    {
      icon: <Speed sx={{ fontSize: 48 }} />,
      title: 'Fast & Efficient',
      description: 'Optimized performance for smooth and responsive experience',
    },
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${alpha(
          theme.palette.primary.main,
          0.05
        )} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          py: 2,
          px: 3,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          bgcolor: alpha(theme.palette.background.paper, 0.8),
          backdropFilter: 'blur(10px)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <School sx={{ fontSize: 32, color: 'primary.main' }} />
          <Typography variant="h5" fontWeight={700} color="primary">
            Progress
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="outlined" onClick={() => navigate(ROUTES.LOGIN)}>
            Login
          </Button>
          <Button variant="contained" onClick={() => navigate(ROUTES.SIGNUP)}>
            Get Started
          </Button>
        </Box>
      </Box>

      {/* Hero Section */}
      <Container maxWidth="lg">
        <Box
          sx={{
            pt: { xs: 8, md: 12 },
            pb: { xs: 6, md: 10 },
            textAlign: 'center',
          }}
        >
          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: '2.5rem', md: '4rem' },
              fontWeight: 800,
              mb: 3,
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Elevate Your Learning Journey
          </Typography>
          <Typography
            variant="h5"
            color="text.secondary"
            sx={{ mb: 6, maxWidth: '800px', mx: 'auto' }}
          >
            A powerful platform that connects passionate mentors with eager students,
            tracking progress and visualizing learning insights in real-time.
          </Typography>

          {/* Role Selection Cards */}
          <Grid container spacing={4} sx={{ mb: 8, maxWidth: '900px', mx: 'auto' }}>
            {/* Student Card */}
            <Grid item xs={12} md={6}>
              <Card
                sx={{
                  height: '100%',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: `0 12px 40px ${alpha(theme.palette.primary.main, 0.2)}`,
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                  },
                }}
              >
                <CardContent sx={{ p: 4, textAlign: 'center' }}>
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 3,
                    }}
                  >
                    <School sx={{ fontSize: 48, color: 'primary.main' }} />
                  </Box>
                  <Typography variant="h4" fontWeight={700} gutterBottom>
                    I'm a Student
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                    Enroll in courses, track your progress, and achieve your learning goals
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Button
                      variant="contained"
                      size="large"
                      fullWidth
                      endIcon={<ArrowForward />}
                      onClick={() => navigate(`${ROUTES.SIGNUP}?role=student`)}
                    >
                      Sign Up as Student
                    </Button>
                    <Button
                      variant="outlined"
                      size="large"
                      fullWidth
                      onClick={() => navigate(`${ROUTES.LOGIN}?role=student`)}
                    >
                      Login as Student
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Mentor Card */}
            <Grid item xs={12} md={6}>
              <Card
                sx={{
                  height: '100%',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: `0 12px 40px ${alpha(theme.palette.secondary.main, 0.2)}`,
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: `linear-gradient(90deg, ${theme.palette.secondary.main}, ${theme.palette.secondary.light})`,
                  },
                }}
              >
                <CardContent sx={{ p: 4, textAlign: 'center' }}>
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      bgcolor: alpha(theme.palette.secondary.main, 0.1),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 3,
                    }}
                  >
                    <People sx={{ fontSize: 48, color: 'secondary.main' }} />
                  </Box>
                  <Typography variant="h4" fontWeight={700} gutterBottom>
                    I'm a Mentor
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                    Create courses, manage students, and share your knowledge with the world
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Button
                      variant="contained"
                      size="large"
                      fullWidth
                      endIcon={<ArrowForward />}
                      color="secondary"
                      onClick={() => navigate(`${ROUTES.SIGNUP}?role=mentor`)}
                    >
                      Sign Up as Mentor
                    </Button>
                    <Button
                      variant="outlined"
                      size="large"
                      fullWidth
                      color="secondary"
                      onClick={() => navigate(`${ROUTES.LOGIN}?role=mentor`)}
                    >
                      Login as Mentor
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* Features Section */}
        <Box sx={{ py: 8 }}>
          <Typography
            variant="h3"
            fontWeight={700}
            textAlign="center"
            sx={{ mb: 2 }}
          >
            Powerful Features
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            textAlign="center"
            sx={{ mb: 6 }}
          >
            Everything you need for an exceptional learning experience
          </Typography>

          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4,
                    },
                  }}
                >
                  <CardContent sx={{ p: 3, textAlign: 'center' }}>
                    <Box
                      sx={{
                        color: 'primary.main',
                        mb: 2,
                      }}
                    >
                      {feature.icon}
                    </Box>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* CTA Section */}
        <Box
          sx={{
            py: 8,
            textAlign: 'center',
          }}
        >
          <Card
            sx={{
              background: `linear-gradient(135deg, ${alpha(
                theme.palette.primary.main,
                0.1
              )}, ${alpha(theme.palette.secondary.main, 0.1)})`,
              border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
            }}
          >
            <CardContent sx={{ p: 6 }}>
              <Typography variant="h3" fontWeight={700} gutterBottom>
                Ready to Get Started?
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
                Join thousands of learners and mentors transforming education
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                <Button
                  variant="contained"
                  size="large"
                  endIcon={<ArrowForward />}
                  onClick={() => navigate(ROUTES.SIGNUP)}
                  sx={{ px: 4, py: 1.5 }}
                >
                  Create Free Account
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => navigate(ROUTES.LOGIN)}
                  sx={{ px: 4, py: 1.5 }}
                >
                  Login
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Container>

      {/* Footer */}
      <Box
        sx={{
          py: 4,
          px: 3,
          textAlign: 'center',
          borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          bgcolor: alpha(theme.palette.background.paper, 0.5),
        }}
      >
        <Typography variant="body2" color="text.secondary">
          © {new Date().getFullYear()} Progress. Empowering learners worldwide.
        </Typography>
      </Box>
    </Box>
  );
};

export default Landing;

