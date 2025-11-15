import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, ArrowRight } from "lucide-react";
import { Link } from "wouter";

interface ProductsCardProps {
  topProducts: Array<{ name: string; quantity: number }>;
}

export function ProductsCard({ topProducts }: ProductsCardProps) {
  const topProduct = topProducts.length > 0 ? topProducts[0] : null;

  return (
    <Card data-testid="card-products-sold">
      <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
        <CardTitle className="text-base">Produtos vendidos</CardTitle>
        <Package className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <p className="text-sm text-muted-foreground mb-2">Produto mais vendido</p>
          {topProduct ? (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{topProduct.name}</span>
              <span className="text-sm font-bold">{topProduct.quantity}x</span>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Nenhum produto vendido</p>
          )}
        </div>
        <Button variant="outline" className="w-full" size="sm" asChild data-testid="button-view-products">
          <Link href="/reports?tab=products">
            <ArrowRight className="h-4 w-4 mr-2" />
            Ir para o relatório
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
