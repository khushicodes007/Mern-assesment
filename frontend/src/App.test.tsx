import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the dashboard link', () => {
  render(<App />);
  const linkElement = screen.getByText(/dashboard/i);
  expect(linkElement).toBeInTheDocument();
});
