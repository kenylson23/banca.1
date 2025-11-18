import { TablesPanel } from "@/components/TablesPanel";

export default function Tables() {
  return (
    <div className="space-y-6 sm:space-y-8 p-4 sm:p-6">
      <div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">Controle de Mesas</h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2">
          Gerencie mesas em tempo real - ocupação, pedidos e pagamentos
        </p>
      </div>
      <TablesPanel />
    </div>
  );
}
