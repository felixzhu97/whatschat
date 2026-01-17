import { describe, it, expect } from 'vitest';
import {
  deepEqual,
  shallowEqual,
  createMemoComparator,
  createIgnoringComparator,
} from '../../render/memo-helpers';

describe('memo-helpers', () => {
  describe('deepEqual', () => {
    it('应该对相同对象返回 true', () => {
      const obj = { a: 1, b: { c: 2 } };
      expect(deepEqual(obj, obj)).toBe(true);
    });

    it('应该对深度相等的对象返回 true', () => {
      const obj1 = { a: 1, b: { c: 2 } };
      const obj2 = { a: 1, b: { c: 2 } };
      expect(deepEqual(obj1, obj2)).toBe(true);
    });

    it('应该对不相等的对象返回 false', () => {
      const obj1 = { a: 1, b: { c: 2 } };
      const obj2 = { a: 1, b: { c: 3 } };
      expect(deepEqual(obj1, obj2)).toBe(false);
    });

    it('应该处理基本类型', () => {
      expect(deepEqual(1, 1)).toBe(true);
      expect(deepEqual(1, 2)).toBe(false);
      expect(deepEqual('a', 'a')).toBe(true);
      expect(deepEqual('a', 'b')).toBe(false);
    });

    it('应该处理 null 和 undefined', () => {
      expect(deepEqual(null, null)).toBe(true);
      expect(deepEqual(undefined, undefined)).toBe(true);
      expect(deepEqual(null, undefined)).toBe(false);
    });
  });

  describe('shallowEqual', () => {
    it('应该对相同对象返回 true', () => {
      const obj = { a: 1, b: 2 };
      expect(shallowEqual(obj, obj)).toBe(true);
    });

    it('应该对浅层相等的对象返回 true', () => {
      const obj1 = { a: 1, b: 2 };
      const obj2 = { a: 1, b: 2 };
      expect(shallowEqual(obj1, obj2)).toBe(true);
    });

    it('应该对嵌套对象进行浅层比较', () => {
      const obj1 = { a: 1, b: { c: 2 } };
      const obj2 = { a: 1, b: { c: 2 } };
      expect(shallowEqual(obj1, obj2)).toBe(false);
    });
  });

  describe('createMemoComparator', () => {
    it('应该只比较指定的键', () => {
      const comparator = createMemoComparator(['id', 'name']);

      const prev = { id: 1, name: 'test', age: 20 };
      const next = { id: 1, name: 'test', age: 30 };

      expect(comparator(prev, next)).toBe(true);
    });

    it('应该在键值改变时返回 false', () => {
      const comparator = createMemoComparator(['id', 'name']);

      const prev = { id: 1, name: 'test', age: 20 };
      const next = { id: 2, name: 'test', age: 20 };

      expect(comparator(prev, next)).toBe(false);
    });
  });

  describe('createIgnoringComparator', () => {
    it('应该忽略指定的键', () => {
      const comparator = createIgnoringComparator(['timestamp']);

      const prev = { id: 1, name: 'test', timestamp: 1000 };
      const next = { id: 1, name: 'test', timestamp: 2000 };

      expect(comparator(prev, next)).toBe(true);
    });

    it('应该在未忽略的键改变时返回 false', () => {
      const comparator = createIgnoringComparator(['timestamp']);

      const prev = { id: 1, name: 'test', timestamp: 1000 };
      const next = { id: 2, name: 'test', timestamp: 2000 };

      expect(comparator(prev, next)).toBe(false);
    });
  });
});
