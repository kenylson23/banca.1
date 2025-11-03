import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, DollarSign, Clock, QrCode as QrCodeIcon } from 'lucide-react';
import { formatKwanza } from '@/lib/formatters';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Table } from '@shared/schema';

interface TableCardProps {
  table: Table & { orders?: any[] };
  onClick: () => void;
  onShowQrCode: (table: Table & { orders?: any[] }) => void;
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
          <QrCodeIcon className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <Badge className={statusConfig.badgeColor} data-testid={`status-${table.id}`}>
            {statusConfig.label}
          </Badge>
          {orderCount > 0 && (
            <Badge variant="outline" className="text-xs">
              {orderCount} {orderCount === 1 ? 'pedido' : 'pedidos'}
            </Badge>
          )}
        </div>

        {table.status !== 'livre' && (
          <>
            <div className="space-y-2 text-sm">
              {table.customerName && (
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="truncate">{table.customerName}</span>
                  {table.customerCount && table.customerCount > 0 && (
                    <span className="text-muted-foreground">({table.customerCount})</span>
                  )}
                </div>
              )}

              {table.totalAmount && parseFloat(table.totalAmount) > 0 && (
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="font-semibold text-primary">
                    {formatKwanza(table.totalAmount)}
                  </span>
                </div>
              )}

              {table.lastActivity && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4 flex-shrink-0" />
                  <span className="text-xs truncate">
                    {format(new Date(table.lastActivity), "HH:mm", { locale: ptBR })}
                  </span>
                </div>
              )}
            </div>
          </>
        )}

        {table.status === 'livre' && (
          <div className="text-sm text-muted-foreground text-center py-2">
            Mesa disponível
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
