import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Bell, Check, CheckCheck, Trash2, Settings, Package, User, AlertTriangle, CreditCard, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useRestaurantBrand } from '@/hooks/useRestaurantBrand';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Notification } from '@shared/schema';

type NotificationType = 'new_order' | 'order_status' | 'order_cancelled' | 'low_stock' | 'new_customer' | 'payment_received' | 'subscription_alert' | 'system';

const notificationIcons: Record<NotificationType, typeof Bell> = {
  new_order: Package,
  order_status: Package,
  order_cancelled: AlertTriangle,
  low_stock: AlertTriangle,
  new_customer: User,
  payment_received: CreditCard,
  subscription_alert: CreditCard,
  system: Info,
};

const notificationColors: Record<NotificationType, string> = {
  new_order: 'text-green-500',
  order_status: 'text-blue-500',
  order_cancelled: 'text-red-500',
  low_stock: 'text-amber-500',
  new_customer: 'text-purple-500',
  payment_received: 'text-emerald-500',
  subscription_alert: 'text-orange-500',
  system: 'text-gray-500',
};

const notificationIconBackgrounds: Record<NotificationType, string> = {
  new_order: 'bg-green-500/10',
  order_status: 'bg-blue-500/10',
  order_cancelled: 'bg-red-500/10',
  low_stock: 'bg-amber-500/10',
  new_customer: 'bg-purple-500/10',
  payment_received: 'bg-emerald-500/10',
  subscription_alert: 'bg-orange-500/10',
  system: 'bg-muted',
};

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const { brand } = useRestaurantBrand();
  const previousCountRef = useRef<number>(0);
  const brandRef = useRef(brand);
  
  useEffect(() => {
    brandRef.current = brand;
  }, [brand]);

  const handleWebSocketMessage = useCallback((message: { type: string; data?: any }) => {
    if (message.type === 'new_notification') {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/count'] });
      
      const notificationUserId = message.data?.userId ?? null;
      const belongsToCurrentUser =
        notificationUserId === null || notificationUserId === user?.id;

      if (message.data && belongsToCurrentUser) {
        toast({
          title: message.data.title || 'Nova notificação',
          description: message.data.message || 'Você tem uma nova notificação.',
          restaurantName: brandRef.current.name,
          restaurantLogo: brandRef.current.logo,
        });
      }
    }
  }, [toast, user?.id]);

  useWebSocket(handleWebSocketMessage);

  const { data: countData, isError: isCountError } = useQuery<{ count: number }>({
    queryKey: ['/api/notifications/count'],
    refetchInterval: 15000,
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

  const {
    data: notifications,
    isLoading,
    isError: isNotificationsError,
    refetch,
  } = useQuery<Notification[]>({
    queryKey: ['/api/notifications'],
    enabled: isOpen,
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchInterval: isOpen ? 15000 : false,
  });

  useEffect(() => {
    if (isOpen) {
      void refetch();
    }
  }, [isOpen, refetch]);

  useEffect(() => {
    if (countData && countData.count > previousCountRef.current && previousCountRef.current > 0) {
      toast({
        title: 'Nova notificação',
        description: 'Você tem novas notificações.',
        restaurantName: brandRef.current.name,
        restaurantLogo: brandRef.current.logo,
      });
    }
    if (countData) {
      previousCountRef.current = countData.count;
    }
  }, [countData, toast]);

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      await apiRequest('PATCH', `/api/notifications/${notificationId}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/count'] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('PATCH', '/api/notifications/read-all');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/count'] });
      toast({
        title: 'Notificações',
        description: 'Todas as notificações foram marcadas como lidas.',
        restaurantName: brandRef.current.name,
        restaurantLogo: brandRef.current.logo,
      });
    },
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      await apiRequest('DELETE', `/api/notifications/${notificationId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/count'] });
    },
  });

  const handleMarkAsRead = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    markAsReadMutation.mutate(id);
  }, [markAsReadMutation]);

  const handleDelete = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteNotificationMutation.mutate(id);
  }, [deleteNotificationMutation]);

  const unreadCount = countData?.count ?? 0;

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative h-9 w-9 rounded-xl hover:bg-muted"
          data-testid="button-notifications"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -right-1 -top-1 h-4 min-w-4 rounded-full px-1 text-[10px] font-semibold ring-2 ring-background"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="notification-dropdown-content w-[calc(100vw-1rem)] max-w-[420px] overflow-hidden rounded-2xl border-border/70 bg-popover p-0 shadow-2xl shadow-black/20 focus-visible:outline-none focus-visible:shadow-none"
        data-testid="dropdown-notifications"
      >
        <div className="flex items-center justify-between gap-3 border-b border-border/70 bg-background/25 px-4 py-3.5">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Bell className="h-[18px] w-[18px]" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold tracking-tight">Notificações</h3>
              <p className="mt-0.5 text-xs text-muted-foreground">
              {unreadCount > 0 ? `${unreadCount} por ler` : 'Tudo em dia'}
              </p>
            </div>
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-9 shrink-0 rounded-lg px-3 text-xs font-medium"
              onClick={() => markAllAsReadMutation.mutate()}
              disabled={markAllAsReadMutation.isPending}
              data-testid="button-mark-all-read"
            >
              <CheckCheck className="mr-1 h-3.5 w-3.5" />
              Ler tudo
            </Button>
          )}
        </div>
        
        <ScrollArea className="h-[min(340px,50vh)]">
          {isLoading ? (
            <div className="flex items-center justify-center h-full py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
            </div>
          ) : isNotificationsError ? (
            <div className="flex flex-col items-center justify-center gap-3 px-6 py-8 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/10">
                <Bell className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-sm font-medium">Não foi possível carregar as notificações</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  O servidor não respondeu. Tente novamente.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="rounded-lg"
                onClick={() => void refetch()}
              >
                Tentar novamente
              </Button>
            </div>
          ) : notifications && notifications.length > 0 ? (
            <div className="space-y-2 p-2.5">
              {notifications.map((notification) => {
                const IconComponent = notificationIcons[notification.type as NotificationType] || Bell;
                const iconColor = notificationColors[notification.type as NotificationType] || 'text-gray-500';
                
                return (
                  <div
                    key={notification.id}
                    className={`cursor-pointer rounded-xl border p-3.5 transition-colors hover:bg-muted/60 ${
                      !notification.isRead
                        ? 'border-primary/15 bg-primary/[0.045]'
                        : 'border-transparent'
                    }`}
                    onClick={() => !notification.isRead && markAsReadMutation.mutate(notification.id)}
                    data-testid={`notification-item-${notification.id}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${notificationIconBackgrounds[notification.type as NotificationType] || 'bg-muted'}`}>
                        <IconComponent className={`h-[18px] w-[18px] ${iconColor}`} aria-hidden="true" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className={`line-clamp-2 text-sm font-medium ${!notification.isRead ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {notification.title}
                          </p>
                          {!notification.isRead && (
                            <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                          )}
                        </div>
                        <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">
                          {notification.message}
                        </p>
                        <p className="mt-1.5 text-[11px] text-muted-foreground/70">
                          {notification.createdAt && formatDistanceToNow(new Date(notification.createdAt), { 
                            addSuffix: true, 
                            locale: ptBR 
                          })}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        {!notification.isRead && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg"
                            onClick={(e) => handleMarkAsRead(notification.id, e)}
                            aria-label="Marcar notificação como lida"
                            data-testid={`button-mark-read-${notification.id}`}
                          >
                            <Check className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-lg text-muted-foreground hover:text-destructive"
                          onClick={(e) => handleDelete(notification.id, e)}
                          aria-label="Apagar notificação"
                          data-testid={`button-delete-notification-${notification.id}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-8 text-muted-foreground">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
                <Bell className="h-5 w-5 opacity-50" />
              </div>
              <p className="text-sm">
                {isCountError ? 'Não foi possível consultar as notificações' : 'Nenhuma notificação'}
              </p>
            </div>
          )}
        </ScrollArea>
        
        <div className="border-t border-border/70 bg-background/20 p-2.5">
          <Button
            variant="ghost"
            className="h-10 w-full justify-start rounded-xl px-3 text-sm font-medium"
            onClick={() => {
              setIsOpen(false);
              setLocation('/notification-settings');
            }}
            data-testid="button-notification-settings"
          >
            <Settings className="mr-2.5 h-4 w-4" aria-hidden="true" />
            Configurações de notificação
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
