/**
 * Diálogo para exibir QR Code da mesa
 * Permite clientes fazerem pedidos pelo celular
 */

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Share2, Printer, Copy, CheckCircle2, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import QRCode from 'qrcode';

interface QRCodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tableId: string;
  tableNumber: string;
  restaurantId?: string;
  sessionPin?: string | null;
}

export function QRCodeDialog({
  open,
  onOpenChange,
  tableId,
  tableNumber,
  restaurantId,
  sessionPin,
}: QRCodeDialogProps) {
  const [qrCodeSvg, setQrCodeSvg] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  // Gerar URL pública do menu
  // 🔧 FIX: Sempre usar formato seguro com restaurantId para evitar conflitos multi-restaurante
  const publicMenuUrl = restaurantId
    ? `${window.location.origin}/mesa/${encodeURIComponent(tableNumber)}?r=${encodeURIComponent(restaurantId)}`
    : `${window.location.origin}/mesa/${encodeURIComponent(tableNumber)}`;

  // Gerar QR Code como SVG vetorial com correção de erros alta
  useEffect(() => {
    if (open && tableId) {
      QRCode.toString(publicMenuUrl, {
        type: 'svg',
        width: 360,
        margin: 2,
        errorCorrectionLevel: 'M',
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      })
        .then(setQrCodeSvg)
        .catch((error) => {
          console.error('Error generating QR code:', error);
          toast({
            title: 'Erro ao gerar QR Code',
            description: 'Não foi possível gerar o código QR',
            variant: 'destructive',
          });
        });
    }
  }, [open, tableId, publicMenuUrl, toast]);

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(publicMenuUrl);
      setCopied(true);
      toast({
        title: 'Link copiado!',
        description: 'O link foi copiado para a área de transferência',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: 'Erro ao copiar',
        description: 'Não foi possível copiar o link',
        variant: 'destructive',
      });
    }
  };

  const handleDownload = () => {
    if (!qrCodeSvg) return;

    const svgBlob = new Blob([qrCodeSvg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    const link = document.createElement('a');
    link.download = `qrcode-mesa-${tableNumber}.svg`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);

    toast({
      title: 'QR Code baixado!',
      description: `qrcode-mesa-${tableNumber}.svg`,
    });
  };

  const handlePrint = () => {
    if (!qrCodeSvg) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>QR Code - Mesa ${tableNumber}</title>
          <style>
            body {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              font-family: system-ui, -apple-system, sans-serif;
              text-align: center;
            }
            .container {
              padding: 2rem;
            }
            h1 {
              font-size: 3rem;
              font-weight: bold;
              margin: 0 0 1rem 0;
              color: #1e293b;
            }
            p {
              font-size: 1.5rem;
              color: #64748b;
              margin: 0 0 2rem 0;
            }
            .qr-wrapper {
              margin: 2rem 0;
            }
            .qr-wrapper svg {
              max-width: 400px;
              height: auto;
            }
            .instructions {
              font-size: 1.2rem;
              color: #475569;
              max-width: 500px;
              margin: 2rem auto 0;
            }
            @media print {
              @page {
                margin: 2cm;
              }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Mesa ${tableNumber}</h1>
            <p>Escaneie para ver o cardápio</p>
            <div class="qr-wrapper">
              ${qrCodeSvg}
            </div>
            <div class="instructions">
              <strong>Como usar:</strong><br>
              1. Abra a câmera do celular<br>
              2. Aponte para o QR Code<br>
              3. Toque na notificação para abrir o cardápio
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Cardápio - Mesa ${tableNumber}`,
          text: `Veja nosso cardápio e faça seu pedido`,
          url: publicMenuUrl,
        });
        toast({
          title: 'Compartilhado!',
          description: 'Link compartilhado com sucesso',
        });
      } catch (error) {
        // User cancelled or error
        if ((error as Error).name !== 'AbortError') {
          handleCopyUrl(); // Fallback to copy
        }
      }
    } else {
      handleCopyUrl(); // Fallback to copy
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px] p-0 overflow-hidden border-0 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-950 dark:via-blue-950 dark:to-purple-950">
        {/* Header Section */}
        <div className="relative px-4 pt-4 pb-3 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <span className="text-lg">📱</span>
              </div>
              <div>
                <h2 className="text-base font-bold">QR Code - Mesa {tableNumber}</h2>
                <p className="text-white/80 text-[10px]">Escaneie para fazer pedidos</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-3">
          {/* QR Code Display - Compact */}
          <div className="relative">
            <div className="relative bg-white dark:bg-slate-900 rounded-lg shadow-lg p-4 border border-slate-200/50 dark:border-slate-700/50">
              {qrCodeSvg ? (
                <div className="flex flex-col items-center space-y-2">
                  <div className="bg-white p-3 rounded-lg shadow" style={{ lineHeight: 0 }}>
                    <div
                      className="w-56 h-56"
                      style={{ overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      dangerouslySetInnerHTML={{
                        __html: qrCodeSvg
                          .replace(/<svg /, '<svg style="width:100%;height:100%;display:block;" ')
                          .replace(/width="[^"]*"/, 'width="100%"')
                          .replace(/height="[^"]*"/, 'height="100%"'),
                      }}
                    />
                  </div>
                  <Badge className="text-xs px-3 py-1 bg-gradient-to-r from-blue-600 to-purple-600">
                    Mesa {tableNumber}
                  </Badge>
                </div>
              ) : (
                <div className="flex items-center justify-center h-56">
                  <div className="flex flex-col items-center gap-2">
                    <div className="animate-spin rounded-full h-8 w-8 border-3 border-primary border-t-transparent"></div>
                    <p className="text-[10px] text-muted-foreground">Gerando...</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Session PIN Display */}
          {sessionPin && (
            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  <span className="text-xs font-semibold text-amber-800 dark:text-amber-200">
                    PIN da Mesa
                  </span>
                </div>
                <span className="text-lg font-black text-amber-600 dark:text-amber-400 tracking-widest">
                  {sessionPin}
                </span>
              </div>
              <p className="text-[10px] text-amber-700 dark:text-amber-300 mt-1">
                Peça aos clientes digitarem este PIN para acessar o cardápio
              </p>
            </div>
          )}

          {/* URL Display - Compact */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
              Link
            </label>
            <div className="flex gap-1.5">
              <input
                type="text"
                value={publicMenuUrl}
                readOnly
                className="flex-1 px-2 py-1.5 text-[10px] bg-white dark:bg-slate-900 rounded border border-slate-300 dark:border-slate-700"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyUrl}
                className="gap-1 px-2 hover:bg-blue-50 dark:hover:bg-blue-950"
              >
                {copied ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </Button>
            </div>
          </div>

          {/* Actions - Compact Buttons */}
          <div className="grid grid-cols-3 gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              disabled={!qrCodeSvg}
              className="gap-1 px-2 py-1 h-8 text-[10px] hover:bg-blue-50 dark:hover:bg-blue-950"
            >
              <Download className="h-3.5 w-3.5" />
              Baixar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              disabled={!qrCodeSvg}
              className="gap-1 px-2 py-1 h-8 text-[10px] hover:bg-purple-50 dark:hover:bg-purple-950"
            >
              <Share2 className="h-3.5 w-3.5" />
              Enviar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              disabled={!qrCodeSvg}
              className="gap-1 px-2 py-1 h-8 text-[10px] hover:bg-pink-50 dark:hover:bg-pink-950"
            >
              <Printer className="h-3.5 w-3.5" />
              Imprimir
            </Button>
          </div>

          {/* Instructions - Compact Card */}
          <div className="rounded-lg bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-200/50 dark:border-blue-700/50 p-3">
            <div className="flex items-center gap-1.5 mb-2">
              <span className="text-sm">💡</span>
              <h4 className="font-semibold text-xs text-slate-800 dark:text-slate-200">
                Como Funciona
              </h4>
            </div>
            <ul className="space-y-1.5 text-[10px] text-slate-700 dark:text-slate-300">
              <li className="flex items-start gap-1.5">
                <span className="flex-shrink-0 w-4 h-4 rounded-full bg-blue-500 text-white flex items-center justify-center text-[9px] font-bold mt-0.5">1</span>
                <span>Coloque o QR Code na mesa</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="flex-shrink-0 w-4 h-4 rounded-full bg-purple-500 text-white flex items-center justify-center text-[9px] font-bold mt-0.5">2</span>
                <span>Clientes escaneiam com a câmera</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="flex-shrink-0 w-4 h-4 rounded-full bg-pink-500 text-white flex items-center justify-center text-[9px] font-bold mt-0.5">3</span>
                <span>Pedidos aparecem no sistema</span>
              </li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
