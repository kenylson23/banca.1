import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { BarChart3, TrendingUp, Eye, MousePointerClick, ShoppingCart } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface LinkAnalyticsProps {
  restaurantId: string;
  publicLink: string;
}

interface AnalyticsData {
  totalClicks: number;
  uniqueVisitors: number;
  lastAccessed: Date | null;
  clicksThisWeek: number;
  clicksThisMonth: number;
  conversionRate: number;
  topSources: Array<{
    source: string;
    clicks: number;
  }>;
  recentClicks: Array<{
    timestamp: Date;
    source: string;
    converted: boolean;
  }>;
}

export function LinkAnalytics({ restaurantId, publicLink }: LinkAnalyticsProps) {
  const { data, isLoading } = useQuery<AnalyticsData>({
    queryKey: [`/api/analytics/link/${restaurantId}`],
    staleTime: 30000, // Cache por 30 segundos
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Analytics do Link</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  // Mock data se não houver dados do backend
  const stats: AnalyticsData = data || {
    totalClicks: 0,
    uniqueVisitors: 0,
    lastAccessed: null,
    clicksThisWeek: 0,
    clicksThisMonth: 0,
    conversionRate: 0,
    topSources: [],
    recentClicks: [],
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics do Link
            </CardTitle>
            <CardDescription className="text-xs">
              Estatísticas de acesso ao seu menu público
            </CardDescription>
          </div>
          {stats.lastAccessed && (
            <Badge variant="outline" className="text-xs">
              <Eye className="h-3 w-3 mr-1" />
              Há {formatDistanceToNow(new Date(stats.lastAccessed), { locale: ptBR })}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-lg border bg-card">
            <div className="flex items-center gap-2 mb-1">
              <MousePointerClick className="h-3.5 w-3.5 text-blue-600" />
              <span className="text-xs text-muted-foreground">Total</span>
            </div>
            <div className="text-xl font-bold">{stats.totalClicks}</div>
            <span className="text-xs text-muted-foreground">cliques</span>
          </div>

          <div className="p-3 rounded-lg border bg-card">
            <div className="flex items-center gap-2 mb-1">
              <Eye className="h-3.5 w-3.5 text-purple-600" />
              <span className="text-xs text-muted-foreground">Únicos</span>
            </div>
            <div className="text-xl font-bold">{stats.uniqueVisitors}</div>
            <span className="text-xs text-muted-foreground">visitantes</span>
          </div>

          <div className="p-3 rounded-lg border bg-card">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-3.5 w-3.5 text-green-600" />
              <span className="text-xs text-muted-foreground">Esta semana</span>
            </div>
            <div className="text-xl font-bold">{stats.clicksThisWeek}</div>
            <span className="text-xs text-muted-foreground">cliques</span>
          </div>

          <div className="p-3 rounded-lg border bg-card">
            <div className="flex items-center gap-2 mb-1">
              <ShoppingCart className="h-3.5 w-3.5 text-amber-600" />
              <span className="text-xs text-muted-foreground">Conversão</span>
            </div>
            <div className="text-xl font-bold">{stats.conversionRate.toFixed(1)}%</div>
            <span className="text-xs text-muted-foreground">pedidos</span>
          </div>
        </div>

        {/* Top Sources */}
        {stats.topSources.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-muted-foreground">De onde vêm os acessos</h4>
            <div className="space-y-1.5">
              {stats.topSources.slice(0, 3).map((source, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                  <span className="text-xs font-medium">{source.source}</span>
                  <Badge variant="secondary" className="text-xs">
                    {source.clicks} cliques
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {stats.totalClicks === 0 && (
          <div className="text-center py-6 space-y-2">
            <BarChart3 className="h-8 w-8 mx-auto text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">
              Nenhum acesso registrado ainda
            </p>
            <p className="text-xs text-muted-foreground">
              Compartilhe seu link para começar a receber visitas!
            </p>
          </div>
        )}

        {/* Info */}
        <div className="rounded-lg border bg-green-50 dark:bg-green-950/20 p-3">
          <p className="text-xs text-green-900 dark:text-green-100">
            <strong>📊 Dica:</strong> Os dados são atualizados em tempo real. 
            Use essas métricas para entender o alcance do seu menu e otimizar suas campanhas!
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
