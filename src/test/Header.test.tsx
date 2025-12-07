import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { AuthProvider } from '../context/AuthContext';

describe('Header Component', () => {
  const renderHeader = () => {
    return render(
      <BrowserRouter>
        <AuthProvider>
          <Header />
        </AuthProvider>
      </BrowserRouter>
    );
  };

  it('should render the SUCA logo/title', () => {
    renderHeader();
    expect(screen.getByText('SUCA')).toBeInTheDocument();
  });

  it('should render main navigation links', () => {
    renderHeader();
    
    // Check for main nav items (they appear twice - dark and light variants)
    expect(screen.getAllByText('DICTIONARY').length).toBe(2);
    expect(screen.getAllByText('FLASHCARD').length).toBe(2);
  });

  it('should render login button when not authenticated', () => {
    renderHeader();
    
    // Should show LOG IN button when user is not logged in
    expect(screen.getByText('LOG IN')).toBeInTheDocument();
  });
});
