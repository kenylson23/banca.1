import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Calendar, Clock, Plus, Settings2, Info, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import type { CashRegister, CashRegisterShift } from "@shared/schema";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatKwanza } from "@/lib/formatters";

interface ShiftWithDetails extends CashRegisterShift {
  cashRegister: CashRegister;
  openedBy: { id: string; firstName?: string; email: string };
  closedBy?: { id: string; firstName?: string; email: string };
}

function formatDateTime(date: string | Date): string {
  return format(new Date(date), "dd MMM yyyy", { locale: ptBR });
}

function formatTime(date: string | Date): string {
  return format(new Date(date), "HH:mm", { locale: ptBR });
}

export default function CashShifts() {
  const { toast } = useToast();
  const [openShiftDialog, setOpenShiftDialog] = useState(false);
  const [closeShiftDialog, setCloseShiftDialog] = useState(false);
  const [configDialog, setConfigDialog] = useState(false);
  const [selectedShift, setSelectedShift] = useState<ShiftWithDetails | null>(null);
  
  const [shiftForm, setShiftForm] = useState({
    cashRegisterId: "",
    openingAmount: "0.00",
    notes: "",
  });

  const [closeShiftForm, setCloseShiftForm] = useState({
    closingAmountCounted: "0.00",
    notes: "",
  });

  const { data: cashRegisters, isLoading: loadingRegisters } = useQuery<CashRegister[]>({
    queryKey: ["/api/financial/cash-registers"],
  });

  const { data: shifts, isLoading: loadingShifts } = useQuery<ShiftWithDetails[]>({
    queryKey: ["/api/cash-register-shifts"],
  });

  const activeShifts = shifts?.filter(s => s.status === 'aberto') || [];
  const closedShifts = shifts?.filter(s => s.status === 'fechado') || [];

  const activeCashRegisters = cashRegisters?.filter(c => c.isActive === 1) || [];

  const openShiftMutation = useMutation({
    mutationFn: async (data: typeof shiftForm) => {
      await apiRequest("POST", "/api/cash-register-shifts", {
        cashRegisterId: data.cashRegisterId,
        openingAmount: data.openingAmount,
        notes: data.notes || undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cash-register-shifts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/financial/cash-registers"] });
      toast({ title: "Turno aberto com sucesso" });
      setOpenShiftDialog(false);
      setShiftForm({
        cashRegisterId: "",
        openingAmount: "0.00",
        notes: "",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao abrir turno",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const closeShiftMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof closeShiftForm }) => {
      await apiRequest("PATCH", `/api/cash-register-shifts/${id}/close`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cash-register-shifts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/financial/cash-registers"] });
      toast({ title: "Turno fechado com sucesso" });
      setCloseShiftDialog(false);
      setSelectedShift(null);
      setCloseShiftForm({ closingAmountCounted: "0.00", notes: "" });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao fechar turno",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleOpenShiftClick = () => {
    if (activeCashRegisters.length === 0) {
      toast({
        title: "Nenhuma caixa disponível",
        description: "Configure uma caixa registradora antes de abrir um turno.",
        variant: "destructive",
      });
      return;
    }
    // Pré-selecionar a primeira caixa ativa se houver apenas uma
    if (activeCashRegisters.length === 1) {
      setShiftForm({ ...shiftForm, cashRegisterId: activeCashRegisters[0].id });
    }
    setOpenShiftDialog(true);
  };

  const handleCloseShift = (shift: ShiftWithDetails) => {
    setSelectedShift(shift);
    const expected = parseFloat(shift.openingAmount) +
      parseFloat(shift.totalRevenues || "0") -
      parseFloat(shift.totalExpenses || "0");
    setCloseShiftForm({ closingAmountCounted: expected.toFixed(2), notes: "" });
    setCloseShiftDialog(true);
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Turnos de Caixa</h1>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setConfigDialog(true)}
              data-testid="button-config"
            >
              <Settings2 className="h-4 w-4 mr-2" />
              Configuração da caixa
            </Button>
            <Button
              onClick={handleOpenShiftClick}
              data-testid="button-open-shift"
            >
              <Plus className="h-4 w-4 mr-2" />
              Abrir caixa
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Abertas</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingShifts ? (
                <div className="space-y-3">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : activeShifts.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data de abertura</TableHead>
                        <TableHead>Caixa registradora</TableHead>
                        <TableHead>Informações do sistema</TableHead>
                        <TableHead>Cálculos do sistema</TableHead>
                        <TableHead>Diferença</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead className="text-right">Ação</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activeShifts.map((shift) => {
                        const expected = parseFloat(shift.openingAmount) +
                          parseFloat(shift.totalRevenues || "0") -
                          parseFloat(shift.totalExpenses || "0");
                        return (
                          <TableRow key={shift.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <div>
                                  <div className="font-medium">{formatTime(shift.openedAt!)}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {formatDateTime(shift.openedAt!)}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{shift.cashRegister.name}</TableCell>
                            <TableCell>{formatKwanza(shift.openingAmount)}</TableCell>
                            <TableCell>{formatKwanza(expected)}</TableCell>
                            <TableCell>
                              <span className="text-muted-foreground">-</span>
                            </TableCell>
                            <TableCell>
                              <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                Aberto
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleCloseShift(shift)}
                                data-testid={`button-close-${shift.id}`}
                              >
                                Fechar caixa
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">
                    Registre a quantia de dinheiro em caixa ao abrir e controle os pagamentos no final do turno.
                  </p>
                  <Button onClick={handleOpenShiftClick} data-testid="button-open-empty">
                    <Plus className="h-4 w-4 mr-2" />
                    Abrir caixa
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Fechadas</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingShifts ? (
                <div className="space-y-3">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : closedShifts.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data de abertura</TableHead>
                        <TableHead>Data de fechamento</TableHead>
                        <TableHead>Caixa registradora</TableHead>
                        <TableHead>Informações do sistema</TableHead>
                        <TableHead>Cálculos do sistema</TableHead>
                        <TableHead>Diferença</TableHead>
                        <TableHead>Estado</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {closedShifts.map((shift) => {
                        const difference = parseFloat(shift.difference || "0");
                        return (
                          <TableRow key={shift.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <div>
                                  <div className="font-medium">{formatTime(shift.openedAt!)}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {formatDateTime(shift.openedAt!)}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <div>
                                  <div className="font-medium">{formatTime(shift.closedAt!)}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {formatDateTime(shift.closedAt!)}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{shift.cashRegister.name}</TableCell>
                            <TableCell>{formatKwanza(shift.openingAmount)}</TableCell>
                            <TableCell>{formatKwanza(shift.closingAmountExpected || "0")}</TableCell>
                            <TableCell>
                              <span className={difference < 0 ? "text-red-600 font-medium" : difference > 0 ? "text-green-600 font-medium" : ""}>
                                {formatKwanza(difference)}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary">Fechado</Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum turno fechado
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Dialog open={openShiftDialog} onOpenChange={setOpenShiftDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Nova conferência de caixa</DialogTitle>
              <DialogDescription>
                Selecione a caixa e informe o valor inicial para abrir o turno
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="cash-register">Caixa registradora</Label>
                <Select
                  value={shiftForm.cashRegisterId}
                  onValueChange={(value) => setShiftForm({ ...shiftForm, cashRegisterId: value })}
                >
                  <SelectTrigger id="cash-register" data-testid="select-cash-register">
                    <SelectValue placeholder="Selecione uma caixa" />
                  </SelectTrigger>
                  <SelectContent>
                    {activeCashRegisters.map((register) => (
                      <SelectItem key={register.id} value={register.id}>
                        {register.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="opening-amount">Montante inicial (Kz)</Label>
                <Input
                  id="opening-amount"
                  type="number"
                  step="0.01"
                  value={shiftForm.openingAmount}
                  onChange={(e) => setShiftForm({ ...shiftForm, openingAmount: e.target.value })}
                  placeholder="0.00"
                  data-testid="input-opening-amount"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Observações (opcional)</Label>
                <Textarea
                  id="notes"
                  value={shiftForm.notes}
                  onChange={(e) => setShiftForm({ ...shiftForm, notes: e.target.value })}
                  placeholder="Notas sobre a abertura..."
                  data-testid="input-notes"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={() => openShiftMutation.mutate(shiftForm)}
                disabled={openShiftMutation.isPending || !shiftForm.cashRegisterId}
                className="w-full"
                data-testid="button-confirm-open"
              >
                {openShiftMutation.isPending ? "Iniciando..." : "Iniciar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={closeShiftDialog} onOpenChange={setCloseShiftDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Fechar Turno de Caixa</DialogTitle>
              <DialogDescription>
                Informe o valor contado em caixa e confirme o fechamento.
              </DialogDescription>
            </DialogHeader>
            {selectedShift && (
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">Valor de Abertura</p>
                    <p className="text-lg font-bold">{formatKwanza(selectedShift.openingAmount)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Receitas</p>
                    <p className="text-lg font-bold text-green-600">+{formatKwanza(selectedShift.totalRevenues || "0")}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Despesas</p>
                    <p className="text-lg font-bold text-red-600">-{formatKwanza(selectedShift.totalExpenses || "0")}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Valor Esperado</p>
                    <p className="text-lg font-bold">
                      {formatKwanza(
                        parseFloat(selectedShift.openingAmount) +
                        parseFloat(selectedShift.totalRevenues || "0") -
                        parseFloat(selectedShift.totalExpenses || "0")
                      )}
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="closing-amount">Valor Contado (Kz)</Label>
                  <Input
                    id="closing-amount"
                    type="number"
                    step="0.01"
                    value={closeShiftForm.closingAmountCounted}
                    onChange={(e) => setCloseShiftForm({ ...closeShiftForm, closingAmountCounted: e.target.value })}
                    data-testid="input-closing-amount"
                  />
                </div>
                {closeShiftForm.closingAmountCounted && (
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Diferença</p>
                    <p className={`text-xl font-bold ${
                      parseFloat(closeShiftForm.closingAmountCounted) - 
                      (parseFloat(selectedShift.openingAmount) + parseFloat(selectedShift.totalRevenues || "0") - parseFloat(selectedShift.totalExpenses || "0")) === 0
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}>
                      {formatKwanza(
                        parseFloat(closeShiftForm.closingAmountCounted) -
                        (parseFloat(selectedShift.openingAmount) + parseFloat(selectedShift.totalRevenues || "0") - parseFloat(selectedShift.totalExpenses || "0"))
                      )}
                    </p>
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="close-notes">Observações (opcional)</Label>
                  <Textarea
                    id="close-notes"
                    value={closeShiftForm.notes}
                    onChange={(e) => setCloseShiftForm({ ...closeShiftForm, notes: e.target.value })}
                    placeholder="Notas sobre o fechamento..."
                    data-testid="input-close-notes"
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setCloseShiftDialog(false)}>
                Cancelar
              </Button>
              <Button
                onClick={() => {
                  if (selectedShift) {
                    closeShiftMutation.mutate({
                      id: selectedShift.id,
                      data: closeShiftForm,
                    });
                  }
                }}
                disabled={closeShiftMutation.isPending}
                data-testid="button-confirm-close"
              >
                {closeShiftMutation.isPending ? "Fechando..." : "Fechar Turno"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={configDialog} onOpenChange={setConfigDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Configuração da caixa</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {activeCashRegisters.map((register) => (
                <div key={register.id} className="space-y-2">
                  <p className="font-medium">Nome da caixa: {register.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Esta caixa registradora recebe por padrão:
                  </p>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    <li>Todos os pagamentos de pedidos</li>
                    <li>Todos os movimentos de dinheiro</li>
                  </ul>
                </div>
              ))}
              
              <div className="pt-4 border-t">
                <Link href="/financial/cash-registers">
                  <Button variant="outline" className="w-full" data-testid="button-new-register">
                    <Plus className="h-4 w-4 mr-2" />
                    Nova caixa
                  </Button>
                </Link>
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex gap-3">
                  <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="space-y-2 text-sm">
                    <p className="font-medium text-blue-900 dark:text-blue-100">
                      Crie uma nova caixa registradora para:
                    </p>
                    <ul className="list-disc list-inside text-blue-800 dark:text-blue-200 space-y-1">
                      <li>Atribuí-la a uma sala específica (para pedidos de mesas).</li>
                      <li>Registrar movimentos de dinheiro separadamente.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
