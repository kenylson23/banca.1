import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { QrCode, ChefHat, BarChart3, Zap } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-6 mb-16">
          <h1 className="text-5xl font-bold text-foreground">
            Na Bancada
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Sistema completo de gestão de restaurante com QR Codes por mesa e comunicação em tempo real com a cozinha
          </p>
          <Button
            size="lg"
            onClick={() => window.location.href = "/api/login"}
            data-testid="button-login"
            className="mt-8"
          >
            Entrar no Sistema
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
          <Card>
            <CardContent className="p-6 space-y-3">
              <div className="h-12 w-12 rounded-md bg-primary/10 flex items-center justify-center">
                <QrCode className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">QR Codes por Mesa</h3>
              <p className="text-sm text-muted-foreground">
                Gere e gerencie QR codes únicos para cada mesa do restaurante
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-3">
              <div className="h-12 w-12 rounded-md bg-primary/10 flex items-center justify-center">
                <ChefHat className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">Painel da Cozinha</h3>
              <p className="text-sm text-muted-foreground">
                Visualize pedidos em tempo real com alertas e filtros inteligentes
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-3">
              <div className="h-12 w-12 rounded-md bg-primary/10 flex items-center justify-center">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">Tempo Real</h3>
              <p className="text-sm text-muted-foreground">
                Comunicação instantânea entre mesas, admin e cozinha via WebSockets
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-3">
              <div className="h-12 w-12 rounded-md bg-primary/10 flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">Estatísticas</h3>
              <p className="text-sm text-muted-foreground">
                Acompanhe vendas diárias e pratos mais pedidos em tempo real
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
