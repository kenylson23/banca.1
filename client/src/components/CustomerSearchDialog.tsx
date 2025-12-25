import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MagnifyingGlass, User, Phone, Star, X } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

interface Customer {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  loyaltyPoints: number;
  tier: 'bronze' | 'prata' | 'ouro' | 'platina';
  totalSpent: string;
  visitCount: number;
}

interface CustomerSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectCustomer: (customer: Customer) => void;
  onCreateNew?: () => void;
}

const tierColors = {
  bronze: 'bg-orange-100 text-orange-800 border-orange-300',
  prata: 'bg-gray-100 text-gray-800 border-gray-300',
  ouro: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  platina: 'bg-purple-100 text-purple-800 border-purple-300',
};

const tierLabels = {
  bronze: 'Bronze',
  prata: 'Prata',
  ouro: 'Ouro',
  platina: 'Platina',
};

export function CustomerSearchDialog({
  open,
  onOpenChange,
  onSelectCustomer,
  onCreateNew,
}: CustomerSearchDialogProps) {
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch customers
  const { data: customers = [], isLoading } = useQuery<Customer[]>({
    queryKey: ['/api/customers'],
    enabled: open,
  });

  // Filter customers based on search term
  const filteredCustomers = customers.filter((customer) => {
    const search = searchTerm.toLowerCase();
    return (
      customer.name.toLowerCase().includes(search) ||
      customer.phone?.toLowerCase().includes(search) ||
      customer.email?.toLowerCase().includes(search)
    );
  });

  const handleSelectCustomer = (customer: Customer) => {
    onSelectCustomer(customer);
    onOpenChange(false);
    setSearchTerm('');
  };

  const handleClear = () => {
    setSearchTerm('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Buscar Cliente
          </DialogTitle>
          <DialogDescription>
            Selecione um cliente cadastrado para vincular à mesa
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, telefone ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-10"
              autoFocus
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                onClick={handleClear}
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* Results */}
          <ScrollArea className="h-[400px] pr-4">
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Carregando clientes...
              </div>
            ) : filteredCustomers.length === 0 ? (
              <div className="text-center py-8 space-y-4">
                <div className="text-muted-foreground">
                  {searchTerm
                    ? 'Nenhum cliente encontrado com esse critério'
                    : 'Nenhum cliente cadastrado'}
                </div>
                {onCreateNew && (
                  <Button onClick={onCreateNew} variant="outline">
                    <User className="w-4 h-4 mr-2" />
                    Cadastrar Novo Cliente
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredCustomers.map((customer) => (
                  <button
                    key={customer.id}
                    onClick={() => handleSelectCustomer(customer)}
                    className="w-full text-left p-4 rounded-lg border border-border hover:border-primary hover:bg-accent transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-base truncate">
                            {customer.name}
                          </h4>
                          {customer.tier && tierLabels[customer.tier] && (
                            <Badge
                              variant="outline"
                              className={cn(
                                'text-xs',
                                tierColors[customer.tier]
                              )}
                            >
                              {tierLabels[customer.tier]}
                            </Badge>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                          {customer.phone && (
                            <div className="flex items-center gap-1">
                              <Phone className="w-3.5 h-3.5" />
                              <span>{customer.phone}</span>
                            </div>
                          )}
                          {customer.loyaltyPoints > 0 && (
                            <div className="flex items-center gap-1">
                              <Star className="w-3.5 h-3.5" weight="fill" />
                              <span>{customer.loyaltyPoints} pontos</span>
                            </div>
                          )}
                        </div>

                        {customer.visitCount > 0 && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {customer.visitCount}{' '}
                            {customer.visitCount === 1 ? 'visita' : 'visitas'}
                          </div>
                        )}
                      </div>

                      <div className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8"
                        >
                          Selecionar
                        </Button>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Actions */}
          <div className="flex justify-between items-center pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              {filteredCustomers.length}{' '}
              {filteredCustomers.length === 1
                ? 'cliente encontrado'
                : 'clientes encontrados'}
            </div>
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
