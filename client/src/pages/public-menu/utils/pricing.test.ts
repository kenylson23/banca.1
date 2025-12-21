import { describe, it, expect } from 'vitest';
import { calculateItemPrice, formatItemPrice, calculateItemTotal } from './pricing';
import type { MenuItem } from '@shared/schema';

describe('pricing utils', () => {
  describe('calculateItemPrice', () => {
    it('deve calcular preço sem desconto', () => {
      const item = {
        id: '1',
        price: '10.00',
        originalPrice: null,
      } as MenuItem;

      const result = calculateItemPrice(item);

      expect(result.price).toBe(10);
      expect(result.originalPrice).toBe(10);
      expect(result.discountPercent).toBe(0);
      expect(result.hasPromo).toBe(false);
    });

    it('deve calcular preço com desconto', () => {
      const item = {
        id: '1',
        price: '8.00',
        originalPrice: '10.00',
      } as MenuItem;

      const result = calculateItemPrice(item);

      expect(result.price).toBe(8);
      expect(result.originalPrice).toBe(10);
      expect(result.discountPercent).toBe(20); // 20% de desconto
      expect(result.hasPromo).toBe(true);
    });

    it('deve lidar com preços numéricos', () => {
      const item = {
        id: '1',
        price: 15.99,
        originalPrice: 20.00,
      } as MenuItem;

      const result = calculateItemPrice(item);

      expect(result.price).toBe(15.99);
      expect(result.originalPrice).toBe(20.00);
      expect(result.discountPercent).toBe(20); // Arredonda para 20%
      expect(result.hasPromo).toBe(true);
    });

    it('deve calcular desconto de 50%', () => {
      const item = {
        id: '1',
        price: '5.00',
        originalPrice: '10.00',
      } as MenuItem;

      const result = calculateItemPrice(item);

      expect(result.discountPercent).toBe(50);
      expect(result.hasPromo).toBe(true);
    });

    it('deve retornar 0% quando preços são iguais', () => {
      const item = {
        id: '1',
        price: '10.00',
        originalPrice: '10.00',
      } as MenuItem;

      const result = calculateItemPrice(item);

      expect(result.discountPercent).toBe(0);
      expect(result.hasPromo).toBe(false);
    });
  });

  describe('formatItemPrice', () => {
    it('deve formatar preços corretamente', () => {
      const item = {
        id: '1',
        price: '10.50',
        originalPrice: '15.75',
      } as MenuItem;

      const result = formatItemPrice(item);

      expect(result.priceFormatted).toBe('10.50');
      expect(result.originalPriceFormatted).toBe('15.75');
      expect(result.hasPromo).toBe(true);
    });
  });

  describe('calculateItemTotal', () => {
    it('deve calcular total sem opções', () => {
      const total = calculateItemTotal('10.00', []);

      expect(total).toBe(10);
    });

    it('deve calcular total com uma opção', () => {
      const total = calculateItemTotal('10.00', [
        { priceAdjustment: '2.50', optionName: 'Extra queijo', quantity: 1 },
      ]);

      expect(total).toBe(12.50);
    });

    it('deve calcular total com múltiplas opções', () => {
      const total = calculateItemTotal('10.00', [
        { priceAdjustment: '2.50', optionName: 'Extra queijo', quantity: 1 },
        { priceAdjustment: '1.50', optionName: 'Bacon', quantity: 1 },
        { priceAdjustment: '0.50', optionName: 'Molho extra', quantity: 1 },
      ]);

      expect(total).toBe(14.50);
    });

    it('deve lidar com ajustes numéricos', () => {
      const total = calculateItemTotal(10, [
        { priceAdjustment: 2.5, optionName: 'Extra', quantity: 1 },
      ]);

      expect(total).toBe(12.5);
    });

    it('deve calcular corretamente com valores negativos (desconto)', () => {
      const total = calculateItemTotal('10.00', [
        { priceAdjustment: '-2.00', optionName: 'Desconto', quantity: 1 },
      ]);

      expect(total).toBe(8);
    });
  });
});
