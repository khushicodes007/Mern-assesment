// Test user controller CRUD operations
// Test GET /api/users - fetch all users
// Test POST /api/users - create new user with email sending
// Test PUT /api/users/:id - update user
// Test DELETE /api/users/:id - delete user
// Test GET /api/users/summary - get user statistics
// Mock email service to avoid actual emails

import request from 'supertest';
import express from 'express';
import userRoutes from '../src/routes/userRoutes';
import User from '../src/models/User';
import { sendWelcomeEmail } from '../src/services/emailService';
import jwt from 'jsonwebtoken';

// Mock email service
jest.mock('../src/services/emailService');

const app = express();
app.use(express.json());
app.use('/api/users', userRoutes);

// Generate test JWT token
const generateToken = () => {
  return jwt.sign(
    { id: 'test-user-id', email: 'test@example.com' },
    process.env.JWT_SECRET || 'test-secret',
    { expiresIn: '1h' }
  );
};

describe('User API Tests', () => {
  let token: string;

  beforeEach(() => {
    token = generateToken();
    jest.clearAllMocks();
  });

  describe('GET /api/users', () => {
    it('should fetch all users', async () => {
      // Create test users
      await User.create([
        { name: 'User 1', email: 'user1@test.com', googleId: '1', role: 'admin' },
        { name: 'User 2', email: 'user2@test.com', googleId: '2', role: 'editor' },
      ]);

      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toHaveProperty('name');
      expect(response.body[0]).toHaveProperty('email');
    });

    it('should return 401 without token', async () => {
      const response = await request(app).get('/api/users');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message', 'Access token required');
    });

    it('should return empty array when no users', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });
  });

  describe('POST /api/users', () => {
    it('should create a new user and send welcome email', async () => {
      (sendWelcomeEmail as jest.Mock).mockResolvedValue(undefined);

      const newUser = {
        name: 'John Doe',
        email: 'john@example.com',
        role: 'editor',
        isActive: true,
      };

      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${token}`)
        .send(newUser);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message', 'User created successfully');
      expect(response.body.user).toHaveProperty('name', 'John Doe');
      expect(response.body.user).toHaveProperty('email', 'john@example.com');

      // Verify email was sent
      expect(sendWelcomeEmail).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'john@example.com',
        role: 'editor',
      });

      // Verify user in database
      const user = await User.findOne({ email: 'john@example.com' });
      expect(user).toBeTruthy();
    });

    it('should return 400 if user already exists', async () => {
      await User.create({
        name: 'Existing User',
        email: 'existing@example.com',
        googleId: 'test123',
        role: 'editor',
      });

      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Another User',
          email: 'existing@example.com',
          role: 'admin',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'User already exists');
    });

    it('should create user even if email fails', async () => {
      (sendWelcomeEmail as jest.Mock).mockRejectedValue(
        new Error('Email failed')
      );

      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Test User',
          email: 'test@example.com',
          role: 'editor',
        });

      expect(response.status).toBe(201);
      const user = await User.findOne({ email: 'test@example.com' });
      expect(user).toBeTruthy();
    });
  });

  describe('PUT /api/users/:id', () => {
    it('should update an existing user', async () => {
      const user = await User.create({
        name: 'Old Name',
        email: 'old@example.com',
        googleId: 'test123',
        role: 'editor',
      });

      const response = await request(app)
        .put(`/api/users/${user._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'New Name',
          role: 'admin',
        });

      expect(response.status).toBe(200);
      expect(response.body.user).toHaveProperty('name', 'New Name');
      expect(response.body.user).toHaveProperty('role', 'admin');

      const updatedUser = await User.findById(user._id);
      expect(updatedUser?.name).toBe('New Name');
    });

    it('should return 404 for non-existent user', async () => {
      const fakeId = '507f1f77bcf86cd799439011';

      const response = await request(app)
        .put(`/api/users/${fakeId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'New Name' });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'User not found');
    });
  });

  describe('DELETE /api/users/:id', () => {
    it('should delete a user', async () => {
      const user = await User.create({
        name: 'To Delete',
        email: 'delete@example.com',
        googleId: 'test123',
        role: 'editor',
      });

      const response = await request(app)
        .delete(`/api/users/${user._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'User deleted successfully');

      const deletedUser = await User.findById(user._id);
      expect(deletedUser).toBeNull();
    });

    it('should return 404 when deleting non-existent user', async () => {
      const fakeId = '507f1f77bcf86cd799439011';

      const response = await request(app)
        .delete(`/api/users/${fakeId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'User not found');
    });
  });

  describe('GET /api/users/summary', () => {
    it('should return user statistics', async () => {
      await User.create([
        { name: 'User 1', email: 'user1@test.com', googleId: '1', role: 'admin', isActive: true },
        { name: 'User 2', email: 'user2@test.com', googleId: '2', role: 'editor', isActive: true },
        { name: 'User 3', email: 'user3@test.com', googleId: '3', role: 'editor', isActive: false },
      ]);

      const response = await request(app)
        .get('/api/users/summary')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        totalUsers: 3,
        activeUsers: 2,
        inactiveUsers: 1,
      });
    });

    it('should return zero counts when no users', async () => {
      const response = await request(app)
        .get('/api/users/summary')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        totalUsers: 0,
        activeUsers: 0,
        inactiveUsers: 0,
      });
    });
  });
});