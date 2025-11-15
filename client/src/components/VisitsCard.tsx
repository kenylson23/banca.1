import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface VisitsCardProps {
  totalVisits: number;
  visitsToday: number;
  isLoading?: boolean;
}

export function VisitsCard({ totalVisits, visitsToday, isLoading }: VisitsCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-5 w-5" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-9 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="card-menu-visits">
      <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
        <CardTitle className="text-base">Visitas ao menu digital</CardTitle>
        <Eye className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <div className="text-2xl font-bold" data-testid="text-visits-today">{visitsToday}</div>
          <p className="text-xs text-muted-foreground">Visitas de hoje</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">
            Total no período: <span className="font-semibold text-foreground">{totalVisits}</span>
          </p>
        </div>
        <Button variant="outline" className="w-full" size="sm" data-testid="button-view-visits">
          <Eye className="h-4 w-4 mr-2" />
          Ver mais
        </Button>
      </CardContent>
    </Card>
  );
}
