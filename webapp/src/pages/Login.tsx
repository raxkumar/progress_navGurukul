import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Link as MuiLink,
  CircularProgress,
} from '@mui/material';
import { School } from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../types/auth';
import { Link, useSearchParams } from 'react-router-dom';

const Login: React.FC = () => {
  const { login, isLoading } = useAuth();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.STUDENT);
  const [error, setError] = useState('');

  // Set role from URL parameter if present
  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam && (roleParam === 'student' || roleParam === 'mentor')) {
      setRole(roleParam === 'student' ? UserRole.STUDENT : UserRole.MENTOR);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await login(email, password, role);
    } catch (err: any) {
      setError(
        err.response?.data?.detail || 'Login failed. Please check your credentials.'
      );
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 4,
        }}
      >
        <Card sx={{ width: '100%', boxShadow: 3 }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <School sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
              <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
                Welcome Back
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Sign in to your account
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                margin="normal"
                required
                autoComplete="email"
                autoFocus
              />

              <TextField
                fullWidth
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                margin="normal"
                required
                autoComplete="current-password"
              />

              <FormControl fullWidth margin="normal" required>
                <InputLabel>I am a</InputLabel>
                <Select
                  value={role}
                  label="I am a"
                  onChange={(e) => setRole(e.target.value as UserRole)}
                >
                  <MenuItem value={UserRole.STUDENT}>Student</MenuItem>
                  <MenuItem value={UserRole.MENTOR}>Mentor</MenuItem>
                </Select>
              </FormControl>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                sx={{ mt: 3, mb: 2, py: 1.5 }}
                disabled={isLoading}
              >
                {isLoading ? <CircularProgress size={24} /> : 'Sign In'}
              </Button>

              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Don't have an account?{' '}
                  <MuiLink component={Link} to="/signup" underline="hover">
                    Sign up
                  </MuiLink>
                </Typography>
              </Box>
            </form>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default Login;

