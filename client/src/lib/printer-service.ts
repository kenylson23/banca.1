import ReceiptPrinterEncoder from '@point-of-sale/receipt-printer-encoder';
import QRCode from 'qrcode';

export type PrinterType = 'receipt' | 'kitchen' | 'invoice';
export type PrinterStatus = 'connected' | 'disconnected' | 'error';

export interface ConnectedPrinter {
  id: string;
  name: string;
  type: PrinterType;
  status: PrinterStatus;
  device?: USBDevice;
  language?: 'esc-pos' | 'star-prnt';
  codepageMapping?: string;
  endpointNumber?: number;
  serialNumber?: string;
}

export interface PrinterConfig {
  type: PrinterType;
  name: string;
  autoReconnect: boolean;
  paperWidth: number; // em mm (58 ou 80)
  copies?: number; // número de cópias
  soundEnabled?: boolean; // som ao imprimir
}

export interface PrintHistory {
  id: string;
  timestamp: string;
  printerType: PrinterType;
  printerName: string;
  documentType: 'order' | 'receipt' | 'invoice' | 'bill' | 'report';
  orderNumber?: string;
  success: boolean;
  error?: string;
}

class PrinterService {
  private connectedPrinters: Map<string, ConnectedPrinter> = new Map();
  private printerConfigs: Map<PrinterType, PrinterConfig> = new Map();
  private listeners: Set<(printers: ConnectedPrinter[]) => void> = new Set();
  private printHistory: PrintHistory[] = [];
  private maxHistorySize = 100;

  constructor() {
    this.loadConfigs();
    this.setupUSBListeners();
    this.loadSavedPrinters();
    this.loadPrintHistory();
  }

  // Carregar histórico de impressões
  private loadPrintHistory() {
    try {
      const saved = localStorage.getItem('print-history');
      if (saved) {
        this.printHistory = JSON.parse(saved);
      }
    } catch (error) {
      console.error('Failed to load print history:', error);
    }
  }

  // Salvar histórico de impressões
  private savePrintHistory() {
    try {
      // Manter apenas as últimas impressões
      if (this.printHistory.length > this.maxHistorySize) {
        this.printHistory = this.printHistory.slice(-this.maxHistorySize);
      }
      localStorage.setItem('print-history', JSON.stringify(this.printHistory));
    } catch (error) {
      console.error('Failed to save print history:', error);
    }
  }

  // Adicionar entrada ao histórico
  private addToHistory(entry: Omit<PrintHistory, 'id' | 'timestamp'>) {
    const historyEntry: PrintHistory = {
      ...entry,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
    };
    this.printHistory.unshift(historyEntry);
    this.savePrintHistory();
  }

  // Tocar som de impressão
  private playPrintSound() {
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBzGJ0fPTgjMGHm7A7+OZWQ0OV6vl8q1bGg1Dn93xu3AeBzqN0vTPfC0HKX3J8diJOQkSY7jo6qJSEwxKouHxtWYdBz6V2fHJdyoFKHzJ8N+MPwkTXbLo7aVUFAo+mtzzwG0dBzCK0fLRfC0HKXzI8N+KPQkTXbPo7KRUFQk+m9zzwG4dBjiL0PHQfS0HJnzH796JPgkSXrLp7KVTFAo+mt3ywm0eBzCK0PHRfC4HJ37H796JPAgRX7Lp7KVUFAo9md3ywW8dBzCK0fHQfC0HJnvH8N6JPQgRXrPo7KVVFAo9m93yv2wdBzCK0PHQfC0HJnrG8N6JPQgSXrPo7KVVFAo9m93yv2wdBzCK0PHQfC0HJ3rG8N6JPAgSXrPo7KVUFAo9m93yw2wdBzCK0PHRfC4HJ3vH796IPQkSXrLo7KVUFAo9m93ywmwdBzCK0PHRfS0HJ3rH8N6IPQkSXrPo7KZVFQo9mt3ywm0dBzCK0PHRfS0HJnrG8N6HOwgQXrPo7KZVFQo9mt3ywW4dBzCJ0PHRfS0HJ3rG8N6JOwgRXrPo7KZVFQo9mt3yv24dBzCK0PHRfS0HJ3rG8N6JOwgRXrPo7KZUFQo9mt3yv20dBzCK0PHRfS0HJ3rG8N6JOwgRXrPo7KZUFQo9mt3ywG4dBzCK0PHRfS0HJ3rH796IPQgRXrPo7KZUFQo9mt3ywG4dBzCK0PHRfS0HJ3rH796IPQgRXrPo7KZUFQo9md3ywG4dBzCK0PHRfS0HJ3rH796IPQgRXrPo7KZUFQo9md3ywG4dBzCK0PHRfS4HJ3rG8N+IPQgQXrLo7KZUFAo9md3yv24dBzCK0PDRfS4HJ3rG8N+IPAgQXrPo7KZUFAk9md3ywG0dBzCK0PHRfS0HJ3rH796IPAgRXrPo7KZVFAo9mtzyv24dBzCJ0PHRfS0HKHrG8N+JPAgRXrPo7KVUFQo9mtzzwG0dBzCK0PHRfS0HKHrG8N+JPQgRXrLo7KVUFQk9mtzywG4dBzCK0PDRfS4HJ3vH796IPQkRXrLo7KVUFQo9mtzywG4dBzCK0PDRfS4HJ3vH796IPQgRXrLo7KVUFQo9mtzywG4dBzCK0PDRfS4HJ3vH796IPQgRXrLo7KVUFQo9mtzywG4dBzCK0PDRfS4HJ3vH796JPQgRXrLo7KVUFQo9mtzywG4dBzCK0PDRfS4HJ3vH796JPQgRXrLo7KVUFQo9mtzywG4dBzCK0PDRfS4HJ3vH796JPQgRXrLo7KVUFQo9mtzywG4dBzCK0PDRfS4HJ3vH796JPQgRXrLo7KVUFQo9mtzywG4dBzCK0PDRfS4HJ3vH796JPQgRXrLo7KVUFQo9');
      audio.volume = 0.3;
      audio.play().catch(() => {}); // Ignorar erros se o navegador bloquear
    } catch (error) {
      // Silenciosamente ignorar erros de áudio
    }
  }

  // Obter histórico de impressões
  public getPrintHistory(limit?: number): PrintHistory[] {
    if (limit) {
      return this.printHistory.slice(0, limit);
    }
    return [...this.printHistory];
  }

  // Limpar histórico
  public clearPrintHistory() {
    this.printHistory = [];
    localStorage.removeItem('print-history');
  }

  // Obter estatísticas de impressões
  public getPrintStatistics() {
    const total = this.printHistory.length;
    const successful = this.printHistory.filter(h => h.success).length;
    const failed = total - successful;
    
    const byType: Record<PrinterType, number> = {
      receipt: 0,
      kitchen: 0,
      invoice: 0,
    };
    
    const byDocument: Record<string, number> = {};
    
    this.printHistory.forEach(h => {
      byType[h.printerType]++;
      byDocument[h.documentType] = (byDocument[h.documentType] || 0) + 1;
    });

    // Impressões por hora (últimas 24h)
    const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentPrints = this.printHistory.filter(h => new Date(h.timestamp) > last24h);
    
    return {
      total,
      successful,
      failed,
      successRate: total > 0 ? (successful / total) * 100 : 0,
      byType,
      byDocument,
      last24Hours: recentPrints.length,
    };
  }

  private async loadSavedPrinters() {
    if (!('usb' in navigator) || !navigator.usb) return;

    try {
      const devices = await navigator.usb!.getDevices();
      const saved = localStorage.getItem('connected-printers');
      if (!saved) return;

      const savedPrinters: ConnectedPrinter[] = JSON.parse(saved);

      for (const savedPrinter of savedPrinters) {
        // Verificar preferência de autoReconnect salva para este dispositivo específico
        const shouldReconnect = (savedPrinter as any).autoReconnect ?? true;
        if (!shouldReconnect) {
          continue; // Pular impressoras que não devem reconectar automaticamente
        }

        const device = devices.find(d => d.serialNumber === savedPrinter.serialNumber);
        if (device) {
          try {
            await this.reconnectDevice(device, savedPrinter);
          } catch (error) {
            console.error('Failed to reconnect printer:', error);
          }
        }
      }
    } catch (error) {
      console.error('Failed to load saved printers:', error);
    }
  }

  private async reconnectDevice(device: USBDevice, savedPrinter: ConnectedPrinter) {
    try {
      if (!device.opened) {
        await device.open();
      }

      if (device.configuration === null) {
        await device.selectConfiguration(1);
      }

      await device.claimInterface(0);

      // Re-detectar endpoint em caso de configuração alterada
      const endpointNumber = this.detectOutEndpoint(device);
      if (!endpointNumber) {
        throw new Error('Não foi possível detectar endpoint de comunicação');
      }

      const printer: ConnectedPrinter = {
        ...savedPrinter,
        device,
        status: 'connected',
        endpointNumber, // Atualizar com endpoint detectado
      };

      this.connectedPrinters.set(printer.id, printer);
      this.savePrinters(); // Salvar endpoint atualizado
      this.notifyListeners();
    } catch (error) {
      console.error('Failed to reconnect device:', error);
      throw error;
    }
  }

  private savePrinters() {
    const printers = Array.from(this.connectedPrinters.values()).map(p => {
      // Obter preferência de autoReconnect da configuração por tipo
      const config = this.getConfig(p.type);
      return {
        id: p.id,
        name: p.name,
        type: p.type,
        status: p.status,
        language: p.language,
        codepageMapping: p.codepageMapping,
        endpointNumber: p.endpointNumber,
        serialNumber: p.serialNumber,
        autoReconnect: config?.autoReconnect ?? true,
      };
    });
    localStorage.setItem('connected-printers', JSON.stringify(printers));
  }

  private loadConfigs() {
    const saved = localStorage.getItem('printer-configs');
    if (saved) {
      try {
        const configs = JSON.parse(saved);
        Object.entries(configs).forEach(([type, config]) => {
          this.printerConfigs.set(type as PrinterType, config as PrinterConfig);
        });
      } catch (error) {
        console.error('Failed to load printer configs:', error);
      }
    }
  }

  private saveConfigs() {
    const configs = Object.fromEntries(this.printerConfigs);
    localStorage.setItem('printer-configs', JSON.stringify(configs));
  }

  private setupUSBListeners() {
    if ('usb' in navigator && navigator.usb) {
      navigator.usb.addEventListener('disconnect', ((event: USBConnectionEvent) => {
        this.handleDisconnect(event.device);
      }) as EventListener);
    }
  }

  private handleDisconnect(device: USBDevice) {
    const entries = Array.from(this.connectedPrinters.entries());
    for (const [id, printer] of entries) {
      if (printer.device === device) {
        this.connectedPrinters.set(id, {
          ...printer,
          status: 'disconnected',
          device: undefined,
        });
        this.notifyListeners();
        break;
      }
    }
  }

  private notifyListeners() {
    const printers = Array.from(this.connectedPrinters.values());
    this.listeners.forEach(listener => listener(printers));
  }

  public subscribe(listener: (printers: ConnectedPrinter[]) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public async connectPrinter(type: PrinterType): Promise<ConnectedPrinter> {
    if (!('usb' in navigator) || !navigator.usb) {
      throw new Error('WebUSB não é suportado neste navegador. Use Chrome, Edge ou Opera.');
    }

    try {
      // Solicitar acesso ao dispositivo USB
      const device = await navigator.usb!.requestDevice({
        filters: [
          { vendorId: 0x04b8 }, // Epson
          { vendorId: 0x0519 }, // Star Micronics
          { vendorId: 0x1504 }, // BIXOLON
          { vendorId: 0x0a5f }, // Zebra
          { vendorId: 0x20d1 }, // Xprinter
        ]
      });

      await device.open();
      
      // Selecionar configuração e interface
      if (device.configuration === null) {
        await device.selectConfiguration(1);
      }
      
      await device.claimInterface(0);

      // Detectar endpoint de saída (OUT)
      const endpointNumber = this.detectOutEndpoint(device);
      if (!endpointNumber) {
        throw new Error('Não foi possível detectar endpoint de comunicação da impressora');
      }

      // Detectar linguagem da impressora (ESC/POS ou Star PRNT)
      const language = this.detectPrinterLanguage(device);
      
      const printer: ConnectedPrinter = {
        id: device.serialNumber || `printer-${Date.now()}`,
        name: device.productName || 'Impressora Térmica',
        type,
        status: 'connected',
        device,
        language,
        codepageMapping: 'epson',
        endpointNumber,
        serialNumber: device.serialNumber,
      };

      this.connectedPrinters.set(printer.id, printer);
      this.savePrinters();
      this.notifyListeners();

      return printer;
    } catch (error) {
      console.error('Failed to connect printer:', error);
      throw new Error('Falha ao conectar impressora. Verifique se está conectada e tente novamente.');
    }
  }

  private detectOutEndpoint(device: USBDevice): number | undefined {
    try {
      if (!device.configuration) return undefined;

      for (const iface of device.configuration.interfaces) {
        const alternate = iface.alternate;
        for (const endpoint of alternate.endpoints) {
          if (endpoint.direction === 'out' && endpoint.type === 'bulk') {
            return endpoint.endpointNumber;
          }
        }
      }
    } catch (error) {
      console.error('Error detecting endpoint:', error);
    }
    return undefined; // Não fazer fallback - falhar claramente
  }

  private detectPrinterLanguage(device: USBDevice): 'esc-pos' | 'star-prnt' {
    // Star Micronics geralmente usa vendorId 0x0519
    if (device.vendorId === 0x0519) {
      return 'star-prnt';
    }
    return 'esc-pos';
  }

  public async disconnectPrinter(printerId: string) {
    const printer = this.connectedPrinters.get(printerId);
    if (printer?.device) {
      try {
        await printer.device.close();
      } catch (error) {
        console.error('Error closing device:', error);
      }
    }
    this.connectedPrinters.delete(printerId);
    this.savePrinters();
    this.notifyListeners();
  }

  public getPrinter(type: PrinterType): ConnectedPrinter | undefined {
    return Array.from(this.connectedPrinters.values()).find(
      p => p.type === type && p.status === 'connected'
    );
  }

  public getAllPrinters(): ConnectedPrinter[] {
    return Array.from(this.connectedPrinters.values());
  }

  public setConfig(type: PrinterType, config: PrinterConfig) {
    this.printerConfigs.set(type, config);
    this.saveConfigs();
  }

  public getConfig(type: PrinterType): PrinterConfig | undefined {
    return this.printerConfigs.get(type);
  }

  private async sendToPrinter(
    printer: ConnectedPrinter, 
    data: Uint8Array, 
    documentType: PrintHistory['documentType'] = 'order',
    orderNumber?: string
  ) {
    if (!printer.device) {
      const error = 'Impressora não está conectada';
      this.addToHistory({
        printerType: printer.type,
        printerName: printer.name,
        documentType,
        orderNumber,
        success: false,
        error,
      });
      throw new Error(error);
    }

    // Verificar e reestabelecer conexão se necessário
    try {
      if (!printer.device.opened) {
        await printer.device.open();
      }

      if (printer.device.configuration === null) {
        await printer.device.selectConfiguration(1);
      }

      // Verificar se interface está claimed
      const isClaimed = printer.device.configuration?.interfaces.some(iface => 
        iface.claimed
      );

      if (!isClaimed) {
        await printer.device.claimInterface(0);
      }
    } catch (error) {
      console.error('Error preparing device:', error);
      const errorMsg = 'Impressora desconectada. Reconecte a impressora.';
      this.addToHistory({
        printerType: printer.type,
        printerName: printer.name,
        documentType,
        orderNumber,
        success: false,
        error: errorMsg,
      });
      throw new Error(errorMsg);
    }

    if (!printer.endpointNumber) {
      // Tentar detectar endpoint se não estiver configurado
      const endpoint = this.detectOutEndpoint(printer.device);
      if (!endpoint) {
        const error = 'Endpoint de comunicação não configurado. Reconecte a impressora.';
        this.addToHistory({
          printerType: printer.type,
          printerName: printer.name,
          documentType,
          orderNumber,
          success: false,
          error,
        });
        throw new Error(error);
      }
      printer.endpointNumber = endpoint;
      this.savePrinters();
    }

    try {
      // Obter configurações da impressora
      const config = this.printerConfigs.get(printer.type);
      const copies = config?.copies || 1;

      // Imprimir o número de cópias configurado
      for (let i = 0; i < copies; i++) {
        const result = await printer.device.transferOut(printer.endpointNumber, data);
        if (result.status !== 'ok') {
          throw new Error(`Falha na transferência: ${result.status}`);
        }
      }

      // Adicionar ao histórico (sucesso)
      this.addToHistory({
        printerType: printer.type,
        printerName: printer.name,
        documentType,
        orderNumber,
        success: true,
      });

      // Tocar som se habilitado
      if (config?.soundEnabled !== false) {
        this.playPrintSound();
      }
    } catch (error) {
      console.error('Error sending to printer:', error);
      const errorMsg = 'Falha ao enviar dados para impressora. Verifique a conexão.';
      this.addToHistory({
        printerType: printer.type,
        printerName: printer.name,
        documentType,
        orderNumber,
        success: false,
        error: errorMsg,
      });
      throw new Error(errorMsg);
    }
  }

  public async printReceipt(
    type: PrinterType,
    content: {
      title?: string;
      items: Array<{ name: string; quantity: number; price: string }>;
      subtotal?: string;
      discount?: string;
      total: string;
      footer?: string;
    }
  ) {
    const printer = this.getPrinter(type);
    if (!printer) {
      throw new Error(`Nenhuma impressora ${type} conectada`);
    }

    const config = this.getConfig(type);
    const paperWidth = config?.paperWidth || 80;

    const encoder = new ReceiptPrinterEncoder({
      language: printer.language || 'esc-pos',
      codepageMapping: printer.codepageMapping || 'epson',
      columns: paperWidth === 80 ? 48 : 32,
    });

    encoder.initialize();

    // Cabeçalho
    if (content.title) {
      encoder.align('center').bold(true).size('normal').line(content.title).bold(false).newline();
    }

    encoder.align('left').line('='.repeat(paperWidth === 80 ? 48 : 32)).newline();

    // Itens
    content.items.forEach(item => {
      const itemLine = `${item.quantity}x ${item.name}`;
      const spaces = (paperWidth === 80 ? 48 : 32) - itemLine.length - item.price.length;
      encoder.line(itemLine + ' '.repeat(Math.max(spaces, 1)) + item.price);
    });

    encoder.newline().line('='.repeat(paperWidth === 80 ? 48 : 32)).newline();

    // Totais
    if (content.subtotal) {
      const subtotalLine = 'Subtotal:';
      const spaces = (paperWidth === 80 ? 48 : 32) - subtotalLine.length - content.subtotal.length;
      encoder.line(subtotalLine + ' '.repeat(Math.max(spaces, 1)) + content.subtotal);
    }

    if (content.discount) {
      const discountLine = 'Desconto:';
      const spaces = (paperWidth === 80 ? 48 : 32) - discountLine.length - content.discount.length;
      encoder.line(discountLine + ' '.repeat(Math.max(spaces, 1)) + content.discount);
    }

    const totalLine = 'TOTAL:';
    const spaces = (paperWidth === 80 ? 48 : 32) - totalLine.length - content.total.length;
    encoder.bold(true).size('normal').line(totalLine + ' '.repeat(Math.max(spaces, 1)) + content.total).bold(false);

    encoder.newline();

    // Rodapé
    if (content.footer) {
      encoder.align('center').line(content.footer);
    }

    // Cortar papel
    encoder.newline().newline().newline().cut('partial');

    const data = encoder.encode();
    await this.sendToPrinter(printer, data, 'receipt');
  }

  public async printText(type: PrinterType, text: string, options?: { 
    align?: 'left' | 'center' | 'right';
    bold?: boolean;
    size?: 'small' | 'normal' | 'large';
    cut?: boolean;
  }) {
    const printer = this.getPrinter(type);
    if (!printer) {
      throw new Error(`Nenhuma impressora ${type} conectada`);
    }

    const encoder = new ReceiptPrinterEncoder({
      language: printer.language || 'esc-pos',
      codepageMapping: printer.codepageMapping || 'epson',
    });

    encoder.initialize();

    if (options?.align) {
      encoder.align(options.align);
    }

    if (options?.bold) {
      encoder.bold(true);
    }

    if (options?.size) {
      encoder.size(options.size);
    }

    encoder.text(text).newline();

    if (options?.cut) {
      encoder.newline().newline().cut('partial');
    }

    const data = encoder.encode();
    await this.sendToPrinter(printer, data, 'receipt');
  }

  public async testPrint(printerId: string) {
    const printer = this.connectedPrinters.get(printerId);
    if (!printer?.device) {
      throw new Error('Impressora não encontrada');
    }

    const encoder = new ReceiptPrinterEncoder({
      language: printer.language || 'esc-pos',
      codepageMapping: printer.codepageMapping || 'epson',
    });

    encoder
      .initialize()
      .align('center')
      .bold(true)
      .line('TESTE DE IMPRESSÃO')
      .bold(false)
      .newline()
      .line('Impressora: ' + printer.name)
      .line('Tipo: ' + printer.type)
      .line('Status: Conectada')
      .newline()
      .line('Data: ' + new Date().toLocaleString('pt-AO'))
      .newline()
      .newline()
      .line('✓ Impressora funcionando corretamente')
      .newline()
      .newline()
      .newline()
      .cut('partial');

    const data = encoder.encode();
    await this.sendToPrinter(printer, data, 'order');
  }

  public async printInvoice(
    type: PrinterType,
    content: {
      invoiceNumber: string;
      date: string;
      customerName?: string;
      customerPhone?: string;
      items: Array<{ name: string; quantity: number; price: string; total: string }>;
      subtotal: string;
      discount?: string;
      total: string;
      paymentInfo?: string;
      notes?: string;
    }
  ) {
    const printer = this.getPrinter(type);
    if (!printer) {
      throw new Error(`Nenhuma impressora ${type} conectada`);
    }

    const config = this.getConfig(type);
    const paperWidth = config?.paperWidth || 80;

    const encoder = new ReceiptPrinterEncoder({
      language: printer.language || 'esc-pos',
      codepageMapping: printer.codepageMapping || 'epson',
      columns: paperWidth === 80 ? 48 : 32,
    });

    encoder.initialize();

    // Cabeçalho
    encoder.align('center').bold(true).line('FATURA').bold(false);
    encoder.line(`Nº ${content.invoiceNumber}`);
    encoder.line(content.date).newline();

    // Dados do cliente
    if (content.customerName) {
      encoder.align('left').bold(true).line('Cliente:').bold(false);
      encoder.line(content.customerName);
      if (content.customerPhone) {
        encoder.line(`Tel: ${content.customerPhone}`);
      }
      encoder.newline();
    }

    encoder.line('='.repeat(paperWidth === 80 ? 48 : 32)).newline();

    // Itens
    content.items.forEach(item => {
      encoder.line(`${item.quantity}x ${item.name}`);
      const priceLine = `  ${item.price} x ${item.quantity}`;
      const spaces = (paperWidth === 80 ? 48 : 32) - priceLine.length - item.total.length;
      encoder.line(priceLine + ' '.repeat(Math.max(spaces, 1)) + item.total);
    });

    encoder.newline().line('='.repeat(paperWidth === 80 ? 48 : 32)).newline();

    // Totais
    const subtotalLine = 'Subtotal:';
    let spaces = (paperWidth === 80 ? 48 : 32) - subtotalLine.length - content.subtotal.length;
    encoder.line(subtotalLine + ' '.repeat(Math.max(spaces, 1)) + content.subtotal);

    if (content.discount) {
      const discountLine = 'Desconto:';
      spaces = (paperWidth === 80 ? 48 : 32) - discountLine.length - content.discount.length;
      encoder.line(discountLine + ' '.repeat(Math.max(spaces, 1)) + content.discount);
    }

    const totalLine = 'TOTAL:';
    spaces = (paperWidth === 80 ? 48 : 32) - totalLine.length - content.total.length;
    encoder.bold(true).line(totalLine + ' '.repeat(Math.max(spaces, 1)) + content.total).bold(false);

    encoder.newline();

    // Informações de pagamento
    if (content.paymentInfo) {
      encoder.line('Pagamento: ' + content.paymentInfo).newline();
    }

    // Notas
    if (content.notes) {
      encoder.line('Obs: ' + content.notes).newline();
    }

    // Rodapé
    encoder.align('center').line('Obrigado pela preferência!').newline();
    encoder.line('Documento sem valor fiscal');

    // Cortar papel
    encoder.newline().newline().newline().cut('partial');

    const data = encoder.encode();
    await this.sendToPrinter(printer, data, 'invoice', content.invoiceNumber);
  }

  public async printGuestBill(
    type: PrinterType,
    content: {
      restaurantName: string;
      restaurantAddress?: string;
      restaurantPhone?: string;
      restaurantNIF?: string;
      restaurantLogoUrl?: string;
      tableName: string;
      guestName: string;  // Este campo vem mapeado do nome do guest
      guestNumber: number;
      entryTime: string;
      items: Array<{ name: string; quantity: number; price: string; total: string }>;
      subtotal?: string;
      serviceCharge?: string;
      discount?: string;
      total: string;
      paymentMethod?: string;
      isPaid: boolean;
      orderCount: number;
      documentId: string;
      timestamp: string;
    }
  ) {
    const printer = this.getPrinter(type);
    if (!printer) {
      throw new Error(`Nenhuma impressora ${type} conectada`);
    }

    const config = this.getConfig(type);
    const paperWidth = config?.paperWidth || 80;
    const columns = paperWidth === 80 ? 48 : 32;

    const encoder = new ReceiptPrinterEncoder({
      language: printer.language || 'esc-pos',
      codepageMapping: printer.codepageMapping || 'epson',
      columns,
    });

    encoder.initialize();

    // ============ CABEÇALHO COM LOGO/BRANDING ============
    encoder.align('center');
    
    // Logo do restaurante (se disponível)
    if (content.restaurantLogoUrl) {
      try {
        // Carregar imagem do logo
        const response = await fetch(content.restaurantLogoUrl);
        const blob = await response.blob();
        
        // Converter para base64
        const reader = new FileReader();
        const imageDataUrl = await new Promise<string>((resolve, reject) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
        
        // Adicionar logo ao recibo
        encoder.image(imageDataUrl, 200, 200, 'atkinson');
        encoder.newline();
      } catch (error) {
        console.error('Erro ao carregar logo:', error);
        // Continuar sem logo se houver erro
      }
    }
    
    // Nome do restaurante em destaque
    encoder.bold(true).size('normal');
    encoder.line(content.restaurantName.toUpperCase());
    encoder.bold(false).size('normal');
    
    // Informações do restaurante
    if (content.restaurantAddress) {
      encoder.line(content.restaurantAddress);
    }
    if (content.restaurantPhone) {
      encoder.line(`Tel: ${content.restaurantPhone}`);
    }
    if (content.restaurantNIF) {
      encoder.line(`NIF: ${content.restaurantNIF}`);
    }
    
    encoder.newline();
    
    // Tipo de documento
    encoder.bold(true).line('*** CONTA INDIVIDUAL ***').bold(false);
    encoder.newline();

    // ============ INFORMAÇÕES DA CONTA ============
    encoder.align('left');
    encoder.line('='.repeat(columns)).newline();
    
    // Informações da mesa e cliente
    encoder.bold(true).line('INFORMACOES DA CONTA').bold(false);
    encoder.line(`Mesa: ${content.tableName}`);
    encoder.line(`Cliente: ${content.guestName}`);
    encoder.line(`Numero: #${content.guestNumber}`);
    encoder.line(`Entrada: ${content.entryTime}`);
    encoder.line(`Pedidos: ${content.orderCount}`);
    
    encoder.newline().line('='.repeat(columns)).newline();

    // ============ ITENS CONSUMIDOS ============
    encoder.bold(true).line('ITENS CONSUMIDOS').bold(false).newline();
    
    // Cabeçalho da tabela
    encoder.line('Item                      Qtd  Valor');
    encoder.line('-'.repeat(columns));
    
    // Lista de itens
    content.items.forEach(item => {
      // Nome do item (primeira linha)
      const itemName = item.name.length > 25 ? item.name.substring(0, 22) + '...' : item.name;
      encoder.line(itemName);
      
      // Quantidade, preço unitário e total (segunda linha)
      const qtyPriceTotal = `  ${item.quantity}x ${item.price}`;
      const spaces = columns - qtyPriceTotal.length - item.total.length;
      encoder.line(qtyPriceTotal + ' '.repeat(Math.max(spaces, 1)) + item.total);
    });
    
    encoder.newline().line('='.repeat(columns)).newline();

    // ============ TOTAIS ============
    encoder.bold(true).line('RESUMO DO PAGAMENTO').bold(false).newline();
    
    // Subtotal
    if (content.subtotal) {
      const subtotalLine = 'Subtotal:';
      const spaces = columns - subtotalLine.length - content.subtotal.length;
      encoder.line(subtotalLine + ' '.repeat(Math.max(spaces, 1)) + content.subtotal);
    }
    
    // Taxa de serviço
    if (content.serviceCharge) {
      const serviceLine = 'Taxa Servico:';
      const spaces = columns - serviceLine.length - content.serviceCharge.length;
      encoder.line(serviceLine + ' '.repeat(Math.max(spaces, 1)) + content.serviceCharge);
    }
    
    // Desconto
    if (content.discount) {
      const discountLine = 'Desconto:';
      const spaces = columns - discountLine.length - content.discount.length;
      encoder.line(discountLine + ' '.repeat(Math.max(spaces, 1)) + content.discount);
    }
    
    encoder.line('-'.repeat(columns));
    
    // Total
    const totalLine = 'TOTAL A PAGAR:';
    const spaces = columns - totalLine.length - content.total.length;
    encoder.bold(true).size('normal');
    encoder.line(totalLine + ' '.repeat(Math.max(spaces, 1)) + content.total);
    encoder.bold(false).size('normal');
    
    encoder.newline().line('='.repeat(columns)).newline();

    // ============ INFORMAÇÕES DE PAGAMENTO ============
    if (content.paymentMethod) {
      encoder.bold(true).line('FORMA DE PAGAMENTO').bold(false);
      encoder.line(content.paymentMethod.toUpperCase());
      encoder.newline();
    }
    
    // Status de pagamento
    encoder.align('center');
    if (content.isPaid) {
      encoder.bold(true).line('*** PAGO ***').bold(false);
    } else {
      encoder.bold(true).line('*** PENDENTE ***').bold(false);
    }
    encoder.newline();

    // ============ QR CODE / CÓDIGO DE RASTREAMENTO ============
    encoder.align('center');
    
    // Gerar URL de rastreamento
    const trackingUrl = `${window.location.origin}/track-order?id=${content.documentId}`;
    
    try {
      // Gerar QR Code como imagem
      const qrCodeDataUrl = await QRCode.toDataURL(trackingUrl, {
        width: 200,
        margin: 1,
        errorCorrectionLevel: 'M',
      });
      
      // Converter data URL para array de bytes
      const base64Data = qrCodeDataUrl.split(',')[1];
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      // Adicionar QR Code ao recibo (suportado por impressoras ESC/POS)
      encoder.qrcode(trackingUrl, 1, 8, 'h');
      encoder.newline();
    } catch (error) {
      console.error('Erro ao gerar QR Code:', error);
      // Se falhar, apenas mostrar o ID
    }
    
    encoder.line(`Doc ID: ${content.documentId}`);
    encoder.line('Escaneie para rastrear');
    encoder.newline();

    // ============ RODAPÉ ============
    encoder.line('-'.repeat(columns));
    encoder.line('Documento sem valor fiscal');
    encoder.line(content.timestamp);
    encoder.newline();
    
    encoder.bold(true).line('OBRIGADO PELA VISITA!').bold(false);
    encoder.line('Volte sempre!');

    // ============ CORTE ============
    encoder.newline().newline().newline().cut('partial');

    const data = encoder.encode();
    await this.sendToPrinter(printer, data, 'bill', content.documentId);
  }

  public async printFinancialReport(
    type: PrinterType,
    content: {
      title: string;
      period: string;
      summary: Array<{ label: string; value: string; highlight?: boolean }>;
      transactions: Array<{
        date: string;
        type: string;
        description: string;
        amount: string;
      }>;
      footer?: string;
    }
  ) {
    const printer = this.getPrinter(type);
    if (!printer) {
      throw new Error(`Nenhuma impressora ${type} conectada`);
    }

    // Validar dados de entrada
    if (!content.summary || !Array.isArray(content.summary)) {
      throw new Error('Dados de resumo inválidos');
    }
    if (!content.transactions || !Array.isArray(content.transactions)) {
      throw new Error('Dados de transações inválidos');
    }

    const config = this.getConfig(type);
    const paperWidth = config?.paperWidth || 80;

    const encoder = new ReceiptPrinterEncoder({
      language: printer.language || 'esc-pos',
      codepageMapping: printer.codepageMapping || 'epson',
      columns: paperWidth === 80 ? 48 : 32,
    });

    encoder.initialize();

    // Cabeçalho
    encoder.align('center').bold(true).line(content.title).bold(false);
    encoder.line(content.period).newline();

    encoder.align('left').line('='.repeat(paperWidth === 80 ? 48 : 32)).newline();

    // Resumo
    if (content.summary.length > 0) {
      encoder.bold(true).line('RESUMO').bold(false).newline();
      content.summary.forEach(item => {
        const spaces = (paperWidth === 80 ? 48 : 32) - item.label.length - item.value.length;
        if (item.highlight) {
          encoder.bold(true);
        }
        encoder.line(item.label + ' '.repeat(Math.max(spaces, 1)) + item.value);
        if (item.highlight) {
          encoder.bold(false);
        }
      });
      encoder.newline().line('='.repeat(paperWidth === 80 ? 48 : 32)).newline();
    }

    // Transações
    if (content.transactions.length > 0) {
      encoder.bold(true).line('LANÇAMENTOS').bold(false).newline();
      content.transactions.forEach(tx => {
        encoder.line(`${tx.date} - ${tx.type}`);
        encoder.line(`  ${tx.description}`);
        encoder.align('right').line(tx.amount).align('left');
        encoder.newline();
      });
    }

    encoder.line('='.repeat(paperWidth === 80 ? 48 : 32)).newline();

    // Rodapé
    if (content.footer) {
      encoder.align('center').line(content.footer);
    }

    encoder.newline().line(new Date().toLocaleString('pt-AO'));

    // Cortar papel
    encoder.newline().newline().newline().cut('partial');

    const data = encoder.encode();
    await this.sendToPrinter(printer, data, 'report');
  }

  public async printKitchenOrder(
    type: PrinterType,
    content: {
      orderNumber: string;
      orderType: string;
      customerName?: string;
      tableNumber?: number;
      items: Array<{
        name: string;
        quantity: number;
        selectedOptions?: Array<{ optionName: string; quantity: number }>;
      }>;
      notes?: string;
      createdAt: string;
    }
  ) {
    const printer = this.getPrinter(type);
    if (!printer) {
      throw new Error(`Nenhuma impressora ${type} conectada`);
    }

    const config = this.getConfig(type);
    const paperWidth = config?.paperWidth || 80;

    const encoder = new ReceiptPrinterEncoder({
      language: printer.language || 'esc-pos',
      codepageMapping: printer.codepageMapping || 'epson',
      columns: paperWidth === 80 ? 48 : 32,
    });

    encoder.initialize();

    // Cabeçalho
    encoder.align('center').bold(true).size('normal').line('*** COZINHA ***').bold(false).size('normal');
    encoder.line(`Pedido #${content.orderNumber}`).newline();

    // Tipo e informações
    encoder.align('left');
    encoder.line(`Tipo: ${content.orderType.toUpperCase()}`);
    if (content.customerName) {
      encoder.line(`Cliente: ${content.customerName}`);
    }
    if (content.tableNumber) {
      encoder.line(`Mesa: ${content.tableNumber}`);
    }
    encoder.line(`Hora: ${new Date(content.createdAt).toLocaleTimeString('pt-AO')}`);
    encoder.newline().line('='.repeat(paperWidth === 80 ? 48 : 32)).newline();

    // Itens
    encoder.bold(true).line('ITENS:').bold(false).newline();
    content.items.forEach(item => {
      encoder.bold(true).line(`${item.quantity}x ${item.name}`).bold(false);
      
      // Opções selecionadas
      if (item.selectedOptions && item.selectedOptions.length > 0) {
        item.selectedOptions.forEach(opt => {
          encoder.line(`  + ${opt.optionName} ${opt.quantity > 1 ? `(${opt.quantity}x)` : ''}`);
        });
      }
      encoder.newline();
    });

    // Observações
    if (content.notes) {
      encoder.line('='.repeat(paperWidth === 80 ? 48 : 32));
      encoder.bold(true).line('OBSERVAÇÕES:').bold(false);
      encoder.line(content.notes);
      encoder.newline();
    }

    encoder.line('='.repeat(paperWidth === 80 ? 48 : 32)).newline();
    encoder.align('center').line(new Date().toLocaleString('pt-AO'));

    // Cortar papel
    encoder.newline().newline().newline().cut('partial');

    const data = encoder.encode();
    await this.sendToPrinter(printer, data, 'order', content.orderNumber);
  }
}

export const printerService = new PrinterService();
