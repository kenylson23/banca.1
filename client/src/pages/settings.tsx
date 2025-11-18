import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Copy, Check, ExternalLink, Link2, Palette } from 'lucide-react';
import type { Restaurant } from '@shared/schema';

export default function Settings() {
  const [slug, setSlug] = useState('');
  const [copied, setCopied] = useState(false);
  const [primaryColor, setPrimaryColor] = useState('#EA580C');
  const [secondaryColor, setSecondaryColor] = useState('#DC2626');
  const [accentColor, setAccentColor] = useState('#0891B2');
  const [heroImageUrl, setHeroImageUrl] = useState('');
  const { toast } = useToast();

  const { data: currentUser } = useQuery<any>({
    queryKey: ['/api/auth/user'],
  });

  const { data: restaurant, isLoading, error, isError } = useQuery<Restaurant>({
    queryKey: ['/api/public/restaurants', currentUser?.restaurantId],
    enabled: !!currentUser?.restaurantId,
  });

  useEffect(() => {
    if (restaurant?.slug) {
      setSlug(restaurant.slug);
    }
    if (restaurant?.primaryColor) {
      setPrimaryColor(restaurant.primaryColor);
    }
    if (restaurant?.secondaryColor) {
      setSecondaryColor(restaurant.secondaryColor);
    }
    if (restaurant?.accentColor) {
      setAccentColor(restaurant.accentColor);
    }
    if (restaurant?.heroImageUrl) {
      setHeroImageUrl(restaurant.heroImageUrl);
    }
  }, [restaurant]);

  const updateSlugMutation = useMutation({
    mutationFn: async (newSlug: string) => {
      return apiRequest('PATCH', '/api/restaurants/slug', { slug: newSlug });
    },
    onSuccess: () => {
      toast({
        title: 'Slug atualizado!',
        description: 'Seu link público foi atualizado com sucesso.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/public/restaurants'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao atualizar slug',
        description: error?.message || 'Tente novamente mais tarde.',
        variant: 'destructive',
      });
    },
  });

  const updateAppearanceMutation = useMutation({
    mutationFn: async (data: {
      primaryColor?: string;
      secondaryColor?: string;
      accentColor?: string;
      heroImageUrl?: string;
    }) => {
      return apiRequest('PATCH', '/api/restaurants/appearance', data);
    },
    onSuccess: () => {
      toast({
        title: 'Aparência atualizada!',
        description: 'As cores do seu menu público foram atualizadas com sucesso.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/public/restaurants'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao atualizar aparência',
        description: error?.message || 'Tente novamente mais tarde.',
        variant: 'destructive',
      });
    },
  });

  const handleSaveSlug = () => {
    if (!slug || slug.trim().length < 3) {
      toast({
        title: 'Slug inválido',
        description: 'O slug deve ter no mínimo 3 caracteres.',
        variant: 'destructive',
      });
      return;
    }

    const cleanSlug = slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-');
    if (cleanSlug !== slug) {
      setSlug(cleanSlug);
    }
    updateSlugMutation.mutate(cleanSlug);
  };

  const publicLink = restaurant?.slug 
    ? `${window.location.origin}/r/${restaurant.slug}`
    : '';

  const handleCopyLink = () => {
    if (publicLink) {
      navigator.clipboard.writeText(publicLink);
      setCopied(true);
      toast({
        title: 'Link copiado!',
        description: 'O link foi copiado para a área de transferência.',
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSaveAppearance = () => {
    updateAppearanceMutation.mutate({
      primaryColor,
      secondaryColor,
      accentColor,
      heroImageUrl: heroImageUrl || '',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isError || (currentUser && !currentUser.restaurantId && currentUser.role !== 'superadmin')) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Configurações</h1>
          <p className="text-muted-foreground">
            Configure o link público do seu cardápio
          </p>
        </div>
        <Card>
          <CardContent className="p-8">
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">
                {isError 
                  ? `Erro ao carregar dados do restaurante: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
                  : 'Usuário não está associado a um restaurante'}
              </p>
              <p className="text-sm text-muted-foreground">
                Verifique os logs do navegador para mais detalhes ou entre em contato com o suporte.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (currentUser?.role === 'superadmin') {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Configurações</h1>
          <p className="text-muted-foreground">
            Área disponível apenas para administradores de restaurantes
          </p>
        </div>
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">
              Esta seção é destinada a administradores de restaurantes específicos. 
              Como superadmin, você pode gerenciar restaurantes através do painel Super Admin.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Configurações</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Configure seu restaurante e personalize o menu público
        </p>
      </div>

      <Tabs defaultValue="link" className="w-full">
        <TabsList>
          <TabsTrigger value="link" data-testid="tab-link">
            <Link2 className="h-4 w-4 mr-2" />
            Link Público
          </TabsTrigger>
          <TabsTrigger value="appearance" data-testid="tab-appearance">
            <Palette className="h-4 w-4 mr-2" />
            Aparência
          </TabsTrigger>
        </TabsList>

        <TabsContent value="link" className="space-y-6">
          <Card>
        <CardHeader>
          <CardTitle>Link Público do Cardápio</CardTitle>
          <CardDescription>
            Compartilhe este link nas redes sociais, WhatsApp ou onde quiser. Seus clientes poderão fazer pedidos de delivery e retirada.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="slug">Slug Personalizado</Label>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-2">
                <span className="text-sm text-muted-foreground break-all sm:whitespace-nowrap">
                  {window.location.origin}/r/
                </span>
                <Input
                  id="slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="meu-restaurante"
                  data-testid="input-slug"
                  className="flex-1"
                />
              </div>
              <Button
                onClick={handleSaveSlug}
                disabled={updateSlugMutation.isPending || !slug}
                data-testid="button-save-slug"
                className="w-full sm:w-auto"
              >
                {updateSlugMutation.isPending ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Use apenas letras minúsculas, números e hífens (exemplo: pizzaria-dona-maria)
            </p>
          </div>

          {restaurant?.slug && (
            <div className="space-y-3 pt-4 border-t">
              <Label>Seu Link Público</Label>
              <div className="flex gap-2">
                <Input
                  value={publicLink}
                  readOnly
                  data-testid="input-public-link"
                  className="font-mono text-sm flex-1 min-w-0"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopyLink}
                  data-testid="button-copy-link"
                  className="flex-shrink-0"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => window.open(publicLink, '_blank')}
                  data-testid="button-open-link"
                  className="flex-shrink-0"
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Como Funciona</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
              1
            </div>
            <div>
              <p className="font-medium">Configure seu slug personalizado</p>
              <p className="text-sm text-muted-foreground">Escolha um nome único para o link do seu restaurante</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
              2
            </div>
            <div>
              <p className="font-medium">Compartilhe o link</p>
              <p className="text-sm text-muted-foreground">Envie para seus clientes via WhatsApp, Instagram, Facebook, etc.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
              3
            </div>
            <div>
              <p className="font-medium">Receba pedidos</p>
              <p className="text-sm text-muted-foreground">Clientes escolhem entre delivery ou retirada no local</p>
            </div>
          </div>
        </CardContent>
      </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personalizar Cores</CardTitle>
              <CardDescription>
                Escolha as cores que representam sua marca. Elas serão aplicadas no seu menu público.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="primaryColor">Cor Primária</Label>
                  <div className="flex gap-2">
                    <Input
                      id="primaryColor"
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="h-10 w-20 cursor-pointer"
                      data-testid="input-primary-color"
                    />
                    <Input
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      placeholder="#EA580C"
                      className="flex-1"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Cor principal do seu restaurante
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="secondaryColor">Cor Secundária</Label>
                  <div className="flex gap-2">
                    <Input
                      id="secondaryColor"
                      type="color"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="h-10 w-20 cursor-pointer"
                      data-testid="input-secondary-color"
                    />
                    <Input
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      placeholder="#DC2626"
                      className="flex-1"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Cor secundária para destaques
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accentColor">Cor de Destaque</Label>
                  <div className="flex gap-2">
                    <Input
                      id="accentColor"
                      type="color"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="h-10 w-20 cursor-pointer"
                      data-testid="input-accent-color"
                    />
                    <Input
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      placeholder="#0891B2"
                      className="flex-1"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Cor para botões e links
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="heroImageUrl">Imagem Hero (Banner)</Label>
                <Input
                  id="heroImageUrl"
                  value={heroImageUrl}
                  onChange={(e) => setHeroImageUrl(e.target.value)}
                  placeholder="https://exemplo.com/imagem-banner.jpg"
                  data-testid="input-hero-image-url"
                />
                <p className="text-xs text-muted-foreground">
                  URL da imagem de destaque que aparecerá no topo do menu público (1200x400px recomendado)
                </p>
              </div>

              <Button
                onClick={handleSaveAppearance}
                disabled={updateAppearanceMutation.isPending}
                data-testid="button-save-appearance"
                className="w-full sm:w-auto"
              >
                {updateAppearanceMutation.isPending ? 'Salvando...' : 'Salvar Aparência'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Preview das Cores</CardTitle>
              <CardDescription>
                Veja como as cores escolhidas ficam combinadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div 
                  className="p-6 rounded-lg" 
                  style={{ backgroundColor: primaryColor }}
                >
                  <p className="text-white font-semibold">Cor Primária</p>
                  <p className="text-white text-sm opacity-90">Textos e elementos principais</p>
                </div>
                <div 
                  className="p-6 rounded-lg" 
                  style={{ backgroundColor: secondaryColor }}
                >
                  <p className="text-white font-semibold">Cor Secundária</p>
                  <p className="text-white text-sm opacity-90">Destaques e ênfases</p>
                </div>
                <div 
                  className="p-6 rounded-lg" 
                  style={{ backgroundColor: accentColor }}
                >
                  <p className="text-white font-semibold">Cor de Destaque</p>
                  <p className="text-white text-sm opacity-90">Botões e chamadas para ação</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
