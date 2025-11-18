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
    <div className="p-4 sm:p-6 space-y-6">
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
