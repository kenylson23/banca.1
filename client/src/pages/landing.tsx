import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  QrCode, 
  ChefHat, 
  BarChart3, 
  Zap, 
  Sparkles, 
  Smartphone, 
  TrendingUp, 
  Users, 
  Star, 
  Quote, 
  X, 
  Home, 
  Info, 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Facebook, 
  Instagram, 
  MessageCircle,
  Check,
  CreditCard,
  Building2,
  ShieldCheck,
  Headphones,
  ArrowRight,
  Play,
  Globe,
  Receipt,
  Utensils,
  Timer,
  Target,
  TrendingDown,
  Banknote,
  Store,
  LineChart,
  ChevronRight,
  Menu
} from "lucide-react";
import { useLocation } from "wouter";
import { useState, useEffect } from "react";
import dashboardImage from "@assets/image_1761991208974.png";
import kitchenImage from "@assets/image_1761991359072.png";

const subscriptionPlans = [
  {
    id: "basic",
    name: "Básico",
    description: "Ideal para restaurantes pequenos",
    priceKz: 15000,
    priceUsd: 18,
    interval: "mês",
    trial: 14,
    features: [
      { name: "Filiais", value: "1" },
      { name: "Mesas", value: "10" },
      { name: "Itens do Menu", value: "50" },
      { name: "Pedidos/mês", value: "500" },
      { name: "Usuários", value: "2" },
    ],
    highlights: [
      "QR Code para pedidos",
      "Painel da cozinha",
      "Estatísticas básicas",
      "Suporte por email",
    ],
    popular: false,
    cta: "Iniciar Teste Grátis",
  },
  {
    id: "professional",
    name: "Profissional",
    description: "Para restaurantes em crescimento",
    priceKz: 35000,
    priceUsd: 42,
    interval: "mês",
    trial: 14,
    features: [
      { name: "Filiais", value: "3" },
      { name: "Mesas", value: "30" },
      { name: "Itens do Menu", value: "150" },
      { name: "Pedidos/mês", value: "2.000" },
      { name: "Usuários", value: "5" },
    ],
    highlights: [
      "Tudo do Básico +",
      "Multi-filiais",
      "Relatórios avançados",
      "PDV completo",
      "Suporte prioritário",
    ],
    popular: true,
    cta: "Iniciar Teste Grátis",
  },
  {
    id: "enterprise",
    name: "Empresarial",
    description: "Para redes de restaurantes",
    priceKz: 70000,
    priceUsd: 84,
    interval: "mês",
    trial: 14,
    features: [
      { name: "Filiais", value: "10" },
      { name: "Mesas", value: "100" },
      { name: "Itens do Menu", value: "Ilimitado" },
      { name: "Pedidos/mês", value: "10.000" },
      { name: "Usuários", value: "15" },
    ],
    highlights: [
      "Tudo do Profissional +",
      "Gestão centralizada",
      "API de integração",
      "Relatórios consolidados",
      "Gerente de conta dedicado",
    ],
    popular: false,
    cta: "Iniciar Teste Grátis",
  },
  {
    id: "custom",
    name: "Enterprise",
    description: "Soluções personalizadas",
    priceKz: 150000,
    priceUsd: 180,
    interval: "mês",
    trial: 30,
    features: [
      { name: "Filiais", value: "Ilimitado" },
      { name: "Mesas", value: "Ilimitado" },
      { name: "Itens do Menu", value: "Ilimitado" },
      { name: "Pedidos/mês", value: "Ilimitado" },
      { name: "Usuários", value: "Ilimitado" },
    ],
    highlights: [
      "Tudo ilimitado",
      "Personalização completa",
      "Integração sob medida",
      "SLA garantido",
      "Suporte 24/7",
      "Treinamento presencial",
    ],
    popular: false,
    cta: "Falar com Vendas",
  },
];

const faqItems = [
  {
    question: "Preciso de cartão de crédito para começar o teste grátis?",
    answer: "Não! O período de teste é completamente gratuito e não requer nenhum dado de pagamento. Você terá acesso completo às funcionalidades do plano escolhido durante 14 dias (ou 30 dias no plano Enterprise). Só após decidir continuar é que solicitamos os dados de pagamento.",
  },
  {
    question: "Como funciona o suporte ao cliente em Angola?",
    answer: "Oferecemos suporte em português via WhatsApp, telefone e email. Nossa equipe está disponível de segunda a sábado das 8h às 20h. Clientes dos planos Empresarial e Enterprise têm acesso a um gerente de conta dedicado e suporte prioritário.",
  },
  {
    question: "Posso pagar em Kwanzas (AOA) ou Dólares (USD)?",
    answer: "Sim! Aceitamos pagamento em ambas as moedas. Você pode escolher a moeda de sua preferência no momento da subscrição. Oferecemos transferência bancária, Multicaixa Express e outros métodos de pagamento locais.",
  },
  {
    question: "O sistema funciona com impressoras de comandas?",
    answer: "Sim! O Na Bancada é compatível com impressoras térmicas via USB e rede. Suportamos as principais marcas do mercado como Epson, Bematech e outras. A configuração é simples e nossa equipe pode ajudar remotamente.",
  },
  {
    question: "Quanto tempo demora para implementar o sistema?",
    answer: "A configuração básica leva apenas 15-30 minutos. Você cria sua conta, cadastra o cardápio e gera os QR codes das mesas. Para configurações mais avançadas como multi-filiais e integrações, nossa equipe oferece suporte de implementação em até 24 horas.",
  },
  {
    question: "Posso gerenciar várias filiais com uma única conta?",
    answer: "Sim! A partir do plano Profissional, você pode gerenciar múltiplas filiais com uma única conta. Cada filial tem seu próprio cardápio, mesas e equipe, mas os relatórios podem ser consolidados para visão geral do negócio.",
  },
  {
    question: "Meus dados estão seguros?",
    answer: "Absolutamente! Utilizamos criptografia de ponta a ponta, backups automáticos diários e servidores seguros. Seus dados nunca são compartilhados com terceiros. Cumprimos as melhores práticas de segurança da informação.",
  },
  {
    question: "Posso mudar de plano depois?",
    answer: "Sim! Você pode fazer upgrade ou downgrade a qualquer momento. O upgrade é aplicado imediatamente e você paga apenas a diferença proporcional. O downgrade entra em vigor no próximo ciclo de faturamento.",
  },
];

const testimonials = [
  {
    name: "Maria João Ferreira",
    role: "Proprietária",
    company: "Restaurante Sabor de Angola",
    location: "Luanda",
    avatar: "MJ",
    quote: "Transformou completamente o nosso restaurante. Os clientes adoram pedir pelo telemóvel e a cozinha nunca mais errou um pedido! Reduzimos os erros em 90% e o tempo de espera caiu pela metade.",
    metric: { value: "90%", label: "menos erros" },
  },
  {
    name: "Paulo Costa",
    role: "Gerente Geral",
    company: "Churrasqueira Luanda",
    location: "Luanda",
    avatar: "PC",
    quote: "Incrível como economizamos tempo! Antes gastávamos horas anotando pedidos. Agora tudo é automático e sem erros. O ticket médio aumentou 25% com as sugestões do sistema.",
    metric: { value: "+25%", label: "ticket médio" },
  },
  {
    name: "Ana Silva",
    role: "Diretora de Operações",
    company: "Rede Café Colonial",
    location: "Benguela",
    avatar: "AS",
    quote: "Gerenciamos 5 filiais com uma única plataforma. As estatísticas ajudam-nos a tomar decisões inteligentes. Sabemos exatamente quais pratos investir e quais melhorar.",
    metric: { value: "5", label: "filiais geridas" },
  },
];

export default function Landing() {
  const [, setLocation] = useLocation();
  const [selectedImage, setSelectedImage] = useState<{ src: string; alt: string } | null>(null);
  const [currency, setCurrency] = useState<'AOA' | 'USD'>('AOA');
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  const formatPrice = (priceKz: number, priceUsd: number) => {
    if (currency === 'AOA') {
      return `${priceKz.toLocaleString('pt-AO')} Kz`;
    }
    return `$${priceUsd}`;
  };

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden">
      {/* Background Elements */}
      <div className="fixed inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/3 pointer-events-none" />
      <div className="fixed top-0 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

      {/* Sticky Header */}
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? 'bg-background/95 backdrop-blur-md shadow-sm border-b border-border/50' 
            : 'bg-transparent'
        }`}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 sm:h-12 sm:w-12 ring-2 ring-primary/20" data-testid="avatar-logo">
                <AvatarFallback className="bg-primary text-primary-foreground font-bold text-base sm:text-lg">NB</AvatarFallback>
              </Avatar>
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold text-foreground">Na Bancada</h1>
                <p className="text-xs text-muted-foreground">Gestão de Restaurantes</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => scrollToSection('features')}
                data-testid="nav-features"
              >
                Recursos
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => scrollToSection('how-it-works')}
                data-testid="nav-how-it-works"
              >
                Como Funciona
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => scrollToSection('pricing')}
                data-testid="nav-pricing"
              >
                Planos
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => scrollToSection('faq')}
                data-testid="nav-faq"
              >
                FAQ
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => scrollToSection('contact')}
                data-testid="nav-contact"
              >
                Contacto
              </Button>
            </nav>

            {/* CTA Buttons */}
            <div className="flex items-center gap-2 sm:gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation("/login")}
                data-testid="button-login-header"
                className="hidden sm:flex"
              >
                Entrar
              </Button>
              <Button
                size="sm"
                onClick={() => setLocation("/login")}
                data-testid="button-cta-header"
                className="hidden sm:flex"
              >
                Começar Grátis
              </Button>
              
              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                data-testid="button-mobile-menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-border/50 animate-slide-in-top">
              <nav className="flex flex-col gap-1">
                <Button variant="ghost" className="justify-start" onClick={() => scrollToSection('features')} data-testid="mobile-nav-features">
                  Recursos
                </Button>
                <Button variant="ghost" className="justify-start" onClick={() => scrollToSection('how-it-works')} data-testid="mobile-nav-how-it-works">
                  Como Funciona
                </Button>
                <Button variant="ghost" className="justify-start" onClick={() => scrollToSection('pricing')} data-testid="mobile-nav-pricing">
                  Planos
                </Button>
                <Button variant="ghost" className="justify-start" onClick={() => scrollToSection('faq')} data-testid="mobile-nav-faq">
                  FAQ
                </Button>
                <Button variant="ghost" className="justify-start" onClick={() => scrollToSection('contact')} data-testid="mobile-nav-contact">
                  Contacto
                </Button>
                <div className="flex gap-2 mt-3 pt-3 border-t border-border/50">
                  <Button variant="outline" className="flex-1" onClick={() => setLocation("/login")} data-testid="mobile-nav-login">
                    Entrar
                  </Button>
                  <Button className="flex-1" onClick={() => setLocation("/login")} data-testid="mobile-nav-cta">
                    Começar Grátis
                  </Button>
                </div>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-24 sm:pt-32 pb-16 sm:pb-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto text-center space-y-6 sm:space-y-8">
            {/* Trust Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium animate-fade-in">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-foreground">+120 restaurantes confiam em nós</span>
              <span className="text-primary font-semibold">em Angola</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight animate-slide-in-bottom">
              Gestão Inteligente para{" "}
              <span className="text-primary">Restaurantes Angolanos</span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              QR Codes para pedidos, cozinha em tempo real e controlo total. 
              Reduza erros, acelere o serviço e aumente as vendas.
            </p>

            {/* Trust Badges */}
            <div className="flex flex-wrap justify-center gap-3 sm:gap-4 pt-2">
              <Badge variant="secondary" className="py-2 px-4 gap-2">
                <ShieldCheck className="w-4 h-4 text-primary" />
                Sem cartão no teste
              </Badge>
              <Badge variant="secondary" className="py-2 px-4 gap-2">
                <Building2 className="w-4 h-4 text-primary" />
                Multi-filiais
              </Badge>
              <Badge variant="secondary" className="py-2 px-4 gap-2">
                <Headphones className="w-4 h-4 text-primary" />
                Suporte em Angola
              </Badge>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 pt-4">
              <Button
                size="lg"
                onClick={() => setLocation("/login")}
                data-testid="button-hero-cta-primary"
                className="text-base sm:text-lg px-8 py-6 font-semibold shadow-lg gap-2 w-full sm:w-auto"
              >
                Teste Grátis 14 Dias
                <ArrowRight className="w-5 h-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => scrollToSection('how-it-works')}
                data-testid="button-hero-cta-secondary"
                className="text-base sm:text-lg px-8 py-6 font-semibold gap-2 w-full sm:w-auto"
              >
                <Play className="w-5 h-5" />
                Ver Como Funciona
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* KPIs / Results Section */}
      <section className="relative py-16 sm:py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
              Resultados Comprovados
            </h2>
            <p className="text-muted-foreground">
              Métricas reais de restaurantes que usam o Na Bancada
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            <Card className="text-center hover-elevate bg-card/80 backdrop-blur-sm" data-testid="kpi-card-errors">
              <CardContent className="pt-6 pb-6">
                <div className="w-14 h-14 rounded-full bg-destructive/10 dark:bg-destructive/20 flex items-center justify-center mx-auto mb-4">
                  <TrendingDown className="w-7 h-7 text-destructive dark:text-destructive" />
                </div>
                <div className="text-4xl sm:text-5xl font-bold text-foreground mb-2">90%</div>
                <p className="text-muted-foreground font-medium">Menos Erros</p>
                <p className="text-xs text-muted-foreground mt-1">nos pedidos</p>
              </CardContent>
            </Card>

            <Card className="text-center hover-elevate bg-card/80 backdrop-blur-sm" data-testid="kpi-card-time">
              <CardContent className="pt-6 pb-6">
                <div className="w-14 h-14 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center mx-auto mb-4">
                  <Timer className="w-7 h-7 text-primary" />
                </div>
                <div className="text-4xl sm:text-5xl font-bold text-foreground mb-2">-35%</div>
                <p className="text-muted-foreground font-medium">Tempo de Espera</p>
                <p className="text-xs text-muted-foreground mt-1">do cliente</p>
              </CardContent>
            </Card>

            <Card className="text-center hover-elevate bg-card/80 backdrop-blur-sm" data-testid="kpi-card-revenue">
              <CardContent className="pt-6 pb-6">
                <div className="w-14 h-14 rounded-full bg-success/10 dark:bg-success/20 flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-7 h-7 text-success" />
                </div>
                <div className="text-4xl sm:text-5xl font-bold text-foreground mb-2">+20%</div>
                <p className="text-muted-foreground font-medium">Ticket Médio</p>
                <p className="text-xs text-muted-foreground mt-1">por mesa</p>
              </CardContent>
            </Card>

            <Card className="text-center hover-elevate bg-card/80 backdrop-blur-sm" data-testid="kpi-card-satisfaction">
              <CardContent className="pt-6 pb-6">
                <div className="w-14 h-14 rounded-full bg-accent flex items-center justify-center mx-auto mb-4">
                  <Star className="w-7 h-7 text-primary" />
                </div>
                <div className="text-4xl sm:text-5xl font-bold text-foreground mb-2">95%</div>
                <p className="text-muted-foreground font-medium">Satisfação</p>
                <p className="text-xs text-muted-foreground mt-1">dos clientes</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative py-16 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <Badge variant="secondary" className="mb-4">Funcionalidades</Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Tudo o que Precisa para{" "}
              <span className="text-primary">Gerir o Seu Restaurante</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Do pedido à entrega, tenha controlo total sobre todas as operações
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-6xl mx-auto">
            {/* Feature 1: QR Code */}
            <Card className="hover-elevate overflow-hidden" data-testid="feature-card-qrcode">
              <CardContent className="p-6 sm:p-8">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center flex-shrink-0">
                    <QrCode className="w-7 h-7 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      QR Codes por Mesa
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Cada mesa tem um código único. Clientes escaneiam e pedem direto no telemóvel.
                    </p>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Check className="w-4 h-4 text-primary flex-shrink-0" />
                        Cardápio digital interativo
                      </li>
                      <li className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Check className="w-4 h-4 text-primary flex-shrink-0" />
                        Fotos e descrições dos pratos
                      </li>
                      <li className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Check className="w-4 h-4 text-primary flex-shrink-0" />
                        Personalizações e observações
                      </li>
                      <li className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Check className="w-4 h-4 text-primary flex-shrink-0" />
                        Sem app para o cliente baixar
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Feature 2: Kitchen */}
            <Card className="hover-elevate overflow-hidden" data-testid="feature-card-kitchen">
              <CardContent className="p-6 sm:p-8">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-warning/20 to-warning/5 flex items-center justify-center flex-shrink-0">
                    <ChefHat className="w-7 h-7 text-warning dark:text-warning" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      Cozinha em Tempo Real
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Pedidos aparecem instantaneamente no painel da cozinha com alertas sonoros.
                    </p>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Check className="w-4 h-4 text-warning flex-shrink-0" />
                        Visualização por status
                      </li>
                      <li className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Check className="w-4 h-4 text-warning flex-shrink-0" />
                        Alertas de novos pedidos
                      </li>
                      <li className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Check className="w-4 h-4 text-warning flex-shrink-0" />
                        Tempo de preparo por prato
                      </li>
                      <li className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Check className="w-4 h-4 text-warning flex-shrink-0" />
                        Zero papel, zero erros
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Feature 3: POS */}
            <Card className="hover-elevate overflow-hidden" data-testid="feature-card-pos">
              <CardContent className="p-6 sm:p-8">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-success/20 to-success/5 flex items-center justify-center flex-shrink-0">
                    <Receipt className="w-7 h-7 text-success" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      PDV & Pagamentos
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Controle de caixa completo com múltiplas formas de pagamento.
                    </p>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Check className="w-4 h-4 text-success flex-shrink-0" />
                        Abertura e fecho de caixa
                      </li>
                      <li className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Check className="w-4 h-4 text-success flex-shrink-0" />
                        Pagamento dividido
                      </li>
                      <li className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Check className="w-4 h-4 text-success flex-shrink-0" />
                        Impressão de recibos
                      </li>
                      <li className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Check className="w-4 h-4 text-success flex-shrink-0" />
                        Relatórios de vendas
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Feature 4: Multi-branch */}
            <Card className="hover-elevate overflow-hidden" data-testid="feature-card-multibranch">
              <CardContent className="p-6 sm:p-8">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-info/20 to-info/5 flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-7 h-7 text-info" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      Multi-Filiais & Relatórios
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Gerencie todas as suas filiais de um só lugar com estatísticas consolidadas.
                    </p>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Check className="w-4 h-4 text-info flex-shrink-0" />
                        Dashboard centralizado
                      </li>
                      <li className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Check className="w-4 h-4 text-info flex-shrink-0" />
                        Pratos mais vendidos
                      </li>
                      <li className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Check className="w-4 h-4 text-info flex-shrink-0" />
                        Comparativo entre filiais
                      </li>
                      <li className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Check className="w-4 h-4 text-info flex-shrink-0" />
                        Exportação de dados
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="relative py-16 sm:py-24 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <Badge variant="secondary" className="mb-4">Como Funciona</Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Simples, Rápido e{" "}
              <span className="text-primary">Eficiente</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Em 3 passos simples, transforme a experiência do seu restaurante
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Step 1 */}
            <div className="relative">
              <Card className="h-full overflow-hidden hover-elevate" data-testid="step-card-1">
                <CardContent className="p-0">
                  <div className="aspect-[4/3] bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute top-4 left-4 w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center text-lg">
                      1
                    </div>
                    <Smartphone className="w-20 h-20 text-primary/80" />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      Cliente Escaneia o QR Code
                    </h3>
                    <p className="text-muted-foreground">
                      O cliente chega à mesa, escaneia o QR Code com o telemóvel e acede ao cardápio digital. Escolhe os pratos, personaliza e envia o pedido. Tudo sem precisar de um app.
                    </p>
                  </div>
                </CardContent>
              </Card>
              <div className="hidden lg:block absolute top-1/2 -right-4 transform translate-x-1/2">
                <ChevronRight className="w-8 h-8 text-muted-foreground/50" />
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <Card className="h-full overflow-hidden hover-elevate" data-testid="step-card-2">
                <CardContent className="p-0">
                  <div 
                    className="aspect-[4/3] bg-card relative overflow-hidden cursor-pointer group"
                    onClick={() => setSelectedImage({ 
                      src: kitchenImage, 
                      alt: "Painel da cozinha do Na Bancada" 
                    })}
                    data-testid="image-kitchen-demo"
                  >
                    <div className="absolute top-4 left-4 w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center text-lg z-10">
                      2
                    </div>
                    <img 
                      src={kitchenImage} 
                      alt="Painel da cozinha"
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-primary/90 text-primary-foreground px-4 py-2 rounded-md text-sm font-medium">
                        Ver em tamanho maior
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      Cozinha Recebe em Tempo Real
                    </h3>
                    <p className="text-muted-foreground">
                      O pedido aparece instantaneamente no painel da cozinha com alerta sonoro. A equipa prepara e actualiza o status. O cliente acompanha tudo pelo telemóvel.
                    </p>
                  </div>
                </CardContent>
              </Card>
              <div className="hidden lg:block absolute top-1/2 -right-4 transform translate-x-1/2">
                <ChevronRight className="w-8 h-8 text-muted-foreground/50" />
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative">
              <Card className="h-full overflow-hidden hover-elevate" data-testid="step-card-3">
                <CardContent className="p-0">
                  <div 
                    className="aspect-[4/3] bg-card relative overflow-hidden cursor-pointer group"
                    onClick={() => setSelectedImage({ 
                      src: dashboardImage, 
                      alt: "Dashboard do Na Bancada" 
                    })}
                    data-testid="image-dashboard-demo"
                  >
                    <div className="absolute top-4 left-4 w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center text-lg z-10">
                      3
                    </div>
                    <img 
                      src={dashboardImage} 
                      alt="Dashboard de gestão"
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-primary/90 text-primary-foreground px-4 py-2 rounded-md text-sm font-medium">
                        Ver em tamanho maior
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      Gerencie e Analise
                    </h3>
                    <p className="text-muted-foreground">
                      Acompanhe vendas, pratos mais pedidos e desempenho em tempo real. Tome decisões inteligentes baseadas em dados. Fecho de caixa simplificado.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* CTA after How it works */}
          <div className="text-center mt-12">
            <Button
              size="lg"
              onClick={() => setLocation("/login")}
              data-testid="button-cta-how-it-works"
              className="gap-2"
            >
              Experimentar Agora
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="relative py-16 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <Badge variant="secondary" className="mb-4">Planos e Preços</Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Escolha o Plano Ideal para o{" "}
              <span className="text-primary">Seu Negócio</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
              Todos os planos incluem teste grátis. Cancele a qualquer momento.
            </p>
            
            {/* Currency Toggle */}
            <div className="inline-flex items-center gap-3 p-1 bg-muted rounded-lg">
              <Button
                variant={currency === 'AOA' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setCurrency('AOA')}
                data-testid="button-currency-aoa"
                className="gap-2"
              >
                <Banknote className="w-4 h-4" />
                Kwanza (Kz)
              </Button>
              <Button
                variant={currency === 'USD' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setCurrency('USD')}
                data-testid="button-currency-usd"
                className="gap-2"
              >
                <Globe className="w-4 h-4" />
                Dólar ($)
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {subscriptionPlans.map((plan) => (
              <Card 
                key={plan.id} 
                className={`relative overflow-hidden hover-elevate ${
                  plan.popular ? 'border-primary shadow-lg ring-2 ring-primary/20' : ''
                }`}
                data-testid={`pricing-card-${plan.id}`}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-lg">
                    Mais Popular
                  </div>
                )}
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{plan.description}</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-foreground">
                        {formatPrice(plan.priceKz, plan.priceUsd)}
                      </span>
                      <span className="text-muted-foreground">/{plan.interval}</span>
                    </div>
                    <p className="text-sm text-primary mt-1">
                      {plan.trial} dias grátis
                    </p>
                  </div>

                  <div className="space-y-3">
                    <p className="text-sm font-medium text-foreground">Limites:</p>
                    {plan.features.map((feature) => (
                      <div key={feature.name} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{feature.name}</span>
                        <span className="font-medium text-foreground">{feature.value}</span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-border pt-4 space-y-2">
                    {plan.highlights.map((highlight) => (
                      <div key={highlight} className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-primary flex-shrink-0" />
                        <span className="text-muted-foreground">{highlight}</span>
                      </div>
                    ))}
                  </div>

                  <Button 
                    className="w-full" 
                    variant={plan.popular ? 'default' : 'outline'}
                    onClick={() => plan.id === 'custom' ? scrollToSection('contact') : setLocation("/login")}
                    data-testid={`button-plan-${plan.id}`}
                  >
                    {plan.cta}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Comparison Note */}
          <div className="text-center mt-8">
            <p className="text-sm text-muted-foreground">
              Precisa de ajuda para escolher? {" "}
              <button 
                className="text-primary hover:underline cursor-pointer" 
                onClick={() => scrollToSection('contact')}
              >
                Fale connosco
              </button>
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="relative py-16 sm:py-24 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <Badge variant="secondary" className="mb-4">Depoimentos</Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              O Que Dizem{" "}
              <span className="text-primary">Nossos Clientes</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Histórias reais de restaurantes que transformaram suas operações
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="h-full hover-elevate" data-testid={`testimonial-card-${index}`}>
                <CardContent className="p-6 flex flex-col h-full">
                  <Quote className="w-10 h-10 text-primary/20 mb-4" />
                  
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                    ))}
                  </div>

                  <p className="text-muted-foreground leading-relaxed flex-1 mb-6">
                    "{testimonial.quote}"
                  </p>

                  {/* Metric Badge */}
                  <div className="inline-flex items-center gap-2 bg-primary/10 rounded-lg px-3 py-2 mb-6 self-start">
                    <span className="text-2xl font-bold text-primary">{testimonial.metric.value}</span>
                    <span className="text-sm text-muted-foreground">{testimonial.metric.label}</span>
                  </div>

                  <div className="flex items-center gap-3 pt-4 border-t border-border">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {testimonial.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-foreground">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                      <p className="text-xs text-muted-foreground">{testimonial.company} - {testimonial.location}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="relative py-16 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <Badge variant="secondary" className="mb-4">Dúvidas Frequentes</Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Perguntas{" "}
              <span className="text-primary">Frequentes</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Tire suas dúvidas sobre o Na Bancada
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="space-y-4">
              {faqItems.map((item, index) => (
                <AccordionItem 
                  key={index} 
                  value={`item-${index}`}
                  className="border border-border rounded-lg px-6 bg-card/50 data-[state=open]:bg-card"
                  data-testid={`faq-item-${index}`}
                >
                  <AccordionTrigger className="text-left hover:no-underline py-4">
                    <span className="font-medium text-foreground pr-4">{item.question}</span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-4">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          {/* Additional help */}
          <div className="text-center mt-12">
            <p className="text-muted-foreground mb-4">
              Não encontrou o que procurava?
            </p>
            <Button variant="outline" onClick={() => scrollToSection('contact')} className="gap-2">
              <MessageCircle className="w-4 h-4" />
              Fale Connosco
            </Button>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="relative py-16 sm:py-24 bg-primary/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
              Pronto para Transformar o{" "}
              <span className="text-primary">Seu Restaurante?</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Junte-se a mais de 120 restaurantes em Angola que já modernizaram suas operações com o Na Bancada. Comece seu teste grátis hoje.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button
                size="lg"
                onClick={() => setLocation("/login")}
                data-testid="button-final-cta"
                className="text-lg px-8 py-6 font-semibold shadow-lg gap-2"
              >
                Começar Teste Grátis
                <ArrowRight className="w-5 h-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => scrollToSection('contact')}
                data-testid="button-final-contact"
                className="text-lg px-8 py-6 font-semibold gap-2"
              >
                <Phone className="w-5 h-5" />
                Falar com Vendas
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="relative py-16 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <Badge variant="secondary" className="mb-4">Contacto</Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Entre em{" "}
              <span className="text-primary">Contacto</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Estamos prontos para ajudar. Escolha o canal de sua preferência.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {/* WhatsApp */}
            <Card className="text-center hover-elevate" data-testid="contact-whatsapp">
              <CardContent className="p-6">
                <div className="w-16 h-16 rounded-full bg-success/10 dark:bg-success/20 flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-8 h-8 text-success" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">WhatsApp</h3>
                <p className="text-muted-foreground mb-4">Resposta rápida</p>
                <Button 
                  variant="outline" 
                  className="w-full gap-2"
                  onClick={() => window.open('https://wa.me/244923456789', '_blank')}
                  data-testid="button-contact-whatsapp"
                >
                  +244 923 456 789
                </Button>
              </CardContent>
            </Card>

            {/* Telefone */}
            <Card className="text-center hover-elevate" data-testid="contact-phone">
              <CardContent className="p-6">
                <div className="w-16 h-16 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center mx-auto mb-4">
                  <Phone className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Telefone</h3>
                <p className="text-muted-foreground mb-4">Seg-Sáb: 8h-20h</p>
                <Button 
                  variant="outline" 
                  className="w-full gap-2"
                  onClick={() => window.open('tel:+244923456789', '_blank')}
                  data-testid="button-contact-phone"
                >
                  +244 923 456 789
                </Button>
              </CardContent>
            </Card>

            {/* Email */}
            <Card className="text-center hover-elevate" data-testid="contact-email">
              <CardContent className="p-6">
                <div className="w-16 h-16 rounded-full bg-info/10 dark:bg-info/20 flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-info" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Email</h3>
                <p className="text-muted-foreground mb-4">Resposta em 24h</p>
                <Button 
                  variant="outline" 
                  className="w-full gap-2"
                  onClick={() => window.open('mailto:contacto@nabancada.ao', '_blank')}
                  data-testid="button-contact-email"
                >
                  contacto@nabancada.ao
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted/50 border-t border-border/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <Avatar className="h-12 w-12 ring-2 ring-primary/20" data-testid="avatar-footer">
                  <AvatarFallback className="bg-primary text-primary-foreground font-bold text-lg">NB</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-bold text-foreground">Na Bancada</h3>
                  <p className="text-sm text-muted-foreground">Gestão de Restaurantes</p>
                </div>
              </div>
              <p className="text-muted-foreground mb-4 max-w-md">
                Solução completa de gestão para restaurantes angolanos. QR codes, cozinha em tempo real, PDV e muito mais.
              </p>
              <div className="flex gap-3">
                <Button variant="outline" size="icon" data-testid="social-facebook">
                  <Facebook className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon" data-testid="social-instagram">
                  <Instagram className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon" data-testid="social-whatsapp">
                  <MessageCircle className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold text-foreground mb-4">Links Rápidos</h4>
              <ul className="space-y-2">
                <li>
                  <button className="text-muted-foreground hover:text-foreground transition-colors" onClick={() => scrollToSection('features')}>
                    Recursos
                  </button>
                </li>
                <li>
                  <button className="text-muted-foreground hover:text-foreground transition-colors" onClick={() => scrollToSection('pricing')}>
                    Planos
                  </button>
                </li>
                <li>
                  <button className="text-muted-foreground hover:text-foreground transition-colors" onClick={() => scrollToSection('faq')}>
                    FAQ
                  </button>
                </li>
                <li>
                  <button className="text-muted-foreground hover:text-foreground transition-colors" onClick={() => scrollToSection('contact')}>
                    Contacto
                  </button>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="font-semibold text-foreground mb-4">Contacto</h4>
              <ul className="space-y-3">
                <li className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="w-4 h-4 text-primary" />
                  +244 923 456 789
                </li>
                <li className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="w-4 h-4 text-primary" />
                  contacto@nabancada.ao
                </li>
                <li className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-4 h-4 text-primary" />
                  Luanda, Angola
                </li>
              </ul>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-border/50 pt-8">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} Na Bancada. Todos os direitos reservados.
              </p>
              <div className="flex gap-4 text-sm">
                <button className="text-muted-foreground hover:text-foreground transition-colors">
                  Termos de Serviço
                </button>
                <button className="text-muted-foreground hover:text-foreground transition-colors">
                  Política de Privacidade
                </button>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Mobile Sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-md border-t border-border/50 sm:hidden z-40">
        <Button 
          className="w-full gap-2 py-6" 
          onClick={() => setLocation("/login")}
          data-testid="button-mobile-sticky-cta"
        >
          Começar Teste Grátis
          <ArrowRight className="w-5 h-5" />
        </Button>
      </div>

      {/* Image Lightbox */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden bg-background">
          {selectedImage && (
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 z-10 bg-background/80 hover:bg-background"
                onClick={() => setSelectedImage(null)}
                data-testid="button-close-lightbox"
              >
                <X className="w-5 h-5" />
              </Button>
              <img 
                src={selectedImage.src} 
                alt={selectedImage.alt}
                className="w-full h-auto"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
