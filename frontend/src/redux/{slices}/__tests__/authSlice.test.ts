import authReducer, { login, logout, AuthState } from '../authSlice.js';

describe('authSlice', () => {
  const initialState: AuthState = {
    user: null,
    token: null,
    isAuthenticated: false,
  };

  it('should handle initial state', () => {
    expect(authReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('should handle login action', () => {
    const user = {
      id: 'user-id-123',
      name: 'John Doe',
      email: 'john.doe@example.com',
      role: 'editor',
    };
    const token = 'mock-jwt-token';

    const nextState = authReducer(initialState, login({ user, token }));

    expect(nextState).toEqual({
      user,
      token,
      isAuthenticated: true,
    });
  });

  it('should handle logout action', () => {
    const loggedInState: AuthState = {
      user: {
        id: 'user-id-123',
        name: 'John Doe',
        email: 'john.doe@example.com',
        role: 'editor',
      },
      token: 'mock-jwt-token',
      isAuthenticated: true,
    };

    const nextState = authReducer(loggedInState, logout());

    expect(nextState).toEqual(initialState);
  });
});