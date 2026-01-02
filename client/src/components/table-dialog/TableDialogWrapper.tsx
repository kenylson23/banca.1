/**
 * Wrapper inteligente que detecta dispositivo e renderiza
 * a versão apropriada do diálogo (Desktop ou Mobile)
 */

import { TableDialogSplitPanelEnhanced } from './TableDialogSplitPanelEnhanced';
import type { Table } from '@shared/schema';

interface TableDialogWrapperProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  table: Table | null;
  allTables?: Table[];
  onNavigate?: (table: Table) => void;
}

/**
 * Wrapper que escolhe automaticamente entre versão desktop e mobile
 * baseado no tamanho da tela
 */
export function TableDialogWrapper(props: TableDialogWrapperProps) {
  // NOTE:
  // The mobile implementation currently lacks critical actions like "Iniciar Sessão".
  // To keep behavior consistent across devices (and avoid hiding session controls),
  // always render the full split panel version.
  return <TableDialogSplitPanelEnhanced {...props} />;
}

/**
 * Re-exportar como default para facilitar importação
 */
export default TableDialogWrapper;
