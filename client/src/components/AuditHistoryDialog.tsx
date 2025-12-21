import { useQuery } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { apiRequest } from '@/lib/queryClient';
import { History, ArrowRightLeft, User, Clock, MessageSquare } from 'lucide-react';
import { formatKwanza } from '@/lib/formatters';

interface AuditLog {
  id: string;
  action: string;
  actorName: string;
  sourceGuestName: string | null;
  sourceGuestNumber: number | null;
  targetGuestName: string | null;
  targetGuestNumber: number | null;
  itemDetails: {
    menuItemName: string;
    quantity: number;
    price: string;
  };
  reason: string | null;
  createdAt: string;
}

interface AuditHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessionId: string;
}

export function AuditHistoryDialog({
  open,
  onOpenChange,
  sessionId,
}: AuditHistoryDialogProps) {
  const { data: auditLogs, isLoading } = useQuery<AuditLog[]>({
    queryKey: ['/api/tables/sessions', sessionId, 'audit-logs'],
    queryFn: async () => {
      const response = await apiRequest(`/api/tables/sessions/${sessionId}/audit-logs`);
      return response;
    },
    enabled: open && !!sessionId,
  });

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'item_reassigned':
        return 'Item Movido';
      case 'item_added':
        return 'Item Adicionado';
      case 'item_removed':
        return 'Item Removido';
      case 'quantity_changed':
        return 'Quantidade Alterada';
      default:
        return action;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'item_reassigned':
        return 'bg-blue-500';
      case 'item_added':
        return 'bg-green-500';
      case 'item_removed':
        return 'bg-red-500';
      case 'quantity_changed':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Histórico de Alterações
          </DialogTitle>
          <DialogDescription>
            Registro completo de todas as movimentações de itens nesta mesa
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[500px] pr-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-sm text-muted-foreground">Carregando histórico...</div>
            </div>
          ) : !auditLogs || auditLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <History className="h-12 w-12 text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">
                Nenhuma alteração registrada ainda
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {auditLogs.map((log, index) => (
                <div key={log.id}>
                  <div className="flex gap-4">
                    {/* Timeline Line */}
                    <div className="flex flex-col items-center">
                      <div className={`w-3 h-3 rounded-full ${getActionColor(log.action)} flex-shrink-0`} />
                      {index < auditLogs.length - 1 && (
                        <div className="w-0.5 h-full bg-border mt-2" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 pb-6">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div>
                          <Badge variant="secondary" className="mb-2">
                            {getActionLabel(log.action)}
                          </Badge>
                          <div className="text-sm font-medium">
                            {log.itemDetails.quantity}x {log.itemDetails.menuItemName}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {formatKwanza(log.itemDetails.price)}
                          </div>
                        </div>
                      </div>

                      {log.action === 'item_reassigned' && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                          <span className="font-medium">
                            {log.sourceGuestName || `Cliente ${log.sourceGuestNumber}`}
                          </span>
                          <ArrowRightLeft className="h-3 w-3" />
                          <span className="font-medium">
                            {log.targetGuestName || `Cliente ${log.targetGuestNumber}`}
                          </span>
                        </div>
                      )}

                      {log.reason && (
                        <div className="flex items-start gap-2 mt-2 text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                          <MessageSquare className="h-3 w-3 mt-0.5 flex-shrink-0" />
                          <span>{log.reason}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          <span>{log.actorName}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>
                            {format(new Date(log.createdAt), "dd/MM/yyyy 'às' HH:mm", {
                              locale: ptBR,
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  {index < auditLogs.length - 1 && <Separator className="my-2" />}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
