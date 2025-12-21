import { useState, useEffect } from 'react';
import { usePrinter } from '@/hooks/usePrinter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Printer, Trash2, TestTube, Plus, CheckCircle, XCircle, AlertCircle, Settings2 } from 'lucide-react';
import { type PrinterType } from '@/lib/printer-service';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

const printerTypeLabels: Record<PrinterType, string> = {
  receipt: 'Recibo (Caixa)',
  kitchen: 'Cozinha',
  invoice: 'Fatura',
};

interface PrinterConfig {
  id: string;
  printerType: PrinterType;
  printerName: string;
  paperWidth: number;
  marginLeft: number;
  marginRight: number;
  marginTop: number;
  marginBottom: number;
  autoPrint: number;
  copies: number;
  soundEnabled: number;
  autoReconnect: number;
  isActive: number;
  lastConnected?: string;
}

export function PrinterSettings() {
  const { printers, connectPrinter, disconnectPrinter, testPrint } = usePrinter();
  const [selectedType, setSelectedType] = useState<PrinterType>('receipt');
  const [connecting, setConnecting] = useState(false);
  const [printerToRemove, setPrinterToRemove] = useState<string | null>(null);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [editingConfig, setEditingConfig] = useState<string | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch printer configurations from API
  const { data: configs = [], isLoading } = useQuery<PrinterConfig[]>({
    queryKey: ['printer-configurations'],
    queryFn: async () => {
      const res = await fetch('/api/printer-configurations', {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch configurations');
      return res.json();
    },
  });

  // Create printer configuration
  const createConfigMutation = useMutation({
    mutationFn: async (config: Partial<PrinterConfig>) => {
      const res = await fetch('/api/printer-configurations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(config),
      });
      if (!res.ok) throw new Error('Failed to create configuration');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['printer-configurations'] });
      toast({
        title: 'Configuração salva',
        description: 'Configuração da impressora salva com sucesso',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao salvar',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Update printer configuration
  const updateConfigMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<PrinterConfig> }) => {
      const res = await fetch(`/api/printer-configurations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update configuration');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['printer-configurations'] });
      setEditingConfig(null);
      toast({
        title: 'Atualizado',
        description: 'Configuração atualizada com sucesso',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao atualizar',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Delete printer configuration
  const deleteConfigMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/printer-configurations/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to delete configuration');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['printer-configurations'] });
      toast({
        title: 'Removido',
        description: 'Configuração removida com sucesso',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao remover',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleConnect = async () => {
    try {
      setConnecting(true);
      const printer = await connectPrinter(selectedType);
      
      // Save configuration to backend
      await createConfigMutation.mutateAsync({
        printerType: selectedType,
        printerName: printer.name,
        paperWidth: 80,
        marginLeft: 0,
        marginRight: 0,
        marginTop: 0,
        marginBottom: 0,
        autoPrint: 0,
        copies: 1,
        soundEnabled: 1,
        autoReconnect: 1,
        isActive: 1,
      });
    } catch (error) {
      console.error('Connection error:', error);
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async (printerId: string) => {
    await disconnectPrinter(printerId);
    setPrinterToRemove(null);
    
    // Find config and delete from backend
    const config = configs.find(c => c.printerName === printers.find(p => p.id === printerId)?.name);
    if (config) {
      await deleteConfigMutation.mutateAsync(config.id);
    }
  };

  const handleUpdateConfig = async (configId: string, updates: Partial<PrinterConfig>) => {
    await updateConfigMutation.mutateAsync({ id: configId, data: updates });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-4 w-4" />;
      case 'error':
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Configurações de Impressoras</CardTitle>
          <CardDescription>Carregando configurações...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Configurações de Impressoras</CardTitle>
          <CardDescription>
            Gerencie suas impressoras conectadas. As configurações são sincronizadas entre dispositivos.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Add Printer Section */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Select value={selectedType} onValueChange={(value) => setSelectedType(value as PrinterType)}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="receipt">{printerTypeLabels.receipt}</SelectItem>
                <SelectItem value="kitchen">{printerTypeLabels.kitchen}</SelectItem>
                <SelectItem value="invoice">{printerTypeLabels.invoice}</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              onClick={handleConnect} 
              disabled={connecting}
              className="w-full sm:w-auto"
            >
              <Plus className="h-4 w-4 mr-2" />
              {connecting ? 'Conectando...' : 'Adicionar Impressora'}
            </Button>
          </div>

          <Separator />

          {/* Connected Printers List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Impressoras Conectadas</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
              >
                <Settings2 className="h-4 w-4 mr-2" />
                {showAdvancedSettings ? 'Ocultar' : 'Mostrar'} Avançado
              </Button>
            </div>
            
            {printers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Printer className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma impressora conectada</p>
                <p className="text-sm">Clique em "Adicionar Impressora" para começar</p>
              </div>
            ) : (
              <div className="space-y-4">
                {printers.map((printer) => {
                  const config = configs.find(c => c.printerName === printer.name);
                  const isEditing = editingConfig === printer.id;
                  
                  return (
                    <Card key={printer.id} className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <div className={`p-2 rounded-lg ${getStatusColor(printer.status)} bg-opacity-20`}>
                            <Printer className="h-5 w-5" />
                          </div>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{printer.name}</h4>
                              <Badge variant="outline" className="text-xs">
                                {printerTypeLabels[printer.type]}
                              </Badge>
                              <div className="flex items-center gap-1">
                                {getStatusIcon(printer.status)}
                                <span className="text-xs text-muted-foreground capitalize">
                                  {printer.status}
                                </span>
                              </div>
                            </div>
                            {printer.serialNumber && (
                              <p className="text-sm text-muted-foreground">
                                Serial: {printer.serialNumber}
                              </p>
                            )}

                            {/* Advanced Settings */}
                            {showAdvancedSettings && config && (
                              <div className="mt-4 space-y-3 p-4 bg-muted/50 rounded-lg">
                                <h5 className="font-medium text-sm">Configurações Avançadas</h5>
                                
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <Label className="text-xs">Largura do Papel</Label>
                                    <Select
                                      value={config.paperWidth.toString()}
                                      onValueChange={(value) => handleUpdateConfig(config.id, { paperWidth: parseInt(value) })}
                                      disabled={updateConfigMutation.isPending}
                                    >
                                      <SelectTrigger className="h-8">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="58">58mm</SelectItem>
                                        <SelectItem value="80">80mm</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>

                                  <div>
                                    <Label className="text-xs">Número de Cópias</Label>
                                    <Input
                                      type="number"
                                      min="1"
                                      max="5"
                                      value={config.copies}
                                      onChange={(e) => handleUpdateConfig(config.id, { copies: parseInt(e.target.value) })}
                                      className="h-8"
                                      disabled={updateConfigMutation.isPending}
                                    />
                                  </div>
                                </div>

                                <div className="grid grid-cols-4 gap-2">
                                  {(['marginLeft', 'marginRight', 'marginTop', 'marginBottom'] as const).map((margin) => (
                                    <div key={margin}>
                                      <Label className="text-xs capitalize">
                                        {margin.replace('margin', '')}
                                      </Label>
                                      <Input
                                        type="number"
                                        min="0"
                                        max="50"
                                        value={config[margin]}
                                        onChange={(e) => handleUpdateConfig(config.id, { [margin]: parseInt(e.target.value) })}
                                        className="h-8"
                                        disabled={updateConfigMutation.isPending}
                                      />
                                    </div>
                                  ))}
                                </div>

                                <div className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <Label className="text-sm">Impressão Automática</Label>
                                    <Switch
                                      checked={config.autoPrint === 1}
                                      onCheckedChange={(checked) => handleUpdateConfig(config.id, { autoPrint: checked ? 1 : 0 })}
                                      disabled={updateConfigMutation.isPending}
                                    />
                                  </div>
                                  <p className="text-xs text-muted-foreground">
                                    Imprimir automaticamente novos pedidos na cozinha
                                  </p>
                                </div>

                                <div className="flex items-center justify-between">
                                  <Label className="text-sm">Som ao Imprimir</Label>
                                  <Switch
                                    checked={config.soundEnabled === 1}
                                    onCheckedChange={(checked) => handleUpdateConfig(config.id, { soundEnabled: checked ? 1 : 0 })}
                                    disabled={updateConfigMutation.isPending}
                                  />
                                </div>

                                <div className="flex items-center justify-between">
                                  <Label className="text-sm">Reconexão Automática</Label>
                                  <Switch
                                    checked={config.autoReconnect === 1}
                                    onCheckedChange={(checked) => handleUpdateConfig(config.id, { autoReconnect: checked ? 1 : 0 })}
                                    disabled={updateConfigMutation.isPending}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => testPrint(printer.id)}
                          >
                            <TestTube className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setPrinterToRemove(printer.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!printerToRemove} onOpenChange={(open) => !open && setPrinterToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover Impressora?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação removerá a impressora e suas configurações. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => printerToRemove && handleDisconnect(printerToRemove)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
