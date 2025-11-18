import { TablesPanel } from "@/components/TablesPanel";
import { AdminLTELayout } from "@/components/AdminLTELayout";

export default function Tables() {
  return (
    <AdminLTELayout 
      pageTitle="Controle de Mesas"
      breadcrumbs={[
        { label: 'Home', href: '/dashboard' },
        { label: 'Mesas' }
      ]}
    >
      <TablesPanel />
    </AdminLTELayout>
  );
}
