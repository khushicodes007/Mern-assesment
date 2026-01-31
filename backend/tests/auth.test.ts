// Test auth controller - Google login endpoint
// Mock verifyGoogleToken function
// Test successful login with valid token
// Test login failure with invalid token
// Use supertest to make HTTP requests

import request from 'supertest';
import express from 'express';
import authRoutes from '../src/routes/authRoutes';
import { verifyGoogleToken } from '../src/services/authService';
import User from '../src/models/User';
import jwt from 'jsonwebtoken';

// Mock the auth service
jest.mock('../src/services/authService');

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

describe('Auth API Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/google', () => {
    it('should login successfully with valid Google token', async () => {
      // Mock Google token verification
      (verifyGoogleToken as jest.Mock).mockResolvedValue({
        name: 'Test User',
        email: 'test@example.com',
        googleId: '12345',
      });

      const response = await request(app)
        .post('/api/auth/google')
        .send({ token: 'fake-google-token' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('email', 'test@example.com');
      expect(response.body.user).toHaveProperty('name', 'Test User');
    });

    it('should return 400 when token is missing', async () => {
      const response = await request(app)
        .post('/api/auth/google')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Google token is required');
    });

    it('should return 500 when Google verification fails', async () => {
      (verifyGoogleToken as jest.Mock).mockRejectedValue(
        new Error('Invalid token')
      );

      const response = await request(app)
        .post('/api/auth/google')
        .send({ token: 'invalid-token' });

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('message', 'Authentication failed');
    });

    it('should create new user if not exists', async () => {
      (verifyGoogleToken as jest.Mock).mockResolvedValue({
        name: 'New User',
        email: 'newuser@example.com',
        googleId: '67890',
      });

      const response = await request(app)
        .post('/api/auth/google')
        .send({ token: 'fake-google-token' });

      expect(response.status).toBe(200);
      
      const user = await User.findOne({ email: 'newuser@example.com' });
      expect(user).toBeTruthy();
      expect(user?.name).toBe('New User');
    });

    it('should return existing user if already exists', async () => {
      // Create a user first
      await User.create({
        name: 'Existing User',
        email: 'existing@example.com',
        googleId: '99999',
        role: 'editor',
      });

      (verifyGoogleToken as jest.Mock).mockResolvedValue({
        name: 'Existing User',
        email: 'existing@example.com',
        googleId: '99999',
      });

      const response = await request(app)
        .post('/api/auth/google')
        .send({ token: 'fake-google-token' });

      expect(response.status).toBe(200);
      
      const userCount = await User.countDocuments({ email: 'existing@example.com' });
      expect(userCount).toBe(1); // Should not create duplicate
    });
  });
});