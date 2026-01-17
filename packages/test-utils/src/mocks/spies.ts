/**
 * Spy 工具
 * 用于监视对象方法的调用
 */

/**
 * 获取框架的 spy 函数创建器
 */
function getSpyOn() {
  // 尝试多种方式获取 vi
  const getVi = () => {
    if (typeof globalThis !== 'undefined' && (globalThis as any).vi) {
      return (globalThis as any).vi;
    }
    if (typeof global !== 'undefined' && (global as any).vi) {
      return (global as any).vi;
    }
    if (typeof window !== 'undefined' && (window as any).vi) {
      return (window as any).vi;
    }
    return null;
  };

  // 尝试多种方式获取 jest
  const getJest = () => {
    if (typeof globalThis !== 'undefined' && (globalThis as any).jest) {
      return (globalThis as any).jest;
    }
    if (typeof global !== 'undefined' && (global as any).jest) {
      return (global as any).jest;
    }
    if (typeof window !== 'undefined' && (window as any).jest) {
      return (window as any).jest;
    }
    return null;
  };

  // 尝试使用 Vitest
  const viInstance = getVi();
  if (viInstance && typeof viInstance.spyOn === 'function') {
    return viInstance.spyOn.bind(viInstance);
  }

  // 尝试使用 Jest
  const jestInstance = getJest();
  if (jestInstance && typeof jestInstance.spyOn === 'function') {
    return jestInstance.spyOn.bind(jestInstance);
  }

  throw new Error(
    'No test framework detected. Please ensure vitest or jest is installed and available.'
  );
}

/**
 * Spy 对象方法
 * 
 * @param obj 要监视的对象
 * @param methodName 方法名
 * @returns Spy 函数
 * 
 * @example
 * ```typescript
 * const api = { getUser: (id: string) => fetch(`/users/${id}`) };
 * const spy = spyOnMethod(api, 'getUser');
 * 
 * api.getUser('123');
 * expect(spy).toHaveBeenCalledWith('123');
 * ```
 */
export function spyOnMethod<T extends Record<string, any>, K extends keyof T>(
  obj: T,
  methodName: K
): T[K] {
  const spyOn = getSpyOn();
  return spyOn(obj, methodName as string);
}
