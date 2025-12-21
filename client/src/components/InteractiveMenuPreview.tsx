import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Smartphone, 
  Tablet, 
  Monitor, 
  RotateCw, 
  ExternalLink,
  RefreshCw,
  Maximize2,
  ZoomIn,
  ZoomOut,
  X,
  ChevronDown,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

interface InteractiveMenuPreviewProps {
  restaurantSlug: string;
  restaurantName: string;
}

type DeviceType = 'iphone' | 'android' | 'tablet' | 'desktop';
type Orientation = 'portrait' | 'landscape';

const devices = {
  iphone: {
    name: 'iPhone 14 Pro',
    width: 390,
    height: 844,
    scale: 0.55, // Ajustado para caber na altura máxima de 650px
    hasNotch: true,
    icon: Smartphone,
  },
  android: {
    name: 'Pixel 7',
    width: 412,
    height: 915,
    scale: 0.52, // Ajustado para caber na altura máxima
    hasNotch: false,
    icon: Smartphone,
  },
  tablet: {
    name: 'iPad Air',
    width: 820,
    height: 1180,
    scale: 0.40, // Ajustado para caber na altura máxima
    hasNotch: false,
    icon: Tablet,
  },
  desktop: {
    name: 'Desktop',
    width: 1440,
    height: 900,
    scale: 0.32, // Ajustado para caber na altura máxima
    hasNotch: false,
    icon: Monitor,
  },
};

export function InteractiveMenuPreview({ 
  restaurantSlug, 
  restaurantName 
}: InteractiveMenuPreviewProps) {
  const { toast } = useToast();
  const [device, setDevice] = useState<DeviceType>('iphone');
  const [orientation, setOrientation] = useState<Orientation>('portrait');
  const [zoom, setZoom] = useState(1);
  const [key, setKey] = useState(0); // Para forçar reload do iframe
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [iframeLoading, setIframeLoading] = useState(true);
  const [iframeError, setIframeError] = useState(false);
  const [showScrollHint, setShowScrollHint] = useState(true);
  
  // Build URL with preview parameter
  const publicUrl = `/r/${restaurantSlug}?preview=${device}`;
  const currentDevice = devices[device];
  
  const toggleOrientation = () => {
    setIframeLoading(true);
    setOrientation(prev => prev === 'portrait' ? 'landscape' : 'portrait');
  };

  const handleRefresh = () => {
    setIframeLoading(true);
    setIframeError(false);
    setKey(prev => prev + 1);
  };
  
  const handleIframeLoad = () => {
    setIframeLoading(false);
    setIframeError(false);
  };
  
  const handleIframeError = () => {
    setIframeLoading(false);
    setIframeError(true);
  };

  // Calculate dimensions based on orientation (MUST BE BEFORE useEffect)
  const width = orientation === 'portrait' ? currentDevice.width : currentDevice.height;
  const height = orientation === 'portrait' ? currentDevice.height : currentDevice.width;
  const scale = currentDevice.scale * zoom;
  
  // Calculate frame extras (padding + border for mobile devices)
  const frameExtras = device === 'desktop' ? 0 : 40; // 12px padding + 8px border on each side
  const deviceInfoHeight = 50; // Device name and dimensions text
  const totalPreviewHeight = (height * scale) + frameExtras + deviceInfoHeight;

  const handleZoomIn = () => {
    setZoom(prev => {
      const newZoom = prev + 0.1;
      // Calculate if new zoom would exceed container
      const frameExtras = device === 'desktop' ? 0 : 40;
      const deviceInfoHeight = 50;
      const newHeight = (height * currentDevice.scale * newZoom) + frameExtras + deviceInfoHeight;
      
      // Limit zoom to fit within 700px container
      if (newHeight > 700) {
        return prev; // Don't increase zoom
      }
      return Math.min(newZoom, 1.5);
    });
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.1, 0.5));
  };

  const resetZoom = () => {
    setZoom(1);
  };
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Only trigger when not typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      
      // Ctrl/Cmd + R: Refresh
      if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
        e.preventDefault();
        handleRefresh();
        toast({ title: '🔄 Preview atualizado' });
      }
      
      // F: Fullscreen
      if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
        toast({ title: isFullscreen ? '📱 Modo normal' : '🖥️ Modo fullscreen' });
      }
      
      // R: Rotate (when not desktop)
      if ((e.key === 'r' || e.key === 'R') && device !== 'desktop' && !e.ctrlKey && !e.metaKey) {
        toggleOrientation();
        toast({ title: `🔄 ${orientation === 'portrait' ? 'Landscape' : 'Portrait'}` });
      }
      
      // + or =: Zoom in
      if ((e.key === '+' || e.key === '=') && zoom < 1.5 && totalPreviewHeight < 700) {
        handleZoomIn();
      }
      
      // -: Zoom out
      if (e.key === '-' && zoom > 0.5) {
        handleZoomOut();
      }
      
      // 0: Reset zoom
      if (e.key === '0') {
        resetZoom();
        toast({ title: '🔍 Zoom resetado para 100%' });
      }
      
      // ESC: Exit fullscreen
      if (e.key === 'Escape' && isFullscreen) {
        toggleFullscreen();
      }
      
      // Number keys 1-4: Switch devices
      if (e.key === '1') setDevice('iphone');
      if (e.key === '2') setDevice('android');
      if (e.key === '3') setDevice('tablet');
      if (e.key === '4') setDevice('desktop');
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [device, orientation, zoom, isFullscreen, totalPreviewHeight]);
  
  // Hide scroll hint after 5 seconds or on interaction
  useEffect(() => {
    const timer = setTimeout(() => setShowScrollHint(false), 5000);
    return () => clearTimeout(timer);
  }, [key, device, orientation]);

  const DeviceIcon = currentDevice.icon;

  // Fullscreen toggle
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Fullscreen component
  if (isFullscreen) {
    // Calculate fullscreen scale (1.5x larger)
    const fullscreenScale = scale * 1.5;
    const fullscreenFrameExtras = device === 'desktop' ? 0 : 40;
    
    return (
      <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm">
        <div className="absolute inset-4 flex flex-col">
          {/* Fullscreen Header */}
          <div className="flex items-center justify-between mb-4 px-4 py-3 bg-black/50 rounded-lg border border-white/10">
            <div className="flex items-center gap-4">
              <h3 className="text-white font-semibold">Preview - {currentDevice.name}</h3>
              
              {/* Device Selector */}
              <div className="flex gap-2">
                {(Object.keys(devices) as DeviceType[]).map((d) => {
                  const DevIcon = devices[d].icon;
                  return (
                    <button
                      key={d}
                      onClick={() => {
                        setIframeLoading(true);
                        setDevice(d);
                      }}
                      className={`p-2 rounded-lg transition-all ${
                        device === d
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-white/10 text-white/70 hover:bg-white/20'
                      }`}
                    >
                      <DevIcon className="h-4 w-4" />
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {device !== 'desktop' && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={toggleOrientation}
                  className="gap-2"
                >
                  <RotateCw className="h-4 w-4" />
                  {orientation === 'portrait' ? 'Portrait' : 'Landscape'}
                </Button>
              )}
              
              <Button
                size="sm"
                variant="secondary"
                onClick={handleRefresh}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>

              <Button
                size="sm"
                variant="secondary"
                onClick={toggleFullscreen}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Fullscreen Preview */}
          <div className="flex-1 flex items-center justify-center overflow-auto p-4">
            <div className="relative flex flex-col items-center">
              <div
                className="relative"
                style={{
                  width: width * fullscreenScale,
                  height: 'auto',
                }}
              >
                <div 
                  className={`relative rounded-[2.5rem] bg-neutral-900 shadow-2xl ${
                    device === 'desktop' ? 'rounded-xl' : ''
                  }`}
                  style={{
                    padding: device === 'desktop' ? '0' : '12px',
                    border: device === 'desktop' ? 'none' : '8px solid #1f1f1f',
                    height: (height * fullscreenScale) + 'px',
                  }}
                >
                  {currentDevice.hasNotch && orientation === 'portrait' && device === 'iphone' && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-neutral-800 rounded-b-2xl z-10" />
                  )}

                  <div 
                    className={`relative bg-white overflow-hidden h-full ${
                      device === 'desktop' ? 'rounded-lg' : 'rounded-[1.5rem]'
                    }`}
                    style={{
                      width: '100%',
                      height: '100%',
                    }}
                  >
                    <iframe
                      key={`${device}-${orientation}-${key}-fullscreen`}
                      src={publicUrl}
                      className="border-0"
                      title={`Preview fullscreen do menu ${restaurantName} em ${currentDevice.name}`}
                      sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
                      onLoad={handleIframeLoad}
                      onError={handleIframeError}
                      style={{
                        pointerEvents: 'auto',
                        width: width + 'px',
                        height: height + 'px',
                        transform: `scale(${fullscreenScale / currentDevice.scale})`,
                        transformOrigin: 'top left',
                      }}
                      aria-label={`Preview fullscreen do menu em ${currentDevice.name}`}
                    />
                    
                    {/* Loading overlay */}
                    <div className={`absolute inset-0 bg-white flex items-center justify-center pointer-events-none transition-opacity duration-300 ${
                      iframeLoading && !iframeError ? 'opacity-100' : 'opacity-0'
                    }`}>
                      <div className="text-center space-y-2">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
                        <p className="text-sm text-muted-foreground">Carregando preview...</p>
                      </div>
                    </div>
                    
                    {/* Error overlay */}
                    {iframeError && (
                      <div className="absolute inset-0 bg-white flex items-center justify-center p-4">
                        <div className="text-center space-y-3">
                          <AlertCircle className="h-16 w-16 text-destructive mx-auto" />
                          <div>
                            <h3 className="font-semibold text-base mb-2">Erro ao carregar preview</h3>
                            <p className="text-sm text-muted-foreground">
                              Não foi possível carregar o preview do menu. Verifique sua conexão.
                            </p>
                          </div>
                          <Button 
                            onClick={handleRefresh}
                            variant="default"
                          >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Tentar novamente
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    {/* Scroll hint indicator */}
                    {showScrollHint && !iframeLoading && !iframeError && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ delay: 1 }}
                        className="absolute bottom-8 left-1/2 -translate-x-1/2 pointer-events-none"
                      >
                        <div className="bg-black/80 text-white text-sm px-4 py-2 rounded-full flex items-center gap-2 shadow-lg">
                          <ChevronDown className="h-4 w-4 animate-bounce" />
                          Role para ver mais
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {device !== 'desktop' && device !== 'tablet' && orientation === 'portrait' && (
                    <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-20 h-1 bg-neutral-700 rounded-full" />
                  )}
                </div>
              </div>
              
              {/* Device Info - Outside frame */}
              <div className="text-center mt-4">
                <p className="text-sm font-medium text-white">
                  {currentDevice.name}
                </p>
                <p className="text-sm text-white/60">
                  {width} × {height}px
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <DeviceIcon className="h-5 w-5" />
              Preview Interativo
            </CardTitle>
            <CardDescription className="text-sm mt-1">
              Veja como funciona em diferentes dispositivos
            </CardDescription>
          </div>
          <Badge variant="secondary" className="text-sm px-3 py-1">
            <div className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse" />
            LIVE
          </Badge>
        </div>

        {/* Device Selector */}
        <Tabs 
          value={device} 
          onValueChange={(v) => {
            setIframeLoading(true);
            setDevice(v as DeviceType);
          }} 
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-4 h-11" role="tablist" aria-label="Seletor de dispositivos">
            <TabsTrigger value="iphone" className="text-sm gap-1.5 px-3" aria-label="iPhone (tecla 1)" title="iPhone (tecla 1)">
              <Smartphone className="h-4 w-4" aria-hidden="true" />
              iPhone
            </TabsTrigger>
            <TabsTrigger value="android" className="text-sm gap-1.5 px-3" aria-label="Android (tecla 2)" title="Android (tecla 2)">
              <Smartphone className="h-4 w-4" aria-hidden="true" />
              Android
            </TabsTrigger>
            <TabsTrigger value="tablet" className="text-sm gap-1.5 px-3" aria-label="Tablet (tecla 3)" title="Tablet (tecla 3)">
              <Tablet className="h-4 w-4" aria-hidden="true" />
              Tablet
            </TabsTrigger>
            <TabsTrigger value="desktop" className="text-sm gap-1.5 px-3" aria-label="Desktop (tecla 4)" title="Desktop (tecla 4)">
              <Monitor className="h-4 w-4" aria-hidden="true" />
              Desktop
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Controls */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            {device !== 'desktop' && (
              <Button
                size="sm"
                variant="outline"
                onClick={toggleOrientation}
                className="h-9 px-3 gap-2"
                aria-label={`Mudar para ${orientation === 'portrait' ? 'Landscape' : 'Portrait'}`}
                title="Rotacionar dispositivo (tecla R)"
              >
                <RotateCw className="h-4 w-4" />
                <span className="text-sm">{orientation === 'portrait' ? 'Portrait' : 'Landscape'}</span>
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={handleRefresh}
              className="h-9 px-3 gap-2"
              aria-label="Atualizar preview"
              title="Atualizar preview (Ctrl+R)"
            >
              <RefreshCw className="h-4 w-4" />
              <span className="text-sm hidden sm:inline">Atualizar</span>
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleZoomOut}
              className="h-9 w-9 p-0"
              disabled={zoom <= 0.5}
              aria-label="Diminuir zoom"
              title="Diminuir zoom (tecla -)"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={resetZoom}
              className="h-9 px-3 text-sm min-w-[60px]"
              aria-label={`Zoom atual ${Math.round(zoom * 100)}%`}
              title="Resetar zoom para 100% (tecla 0)"
            >
              {Math.round(zoom * 100)}%
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleZoomIn}
              className="h-9 w-9 p-0"
              disabled={zoom >= 1.5 || totalPreviewHeight >= 700}
              aria-label="Aumentar zoom"
              title={totalPreviewHeight >= 700 ? "Zoom máximo atingido para este dispositivo" : "Aumentar zoom (tecla +)"}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="default"
              onClick={toggleFullscreen}
              className="h-9 px-3 gap-2"
              aria-label="Abrir em fullscreen"
              title="Modo fullscreen (tecla F)"
            >
              <Maximize2 className="h-4 w-4" />
              <span className="text-sm">Fullscreen</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const cleanUrl = publicUrl.split('?')[0]; // Remove all query params
                window.open(cleanUrl, '_blank');
              }}
              className="h-9 px-3 gap-2"
              aria-label="Abrir menu em nova aba"
              title="Abrir menu em nova aba"
            >
              <ExternalLink className="h-4 w-4" />
              <span className="text-sm hidden sm:inline">Abrir</span>
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 bg-gradient-to-br from-muted/30 to-muted/10">
        <div className="flex items-center justify-center py-4 overflow-visible">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${device}-${orientation}-${key}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ 
                duration: 0.25,
                ease: [0.25, 0.1, 0.25, 1] // easeInOutCubic for smoother animation
              }}
              className="relative"
              style={{
                width: width * scale,
                height: 'auto', // Auto height to accommodate content
                maxHeight: '700px', // Increased limit to fit zoomed devices
              }}
            >
              {/* Device Frame */}
              <div 
                className={`relative rounded-[2.5rem] bg-neutral-900 shadow-2xl ${
                  device === 'desktop' ? 'rounded-xl' : ''
                }`}
                style={{
                  padding: device === 'desktop' ? '0' : '12px',
                  border: device === 'desktop' ? 'none' : '8px solid #1f1f1f',
                  height: (height * scale) + 'px', // Explicit height for device frame
                }}
              >
                {/* Notch (iPhone only) */}
                {currentDevice.hasNotch && orientation === 'portrait' && device === 'iphone' && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-neutral-800 rounded-b-2xl z-10" />
                )}

                {/* Screen */}
                <div 
                  className={`relative bg-white overflow-hidden h-full ${
                    device === 'desktop' ? 'rounded-lg' : 'rounded-[1.5rem]'
                  }`}
                  style={{
                    width: '100%',
                    height: '100%',
                  }}
                >
                  {/* Iframe with actual menu */}
                  <iframe
                    key={`${device}-${orientation}-${key}`}
                    src={publicUrl}
                    className="border-0"
                    title={`Preview do menu ${restaurantName} em ${currentDevice.name}`}
                    sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
                    onLoad={handleIframeLoad}
                    onError={handleIframeError}
                    style={{
                      pointerEvents: 'auto',
                      width: width + 'px',
                      height: height + 'px',
                      transform: `scale(${scale / currentDevice.scale})`,
                      transformOrigin: 'top left',
                    }}
                    aria-label={`Preview do menu público em ${currentDevice.name}`}
                  />

                  {/* Loading overlay */}
                  <div className={`absolute inset-0 bg-white flex items-center justify-center pointer-events-none transition-opacity duration-300 ${
                    iframeLoading && !iframeError ? 'opacity-100' : 'opacity-0'
                  }`}>
                    <div className="text-center space-y-2">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
                      <p className="text-xs text-muted-foreground">Carregando preview...</p>
                    </div>
                  </div>
                  
                  {/* Error overlay */}
                  {iframeError && (
                    <div className="absolute inset-0 bg-white flex items-center justify-center p-4">
                      <div className="text-center space-y-3 max-w-xs">
                        <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
                        <div>
                          <h3 className="font-semibold text-sm mb-1">Erro ao carregar preview</h3>
                          <p className="text-xs text-muted-foreground">
                            Não foi possível carregar o preview do menu. Verifique sua conexão.
                          </p>
                        </div>
                        <Button 
                          size="sm" 
                          onClick={handleRefresh}
                          className="mt-2"
                        >
                          <RefreshCw className="h-3.5 w-3.5 mr-2" />
                          Tentar novamente
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {/* Scroll hint indicator */}
                  {showScrollHint && !iframeLoading && !iframeError && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ delay: 1 }}
                      className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none"
                    >
                      <div className="bg-black/80 text-white text-xs px-3 py-2 rounded-full flex items-center gap-2 shadow-lg">
                        <ChevronDown className="h-3 w-3 animate-bounce" />
                        Role para ver mais
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Home Button (for portrait phones) */}
                {device !== 'desktop' && device !== 'tablet' && orientation === 'portrait' && (
                  <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-20 h-1 bg-neutral-700 rounded-full" />
                )}
              </div>
            </motion.div>
          </AnimatePresence>
          
          {/* Device Info - Moved outside motion.div */}
          <div className="text-center mt-3">
            <p className="text-xs font-medium text-muted-foreground">
              {currentDevice.name}
            </p>
            <p className="text-xs text-muted-foreground/60">
              {width} × {height}px
            </p>
          </div>
        </div>

        {/* Tips */}
        <div className="mt-4 space-y-2">
          <div className="rounded-lg border bg-blue-50 dark:bg-blue-950/20 p-3">
            <p className="text-xs text-blue-900 dark:text-blue-100">
              <strong>💡 Dica:</strong> Este preview é 100% funcional! Você pode navegar, 
              adicionar produtos ao carrinho e testar toda a experiência do cliente.
            </p>
          </div>
          <div className="rounded-lg border bg-amber-50 dark:bg-amber-950/20 p-3">
            <p className="text-xs text-amber-900 dark:text-amber-100">
              <strong>📱 Scroll:</strong> Role dentro do preview para ver o menu completo, 
              exatamente como seria no celular real. Use <strong>Fullscreen</strong> para melhor visualização!
            </p>
          </div>
          <div className="rounded-lg border bg-purple-50 dark:bg-purple-950/20 p-3">
            <p className="text-xs text-purple-900 dark:text-purple-100 mb-2">
              <strong>⌨️ Atalhos de Teclado:</strong>
            </p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-purple-800 dark:text-purple-200">
              <div><kbd className="px-1.5 py-0.5 bg-purple-200 dark:bg-purple-900 rounded text-[10px] font-mono">1-4</kbd> Trocar dispositivo</div>
              <div><kbd className="px-1.5 py-0.5 bg-purple-200 dark:bg-purple-900 rounded text-[10px] font-mono">F</kbd> Fullscreen</div>
              <div><kbd className="px-1.5 py-0.5 bg-purple-200 dark:bg-purple-900 rounded text-[10px] font-mono">R</kbd> Rotacionar</div>
              <div><kbd className="px-1.5 py-0.5 bg-purple-200 dark:bg-purple-900 rounded text-[10px] font-mono">+/-</kbd> Zoom</div>
              <div><kbd className="px-1.5 py-0.5 bg-purple-200 dark:bg-purple-900 rounded text-[10px] font-mono">0</kbd> Reset zoom</div>
              <div><kbd className="px-1.5 py-0.5 bg-purple-200 dark:bg-purple-900 rounded text-[10px] font-mono">Ctrl+R</kbd> Atualizar</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
