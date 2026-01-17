import { describe, it, expect } from 'vitest';
import { spyOnMethod } from '../../mocks/spies';

describe('Spies', () => {
  describe('spyOnMethod()', () => {
    describe('when spying on object method calls', () => {
      it('should spy on object method calls (Vitest)', () => {
        // Arrange (Given)
        const obj = {
          method: (x: number, y: number) => x + y,
          anotherMethod: () => 'test',
        };

        // Act (When)
        const spy = spyOnMethod(obj, 'method');
        const result = obj.method(5, 3);

        // Assert (Then)
        expect(result).toBe(8);
        expect(spy).toHaveBeenCalledWith(5, 3);
        expect(spy).toHaveBeenCalledTimes(1);
      });

      it('should track multiple calls to spied method', () => {
        // Arrange (Given)
        const obj = {
          increment: (x: number) => x + 1,
        };

        // Act (When)
        const spy = spyOnMethod(obj, 'increment');
        obj.increment(1);
        obj.increment(2);
        obj.increment(3);

        // Assert (Then)
        expect(spy).toHaveBeenCalledTimes(3);
        expect(spy).toHaveBeenNthCalledWith(1, 1);
        expect(spy).toHaveBeenNthCalledWith(2, 2);
        expect(spy).toHaveBeenNthCalledWith(3, 3);
      });

      it('should allow spying on async methods', async () => {
        // Arrange (Given)
        const obj = {
          async fetchData(id: string): Promise<string> {
            return `data-${id}`;
          },
        };

        // Act (When)
        const spy = spyOnMethod(obj, 'fetchData');
        const result = await obj.fetchData('123');

        // Assert (Then)
        expect(result).toBe('data-123');
        expect(spy).toHaveBeenCalledWith('123');
      });

      it('should preserve original method behavior', () => {
        // Arrange (Given)
        const obj = {
          calculate: (x: number) => x * 2,
        };

        // Act (When)
        const spy = spyOnMethod(obj, 'calculate');
        const result1 = obj.calculate(5);
        const result2 = obj.calculate(10);

        // Assert (Then)
        expect(result1).toBe(10);
        expect(result2).toBe(20);
        // Note: spyOnMethod replaces the method, but behavior is preserved via the spy
        expect(spy).toHaveBeenCalledTimes(2);
      });

      it('should work with methods that return different types', () => {
        // Arrange (Given)
        const obj = {
          getString: () => 'string',
          getNumber: () => 42,
          getBoolean: () => true,
          getObject: () => ({ key: 'value' }),
        };

        // Act (When)
        const stringSpy = spyOnMethod(obj, 'getString');
        const numberSpy = spyOnMethod(obj, 'getNumber');
        const booleanSpy = spyOnMethod(obj, 'getBoolean');
        const objectSpy = spyOnMethod(obj, 'getObject');

        // Assert (Then)
        expect(obj.getString()).toBe('string');
        expect(obj.getNumber()).toBe(42);
        expect(obj.getBoolean()).toBe(true);
        expect(obj.getObject()).toEqual({ key: 'value' });

        expect(stringSpy).toHaveBeenCalled();
        expect(numberSpy).toHaveBeenCalled();
        expect(booleanSpy).toHaveBeenCalled();
        expect(objectSpy).toHaveBeenCalled();
      });
    });
  });
});
