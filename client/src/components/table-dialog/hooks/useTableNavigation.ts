/**
 * Hook para navegação entre mesas
 * Permite navegar sem fechar o diálogo
 */

import { useCallback, useMemo } from 'react';
import type { Table } from '@shared/schema';

interface UseTableNavigationProps {
  currentTable: Table | null;
  allTables?: Table[];
  onNavigate?: (table: Table) => void;
}

export function useTableNavigation({
  currentTable,
  allTables = [],
  onNavigate,
}: UseTableNavigationProps) {
  // Encontrar índice da mesa atual
  const currentIndex = useMemo(() => {
    if (!currentTable || !allTables.length) return -1;
    return allTables.findIndex(t => t.id === currentTable.id);
  }, [currentTable, allTables]);

  // Calcular mesa anterior
  const prevTable = useMemo(() => {
    if (currentIndex === -1 || !allTables.length) return null;
    const prevIndex = (currentIndex - 1 + allTables.length) % allTables.length;
    return allTables[prevIndex];
  }, [currentIndex, allTables]);

  // Calcular próxima mesa
  const nextTable = useMemo(() => {
    if (currentIndex === -1 || !allTables.length) return null;
    const nextIndex = (currentIndex + 1) % allTables.length;
    return allTables[nextIndex];
  }, [currentIndex, allTables]);

  // Navegar para mesa anterior
  const goToPrevTable = useCallback(() => {
    if (prevTable && onNavigate) {
      onNavigate(prevTable);
    }
  }, [prevTable, onNavigate]);

  // Navegar para próxima mesa
  const goToNextTable = useCallback(() => {
    if (nextTable && onNavigate) {
      onNavigate(nextTable);
    }
  }, [nextTable, onNavigate]);

  // Navegar para mesa específica por ID
  const goToTable = useCallback((tableId: string) => {
    const table = allTables.find(t => t.id === tableId);
    if (table && onNavigate) {
      onNavigate(table);
    }
  }, [allTables, onNavigate]);

  // Informações úteis
  const canNavigate = allTables.length > 1;
  const totalTables = allTables.length;
  const currentPosition = currentIndex + 1; // 1-based

  return {
    prevTable,
    nextTable,
    goToPrevTable,
    goToNextTable,
    goToTable,
    canNavigate,
    currentPosition,
    totalTables,
  };
}
