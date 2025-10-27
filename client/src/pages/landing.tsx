import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { QrCode, ChefHat, BarChart3, Zap } from "lucide-react";
import { useLocation } from "wouter";

export default function Landing() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background flex flex-col safe-area-inset-top safe-area-inset-bottom">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12 lg:py-16 flex-1 flex flex-col">
        <div className="text-center space-y-6 sm:space-y-8 mb-8 sm:mb-16 max-w-4xl mx-auto">
          <h1 className="text-5xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-foreground">
            Na Bancada
          </h1>
          
          <div className="space-y-4 sm:space-y-6">
            <h2 className="text-xl sm:text-3xl md:text-4xl font-semibold text-foreground px-2">
              Simplifique o atendimento no seu restaurante.
            </h2>
            
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed px-4">
              O Na Bancada conecta mesas, cozinha e clientes em tempo real — pedidos mais rápidos, 
              menos erros e uma experiência moderna para o seu restaurante.
            </p>
            
            <p className="text-sm sm:text-base text-muted-foreground/80 italic">
              Feito à medida dos restaurantes angolanos.
            </p>
          </div>

          <div className="pt-4 sm:pt-6">
            <Button
              size="lg"
              onClick={() => setLocation("/login")}
              data-testid="button-access-system"
              className="text-lg sm:text-lg px-10 sm:px-12 min-h-14 sm:min-h-12 bg-orange-500 hover:bg-orange-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all w-full sm:w-auto max-w-sm mx-auto"
            >
              Acessar Sistema
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-6xl mx-auto w-full mb-8 sm:mb-12">
          <Card className="hover-elevate">
            <CardContent className="p-5 sm:p-6 space-y-3 sm:space-y-4">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <QrCode className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">QR Codes por Mesa</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Gere e gerencie QR codes únicos para cada mesa do restaurante
              </p>
            </CardContent>
          </Card>

          <Card className="hover-elevate">
            <CardContent className="p-5 sm:p-6 space-y-3 sm:space-y-4">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <ChefHat className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">Painel da Cozinha</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Visualize pedidos em tempo real com alertas e filtros inteligentes
              </p>
            </CardContent>
          </Card>

          <Card className="hover-elevate">
            <CardContent className="p-5 sm:p-6 space-y-3 sm:space-y-4">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">Tempo Real</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Comunicação instantânea entre mesas, admin e cozinha via WebSockets
              </p>
            </CardContent>
          </Card>

          <Card className="hover-elevate">
            <CardContent className="p-5 sm:p-6 space-y-3 sm:space-y-4">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">Estatísticas</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Acompanhe vendas diárias e pratos mais pedidos em tempo real
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <footer className="py-6 sm:py-8 border-t border-border">
        <p className="text-center text-sm text-muted-foreground">
          Desenvolvido por Kenylson Lourenço
        </p>
      </footer>
    </div>
  );
}
