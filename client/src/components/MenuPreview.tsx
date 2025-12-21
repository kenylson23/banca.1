import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Smartphone, Eye, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';

interface MenuPreviewProps {
  restaurantSlug: string;
  restaurantName: string;
  logoUrl?: string | null;
  heroImageUrl?: string | null;
}

export function MenuPreview({ 
  restaurantSlug, 
  restaurantName, 
  logoUrl, 
  heroImageUrl 
}: MenuPreviewProps) {
  const [, setLocation] = useLocation();
  const publicUrl = `/r/${restaurantSlug}`;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Preview do Menu Público
            </CardTitle>
            <CardDescription className="text-xs">
              Veja como os clientes visualizam seu menu
            </CardDescription>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => window.open(publicUrl, '_blank')}
            className="gap-2"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Abrir
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Mobile Preview Frame */}
        <div className="relative mx-auto" style={{ maxWidth: '320px' }}>
          {/* Phone Frame */}
          <div className="relative bg-neutral-900 rounded-[2.5rem] p-3 shadow-2xl border-8 border-neutral-800">
            {/* Notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-neutral-800 rounded-b-2xl" />
            
            {/* Screen */}
            <div className="relative bg-black rounded-[1.5rem] overflow-hidden aspect-[9/19.5]">
              {/* Preview Content */}
              <div className="absolute inset-0 overflow-y-auto">
                {/* Hero Banner Mini */}
                <div 
                  className="relative h-24 overflow-hidden"
                  style={{
                    backgroundImage: heroImageUrl 
                      ? `url(${heroImageUrl})` 
                      : 'linear-gradient(135deg, #78350f 0%, #451a03 50%, #1c1917 100%)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                  
                  {/* Logo */}
                  {logoUrl && (
                    <div className="absolute top-2 left-2 w-8 h-8 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 flex items-center justify-center overflow-hidden">
                      <img src={logoUrl} alt="Logo" className="w-full h-full object-contain p-1" />
                    </div>
                  )}
                  
                  {/* Restaurant Name */}
                  <div className="absolute bottom-2 left-2 right-2">
                    <h1 className="text-white text-sm font-bold truncate">
                      {restaurantName}
                    </h1>
                  </div>
                </div>

                {/* Categories Preview */}
                <div className="bg-neutral-900 p-2 space-y-2">
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {['Todos', 'Entradas', 'Principais', 'Bebidas'].map((cat) => (
                      <div key={cat} className="flex-shrink-0 flex flex-col items-center gap-1">
                        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                          <div className="w-2 h-2 bg-white/30 rounded" />
                        </div>
                        <span className="text-[8px] text-white/70">{cat}</span>
                      </div>
                    ))}
                  </div>

                  {/* Product Cards Mini */}
                  <div className="grid grid-cols-2 gap-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                        <div className="h-12 bg-gradient-to-br from-neutral-800 to-neutral-900" />
                        <div className="p-1.5 space-y-1">
                          <div className="h-2 bg-white/10 rounded w-3/4" />
                          <div className="flex justify-between items-center">
                            <div className="h-1.5 bg-white/10 rounded w-1/3" />
                            <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Badge de atualização ao vivo */}
              <div className="absolute top-1 right-1">
                <Badge variant="secondary" className="text-[8px] px-1.5 py-0.5 bg-green-500/20 text-green-400 border-green-500/30">
                  <div className="w-1 h-1 rounded-full bg-green-500 mr-1 animate-pulse" />
                  LIVE
                </Badge>
              </div>
            </div>

            {/* Home Button */}
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-20 h-1 bg-neutral-700 rounded-full" />
          </div>

          {/* Phone Label */}
          <div className="text-center mt-3">
            <div className="flex items-center justify-center gap-1.5 text-muted-foreground">
              <Smartphone className="h-3.5 w-3.5" />
              <span className="text-xs">Preview Mobile</span>
            </div>
          </div>
        </div>

        {/* Info about live updates */}
        <div className="pt-2 border-t">
          <div className="text-center p-2 rounded-lg bg-muted/30">
            <div className="text-xs text-muted-foreground">
              Preview atualiza automaticamente
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="rounded-lg border bg-purple-50 dark:bg-purple-950/20 p-3">
          <p className="text-xs text-purple-900 dark:text-purple-100">
            <strong>✨ Atualização em tempo real:</strong> Este preview reflete as mudanças 
            instantaneamente. Logo e foto de capa aparecem aqui assim que você fizer upload!
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
