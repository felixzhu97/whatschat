import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import StarredPage from '@/app/starred/page';

describe('StarredPage', () => {
  it('should render starred page', () => {
    expect(() => render(<StarredPage />)).not.toThrow();
  });
});
