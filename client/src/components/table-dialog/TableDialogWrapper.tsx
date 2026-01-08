/**
 * Wrapper inteligente que detecta dispositivo e renderiza
 * a versão apropriada do diálogo (Desktop ou Mobile)
 */

import { TableDialogPOSModern } from './TableDialogPOSModern';
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
  // 🎨 NOVO: Design POS Moderno Híbrido Fullscreen
  // Comentar a linha abaixo para voltar ao design antigo
  return <TableDialogPOSModern {...props} />;
  
  // Design antigo (comentado temporariamente)
  // return <TableDialogSplitPanelEnhanced {...props} />;
}

/**
 * Re-exportar como default para facilitar importação
 */
export default TableDialogWrapper;
