import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { TablesPanel } from "@/components/TablesPanel";
import { LimitWarningBanner } from "@/components/LimitWarningBanner";

export default function Tables() {
  // Check subscription limits
  const { data: subscription } = useQuery<any>({
    queryKey: ['/api/subscription'],
    retry: false,
  });

  const { data: tables = [] } = useQuery<any[]>({
    queryKey: ['/api/tables'],
    retry: false,
  });

  const maxTables = useMemo(() => {
    if (!subscription?.plan?.maxTables) return 10;
    return subscription.plan.maxTables >= 999999 ? Infinity : subscription.plan.maxTables;
  }, [subscription]);

  const totalTables = tables.length;

  return (
      <div className="w-full min-w-0 space-y-8 p-4 sm:p-6">
      <div className="space-y-2">
        <h1 className="break-words text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl">Controle de Mesas</h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          Gerencie mesas em tempo real - ocupação, pedidos e pagamentos
        </p>
      </div>
      
      {/* Limit Warning Banner */}
      {maxTables !== Infinity && (
        <LimitWarningBanner
          current={totalTables}
          max={maxTables}
          resourceName="mesa"
          resourceNamePlural="mesas"
          upgradeMessage="Faça upgrade do seu plano para adicionar mais mesas e ampliar sua capacidade."
        />
      )}
      
      <TablesPanel />
    </div>
  );
}
