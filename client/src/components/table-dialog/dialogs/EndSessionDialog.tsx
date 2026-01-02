/**
 * Diálogo de confirmação para encerrar sessão
 * Com validações de pagamento e pedidos ativos
 */

import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  DollarSign,
  Printer,
  X 
} from 'lucide-react';
import { formatKwanza } from '@/lib/formatters';
import { useSessionValidation } from '../hooks/useSessionValidation';

interface EndSessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tableId: string;
  tableNumber: string;
  onConfirm: () => void;
  onForceClose?: () => void;
  onPayNow?: () => void;
  onPrintBill?: () => void;
  isLoading?: boolean;
}

export function EndSessionDialog({
  open,
  onOpenChange,
  tableId,
  tableNumber,
  onConfirm,
  onForceClose,
  onPayNow,
  onPrintBill,
  isLoading = false,
}: EndSessionDialogProps) {
  const [showForceConfirm, setShowForceConfirm] = useState(false);
  
  const { data: validation, isLoading: validating } = useSessionValidation({
    tableId,
    enabled: open,
  });

  // Se pode fechar normalmente
  if (validation?.canClose) {
    return (
      <AlertDialog open={open} onOpenChange={onOpenChange}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <AlertDialogTitle>Encerrar Sessão?</AlertDialogTitle>
                <AlertDialogDescription>
                  Mesa {tableNumber}
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>

          <div className="space-y-4">
            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
              <p className="text-sm text-emerald-800 dark:text-emerald-200 font-medium">
                ✅ Todos os pagamentos foram realizados
              </p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                A sessão pode ser encerrada com segurança
              </p>
            </div>

            {validation.details && (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Total da conta:</span>
                  <span className="font-semibold">{formatKwanza(validation.details.totalAmount || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Total pago:</span>
                  <span className="font-semibold text-emerald-600">{formatKwanza(validation.details.paidAmount || 0)}</span>
                </div>
              </div>
            )}

            {onPrintBill && (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  onPrintBill();
                }}
              >
                <Printer className="h-4 w-4 mr-2" />
                Imprimir Recibo Antes de Fechar
              </Button>
            )}
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={onConfirm}
              disabled={isLoading}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {isLoading ? 'Encerrando...' : 'Encerrar Sessão'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  // Se há problemas
  return (
    <>
      <AlertDialog open={open && !showForceConfirm} onOpenChange={onOpenChange}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <AlertDialogTitle>Não é Possível Encerrar</AlertDialogTitle>
                <AlertDialogDescription>
                  Mesa {tableNumber} - {validation?.message}
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>

          {validating ? (
            <div className="py-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <p className="mt-2 text-sm text-slate-600">Validando sessão...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Pagamentos Pendentes */}
              {validation?.reason === 'pending_payment' && validation.details && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 space-y-3">
                  <div className="flex items-start gap-3">
                    <DollarSign className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 space-y-2">
                      <p className="text-sm font-medium text-red-900 dark:text-red-100">
                        Pagamento Pendente
                      </p>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-red-700 dark:text-red-300">Total:</span>
                          <span className="font-semibold">{formatKwanza(validation.details.totalAmount || 0)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-red-700 dark:text-red-300">Pago:</span>
                          <span>{formatKwanza(validation.details.paidAmount || 0)}</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-red-300 dark:border-red-700">
                          <span className="text-red-900 dark:text-red-100 font-bold">Falta pagar:</span>
                          <span className="font-bold text-red-600 dark:text-red-400">
                            {formatKwanza(validation.details.pendingAmount || 0)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Pedidos Ativos */}
              {validation?.reason === 'active_orders' && validation.details && (
                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800 space-y-3">
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-amber-900 dark:text-amber-100 mb-2">
                        Pedidos em Preparação
                      </p>
                      <div className="space-y-2">
                        {validation.details.activeOrders?.slice(0, 3).map((order) => (
                          <div key={order.id} className="flex items-center justify-between text-sm">
                            <span className="text-amber-700 dark:text-amber-300">
                              Pedido #{order.orderNumber}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {order.status}
                            </Badge>
                          </div>
                        ))}
                        {validation.details.activeOrdersCount! > 3 && (
                          <p className="text-xs text-amber-600 dark:text-amber-400">
                            +{validation.details.activeOrdersCount! - 3} pedido(s) a mais...
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Ações Disponíveis */}
              <div className="space-y-2">
                {validation?.actions.includes('pay_now') && onPayNow && (
                  <Button
                    onClick={() => {
                      onOpenChange(false);
                      onPayNow();
                    }}
                    className="w-full bg-emerald-600 hover:bg-emerald-700"
                  >
                    <DollarSign className="h-4 w-4 mr-2" />
                    Ir para Pagamento Agora
                  </Button>
                )}

                {validation?.actions.includes('wait') && (
                  <Button
                    onClick={() => onOpenChange(false)}
                    variant="outline"
                    className="w-full"
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    Aguardar Entrega dos Pedidos
                  </Button>
                )}

                {validation?.actions.includes('force_close') && onForceClose && (
                  <Button
                    onClick={() => setShowForceConfirm(true)}
                    variant="destructive"
                    className="w-full"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Forçar Encerramento
                  </Button>
                )}
              </div>
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirmação de Forçar Encerramento */}
      <AlertDialog open={showForceConfirm} onOpenChange={setShowForceConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600">⚠️ Forçar Encerramento?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação irá encerrar a sessão mesmo com pagamentos pendentes ou pedidos ativos.
              <br /><br />
              <strong>Isto pode resultar em perda de receita!</strong>
              <br /><br />
              Tem certeza absoluta?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowForceConfirm(false)}>
              Não, Voltar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowForceConfirm(false);
                onOpenChange(false);
                if (onForceClose) {
                  onForceClose();
                }
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Sim, Forçar Encerramento
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
