/**
 * AddPersonDialog - Design Premium
 * 3 modos: Buscar Cliente | Criar Rápido | Anônimo
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search, Zap, User, ArrowLeft, UserPlus, Phone, ChevronRight, Sparkles, Crown, Lock } from 'lucide-react';
import { CustomerSearchDialog } from '@/components/CustomerSearchDialog';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

type AddPersonMode = 'search' | 'quick' | 'anonymous' | null;

interface AddPersonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tableId: string;
  sessionId: string;
}

export function AddPersonDialog({
  open,
  onOpenChange,
  tableId,
  sessionId,
}: AddPersonDialogProps) {
  const [mode, setMode] = useState<AddPersonMode>(null);
  const [showCustomerSearch, setShowCustomerSearch] = useState(false);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Quick create form
  const [quickName, setQuickName] = useState('');
  const [quickPhone, setQuickPhone] = useState('');
  
  // Anonymous form
  const [anonymousName, setAnonymousName] = useState('');
  
  // Query client para invalidação
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Verificar acesso à gestão de clientes
  const { hasAccess: hasCustomerManagement, planName } = useFeatureAccess('gestao_clientes');

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

  const handleCustomerSelect = async (customer: any) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/tables/${tableId}/guests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          customerId: customer.id,
          name: customer.name,
        }),
      });

      if (!res.ok) throw new Error('Erro ao adicionar cliente');

      // Invalidar queries para atualizar UI
      queryClient.invalidateQueries({ queryKey: [`/api/tables/${tableId}/orders-by-guest`] });
      queryClient.invalidateQueries({ queryKey: [`/api/tables/${tableId}/guests`] });
      queryClient.invalidateQueries({ queryKey: [`/api/table-sessions/${sessionId}/guests`] });
      queryClient.invalidateQueries({ queryKey: [`/api/tables/${tableId}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/tables'] });

      handleClose();
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao adicionar pessoa');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickCreate = async () => {
    if (!quickName.trim()) return;
    
    setIsLoading(true);
    try {
      // Primeiro criar o cliente
      const customerRes = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: quickName.trim(),
          phone: quickPhone.trim() || undefined,
        }),
      });

      if (!customerRes.ok) throw new Error('Erro ao criar cliente');
      
      const newCustomer = await customerRes.json();

      // Depois adicionar à sessão
      const guestRes = await fetch(`/api/tables/${tableId}/guests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          customerId: newCustomer.id,
          name: newCustomer.name,
        }),
      });

      if (!guestRes.ok) throw new Error('Erro ao adicionar à mesa');

      // Invalidar queries para atualizar UI
      queryClient.invalidateQueries({ queryKey: [`/api/tables/${tableId}/orders-by-guest`] });
      queryClient.invalidateQueries({ queryKey: [`/api/tables/${tableId}/guests`] });
      queryClient.invalidateQueries({ queryKey: [`/api/table-sessions/${sessionId}/guests`] });
      queryClient.invalidateQueries({ queryKey: [`/api/tables/${tableId}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/tables'] });

      handleClose();
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao criar e adicionar cliente');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnonymousAdd = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/tables/${tableId}/guests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: anonymousName.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: 'Erro desconhecido' }));
        throw new Error(errorData.message || 'Erro ao adicionar convidado');
      }

      // Invalidar queries para atualizar UI
      queryClient.invalidateQueries({ queryKey: [`/api/tables/${tableId}/orders-by-guest`] });
      queryClient.invalidateQueries({ queryKey: [`/api/tables/${tableId}/guests`] });
      queryClient.invalidateQueries({ queryKey: [`/api/table-sessions/${sessionId}/guests`] });
      queryClient.invalidateQueries({ queryKey: [`/api/tables/${tableId}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/tables'] });

      handleClose();
    } catch (error) {
      console.error('Erro:', error);
      const message = error instanceof Error ? error.message : 'Erro ao adicionar convidado';
      toast({
        title: "Erro ao adicionar pessoa",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open && !showCustomerSearch} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden">
          {/* Header com gradiente */}
          <div className="relative overflow-hidden bg-gradient-to-br from-primary to-primary/80 px-6 pt-6 pb-4">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-20" />
            
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="relative z-10"
            >
              <div className="flex items-center gap-3">
                {mode && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setMode(null)}
                    className="h-8 w-8 text-white hover:bg-white/20 flex-shrink-0"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                )}
                <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                  <UserPlus className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-bold text-white">
                    {!mode && 'Adicionar Pessoa'}
                    {mode === 'search' && 'Buscar Cliente'}
                    {mode === 'quick' && 'Cadastro Rápido'}
                    {mode === 'anonymous' && 'Convidado Anônimo'}
                  </h2>
                  <p className="text-white/80 text-xs truncate">
                    {!mode && 'Escolha como deseja adicionar'}
                    {mode === 'search' && 'Cliente já cadastrado'}
                    {mode === 'quick' && 'Novo cliente com dados básicos'}
                    {mode === 'anonymous' && 'Pessoa sem cadastro'}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Content Area */}
          <div className="p-6">
            <AnimatePresence mode="wait">
              {/* Modo de Seleção */}
              {!mode && (
                <motion.div
                  key="selection"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-3"
                >
                  {/* Buscar Cliente */}
                  <motion.button
                    onClick={() => {
                      if (!hasCustomerManagement) {
                        setShowUpgradePrompt(true);
                        return;
                      }
                      setMode('search');
                      setShowCustomerSearch(true);
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={cn(
                      "w-full p-4 rounded-xl transition-all shadow-lg hover:shadow-xl text-left group relative overflow-hidden",
                      hasCustomerManagement 
                        ? "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                        : "bg-gradient-to-r from-gray-400 to-gray-500"
                    )}
                  >
                    {!hasCustomerManagement && (
                      <div className="absolute top-2 right-2">
                        <div className="bg-amber-500 text-white px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-1">
                          <Crown className="w-3 h-3" />
                          PRO
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                        {hasCustomerManagement ? (
                          <Search className="h-6 w-6 text-white" />
                        ) : (
                          <Lock className="h-6 w-6 text-white" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-white text-base">Buscar Cliente Existente</div>
                        <div className="text-xs text-white/80">
                          {hasCustomerManagement 
                            ? 'Cliente já cadastrado no sistema'
                            : 'Disponível no plano Profissional'
                          }
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-white/60 group-hover:text-white transition-colors" />
                    </div>
                  </motion.button>

                  {/* Criar Rápido */}
                  <motion.button
                    onClick={() => {
                      if (!hasCustomerManagement) {
                        setShowUpgradePrompt(true);
                        return;
                      }
                      setMode('quick');
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={cn(
                      "w-full p-4 rounded-xl border-2 hover:shadow-md transition-all text-left group relative overflow-hidden",
                      hasCustomerManagement
                        ? "border-amber-200 dark:border-amber-800 hover:border-amber-300 dark:hover:border-amber-700 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20"
                        : "border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-900"
                    )}
                  >
                    {!hasCustomerManagement && (
                      <div className="absolute top-2 right-2">
                        <div className="bg-amber-500 text-white px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-1">
                          <Crown className="w-3 h-3" />
                          PRO
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "h-12 w-12 rounded-lg flex items-center justify-center flex-shrink-0",
                        hasCustomerManagement
                          ? "bg-amber-100 dark:bg-amber-900/50"
                          : "bg-gray-200 dark:bg-gray-800"
                      )}>
                        {hasCustomerManagement ? (
                          <Zap className="h-6 w-6 text-amber-600 dark:text-amber-500" />
                        ) : (
                          <Lock className="h-6 w-6 text-gray-500" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className={cn(
                          "font-semibold text-base flex items-center gap-2",
                          hasCustomerManagement
                            ? "text-amber-900 dark:text-amber-100"
                            : "text-gray-600 dark:text-gray-400"
                        )}>
                          Cadastro Rápido
                          {hasCustomerManagement && <Sparkles className="h-4 w-4 text-amber-500" />}
                        </div>
                        <div className={cn(
                          "text-xs",
                          hasCustomerManagement
                            ? "text-amber-700 dark:text-amber-300"
                            : "text-gray-500"
                        )}>
                          {hasCustomerManagement 
                            ? 'Novo cliente com nome e telefone'
                            : 'Disponível no plano Profissional'
                          }
                        </div>
                      </div>
                      <ChevronRight className={cn(
                        "h-5 w-5 transition-colors",
                        hasCustomerManagement
                          ? "text-amber-400 group-hover:text-amber-600"
                          : "text-gray-400"
                      )} />
                    </div>
                  </motion.button>

                  {/* Anônimo */}
                  <motion.button
                    onClick={() => setMode('anonymous')}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full p-4 rounded-xl border-2 hover:border-primary bg-muted/50 hover:bg-muted transition-all text-left group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                        <User className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-foreground text-base">Convidado Anônimo</div>
                        <div className="text-xs text-muted-foreground">Pessoa sem cadastro</div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                    </div>
                  </motion.button>
                </motion.div>
              )}

              {/* Formulário Quick Create */}
              {mode === 'quick' && (
                <motion.div
                  key="quick"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="quick-name" className="flex items-center gap-2 text-sm font-medium">
                      <User className="w-4 h-4 text-primary" />
                      Nome do Cliente *
                    </Label>
                    <Input
                      id="quick-name"
                      placeholder="Ex: Maria Silva"
                      value={quickName}
                      onChange={(e) => setQuickName(e.target.value)}
                      className="h-11 focus-visible:ring-0 focus-visible:ring-offset-0"
                      autoFocus
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quick-phone" className="flex items-center gap-2 text-sm font-medium">
                      <Phone className="w-4 h-4 text-primary" />
                      Telefone (opcional)
                    </Label>
                    <Input
                      id="quick-phone"
                      type="tel"
                      placeholder="Ex: +244 923 456 789"
                      value={quickPhone}
                      onChange={(e) => setQuickPhone(e.target.value)}
                      className="h-11 focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                  </div>
                </motion.div>
              )}

              {/* Formulário Anonymous */}
              {mode === 'anonymous' && (
                <motion.div
                  key="anonymous"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="anonymous-name" className="flex items-center gap-2 text-sm font-medium">
                      <User className="w-4 h-4 text-primary" />
                      Nome (opcional)
                    </Label>
                    <Input
                      id="anonymous-name"
                      placeholder="Ex: João, Convidado 1..."
                      value={anonymousName}
                      onChange={(e) => setAnonymousName(e.target.value)}
                      className="h-11 focus-visible:ring-0 focus-visible:ring-offset-0"
                      autoFocus
                    />
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3" />
                      Se deixar em branco, será gerado "Convidado #N"
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer Actions */}
          {mode && (
            <div className="border-t bg-muted/30 px-6 py-4">
              <div className="flex items-center justify-between gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setMode(null)}
                  disabled={isLoading}
                >
                  Voltar
                </Button>
                
                <Button
                  onClick={mode === 'quick' ? handleQuickCreate : handleAnonymousAdd}
                  disabled={(mode === 'quick' && !quickName.trim()) || isLoading}
                  className={cn(
                    "gap-2",
                    mode === 'quick' && "bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
                  )}
                >
                  {isLoading ? (
                    <>
                      <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      {mode === 'quick' ? 'Criando...' : 'Adicionando...'}
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      {mode === 'quick' ? 'Criar e Adicionar' : 'Adicionar'}
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
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

      {/* Upgrade Prompt Dialog */}
      <Dialog open={showUpgradePrompt} onOpenChange={setShowUpgradePrompt}>
        <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden">
          {/* Header Premium */}
          <div className="relative overflow-hidden bg-gradient-to-br from-amber-500 to-orange-600 p-6">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30" />
            
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.6 }}
              className="relative z-10 text-center"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm mb-4">
                <Crown className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Funcionalidade Premium
              </h2>
              <p className="text-white/90 text-sm">
                Disponível apenas em planos superiores
              </p>
            </motion.div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">
                A <strong>gestão de clientes</strong> permite cadastrar, buscar e gerenciar informações detalhadas dos seus clientes.
              </p>
              <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-sm">
                <div className="flex items-center gap-2 text-left">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  <span>Cadastro completo de clientes</span>
                </div>
                <div className="flex items-center gap-2 text-left">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  <span>Histórico de pedidos por cliente</span>
                </div>
                <div className="flex items-center gap-2 text-left">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  <span>Busca rápida e inteligente</span>
                </div>
                <div className="flex items-center gap-2 text-left">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  <span>Relatórios personalizados</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-center">
              <p className="text-sm text-blue-900 dark:text-blue-100">
                <strong>Plano atual:</strong> {planName || 'Básico'}
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                Faça upgrade para desbloquear esta funcionalidade
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t bg-muted/30 px-6 py-4">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => setShowUpgradePrompt(false)}
                className="flex-1"
              >
                Continuar Básico
              </Button>
              <Button
                onClick={() => {
                  setShowUpgradePrompt(false);
                  window.location.href = '/subscription';
                }}
                className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
              >
                <Crown className="w-4 h-4 mr-2" />
                Ver Planos
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
