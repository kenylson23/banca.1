import { useState } from 'react';
import { SalesKPIs } from '@/components/SalesKPIs';
import { SalesFilters } from '@/components/SalesFilters';
import { SalesTable } from '@/components/SalesTable';

export default function Sales() {
  const [dateFilter, setDateFilter] = useState('today');
  const [customDateRange, setCustomDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });
  const [periodFilter, setPeriodFilter] = useState('all');
  const [orderByFilter, setOrderByFilter] = useState('created');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('all');
  const [orderTypeFilter, setOrderTypeFilter] = useState('all');

  return (
    <div className="space-y-8 p-6 sm:p-8">
      <div className="space-y-2">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
          Vendas
        </h1>
        <p className="text-base text-muted-foreground">
          Monitore suas vendas em tempo real com indicadores e análises detalhadas
        </p>
      </div>

      <SalesFilters
        dateFilter={dateFilter}
        onDateFilterChange={setDateFilter}
        customDateRange={customDateRange}
        onCustomDateRangeChange={setCustomDateRange}
        periodFilter={periodFilter}
        onPeriodFilterChange={setPeriodFilter}
        orderByFilter={orderByFilter}
        onOrderByFilterChange={setOrderByFilter}
        orderStatusFilter={orderStatusFilter}
        onOrderStatusFilterChange={setOrderStatusFilter}
        paymentStatusFilter={paymentStatusFilter}
        onPaymentStatusFilterChange={setPaymentStatusFilter}
        orderTypeFilter={orderTypeFilter}
        onOrderTypeFilterChange={setOrderTypeFilter}
      />

      <SalesKPIs
        dateFilter={dateFilter}
        customDateRange={customDateRange}
        periodFilter={periodFilter}
        orderByFilter={orderByFilter}
        orderStatusFilter={orderStatusFilter}
        paymentStatusFilter={paymentStatusFilter}
        orderTypeFilter={orderTypeFilter}
      />

      <SalesTable
        dateFilter={dateFilter}
        customDateRange={customDateRange}
        periodFilter={periodFilter}
        orderByFilter={orderByFilter}
        orderStatusFilter={orderStatusFilter}
        paymentStatusFilter={paymentStatusFilter}
        orderTypeFilter={orderTypeFilter}
      />
    </div>
  );
}
