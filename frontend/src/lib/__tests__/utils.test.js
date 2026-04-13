import { describe, it, expect } from 'vitest';
import { formatDate } from '../utils';

describe('Utils', () => {
  describe('formatDate', () => {
    it('should format date correctly', () => {
      const date = new Date('2024-04-13');
      const formatted = formatDate(date);
      expect(formatted).toMatch(/Apr 13, 2024|April 13, 2024/);
    });

    it('should return a string', () => {
      const date = new Date('2024-01-15');
      const formatted = formatDate(date);
      expect(typeof formatted).toBe('string');
    });

    it('should handle different dates', () => {
      const date1 = new Date('2024-01-01');
      const date2 = new Date('2024-12-31');
      
      const formatted1 = formatDate(date1);
      const formatted2 = formatDate(date2);
      
      expect(formatted1).not.toBe(formatted2);
      expect(formatted1).toContain('Jan');
      expect(formatted2).toContain('Dec');
    });

    it('should format with month short, day numeric, and year numeric', () => {
      const date = new Date('2024-03-05');
      const formatted = formatDate(date);
      
      // Should be in format like "Mar 5, 2024"
      expect(formatted).toMatch(/^[A-Za-z]{3} \d{1,2}, \d{4}$/);
    });
  });
});
