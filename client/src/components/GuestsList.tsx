import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { MoreVertical, UserPlus, Trash2, CreditCard, Award } from 'lucide-react';
import { formatKwanza } from '@/lib/formatters';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import type { TableGuest, Customer } from '@shared/schema';
import { ConvertGuestDialog } from './ConvertGuestDialog';

interface GuestsListProps {
  guests: (TableGuest & { customer?: Customer })[];
  tableId: string;
  onAddGuest: () => void;
  onCheckoutGuest?: (guestId: string) => void;
}

export function GuestsList({ guests, tableId, onAddGuest, onCheckoutGuest }: GuestsListProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [convertGuestId, setConvertGuestId] = useState<string | null>(null);

  const removeGuestMutation = useMutation({
    mutationFn: async (guestId: string) => {
      await apiRequest('DELETE', `/api/tables/${tableId}/guests/${guestId}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/tables/${tableId}/guests`] });
      toast({
        title: 'Pessoa removida',
        description: 'A pessoa foi removida da mesa.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível remover a pessoa.',
        variant: 'destructive',
      });
    },
  });

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'platina': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'ouro': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'prata': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-orange-100 text-orange-700 border-orange-200';
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'platina': return '💎';
      case 'ouro': return '🥇';
      case 'prata': return '🥈';
      default: return '🥉';
    }
  };

  const getGuestDisplayName = (guest: TableGuest & { customer?: Customer }) => {
    if (guest.customer) {
      return guest.customer.name;
    }
    if (guest.name) {
      return guest.name;
    }
    return `Convidado ${guest.guestNumber || ''}`;
  };

  const isAnonymousGuest = (guest: TableGuest & { customer?: Customer }) => {
    return !guest.customerId;
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          Pessoas na Mesa ({guests.length})
        </h3>
        <Button onClick={onAddGuest} size="sm" className="gap-2">
          <UserPlus className="h-4 w-4" />
          Adicionar
        </Button>
      </div>

      {guests.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-8 text-center">
            <div className="rounded-full bg-muted p-3 mb-3">
              <UserPlus className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Nenhuma pessoa adicionada à mesa ainda
            </p>
            <Button onClick={onAddGuest} variant="outline" size="sm">
              Adicionar Pessoa
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {guests.map((guest) => {
            const isAnonymous = isAnonymousGuest(guest);
            const displayName = getGuestDisplayName(guest);
            const subtotal = parseFloat(guest.subtotal || '0');
            const paidAmount = parseFloat(guest.paidAmount || '0');
            const pending = subtotal - paidAmount;

            return (
              <Card key={guest.id} className={`transition-all ${isAnonymous ? 'border-dashed' : 'border-2'}`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <Avatar className={`h-12 w-12 ${isAnonymous ? 'opacity-60' : ''}`}>
                      <AvatarFallback 
                        className={
                          isAnonymous 
                            ? 'bg-gray-400 text-white' 
                            : 'bg-gradient-to-br from-orange-500 to-pink-500 text-white'
                        }
                      >
                        {isAnonymous ? '👤' : displayName.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold truncate">{displayName}</h4>
                            {!isAnonymous && guest.customer && (
                              <Badge variant="outline" className={getTierColor(guest.customer.tier || 'bronze')}>
                                {getTierIcon(guest.customer.tier || 'bronze')} {guest.customer.tier?.toUpperCase() || 'BRONZE'}
                              </Badge>
                            )}
                            {isAnonymous && (
                              <Badge variant="secondary" className="text-xs">
                                Convidado
                              </Badge>
                            )}
                          </div>

                          {/* Customer Info */}
                          {!isAnonymous && guest.customer && (
                            <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                              {guest.customer.phone && <span>📱 {guest.customer.phone}</span>}
                              <span className="flex items-center gap-1">
                                <Award className="h-3 w-3" />
                                {guest.customer.loyaltyPoints} pontos
                              </span>
                            </div>
                          )}

                          {/* Financial Info */}
                          <div className="flex items-center gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Total: </span>
                              <span className="font-medium">{formatKwanza(subtotal)}</span>
                            </div>
                            {paidAmount > 0 && (
                              <div>
                                <span className="text-muted-foreground">Pago: </span>
                                <span className="font-medium text-green-600">{formatKwanza(paidAmount)}</span>
                              </div>
                            )}
                            {pending > 0 && (
                              <div>
                                <span className="text-muted-foreground">Pendente: </span>
                                <span className="font-medium text-orange-600">{formatKwanza(pending)}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Actions Menu */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {pending > 0 && onCheckoutGuest && (
                              <DropdownMenuItem onClick={() => onCheckoutGuest(guest.id)}>
                                <CreditCard className="h-4 w-4 mr-2" />
                                Checkout Individual
                              </DropdownMenuItem>
                            )}
                            {isAnonymous && (
                              <DropdownMenuItem onClick={() => setConvertGuestId(guest.id)}>
                                <UserPlus className="h-4 w-4 mr-2" />
                                Converter em Cliente
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem 
                              onClick={() => removeGuestMutation.mutate(guest.id)}
                              className="text-red-600"
                              disabled={subtotal > 0}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Remover
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Convert Guest Dialog */}
      {convertGuestId && (
        <ConvertGuestDialog
          open={!!convertGuestId}
          onOpenChange={(open) => !open && setConvertGuestId(null)}
          guestId={convertGuestId}
          tableId={tableId}
        />
      )}
    </div>
  );
}
