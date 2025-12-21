import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Star, Award, Crown, Zap, Target } from "lucide-react";
import { differenceInMonths, differenceInDays } from "date-fns";

interface SubscriptionBadgesProps {
  subscription: {
    createdAt: Date;
    status: string;
  };
  usage: {
    orders: number;
  };
  totalOrders?: number; // Total histórico de pedidos
}

type BadgeType = {
  id: string;
  icon: any;
  title: string;
  description: string;
  unlocked: boolean;
  color: string;
  bgColor: string;
};

export function SubscriptionBadges({ subscription, usage, totalOrders = 0 }: SubscriptionBadgesProps) {
  const monthsActive = differenceInMonths(new Date(), new Date(subscription.createdAt));
  const daysActive = differenceInDays(new Date(), new Date(subscription.createdAt));

  const badges: BadgeType[] = [
    {
      id: 'early-adopter',
      icon: Star,
      title: 'Early Adopter',
      description: 'Cliente desde o início',
      unlocked: monthsActive >= 6,
      color: 'text-purple-600',
      bgColor: 'bg-purple-500/10',
    },
    {
      id: 'veteran',
      icon: Crown,
      title: 'Veterano',
      description: '1 ano de assinatura',
      unlocked: monthsActive >= 12,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-500/10',
    },
    {
      id: 'loyal-customer',
      icon: Award,
      title: 'Cliente Fiel',
      description: '2 anos de assinatura',
      unlocked: monthsActive >= 24,
      color: 'text-blue-600',
      bgColor: 'bg-blue-500/10',
    },
    {
      id: 'first-week',
      icon: Zap,
      title: 'Início Rápido',
      description: 'Primeira semana completa',
      unlocked: daysActive >= 7,
      color: 'text-green-600',
      bgColor: 'bg-green-500/10',
    },
    {
      id: 'hundred-orders',
      icon: Target,
      title: '100 Pedidos',
      description: 'Processou 100 pedidos',
      unlocked: totalOrders >= 100,
      color: 'text-orange-600',
      bgColor: 'bg-orange-500/10',
    },
    {
      id: 'thousand-orders',
      icon: Trophy,
      title: '1000 Pedidos',
      description: 'Processou 1000 pedidos',
      unlocked: totalOrders >= 1000,
      color: 'text-red-600',
      bgColor: 'bg-red-500/10',
    },
    {
      id: 'power-user',
      icon: Zap,
      title: 'Power User',
      description: 'Uso consistente por 3 meses',
      unlocked: monthsActive >= 3 && subscription.status === 'ativa',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-500/10',
    },
  ];

  const unlockedBadges = badges.filter(b => b.unlocked);
  const nextBadge = badges.find(b => !b.unlocked);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            Conquistas
          </CardTitle>
          <Badge variant="secondary" className="text-xs">
            {unlockedBadges.length}/{badges.length}
          </Badge>
        </div>
        <CardDescription className="text-xs">
          Marcos alcançados na sua jornada
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Badges desbloqueados */}
          {unlockedBadges.length > 0 && (
            <div>
              <h4 className="text-xs font-medium text-muted-foreground mb-2">
                Desbloqueados
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {unlockedBadges.map((badge) => {
                  const Icon = badge.icon;
                  return (
                    <div
                      key={badge.id}
                      className={`p-2.5 rounded-lg border ${badge.bgColor} flex items-center gap-2`}
                    >
                      <Icon className={`h-4 w-4 ${badge.color}`} />
                      <div className="min-w-0">
                        <div className={`text-xs font-medium ${badge.color}`}>
                          {badge.title}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {badge.description}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Próximo badge */}
          {nextBadge && (
            <div>
              <h4 className="text-xs font-medium text-muted-foreground mb-2">
                Próxima Conquista
              </h4>
              <div className="p-3 rounded-lg border bg-muted/30 flex items-center gap-3">
                <div className="p-2 rounded-full bg-muted">
                  {(() => {
                    const Icon = nextBadge.icon;
                    return <Icon className="h-4 w-4 text-muted-foreground" />;
                  })()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{nextBadge.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {nextBadge.description}
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">
                  Bloqueado
                </Badge>
              </div>
            </div>
          )}

          {unlockedBadges.length === 0 && (
            <div className="text-center py-6 text-muted-foreground">
              <Trophy className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-xs">
                Continue usando o sistema para desbloquear conquistas!
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
