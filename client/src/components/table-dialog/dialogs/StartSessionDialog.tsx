/**
 * StartSessionDialog - Iniciar Sessão na Mesa
 * Design Premium com animações e UX moderna
 */

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { 
  Play, 
  Users, 
  Clock, 
  Sparkles,
  ChevronRight,
  CheckCircle2,
  MapPin,
  User,
  Hash,
  MessageSquare,
  AlertCircle,
  Minus,
  Plus
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Table } from '@shared/schema';

interface StartSessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  table: Table;
  onSuccess?: () => void;
}

export function StartSessionDialog({
  open,
  onOpenChange,
  table,
  onSuccess,
}: StartSessionDialogProps) {
  const [step, setStep] = useState<'info' | 'confirm'>('info');
  const [expectedGuests, setExpectedGuests] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [showCapacityWarning, setShowCapacityWarning] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAnimating, setIsAnimating] = useState(false);

  const startSessionMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/tables/${table.id}/start-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          expectedGuests: expectedGuests ? parseInt(expectedGuests) : undefined,
          notes: notes || undefined,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Erro ao iniciar sessão');
      }

      return res.json();
    },
    onSuccess: async () => {
      console.log('🎉 [StartSession] Sessão iniciada, invalidando e refazendo queries...');

      toast({
        title: 'Sessão Iniciada',
        description: `A sessão da Mesa ${table.number} foi iniciada com sucesso.`,
      });

      // Invalidar queries relacionadas - FORÇAR REFETCH
      queryClient.invalidateQueries({ queryKey: [`/api/tables/${table.id}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/tables'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tables/with-orders'] });
      queryClient.invalidateQueries({ queryKey: [`/api/tables/${table.id}/orders-by-guest`] });
      
      // 🔧 FIX: Aguardar refetch de TODAS as queries críticas antes de fechar o diálogo
      await Promise.all([
        queryClient.refetchQueries({ 
          queryKey: [`/api/tables/${table.id}`],
          type: 'active'
        }),
        queryClient.refetchQueries({ 
          queryKey: [`/api/tables/${table.id}/orders-by-guest`],
          type: 'active'
        }),
        queryClient.refetchQueries({ 
          queryKey: ['/api/tables'],
          type: 'active'
        }),
        queryClient.refetchQueries({ 
          queryKey: ['/api/tables/with-orders'],
          type: 'active'
        }),
        // Refetch de todas as queries de sessões
        queryClient.refetchQueries({
          predicate: (query) => {
            const key = query.queryKey[0];
            return typeof key === 'string' && key.startsWith('/api/table-sessions/');
          }
        }),
      ]);

      console.log('✅ [StartSession] Queries atualizadas!');

      // Reset form
      setExpectedGuests('');
      setNotes('');

      // Callback
      onSuccess?.();
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao Iniciar Sessão',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleGuestsChange = (value: string) => {
    setExpectedGuests(value);
    
    // Check if exceeds capacity
    if (table.capacity && value) {
      const numGuests = parseInt(value);
      if (numGuests > table.capacity) {
        setShowCapacityWarning(true);
        // Auto-hide warning after 3 seconds
        setTimeout(() => setShowCapacityWarning(false), 3000);
      } else {
        setShowCapacityWarning(false);
      }
    }
  };

  const handleContinue = () => {
    // Validate capacity before continuing
    if (table.capacity && expectedGuests) {
      const numGuests = parseInt(expectedGuests);
      if (numGuests > table.capacity) {
        toast({
          title: 'Capacidade Excedida',
          description: `Esta mesa comporta até ${table.capacity} pessoas. Você pode continuar, mas considere realocar para uma mesa maior.`,
          variant: 'destructive',
        });
      }
    }
    
    setIsAnimating(true);
    setTimeout(() => {
      setStep('confirm');
      setIsAnimating(false);
    }, 300);
  };

  const handleBack = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setStep('info');
      setIsAnimating(false);
    }, 300);
  };

  const handleSubmit = () => {
    startSessionMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden">
        {/* Header compacto com gradiente */}
        <div className="relative overflow-hidden bg-gradient-to-br from-primary to-primary/80 px-6 pt-6 pb-4">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-20" />
          
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="relative z-10"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                <Play className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-bold text-white">Iniciar Sessão</h2>
                <p className="text-white/80 text-xs">Mesa {table.number}{table.area && ` • ${table.area}`}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Content Area - compacto */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            {step === 'info' ? (
              <motion.div
                key="info"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                {/* Expected Guests */}
                <div className="space-y-2">
                  <Label htmlFor="expectedGuests" className="flex items-center gap-2 text-sm font-medium">
                    <Users className="w-4 h-4 text-primary" />
                    Quantas pessoas?
                  </Label>
                  <div className="relative">
                    <div className="flex items-center gap-3">
                      {/* Botão Diminuir */}
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          const current = parseInt(expectedGuests) || 0;
                          if (current > 1) {
                            handleGuestsChange(String(current - 1));
                          }
                        }}
                        disabled={!expectedGuests || parseInt(expectedGuests) <= 1}
                        className="h-11 w-11 rounded-lg flex-shrink-0 hover:bg-primary/10 hover:text-primary hover:border-primary transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </Button>

                      {/* Input Central */}
                      <div className="flex-1 relative">
                        <Input
                          id="expectedGuests"
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={expectedGuests}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^0-9]/g, '');
                            handleGuestsChange(value);
                          }}
                          placeholder={table.capacity ? `Ex: ${table.capacity}` : "Ex: 4"}
                          className="h-11 text-center text-lg font-semibold focus-visible:ring-0 focus-visible:ring-offset-0"
                        />
                        <AnimatePresence>
                          {showCapacityWarning && (
                            <motion.div
                              initial={{ opacity: 0, y: -10, scale: 0.9 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: -10, scale: 0.9 }}
                              transition={{ duration: 0.2 }}
                              className="absolute -top-12 left-0 right-0 z-10"
                            >
                              <div className="bg-orange-500 text-white text-xs font-medium px-3 py-2 rounded-lg shadow-lg flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                <span>Capacidade da mesa: {table.capacity} lugares</span>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Botão Aumentar */}
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          const current = parseInt(expectedGuests) || 0;
                          handleGuestsChange(String(current + 1));
                        }}
                        className="h-11 w-11 rounded-lg flex-shrink-0 hover:bg-primary/10 hover:text-primary hover:border-primary transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  {table.capacity && (
                    <div className="flex items-center gap-2">
                      <p className={cn(
                        "text-xs transition-colors",
                        showCapacityWarning ? "text-orange-600 font-medium" : "text-muted-foreground"
                      )}>
                        Capacidade da mesa: {table.capacity} lugares
                      </p>
                      {expectedGuests && parseInt(expectedGuests) > table.capacity && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="text-xs text-orange-600 font-semibold"
                        >
                          (+{parseInt(expectedGuests) - table.capacity} extra)
                        </motion.span>
                      )}
                    </div>
                  )}
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes" className="flex items-center gap-2 text-sm font-medium">
                    <MessageSquare className="w-4 h-4 text-primary" />
                    Observações (opcional)
                  </Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Ex: Aniversário, mesa reservada..."
                    maxLength={200}
                    rows={2}
                    className="resize-none text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    {notes.length}/200
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="confirm"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <div className="text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", duration: 0.5 }}
                    className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 mb-3"
                  >
                    <CheckCircle2 className="w-8 h-8 text-white" />
                  </motion.div>
                  <h3 className="text-lg font-bold mb-1">Confirmar Início?</h3>
                  <p className="text-sm text-muted-foreground">
                    Revise as informações
                  </p>
                </div>

                {/* Summary compacto */}
                <div className="rounded-lg bg-muted/50 p-4 space-y-2 text-sm">
                  <div className="flex items-center justify-between py-1">
                    <span className="text-muted-foreground">Mesa</span>
                    <span className="font-bold">#{table.number}</span>
                  </div>
                  {expectedGuests && (
                    <div className="flex items-center justify-between py-1 border-t pt-2">
                      <span className="text-muted-foreground">Pessoas</span>
                      <span className="font-semibold">{expectedGuests}</span>
                    </div>
                  )}
                  {table.area && (
                    <div className="flex items-center justify-between py-1 border-t pt-2">
                      <span className="text-muted-foreground">Área</span>
                      <span className="font-semibold">{table.area}</span>
                    </div>
                  )}
                  {notes && (
                    <div className="border-t pt-2">
                      <span className="text-muted-foreground block mb-1">Observações</span>
                      <p className="text-foreground bg-background p-2 rounded border text-xs">
                        {notes}
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Actions - compacto */}
        <div className="border-t bg-muted/30 px-6 py-4">
          <div className="flex items-center justify-between gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() => step === 'info' ? onOpenChange(false) : handleBack()}
              disabled={startSessionMutation.isPending || isAnimating}
            >
              {step === 'info' ? 'Cancelar' : 'Voltar'}
            </Button>
            
            {step === 'info' ? (
              <Button
                onClick={handleContinue}
                disabled={isAnimating}
                className="gap-2"
              >
                Continuar
                <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={startSessionMutation.isPending}
                className="gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
              >
                {startSessionMutation.isPending ? (
                  <>
                    <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Iniciando...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Iniciar Sessão
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
