import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Smartphone, 
  Tablet, 
  Monitor, 
  RotateCw, 
  ExternalLink,
  Eye,
  Utensils
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

interface MockMenuPreviewProps {
  restaurantSlug: string;
  restaurantName: string;
  logoUrl?: string | null;
  heroImageUrl?: string | null;
}

type DeviceType = 'iphone' | 'android' | 'tablet' | 'desktop';
type Orientation = 'portrait' | 'landscape';

const devices = {
  iphone: {
    name: 'iPhone 14 Pro',
    width: 390,
    height: 844,
    scale: 0.45,
    hasNotch: true,
    icon: Smartphone,
  },
  android: {
    name: 'Pixel 7',
    width: 412,
    height: 915,
    scale: 0.42,
    hasNotch: false,
    icon: Smartphone,
  },
  tablet: {
    name: 'iPad Air',
    width: 820,
    height: 1180,
    scale: 0.32,
    hasNotch: false,
    icon: Tablet,
  },
  desktop: {
    name: 'Desktop',
    width: 1440,
    height: 900,
    scale: 0.28,
    hasNotch: false,
    icon: Monitor,
  },
};

export function MockMenuPreview({ 
  restaurantSlug, 
  restaurantName,
  logoUrl,
  heroImageUrl
}: MockMenuPreviewProps) {
  const [device, setDevice] = useState<DeviceType>('iphone');
  const [orientation, setOrientation] = useState<Orientation>('portrait');
  
  const publicUrl = `/r/${restaurantSlug}`;
  const currentDevice = devices[device];
  
  const toggleOrientation = () => {
    setOrientation(prev => prev === 'portrait' ? 'landscape' : 'portrait');
  };

  const width = orientation === 'portrait' ? currentDevice.width : currentDevice.height;
  const height = orientation === 'portrait' ? currentDevice.height : currentDevice.width;
  const scale = currentDevice.scale;

  const DeviceIcon = currentDevice.icon;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Preview do Menu
            </CardTitle>
            <CardDescription className="text-sm mt-1">
              Visualização do seu menu público
            </CardDescription>
          </div>
          <Button
            size="sm"
            variant="default"
            onClick={() => window.open(publicUrl, '_blank')}
            className="gap-2"
          >
            <ExternalLink className="h-4 w-4" />
            Abrir Menu
          </Button>
        </div>

        {/* Device Selector */}
        <Tabs 
          value={device} 
          onValueChange={(v) => setDevice(v as DeviceType)} 
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-4 h-11" role="tablist" aria-label="Seletor de dispositivos">
            <TabsTrigger value="iphone" className="text-sm gap-1.5 px-3">
              <Smartphone className="h-4 w-4" />
              iPhone
            </TabsTrigger>
            <TabsTrigger value="android" className="text-sm gap-1.5 px-3">
              <Smartphone className="h-4 w-4" />
              Android
            </TabsTrigger>
            <TabsTrigger value="tablet" className="text-sm gap-1.5 px-3">
              <Tablet className="h-4 w-4" />
              Tablet
            </TabsTrigger>
            <TabsTrigger value="desktop" className="text-sm gap-1.5 px-3">
              <Monitor className="h-4 w-4" />
              Desktop
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Orientation Toggle */}
        {device !== 'desktop' && (
          <div className="flex justify-center">
            <Button
              size="sm"
              variant="outline"
              onClick={toggleOrientation}
              className="h-9 px-3 gap-2"
            >
              <RotateCw className="h-4 w-4" />
              <span className="text-sm">{orientation === 'portrait' ? 'Portrait' : 'Landscape'}</span>
            </Button>
          </div>
        )}
      </CardHeader>

      <CardContent className="p-4 bg-gradient-to-br from-muted/30 to-muted/10">
        <div className="flex flex-col items-center justify-center py-4 min-h-[500px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${device}-${orientation}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ 
                duration: 0.25,
                ease: [0.25, 0.1, 0.25, 1]
              }}
              className="relative flex flex-col items-center"
            >
              {/* Device Frame */}
              <div 
                className={`relative bg-neutral-900 shadow-2xl overflow-hidden ${
                  device === 'desktop' ? 'rounded-xl border-[16px] border-neutral-800' : 'rounded-[2.5rem]'
                }`}
                style={{
                  width: (width * scale) + (device === 'desktop' ? 32 : 40),
                  height: (height * scale) + (device === 'desktop' ? 48 : 40),
                  padding: device === 'desktop' ? '16px 16px 32px 16px' : '12px',
                  border: device === 'desktop' ? '16px solid #1f1f1f' : '8px solid #1f1f1f',
                }}
              >
                {/* Notch (iPhone only) */}
                {currentDevice.hasNotch && orientation === 'portrait' && device === 'iphone' && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-neutral-800 rounded-b-2xl z-10" />
                )}

                {/* Desktop Webcam */}
                {device === 'desktop' && (
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-neutral-700 z-10" />
                )}

                {/* Screen with Mock Content */}
                <div 
                  className={`relative bg-neutral-950 flex flex-col ${
                    device === 'desktop' ? 'rounded-lg' : 'rounded-[1.5rem]'
                  }`}
                  style={{
                    width: width * scale,
                    height: height * scale,
                  }}
                >
                  {/* Hero Banner */}
                  <div 
                    className="relative w-full flex-shrink-0"
                    style={{
                      height: device === 'desktop' ? '140px' : device === 'tablet' ? '120px' : '100px',
                      backgroundImage: heroImageUrl 
                        ? `url(${heroImageUrl})` 
                        : 'linear-gradient(135deg, #78350f 0%, #451a03 50%, #1c1917 100%)',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                    
                    {/* Logo */}
                    {logoUrl ? (
                      <div 
                        className="absolute bg-white/10 backdrop-blur-md rounded-lg border border-white/20 flex items-center justify-center overflow-hidden"
                        style={{
                          top: device === 'desktop' ? '12px' : device === 'tablet' ? '10px' : '8px',
                          left: device === 'desktop' ? '12px' : device === 'tablet' ? '10px' : '8px',
                          width: device === 'desktop' ? '40px' : device === 'tablet' ? '32px' : '28px',
                          height: device === 'desktop' ? '40px' : device === 'tablet' ? '32px' : '28px',
                        }}
                      >
                        <img src={logoUrl} alt="Logo" className="w-full h-full object-contain p-1" />
                      </div>
                    ) : (
                      <div 
                        className="absolute bg-white/10 backdrop-blur-md rounded-lg border border-white/20 flex items-center justify-center"
                        style={{
                          top: device === 'desktop' ? '12px' : device === 'tablet' ? '10px' : '8px',
                          left: device === 'desktop' ? '12px' : device === 'tablet' ? '10px' : '8px',
                          width: device === 'desktop' ? '40px' : device === 'tablet' ? '32px' : '28px',
                          height: device === 'desktop' ? '40px' : device === 'tablet' ? '32px' : '28px',
                        }}
                      >
                        <Utensils 
                          className="text-white/60" 
                          style={{
                            width: device === 'desktop' ? '20px' : '16px',
                            height: device === 'desktop' ? '20px' : '16px'
                          }}
                        />
                      </div>
                    )}
                    
                    {/* Restaurant Name */}
                    <div 
                      className="absolute bottom-0 left-0 right-0"
                      style={{
                        padding: device === 'desktop' ? '12px' : device === 'tablet' ? '10px' : '8px'
                      }}
                    >
                      <h1 
                        className="text-white font-bold truncate drop-shadow-lg"
                        style={{
                          fontSize: device === 'desktop' ? '20px' : device === 'tablet' ? '16px' : '14px'
                        }}
                      >
                        {restaurantName}
                      </h1>
                    </div>
                  </div>

                  {/* Categories Section */}
                  <div 
                    className="flex-1 flex flex-col"
                    style={{
                      padding: device === 'desktop' ? '12px' : device === 'tablet' ? '10px' : '8px'
                    }}
                  >
                    {/* Category Pills */}
                    <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-hide mb-2">
                      {['Todos', 'Entradas', 'Principais', 'Bebidas'].map((cat, i) => (
                        <div 
                          key={cat} 
                          className={`flex-shrink-0 rounded-full border flex items-center justify-center ${
                            i === 0 ? 'bg-amber-500 border-amber-500' : 'bg-white/5 border-white/10'
                          }`}
                          style={{
                            padding: device === 'desktop' ? '6px 14px' : device === 'tablet' ? '5px 12px' : '4px 10px',
                          }}
                        >
                          <span 
                            className={`font-medium whitespace-nowrap ${i === 0 ? 'text-white' : 'text-white/70'}`}
                            style={{
                              fontSize: device === 'desktop' ? '12px' : device === 'tablet' ? '11px' : '9px'
                            }}
                          >
                            {cat}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Product Cards Grid */}
                    <div 
                      className="grid mb-4"
                      style={{
                        gridTemplateColumns: device === 'desktop' ? 'repeat(4, 1fr)' : 
                                           device === 'tablet' ? 'repeat(3, 1fr)' : 
                                           'repeat(2, 1fr)',
                        gap: device === 'desktop' ? '10px' : device === 'tablet' ? '8px' : '6px',
                        marginBottom: device === 'desktop' ? '16px' : device === 'tablet' ? '12px' : '8px'
                      }}
                    >
                      {[1, 2, 3, 4].map((i) => (
                        <div 
                          key={i} 
                          className="bg-white/5 rounded-lg border border-white/10 overflow-hidden"
                          style={{
                            borderRadius: device === 'desktop' ? '12px' : device === 'tablet' ? '10px' : '8px'
                          }}
                        >
                          {/* Product Image Placeholder */}
                          <div 
                            className="bg-gradient-to-br from-neutral-800 to-neutral-900 relative"
                            style={{
                              height: device === 'desktop' ? '80px' : device === 'tablet' ? '70px' : '60px'
                            }}
                          >
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Utensils 
                                className="text-white/20"
                                style={{
                                  width: device === 'desktop' ? '32px' : device === 'tablet' ? '28px' : '24px',
                                  height: device === 'desktop' ? '32px' : device === 'tablet' ? '28px' : '24px'
                                }}
                              />
                            </div>
                          </div>
                          {/* Product Info */}
                          <div 
                            className="space-y-1"
                            style={{
                              padding: device === 'desktop' ? '10px' : device === 'tablet' ? '8px' : '6px'
                            }}
                          >
                            {/* Product Name */}
                            <div 
                              className="bg-white/10 rounded"
                              style={{
                                height: device === 'desktop' ? '10px' : device === 'tablet' ? '9px' : '7px',
                                width: '75%'
                              }}
                            />
                            {/* Price and Button */}
                            <div className="flex justify-between items-center">
                              <div 
                                className="bg-white/10 rounded"
                                style={{
                                  height: device === 'desktop' ? '8px' : device === 'tablet' ? '7px' : '5px',
                                  width: '35%'
                                }}
                              />
                              <div 
                                className="rounded-full bg-amber-500/80 flex items-center justify-center"
                                style={{
                                  width: device === 'desktop' ? '20px' : device === 'tablet' ? '18px' : '14px',
                                  height: device === 'desktop' ? '20px' : device === 'tablet' ? '18px' : '14px'
                                }}
                              >
                                <span 
                                  className="text-white font-bold"
                                  style={{
                                    fontSize: device === 'desktop' ? '12px' : device === 'tablet' ? '10px' : '8px'
                                  }}
                                >
                                  +
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Footer */}
                    <div 
                      className="border-t border-white/10 bg-black/20 mt-auto"
                      style={{
                        padding: device === 'desktop' ? '12px' : device === 'tablet' ? '10px' : '8px'
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {/* Cart Icon */}
                          <div 
                            className="bg-amber-500 rounded-full flex items-center justify-center"
                            style={{
                              width: device === 'desktop' ? '32px' : device === 'tablet' ? '28px' : '24px',
                              height: device === 'desktop' ? '32px' : device === 'tablet' ? '28px' : '24px'
                            }}
                          >
                            <span 
                              className="text-white font-bold"
                              style={{
                                fontSize: device === 'desktop' ? '14px' : device === 'tablet' ? '12px' : '10px'
                              }}
                            >
                              🛒
                            </span>
                          </div>
                          {/* Cart Info */}
                          <div>
                            <div 
                              className="bg-white/10 rounded"
                              style={{
                                height: device === 'desktop' ? '10px' : device === 'tablet' ? '9px' : '7px',
                                width: device === 'desktop' ? '60px' : device === 'tablet' ? '50px' : '40px',
                                marginBottom: '4px'
                              }}
                            />
                            <div 
                              className="bg-white/10 rounded"
                              style={{
                                height: device === 'desktop' ? '8px' : device === 'tablet' ? '7px' : '6px',
                                width: device === 'desktop' ? '80px' : device === 'tablet' ? '70px' : '60px'
                              }}
                            />
                          </div>
                        </div>
                        {/* View Cart Button */}
                        <div 
                          className="bg-amber-500 rounded-full flex items-center justify-center"
                          style={{
                            padding: device === 'desktop' ? '8px 16px' : device === 'tablet' ? '6px 14px' : '5px 12px',
                          }}
                        >
                          <span 
                            className="text-white font-semibold"
                            style={{
                              fontSize: device === 'desktop' ? '12px' : device === 'tablet' ? '11px' : '9px'
                            }}
                          >
                            Ver Carrinho
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Home Button (for portrait phones) */}
                {device !== 'desktop' && device !== 'tablet' && orientation === 'portrait' && (
                  <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-20 h-1 bg-neutral-700 rounded-full" />
                )}

                {/* Desktop Stand */}
                {device === 'desktop' && (
                  <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-32 h-1 bg-neutral-800 rounded-full" />
                )}
              </div>

              {/* Device Info */}
              <div className="text-center mt-3">
                <p className="text-xs font-medium text-muted-foreground">
                  {currentDevice.name}
                </p>
                <p className="text-xs text-muted-foreground/60">
                  {width} × {height}px
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Tips */}
        <div className="mt-4 space-y-2">
          <div className="rounded-lg border bg-blue-50 dark:bg-blue-950/20 p-3">
            <p className="text-xs text-blue-900 dark:text-blue-100">
              <strong>💡 Dica:</strong> Este é um preview visual do seu menu. 
              Clique em "Abrir Menu" para ver e testar a versão completa funcional.
            </p>
          </div>
          <div className="rounded-lg border bg-purple-50 dark:bg-purple-950/20 p-3">
            <p className="text-xs text-purple-900 dark:text-purple-100">
              <strong>✨ Personalização:</strong> Logo e foto de capa aparecem aqui assim 
              que você fizer upload na aba Aparência!
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
