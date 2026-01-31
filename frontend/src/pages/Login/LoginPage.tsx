import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { googleLogin } from '../../redux/slices/authSlice';
import { AppDispatch } from '../../redux/store.js';
import { Box, Typography, Paper } from '@mui/material';

const LoginPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const handleSuccess = async (credentialResponse: any) => {
    try {
      await dispatch(googleLogin(credentialResponse.credential)).unwrap();
      navigate('/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      bgcolor="#f5f5f5"
    >
      <Paper elevation={3} sx={{ p: 4, textAlign: 'center', maxWidth: 400 }}>
        <Typography variant="h4" gutterBottom>
          Welcome
        </Typography>
        <Typography variant="body1" color="textSecondary" mb={3}>
          Sign in to access the dashboard
        </Typography>
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={() => console.error('Login Failed')}
        />
      </Paper>
    </Box>
  );
};

export default LoginPage;