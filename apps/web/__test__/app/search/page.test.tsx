import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import SearchPage from '@/app/search/page';

describe('SearchPage', () => {
  it('should render search page', () => {
    expect(() => render(<SearchPage />)).not.toThrow();
  });
});
