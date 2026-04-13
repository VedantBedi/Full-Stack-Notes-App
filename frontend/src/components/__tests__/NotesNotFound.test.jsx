import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import NotesNotFound from '../NotesNotFound';

// Mock react-router
vi.mock('react-router', () => ({
  Link: ({ to, children, ...props }) => <a href={to} {...props}>{children}</a>,
}));

describe('NotesNotFound', () => {
  it('should render not found message', () => {
    render(<NotesNotFound />);
    
    expect(screen.getByText(/no notes/i)).toBeInTheDocument();
  });

  it('should display helpful text', () => {
    render(<NotesNotFound />);
    
    const heading = screen.getByRole('heading', { level: 3 });
    expect(heading).toBeInTheDocument();
  });

  it('should have proper styling', () => {
    const { container } = render(<NotesNotFound />);
    
    const element = container.firstChild;
    expect(element).toHaveClass('text-center');
  });

  it('should have a link to create notes', () => {
    render(<NotesNotFound />);
    
    const link = screen.getByRole('link', { name: /create.*first note/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/create');
  });
});

