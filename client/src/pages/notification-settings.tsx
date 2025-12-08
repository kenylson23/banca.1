import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Bell, Package, AlertTriangle, Users, CreditCard, Crown, MessageCircle, Mail, Smartphone, Save, Info } from 'lucide-react';
import { SiWhatsapp } from 'react-icons/si';
import type { NotificationPreferences } from '@shared/schema';

const notificationTypes = [
  {
    key: 'newOrderEnabled',
    label: 'Novos Pedidos',
    description: 'Receber notificação quando um novo pedido for recebido',
    icon: Package,
    iconColor: 'text-green-500',
  },
  {
    key: 'orderStatusEnabled',
    label: 'Alteração de Status',
    description: 'Receber notificação quando o status de um pedido mudar',
    icon: Package,
    iconColor: 'text-blue-500',
  },
  {
    key: 'orderCancelledEnabled',
    label: 'Pedidos Cancelados',
    description: 'Receber notificação quando um pedido for cancelado',
    icon: AlertTriangle,
    iconColor: 'text-red-500',
  },
  {
    key: 'lowStockEnabled',
    label: 'Estoque Baixo',
    description: 'Receber alerta quando um item estiver com estoque baixo',
    icon: AlertTriangle,
    iconColor: 'text-amber-500',
  },
  {
    key: 'newCustomerEnabled',
    label: 'Novos Clientes',
    description: 'Receber notificação quando um novo cliente se cadastrar',
    icon: Users,
    iconColor: 'text-purple-500',
  },
  {
    key: 'paymentReceivedEnabled',
    label: 'Pagamentos',
    description: 'Receber notificação de pagamentos recebidos',
    icon: CreditCard,
    iconColor: 'text-emerald-500',
  },
  {
    key: 'subscriptionAlertEnabled',
    label: 'Alertas de Assinatura',
    description: 'Receber alertas sobre sua assinatura do sistema',
    icon: Crown,
    iconColor: 'text-orange-500',
  },
];

const notificationChannels = [
  {
    key: 'inAppEnabled',
    label: 'No Aplicativo',
    description: 'Notificações dentro do painel administrativo',
    icon: Bell,
  },
  {
    key: 'whatsappEnabled',
    label: 'WhatsApp',
    description: 'Receber notificações via WhatsApp',
    icon: SiWhatsapp,
  },
  {
    key: 'emailEnabled',
    label: 'E-mail',
    description: 'Receber notificações por e-mail',
    icon: Mail,
  },
];

export default function NotificationSettings() {
  const { toast } = useToast();
  const [preferences, setPreferences] = useState<Partial<NotificationPreferences>>({});
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  const { data: currentPreferences, isLoading } = useQuery<NotificationPreferences>({
    queryKey: ['/api/notification-preferences'],
  });

  useEffect(() => {
    if (currentPreferences) {
      setPreferences(currentPreferences);
      setWhatsappNumber(currentPreferences.whatsappNotificationNumber || '');
    }
  }, [currentPreferences]);

  const updatePreferencesMutation = useMutation({
    mutationFn: async (data: Partial<NotificationPreferences>) => {
      return apiRequest('PATCH', '/api/notification-preferences', data);
    },
    onSuccess: () => {
      toast({
        title: 'Preferências salvas',
        description: 'Suas configurações de notificação foram atualizadas.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/notification-preferences'] });
      setHasChanges(false);
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao salvar',
        description: error?.message || 'Tente novamente mais tarde.',
        variant: 'destructive',
      });
    },
  });

  const handleToggle = (key: string, value: boolean) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value ? 1 : 0,
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    updatePreferencesMutation.mutate({
      ...preferences,
      whatsappNotificationNumber: whatsappNumber || undefined,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-notification-settings-title">
            Configurações de Notificação
          </h1>
          <p className="text-muted-foreground">
            Configure como e quando você deseja receber notificações
          </p>
        </div>
        <Button 
          onClick={handleSave} 
          disabled={!hasChanges || updatePreferencesMutation.isPending}
          data-testid="button-save-notification-settings"
        >
          <Save className="h-4 w-4 mr-2" />
          {updatePreferencesMutation.isPending ? 'Salvando...' : 'Salvar Alterações'}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card data-testid="card-notification-channels">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              Canais de Notificação
            </CardTitle>
            <CardDescription>
              Escolha por onde você deseja receber as notificações
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {notificationChannels.map((channel) => (
              <div
                key={channel.key}
                className="flex items-center justify-between p-4 rounded-lg border"
                data-testid={`channel-${channel.key}`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-muted">
                    <channel.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">{channel.label}</p>
                    <p className="text-sm text-muted-foreground">{channel.description}</p>
                  </div>
                </div>
                <Switch
                  checked={preferences[channel.key as keyof NotificationPreferences] === 1}
                  onCheckedChange={(checked) => handleToggle(channel.key, checked)}
                  data-testid={`switch-${channel.key}`}
                />
              </div>
            ))}

            {preferences.whatsappEnabled === 1 && (
              <div className="p-4 rounded-lg border border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950">
                <Label htmlFor="whatsapp-number" className="text-sm font-medium mb-2 flex items-center gap-2">
                  <SiWhatsapp className="h-4 w-4 text-green-600" />
                  Número WhatsApp para Notificações
                </Label>
                <Input
                  id="whatsapp-number"
                  placeholder="+244 900 000 000"
                  value={whatsappNumber}
                  onChange={(e) => {
                    setWhatsappNumber(e.target.value);
                    setHasChanges(true);
                  }}
                  className="mt-2"
                  data-testid="input-whatsapp-number"
                />
                <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                  <Info className="h-3 w-3" />
                  Este número receberá as notificações importantes via WhatsApp
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card data-testid="card-notification-types">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Tipos de Notificação
            </CardTitle>
            <CardDescription>
              Selecione quais eventos você deseja ser notificado
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {notificationTypes.map((type) => (
              <div
                key={type.key}
                className="flex items-center justify-between p-3 rounded-lg border hover-elevate"
                data-testid={`type-${type.key}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded-md bg-muted ${type.iconColor}`}>
                    <type.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{type.label}</p>
                    <p className="text-xs text-muted-foreground">{type.description}</p>
                  </div>
                </div>
                <Switch
                  checked={preferences[type.key as keyof NotificationPreferences] === 1}
                  onCheckedChange={(checked) => handleToggle(type.key, checked)}
                  data-testid={`switch-${type.key}`}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-customer-notifications">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Notificações para Clientes
          </CardTitle>
          <CardDescription>
            Configure as notificações automáticas enviadas aos seus clientes via WhatsApp
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border p-4 bg-muted/30">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900">
                <SiWhatsapp className="h-5 w-5 text-green-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium">Atualizações de Status do Pedido</p>
                  <Badge variant="outline" className="text-xs">Ativo</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Seus clientes receberão automaticamente notificações via WhatsApp quando o status do pedido mudar:
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-2 p-2 rounded bg-background">
                    <span className="w-2 h-2 rounded-full bg-yellow-500" />
                    <span>Pendente</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded bg-background">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    <span>Confirmado</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded bg-background">
                    <span className="w-2 h-2 rounded-full bg-orange-500" />
                    <span>Em Preparo</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded bg-background">
                    <span className="w-2 h-2 rounded-full bg-purple-500" />
                    <span>Pronto</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded bg-background">
                    <span className="w-2 h-2 rounded-full bg-indigo-500" />
                    <span>Saiu para Entrega</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded bg-background">
                    <span className="w-2 h-2 rounded-full bg-green-500" />
                    <span>Entregue</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
