import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface SalesFiltersProps {
  dateFilter: string;
  onDateFilterChange: (value: string) => void;
  customDateRange: { from: Date | undefined; to: Date | undefined };
  onCustomDateRangeChange: (value: { from: Date | undefined; to: Date | undefined }) => void;
  periodFilter: string;
  onPeriodFilterChange: (value: string) => void;
  orderByFilter: string;
  onOrderByFilterChange: (value: string) => void;
  orderStatusFilter: string;
  onOrderStatusFilterChange: (value: string) => void;
  paymentStatusFilter: string;
  onPaymentStatusFilterChange: (value: string) => void;
  orderTypeFilter: string;
  onOrderTypeFilterChange: (value: string) => void;
}

export function SalesFilters({
  dateFilter,
  onDateFilterChange,
  customDateRange,
  onCustomDateRangeChange,
  periodFilter,
  onPeriodFilterChange,
  orderByFilter,
  onOrderByFilterChange,
  orderStatusFilter,
  onOrderStatusFilterChange,
  paymentStatusFilter,
  onPaymentStatusFilterChange,
  orderTypeFilter,
  onOrderTypeFilterChange,
}: SalesFiltersProps) {
  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Período</label>
            <Tabs value={dateFilter} onValueChange={onDateFilterChange} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="today" data-testid="filter-date-today">Hoje</TabsTrigger>
                <TabsTrigger value="yesterday" data-testid="filter-date-yesterday">Ontem</TabsTrigger>
              </TabsList>
            </Tabs>
            <Tabs value={dateFilter} onValueChange={onDateFilterChange} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="7days" data-testid="filter-date-7days">7 dias</TabsTrigger>
                <TabsTrigger value="30days" data-testid="filter-date-30days">30 dias</TabsTrigger>
                <TabsTrigger value="custom" data-testid="filter-date-custom">Custom</TabsTrigger>
              </TabsList>
            </Tabs>
            {dateFilter === 'custom' && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !customDateRange.from && 'text-muted-foreground'
                    )}
                    data-testid="button-custom-date-range"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {customDateRange.from ? (
                      customDateRange.to ? (
                        <>
                          {format(customDateRange.from, 'dd/MM/yyyy', { locale: ptBR })} -{' '}
                          {format(customDateRange.to, 'dd/MM/yyyy', { locale: ptBR })}
                        </>
                      ) : (
                        format(customDateRange.from, 'dd/MM/yyyy', { locale: ptBR })
                      )
                    ) : (
                      <span>Selecione o intervalo</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="range"
                    selected={customDateRange}
                    onSelect={(range: any) => onCustomDateRangeChange(range || { from: undefined, to: undefined })}
                    numberOfMonths={2}
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Horário do dia</label>
            <Select value={periodFilter} onValueChange={onPeriodFilterChange}>
              <SelectTrigger data-testid="select-period-filter">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Dia inteiro</SelectItem>
                <SelectItem value="morning">Manhã (06h-12h)</SelectItem>
                <SelectItem value="afternoon">Tarde (12h-18h)</SelectItem>
                <SelectItem value="night">Noite (18h-23h59)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Ordenar por</label>
            <Select value={orderByFilter} onValueChange={onOrderByFilterChange}>
              <SelectTrigger data-testid="select-orderby-filter">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created">Data de criação</SelectItem>
                <SelectItem value="updated">Última atualização</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Status do pedido</label>
            <Select value={orderStatusFilter} onValueChange={onOrderStatusFilterChange}>
              <SelectTrigger data-testid="select-order-status-filter">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="em_preparo">Em preparação</SelectItem>
                <SelectItem value="pronto">Pronto</SelectItem>
                <SelectItem value="servido">Servido</SelectItem>
                <SelectItem value="cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Status do pagamento</label>
            <Select value={paymentStatusFilter} onValueChange={onPaymentStatusFilterChange}>
              <SelectTrigger data-testid="select-payment-status-filter">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="nao_pago">Não pago</SelectItem>
                <SelectItem value="parcial">Parcial</SelectItem>
                <SelectItem value="pago">Pago</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Origem</label>
            <Select value={orderTypeFilter} onValueChange={onOrderTypeFilterChange}>
              <SelectTrigger data-testid="select-order-type-filter">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="pdv">PDV</SelectItem>
                <SelectItem value="mesa">Mesa</SelectItem>
                <SelectItem value="delivery">Delivery</SelectItem>
                <SelectItem value="balcao">Balcão</SelectItem>
                <SelectItem value="takeout">Retirada</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
