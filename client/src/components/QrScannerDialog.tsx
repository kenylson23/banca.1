import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, X, CheckCircle2, AlertCircle } from 'lucide-react';

interface QrScannerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onScan: (result: string) => void;
  title?: string;
  description?: string;
}

export function QrScannerDialog({
  open,
  onOpenChange,
  onScan,
  title = 'Escanear QR Code',
  description = 'Aponte a câmara para o QR Code da mesa',
}: QrScannerDialogProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!open) {
      stopScanner();
      return;
    }

    let mounted = true;

    const startScanner = async () => {
      try {
        setError(null);
        const scanner = new Html5Qrcode('qr-scanner-container');
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 220, height: 220 },
            aspectRatio: 1.0,
          },
          (decodedText) => {
            if (!mounted) return;
            setIsScanning(false);
            setError(null);
            onScan(decodedText);
            onOpenChange(false);
          },
          () => {
            // Ignore scan errors, keep scanning
          }
        );

        if (mounted) {
          setIsScanning(true);
        }
      } catch (err) {
        if (!mounted) return;
        console.error('Error starting QR scanner:', err);
        setError('Não foi possível aceder à câmara. Verifique as permissões.');
        setIsScanning(false);
      }
    };

    startScanner();

    return () => {
      mounted = false;
      stopScanner();
    };
  }, [open, onScan, onOpenChange, toast]);

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
      } catch {
        // ignore stop errors
      }
      scannerRef.current = null;
    }
    setIsScanning(false);
  };

  const handleRetry = () => {
    setError(null);
    stopScanner();
    setTimeout(() => {
      if (open) {
        const startScanner = async () => {
          try {
            const scanner = new Html5Qrcode('qr-scanner-container');
            scannerRef.current = scanner;
            await scanner.start(
              { facingMode: 'environment' },
              {
                fps: 10,
                qrbox: { width: 220, height: 220 },
                aspectRatio: 1.0,
              },
              (decodedText) => {
                onScan(decodedText);
                onOpenChange(false);
              },
              () => {}
            );
            setIsScanning(true);
          } catch (err) {
            console.error('Error starting QR scanner:', err);
            setError('Não foi possível aceder à câmara. Verifique as permissões.');
          }
        };
        startScanner();
      }
    }, 100);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px] p-0 overflow-hidden border-0 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-950 dark:via-blue-950 dark:to-purple-950">
        <DialogHeader className="px-4 pt-4 pb-3 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-base font-bold">{title}</DialogTitle>
              <DialogDescription className="text-white/80 text-[10px]">
                {description}
              </DialogDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="p-4 space-y-3">
          <div className="relative bg-black rounded-lg overflow-hidden">
            <div id="qr-scanner-container" className="w-full h-64" />

            {!isScanning && !error && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                <div className="flex flex-col items-center gap-2 text-white">
                  <Camera className="h-8 w-8" />
                  <p className="text-xs">A iniciar câmara...</p>
                </div>
              </div>
            )}

            {error && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/80 p-4">
                <div className="flex flex-col items-center gap-3 text-white text-center">
                  <AlertCircle className="h-8 w-8 text-red-400" />
                  <p className="text-xs">{error}</p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-white border-white hover:bg-white/10"
                    onClick={handleRetry}
                  >
                    Tentar novamente
                  </Button>
                </div>
              </div>
            )}
          </div>

          {isScanning && (
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              A escanear... Aponte para o QR Code
            </div>
          )}

          <div className="rounded-lg bg-blue-500/10 border border-blue-200/50 dark:border-blue-700/50 p-3">
            <div className="flex items-start gap-2">
              <Camera className="h-4 w-4 text-blue-600 mt-0.5" />
              <div className="text-[10px] text-blue-800 dark:text-blue-200 space-y-1">
                <p className="font-semibold">Como usar:</p>
                <p>1. Aponte a câmara para o QR Code da mesa</p>
                <p>2. Aguarde a leitura automática</p>
                <p>3. O sistema abre automaticamente a mesa</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
