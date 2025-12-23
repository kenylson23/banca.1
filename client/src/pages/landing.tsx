import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  QrCode,
  ChefHat,
  BarChart3,
  Smartphone,
  Check,
  ArrowRight,
  Utensils,
  Clock,
  Shield,
  Zap,
  Users,
  TrendingUp,
  CreditCard,
  Package,
  Phone,
  Mail,
  MapPin,
  Menu,
  X
} from "lucide-react";
import { useLocation } from "wouter";
import { useState, useEffect } from "react";

export default function Landing() {
  const [, navigate] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    document.title = "Na Bancada - Gestão de Restaurantes Inteligente";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute("content", "Plataforma completa de gestão de restaurantes com pedidos por QR Code, painel da cozinha, PDV integrado e análises avançadas. Aumenta vendas em até 35%.");
    }
  }, []);

  const features = [
    {
      icon: QrCode,
      title: "Pedidos por QR Code",
      description: "Clientes pedem diretamente do telemóvel. Sem filas, sem erros, sem papel."
    },
    {
      icon: ChefHat,
      title: "Painel da Cozinha",
      description: "Visualização inteligente de pedidos. Priorização automática. Rastreamento em tempo real."
    },
    {
      icon: CreditCard,
      title: "PDV & Pagamentos",
      description: "Terminal de vendas integrado com múltiplas formas de pagamento e controle completo."
    },
    {
      icon: BarChart3,
      title: "Relatórios Inteligentes",
      description: "Análises de vendas, produtos populares, horários de pico e muito mais, em tempo real."
    },
    {
      icon: Smartphone,
      title: "Cardápio Digital",
      description: "Menu moderno com fotos, descrições, preços e opções de personalização por item."
    },
    {
      icon: Users,
      title: "Multi-Usuários",
      description: "Gestão de permissões para cozinheiros, garçons, caixas e administradores."
    }
  ];

  const benefits = [
    { icon: Clock, text: "Implementação em minutos, não horas" },
    { icon: Zap, text: "Atualizações automáticas e segurança de ponta" },
    { icon: TrendingUp, text: "Aumento médio de 25-35% nas vendas" },
    { icon: Shield, text: "Dados 100% seguros com encriptação" },
    { icon: Package, text: "Gestão de inventário integrada" },
    { icon: Users, text: "Suporte técnico especializado 24/7" }
  ];

  const pricingPlans = [
    {
      id: "starter",
      name: "Starter",
      description: "Perfeito para restaurantes pequenos",
      price: 15000,
      interval: "mês",
      features: [
        "1 Filial",
        "10 Mesas",
        "50 Itens do Menu",
        "500 Pedidos/mês",
        "2 Usuários",
        "QR Code para pedidos",
        "Painel da cozinha",
        "Suporte por email"
      ],
      popular: false
    },
    {
      id: "professional",
      name: "Professional",
      description: "Para restaurantes em crescimento",
      price: 35000,
      interval: "mês",
      features: [
        "3 Filiais",
        "30 Mesas",
        "150 Itens do Menu",
        "2.000 Pedidos/mês",
        "5 Usuários",
        "Tudo do Starter +",
        "Multi-filiais",
        "Relatórios avançados",
        "PDV completo",
        "Cardápio digital",
        "Suporte prioritário"
      ],
      popular: true
    },
    {
      id: "enterprise",
      name: "Enterprise",
      description: "Para grandes operações",
      price: "Personalizado",
      interval: "negociar",
      features: [
        "Filiais ilimitadas",
        "Mesas ilimitadas",
        "Itens ilimitados",
        "Pedidos ilimitados",
        "Usuários ilimitados",
        "Tudo do Professional +",
        "API customizada",
        "Integração ERP",
        "Análises avançadas",
        "Suporte dedicado",
        "Consultoria incluída"
      ],
      popular: false
    }
  ];

  const testimonials = [
    {
      name: "Maria João Ferreira",
      role: "Proprietária",
      company: "Restaurante Sabor de Angola",
      quote: "Transformou completamente o nosso negócio. Os clientes adoram pedir pelo telemóvel e a cozinha nunca mais errou um pedido!",
      rating: 5
    },
    {
      name: "Paulo Costa",
      role: "Gerente Geral",
      company: "Churrasqueira Luanda",
      quote: "Incrível como economizamos tempo! Antes gastávamos horas anotando pedidos. Agora tudo é automático e sem erros.",
      rating: 5
    },
    {
      name: "Ana Silva",
      role: "Diretora de Operações",
      company: "Rede Café Colonial",
      quote: "Gerenciamos 5 filiais com uma única plataforma. As estatísticas ajudam-nos a tomar decisões inteligentes.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
              <Utensils className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg">Na Bancada</span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition">Funcionalidades</a>
            <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition">Preços</a>
            <a href="#testimonials" className="text-sm text-muted-foreground hover:text-foreground transition">Clientes</a>
            <Button onClick={() => navigate("/login")} variant="outline" size="sm">
              Entrar
            </Button>
            <Button onClick={() => navigate("/login")} size="sm" className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700">
              Começar Grátis
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            data-testid="button-mobile-menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-background/95 backdrop-blur">
            <div className="px-4 py-4 space-y-3">
              <a href="#features" className="block text-sm text-muted-foreground hover:text-foreground transition">Funcionalidades</a>
              <a href="#pricing" className="block text-sm text-muted-foreground hover:text-foreground transition">Preços</a>
              <a href="#testimonials" className="block text-sm text-muted-foreground hover:text-foreground transition">Clientes</a>
              <Button onClick={() => navigate("/login")} variant="outline" size="sm" className="w-full">
                Entrar
              </Button>
              <Button onClick={() => navigate("/login")} size="sm" className="w-full bg-gradient-to-r from-orange-500 to-red-600">
                Começar Grátis
              </Button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-32">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-orange-500/10 via-transparent to-transparent"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
                Gestão Inteligente de
                <span className="block bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">
                  Restaurantes
                </span>
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
                Aumente suas vendas em até 35%. Reduza custos operacionais. Melhore a experiência do cliente com pedidos por QR Code, painel inteligente da cozinha e análises em tempo real.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => navigate("/login")}
                size="lg"
                className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white h-12 px-8"
                data-testid="button-start-free"
              >
                Começar Grátis <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                onClick={() => navigate("/login")}
                variant="outline"
                size="lg"
                className="h-12 px-8"
                data-testid="button-demo"
              >
                Ver Demo
              </Button>
            </div>

            <div className="pt-8 grid grid-cols-3 gap-8 max-w-2xl mx-auto text-center">
              <div>
                <div className="text-3xl font-bold text-orange-500">500+</div>
                <div className="text-sm text-muted-foreground">Restaurantes ativos</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-orange-500">50K+</div>
                <div className="text-sm text-muted-foreground">Pedidos por dia</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-orange-500">4.9★</div>
                <div className="text-sm text-muted-foreground">Satisfação</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 sm:py-32 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl sm:text-4xl font-bold">Tudo que precisa para gerir seu restaurante</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Funcionalidades poderosas desenhadas especificamente para restaurantes, cafés e bares.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title} className="hover-elevate">
                  <CardContent className="pt-6">
                    <div className="flex flex-col gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-500/20 to-red-600/20 rounded-lg flex items-center justify-center">
                        <Icon className="w-6 h-6 text-orange-500" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                        <p className="text-sm text-muted-foreground">{feature.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 sm:py-32 bg-muted/30 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold">Por que escolher Na Bancada?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Benefícios comprovados para aumentar lucros e eficiência operacional.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <div key={benefit.text} className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-gradient-to-br from-orange-500/20 to-red-600/20">
                      <Icon className="w-6 h-6 text-orange-500" />
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground pt-2">{benefit.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 sm:py-32 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl sm:text-4xl font-bold">Planos simples e transparentes</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Escolha o plano que se adequa ao seu restaurante. Sem taxas ocultas, sem contratos longos.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {pricingPlans.map((plan) => (
              <Card
                key={plan.id}
                className={`flex flex-col relative ${
                  plan.popular ? "border-orange-500/50 lg:scale-105" : ""
                } hover-elevate`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-orange-500 to-red-600 text-white text-xs font-semibold px-4 py-1 rounded-full">
                      Mais Popular
                    </span>
                  </div>
                )}

                <CardContent className="pt-8 flex flex-col gap-6 flex-1">
                  <div>
                    <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
                    <div className="space-y-1">
                      {typeof plan.price === "string" ? (
                        <p className="text-3xl font-bold">{plan.price}</p>
                      ) : (
                        <>
                          <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold">{plan.price.toLocaleString("pt-AO")}</span>
                            <span className="text-sm text-muted-foreground">Kz/{plan.interval}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <ul className="space-y-3 flex-1">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={() => navigate("/login")}
                    className={
                      plan.popular
                        ? "bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 w-full"
                        : "w-full"
                    }
                    variant={plan.popular ? "default" : "outline"}
                    data-testid={`button-plan-${plan.id}`}
                  >
                    {plan.id === "enterprise" ? "Contacte-nos" : "Começar Agora"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 sm:py-32 bg-muted/30 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl sm:text-4xl font-bold">O que nossos clientes dizem</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Histórias de sucesso de restaurantes que transformaram seus negócios com Na Bancada.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.name} className="hover-elevate">
                <CardContent className="pt-6 space-y-4">
                  <div className="flex gap-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <span key={i} className="text-orange-500">★</span>
                    ))}
                  </div>
                  <p className="text-muted-foreground italic">"{testimonial.quote}"</p>
                  <div className="border-t pt-4">
                    <p className="font-semibold text-sm">{testimonial.name}</p>
                    <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                    <p className="text-xs text-muted-foreground">{testimonial.company}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 sm:py-32 border-t">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-3xl sm:text-4xl font-bold">Pronto para transformar seu restaurante?</h2>
            <p className="text-lg text-muted-foreground">
              Junte-se a 500+ restaurantes que já aumentaram suas vendas com Na Bancada.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => navigate("/login")}
              size="lg"
              className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 h-12 px-8"
              data-testid="button-cta-start"
            >
              Começar Agora <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                  <Utensils className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold">Na Bancada</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Plataforma de gestão de restaurantes completa e inteligente.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Produto</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#features" className="hover:text-foreground transition">Funcionalidades</a></li>
                <li><a href="#pricing" className="hover:text-foreground transition">Preços</a></li>
                <li><a href="/termos" className="hover:text-foreground transition">Termos</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="/privacidade" className="hover:text-foreground transition">Privacidade</a></li>
                <li><a href="#" className="hover:text-foreground transition">Cookies</a></li>
                <li><a href="#" className="hover:text-foreground transition">Sobre</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Contacte-nos</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <a href="mailto:suporte@nabancada.com" className="hover:text-foreground transition">
                    suporte@nabancada.com
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <a href="tel:+244922123456" className="hover:text-foreground transition">
                    +244 92 212 3456
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2025 Na Bancada. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
