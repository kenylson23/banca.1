import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFavorites } from './useFavorites';

describe('useFavorites', () => {
  const restaurantSlug = 'test-restaurant';
  const storageKey = `favorites_${restaurantSlug}`;

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('deve iniciar com array vazio', () => {
    const { result } = renderHook(() => useFavorites(restaurantSlug));

    expect(result.current.favorites).toEqual([]);
  });

  it('deve adicionar item aos favoritos', () => {
    const { result } = renderHook(() => useFavorites(restaurantSlug));

    act(() => {
      result.current.toggleFavorite('item-1');
    });

    expect(result.current.favorites).toContain('item-1');
    expect(result.current.isFavorite('item-1')).toBe(true);
  });

  it('deve remover item dos favoritos', () => {
    const { result } = renderHook(() => useFavorites(restaurantSlug));

    act(() => {
      result.current.toggleFavorite('item-1');
    });

    expect(result.current.isFavorite('item-1')).toBe(true);

    act(() => {
      result.current.toggleFavorite('item-1');
    });

    expect(result.current.isFavorite('item-1')).toBe(false);
    expect(result.current.favorites).not.toContain('item-1');
  });

  it('deve persistir favoritos no localStorage', () => {
    const { result } = renderHook(() => useFavorites(restaurantSlug));

    act(() => {
      result.current.toggleFavorite('item-1');
      result.current.toggleFavorite('item-2');
    });

    const stored = localStorage.getItem(storageKey);
    expect(stored).toBeTruthy();
    expect(JSON.parse(stored!)).toEqual(['item-1', 'item-2']);
  });

  it('deve carregar favoritos do localStorage', () => {
    localStorage.setItem(storageKey, JSON.stringify(['item-1', 'item-2', 'item-3']));

    const { result } = renderHook(() => useFavorites(restaurantSlug));

    expect(result.current.favorites).toEqual(['item-1', 'item-2', 'item-3']);
    expect(result.current.isFavorite('item-2')).toBe(true);
  });

  it('deve lidar com múltiplos toggles', () => {
    const { result } = renderHook(() => useFavorites(restaurantSlug));

    act(() => {
      result.current.toggleFavorite('item-1');
      result.current.toggleFavorite('item-2');
      result.current.toggleFavorite('item-3');
    });

    expect(result.current.favorites).toHaveLength(3);

    act(() => {
      result.current.toggleFavorite('item-2'); // Remove
    });

    expect(result.current.favorites).toHaveLength(2);
    expect(result.current.favorites).toEqual(['item-1', 'item-3']);
  });

  it('deve usar chaves diferentes para restaurantes diferentes', () => {
    const { result: result1 } = renderHook(() => useFavorites('restaurant-1'));
    const { result: result2 } = renderHook(() => useFavorites('restaurant-2'));

    act(() => {
      result1.current.toggleFavorite('item-1');
    });

    act(() => {
      result2.current.toggleFavorite('item-2');
    });

    expect(result1.current.favorites).toEqual(['item-1']);
    expect(result2.current.favorites).toEqual(['item-2']);

    // Não deve haver interferência
    expect(result1.current.isFavorite('item-2')).toBe(false);
    expect(result2.current.isFavorite('item-1')).toBe(false);
  });

  it('deve lidar com localStorage corrompido', () => {
    localStorage.setItem(storageKey, 'invalid-json{');

    const { result } = renderHook(() => useFavorites(restaurantSlug));

    // Deve retornar array vazio em vez de crashar
    expect(result.current.favorites).toEqual([]);
  });
});
