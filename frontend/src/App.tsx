import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { store } from './redux/store';
import LoginPage from './pages/Login/LoginPage';
import Dashboard from './pages/Dashboard/Dashboard';
import UsersList from './pages/Users/UsersList';
import UserForm from './pages/Users/UserForm';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout/Layout';

const GOOGLE_CLIENT_ID = '330435750196-nn9saf80dkctn629ljqsfcc69jb5g1cj.apps.googleusercontent.com'; // Replace with actual ID

const App: React.FC = () => {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <Provider store={store}>
        <BrowserRouter>
          <Routes>
            {/* Public Route - No Layout */}
            <Route path="/login" element={<LoginPage />} />

            {/* Protected Routes - With Layout (Sidebar) */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/users"
              element={
                <ProtectedRoute>
                  <Layout>
                    <UsersList />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/users/create"
              element={
                <ProtectedRoute>
                  <Layout>
                    <UserForm />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/users/:id/edit"
              element={
                <ProtectedRoute>
                  <Layout>
                    <UserForm />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Default Redirect */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </Provider>
    </GoogleOAuthProvider>
  );
};

export default App;