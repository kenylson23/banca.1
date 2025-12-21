import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { printerService, type PrintHistory } from '@/lib/printer-service';
import { Printer, TrendingUp, AlertCircle, CheckCircle, Trash2, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function PrinterStatistics() {
  const [history, setHistory] = useState<PrintHistory[]>([]);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setHistory(printerService.getPrintHistory(50));
    setStats(printerService.getPrintStatistics());
  };

  const handleClearHistory = () => {
    if (confirm('Tem certeza que deseja limpar todo o histórico de impressões?')) {
      printerService.clearPrintHistory();
      loadData();
    }
  };

  const getDocumentTypeLabel = (type: PrintHistory['documentType']) => {
    const labels = {
      order: 'Pedido',
      receipt: 'Recibo',
      invoice: 'Fatura',
      bill: 'Conta',
      report: 'Relatório',
    };
    return labels[type] || type;
  };

  const getPrinterTypeLabel = (type: string) => {
    const labels = {
      receipt: 'Caixa',
      kitchen: 'Cozinha',
      invoice: 'Fatura',
    };
    return labels[type as keyof typeof labels] || type;
  };

  return (
    <div className="space-y-6">
      {/* Estatísticas Gerais */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Impressões</CardTitle>
              <Printer className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">
                {stats.last24Hours} nas últimas 24h
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Sucesso</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.successRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                {stats.successful} sucesso, {stats.failed} falhas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cozinha</CardTitle>
              <Badge variant="outline">{stats.byType.kitchen}</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.byType.kitchen}</div>
              <p className="text-xs text-muted-foreground">
                Impressões na cozinha
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Caixa</CardTitle>
              <Badge variant="outline">{stats.byType.receipt}</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.byType.receipt}</div>
              <p className="text-xs text-muted-foreground">
                Impressões no caixa
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Histórico de Impressões */}
      <Card>
        <CardHeader className="gap-1 space-y-0 pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Histórico de Impressões</CardTitle>
              <CardDescription>
                Últimas {history.length} impressões realizadas
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearHistory}
              disabled={history.length === 0}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Limpar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Printer className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
              <p className="text-muted-foreground">Nenhuma impressão registrada ainda</p>
            </div>
          ) : (
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-3">
                {history.map((item) => (
                  <div key={item.id} className="flex items-start gap-3 p-3 border rounded-lg">
                    <div className={`mt-1 ${item.success ? 'text-green-500' : 'text-red-500'}`}>
                      {item.success ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        <AlertCircle className="h-5 w-5" />
                      )}
                    </div>
                    
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {getDocumentTypeLabel(item.documentType)}
                        </Badge>
                        <Badge variant="secondary">
                          {getPrinterTypeLabel(item.printerType)}
                        </Badge>
                        {item.orderNumber && (
                          <span className="text-sm text-muted-foreground font-mono">
                            #{item.orderNumber}
                          </span>
                        )}
                      </div>
                      
                      <p className="text-sm font-medium">{item.printerName}</p>
                      
                      {item.error && (
                        <p className="text-sm text-red-500">{item.error}</p>
                      )}
                      
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(new Date(item.timestamp), { 
                          addSuffix: true,
                          locale: ptBR 
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
