import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Copy, Check, ExternalLink, Link2, Palette, Image as ImageIcon, Upload } from 'lucide-react';
import type { Restaurant } from '@shared/schema';

export default function Settings() {
  const [slug, setSlug] = useState('');
  const [copied, setCopied] = useState(false);
  const [primaryColor, setPrimaryColor] = useState('#EA580C');
  const [secondaryColor, setSecondaryColor] = useState('#DC2626');
  const [accentColor, setAccentColor] = useState('#0891B2');
  const [heroImageUrl, setHeroImageUrl] = useState('');
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingHero, setUploadingHero] = useState(false);
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

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Arquivo muito grande',
        description: 'O tamanho máximo permitido é 5MB.',
        variant: 'destructive',
      });
      return;
    }

    setUploadingLogo(true);
    const formData = new FormData();
    formData.append('logo', file);

    try {
      const response = await fetch('/api/restaurants/upload-logo', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao fazer upload');
      }

      const data = await response.json();
      toast({
        title: 'Logo atualizado!',
        description: 'O logo do restaurante foi atualizado com sucesso.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/public/restaurants'] });
    } catch (error: any) {
      toast({
        title: 'Erro ao fazer upload',
        description: error?.message || 'Tente novamente mais tarde.',
        variant: 'destructive',
      });
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleHeroImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Arquivo muito grande',
        description: 'O tamanho máximo permitido é 5MB.',
        variant: 'destructive',
      });
      return;
    }

    setUploadingHero(true);
    const formData = new FormData();
    formData.append('heroImage', file);

    try {
      const response = await fetch('/api/restaurants/upload-hero', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao fazer upload');
      }

      const data = await response.json();
      setHeroImageUrl(data.heroImageUrl);
      toast({
        title: 'Foto de capa atualizada!',
        description: 'A foto de capa foi atualizada com sucesso.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/public/restaurants'] });
    } catch (error: any) {
      toast({
        title: 'Erro ao fazer upload',
        description: error?.message || 'Tente novamente mais tarde.',
        variant: 'destructive',
      });
    } finally {
      setUploadingHero(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isError || (currentUser && !currentUser.restaurantId && currentUser.role !== 'superadmin')) {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold">Configurações</h1>
          <p className="text-muted-foreground">
            Configure o link público do seu cardápio
          </p>
        </div>
        <Card>
          <CardContent className="p-6">
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
      <div className="space-y-4">
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
    <div className="min-h-screen">
      <div className="space-y-4 p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
            Configurações
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Configure seu restaurante e personalize o menu público
          </p>
        </motion.div>

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

        <TabsContent value="link" className="space-y-4">
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

        <TabsContent value="appearance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Logo do Restaurante</CardTitle>
              <CardDescription>
                Faça upload do logo que aparecerá no menu público (PNG, JPG, GIF ou WebP - máx 5MB)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {restaurant?.logoUrl && (
                <div className="flex justify-center p-4 border rounded-lg bg-muted/50">
                  <img 
                    src={restaurant.logoUrl} 
                    alt="Logo atual" 
                    className="h-24 w-24 object-contain"
                  />
                </div>
              )}
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  disabled={uploadingLogo}
                  className="flex-1"
                  data-testid="input-logo-upload"
                />
                <Button
                  disabled={uploadingLogo}
                  variant="outline"
                  className="w-full sm:w-auto"
                >
                  {uploadingLogo ? (
                    <>Enviando...</>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Selecionar Logo
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Foto de Capa (Hero)</CardTitle>
              <CardDescription>
                Faça upload da imagem de destaque que aparecerá no topo do menu público (1200x400px recomendado - máx 5MB)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {restaurant?.heroImageUrl && (
                <div className="flex justify-center p-4 border rounded-lg bg-muted/50">
                  <img 
                    src={restaurant.heroImageUrl} 
                    alt="Foto de capa atual" 
                    className="max-h-48 w-full object-cover rounded-md"
                  />
                </div>
              )}
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleHeroImageUpload}
                  disabled={uploadingHero}
                  className="flex-1"
                  data-testid="input-hero-upload"
                />
                <Button
                  disabled={uploadingHero}
                  variant="outline"
                  className="w-full sm:w-auto"
                >
                  {uploadingHero ? (
                    <>Enviando...</>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Selecionar Foto
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Personalizar Cores</CardTitle>
              <CardDescription>
                Escolha as cores que representam sua marca. Elas serão aplicadas no seu menu público.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
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

              <Button
                onClick={handleSaveAppearance}
                disabled={updateAppearanceMutation.isPending}
                data-testid="button-save-appearance"
                className="w-full sm:w-auto"
              >
                {updateAppearanceMutation.isPending ? 'Salvando...' : 'Salvar Cores'}
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
    </div>
  );
}
