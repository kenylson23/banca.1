/**
 * TableStatistics - Estatísticas e KPIs da Mesa
 */

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  TrendingUp, 
  Users, 
  Clock, 
  CreditCard,
  Receipt,
  Calendar,
  DollarSign,
  Activity,
} from 'lucide-react';
import { formatKwanza } from '@/lib/formatters';
import { cn } from '@/lib/utils';

interface TableStatisticsProps {
  sessions: Array<{
    id: string;
    startedAt: string;
    endedAt: string | null;
    peopleCount: number;
    totalAmount: string;
    status: string;
  }>;
  payments: Array<{
    id: string;
    amount: string;
    method: string;
    createdAt: string;
  }>;
}

export function TableStatistics({ sessions, payments }: TableStatisticsProps) {
  const stats = useMemo(() => {
    // Filtrar apenas sessões completadas
    const completedSessions = sessions.filter(s => s.status === 'completed');
    
    // Total de sessões
    const totalSessions = completedSessions.length;
    
    // Receita total
    const totalRevenue = completedSessions.reduce(
      (sum, s) => sum + parseFloat(s.totalAmount || '0'), 
      0
    );
    
    // Ticket médio
    const avgTicket = totalSessions > 0 ? totalRevenue / totalSessions : 0;
    
    // Duração média das sessões
    const totalDuration = completedSessions.reduce((sum, s) => {
      if (!s.endedAt) return sum;
      const duration = new Date(s.endedAt).getTime() - new Date(s.startedAt).getTime();
      return sum + duration;
    }, 0);
    const avgDurationMs = totalSessions > 0 ? totalDuration / totalSessions : 0;
    const avgDurationMin = Math.round(avgDurationMs / 1000 / 60);
    const avgHours = Math.floor(avgDurationMin / 60);
    const avgMinutes = avgDurationMin % 60;
    const avgDurationText = avgHours > 0 ? `${avgHours}h ${avgMinutes}min` : `${avgMinutes}min`;
    
    // Média de pessoas por sessão
    const totalPeople = completedSessions.reduce((sum, s) => sum + s.peopleCount, 0);
    const avgPeopleCount = totalSessions > 0 ? (totalPeople / totalSessions).toFixed(1) : '0';
    
    // Método de pagamento mais usado
    const paymentMethods = payments.reduce((acc, p) => {
      acc[p.method] = (acc[p.method] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const mostUsedMethod = Object.entries(paymentMethods)
      .sort(([, a], [, b]) => b - a)[0];
    
    const methodLabels: Record<string, string> = {
      cash: 'Dinheiro',
      card: 'Cartão',
      mbway: 'MBWay',
      tpa: 'TPA',
      bank_transfer: 'Transferência',
    };
    
    const mostUsedMethodLabel = mostUsedMethod 
      ? methodLabels[mostUsedMethod[0]] || mostUsedMethod[0]
      : 'N/A';
    
    const mostUsedMethodPercent = mostUsedMethod && payments.length > 0
      ? Math.round((mostUsedMethod[1] / payments.length) * 100)
      : 0;
    
    return {
      totalSessions,
      totalRevenue,
      avgTicket,
      avgDurationText,
      avgPeopleCount,
      mostUsedMethodLabel,
      mostUsedMethodPercent,
    };
  }, [sessions, payments]);

  const statCards = [
    {
      icon: Calendar,
      label: 'Total de Sessões',
      value: stats.totalSessions.toString(),
      color: 'text-blue-600',
      bgColor: 'bg-blue-500/10',
    },
    {
      icon: DollarSign,
      label: 'Receita Total',
      value: formatKwanza(stats.totalRevenue),
      color: 'text-green-600',
      bgColor: 'bg-green-500/10',
    },
    {
      icon: Receipt,
      label: 'Ticket Médio',
      value: formatKwanza(stats.avgTicket),
      color: 'text-purple-600',
      bgColor: 'bg-purple-500/10',
    },
    {
      icon: Clock,
      label: 'Duração Média',
      value: stats.avgDurationText,
      color: 'text-amber-600',
      bgColor: 'bg-amber-500/10',
    },
    {
      icon: Users,
      label: 'Média de Pessoas',
      value: stats.avgPeopleCount,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-500/10',
    },
    {
      icon: CreditCard,
      label: 'Método Mais Usado',
      value: `${stats.mostUsedMethodLabel} (${stats.mostUsedMethodPercent}%)`,
      color: 'text-teal-600',
      bgColor: 'bg-teal-500/10',
    },
  ];

  if (sessions.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center">
              <Activity className="h-10 w-10 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-bold mb-2">Sem Dados</h3>
              <p className="text-muted-foreground max-w-md">
                Ainda não há sessões registradas para calcular estatísticas.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold mb-2">Estatísticas da Mesa</h3>
        <p className="text-muted-foreground">
          Resumo de performance e métricas importantes
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((stat, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
              <div className={cn("h-8 w-8 rounded-full flex items-center justify-center", stat.bgColor)}>
                <stat.icon className={cn("h-4 w-4", stat.color)} />
              </div>
            </CardHeader>
            <CardContent>
              <div className={cn("text-2xl font-bold", stat.color)}>
                {stat.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Performance Indicator */}
      {stats.totalSessions > 0 && (
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Análise de Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground mb-1">Taxa de Ocupação</div>
                <div className="font-semibold text-lg">
                  {stats.totalSessions} sessões registradas
                </div>
              </div>
              <div>
                <div className="text-muted-foreground mb-1">Eficiência</div>
                <div className="font-semibold text-lg">
                  {stats.avgDurationText} por sessão
                </div>
              </div>
            </div>
            
            {stats.avgTicket > 50000 && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                <TrendingUp className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                <div className="text-sm">
                  <div className="font-semibold text-green-700 dark:text-green-400">
                    Excelente Performance!
                  </div>
                  <div className="text-green-600 dark:text-green-500">
                    Esta mesa tem um ticket médio acima da média ({formatKwanza(stats.avgTicket)})
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
