import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import NoteCard from '../NoteCard';

// Mock react-router
vi.mock('react-router', () => ({
  Link: ({ to, children, ...props }) => <a href={to} {...props}>{children}</a>,
}));

// Mock axios
vi.mock('../../lib/axios', () => ({
  default: {
    delete: vi.fn(),
  },
}));

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('../../lib/utils', () => ({
  formatDate: (date) => new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }),
}));

describe('NoteCard', () => {
  const mockNote = {
    _id: '123',
    title: 'Test Note',
    content: 'This is a test note content that is long enough to test the line clamping feature of the component',
    createdAt: '2024-04-13T00:00:00Z',
  };

  const mockSetNotes = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render note card with title and content', () => {
    render(<NoteCard note={mockNote} setNotes={mockSetNotes} />);
    
    expect(screen.getByText('Test Note')).toBeInTheDocument();
    expect(screen.getByText(/This is a test note content/)).toBeInTheDocument();
  });

  it('should display formatted date', () => {
    render(<NoteCard note={mockNote} setNotes={mockSetNotes} />);
    
    expect(screen.getByText(/Apr 13, 2024/)).toBeInTheDocument();
  });

  it('should have a link to the note detail page', () => {
    render(<NoteCard note={mockNote} setNotes={mockSetNotes} />);
    
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', `/note/${mockNote._id}`);
  });

  it('should display card title correctly', () => {
    render(<NoteCard note={mockNote} setNotes={mockSetNotes} />);
    
    const cardTitle = screen.getByRole('heading', { level: 3 });
    expect(cardTitle).toBeInTheDocument();
    expect(cardTitle).toHaveTextContent('Test Note');
  });

  it('should have proper styling classes', () => {
    const { container } = render(<NoteCard note={mockNote} setNotes={mockSetNotes} />);
    
    const card = container.querySelector('.card');
    expect(card).toHaveClass('bg-base-100');
    expect(card).toHaveClass('hover:shadow-lg');
  });

  it('should clamp content to 3 lines', () => {
    const { container } = render(<NoteCard note={mockNote} setNotes={mockSetNotes} />);
    
    const contentElement = container.querySelector('.line-clamp-3');
    expect(contentElement).toBeInTheDocument();
  });
});

