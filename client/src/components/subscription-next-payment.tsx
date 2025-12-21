import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, CreditCard, Clock } from "lucide-react";
import { differenceInDays, differenceInHours, differenceInMinutes, format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface SubscriptionNextPaymentProps {
  subscription: {
    status: string;
    currentPeriodEnd: Date;
    billingInterval: string;
    currency: string;
  };
  plan: {
    priceMonthlyKz: string;
    priceAnnualKz: string;
    priceMonthlyUsd: string;
    priceAnnualUsd: string;
  };
}

export function SubscriptionNextPayment({ subscription, plan }: SubscriptionNextPaymentProps) {
  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
  });

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const end = new Date(subscription.currentPeriodEnd);
      
      const days = differenceInDays(end, now);
      const hours = differenceInHours(end, now) % 24;
      const minutes = differenceInMinutes(end, now) % 60;

      setCountdown({ days, hours, minutes });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000); // Atualiza a cada minuto

    return () => clearInterval(interval);
  }, [subscription.currentPeriodEnd]);

  const formatCurrency = (amount: string, currency: 'AOA' | 'USD') => {
    const value = parseFloat(amount);
    if (currency === 'AOA') {
      return `${value.toLocaleString('pt-AO')} Kz`;
    }
    return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  const nextPaymentAmount = subscription.billingInterval === 'mensal'
    ? formatCurrency(
        subscription.currency === 'AOA' ? plan.priceMonthlyKz : plan.priceMonthlyUsd,
        subscription.currency as 'AOA' | 'USD'
      )
    : formatCurrency(
        subscription.currency === 'AOA' ? plan.priceAnnualKz : plan.priceAnnualUsd,
        subscription.currency as 'AOA' | 'USD'
      );

  const annualSavings = subscription.billingInterval === 'anual' ? (
    parseFloat(subscription.currency === 'AOA' ? plan.priceMonthlyKz : plan.priceMonthlyUsd) * 12 -
    parseFloat(subscription.currency === 'AOA' ? plan.priceAnnualKz : plan.priceAnnualUsd)
  ) : 0;

  const isUrgent = countdown.days <= 3;
  const isTrial = subscription.status === 'trial';

  return (
    <Card className={isUrgent && !isTrial ? "border-yellow-500/50" : ""}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {isTrial ? 'Trial Expira' : 'Próxima Renovação'}
          </CardTitle>
          {isUrgent && !isTrial && (
            <Badge variant="outline" className="text-xs text-yellow-600 border-yellow-600">
              Em breve
            </Badge>
          )}
          {isTrial && (
            <Badge variant="secondary" className="text-xs">
              Período de Teste
            </Badge>
          )}
        </div>
        <CardDescription className="text-xs">
          {isTrial ? 'Escolha um plano antes do fim do trial' : 'Cobrança automática programada'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Countdown */}
          <div className="flex items-center justify-center gap-3 py-3 px-4 rounded-lg bg-muted/50">
            <div className="text-center">
              <div className="text-2xl font-bold tabular-nums">{countdown.days}</div>
              <div className="text-xs text-muted-foreground">dias</div>
            </div>
            <div className="text-xl text-muted-foreground">:</div>
            <div className="text-center">
              <div className="text-2xl font-bold tabular-nums">{countdown.hours}</div>
              <div className="text-xs text-muted-foreground">horas</div>
            </div>
            <div className="text-xl text-muted-foreground">:</div>
            <div className="text-center">
              <div className="text-2xl font-bold tabular-nums">{countdown.minutes}</div>
              <div className="text-xs text-muted-foreground">min</div>
            </div>
          </div>

          {/* Data e valor */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                Data
              </span>
              <span className="font-medium">
                {format(new Date(subscription.currentPeriodEnd), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </span>
            </div>

            {!isTrial && (
              <>
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <CreditCard className="h-3.5 w-3.5" />
                    Valor
                  </span>
                  <span className="font-bold text-base">{nextPaymentAmount}</span>
                </div>

                {annualSavings > 0 && (
                  <div className="mt-3 p-2 rounded-lg bg-green-500/10 border border-green-500/20">
                    <div className="flex items-center gap-2">
                      <div className="text-green-600 text-xs font-medium">
                        💰 Você economiza {formatCurrency(annualSavings.toString(), subscription.currency as 'AOA' | 'USD')} por ano!
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Status message */}
          {countdown.days <= 7 && !isTrial && (
            <div className="text-xs text-center text-muted-foreground pt-2 border-t">
              Sua forma de pagamento será cobrada automaticamente
            </div>
          )}

          {isTrial && countdown.days <= 3 && (
            <div className="text-xs text-center text-yellow-600 pt-2 border-t font-medium">
              ⚠️ Escolha um plano para não perder acesso ao sistema
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
