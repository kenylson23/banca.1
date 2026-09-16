import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Copy, Check, ExternalLink, Link2, Palette, Image as ImageIcon, Upload, Info, Image, Clock, QrCode, Eye, BarChart3, CreditCard, Plus, Trash2, ReceiptText } from 'lucide-react';
import type { Restaurant } from '@shared/schema';
import { BusinessHoursManager } from '@/components/BusinessHoursManager';
import { QRCodeGenerator } from '@/components/QRCodeGenerator';
import { LinkAnalytics } from '@/components/LinkAnalytics';
import { MockMenuPreview } from '@/components/MockMenuPreview';
import { RestaurantStatusControl } from '@/components/RestaurantStatusControl';
import { apiFetch } from '@/lib/api-url';

type LinkSection = 'link' | 'qrcode' | 'preview' | 'analytics';
type PaymentMethodDraft = { id: string; name: string; reference: string };
type FiscalDraft = {
  nif: string;
  vatRegime: string;
  vatRate: string;
  documentSeries: string;
  invoicePrefix: string;
  fiscalAddress: string;
  email: string;
  website: string;
  whatsappNumber: string;
  legalFooter: string;
};

export default function Settings() {
  const [slug, setSlug] = useState('');
  const [copied, setCopied] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingHero, setUploadingHero] = useState(false);
  const [activeSection, setActiveSection] = useState<LinkSection>('link');
  const [activeTab, setActiveTab] = useState<'link' | 'appearance' | 'hours' | 'payments' | 'fiscal'>('link');
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodDraft[]>([]);
  const [fiscalDraft, setFiscalDraft] = useState<FiscalDraft>({
    nif: '', vatRegime: '', vatRate: '', documentSeries: '', invoicePrefix: '',
    fiscalAddress: '', email: '', website: '', whatsappNumber: '', legalFooter: '',
  });
  const { toast } = useToast();
  const [, setLocation] = useLocation();

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
    if (restaurant?.paymentMethods) {
      setPaymentMethods(restaurant.paymentMethods);
    }
    if (restaurant) {
      setFiscalDraft({
        nif: restaurant.nif || '',
        vatRegime: restaurant.vatRegime || '',
        vatRate: restaurant.vatRate || '',
        documentSeries: restaurant.documentSeries || '',
        invoicePrefix: restaurant.invoicePrefix || '',
        fiscalAddress: restaurant.fiscalAddress || '',
        email: restaurant.email || '',
        website: restaurant.website || '',
        whatsappNumber: restaurant.whatsappNumber || '',
        legalFooter: restaurant.legalFooter || '',
      });
    }
  }, [restaurant]);

  const updateFiscalMutation = useMutation({
    mutationFn: async (data: FiscalDraft) => apiRequest('PATCH', '/api/restaurants/fiscal', data),
    onSuccess: () => {
      toast({ title: 'Configuração fiscal guardada', description: 'Os próximos documentos usarão estes dados do restaurante.' });
      queryClient.invalidateQueries({ queryKey: ['/api/public/restaurants'] });
    },
    onError: (error: any) => {
      toast({ title: 'Erro ao guardar configuração fiscal', description: error?.message || 'Verifique os dados e tente novamente.', variant: 'destructive' });
    },
  });

  const updateFiscalField = (field: keyof FiscalDraft, value: string) => {
    setFiscalDraft((current) => ({ ...current, [field]: value }));
  };

  const updatePaymentMethodsMutation = useMutation({
    mutationFn: async (methods: PaymentMethodDraft[]) => {
      return apiRequest('PATCH', '/api/restaurants/payment-methods', { paymentMethods: methods });
    },
    onSuccess: () => {
      toast({
        title: 'Formas de pagamento atualizadas',
        description: 'O menu público e o customer menu já usam esta configuração.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/public/restaurants'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao guardar formas de pagamento',
        description: error?.message || 'Tente novamente mais tarde.',
        variant: 'destructive',
      });
    },
  });

  const addPaymentMethod = () => {
    setPaymentMethods((current) => [
      ...current,
      { id: `payment-${Date.now()}`, name: '', reference: '' },
    ]);
  };

  const updatePaymentMethod = (index: number, field: keyof PaymentMethodDraft, value: string) => {
    setPaymentMethods((current) => current.map((method, i) => (
      i === index ? { ...method, [field]: value } : method
    )));
  };

  const removePaymentMethod = (index: number) => {
    setPaymentMethods((current) => current.filter((_, i) => i !== index));
  };

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
      const response = await apiFetch('/api/restaurants/upload-logo', {
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
      const response = await apiFetch('/api/restaurants/upload-hero', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao fazer upload');
      }

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
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isError || (currentUser && !currentUser.restaurantId && currentUser.role !== 'superadmin')) {
    return (
      <div className="min-h-screen p-4 sm:p-6">
        <div className="max-w-4xl mx-auto space-y-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">Configurações</h1>
            <p className="text-sm text-muted-foreground">
              Configure o link público do seu cardápio
            </p>
          </div>
          <Card>
            <CardContent className="p-6">
              <div className="text-center space-y-3">
                <p className="text-sm text-muted-foreground">
                  {isError 
                    ? `Erro ao carregar dados do restaurante: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
                    : 'Usuário não está associado a um restaurante'}
                </p>
                <p className="text-xs text-muted-foreground">
                  Verifique os logs do navegador para mais detalhes ou entre em contato com o suporte.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (currentUser?.role === 'superadmin') {
    return (
      <div className="min-h-screen p-4 sm:p-6">
        <div className="max-w-4xl mx-auto space-y-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">Configurações</h1>
            <p className="text-sm text-muted-foreground">
              Área disponível apenas para administradores de restaurantes
            </p>
          </div>
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-sm text-muted-foreground">
                Esta seção é destinada a administradores de restaurantes específicos. 
                Como superadmin, você pode gerenciar restaurantes através do painel Super Admin.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar Vertical - Desktop */}
      <div className="hidden lg:flex w-20 border-r bg-muted/30 flex-col items-center py-6 gap-2">
        <button
          onClick={() => setActiveTab('link')}
          className={`flex flex-col items-center gap-2 p-3 rounded-lg transition-all w-16 ${
            activeTab === 'link'
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'hover:bg-muted text-muted-foreground'
          }`}
          title="Link Público"
        >
          <Link2 className="h-6 w-6" />
          <span className="text-[10px] font-medium text-center leading-tight">Link</span>
        </button>

        <button
          onClick={() => setActiveTab('appearance')}
          className={`flex flex-col items-center gap-2 p-3 rounded-lg transition-all w-16 ${
            activeTab === 'appearance'
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'hover:bg-muted text-muted-foreground'
          }`}
          title="Aparência"
        >
          <Palette className="h-6 w-6" />
          <span className="text-[10px] font-medium text-center leading-tight">Aparên-cia</span>
        </button>

        <button
          onClick={() => setActiveTab('hours')}
          className={`flex flex-col items-center gap-2 p-3 rounded-lg transition-all w-16 ${
            activeTab === 'hours'
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'hover:bg-muted text-muted-foreground'
          }`}
          title="Horários"
        >
          <Clock className="h-6 w-6" />
          <span className="text-[10px] font-medium text-center leading-tight">Horá-rios</span>
        </button>

        <button
          onClick={() => setActiveTab('payments')}
          className={`flex flex-col items-center gap-2 p-3 rounded-lg transition-all w-16 ${
            activeTab === 'payments'
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'hover:bg-muted text-muted-foreground'
          }`}
          title="Pagamentos"
        >
          <CreditCard className="h-6 w-6" />
          <span className="text-[10px] font-medium text-center leading-tight">Paga-mentos</span>
        </button>

        <button
          onClick={() => setActiveTab('fiscal')}
          className={`flex flex-col items-center gap-2 p-3 rounded-lg transition-all w-16 ${
            activeTab === 'fiscal'
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'hover:bg-muted text-muted-foreground'
          }`}
          title="Dados fiscais"
        >
          <ReceiptText className="h-6 w-6" />
          <span className="text-[10px] font-medium text-center leading-tight">Fiscal</span>
        </button>
      </div>

      {/* Conteúdo Principal */}
      <div className="flex-1 overflow-auto">
        <div className="p-4 sm:p-6">
          <div className="max-w-4xl mx-auto space-y-4">
            {/* Mobile Selector */}
            <div className="lg:hidden mb-4">
              <select
                value={activeTab}
                onChange={(e) => setActiveTab(e.target.value as 'link' | 'appearance' | 'hours' | 'payments' | 'fiscal')}
                className="w-full h-10 px-3 rounded-lg border bg-background"
              >
                <option value="link">🔗 Link Público</option>
                <option value="appearance">🎨 Aparência</option>
                <option value="hours">🕐 Horários</option>
                <option value="payments">💳 Pagamentos</option>
                <option value="fiscal">🧾 Dados fiscais</option>
              </select>
            </div>

            {/* Header da seção */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h1 className="text-xl sm:text-2xl font-bold">
                {activeTab === 'link' && 'Link Público'}
                {activeTab === 'appearance' && 'Aparência'}
                {activeTab === 'hours' && 'Horários'}
                {activeTab === 'payments' && 'Formas de pagamento'}
                {activeTab === 'fiscal' && 'Dados fiscais da fatura'}
              </h1>
              <p className="text-sm text-muted-foreground">
                {activeTab === 'link' && 'Configure o link do seu menu digital'}
                {activeTab === 'appearance' && 'Personalize a identidade visual do menu'}
                {activeTab === 'hours' && 'Defina o horário de funcionamento'}
                {activeTab === 'payments' && 'Escolha o que os clientes podem usar e informe a referência de cada método'}
                {activeTab === 'fiscal' && 'Identifique o restaurante nos documentos e mantenha os dados fiscais atualizados'}
              </p>
            </motion.div>

            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'link' | 'appearance' | 'hours' | 'payments' | 'fiscal')} className="w-full">
              {/* Remover TabsList pois agora usamos sidebar */}

        <TabsContent value="link" className="space-y-3 mt-4">
          <div className="flex gap-4">
            {/* Sidebar */}
            <div className="hidden lg:block w-64 flex-shrink-0">
              <Card className="sticky top-4">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Navegação</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1">
                  <button
                    onClick={() => setActiveSection('link')}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                      activeSection === 'link'
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted'
                    }`}
                  >
                    <Link2 className="h-4 w-4" />
                    Configurar Link
                  </button>
                  <button
                    onClick={() => setActiveSection('qrcode')}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                      activeSection === 'qrcode'
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted'
                    }`}
                  >
                    <QrCode className="h-4 w-4" />
                    QR Code
                  </button>
                  <button
                    onClick={() => setActiveSection('preview')}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                      activeSection === 'preview'
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted'
                    }`}
                  >
                    <Eye className="h-4 w-4" />
                    Preview
                  </button>
                  <button
                    onClick={() => setActiveSection('analytics')}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                      activeSection === 'analytics'
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted'
                    }`}
                  >
                    <BarChart3 className="h-4 w-4" />
                    Analytics
                  </button>
                </CardContent>
              </Card>
            </div>

            {/* Mobile Selector */}
            <div className="lg:hidden w-full mb-4">
              <select
                value={activeSection}
                onChange={(e) => setActiveSection(e.target.value as LinkSection)}
                className="w-full h-10 px-3 rounded-lg border bg-background"
              >
                <option value="link">🔗 Configurar Link</option>
                <option value="qrcode">📱 QR Code</option>
                <option value="preview">👁️ Preview</option>
                <option value="analytics">📊 Analytics</option>
              </select>
            </div>

            {/* Conteúdo Principal */}
            <div className="flex-1 space-y-3">
              {/* Seção: Configurar Link */}
              {activeSection === 'link' && (
                <div className="space-y-3">
              <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Link Público do Cardápio</CardTitle>
          <CardDescription className="text-xs">
            Compartilhe este link nas redes sociais, WhatsApp ou onde quiser
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="slug" className="text-sm">Slug Personalizado</Label>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-2">
                <span className="text-xs text-muted-foreground break-all sm:whitespace-nowrap">
                  {window.location.origin}/r/
                </span>
                <Input
                  id="slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="meu-restaurante"
                  data-testid="input-slug"
                  className="flex-1 h-9"
                />
              </div>
              <Button
                onClick={handleSaveSlug}
                disabled={updateSlugMutation.isPending || !slug}
                data-testid="button-save-slug"
                size="sm"
                className="w-full sm:w-auto"
              >
                {updateSlugMutation.isPending ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Use apenas letras minúsculas, números e hífens
            </p>
          </div>

          {restaurant?.slug && (
            <div className="space-y-2 pt-3 border-t">
              <Label className="text-sm">Seu Link Público</Label>
              <div className="flex gap-2">
                <Input
                  value={publicLink}
                  readOnly
                  data-testid="input-public-link"
                  className="font-mono text-xs h-9 flex-1 min-w-0"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyLink}
                  data-testid="button-copy-link"
                  className="flex-shrink-0 px-3"
                >
                  {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => restaurant?.slug && setLocation(`/r/${restaurant.slug}`)}
                  data-testid="button-open-link"
                  className="flex-shrink-0 px-3"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Como Funciona</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex gap-2.5">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                      1
                    </div>
                    <div>
                      <p className="text-sm font-medium">Configure seu slug personalizado</p>
                      <p className="text-xs text-muted-foreground">Escolha um nome único para o link</p>
                    </div>
                  </div>
                  <div className="flex gap-2.5">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                      2
                    </div>
                    <div>
                      <p className="text-sm font-medium">Compartilhe o link</p>
                      <p className="text-xs text-muted-foreground">Envie para clientes via WhatsApp, Instagram, etc.</p>
                    </div>
                  </div>
                  <div className="flex gap-2.5">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                      3
                    </div>
                    <div>
                      <p className="text-sm font-medium">Receba pedidos</p>
                      <p className="text-xs text-muted-foreground">Clientes escolhem delivery ou retirada</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

                </div>
              )}

              {/* Seção: QR Code */}
              {activeSection === 'qrcode' && restaurant?.slug && (
                <div className="space-y-3">
                  <QRCodeGenerator 
                    url={`${publicLink}?r=${restaurant.id}`}
                    restaurantName={restaurant.name}
                  />
                </div>
              )}

              {/* Seção: Preview */}
              {activeSection === 'preview' && restaurant?.slug && (
                <div className="space-y-3">
                  <MockMenuPreview
                    restaurantSlug={restaurant.slug}
                    restaurantName={restaurant.name}
                    logoUrl={restaurant.logoUrl}
                    heroImageUrl={restaurant.heroImageUrl}
                  />
                </div>
              )}

              {/* Seção: Analytics */}
              {activeSection === 'analytics' && restaurant?.slug && (
                <div className="space-y-3">
                  <LinkAnalytics 
                    restaurantId={String(restaurant.id)} 
                    publicLink={publicLink}
                  />
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-2 mt-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Image className="h-4 w-4" />
                Logo do Restaurante
              </CardTitle>
              <CardDescription className="text-xs">
                Logo no header do menu
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {/* Preview Area */}
              <div className="space-y-1">
                <label className="text-xs font-medium">Preview</label>
                <div className="flex items-center justify-center p-2 border-2 border-dashed rounded-lg bg-muted/30 min-h-[60px]">
                  {restaurant?.logoUrl ? (
                    <div className="flex items-center gap-2">
                      <img 
                        src={restaurant.logoUrl} 
                        alt="Logo" 
                        className="h-10 w-10 object-contain rounded ring-1 ring-primary/20"
                      />
                      <p className="text-[10px] text-muted-foreground">Logo atual</p>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                        <Image className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <p className="text-[10px] text-muted-foreground">Sem logo</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Upload Button */}
              <div>
                <input
                  id="logo-upload"
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
                  onChange={handleLogoUpload}
                  disabled={uploadingLogo}
                  className="hidden"
                  data-testid="input-logo-upload"
                />
                <Button
                  onClick={() => document.getElementById('logo-upload')?.click()}
                  disabled={uploadingLogo}
                  className="w-full h-8"
                  size="sm"
                  data-testid="button-upload-logo"
                >
                  {uploadingLogo ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1.5"></div>
                      <span className="text-xs">Enviando...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="h-3 w-3 mr-1.5" />
                      <span className="text-xs">{restaurant?.logoUrl ? 'Alterar' : 'Upload'}</span>
                    </>
                  )}
                </Button>
              </div>

              {/* Recommendations */}
              <div className="rounded-lg border bg-blue-50 dark:bg-blue-950/20 p-3 space-y-1.5">
                <div className="flex items-start gap-2">
                  <Info className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <div className="space-y-1.5 text-xs">
                    <p className="font-medium text-blue-900 dark:text-blue-100">Recomendações:</p>
                    <ul className="space-y-0.5 text-blue-700 dark:text-blue-300">
                      <li>• <strong>Tamanho:</strong> 512x512px (quadrado)</li>
                      <li>• <strong>Formato:</strong> PNG transparente</li>
                      <li>• <strong>Máximo:</strong> 5MB</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-1.5">
                <ImageIcon className="h-3.5 w-3.5" />
                Foto de Capa
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5">
              {/* Preview compacto */}
              <div className="border rounded overflow-hidden bg-muted/30">
                {restaurant?.heroImageUrl ? (
                  <div className="relative">
                    <div className="aspect-[6/1] w-full max-h-[60px]">
                      <img src={restaurant.heroImageUrl} alt="Capa" className="w-full h-full object-cover" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-1.5">
                      <p className="text-white text-[9px] font-medium">{restaurant.name}</p>
                    </div>
                  </div>
                ) : (
                  <div className="aspect-[6/1] w-full max-h-[60px] flex items-center justify-center gap-1.5">
                    <ImageIcon className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-[10px] text-muted-foreground">Sem capa</span>
                  </div>
                )}
              </div>
              
              {/* Upload inline */}
              <div className="flex gap-1.5">
                <input
                  id="hero-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleHeroImageUpload}
                  disabled={uploadingHero}
                  className="hidden"
                />
                <Button
                  onClick={() => document.getElementById('hero-upload')?.click()}
                  disabled={uploadingHero}
                  size="sm"
                  variant="outline"
                  className="flex-1 h-7"
                >
                  {uploadingHero ? (
                    <div className="animate-spin rounded-full h-2.5 w-2.5 border-b-2 border-primary"></div>
                  ) : (
                    <>
                      <Upload className="h-3 w-3 mr-1" />
                      <span className="text-[10px]">Upload</span>
                    </>
                  )}
                </Button>
                <div className="text-[9px] text-muted-foreground flex items-center px-2 border rounded bg-amber-50 dark:bg-amber-950/20">
                  1920x1080, máx 5MB
                </div>
              </div>
            </CardContent>
          </Card>

        </TabsContent>

        <TabsContent value="hours" className="space-y-4">
          {/* Status Control - Glassmorphism Dropdown */}
          {restaurant && (
            <RestaurantStatusControl 
              currentStatus={restaurant.isOpen ?? 1}
              restaurantId={restaurant.id}
            />
          )}
          
          {/* Business Hours Manager */}
          {restaurant?.id && <BusinessHoursManager restaurantId={restaurant.id} />}
        </TabsContent>

        <TabsContent value="fiscal" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ReceiptText className="h-5 w-5" />
                Dados fiscais da fatura profissional
              </CardTitle>
              <CardDescription>
                Preencha os dados exatamente como devem aparecer na fatura profissional. O nome comercial vem do cadastro do restaurante e os restantes dados são aplicados aos documentos emitidos.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="rounded-lg border bg-muted/30 p-4">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">Pré-visualização do cabeçalho fiscal</p>
                    <p className="text-xs text-muted-foreground">Assim estes dados serão apresentados na fatura/recibo.</p>
                  </div>
                  <ReceiptText className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="rounded-md border bg-background p-4 text-sm">
                  <p className="font-semibold">{restaurant?.name || 'Nome do restaurante'}</p>
                  <p className="text-muted-foreground">
                    {fiscalDraft.fiscalAddress || restaurant?.address || 'Morada fiscal não informada'}
                  </p>
                  <div className="mt-3 grid gap-1 text-xs text-muted-foreground sm:grid-cols-2">
                    <span><strong className="text-foreground">NIF:</strong> {fiscalDraft.nif || 'Não informado'}</span>
                    <span><strong className="text-foreground">Regime:</strong> {fiscalDraft.vatRegime || 'Não informado'}</span>
                    <span><strong className="text-foreground">IVA:</strong> {fiscalDraft.vatRate ? `${fiscalDraft.vatRate}%` : 'Não informado'}</span>
                    <span><strong className="text-foreground">Série:</strong> {fiscalDraft.documentSeries || 'Não informada'}</span>
                    <span><strong className="text-foreground">Prefixo:</strong> {fiscalDraft.invoicePrefix || 'Não informado'}</span>
                    <span><strong className="text-foreground">Email:</strong> {fiscalDraft.email || 'Não informado'}</span>
                  </div>
                  {fiscalDraft.legalFooter && (
                    <p className="mt-3 border-t pt-3 text-xs italic text-muted-foreground">{fiscalDraft.legalFooter}</p>
                  )}
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fiscal-nif">NIF do restaurante</Label>
                  <Input id="fiscal-nif" value={fiscalDraft.nif} onChange={(event) => updateFiscalField('nif', event.target.value)} placeholder="5000000000" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fiscal-regime">Regime de IVA</Label>
                  <Input id="fiscal-regime" value={fiscalDraft.vatRegime} onChange={(event) => updateFiscalField('vatRegime', event.target.value)} placeholder="Regime Geral de IVA" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fiscal-rate">Taxa de IVA (%)</Label>
                  <Input id="fiscal-rate" inputMode="decimal" value={fiscalDraft.vatRate} onChange={(event) => updateFiscalField('vatRate', event.target.value)} placeholder="14" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fiscal-series">Série documental</Label>
                  <Input id="fiscal-series" value={fiscalDraft.documentSeries} onChange={(event) => updateFiscalField('documentSeries', event.target.value)} placeholder="FT2026" />
                  <p className="text-xs text-muted-foreground">Usada para identificar a série oficial do documento.</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fiscal-prefix">Prefixo da fatura</Label>
                  <Input id="fiscal-prefix" value={fiscalDraft.invoicePrefix} onChange={(event) => updateFiscalField('invoicePrefix', event.target.value)} placeholder="FT" />
                  <p className="text-xs text-muted-foreground">Usado quando não houver série documental.</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fiscal-email">Email fiscal</Label>
                  <Input id="fiscal-email" type="email" value={fiscalDraft.email} onChange={(event) => updateFiscalField('email', event.target.value)} placeholder="faturacao@empresa.ao" />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="fiscal-address">Morada fiscal</Label>
                  <Input id="fiscal-address" value={fiscalDraft.fiscalAddress} onChange={(event) => updateFiscalField('fiscalAddress', event.target.value)} placeholder="Rua, número, bairro, município, província" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fiscal-website">Website</Label>
                  <Input id="fiscal-website" type="url" value={fiscalDraft.website} onChange={(event) => updateFiscalField('website', event.target.value)} placeholder="https://www.exemplo.ao" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fiscal-whatsapp">WhatsApp</Label>
                  <Input id="fiscal-whatsapp" value={fiscalDraft.whatsappNumber} onChange={(event) => updateFiscalField('whatsappNumber', event.target.value)} placeholder="+244 9XX XXX XXX" />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="fiscal-footer">Texto legal no rodapé</Label>
                  <textarea
                    id="fiscal-footer"
                    value={fiscalDraft.legalFooter}
                    onChange={(event) => updateFiscalField('legalFooter', event.target.value)}
                    placeholder="Ex.: Documento emitido nos termos da legislação fiscal aplicável."
                    className="flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button type="button" onClick={() => updateFiscalMutation.mutate(fiscalDraft)} disabled={updateFiscalMutation.isPending || !fiscalDraft.email.trim()}>
                  {updateFiscalMutation.isPending ? 'A guardar...' : 'Guardar dados fiscais'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Pagamentos aceites no menu
              </CardTitle>
              <CardDescription>
                Apenas os métodos abaixo aparecem no menu público e no customer menu. A referência pode ser um número de conta, IBAN, terminal ou instrução para o cliente.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {paymentMethods.length === 0 && (
                <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                  Nenhuma forma de pagamento configurada. Adicione pelo menos uma para permitir pagamentos nos pedidos.
                </div>
              )}
              {paymentMethods.map((method, index) => (
                <div key={method.id} className="grid gap-3 rounded-lg border p-4 sm:grid-cols-[1fr_1.5fr_auto] sm:items-end">
                  <div className="space-y-1">
                    <Label>Nome do método</Label>
                    <Input
                      value={method.name}
                      onChange={(event) => updatePaymentMethod(index, 'name', event.target.value)}
                      placeholder="Ex.: Multicaixa Express"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Referência</Label>
                    <Input
                      value={method.reference}
                      onChange={(event) => updatePaymentMethod(index, 'reference', event.target.value)}
                      placeholder="Ex.: 923 000 000 ou Pagamento na entrega"
                    />
                  </div>
                  <Button type="button" variant="outline" size="icon" onClick={() => removePaymentMethod(index)} aria-label="Remover método">
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
              <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
                <Button type="button" variant="outline" onClick={addPaymentMethod} disabled={paymentMethods.length >= 20}>
                  <Plus className="mr-2 h-4 w-4" /> Adicionar método
                </Button>
                <Button
                  type="button"
                  onClick={() => updatePaymentMethodsMutation.mutate(paymentMethods)}
                  disabled={updatePaymentMethodsMutation.isPending || paymentMethods.some((method) => !method.name.trim() || !method.reference.trim())}
                >
                  {updatePaymentMethodsMutation.isPending ? 'A guardar...' : 'Guardar pagamentos'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
