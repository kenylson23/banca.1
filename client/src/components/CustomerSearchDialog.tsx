import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, User as UserIcon, Phone, Star, X, Users, ChevronRight, TrendingUp } from 'lucide-react';
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
      <DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden">
        {/* Header Premium */}
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 px-6 pt-6 pb-4">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-20" />
          
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="relative z-10"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                <Search className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-bold text-white">Buscar Cliente</h2>
                <p className="text-white/80 text-xs truncate">
                  Selecione um cliente cadastrado
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Search Input */}
        <div className="p-6 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Digite nome, telefone ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-10 h-11 focus-visible:ring-0 focus-visible:ring-offset-0"
              autoFocus
            />
            <AnimatePresence>
              {searchTerm && (
                <motion.button
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  onClick={handleClear}
                  className="absolute right-3 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-muted hover:bg-muted-foreground/20 flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Results */}
        <ScrollArea className="h-[400px] px-6">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-12"
              >
                <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-muted-foreground">Buscando clientes...</p>
              </motion.div>
            ) : filteredCustomers.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="text-center py-12"
              >
                <div className="h-20 w-20 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                  <Users className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-lg mb-2">
                  {searchTerm ? 'Nenhum resultado' : 'Nenhum cliente'}
                </h3>
                <p className="text-muted-foreground text-sm mb-4">
                  {searchTerm
                    ? 'Tente buscar com outros termos'
                    : 'Ainda não há clientes cadastrados'}
                </p>
                {onCreateNew && (
                  <Button onClick={onCreateNew} className="gap-2">
                    <UserIcon className="w-4 h-4" />
                    Cadastrar Novo Cliente
                  </Button>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-2 pb-4"
              >
                {filteredCustomers.map((customer, index) => (
                  <motion.button
                    key={customer.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleSelectCustomer(customer)}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className="w-full text-left p-4 rounded-xl border-2 border-border hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      {/* Avatar */}
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-lg">
                          {customer.name.charAt(0).toUpperCase()}
                        </span>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-base truncate">
                            {customer.name}
                          </h4>
                          {customer.tier && tierLabels[customer.tier] && (
                            <Badge
                              variant="outline"
                              className={cn('text-xs', tierColors[customer.tier])}
                            >
                              <Star className="w-3 h-3 mr-1 fill-current" />
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
                            <div className="flex items-center gap-1 text-amber-600">
                              <Star className="w-3.5 h-3.5 fill-current" />
                              <span className="font-medium">{customer.loyaltyPoints} pts</span>
                            </div>
                          )}
                          {customer.visitCount > 0 && (
                            <div className="flex items-center gap-1">
                              <TrendingUp className="w-3.5 h-3.5" />
                              <span>
                                {customer.visitCount}{' '}
                                {customer.visitCount === 1 ? 'visita' : 'visitas'}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Arrow */}
                      <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-blue-600 transition-colors" />
                    </div>
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </ScrollArea>

        {/* Footer */}
        <div className="border-t bg-muted/30 px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              {!isLoading && (
                <>
                  <span className="font-semibold text-foreground">{filteredCustomers.length}</span>
                  {' '}
                  {filteredCustomers.length === 1 ? 'cliente' : 'clientes'}
                </>
              )}
            </div>
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Fechar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
