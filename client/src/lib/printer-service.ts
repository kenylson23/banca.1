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
  endpointNumber?: number;
  serialNumber?: string;
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
    this.loadSavedPrinters();
  }

  private async loadSavedPrinters() {
    if (!('usb' in navigator) || !navigator.usb) return;

    try {
      const devices = await navigator.usb!.getDevices();
      const saved = localStorage.getItem('connected-printers');
      if (!saved) return;

      const savedPrinters: ConnectedPrinter[] = JSON.parse(saved);

      for (const savedPrinter of savedPrinters) {
        // Verificar se autoReconnect está habilitado para este tipo de impressora
        const config = this.getConfig(savedPrinter.type);
        if (config && !config.autoReconnect) {
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
    const printers = Array.from(this.connectedPrinters.values()).map(p => ({
      id: p.id,
      name: p.name,
      type: p.type,
      status: p.status,
      language: p.language,
      codepageMapping: p.codepageMapping,
      endpointNumber: p.endpointNumber,
      serialNumber: p.serialNumber,
    }));
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

  private async sendToPrinter(printer: ConnectedPrinter, data: Uint8Array) {
    if (!printer.device) {
      throw new Error('Impressora não está conectada');
    }

    if (!printer.endpointNumber) {
      // Tentar detectar endpoint se não estiver configurado
      const endpoint = this.detectOutEndpoint(printer.device);
      if (!endpoint) {
        throw new Error('Endpoint de comunicação não configurado. Reconecte a impressora.');
      }
      printer.endpointNumber = endpoint;
      this.savePrinters();
    }

    try {
      const result = await printer.device.transferOut(printer.endpointNumber, data);
      if (result.status !== 'ok') {
        throw new Error(`Falha na transferência: ${result.status}`);
      }
    } catch (error) {
      console.error('Error sending to printer:', error);
      throw new Error('Falha ao enviar dados para impressora. Verifique a conexão.');
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
    await this.sendToPrinter(printer, data);
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
    await this.sendToPrinter(printer, data);
  }
}

export const printerService = new PrinterService();
