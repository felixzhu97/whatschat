import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import MessagesPage from '@/app/messages/page';

describe('MessagesPage', () => {
  it('should render messages page', () => {
    expect(() => render(<MessagesPage />)).not.toThrow();
  });
});
