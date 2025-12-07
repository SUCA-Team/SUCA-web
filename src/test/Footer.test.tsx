import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Footer } from '../components/layout/Footer';

describe('Footer Component', () => {
  const renderFooter = () => {
    return render(
      <BrowserRouter>
        <Footer />
      </BrowserRouter>
    );
  };

  it('should render copyright text', () => {
    renderFooter();
    
    expect(screen.getByText(/Made by SUCA Team 2025/i)).toBeInTheDocument();
  });

  it('should render Contact link', () => {
    renderFooter();
    
    const contactLink = screen.getByRole('link', { name: /contact/i });
    expect(contactLink).toBeInTheDocument();
    expect(contactLink).toHaveAttribute('href', '/contact');
  });

  it('should render Data attribution link', () => {
    renderFooter();
    
    const dataLink = screen.getByRole('link', { name: /data attribution/i });
    expect(dataLink).toBeInTheDocument();
    expect(dataLink).toHaveAttribute('href', '/attribution');
  });

  it('should render all three footer columns', () => {
    renderFooter();
    
    expect(screen.getByText('DICTIONARY')).toBeInTheDocument();
    expect(screen.getByText('FLASHCARD')).toBeInTheDocument();
    expect(screen.getByText('OTHER')).toBeInTheDocument();
  });
});
