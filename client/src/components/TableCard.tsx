import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  UsersThree, 
  CurrencyCircleDollar, 
  Clock as ClockIcon, 
  QrCode, 
  WarningCircle, 
  UserCheck as UserCheckIcon,
  Warning
} from '@phosphor-icons/react';
import { formatKwanza } from '@/lib/formatters';
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Table } from '@shared/schema';

interface TableCardProps {
  table: Table & { orders?: any[]; guestsAwaitingBill?: number; guestCount?: number };
  onClick: () => void;
  onShowQrCode: (table: Table & { orders?: any[]; guestsAwaitingBill?: number; guestCount?: number }) => void;
}

const getStatusConfig = (status: string) => {
  switch (status) {
    case 'livre':
      return {
        label: 'Disponível',
        color: 'bg-green-500',
        badgeVariant: 'default' as const,
        badgeColor: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      };
    case 'ocupada':
      return {
        label: 'Ocupada',
        color: 'bg-orange-500',
        badgeVariant: 'secondary' as const,
        badgeColor: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      };
    case 'em_andamento':
      return {
        label: 'Em Andamento',
        color: 'bg-blue-500',
        badgeVariant: 'secondary' as const,
        badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      };
    case 'aguardando_pagamento':
      return {
        label: 'Aguardando Pagamento',
        color: 'bg-red-500',
        badgeVariant: 'destructive' as const,
        badgeColor: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      };
    case 'encerrada':
      return {
        label: 'Encerrada',
        color: 'bg-gray-500',
        badgeVariant: 'outline' as const,
        badgeColor: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
      };
    default:
      return {
        label: 'Desconhecido',
        color: 'bg-gray-400',
        badgeVariant: 'outline' as const,
        badgeColor: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
      };
  }
};

export function TableCard({ table, onClick, onShowQrCode }: TableCardProps) {
  const statusConfig = getStatusConfig(table.status || 'livre');
  const orderCount = table.orders?.length || 0;
  
  // Alerta de tempo longo (mais de 2 horas)
  const sessionDuration = table.lastActivity 
    ? Date.now() - new Date(table.lastActivity).getTime()
    : 0;
  const isLongSession = sessionDuration > 2 * 60 * 60 * 1000; // 2 horas em ms
  const showLongSessionAlert = table.status !== 'livre' && isLongSession;

  return (
    <Card
      className="hover-elevate active-elevate-2 cursor-pointer transition-all"
      onClick={onClick}
      data-testid={`table-card-${table.id}`}
    >
      <CardHeader className="flex flex-row items-center justify-between gap-2 pb-3">
        <div className="flex items-center gap-2">
          <CardTitle className="text-lg">Mesa {table.number}</CardTitle>
          <div className={`h-2.5 w-2.5 rounded-full ${statusConfig.color}`} />
        </div>
        <Button
          size="icon"
          variant="ghost"
          onClick={(e) => {
            e.stopPropagation();
            onShowQrCode(table);
          }}
          data-testid={`button-show-qr-${table.id}`}
          className="h-8 w-8"
        >
          <QrCode className="h-4 w-4" weight="duotone" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-1">
          <Badge className={statusConfig.badgeColor} data-testid={`status-${table.id}`}>
            {statusConfig.label}
          </Badge>
          <div className="flex items-center gap-1 flex-wrap">
            {showLongSessionAlert && (
              <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 animate-pulse" data-testid={`long-session-${table.id}`}>
                <Warning className="h-3 w-3 mr-1" weight="fill" />
                Aberta há muito tempo
              </Badge>
            )}
            {table.guestsAwaitingBill && table.guestsAwaitingBill > 0 && (
              <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200" data-testid={`awaiting-bill-${table.id}`}>
                <WarningCircle className="h-3 w-3 mr-1" weight="fill" />
                {table.guestsAwaitingBill} {table.guestsAwaitingBill === 1 ? 'pediu' : 'pediram'} conta
              </Badge>
            )}
            {orderCount > 0 && (
              <Badge variant="outline" className="text-xs">
                {orderCount} {orderCount === 1 ? 'pedido' : 'pedidos'}
              </Badge>
            )}
          </div>
        </div>

        {table.status !== 'livre' && (
          <>
            <div className="space-y-2 text-sm">
              {table.customerName && (
                <div className="flex items-center gap-2">
                  <UsersThree className="h-4 w-4 text-muted-foreground flex-shrink-0" weight="duotone" />
                  <span className="truncate">{table.customerName}</span>
                  {table.customerCount && table.customerCount > 0 && (
                    <span className="text-muted-foreground">
                      ({table.customerCount}{table.capacity ? `/${table.capacity}` : ''})
                    </span>
                  )}
                </div>
              )}

              {table.guestCount && table.guestCount > 0 && (
                <div className="flex items-center gap-2">
                  <UserCheckIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" weight="duotone" />
                  <span className="text-muted-foreground">
                    {table.guestCount} {table.guestCount === 1 ? 'cliente' : 'clientes'} na mesa
                  </span>
                </div>
              )}

              {table.totalAmount && parseFloat(table.totalAmount) > 0 && (
                <div className="flex items-center gap-2">
                  <CurrencyCircleDollar className="h-4 w-4 text-muted-foreground flex-shrink-0" weight="duotone" />
                  <span className="font-semibold text-primary">
                    {formatKwanza(table.totalAmount)}
                  </span>
                </div>
              )}

              {table.lastActivity && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <ClockIcon className="h-4 w-4 flex-shrink-0" weight="duotone" />
                  <div className="flex flex-col text-xs">
                    <span className="truncate">
                      Início: {format(new Date(table.lastActivity), "HH:mm", { locale: ptBR })}
                    </span>
                    <span className="text-muted-foreground/70 truncate">
                      {formatDistanceToNow(new Date(table.lastActivity), { locale: ptBR, addSuffix: false })}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {table.status === 'livre' && (
          <div className="text-sm text-muted-foreground text-center py-2">
            <div>Mesa disponível</div>
            {table.capacity && (
              <div className="flex items-center justify-center gap-1 mt-1">
                <UsersThree className="h-3 w-3" weight="duotone" />
                <span className="text-xs">Capacidade: {table.capacity} pessoas</span>
              </div>
            )}
          </div>
        )}

        <Button
          variant={table.status === 'livre' ? 'default' : 'outline'}
          size="sm"
          className="w-full"
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
          data-testid={`button-manage-${table.id}`}
        >
          {table.status === 'livre' ? 'Ocupar Mesa' : 'Gerenciar'}
        </Button>
      </CardContent>
    </Card>
  );
}
