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
import { Download, Share2, Printer, Copy, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import QRCode from 'qrcode';

interface QRCodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tableId: string;
  tableNumber: string;
  restaurantSlug?: string;
}

export function QRCodeDialog({
  open,
  onOpenChange,
  tableId,
  tableNumber,
  restaurantSlug,
}: QRCodeDialogProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  // Gerar URL pública do menu
  const publicMenuUrl = restaurantSlug
    ? `${window.location.origin}/${restaurantSlug}/menu?table=${tableId}`
    : `${window.location.origin}/public-menu?table=${tableId}`;

  // Gerar QR Code
  useEffect(() => {
    if (open && tableId) {
      QRCode.toDataURL(publicMenuUrl, {
        width: 400,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      })
        .then(setQrCodeUrl)
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
    if (!qrCodeUrl) return;

    const link = document.createElement('a');
    link.download = `qrcode-mesa-${tableNumber}.png`;
    link.href = qrCodeUrl;
    link.click();

    toast({
      title: 'QR Code baixado!',
      description: `qrcode-mesa-${tableNumber}.png`,
    });
  };

  const handlePrint = () => {
    if (!qrCodeUrl) return;

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
            img {
              max-width: 400px;
              height: auto;
              margin: 2rem 0;
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
            <img src="${qrCodeUrl}" alt="QR Code Mesa ${tableNumber}" />
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            📱 QR Code - Mesa {tableNumber}
          </DialogTitle>
          <DialogDescription>
            Clientes podem escanear este código para ver o cardápio e fazer pedidos
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* QR Code */}
          <div className="flex justify-center">
            {qrCodeUrl ? (
              <div className="relative">
                <img
                  src={qrCodeUrl}
                  alt={`QR Code Mesa ${tableNumber}`}
                  className="w-64 h-64 border-4 border-slate-200 dark:border-slate-700 rounded-lg"
                />
                <Badge
                  className="absolute -top-2 -right-2 bg-indigo-600 text-white"
                >
                  Mesa {tableNumber}
                </Badge>
              </div>
            ) : (
              <div className="w-64 h-64 flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-lg">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              </div>
            )}
          </div>

          {/* URL */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Link Direto:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={publicMenuUrl}
                readOnly
                className="flex-1 px-3 py-2 text-sm bg-slate-100 dark:bg-slate-800 rounded border border-slate-300 dark:border-slate-600"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={handleCopyUrl}
                className="flex-shrink-0"
              >
                {copied ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              onClick={handleDownload}
              disabled={!qrCodeUrl}
              className="w-full"
            >
              <Download className="h-4 w-4 mr-2" />
              Baixar
            </Button>
            <Button
              variant="outline"
              onClick={handlePrint}
              disabled={!qrCodeUrl}
              className="w-full"
            >
              <Printer className="h-4 w-4 mr-2" />
              Imprimir
            </Button>
            <Button
              variant="outline"
              onClick={handleShare}
              disabled={!qrCodeUrl}
              className="w-full col-span-2"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Compartilhar Link
            </Button>
          </div>

          {/* Info */}
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm space-y-2">
            <p className="font-medium text-blue-900 dark:text-blue-100">
              💡 Dica:
            </p>
            <ul className="text-blue-800 dark:text-blue-200 space-y-1 text-xs">
              <li>• Imprima e coloque o QR Code na mesa</li>
              <li>• Clientes podem fazer pedidos pelo celular</li>
              <li>• Pedidos aparecem automaticamente no sistema</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
