import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AuthProvider } from '../context/AuthContext';
import useAuth from '../hooks/useAuth';
import React from 'react';

// Test component that uses the useAuth hook
const TestComponent: React.FC = () => {
  const { user, loading } = useAuth();
  
  return (
    <div>
      <div data-testid="loading">{loading ? 'loading' : 'not-loading'}</div>
      <div data-testid="user">{user ? 'logged-in' : 'logged-out'}</div>
    </div>
  );
};

describe('useAuth Hook', () => {
  it('should provide auth context values', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Initially should be loading
    expect(screen.getByTestId('loading')).toHaveTextContent('loading');
    expect(screen.getByTestId('user')).toHaveTextContent('logged-out');
  });

  it('should render children within AuthProvider', () => {
    render(
      <AuthProvider>
        <div data-testid="child">Test Child</div>
      </AuthProvider>
    );

    expect(screen.getByTestId('child')).toHaveTextContent('Test Child');
  });
});
