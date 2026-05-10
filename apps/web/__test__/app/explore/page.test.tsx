import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ExplorePage from '@/app/explore/page';

describe('ExplorePage', () => {
  it('should render explore page', () => {
    render(<ExplorePage />);
    // The page renders an AuthenticatedInstagramApp container
    // In a real scenario, this would have explore content
  });

  it('should not throw when rendered', () => {
    expect(() => render(<ExplorePage />)).not.toThrow();
  });
});
