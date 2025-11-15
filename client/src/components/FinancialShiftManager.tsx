import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { formatKwanza } from '@/lib/formatters';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ClockIcon, DollarSignIcon, CalendarIcon, UserIcon } from 'lucide-react';

interface FinancialShift {
  id: string;
  restaurantId: string;
  branchId: string | null;
  operatorId: string;
  status: 'aberto' | 'fechado';
  openingBalance: string;
  closingBalance: string;
  expectedBalance: string;
  discrepancy: string;
  notes: string | null;
  startedAt: Date;
  endedAt: Date | null;
}

export function FinancialShiftManager() {
  const { toast } = useToast();
  const [openShiftDialog, setOpenShiftDialog] = useState(false);
  const [closeShiftDialog, setCloseShiftDialog] = useState(false);
  const [openingBalance, setOpeningBalance] = useState('');
  const [closingBalance, setClosingBalance] = useState('');
  const [notes, setNotes] = useState('');

  const { data: shifts = [], isLoading } = useQuery<FinancialShift[]>({
    queryKey: ['/api/financial-shifts'],
  });

  const currentShift = shifts.find(shift => shift.status === 'aberto');

  const openShiftMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/financial-shifts', {
        openingBalance,
        notes: notes || undefined,
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/financial-shifts'] });
      toast({
        title: 'Turno aberto',
        description: 'O turno foi aberto com sucesso.',
      });
      setOpenShiftDialog(false);
      setOpeningBalance('');
      setNotes('');
    },
    onError: () => {
      toast({
        title: 'Erro',
        description: 'Não foi possível abrir o turno.',
        variant: 'destructive',
      });
    },
  });

  const closeShiftMutation = useMutation({
    mutationFn: async () => {
      if (!currentShift) return;
      const res = await apiRequest('PATCH', `/api/financial-shifts/${currentShift.id}/close`, {
        closingBalance,
        notes: notes || undefined,
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/financial-shifts'] });
      toast({
        title: 'Turno fechado',
        description: 'O turno foi fechado com sucesso.',
      });
      setCloseShiftDialog(false);
      setClosingBalance('');
      setNotes('');
    },
    onError: () => {
      toast({
        title: 'Erro',
        description: 'Não foi possível fechar o turno.',
        variant: 'destructive',
      });
    },
  });

  const handleOpenShift = () => {
    openShiftMutation.mutate();
  };

  const handleCloseShift = () => {
    closeShiftMutation.mutate();
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Gerenciamento de Turnos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">Carregando...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-3">
          <CardTitle>Gerenciamento de Turnos</CardTitle>
          <div className="flex gap-2">
            {!currentShift && (
              <Button
                onClick={() => setOpenShiftDialog(true)}
                data-testid="button-open-shift"
              >
                Abrir Turno
              </Button>
            )}
            {currentShift && (
              <Button
                onClick={() => setCloseShiftDialog(true)}
                variant="destructive"
                data-testid="button-close-shift"
              >
                Fechar Turno
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {currentShift ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    Turno Aberto
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  ID: {currentShift.id.slice(0, 8)}...
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CalendarIcon className="h-4 w-4" />
                    <span>Início</span>
                  </div>
                  <div className="text-base font-medium">
                    {format(new Date(currentShift.startedAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <DollarSignIcon className="h-4 w-4" />
                    <span>Saldo Inicial</span>
                  </div>
                  <div className="text-base font-medium">
                    {formatKwanza(currentShift.openingBalance)}
                  </div>
                </div>
              </div>

              {currentShift.notes && (
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Observações</div>
                  <div className="text-sm bg-muted p-3 rounded-md">
                    {currentShift.notes}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <ClockIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Nenhum turno aberto no momento</p>
              <p className="text-sm mt-1">Abra um novo turno para começar</p>
            </div>
          )}

          {shifts.filter(s => s.status === 'fechado').length > 0 && (
            <div className="space-y-3 mt-6">
              <h3 className="text-sm font-medium">Últimos Turnos Fechados</h3>
              <div className="space-y-2">
                {shifts
                  .filter(s => s.status === 'fechado')
                  .slice(0, 3)
                  .map(shift => (
                    <div
                      key={shift.id}
                      className="border rounded-md p-3 space-y-2"
                      data-testid={`shift-history-${shift.id}`}
                    >
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">Fechado</Badge>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(shift.endedAt!), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div>
                          <div className="text-muted-foreground text-xs">Abertura</div>
                          <div className="font-medium">{formatKwanza(shift.openingBalance)}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground text-xs">Fechamento</div>
                          <div className="font-medium">{formatKwanza(shift.closingBalance)}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground text-xs">Discrepância</div>
                          <div className={`font-medium ${parseFloat(shift.discrepancy) !== 0 ? 'text-red-600' : ''}`}>
                            {formatKwanza(shift.discrepancy)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={openShiftDialog} onOpenChange={setOpenShiftDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Abrir Novo Turno</DialogTitle>
            <DialogDescription>
              Informe o saldo inicial em caixa para começar um novo turno.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="opening-balance">Saldo Inicial (Kz)</Label>
              <Input
                id="opening-balance"
                type="number"
                step="0.01"
                value={openingBalance}
                onChange={(e) => setOpeningBalance(e.target.value)}
                placeholder="0.00"
                data-testid="input-opening-balance"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Observações (opcional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notas sobre este turno..."
                data-testid="input-notes"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpenShiftDialog(false)}
              data-testid="button-cancel-open"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleOpenShift}
              disabled={openShiftMutation.isPending}
              data-testid="button-confirm-open"
            >
              {openShiftMutation.isPending ? 'Abrindo...' : 'Abrir Turno'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={closeShiftDialog} onOpenChange={setCloseShiftDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Fechar Turno</DialogTitle>
            <DialogDescription>
              Informe o saldo atual em caixa para fechar o turno.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="closing-balance">Saldo Final (Kz)</Label>
              <Input
                id="closing-balance"
                type="number"
                step="0.01"
                value={closingBalance}
                onChange={(e) => setClosingBalance(e.target.value)}
                placeholder="0.00"
                data-testid="input-closing-balance"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="close-notes">Observações (opcional)</Label>
              <Textarea
                id="close-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notas sobre o fechamento..."
                data-testid="input-close-notes"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCloseShiftDialog(false)}
              data-testid="button-cancel-close"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCloseShift}
              disabled={closeShiftMutation.isPending || !closingBalance}
              variant="destructive"
              data-testid="button-confirm-close"
            >
              {closeShiftMutation.isPending ? 'Fechando...' : 'Fechar Turno'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
