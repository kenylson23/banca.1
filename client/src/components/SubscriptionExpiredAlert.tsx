import { useEffect, useState } from 'react';
import { useLocation, useRoute } from 'wouter';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CreditCard, Clock } from 'lucide-react';

interface SubscriptionError {
  message: string;
  code: 'NO_SUBSCRIPTION' | 'SUBSCRIPTION_INACTIVE' | 'SUBSCRIPTION_EXPIRED' | 'SUBSCRIPTION_CANCELLED';
  status?: string;
  planName?: string;
  expiredAt?: string;
  endedAt?: string;
}

export function SubscriptionExpiredAlert() {
  const [, setLocation] = useLocation();
  const [error, setError] = useState<SubscriptionError | null>(null);
  const [isOnSubscriptionPage] = useRoute('/subscription');

  useEffect(() => {
    // Listen for subscription error events
    const handleSubscriptionError = (event: CustomEvent<SubscriptionError>) => {
      // Don't show alert if already on subscription page
      if (!isOnSubscriptionPage) {
        setError(event.detail);
      }
    };

    window.addEventListener('subscription-error' as any, handleSubscriptionError);

    return () => {
      window.removeEventListener('subscription-error' as any, handleSubscriptionError);
    };
  }, [isOnSubscriptionPage]);

  const handleRenew = () => {
    setError(null);
    setLocation('/subscription');
  };

  const handleClose = () => {
    setError(null);
  };

  if (!error) return null;

  const getIcon = () => {
    switch (error.code) {
      case 'SUBSCRIPTION_EXPIRED':
        return <Clock className="h-12 w-12 text-orange-500" />;
      case 'SUBSCRIPTION_INACTIVE':
        return <AlertCircle className="h-12 w-12 text-red-500" />;
      case 'SUBSCRIPTION_CANCELLED':
        return <AlertCircle className="h-12 w-12 text-red-500" />;
      default:
        return <CreditCard className="h-12 w-12 text-orange-500" />;
    }
  };

  const getTitle = () => {
    switch (error.code) {
      case 'SUBSCRIPTION_EXPIRED':
        return 'Subscrição Expirada';
      case 'SUBSCRIPTION_INACTIVE':
        return error.status === 'suspensa' ? 'Subscrição Suspensa' : 'Subscrição Inativa';
      case 'SUBSCRIPTION_CANCELLED':
        return 'Subscrição Cancelada';
      default:
        return 'Problema com Subscrição';
    }
  };

  const showContactSupport = error.code === 'NO_SUBSCRIPTION' || error.status === 'suspensa';

  return (
    <AlertDialog open={!!error} onOpenChange={(open) => !open && handleClose()}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex justify-center mb-4">
            {getIcon()}
          </div>
          <AlertDialogTitle className="text-center text-xl">
            {getTitle()}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            {error.message}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {error.planName && (
          <Alert>
            <CreditCard className="h-4 w-4" />
            <AlertTitle>Plano Atual</AlertTitle>
            <AlertDescription>{error.planName}</AlertDescription>
          </Alert>
        )}

        {error.expiredAt && (
          <div className="text-center text-sm text-muted-foreground">
            Expirado em: {new Date(error.expiredAt).toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: 'long',
              year: 'numeric'
            })}
          </div>
        )}

        {error.endedAt && (
          <div className="text-center text-sm text-muted-foreground">
            Acesso terminou em: {new Date(error.endedAt).toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: 'long',
              year: 'numeric'
            })}
          </div>
        )}

        <AlertDialogFooter className="flex flex-col sm:flex-row gap-2">
          {showContactSupport ? (
            <>
              <Button
                variant="outline"
                onClick={handleClose}
                className="w-full sm:w-auto"
              >
                Fechar
              </Button>
              <Button
                onClick={() => {
                  handleClose();
                  // TODO: Add contact support functionality
                  window.open('mailto:suporte@nabancada.com', '_blank');
                }}
                className="w-full sm:w-auto"
              >
                Contactar Suporte
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={handleClose}
                className="w-full sm:w-auto"
              >
                Fechar
              </Button>
              <Button
                onClick={handleRenew}
                className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
              >
                <CreditCard className="mr-2 h-4 w-4" />
                Renovar Subscrição
              </Button>
            </>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
