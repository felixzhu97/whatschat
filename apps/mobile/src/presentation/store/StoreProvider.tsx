import React, { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { store } from './index';

export function StoreProvider({ children }: { children: ReactNode }) {
  return <Provider store={store}>{children}</Provider>;
}
