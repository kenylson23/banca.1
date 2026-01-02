/**
 * Diálogo para adicionar pessoa à mesa
 * 3 modos: Buscar Cliente | Criar Rápido | Anônimo
 */

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search, Zap, User, ArrowLeft } from 'lucide-react';
import { CustomerSearchDialog } from '@/components/CustomerSearchDialog';

type AddPersonMode = 'search' | 'quick' | 'anonymous' | null;

interface AddPersonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddPerson: (data: {
    type: 'search' | 'quick' | 'anonymous';
    customerId?: string;
    name?: string;
    phone?: string;
  }) => void;
  isLoading?: boolean;
}

export function AddPersonDialog({
  open,
  onOpenChange,
  onAddPerson,
  isLoading = false,
}: AddPersonDialogProps) {
  const [mode, setMode] = useState<AddPersonMode>(null);
  const [showCustomerSearch, setShowCustomerSearch] = useState(false);
  
  // Quick create form
  const [quickName, setQuickName] = useState('');
  const [quickPhone, setQuickPhone] = useState('');
  
  // Anonymous form
  const [anonymousName, setAnonymousName] = useState('');

  const handleReset = () => {
    setMode(null);
    setQuickName('');
    setQuickPhone('');
    setAnonymousName('');
    setShowCustomerSearch(false);
  };

  const handleClose = () => {
    handleReset();
    onOpenChange(false);
  };

  const handleCustomerSelect = (customer: any) => {
    onAddPerson({
      type: 'search',
      customerId: customer.id,
      name: customer.name,
      phone: customer.phone,
    });
    handleClose();
  };

  const handleQuickCreate = () => {
    if (!quickName.trim()) return;
    
    onAddPerson({
      type: 'quick',
      name: quickName.trim(),
      phone: quickPhone.trim() || undefined,
    });
    handleClose();
  };

  const handleAnonymousAdd = () => {
    onAddPerson({
      type: 'anonymous',
      name: anonymousName.trim() || undefined,
    });
    handleClose();
  };

  return (
    <>
      <Dialog open={open && !showCustomerSearch} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {mode ? (
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setMode(null)}
                    className="h-8 w-8"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  {mode === 'search' && 'Buscar Cliente'}
                  {mode === 'quick' && 'Criar Cliente Rápido'}
                  {mode === 'anonymous' && 'Adicionar Convidado'}
                </div>
              ) : (
                'Adicionar Pessoa à Mesa'
              )}
            </DialogTitle>
            <DialogDescription>
              {!mode && 'Escolha como deseja adicionar a pessoa'}
              {mode === 'search' && 'Buscar um cliente cadastrado no sistema'}
              {mode === 'quick' && 'Criar um novo cliente rapidamente'}
              {mode === 'anonymous' && 'Adicionar um convidado sem cadastro'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Modo de Seleção */}
            {!mode && (
              <div className="grid gap-3">
                <Button
                  onClick={() => {
                    setMode('search');
                    setShowCustomerSearch(true);
                  }}
                  className="h-auto py-6 flex-col gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                >
                  <Search className="h-6 w-6" />
                  <div>
                    <div className="font-semibold">Buscar Cliente Existente</div>
                    <div className="text-xs opacity-90">Cliente já cadastrado no sistema</div>
                  </div>
                </Button>

                <Button
                  onClick={() => setMode('quick')}
                  variant="outline"
                  className="h-auto py-6 flex-col gap-2 border-2 hover:bg-slate-50 dark:hover:bg-slate-900"
                >
                  <Zap className="h-6 w-6 text-amber-600" />
                  <div>
                    <div className="font-semibold">Criar Cliente Rápido</div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">
                      Novo cliente com nome e telefone
                    </div>
                  </div>
                </Button>

                <Button
                  onClick={() => setMode('anonymous')}
                  variant="outline"
                  className="h-auto py-6 flex-col gap-2 border-2 hover:bg-slate-50 dark:hover:bg-slate-900"
                >
                  <User className="h-6 w-6 text-slate-600" />
                  <div>
                    <div className="font-semibold">Convidado Anônimo</div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">
                      Pessoa sem cadastro (opcional: nome)
                    </div>
                  </div>
                </Button>
              </div>
            )}

            {/* Formulário Quick Create */}
            {mode === 'quick' && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="quick-name">Nome *</Label>
                  <Input
                    id="quick-name"
                    placeholder="Digite o nome do cliente"
                    value={quickName}
                    onChange={(e) => setQuickName(e.target.value)}
                    autoFocus
                  />
                </div>
                <div>
                  <Label htmlFor="quick-phone">Telefone</Label>
                  <Input
                    id="quick-phone"
                    type="tel"
                    placeholder="(opcional)"
                    value={quickPhone}
                    onChange={(e) => setQuickPhone(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setMode(null)}
                    className="flex-1"
                    disabled={isLoading}
                  >
                    Voltar
                  </Button>
                  <Button
                    onClick={handleQuickCreate}
                    disabled={!quickName.trim() || isLoading}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                  >
                    {isLoading ? 'Criando...' : 'Criar e Adicionar'}
                  </Button>
                </div>
              </div>
            )}

            {/* Formulário Anonymous */}
            {mode === 'anonymous' && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="anonymous-name">
                    Nome (opcional)
                  </Label>
                  <Input
                    id="anonymous-name"
                    placeholder="Ex: João, Convidado 1, etc."
                    value={anonymousName}
                    onChange={(e) => setAnonymousName(e.target.value)}
                    autoFocus
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Se deixar em branco, será "Convidado #N"
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setMode(null)}
                    className="flex-1"
                    disabled={isLoading}
                  >
                    Voltar
                  </Button>
                  <Button
                    onClick={handleAnonymousAdd}
                    disabled={isLoading}
                    className="flex-1"
                  >
                    {isLoading ? 'Adicionando...' : 'Adicionar'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Customer Search Dialog */}
      <CustomerSearchDialog
        open={showCustomerSearch}
        onOpenChange={(open) => {
          setShowCustomerSearch(open);
          if (!open) {
            setMode(null);
          }
        }}
        onSelectCustomer={handleCustomerSelect}
      />
    </>
  );
}
