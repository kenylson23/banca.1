import ReceiptPrinterEncoder from '@point-of-sale/receipt-printer-encoder';

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
}

export interface PrinterConfig {
  type: PrinterType;
  name: string;
  autoReconnect: boolean;
  paperWidth: number; // em mm (58 ou 80)
}

class PrinterService {
  private connectedPrinters: Map<string, ConnectedPrinter> = new Map();
  private printerConfigs: Map<PrinterType, PrinterConfig> = new Map();
  private listeners: Set<(printers: ConnectedPrinter[]) => void> = new Set();

  constructor() {
    this.loadConfigs();
    this.setupUSBListeners();
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
      };

      this.connectedPrinters.set(printer.id, printer);
      this.notifyListeners();

      return printer;
    } catch (error) {
      console.error('Failed to connect printer:', error);
      throw new Error('Falha ao conectar impressora. Verifique se está conectada e tente novamente.');
    }
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

  private async sendToPrinter(printer: ConnectedPrinter, data: Uint8Array) {
    if (!printer.device) {
      throw new Error('Impressora não está conectada');
    }

    try {
      // Endpoint geralmente é 1 para impressoras térmicas
      const endpointNumber = 1;
      await printer.device.transferOut(endpointNumber, data);
    } catch (error) {
      console.error('Error sending to printer:', error);
      throw new Error('Falha ao enviar dados para impressora');
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
    await this.sendToPrinter(printer, data);
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
    await this.sendToPrinter(printer, data);
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
    await this.sendToPrinter(printer, data);
  }
}

export const printerService = new PrinterService();
