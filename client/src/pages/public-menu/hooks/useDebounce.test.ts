import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useDebounce } from './useDebounce';

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('deve retornar o valor inicial imediatamente', () => {
    const { result } = renderHook(() => useDebounce('initial', 500));
    expect(result.current).toBe('initial');
  });

  it('deve debounce o valor após o delay', async () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    );

    expect(result.current).toBe('initial');

    // Atualiza o valor
    rerender({ value: 'updated', delay: 500 });

    // Ainda deve ser o valor inicial
    expect(result.current).toBe('initial');

    // Avança o tempo
    vi.advanceTimersByTime(500);

    await waitFor(() => {
      expect(result.current).toBe('updated');
    });
  });

  it('deve cancelar o timeout se o valor mudar antes do delay', async () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      { initialProps: { value: 'first' } }
    );

    rerender({ value: 'second' });
    vi.advanceTimersByTime(200);

    rerender({ value: 'third' });
    vi.advanceTimersByTime(200);

    // Ainda não passou 500ms desde a última mudança
    expect(result.current).toBe('first');

    vi.advanceTimersByTime(300);

    await waitFor(() => {
      expect(result.current).toBe('third');
    });
  });

  it('deve funcionar com diferentes delays', async () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 300 } }
    );

    rerender({ value: 'updated', delay: 300 });
    vi.advanceTimersByTime(300);

    await waitFor(() => {
      expect(result.current).toBe('updated');
    });
  });

  it('deve funcionar com valores numéricos', async () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      { initialProps: { value: 0 } }
    );

    rerender({ value: 42 });
    vi.advanceTimersByTime(500);

    await waitFor(() => {
      expect(result.current).toBe(42);
    });
  });

  it('deve funcionar com objetos', async () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      { initialProps: { value: { name: 'initial' } } }
    );

    const newValue = { name: 'updated' };
    rerender({ value: newValue });
    vi.advanceTimersByTime(500);

    await waitFor(() => {
      expect(result.current).toEqual(newValue);
    });
  });
});
