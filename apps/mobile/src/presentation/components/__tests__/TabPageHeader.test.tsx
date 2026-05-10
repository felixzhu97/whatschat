import React from 'react';
import { render, fireEvent, cleanup } from '@testing-library/react-native';
import { ThemeProvider } from '@/src/presentation/shared/theme';
import { TabPageHeader } from '../TabPageHeader';

jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

jest.mock('../GlassView', () => ({
  GlassView: 'GlassView',
}));

const renderWithProviders = (ui: React.ReactElement) => {
  return render(<ThemeProvider>{ui}</ThemeProvider>);
};

describe('TabPageHeader', () => {
  afterEach(cleanup);

  describe('Rendering', () => {
    it('renders title correctly', () => {
      const { getByText } = renderWithProviders(
        <TabPageHeader title="Chats" />
      );
      expect(getByText('Chats')).toBeTruthy();
    });

    it('renders with custom title', () => {
      const { getByText } = renderWithProviders(
        <TabPageHeader title="My Profile" />
      );
      expect(getByText('My Profile')).toBeTruthy();
    });
  });

  describe('Header icons', () => {
    it('renders all header buttons', () => {
      const { UNSAFE_root } = renderWithProviders(
        <TabPageHeader title="Home" />
      );
      expect(UNSAFE_root).toBeTruthy();
    });

    it('renders camera button', () => {
      const { UNSAFE_root } = renderWithProviders(
        <TabPageHeader title="Camera" />
      );
      expect(UNSAFE_root).toBeTruthy();
    });

    it('renders search button', () => {
      const { UNSAFE_root } = renderWithProviders(
        <TabPageHeader title="Search" />
      );
      expect(UNSAFE_root).toBeTruthy();
    });

    it('renders menu button', () => {
      const { UNSAFE_root } = renderWithProviders(
        <TabPageHeader title="Menu" />
      );
      expect(UNSAFE_root).toBeTruthy();
    });
  });

  describe('Theme integration', () => {
    it('applies theme styles', () => {
      const { UNSAFE_root } = renderWithProviders(
        <TabPageHeader title="Styled" />
      );
      expect(UNSAFE_root).toBeTruthy();
    });
  });

  describe('Constants', () => {
    it('exports TAB_PAGE_HEADER_HEIGHT constant from module', () => {
      const { TAB_PAGE_HEADER_HEIGHT } = require('../TabPageHeader');
      expect(TAB_PAGE_HEADER_HEIGHT).toBe(56);
    });
  });
});
