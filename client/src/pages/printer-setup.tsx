import { PrinterSettings } from '@/components/PrinterSettings';
import { PrinterStatistics } from '@/components/PrinterStatistics';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Printer, BarChart3 } from 'lucide-react';

export default function PrinterSetup() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Printer className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Configuração de Impressoras</h1>
          <p className="text-muted-foreground">
            Gerencie impressoras térmicas USB conectadas ao sistema
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="gap-1 space-y-0 pb-2">
          <CardTitle>Sobre Impressoras Térmicas</CardTitle>
          <CardDescription>
            Informações importantes sobre o uso de impressoras térmicas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <div>
            <strong className="text-foreground">Requisitos do Sistema:</strong>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Navegador compatível com WebUSB (Chrome, Edge, Opera)</li>
              <li>Impressora térmica USB conectada ao dispositivo</li>
              <li>Conexão HTTPS</li>
            </ul>
          </div>
          
          <div>
            <strong className="text-foreground">Impressoras Compatíveis:</strong>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Epson TM-T20, TM-T88 (ESC/POS)</li>
              <li>Star Micronics TSP100, TSP143</li>
              <li>BIXOLON, Xprinter e outras com suporte ESC/POS</li>
            </ul>
          </div>

          <div>
            <strong className="text-foreground">Tipos de Impressora:</strong>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li><strong>Recibo (Caixa):</strong> Para imprimir recibos de transações financeiras</li>
              <li><strong>Cozinha:</strong> Para imprimir pedidos na cozinha</li>
              <li><strong>Fatura:</strong> Para imprimir faturas de clientes</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="settings" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="settings" className="gap-2">
            <Printer className="h-4 w-4" />
            Configurações
          </TabsTrigger>
          <TabsTrigger value="statistics" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Estatísticas
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="settings" className="mt-6">
          <PrinterSettings />
        </TabsContent>
        
        <TabsContent value="statistics" className="mt-6">
          <PrinterStatistics />
        </TabsContent>
      </Tabs>
    </div>
  );
}
