import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardKPIs } from "@/components/DashboardKPIs";
import { SalesProgressChart } from "@/components/SalesProgressChart";
import { VisitsCard } from "@/components/VisitsCard";
import { MarketingCard } from "@/components/MarketingCard";
import { ProductsCard } from "@/components/ProductsCard";
import { CustomersCard } from "@/components/CustomersCard";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

type DashboardStats = {
  salesByDay: Array<{ date: string; sales: number; orders: number; pdv: number; web: number }>;
  totalOrders: number;
  totalRevenue: number;
  averageTicket: number;
  newCustomers: number;
  averageRating: number;
  totalReviews: number;
  topProducts: Array<{ name: string; quantity: number }>;
};

type VisitStats = {
  totalVisits: number;
  visitsToday: number;
  visitsBySource: Array<{ source: string; count: number }>;
};

export default function ReportsDashboard() {
  const { toast } = useToast();
  const [dateFilter, setDateFilter] = useState('7days');
  const [customDateRange, setCustomDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({ from: undefined, to: undefined });
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const dashboardParams = {
    dateFilter,
    orderType: 'all',
    ...(dateFilter === 'custom' && customDateRange.from && {
      customFrom: customDateRange.from.toISOString(),
      customTo: customDateRange.to?.toISOString(),
    }),
  };

  const { data: dashboardStats, isLoading: loadingDashboard, isError: dashboardError } = useQuery<DashboardStats>({
    queryKey: ['/api/dashboard/stats', dashboardParams],
    meta: {
      onError: () => {
        toast({
          variant: "destructive",
          title: "Erro ao carregar dashboard",
          description: "Não foi possível carregar os dados do dashboard.",
        });
      },
    },
  });

  const { data: visitStats, isLoading: loadingVisits, isError: visitsError } = useQuery<VisitStats>({
    queryKey: ['/api/menu-visits/stats', dashboardParams],
    meta: {
      onError: () => {
        toast({
          variant: "destructive",
          title: "Erro ao carregar visitas",
          description: "Não foi possível carregar os dados de visitas.",
        });
      },
    },
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-4">
          <div className="space-y-2">
            <Label>Período</Label>
            <Tabs value={dateFilter} onValueChange={setDateFilter} className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="today" data-testid="filter-dashboard-date-today">Hoje</TabsTrigger>
                <TabsTrigger value="yesterday" data-testid="filter-dashboard-date-yesterday">Ontem</TabsTrigger>
                <TabsTrigger value="7days" data-testid="filter-dashboard-date-7days">7 dias</TabsTrigger>
                <TabsTrigger value="30days" data-testid="filter-dashboard-date-30days">30 dias</TabsTrigger>
                <TabsTrigger value="custom" data-testid="filter-dashboard-date-custom">Custom</TabsTrigger>
              </TabsList>
            </Tabs>
            {dateFilter === 'custom' && (
              <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !customDateRange.from && 'text-muted-foreground'
                    )}
                    data-testid="button-custom-date-range"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {customDateRange.from ? (
                      customDateRange.to ? (
                        <>
                          {format(customDateRange.from, 'dd/MM/yy')} -{' '}
                          {format(customDateRange.to, 'dd/MM/yy')}
                        </>
                      ) : (
                        format(customDateRange.from, 'dd/MM/yyyy')
                      )
                    ) : (
                      'Selecionar período'
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="range"
                    selected={{ from: customDateRange.from, to: customDateRange.to }}
                    onSelect={(range) => {
                      setCustomDateRange({
                        from: range?.from,
                        to: range?.to,
                      });
                      if (range?.from && range?.to) {
                        setIsPopoverOpen(false);
                      }
                    }}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            )}
          </div>
        </CardContent>
      </Card>

      <SalesProgressChart salesByDay={dashboardStats?.salesByDay || []} />

      <DashboardKPIs
        totalOrders={dashboardStats?.totalOrders || 0}
        totalRevenue={dashboardStats?.totalRevenue || 0}
        averageTicket={dashboardStats?.averageTicket || 0}
        isLoading={loadingDashboard}
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <VisitsCard
          totalVisits={visitStats?.totalVisits || 0}
          visitsToday={visitStats?.visitsToday || 0}
          isLoading={loadingVisits}
        />

        <MarketingCard />

        <ProductsCard topProducts={dashboardStats?.topProducts || []} />
      </div>

      <CustomersCard
        newCustomers={dashboardStats?.newCustomers || 0}
        averageRating={dashboardStats?.averageRating || 0}
        totalReviews={dashboardStats?.totalReviews || 0}
        isLoading={loadingDashboard}
      />
    </div>
  );
}
