// Test JWT authentication middleware
// Test valid token allows access
// Test invalid token returns 403
// Test missing token returns 401
// Test expired token returns 403

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { authenticateToken } from '../src/middleware/auth';

describe('JWT Middleware Tests', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    mockRequest = {
      headers: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    nextFunction = jest.fn();
  });

  it('should call next() with valid token', () => {
    const token = jwt.sign(
      { id: 'test-id', email: 'test@example.com' },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );

    mockRequest.headers = {
      authorization: `Bearer ${token}`,
    };

    authenticateToken(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );

    expect(nextFunction).toHaveBeenCalled();
    expect(mockRequest.user).toBeDefined();
    expect(mockRequest.user?.email).toBe('test@example.com');
  });

  it('should return 401 when token is missing', () => {
    mockRequest.headers = {};

    authenticateToken(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: 'Access token required',
    });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it('should return 403 with invalid token', () => {
    mockRequest.headers = {
      authorization: 'Bearer invalid-token',
    };

    authenticateToken(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );

    expect(mockResponse.status).toHaveBeenCalledWith(403);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: 'Invalid or expired token',
    });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it('should return 403 with expired token', () => {
    const expiredToken = jwt.sign(
      { id: 'test-id', email: 'test@example.com' },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '-1h' } // Already expired
    );

    mockRequest.headers = {
      authorization: `Bearer ${expiredToken}`,
    };

    authenticateToken(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );

    expect(mockResponse.status).toHaveBeenCalledWith(403);
    expect(nextFunction).not.toHaveBeenCalled();
  });
});