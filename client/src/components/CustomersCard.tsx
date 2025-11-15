import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Users, Star } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface CustomersCardProps {
  newCustomers: number;
  averageRating: number;
  totalReviews: number;
  isLoading?: boolean;
}

export function CustomersCard({ newCustomers, averageRating, totalReviews, isLoading }: CustomersCardProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {[...Array(2)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-5 w-5" />
            </CardHeader>
            <CardContent className="space-y-2">
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-4 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card data-testid="card-new-customers">
        <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
          <CardTitle className="text-base">Novos clientes</CardTitle>
          <Users className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="text-2xl font-bold" data-testid="text-new-customers">{newCustomers}</div>
          <p className="text-xs text-muted-foreground">Clientes únicos no período</p>
        </CardContent>
      </Card>

      <Card data-testid="card-customer-reviews">
        <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
          <CardTitle className="text-base">Avaliação dos clientes</CardTitle>
          <Star className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent className="space-y-3">
          {totalReviews > 0 ? (
            <>
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                <span className="text-2xl font-bold" data-testid="text-avg-rating">{averageRating.toFixed(1)}</span>
                <span className="text-sm text-muted-foreground">({totalReviews} avaliações)</span>
              </div>
            </>
          ) : (
            <div className="flex items-center space-x-2">
              <Switch id="enable-reviews" data-testid="switch-enable-reviews" />
              <Label htmlFor="enable-reviews" className="text-sm">
                Ativar avaliações
              </Label>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
