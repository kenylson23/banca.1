import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle2,
  Printer,
  Download,
  Users,
  FileText,
  X,
  Sparkles,
} from 'lucide-react';
import { formatKwanza } from '@/lib/formatters';
import { PrintGuestBill } from './PrintGuestBill';
import { cn } from '@/lib/utils';

interface TableGuest {
  id: string;
  sessionId: string;
  name: string | null;
  guestNumber: number;
  status: string;
  totalSpent: string;
  joinedAt: Date;
}

interface PaymentData {
  id: string;
  tableId: string;
  sessionId: string;
  amount: string;
  paymentMethod: string;
  notes?: string;
  createdAt: string;
}

interface Table {
  id: string;
  number: string;
  capacity: number;
  status: string;
  currentSessionId: string | null;
}

interface PaymentSuccessDialogProps {
  open: boolean;
  onClose: () => void;
  table: Table;
  payment: PaymentData;
  guests: TableGuest[];
  totalAmount: number;
  onPrintComplete?: () => void;
}

export function PaymentSuccessDialog({
  open,
  onClose,
  table,
  payment,
  guests,
  totalAmount,
  onPrintComplete,
}: PaymentSuccessDialogProps) {
  const [selectedGuest, setSelectedGuest] = useState<string | null>(null);
  const [isPrinting, setIsPrinting] = useState(false);

  const handlePrintComplete = async () => {
    setIsPrinting(true);
    // Simular impressão da fatura completa
    // Aqui você pode adicionar lógica de impressão completa da sessão
    setTimeout(() => {
      setIsPrinting(false);
      onPrintComplete?.();
    }, 1000);
  };

  const handleDownloadPDF = () => {
    // TODO: Implementar download de PDF
    console.log('Download PDF requested');
  };

  const getPaymentMethodLabel = (method: string) => {
    const methods: Record<string, string> = {
      dinheiro: 'Dinheiro',
      multicaixa: 'Multicaixa',
      transferencia: 'Transferência',
      cartao: 'Cartão',
    };
    return methods[method] || method;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-green-500/20 rounded-full blur-xl animate-pulse" />
              <div className="relative bg-gradient-to-br from-green-500 to-emerald-500 p-4 rounded-full">
                <CheckCircle2 className="h-12 w-12 text-white" />
              </div>
            </div>
          </div>
          <DialogTitle className="text-2xl font-bold text-center">
            Pagamento Processado com Sucesso!
          </DialogTitle>
          <DialogDescription className="text-center text-base">
            O pagamento foi registrado e a sessão foi finalizada
          </DialogDescription>
        </DialogHeader>

        {/* Payment Summary */}
        <Card className="border-2 border-green-500/30 bg-gradient-to-br from-green-50/50 to-emerald-50/50 dark:from-green-950/20 dark:to-emerald-950/20">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Mesa:</span>
              <Badge variant="outline" className="text-base font-bold">
                Mesa {table.number}
              </Badge>
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Método de Pagamento:</span>
              <span className="font-semibold">
                {getPaymentMethodLabel(payment.paymentMethod)}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Convidados:</span>
              <span className="font-semibold">{guests.length}</span>
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold">Valor Total:</span>
              <span className="text-3xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                {formatKwanza(totalAmount)}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Action Cards */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Sparkles className="h-4 w-4" />
            <span>O que deseja fazer agora?</span>
          </div>

          {/* Print Complete Invoice */}
          <Card 
            className={cn(
              "cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] border-2",
              "border-blue-200 hover:border-blue-400 dark:border-blue-800 dark:hover:border-blue-600"
            )}
            onClick={handlePrintComplete}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-blue-500/10">
                  <Printer className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="font-bold text-base">Imprimir Fatura Completa</div>
                  <div className="text-sm text-muted-foreground">
                    Fatura com todos os itens da mesa
                  </div>
                </div>
                {isPrinting && (
                  <div className="animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full" />
                )}
              </div>
            </CardContent>
          </Card>

          {/* Print Guest Bills */}
          {guests.length > 0 && (
            <Card 
              className={cn(
                "cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] border-2",
                "border-purple-200 hover:border-purple-400 dark:border-purple-800 dark:hover:border-purple-600"
              )}
            >
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-purple-500/10">
                      <Users className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-base">Imprimir por Convidado</div>
                      <div className="text-sm text-muted-foreground">
                        Fatura individual para cada convidado
                      </div>
                    </div>
                  </div>
                  
                  {/* Guest List */}
                  <div className="ml-16 space-y-2">
                    {guests.map((guest) => (
                      <div
                        key={guest.id}
                        className="flex items-center justify-between p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-xs font-bold text-purple-700">
                            #{guest.guestNumber}
                          </div>
                          <div>
                            <div className="text-sm font-medium">
                              {guest.name || `Convidado ${guest.guestNumber}`}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {formatKwanza(parseFloat(guest.totalSpent))}
                            </div>
                          </div>
                        </div>
                        <PrintGuestBill
                          guest={guest}
                          restaurantId={table.id} // This should come from context
                          variant="ghost"
                          size="sm"
                          showIcon={true}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Download PDF */}
          <Card 
            className={cn(
              "cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] border-2",
              "border-amber-200 hover:border-amber-400 dark:border-amber-800 dark:hover:border-amber-600"
            )}
            onClick={handleDownloadPDF}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-amber-500/10">
                  <Download className="h-6 w-6 text-amber-600" />
                </div>
                <div className="flex-1">
                  <div className="font-bold text-base">Baixar PDF</div>
                  <div className="text-sm text-muted-foreground">
                    Salvar fatura em formato PDF
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* View Details */}
          <Card 
            className={cn(
              "cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] border-2",
              "border-slate-200 hover:border-slate-400 dark:border-slate-800 dark:hover:border-slate-600"
            )}
            onClick={onClose}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-slate-500/10">
                  <FileText className="h-6 w-6 text-slate-600" />
                </div>
                <div className="flex-1">
                  <div className="font-bold text-base">Ver Detalhes da Sessão</div>
                  <div className="text-sm text-muted-foreground">
                    Revisar pedidos e transações
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Close Button */}
        <div className="flex justify-center pt-4">
          <Button
            variant="outline"
            size="lg"
            onClick={onClose}
            className="min-w-[200px]"
          >
            <X className="h-4 w-4 mr-2" />
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
