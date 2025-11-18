import { TablesPanel } from "@/components/TablesPanel";

export default function Tables() {
  return (
    <div className="space-y-8 p-6 sm:p-8">
      <div className="space-y-2">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">Controle de Mesas</h1>
        <p className="text-base text-muted-foreground">
          Gerencie mesas em tempo real - ocupação, pedidos e pagamentos
        </p>
      </div>
      <TablesPanel />
    </div>
  );
}
