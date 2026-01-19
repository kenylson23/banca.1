/**
 * PaymentSection - Gestão de Pagamento da Mesa
 * Redireciona para checkout v2 ou mostra resumo
 */

import { useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  CreditCard, 
  DollarSign,
  Users,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Receipt,
  Split,
  Zap,
  Banknote,
  Smartphone,
  Building2,
  XCircle
} from 'lucide-react';
import { formatKwanza } from '@/lib/formatters';
import { apiRequest } from '@/lib/queryClient';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import type { Table } from '@shared/schema';

interface PaymentSectionProps {
  table: Table;
  guests: any[];
  ordersByGuest: any[];
  totalAmount: number;
  sessionPaidAmount?: number; // 🔧 FIX: Valor pago na sessão (não por convidado)
  selectedGuestIds?: string[]; // ✅ NEW: IDs dos convidados selecionados para pagamento
  onClose: () => void;
  onCloseTable?: () => void;
}

export function PaymentSection({
  table,
  guests,
  ordersByGuest,
  totalAmount,
  sessionPaidAmount = 0, // 🔧 FIX: Default 0 se não fornecido
  selectedGuestIds = [], // ✅ NEW: Default array vazio
  onClose,
  onCloseTable,
}: PaymentSectionProps) {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // ✅ SOLUÇÃO 4: Estado para checkout rápido
  const [showQuickCheckout, setShowQuickCheckout] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('dinheiro');
  const [receivedAmount, setReceivedAmount] = useState('');
  const [customAmount, setCustomAmount] = useState(''); // 🔧 FIX: Permitir valor customizado
  
  const handleGoToCheckout = () => {
    onClose();
    navigate(`/tables/${table.id}/checkout?step=1`);
  };

  const handleSplitBill = () => {
    onClose();
    navigate(`/tables/${table.id}/checkout?step=1&split=true`);
  };
  
  // ✅ SOLUÇÃO 4: Mutation para checkout rápido
  const quickPaymentMutation = useMutation({
    mutationFn: async () => {
      if (!paymentMethod) {
        throw new Error('Selecione um método de pagamento');
      }
      
      // 🔧 FIX: totalAmount já inclui os ajustes (desconto/taxa) aplicados na sessão
      const paymentAmount = customAmount && parseFloat(customAmount) > 0 
        ? parseFloat(customAmount) 
        : totalUnpaid; // Pagar o valor pendente (já com ajustes)
      
      // Validar que não está pagando mais que o pendente
      if (paymentAmount > totalUnpaid) {
        throw new Error(`Valor de pagamento (${paymentAmount.toFixed(2)}) não pode ser maior que o pendente (${totalUnpaid.toFixed(2)})`);
      }
      
      if (paymentAmount <= 0) {
        throw new Error('Valor de pagamento deve ser maior que zero');
      }
      
      // ✅ NEW: Se apenas 1 convidado selecionado, usar rota de pagamento específico
      if (selectedGuestIds.length === 1) {
        const guestId = selectedGuestIds[0];
        const payload = {
          amount: paymentAmount.toFixed(2),
          paymentMethod,
          receivedAmount: receivedAmount ? parseFloat(receivedAmount) : undefined,
          notes: `Pagamento individual`,
        };
        
        console.log('🎯 [PAYMENT SECTION] Usando rota de pagamento INDIVIDUAL:', {
          guestId,
          route: `/api/table-guests/${guestId}/payment`,
          payload
        });
        
        const res = await apiRequest('POST', `/api/table-guests/${guestId}/payment`, payload);
        return res.json();
      }
      
      console.log('🎯 [PAYMENT SECTION] Usando rota de pagamento GERAL da mesa:', {
        selectedGuestCount: selectedGuestIds.length,
        route: `/api/tables/${table.id}/payment`,
        totalAmount,
        paymentAmount
      });
      
      // 🔧 FIX: Não enviar desconto/taxa aqui, pois já foram aplicados na sessão
      const payload = {
        tableId: table.id,
        sessionId: table.currentSessionId,
        amount: paymentAmount.toFixed(2),
        paymentMethod,
        receivedAmount: receivedAmount ? parseFloat(receivedAmount) : undefined,
      };
      
      const res = await apiRequest('POST', `/api/tables/${table.id}/payment`, payload);
      return res.json();
    },
    onSuccess: () => {
      // Invalidação abrangente para garantir que todos os componentes vejam os novos dados
      queryClient.invalidateQueries({ queryKey: ["/api/tables"] });
      queryClient.invalidateQueries({ queryKey: [`/api/tables/${table.id}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/tables/${table.id}/orders-by-guest`] });
      queryClient.invalidateQueries({ queryKey: [`/api/tables/${table.id}/guests`] });
      queryClient.invalidateQueries({ queryKey: ["/api/tables/with-orders"] });
      
      const wasPartialPayment = customAmount && parseFloat(customAmount) > 0 && parseFloat(customAmount) < totalUnpaid;
      
      toast({
        title: wasPartialPayment ? "Pagamento parcial processado" : "Pagamento processado",
        description: wasPartialPayment 
          ? `${formatKwanza(parseFloat(customAmount))} recebido. Restam ${formatKwanza(totalUnpaid - parseFloat(customAmount))}`
          : "O pagamento foi registrado com sucesso",
      });
      
      // Limpar campos
      setCustomAmount('');
      setReceivedAmount('');
      setShowQuickCheckout(false);
      
      // Se foi pagamento parcial, não fechar o diálogo principal (para permitir mais pagamentos)
      if (!wasPartialPayment) {
        onClose();
      }
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao processar pagamento",
        description: error.message || "Não foi possível processar o pagamento",
        variant: "destructive",
      });
    },
  });

  if (table.status === 'livre') {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center">
              <CreditCard className="h-12 w-12 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2">Nenhuma Sessão Ativa</h3>
              <p className="text-muted-foreground max-w-md">
                Inicie uma sessão na mesa para processar pagamentos.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // 🔧 FIX: Usar sessionPaidAmount da sessão (não somar por convidado)
  // O sessionPaidAmount vem de table_sessions.paidAmount (atualizado pelo backend)
  
  // 🐛 DEBUG: Ver dados dos convidados e da sessão
  console.log('=== DEBUG PAGAMENTO ===');
  console.log('sessionPaidAmount (da sessão):', sessionPaidAmount);
  console.log('totalAmount:', totalAmount);
  console.log('ordersByGuest:', ordersByGuest);
  ordersByGuest?.forEach((og: any, i: number) => {
    console.log(`Convidado #${i + 1}:`, {
      id: og.guest.id,
      name: og.guest.name,
      guestNumber: og.guest.guestNumber,
      status: og.guest.status,
      subtotal: og.subtotal,
      paidAmount: og.guest.paidAmount,
    });
  });
  
  // 🔧 FIX: Usar o valor da sessão, não dos convidados individuais
  const paidFromGuests = ordersByGuest?.reduce((sum: number, og: any) => {
    return sum + parseFloat(og.guest?.paidAmount || '0');
  }, 0) || 0;
  const totalPaid = Math.max(sessionPaidAmount, paidFromGuests);
  const totalUnpaid = Math.max(0, totalAmount - totalPaid);
  
  // ✅ NOVO: Verificar se pagamento está completo (tolerância de 1 Kz)
  // 🔧 FIX: Apenas considerar completo se há valor total E foi pago
  const isPaymentComplete = totalAmount > 0 && totalPaid > 0 && totalUnpaid <= 1.0;
  
  console.log('totalPaid (da sessão):', totalPaid);
  console.log('totalUnpaid:', totalUnpaid);
  console.log('isPaymentComplete:', isPaymentComplete);
  console.log('======================');
  
  // Contar convidados pagos baseado em paidAmount (não em status)
  // 🔧 FIX: Só considerar pago se há subtotal E foi pago
  const paidGuests = ordersByGuest?.filter((og: any) => {
    const paid = parseFloat(og.guest.paidAmount || '0');
    const subtotal = parseFloat(og.subtotal || '0');
    // Só considerar pago se há valor E foi pago
    return subtotal > 0 && paid > 0 && paid >= subtotal - 0.01; // Tolerância de 1 centavo
  }).length || 0;
  const unpaidGuests = (ordersByGuest?.length || 0) - paidGuests;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Pagamento da Mesa</h2>
        <p className="text-muted-foreground">
          Finalize o pagamento da mesa ou divida a conta entre os convidados
        </p>
      </div>

      {/* ✅ NOVO: Alerta de Pagamento Completo */}
      {isPaymentComplete && (
        <Card className="border-2 border-green-500 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-full bg-green-100 dark:bg-green-900">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-1">
                  Pagamento Completo! ✅
                </h3>
                <p className="text-sm text-green-700 dark:text-green-300 mb-3">
                  A conta desta mesa foi totalmente paga. A mesa está pronta para ser fechada manualmente quando os clientes saírem.
                </p>
                <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                  <Receipt className="w-4 h-4" />
                  <span>Os clientes podem continuar fazendo pedidos adicionais se desejarem</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Status do Pagamento */}
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Status do Pagamento
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Total da Mesa */}
            <div className="text-center p-4 rounded-lg bg-background border">
              <div className="text-sm text-muted-foreground mb-2">Total da Mesa</div>
              <div className="text-3xl font-bold text-primary">
                {formatKwanza(totalAmount)}
              </div>
            </div>

            {/* Total Pendente */}
            <div className={cn(
              "text-center p-4 rounded-lg border",
              isPaymentComplete 
                ? "bg-green-50 dark:bg-green-950 border-green-500" 
                : "bg-background"
            )}>
              <div className="text-sm text-muted-foreground mb-2">
                {isPaymentComplete ? "Pendente (Pago)" : "Pendente"}
              </div>
              <div className={cn(
                "text-3xl font-bold",
                isPaymentComplete ? "text-green-600" : "text-orange-600"
              )}>
                {formatKwanza(totalUnpaid)}
              </div>
              {isPaymentComplete && (
                <div className="mt-2 flex items-center justify-center gap-1 text-xs text-green-600">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Totalmente Pago</span>
                </div>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          {totalAmount > 0 && (
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-muted-foreground">Progresso do Pagamento</span>
                <span className="font-semibold">
                  {((totalPaid / totalAmount) * 100).toFixed(0)}%
                </span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500"
                  style={{ width: `${(totalPaid / totalAmount) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Status por Pessoa */}
          <Separator />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span className="text-sm">{paidGuests} pessoas pagaram</span>
            </div>
            {unpaidGuests > 0 && (
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-orange-600" />
                <span className="text-sm">{unpaidGuests} pendentes</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Opções de Pagamento */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* ✅ SOLUÇÃO 4: Checkout Rápido */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-green-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-green-600" />
              Checkout Rápido
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Processar pagamento sem sair do diálogo
            </p>
            <Button 
              onClick={() => setShowQuickCheckout(true)}
              className="w-full bg-green-600 hover:bg-green-700"
              size="lg"
              disabled={totalUnpaid <= 0}
            >
              <Zap className="w-4 h-4 mr-2" />
              Pagar Agora
            </Button>
          </CardContent>
        </Card>

        {/* Pagamento Total */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="w-5 h-5" />
              Checkout Completo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Wizard completo com ajustes e cupons
            </p>
            <Button 
              onClick={handleGoToCheckout}
              className="w-full"
              size="lg"
              variant="outline"
            >
              <Receipt className="w-4 h-4 mr-2" />
              Ir para Checkout
            </Button>
          </CardContent>
        </Card>

        {/* Dividir Conta */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Split className="w-5 h-5" />
              Dividir Conta
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Dividir pagamento entre pessoas
            </p>
            <Button 
              onClick={handleSplitBill}
              className="w-full"
              size="lg"
              variant="outline"
            >
              <Split className="w-4 h-4 mr-2" />
              Dividir Conta
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Resumo por Pessoa */}
      {ordersByGuest && ordersByGuest.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Resumo por Pessoa</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {ordersByGuest.map((og: any) => {
                const guestTotal = parseFloat(og.subtotal || '0');
                const isPaid = og.guest.status === 'pago';

                return (
                  <div 
                    key={og.guest.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Users className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-semibold">
                          {og.guest.name || `Cliente ${og.guest.guestNumber}`}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {og.orders?.length || 0} pedidos
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="font-bold text-lg">
                          {formatKwanza(guestTotal)}
                        </div>
                      </div>
                      {isPaid ? (
                        <Badge className="bg-green-500">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Pago
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-orange-600 border-orange-600">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          Pendente
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ✅ Card de Fechamento de Mesa - SEMPRE VISÍVEL quando há sessão */}
      {totalAmount > 0 && onCloseTable && (
        <Card className={cn(
          "border-2",
          totalUnpaid === 0 
            ? "border-green-500 bg-green-50 dark:bg-green-950/20" 
            : "border-orange-500/50 bg-orange-50/50 dark:bg-orange-950/20"
        )}>
          <CardHeader>
            <CardTitle className={cn(
              "flex items-center gap-2",
              totalUnpaid === 0 ? "text-green-700 dark:text-green-300" : "text-orange-700 dark:text-orange-300"
            )}>
              {totalUnpaid === 0 ? (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  Mesa Paga - Pronta para Fechar
                </>
              ) : (
                <>
                  <AlertCircle className="w-5 h-5" />
                  Pagamentos Pendentes
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {totalUnpaid === 0 ? (
              <>
                <p className="text-sm text-muted-foreground">
                  Todos os pagamentos foram recebidos. Você pode fechar esta mesa agora para liberá-la para novos clientes.
                </p>
                
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total:</span>
                    <span className="font-medium">{formatKwanza(totalAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Pago:</span>
                    <span className="font-medium text-green-600">{formatKwanza(totalPaid)}</span>
                  </div>
                </div>
                
                <Button
                  onClick={onCloseTable}
                  className="w-full bg-green-600 hover:bg-green-700"
                  size="lg"
                >
                  <XCircle className="w-5 h-5 mr-2" />
                  Fechar Mesa e Liberar
                </Button>
              </>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  Ainda há <span className="font-semibold text-orange-600">{formatKwanza(totalUnpaid)}</span> pendente de pagamento. 
                  Processe todos os pagamentos antes de fechar a mesa.
                </p>
                
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total:</span>
                    <span className="font-medium">{formatKwanza(totalAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Pendente:</span>
                    <span className="font-medium text-orange-600">{formatKwanza(totalUnpaid)}</span>
                  </div>
                </div>
                
                <Button
                  onClick={onCloseTable}
                  variant="outline"
                  className="w-full border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950/30"
                  size="lg"
                >
                  <AlertCircle className="w-5 h-5 mr-2" />
                  Tentar Fechar Mesmo Assim
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* ✅ SOLUÇÃO 4: Diálogo de Checkout Rápido */}
      <Dialog open={showQuickCheckout} onOpenChange={setShowQuickCheckout}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Checkout Rápido
            </DialogTitle>
            <DialogDescription>
              Processe o pagamento rapidamente sem sair do diálogo
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Valor Pendente (Referência) */}
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
              <div className="text-sm text-muted-foreground mb-1">Valor Pendente Total</div>
              <div className="text-3xl font-bold text-primary">
                {formatKwanza(totalUnpaid)}
              </div>
            </div>

            {/* 🔧 FIX: Campo para valor customizado (pagamento parcial) */}
            <div className="space-y-2">
              <Label htmlFor="custom-amount">
                Valor do Pagamento
                <span className="text-xs text-muted-foreground ml-2">
                  (deixe vazio para pagar o total)
                </span>
              </Label>
              <Input
                id="custom-amount"
                type="number"
                step="0.01"
                min="0"
                max={totalUnpaid}
                placeholder={`Máx: ${totalUnpaid.toFixed(2)} Kz`}
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
              />
              {customAmount && parseFloat(customAmount) > 0 && (
                <div className="text-sm p-2 bg-blue-50 dark:bg-blue-950/20 rounded border border-blue-200 dark:border-blue-900">
                  <div className="flex items-center justify-between">
                    <span className="text-blue-700 dark:text-blue-300">
                      Pagamento Parcial:
                    </span>
                    <span className="font-bold text-blue-700 dark:text-blue-300">
                      {formatKwanza(parseFloat(customAmount))}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-blue-600 dark:text-blue-400">
                      Restará após pagamento:
                    </span>
                    <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                      {formatKwanza(totalUnpaid - parseFloat(customAmount))}
                    </span>
                  </div>
                </div>
              )}
              {!customAmount && (
                <p className="text-xs text-muted-foreground">
                  💡 Pagamento total de {formatKwanza(totalUnpaid)} será processado
                </p>
              )}
            </div>

            {/* Método de Pagamento */}
            <div className="space-y-2">
              <Label htmlFor="payment-method">Método de Pagamento</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger id="payment-method">
                  <SelectValue placeholder="Selecione o método" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dinheiro">
                    <div className="flex items-center gap-2">
                      <Banknote className="w-4 h-4" />
                      Dinheiro
                    </div>
                  </SelectItem>
                  <SelectItem value="multicaixa">
                    <div className="flex items-center gap-2">
                      <Smartphone className="w-4 h-4" />
                      Multicaixa
                    </div>
                  </SelectItem>
                  <SelectItem value="transferencia">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      Transferência
                    </div>
                  </SelectItem>
                  <SelectItem value="cartao">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4" />
                      Cartão
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Valor Recebido (opcional - apenas para dinheiro) */}
            {paymentMethod === 'dinheiro' && (
              <div className="space-y-2">
                <Label htmlFor="received-amount">
                  Valor Recebido (opcional)
                </Label>
                <Input
                  id="received-amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={receivedAmount}
                  onChange={(e) => setReceivedAmount(e.target.value)}
                />
                {receivedAmount && parseFloat(receivedAmount) > totalUnpaid && (
                  <div className="text-sm p-2 bg-green-50 dark:bg-green-950/20 rounded border border-green-200 dark:border-green-900">
                    <div className="flex items-center justify-between">
                      <span className="text-green-700 dark:text-green-300">Troco:</span>
                      <span className="font-bold text-green-700 dark:text-green-300">
                        {formatKwanza(parseFloat(receivedAmount) - totalUnpaid)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Botões */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setShowQuickCheckout(false);
                  setCustomAmount('');
                  setReceivedAmount('');
                }}
                disabled={quickPaymentMutation.isPending}
              >
                Cancelar
              </Button>
              <Button
                className="flex-1 bg-green-600 hover:bg-green-700"
                onClick={() => quickPaymentMutation.mutate()}
                disabled={quickPaymentMutation.isPending || !paymentMethod}
              >
                {quickPaymentMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4 mr-2" />
                    {customAmount && parseFloat(customAmount) > 0 && parseFloat(customAmount) < totalUnpaid
                      ? `Pagar ${formatKwanza(parseFloat(customAmount))}`
                      : 'Pagar Total'}
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
