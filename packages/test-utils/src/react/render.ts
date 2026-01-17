/**
 * React 测试工具
 * 提供 React 组件测试的辅助函数
 * 
 * 注意：此模块需要 @testing-library/react 作为可选依赖
 */

import React from 'react';
import type { RenderOptions } from '@testing-library/react';

/**
 * 检查是否安装了 @testing-library/react
 */
function checkTestingLibrary(): boolean {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require.resolve('@testing-library/react');
    return true;
  } catch {
    return false;
  }
}

/**
 * Provider 配置
 */
export interface ProviderConfig {
  provider: React.ComponentType<{ children: React.ReactNode }>;
  props?: Record<string, any>;
}

/**
 * RenderWithProviders 选项
 */
export interface RenderWithProvidersOptions extends Omit<RenderOptions, 'wrapper'> {
  /**
   * 自定义 Provider 列表
   */
  providers?: ProviderConfig[];
}

/**
 * 带 Provider 的组件渲染
 * 
 * @param ui 要渲染的 React 组件
 * @param options 渲染选项，包括自定义 Provider
 * @returns 渲染结果
 * 
 * @example
 * ```typescript
 * import { renderWithProviders } from '@whatschat/test-utils';
 * 
 * const { container } = renderWithProviders(<MyComponent />, {
 *   providers: [
 *     { provider: ThemeProvider },
 *     { provider: StoreProvider, props: { store: mockStore } }
 *   ]
 * });
 * ```
 */
export function renderWithProviders(
  ui: React.ReactElement,
  options: RenderWithProvidersOptions = {}
): ReturnType<typeof import('@testing-library/react').render> {
  if (!checkTestingLibrary()) {
    throw new Error(
      '@testing-library/react is not installed. Please install it to use renderWithProviders.'
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { render } = require('@testing-library/react');

  const { providers = [], ...renderOptions } = options;

  // 创建 Provider 包装器
  const AllProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    let wrappedChildren = children;

    // 从内到外包装 Provider
    for (let i = providers.length - 1; i >= 0; i--) {
      const { provider: Provider, props = {} } = providers[i];
      wrappedChildren = React.createElement(Provider, props, wrappedChildren);
    }

    return React.createElement(React.Fragment, null, wrappedChildren);
  };

  return render(ui, {
    wrapper: AllProviders,
    ...renderOptions,
  });
}
