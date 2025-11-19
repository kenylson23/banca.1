import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ArrowLeft, Plus, Settings, Trash2, DollarSign, Clock, CheckCircle2, XCircle } from "lucide-react";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import type { CashRegister, CashRegisterShift } from "@shared/schema";

interface ShiftWithDetails extends CashRegisterShift {
  cashRegister: CashRegister;
  openedBy: { id: string; firstName?: string; email: string };
  closedBy?: { id: string; firstName?: string; email: string };
}

function formatKwanza(value: string | number): string {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('pt-AO', {
    style: 'currency',
    currency: 'AOA',
    minimumFractionDigits: 2,
  }).format(numValue).replace('AOA', 'Kz');
}

export default function FinancialCashRegisters() {
  const { toast } = useToast();
  const [newRegisterDialog, setNewRegisterDialog] = useState(false);
  const [editRegisterDialog, setEditRegisterDialog] = useState(false);
  const [deleteRegisterDialog, setDeleteRegisterDialog] = useState(false);
  const [openShiftDialog, setOpenShiftDialog] = useState(false);
  const [closeShiftDialog, setCloseShiftDialog] = useState(false);
  const [selectedRegister, setSelectedRegister] = useState<CashRegister | null>(null);
  const [selectedShift, setSelectedShift] = useState<ShiftWithDetails | null>(null);
  
  const [registerForm, setRegisterForm] = useState({
    name: "",
    initialBalance: "0.00",
  });

  const [shiftForm, setShiftForm] = useState({
    cashRegisterId: "",
    openingAmount: "0.00",
    notes: "",
  });

  const [closeShiftForm, setCloseShiftForm] = useState({
    closingAmountCounted: "0.00",
    notes: "",
  });

  const { data: cashRegisters } = useQuery<CashRegister[]>({
    queryKey: ["/api/financial/cash-registers"],
  });

  const { data: shifts } = useQuery<ShiftWithDetails[]>({
    queryKey: ["/api/cash-register-shifts"],
  });

  const activeShifts = shifts?.filter(s => s.status === 'aberto') || [];
  const recentClosedShifts = shifts?.filter(s => s.status === 'fechado').slice(0, 5) || [];

  const createRegisterMutation = useMutation({
    mutationFn: async (data: typeof registerForm) => {
      await apiRequest("POST", "/api/financial/cash-registers", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/financial/cash-registers"] });
      toast({ title: "Caixa criada com sucesso" });
      setNewRegisterDialog(false);
      setRegisterForm({ name: "", initialBalance: "0.00" });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar caixa",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateRegisterMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { name: string } }) => {
      await apiRequest("PATCH", `/api/financial/cash-registers/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/financial/cash-registers"] });
      toast({ title: "Caixa atualizada com sucesso" });
      setEditRegisterDialog(false);
      setSelectedRegister(null);
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar caixa",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteRegisterMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/financial/cash-registers/${id}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/financial/cash-registers"] });
      toast({ title: "Caixa excluída com sucesso" });
      setDeleteRegisterDialog(false);
      setSelectedRegister(null);
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao excluir caixa",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const openShiftMutation = useMutation({
    mutationFn: async (data: typeof shiftForm) => {
      await apiRequest("POST", "/api/cash-register-shifts", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cash-register-shifts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/financial/cash-registers"] });
      toast({ title: "Turno aberto com sucesso" });
      setOpenShiftDialog(false);
      setShiftForm({ cashRegisterId: "", openingAmount: "0.00", notes: "" });
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

  const handleOpenShift = (register: CashRegister) => {
    setShiftForm({ ...shiftForm, cashRegisterId: register.id });
    setOpenShiftDialog(true);
  };

  const handleCloseShift = (shift: ShiftWithDetails) => {
    setSelectedShift(shift);
    setCloseShiftDialog(true);
  };

  const getActiveShiftForRegister = (registerId: string) => {
    return activeShifts.find(s => s.cashRegisterId === registerId);
  };

  return (
    <div className="min-h-screen">
      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        <motion.div 
          className="space-y-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link href="/financial">
                <Button variant="ghost" size="icon" data-testid="button-back">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div className="flex flex-col gap-2">
                <h1 className="text-4xl sm:text-5xl font-bold tracking-tight bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                  Configuração de Caixas
                </h1>
                <p className="text-base text-muted-foreground">
                  Gerencie caixas registradoras e controle turnos de caixa
                </p>
              </div>
            </div>
            <Button onClick={() => setNewRegisterDialog(true)} data-testid="button-new-register">
              <Plus className="h-4 w-4 mr-2" />
              Nova Caixa
            </Button>
          </div>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Caixas Registradoras
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {cashRegisters && cashRegisters.length > 0 ? (
                cashRegisters.map((register) => {
                  const activeShift = getActiveShiftForRegister(register.id);
                  return (
                    <div
                      key={register.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover-elevate"
                      data-testid={`register-${register.id}`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{register.name}</p>
                          {activeShift ? (
                            <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                              Turno Aberto
                            </Badge>
                          ) : (
                            <Badge variant="secondary">Fechado</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Saldo: {formatKwanza(register.currentBalance)}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {activeShift ? (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleCloseShift(activeShift as ShiftWithDetails)}
                            data-testid={`button-close-shift-${register.id}`}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Fechar
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => handleOpenShift(register)}
                            data-testid={`button-open-shift-${register.id}`}
                          >
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            Abrir
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedRegister(register);
                            setRegisterForm({ name: register.name, initialBalance: "0.00" });
                            setEditRegisterDialog(true);
                          }}
                          data-testid={`button-edit-${register.id}`}
                        >
                          Editar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedRegister(register);
                            setDeleteRegisterDialog(true);
                          }}
                          data-testid={`button-delete-${register.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-center py-8 text-muted-foreground">
                  Nenhuma caixa registradora configurada
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Turnos Recentes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentClosedShifts.length > 0 ? (
                recentClosedShifts.map((shift) => (
                  <div
                    key={shift.id}
                    className="p-4 border rounded-lg"
                    data-testid={`shift-${shift.id}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium">{shift.cashRegister.name}</p>
                      <Badge variant="secondary">Fechado</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Abertura:</span>
                        <p className="font-medium">{formatKwanza(shift.openingAmount)}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Fechamento:</span>
                        <p className="font-medium">{formatKwanza(shift.closingAmountCounted || "0")}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Esperado:</span>
                        <p className="font-medium">{formatKwanza(shift.closingAmountExpected || "0")}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Diferença:</span>
                        <p className={`font-medium ${parseFloat(shift.difference || "0") === 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatKwanza(shift.difference || "0")}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center py-8 text-muted-foreground">
                  Nenhum turno fechado recentemente
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <Dialog open={newRegisterDialog} onOpenChange={setNewRegisterDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova Caixa Registradora</DialogTitle>
              <DialogDescription>
                Crie uma nova caixa registradora para controlar movimentações financeiras.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome da Caixa</Label>
                <Input
                  id="name"
                  value={registerForm.name}
                  onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                  placeholder="Ex: Caixa Principal"
                  data-testid="input-register-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="initialBalance">Saldo Inicial (Kz)</Label>
                <Input
                  id="initialBalance"
                  type="number"
                  step="0.01"
                  value={registerForm.initialBalance}
                  onChange={(e) => setRegisterForm({ ...registerForm, initialBalance: e.target.value })}
                  data-testid="input-initial-balance"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setNewRegisterDialog(false)}>
                Cancelar
              </Button>
              <Button
                onClick={() => createRegisterMutation.mutate(registerForm)}
                disabled={createRegisterMutation.isPending || !registerForm.name}
                data-testid="button-confirm-create"
              >
                {createRegisterMutation.isPending ? "Criando..." : "Criar Caixa"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={editRegisterDialog} onOpenChange={setEditRegisterDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Caixa Registradora</DialogTitle>
              <DialogDescription>
                Atualize o nome da caixa registradora.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nome da Caixa</Label>
                <Input
                  id="edit-name"
                  value={registerForm.name}
                  onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                  data-testid="input-edit-name"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditRegisterDialog(false)}>
                Cancelar
              </Button>
              <Button
                onClick={() => {
                  if (selectedRegister) {
                    updateRegisterMutation.mutate({
                      id: selectedRegister.id,
                      data: { name: registerForm.name },
                    });
                  }
                }}
                disabled={updateRegisterMutation.isPending || !registerForm.name}
                data-testid="button-confirm-edit"
              >
                {updateRegisterMutation.isPending ? "Atualizando..." : "Atualizar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <AlertDialog open={deleteRegisterDialog} onOpenChange={setDeleteRegisterDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir caixa registradora?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação não pode ser desfeita. A caixa "{selectedRegister?.name}" será excluída permanentemente.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel data-testid="button-cancel-delete">Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (selectedRegister) {
                    deleteRegisterMutation.mutate(selectedRegister.id);
                  }
                }}
                data-testid="button-confirm-delete"
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {deleteRegisterMutation.isPending ? "Excluindo..." : "Excluir"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Dialog open={openShiftDialog} onOpenChange={setOpenShiftDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Abrir Turno de Caixa</DialogTitle>
              <DialogDescription>
                Informe o valor inicial em caixa para iniciar um novo turno.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="opening-amount">Valor de Abertura (Kz)</Label>
                <Input
                  id="opening-amount"
                  type="number"
                  step="0.01"
                  value={shiftForm.openingAmount}
                  onChange={(e) => setShiftForm({ ...shiftForm, openingAmount: e.target.value })}
                  data-testid="input-opening-amount"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shift-notes">Observações (opcional)</Label>
                <Textarea
                  id="shift-notes"
                  value={shiftForm.notes}
                  onChange={(e) => setShiftForm({ ...shiftForm, notes: e.target.value })}
                  placeholder="Notas sobre o turno..."
                  data-testid="input-shift-notes"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpenShiftDialog(false)}>
                Cancelar
              </Button>
              <Button
                onClick={() => openShiftMutation.mutate(shiftForm)}
                disabled={openShiftMutation.isPending}
                data-testid="button-confirm-open-shift"
              >
                {openShiftMutation.isPending ? "Abrindo..." : "Abrir Turno"}
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
                variant="destructive"
                onClick={() => {
                  if (selectedShift) {
                    closeShiftMutation.mutate({
                      id: selectedShift.id,
                      data: closeShiftForm,
                    });
                  }
                }}
                disabled={closeShiftMutation.isPending || !closeShiftForm.closingAmountCounted}
                data-testid="button-confirm-close-shift"
              >
                {closeShiftMutation.isPending ? "Fechando..." : "Fechar Turno"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
