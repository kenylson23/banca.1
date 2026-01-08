/**
 * GuestsSection - Gestão de Pessoas na Mesa
 * Lista, adiciona, converte e remove convidados
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Users, 
  UserPlus, 
  Trash2, 
  UserCheck,
  Clock,
  DollarSign,
  ShoppingBag,
  MoreVertical,
  QrCode,
  Play
} from 'lucide-react';
import { formatKwanza } from '@/lib/formatters';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Table } from '@shared/schema';

interface GuestsSectionProps {
  table: Table;
  guests: any[];
  ordersByGuest: any[];
  isLoading: boolean;
  onAddPerson: () => void;
  onConvertGuest: (guestId: string) => void;
  onRemoveGuest: (guestId: string) => void;
  onShowQRCode: () => void;
  onStartSession?: () => void;
}

export function GuestsSection({
  table,
  guests,
  ordersByGuest,
  isLoading,
  onAddPerson,
  onConvertGuest,
  onRemoveGuest,
  onShowQRCode,
  onStartSession,
}: GuestsSectionProps) {
  if (table.status === 'livre') {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center">
              <Users className="h-12 w-12 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2">Nenhuma Sessão Ativa</h3>
              <p className="text-muted-foreground max-w-md mb-4">
                Inicie uma sessão na mesa para adicionar pessoas e gerenciar pedidos.
              </p>
              <Button 
                size="lg" 
                onClick={onStartSession}
                className="gap-2"
              >
                <Play className="w-5 h-5" />
                Iniciar Sessão
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando pessoas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Pessoas na Mesa</h2>
          <p className="text-muted-foreground">
            {guests.length} {guests.length === 1 ? 'pessoa' : 'pessoas'} na sessão
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={onShowQRCode} variant="outline" size="sm">
            <QrCode className="w-4 h-4 mr-2" />
            QR Code
          </Button>
          <Button onClick={onAddPerson} size="sm">
            <UserPlus className="w-4 h-4 mr-2" />
            Adicionar Pessoa
          </Button>
        </div>
      </div>

      {guests.length === 0 ? (
        /* Empty State */
        <Card>
          <CardContent className="py-12 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="h-12 w-12 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Nenhuma Pessoa Registrada</h3>
                <p className="text-muted-foreground max-w-md mb-4">
                  Adicione pessoas à mesa para organizar os pedidos individualmente.
                </p>
                <Button onClick={onAddPerson}>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Adicionar Primeira Pessoa
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Lista de Convidados */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {guests.map((guest) => {
            // Encontrar pedidos deste convidado
            const guestOrders = ordersByGuest?.find((og: any) => og.guest.id === guest.id);
            const ordersCount = guestOrders?.orders?.length || 0;
            const guestTotal = parseFloat(guestOrders?.subtotal || '0');
            const isPaid = guest.status === 'pago';
            const isCustomer = !!guest.customerId;

            return (
              <Card 
                key={guest.id}
                className={cn(
                  "transition-all hover:shadow-md",
                  isPaid && "border-green-500/50 bg-green-500/5"
                )}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "h-12 w-12 rounded-full flex items-center justify-center font-bold text-lg",
                        isCustomer 
                          ? "bg-blue-500 text-white" 
                          : "bg-muted text-muted-foreground"
                      )}>
                        {guest.name 
                          ? guest.name.charAt(0).toUpperCase() 
                          : guest.guestNumber
                        }
                      </div>
                      <div>
                        <CardTitle className="text-lg">
                          {guest.name || `Cliente ${guest.guestNumber}`}
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          {isCustomer ? (
                            <Badge variant="outline" className="text-blue-600 border-blue-600">
                              <UserCheck className="w-3 h-3 mr-1" />
                              Cliente
                            </Badge>
                          ) : (
                            <Badge variant="outline">
                              <Users className="w-3 h-3 mr-1" />
                              Convidado
                            </Badge>
                          )}
                          {isPaid && (
                            <Badge className="bg-green-500">
                              Pago
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {!isCustomer && (
                          <DropdownMenuItem onClick={() => onConvertGuest(guest.id)}>
                            <UserCheck className="w-4 h-4 mr-2" />
                            Converter em Cliente
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem 
                          onClick={() => onRemoveGuest(guest.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Remover
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Separator />
                  
                  {/* Estatísticas */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <ShoppingBag className="w-3 h-3" />
                        Pedidos
                      </div>
                      <div className="text-xl font-bold">{ordersCount}</div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <DollarSign className="w-3 h-3" />
                        Total
                      </div>
                      <div className="text-xl font-bold text-green-600">
                        {formatKwanza(guestTotal)}
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Info adicional */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Entrou {formatDistanceToNow(new Date(guest.joinedAt), { 
                        addSuffix: true, 
                        locale: ptBR 
                      })}
                    </div>
                    {guest.seatNumber && (
                      <div>Assento #{guest.seatNumber}</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
