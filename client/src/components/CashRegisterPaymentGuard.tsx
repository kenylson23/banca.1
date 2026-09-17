import { AlertCircle, ExternalLink, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { NO_OPEN_CASH_REGISTER_MESSAGE } from '@/hooks/useCashRegisterShift';

interface CashRegisterPaymentGuardProps {
  isLoading: boolean;
  hasOpenShift: boolean;
  onOpenShift: () => void;
  className?: string;
}

export function CashRegisterPaymentGuard({
  isLoading,
  hasOpenShift,
  onOpenShift,
  className,
}: CashRegisterPaymentGuardProps) {
  if (!isLoading && hasOpenShift) {
    return null;
  }

  return (
    <div
      role="alert"
      className={cn(
        'rounded-xl border-2 border-amber-300 bg-amber-50 p-4 text-amber-950 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-100',
        className,
      )}
    >
      <div className="flex items-start gap-3">
        {isLoading ? (
          <Loader2 className="mt-0.5 h-5 w-5 shrink-0 animate-spin" />
        ) : (
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
        )}
        <div className="min-w-0 flex-1 space-y-1">
          <p className="font-semibold">
            {isLoading ? 'Verificando o turno de caixa...' : 'Turno de caixa necessário'}
          </p>
          <p className="text-sm text-amber-800 dark:text-amber-200">
            {isLoading
              ? 'Aguarde antes de continuar com o pagamento.'
              : NO_OPEN_CASH_REGISTER_MESSAGE}
          </p>
          {!isLoading && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onOpenShift}
              className="mt-2 border-amber-400 bg-transparent text-amber-950 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-100 dark:hover:bg-amber-900/50"
            >
              Abrir turno
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}