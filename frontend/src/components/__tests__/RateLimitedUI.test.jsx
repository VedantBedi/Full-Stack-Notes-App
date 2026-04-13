import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import RateLimitedUI from '../RateLimitedUI';

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  default: {
    error: vi.fn(),
  },
}));

describe('RateLimitedUI', () => {
  it('should render rate limit message', () => {
    render(<RateLimitedUI />);
    
    expect(screen.getByText(/rate.*limit/i)).toBeInTheDocument();
  });

  it('should display helpful information', () => {
    render(<RateLimitedUI />);
    
    const content = screen.getByRole('heading', { level: 3 });
    expect(content).toBeInTheDocument();
  });

  it('should have proper styling', () => {
    const { container } = render(<RateLimitedUI />);
    
    const innerDiv = container.querySelector('.flex-1');
    expect(innerDiv).toHaveClass('text-center');
  });

  it('should show retry information', () => {
    render(<RateLimitedUI />);
    
    const text = screen.getByText(/too many requests/i);
    expect(text).toBeInTheDocument();
  });
});
