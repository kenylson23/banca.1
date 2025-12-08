import { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Bell, Check, CheckCheck, Trash2, Settings, Package, User, AlertTriangle, CreditCard, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
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

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
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
      
      if (message.data) {
        toast({
          title: message.data.title || 'Nova notificação',
          description: message.data.message || 'Você tem uma nova notificação.',
          restaurantName: brandRef.current.name,
          restaurantLogo: brandRef.current.logo,
        });
      }
    }
  }, [toast]);

  useWebSocket(handleWebSocketMessage);

  const { data: countData } = useQuery<{ count: number }>({
    queryKey: ['/api/notifications/count'],
    refetchInterval: 60000,
  });

  const { data: notifications, isLoading } = useQuery<Notification[]>({
    queryKey: ['/api/notifications'],
    enabled: isOpen,
  });

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
          className="relative"
          data-testid="button-notifications"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-80 p-0"
        data-testid="dropdown-notifications"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="font-semibold text-sm">Notificações</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={() => markAllAsReadMutation.mutate()}
              disabled={markAllAsReadMutation.isPending}
              data-testid="button-mark-all-read"
            >
              <CheckCheck className="h-3.5 w-3.5 mr-1" />
              Marcar todas como lidas
            </Button>
          )}
        </div>
        
        <ScrollArea className="h-[300px]">
          {isLoading ? (
            <div className="flex items-center justify-center h-full py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
            </div>
          ) : notifications && notifications.length > 0 ? (
            <div className="divide-y">
              {notifications.map((notification) => {
                const IconComponent = notificationIcons[notification.type as NotificationType] || Bell;
                const iconColor = notificationColors[notification.type as NotificationType] || 'text-gray-500';
                
                return (
                  <div
                    key={notification.id}
                    className={`p-3 hover-elevate cursor-pointer ${
                      !notification.isRead ? 'bg-primary/5' : ''
                    }`}
                    onClick={() => !notification.isRead && markAsReadMutation.mutate(notification.id)}
                    data-testid={`notification-item-${notification.id}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 ${iconColor}`}>
                        <IconComponent className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className={`text-sm font-medium truncate ${!notification.isRead ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {notification.title}
                          </p>
                          {!notification.isRead && (
                            <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground/70 mt-1">
                          {notification.createdAt && formatDistanceToNow(new Date(notification.createdAt), { 
                            addSuffix: true, 
                            locale: ptBR 
                          })}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {!notification.isRead && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={(e) => handleMarkAsRead(notification.id, e)}
                            data-testid={`button-mark-read-${notification.id}`}
                          >
                            <Check className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-destructive"
                          onClick={(e) => handleDelete(notification.id, e)}
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
              <Bell className="h-8 w-8 mb-2 opacity-50" />
              <p className="text-sm">Nenhuma notificação</p>
            </div>
          )}
        </ScrollArea>
        
        <Separator />
        <div className="p-2">
          <Button
            variant="ghost"
            className="w-full justify-start text-sm h-9"
            onClick={() => setIsOpen(false)}
            data-testid="button-notification-settings"
          >
            <Settings className="h-4 w-4 mr-2" />
            Configurações de notificação
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
