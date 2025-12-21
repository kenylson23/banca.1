import { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Download, Copy, Check, QrCode as QrCodeIcon, Upload, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface QRCodeGeneratorProps {
  url: string;
  restaurantName: string;
}

// Predefined sizes
const SIZES = {
  mesa: { label: 'Mesa (10cm)', size: 400, description: 'Ideal para mesas de restaurante' },
  a4: { label: 'A4 (21cm)', size: 800, description: 'Para impressão A4' },
  flyer: { label: 'Flyer (A5)', size: 600, description: 'Panfletos e folders' },
  instagram: { label: 'Instagram Post', size: 1080, description: 'Post quadrado 1:1' },
  story: { label: 'Instagram Story', size: 1080, description: 'Story vertical' },
  small: { label: 'Pequeno', size: 200, description: 'Uso digital pequeno' },
  medium: { label: 'Médio', size: 400, description: 'Uso geral' },
  large: { label: 'Grande', size: 600, description: 'Alta qualidade' },
};

// Error correction levels
const ERROR_LEVELS = {
  L: { label: 'Baixo (7%)', value: 'L', description: 'QR Code simples' },
  M: { label: 'Médio (15%)', value: 'M', description: 'Recomendado para uso geral' },
  Q: { label: 'Alto (25%)', value: 'Q', description: 'Com pequenas decorações' },
  H: { label: 'Máximo (30%)', value: 'H', description: 'Com logo no centro' },
} as const;

// Templates
const TEMPLATES = {
  classic: {
    name: 'Clássico',
    qrColor: '#000000',
    bgColor: '#ffffff',
    showText: true,
    errorLevel: 'M' as const,
    margin: 2,
  },
  modern: {
    name: 'Moderno',
    qrColor: '#1f2937',
    bgColor: '#f3f4f6',
    showText: true,
    errorLevel: 'M' as const,
    margin: 2,
  },
  elegant: {
    name: 'Elegante',
    qrColor: '#7c3aed',
    bgColor: '#faf5ff',
    showText: true,
    errorLevel: 'Q' as const,
    margin: 3,
  },
  minimal: {
    name: 'Minimalista',
    qrColor: '#000000',
    bgColor: '#ffffff',
    showText: false,
    errorLevel: 'L' as const,
    margin: 4,
  },
  vibrant: {
    name: 'Vibrante',
    qrColor: '#dc2626',
    bgColor: '#fef2f2',
    showText: true,
    errorLevel: 'M' as const,
    margin: 2,
  },
};

export function QRCodeGenerator({ url, restaurantName }: QRCodeGeneratorProps) {
  const [qrSize, setQrSize] = useState(400);
  const [qrColor, setQrColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedSize, setSelectedSize] = useState<keyof typeof SIZES>('medium');
  const [errorLevel, setErrorLevel] = useState<'L' | 'M' | 'Q' | 'H'>('M');
  const [margin, setMargin] = useState(2);
  const [qrTitle, setQrTitle] = useState('Menu Digital');
  const [qrCta, setQrCta] = useState('Escaneie para ver o menu');
  const [showText, setShowText] = useState(true);
  const [logoImage, setLogoImage] = useState<HTMLImageElement | null>(null);
  const [showLogo, setShowLogo] = useState(false);
  const [logoSize, setLogoSize] = useState(25); // percentage
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const finalCanvasRef = useRef<HTMLCanvasElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    generateQR();
  }, [url, qrSize, qrColor, bgColor, errorLevel, margin, qrTitle, qrCta, showText, logoImage, showLogo, logoSize]);
  
  useEffect(() => {
    // Update size when preset changes
    setQrSize(SIZES[selectedSize].size);
  }, [selectedSize]);

  const generateQR = async () => {
    if (!canvasRef.current || !url) return;

    try {
      // Generate base QR code
      await QRCode.toCanvas(canvasRef.current, url, {
        width: qrSize,
        margin: margin,
        errorCorrectionLevel: errorLevel,
        color: {
          dark: qrColor,
          light: bgColor,
        },
      });
      
      // Add text if enabled
      if (showText && finalCanvasRef.current && (qrTitle || qrCta)) {
        const finalCanvas = finalCanvasRef.current;
        const ctx = finalCanvas.getContext('2d');
        if (!ctx) return;
        
        const padding = 40;
        const textHeight = qrTitle ? 60 : 0;
        const ctaHeight = qrCta ? 40 : 0;
        const totalHeight = qrSize + textHeight + ctaHeight + (padding * 2);
        
        finalCanvas.width = qrSize + (padding * 2);
        finalCanvas.height = totalHeight;
        
        // White background
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);
        
        // Draw title
        if (qrTitle) {
          ctx.fillStyle = qrColor;
          ctx.font = 'bold 24px Inter, system-ui, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(qrTitle, finalCanvas.width / 2, padding + 30);
        }
        
        // Draw QR code
        ctx.drawImage(canvasRef.current, padding, padding + textHeight);
        
        // Draw logo on center if enabled
        if (showLogo && logoImage) {
          const logoSizePx = (qrSize * logoSize) / 100;
          const logoX = padding + (qrSize - logoSizePx) / 2;
          const logoY = padding + textHeight + (qrSize - logoSizePx) / 2;
          
          // White background for logo
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(logoX - 10, logoY - 10, logoSizePx + 20, logoSizePx + 20);
          
          // Draw logo
          ctx.drawImage(logoImage, logoX, logoY, logoSizePx, logoSizePx);
        }
        
        // Draw CTA
        if (qrCta) {
          ctx.fillStyle = qrColor;
          ctx.font = '18px Inter, system-ui, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(qrCta, finalCanvas.width / 2, padding + textHeight + qrSize + 30);
        }
      }
    } catch (err) {
      console.error('Error generating QR code:', err);
    }
  };

  const downloadQR = (format: 'png' | 'svg') => {
    // Use final canvas if text is enabled, otherwise use base canvas
    const canvas = (showText && (qrTitle || qrCta) && finalCanvasRef.current) ? finalCanvasRef.current : canvasRef.current;
    if (!canvas) return;

    if (format === 'png') {
      const link = document.createElement('a');
      link.download = `qrcode-${restaurantName.toLowerCase().replace(/\s+/g, '-')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      
      toast({
        title: 'QR Code baixado!',
        description: 'Arquivo PNG salvo com sucesso.',
      });
    } else {
      QRCode.toString(url, {
        type: 'svg',
        width: qrSize,
        margin: 2,
        color: {
          dark: qrColor,
          light: bgColor,
        },
      }).then((svg) => {
        const blob = new Blob([svg], { type: 'image/svg+xml' });
        const link = document.createElement('a');
        link.download = `qrcode-${restaurantName.toLowerCase().replace(/\s+/g, '-')}.svg`;
        link.href = URL.createObjectURL(blob);
        link.click();
        
        toast({
          title: 'QR Code baixado!',
          description: 'Arquivo SVG salvo com sucesso.',
        });
      });
    }
  };

  const copyToClipboard = async () => {
    const canvas = (showText && (qrTitle || qrCta) && finalCanvasRef.current) ? finalCanvasRef.current : canvasRef.current;
    if (!canvas) return;

    try {
      canvas.toBlob((blob) => {
        if (blob) {
          const item = new ClipboardItem({ 'image/png': blob });
          navigator.clipboard.write([item]).then(() => {
            setCopied(true);
            toast({
              title: 'QR Code copiado!',
              description: 'Cole em qualquer lugar (Ctrl+V)',
            });
            setTimeout(() => setCopied(false), 2000);
          });
        }
      });
    } catch (err) {
      console.error('Error copying to clipboard:', err);
    }
  };
  
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: 'Arquivo muito grande',
        description: 'Tamanho máximo: 2MB',
        variant: 'destructive',
      });
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        setLogoImage(img);
        setShowLogo(true);
        // Recommend higher error correction when logo is added
        if (errorLevel === 'L' || errorLevel === 'M') {
          setErrorLevel('H');
          toast({
            title: 'Logo adicionado!',
            description: 'Nível de erro ajustado para Alto (recomendado com logo)',
          });
        } else {
          toast({
            title: 'Logo adicionado!',
            description: 'Seu logo aparecerá no centro do QR Code',
          });
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };
  
  const applyTemplate = (templateKey: keyof typeof TEMPLATES) => {
    const template = TEMPLATES[templateKey];
    setQrColor(template.qrColor);
    setBgColor(template.bgColor);
    setShowText(template.showText);
    setErrorLevel(template.errorLevel);
    setMargin(template.margin);
    
    toast({
      title: `Template "${template.name}" aplicado!`,
      description: 'Você pode personalizar ainda mais se quiser',
    });
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <QrCodeIcon className="h-4 w-4" />
              QR Code do Menu
            </CardTitle>
            <CardDescription className="text-xs">
              Personalize e baixe o QR Code
            </CardDescription>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-7 px-2 text-xs"
          >
            {isExpanded ? 'Compactar' : 'Expandir'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* QR Code Preview - Always Visible */}
        <div className="space-y-2">
          <div className="p-4 bg-gradient-to-br from-muted/50 to-muted/30 rounded-xl border-2 border-dashed border-border/50 flex items-center justify-center max-w-md mx-auto">
            {showText && (qrTitle || qrCta) ? (
              <>
                <canvas ref={finalCanvasRef} className="max-w-full h-auto drop-shadow-lg" style={{ maxHeight: '400px' }} />
                <canvas ref={canvasRef} className="hidden" />
              </>
            ) : (
              <canvas ref={canvasRef} className="max-w-full h-auto drop-shadow-lg" style={{ maxHeight: '400px' }} />
            )}
          </div>
          
          {/* Quick Actions Below QR Code */}
          <div className="flex gap-2 justify-center">
            <Button
              size="sm"
              variant="secondary"
              onClick={copyToClipboard}
              className="h-8 px-3 gap-2"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  <span className="text-xs">Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span className="text-xs">Copiar</span>
                </>
              )}
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => downloadQR('png')}
              className="h-8 px-3 gap-2"
            >
              <Download className="h-3.5 w-3.5" />
              <span className="text-xs">PNG</span>
            </Button>
          </div>
        </div>

        {/* Additional Download Option */}
        <div className="flex justify-center">
          <Button
            size="sm"
            variant="outline"
            onClick={() => downloadQR('svg')}
            className="gap-2 h-8 px-3"
          >
            <Download className="h-3.5 w-3.5" />
            <span className="text-xs">Baixar SVG</span>
          </Button>
        </div>

        {/* Expandable Customization */}
        {isExpanded && (
          <div className="space-y-3 pt-3 border-t animate-in slide-in-from-top-2">
            {/* Templates */}
            <div className="space-y-2">
              <Label className="text-xs">Templates Prontos</Label>
              <div className="grid grid-cols-5 gap-2">
                {Object.entries(TEMPLATES).map(([key, template]) => (
                  <button
                    key={key}
                    onClick={() => applyTemplate(key as keyof typeof TEMPLATES)}
                    className="p-2 rounded-lg border-2 hover:border-primary transition-all text-center"
                    title={template.name}
                    style={{
                      background: `linear-gradient(135deg, ${template.qrColor} 0%, ${template.bgColor} 100%)`,
                      borderColor: 'transparent',
                    }}
                  >
                    <span className="text-xs font-medium drop-shadow-lg" style={{
                      color: template.qrColor === '#000000' ? '#ffffff' : template.qrColor
                    }}>
                      {template.name.slice(0, 3)}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Logo Upload */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Logo no Centro</Label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={showLogo}
                    onChange={(e) => setShowLogo(e.target.checked)}
                    disabled={!logoImage}
                    className="rounded border-gray-300"
                  />
                  <span className="text-xs">Exibir</span>
                </label>
              </div>
              
              <input
                ref={logoInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />
              
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => logoInputRef.current?.click()}
                  className="flex-1 h-9 gap-2"
                >
                  <Upload className="h-3.5 w-3.5" />
                  <span className="text-xs">{logoImage ? 'Trocar Logo' : 'Upload Logo'}</span>
                </Button>
                {logoImage && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setLogoImage(null);
                      setShowLogo(false);
                    }}
                    className="h-9 px-3"
                    title="Remover logo"
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
              
              {showLogo && logoImage && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Tamanho do Logo</Label>
                    <span className="text-xs font-medium text-muted-foreground">{logoSize}%</span>
                  </div>
                  <Slider
                    value={[logoSize]}
                    onValueChange={(value) => setLogoSize(value[0])}
                    min={15}
                    max={35}
                    step={5}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    💡 Recomendado: 20-30% com nível de erro Alto
                  </p>
                </div>
              )}
            </div>

            {/* Text Options */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Texto</Label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={showText}
                    onChange={(e) => setShowText(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-xs">Exibir</span>
                </label>
              </div>
              {showText && (
                <>
                  <Input
                    value={qrTitle}
                    onChange={(e) => setQrTitle(e.target.value)}
                    placeholder="Título (ex: Menu Digital)"
                    className="h-9 text-xs"
                  />
                  <Input
                    value={qrCta}
                    onChange={(e) => setQrCta(e.target.value)}
                    placeholder="Call-to-action (ex: Escaneie aqui!)"
                    className="h-9 text-xs"
                  />
                </>
              )}
            </div>

            {/* Size Presets */}
            <div className="space-y-2">
              <Label className="text-xs">Tamanho Predefinido</Label>
              <select
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value as keyof typeof SIZES)}
                className="w-full h-9 px-3 text-xs rounded-lg border bg-background"
              >
                {Object.entries(SIZES).map(([key, { label, description }]) => (
                  <option key={key} value={key}>
                    {label} - {description}
                  </option>
                ))}
              </select>
            </div>

            {/* Error Correction Level */}
            <div className="space-y-2">
              <Label className="text-xs">Nível de Correção de Erro</Label>
              <select
                value={errorLevel}
                onChange={(e) => setErrorLevel(e.target.value as 'L' | 'M' | 'Q' | 'H')}
                className="w-full h-9 px-3 text-xs rounded-lg border bg-background"
              >
                {Object.entries(ERROR_LEVELS).map(([key, { label, description }]) => (
                  <option key={key} value={key}>
                    {label} - {description}
                  </option>
                ))}
              </select>
            </div>

            {/* Margin */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Margem</Label>
                <span className="text-xs font-medium text-muted-foreground">{margin} módulos</span>
              </div>
              <Slider
                value={[margin]}
                onValueChange={(value) => setMargin(value[0])}
                min={0}
                max={10}
                step={1}
                className="w-full"
              />
            </div>

            {/* Custom Size */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Tamanho Personalizado</Label>
                <span className="text-xs font-medium text-muted-foreground">{qrSize}px</span>
              </div>
              <Slider
                value={[qrSize]}
                onValueChange={(value) => setQrSize(value[0])}
                min={200}
                max={1200}
                step={50}
                className="w-full"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs">Cor do QR</Label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={qrColor}
                    onChange={(e) => setQrColor(e.target.value)}
                    className="w-10 h-9 rounded-lg border cursor-pointer shadow-sm"
                  />
                  <input
                    type="text"
                    value={qrColor}
                    onChange={(e) => setQrColor(e.target.value)}
                    className="flex-1 h-9 px-2 text-xs rounded-lg border bg-background"
                    placeholder="#000000"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Fundo</Label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-10 h-9 rounded-lg border cursor-pointer shadow-sm"
                  />
                  <input
                    type="text"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="flex-1 h-9 px-2 text-xs rounded-lg border bg-background"
                    placeholder="#ffffff"
                  />
                </div>
              </div>
            </div>

            {/* Preset Colors */}
            <div className="space-y-2">
              <Label className="text-xs">Presets</Label>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setQrColor('#000000');
                    setBgColor('#ffffff');
                  }}
                  className="flex-1 h-8 rounded-lg border-2 border-dashed hover:border-solid transition-all"
                  style={{ background: 'linear-gradient(to right, #000000 50%, #ffffff 50%)' }}
                  title="Clássico"
                />
                <button
                  onClick={() => {
                    setQrColor('#1f2937');
                    setBgColor('#f3f4f6');
                  }}
                  className="flex-1 h-8 rounded-lg border-2 border-dashed hover:border-solid transition-all"
                  style={{ background: 'linear-gradient(to right, #1f2937 50%, #f3f4f6 50%)' }}
                  title="Moderno"
                />
                <button
                  onClick={() => {
                    setQrColor('#7c3aed');
                    setBgColor('#faf5ff');
                  }}
                  className="flex-1 h-8 rounded-lg border-2 border-dashed hover:border-solid transition-all"
                  style={{ background: 'linear-gradient(to right, #7c3aed 50%, #faf5ff 50%)' }}
                  title="Roxo"
                />
                <button
                  onClick={() => {
                    setQrColor('#dc2626');
                    setBgColor('#fef2f2');
                  }}
                  className="flex-1 h-8 rounded-lg border-2 border-dashed hover:border-solid transition-all"
                  style={{ background: 'linear-gradient(to right, #dc2626 50%, #fef2f2 50%)' }}
                  title="Vermelho"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tips */}
        <div className="rounded-lg border bg-amber-50 dark:bg-amber-950/20 p-3">
          <p className="text-xs text-amber-900 dark:text-amber-100">
            <strong>📱 Uso:</strong> Imprima e coloque nas mesas, balcão ou materiais de marketing!
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
