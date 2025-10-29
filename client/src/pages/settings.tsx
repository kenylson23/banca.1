import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Copy, Check, ExternalLink } from 'lucide-react';
import type { Restaurant } from '@shared/schema';

export default function Settings() {
  const [slug, setSlug] = useState('');
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const { data: currentUser } = useQuery<any>({
    queryKey: ['/api/auth/user'],
  });

  const { data: restaurant, isLoading } = useQuery<Restaurant>({
    queryKey: ['/api/public/restaurants', currentUser?.restaurantId],
    enabled: !!currentUser?.restaurantId,
  });

  useEffect(() => {
    if (restaurant?.slug) {
      setSlug(restaurant.slug);
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Configurações</h1>
        <p className="text-muted-foreground">
          Configure o link público do seu cardápio
        </p>
      </div>

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
            <div className="flex gap-2">
              <div className="flex-1 flex items-center gap-2">
                <span className="text-sm text-muted-foreground whitespace-nowrap">
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
                  className="font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopyLink}
                  data-testid="button-copy-link"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => window.open(publicLink, '_blank')}
                  data-testid="button-open-link"
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
    </div>
  );
}
