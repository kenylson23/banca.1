import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Database, Trash2, RefreshCw, Activity, Clock, CheckCircle2, XCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CacheStats {
  total: number;
  valid: number;
  expired: number;
  timestamp: string;
  uptimeSeconds: number;
}

export function CacheMonitorCard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: stats, isLoading, refetch } = useQuery<CacheStats>({
    queryKey: ["/api/admin/cache/stats"],
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  const clearCacheMutation = useMutation({
    mutationFn: async (pattern?: string) => {
      const res = await fetch("/api/admin/cache/clear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pattern }),
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Cache Limpo",
        description: data.message,
      });
      refetch();
      queryClient.invalidateQueries();
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message,
      });
    },
  });

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}h ${minutes}m ${secs}s`;
  };

  const getHealthStatus = () => {
    if (!stats) return { color: "text-gray-500", label: "Desconhecido", icon: Activity };
    
    const expiredPercentage = (stats.expired / stats.total) * 100;
    
    if (expiredPercentage > 50) {
      return { color: "text-red-500", label: "Precisa Limpeza", icon: XCircle };
    } else if (expiredPercentage > 20) {
      return { color: "text-yellow-500", label: "OK", icon: Activity };
    } else {
      return { color: "text-green-500", label: "Saudável", icon: CheckCircle2 };
    }
  };

  const health = getHealthStatus();
  const HealthIcon = health.icon;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-100 dark:bg-cyan-900 rounded-lg">
              <Database className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
            </div>
            <div>
              <CardTitle>Cache do Sistema</CardTitle>
              <CardDescription>Monitoramento em tempo real</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={health.color}>
              <HealthIcon className="h-3 w-3 mr-1" />
              {health.label}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <>
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-10 w-full" />
          </>
        ) : stats ? (
          <>
            {/* Statistics Grid */}
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">Total Entries</div>
                <div className="text-2xl font-bold">{stats.total}</div>
              </div>
              <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                <div className="text-sm text-green-700 dark:text-green-400 mb-1">Válidas</div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {stats.valid}
                </div>
              </div>
              <div className="p-4 bg-red-50 dark:bg-red-950 rounded-lg">
                <div className="text-sm text-red-700 dark:text-red-400 mb-1">Expiradas</div>
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {stats.expired}
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Uso do Cache</span>
                <span>{((stats.valid / stats.total) * 100).toFixed(1)}% válido</span>
              </div>
              <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-cyan-500 transition-all duration-500"
                  style={{ width: `${(stats.valid / stats.total) * 100}%` }}
                />
              </div>
            </div>

            {/* Uptime */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Server Uptime: {formatUptime(stats.uptimeSeconds)}</span>
            </div>

            {/* Last Updated */}
            <div className="text-xs text-muted-foreground">
              Atualizado: {new Date(stats.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>

            {/* Warning if too many expired entries */}
            {stats.expired > stats.valid && (
              <Alert>
                <AlertDescription>
                  ⚠️ Muitas entries expiradas. Considere limpar o cache.
                </AlertDescription>
              </Alert>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                className="flex-1"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Atualizar
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => clearCacheMutation.mutate()}
                disabled={clearCacheMutation.isPending}
                className="flex-1"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Limpar Cache
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center text-muted-foreground py-8">
            Erro ao carregar estatísticas do cache
          </div>
        )}
      </CardContent>
    </Card>
  );
}
