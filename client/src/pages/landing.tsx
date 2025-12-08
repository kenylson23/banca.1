import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  QrCode, 
  ChefHat, 
  BarChart3, 
  Smartphone, 
  Check,
  Star,
  ArrowRight,
  Play,
  Menu,
  X,
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
  MapPin
} from "lucide-react";
import { useLocation } from "wouter";
import { useState, useEffect } from "react";

const features = [
  {
    icon: QrCode,
    title: "Gestão de Pedidos",
    description: "Sistema completo de pedidos com QR Code. Clientes pedem diretamente pelo telemóvel, sem filas nem erros."
  },
  {
    icon: CreditCard,
    title: "Pagamentos e PDV",
    description: "Terminal de vendas integrado com múltiplas formas de pagamento. Controle total das transações."
  },
  {
    icon: BarChart3,
    title: "Relatórios Inteligentes",
    description: "Análises detalhadas de vendas, produtos mais pedidos, horários de pico e muito mais."
  },
  {
    icon: Smartphone,
    title: "QR Code Menu & Delivery",
    description: "Cardápio digital moderno com fotos, descrições e opções de personalização para cada item."
  }
];

const benefits = [
  { icon: Clock, text: "Implementação em menos de 30 minutos" },
  { icon: Shield, text: "Dados seguros com criptografia de ponta" },
  { icon: Zap, text: "Atualizações automáticas sem custo adicional" },
  { icon: Users, text: "Suporte técnico especializado incluído" },
  { icon: TrendingUp, text: "Aumento médio de 25% nas vendas" },
  { icon: Package, text: "Gestão de inventário integrada" }
];

const testimonials = [
  {
    name: "Maria João Ferreira",
    role: "Proprietária",
    company: "Restaurante Sabor de Angola",
    avatar: "MJ",
    quote: "Transformou completamente o nosso restaurante. Os clientes adoram pedir pelo telemóvel e a cozinha nunca mais errou um pedido!",
    rating: 5
  },
  {
    name: "Paulo Costa",
    role: "Gerente Geral",
    company: "Churrasqueira Luanda",
    avatar: "PC",
    quote: "Incrível como economizamos tempo! Antes gastávamos horas anotando pedidos. Agora tudo é automático e sem erros.",
    rating: 5
  },
  {
    name: "Ana Silva",
    role: "Diretora de Operações",
    company: "Rede Café Colonial",
    avatar: "AS",
    quote: "Gerenciamos 5 filiais com uma única plataforma. As estatísticas ajudam-nos a tomar decisões inteligentes.",
    rating: 5
  }
];

const pricingPlans = [
  {
    id: "starter",
    name: "Starter",
    description: "Ideal para restaurantes pequenos",
    price: 15000,
    priceUsd: 18,
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
    popular: false,
    cta: "Começar Agora"
  },
  {
    id: "professional",
    name: "Professional",
    description: "Para restaurantes em crescimento",
    price: 35000,
    priceUsd: 42,
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
      "Suporte prioritário"
    ],
    popular: true,
    cta: "Começar Agora"
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "Para redes de restaurantes",
    price: 70000,
    priceUsd: 84,
    interval: "mês",
    features: [
      "10+ Filiais",
      "Mesas Ilimitadas",
      "Itens Ilimitados",
      "Pedidos Ilimitados",
      "15+ Usuários",
      "Tudo do Professional +",
      "API de integração",
      "Gerente dedicado",
      "SLA garantido"
    ],
    popular: false,
    cta: "Falar com Vendas"
  }
];

export default function Landing() {
  const [, setLocation] = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currency, setCurrency] = useState<'AOA' | 'USD'>('AOA');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
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

  const formatPrice = (priceAoa: number, priceUsd: number) => {
    if (currency === 'AOA') {
      return `${priceAoa.toLocaleString('pt-AO')} Kz`;
    }
    return `$${priceUsd}`;
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? 'bg-white shadow-sm border-b border-gray-100' 
            : 'bg-white'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <div className="flex items-center gap-3" data-testid="logo-header">
              <div className="w-10 h-10 rounded-lg bg-[#0054FF] flex items-center justify-center">
                <Utensils className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-[#1D1F22]">Na Bancada</span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-8">
              <button 
                onClick={() => scrollToSection('features')}
                className="text-[#1D1F22] hover:text-[#0054FF] font-medium transition-colors"
                data-testid="nav-features"
              >
                Funcionalidades
              </button>
              <button 
                onClick={() => scrollToSection('pricing')}
                className="text-[#1D1F22] hover:text-[#0054FF] font-medium transition-colors"
                data-testid="nav-pricing"
              >
                Preços
              </button>
              <button 
                onClick={() => scrollToSection('testimonials')}
                className="text-[#1D1F22] hover:text-[#0054FF] font-medium transition-colors"
                data-testid="nav-about"
              >
                Sobre
              </button>
              <button 
                onClick={() => scrollToSection('contact')}
                className="text-[#1D1F22] hover:text-[#0054FF] font-medium transition-colors"
                data-testid="nav-contact"
              >
                Contacto
              </button>
            </nav>

            {/* CTA Buttons */}
            <div className="hidden lg:flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => setLocation("/login")}
                data-testid="button-login-header"
                className="text-[#1D1F22] hover:text-[#0054FF] hover:bg-transparent font-medium"
              >
                Entrar
              </Button>
              <Button
                onClick={() => setLocation("/login")}
                data-testid="button-signup-header"
                className="bg-[#0054FF] hover:bg-[#0048DD] text-white font-medium"
              >
                Criar Conta
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="button-mobile-menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-[#1D1F22]" />
              ) : (
                <Menu className="w-6 h-6 text-[#1D1F22]" />
              )}
            </Button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden py-4 border-t border-gray-100">
              <nav className="flex flex-col gap-2">
                <button 
                  onClick={() => scrollToSection('features')}
                  className="text-left py-3 px-4 text-[#1D1F22] hover:bg-[#F5F7FA] rounded-lg font-medium"
                  data-testid="mobile-nav-features"
                >
                  Funcionalidades
                </button>
                <button 
                  onClick={() => scrollToSection('pricing')}
                  className="text-left py-3 px-4 text-[#1D1F22] hover:bg-[#F5F7FA] rounded-lg font-medium"
                  data-testid="mobile-nav-pricing"
                >
                  Preços
                </button>
                <button 
                  onClick={() => scrollToSection('testimonials')}
                  className="text-left py-3 px-4 text-[#1D1F22] hover:bg-[#F5F7FA] rounded-lg font-medium"
                  data-testid="mobile-nav-about"
                >
                  Sobre
                </button>
                <button 
                  onClick={() => scrollToSection('contact')}
                  className="text-left py-3 px-4 text-[#1D1F22] hover:bg-[#F5F7FA] rounded-lg font-medium"
                  data-testid="mobile-nav-contact"
                >
                  Contacto
                </button>
                <div className="flex gap-3 mt-4 pt-4 border-t border-gray-100">
                  <Button
                    variant="outline"
                    className="flex-1 border-gray-200"
                    onClick={() => setLocation("/login")}
                    data-testid="mobile-button-login"
                  >
                    Entrar
                  </Button>
                  <Button
                    className="flex-1 bg-[#0054FF] hover:bg-[#0048DD]"
                    onClick={() => setLocation("/login")}
                    data-testid="mobile-button-signup"
                  >
                    Criar Conta
                  </Button>
                </div>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-24 lg:pt-32 pb-16 lg:pb-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Side - Content */}
            <div className="space-y-8">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#1D1F22] leading-tight" data-testid="text-hero-title">
                O sistema de gestão para restaurantes que acelera o seu negócio
              </h1>
              <p className="text-lg lg:text-xl text-gray-600 leading-relaxed" data-testid="text-hero-subtitle">
                Pedidos por QR Code, cozinha em tempo real, relatórios inteligentes e controlo total num único software.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  onClick={() => setLocation("/login")}
                  data-testid="button-hero-cta"
                  className="bg-[#0054FF] hover:bg-[#0048DD] text-white font-semibold text-lg"
                >
                  Experimentar grátis
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => scrollToSection('features')}
                  data-testid="button-hero-demo"
                  className="border-gray-300 text-[#1D1F22] hover:bg-[#F5F7FA] font-semibold text-lg"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Ver demonstração
                </Button>
              </div>
            </div>

            {/* Right Side - Dashboard Mockup */}
            <div className="relative" data-testid="hero-mockup">
              <div className="bg-[#F5F7FA] rounded-2xl p-6 lg:p-8 shadow-lg">
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  {/* Mock Dashboard Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#0054FF]/10 flex items-center justify-center">
                        <BarChart3 className="w-4 h-4 text-[#0054FF]" />
                      </div>
                      <span className="font-semibold text-[#1D1F22]">Dashboard</span>
                    </div>
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-gray-200" />
                      <div className="w-3 h-3 rounded-full bg-gray-200" />
                      <div className="w-3 h-3 rounded-full bg-gray-200" />
                    </div>
                  </div>
                  
                  {/* Mock Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-[#F5F7FA] rounded-lg p-3">
                      <p className="text-xs text-gray-500 mb-1">Vendas Hoje</p>
                      <p className="text-lg font-bold text-[#1D1F22]">142.500 Kz</p>
                      <p className="text-xs text-[#18C37D]">+12%</p>
                    </div>
                    <div className="bg-[#F5F7FA] rounded-lg p-3">
                      <p className="text-xs text-gray-500 mb-1">Pedidos</p>
                      <p className="text-lg font-bold text-[#1D1F22]">48</p>
                      <p className="text-xs text-[#18C37D]">+8%</p>
                    </div>
                    <div className="bg-[#F5F7FA] rounded-lg p-3">
                      <p className="text-xs text-gray-500 mb-1">Mesas Ativas</p>
                      <p className="text-lg font-bold text-[#1D1F22]">12</p>
                      <p className="text-xs text-gray-400">de 20</p>
                    </div>
                  </div>

                  {/* Mock Chart */}
                  <div className="bg-[#F5F7FA] rounded-lg p-4">
                    <div className="flex items-end justify-between h-24 gap-2">
                      {[40, 65, 45, 80, 55, 90, 70].map((height, i) => (
                        <div 
                          key={i}
                          className="flex-1 bg-[#0054FF] rounded-t"
                          style={{ height: `${height}%` }}
                        />
                      ))}
                    </div>
                    <div className="flex justify-between mt-2">
                      {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map((day) => (
                        <span key={day} className="text-xs text-gray-400">{day}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 bg-white rounded-lg shadow-lg p-3 hidden lg:flex items-center gap-2" data-testid="floating-order-confirmed">
                <div className="w-8 h-8 rounded-full bg-[#18C37D]/10 flex items-center justify-center">
                  <Check className="w-4 h-4 text-[#18C37D]" />
                </div>
                <span className="text-sm font-medium text-[#1D1F22]">Pedido Confirmado</span>
              </div>
              
              <div className="absolute -bottom-4 -left-4 bg-white rounded-lg shadow-lg p-3 hidden lg:flex items-center gap-2" data-testid="floating-new-order">
                <div className="w-8 h-8 rounded-full bg-[#0054FF]/10 flex items-center justify-center">
                  <QrCode className="w-4 h-4 text-[#0054FF]" />
                </div>
                <span className="text-sm font-medium text-[#1D1F22]">Mesa 5 - Novo Pedido</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 lg:py-24 bg-[#F5F7FA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-[#1D1F22] mb-4" data-testid="text-features-title">
              Funcionalidades Completas
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto" data-testid="text-features-subtitle">
              Tudo o que precisa para gerir o seu restaurante de forma eficiente e moderna
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow"
                data-testid={`feature-card-${index}`}
              >
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-[#0054FF]/10 flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-[#0054FF]" />
                  </div>
                  <h3 className="text-lg font-semibold text-[#1D1F22] mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Side - Benefits List */}
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-[#1D1F22] mb-6" data-testid="text-benefits-title">
                Porquê escolher o Na Bancada?
              </h2>
              <p className="text-lg text-gray-600 mb-8" data-testid="text-benefits-subtitle">
                Centenas de restaurantes já confiam em nós para modernizar as suas operações e aumentar as vendas.
              </p>
              
              <div className="grid sm:grid-cols-2 gap-4">
                {benefits.map((benefit, index) => (
                  <div 
                    key={index}
                    className="flex items-center gap-3 p-4 bg-[#F5F7FA] rounded-lg"
                    data-testid={`benefit-item-${index}`}
                  >
                    <div className="w-10 h-10 rounded-lg bg-[#0054FF]/10 flex items-center justify-center flex-shrink-0">
                      <benefit.icon className="w-5 h-5 text-[#0054FF]" />
                    </div>
                    <span className="text-sm font-medium text-[#1D1F22]">
                      {benefit.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Side - Image/Illustration */}
            <div className="relative" data-testid="benefits-illustration">
              <div className="bg-[#F5F7FA] rounded-2xl p-8 lg:p-12">
                <div className="grid grid-cols-2 gap-4">
                  {/* Tablet Mockup */}
                  <div className="col-span-2 bg-white rounded-xl p-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                      <ChefHat className="w-5 h-5 text-[#0054FF]" />
                      <span className="font-semibold text-[#1D1F22]">Cozinha</span>
                    </div>
                    <div className="space-y-2">
                      {[1, 2, 3].map((item) => (
                        <div key={item} className="flex items-center justify-between p-3 bg-[#F5F7FA] rounded-lg">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-[#18C37D]" />
                            <span className="text-sm text-[#1D1F22]">Mesa {item}</span>
                          </div>
                          <span className="text-xs text-gray-500">2 itens</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* QR Code */}
                  <div className="bg-white rounded-xl p-4 shadow-sm text-center">
                    <QrCode className="w-12 h-12 text-[#0054FF] mx-auto mb-2" />
                    <p className="text-xs text-gray-500">Mesa 5</p>
                  </div>
                  
                  {/* Stats */}
                  <div className="bg-white rounded-xl p-4 shadow-sm">
                    <TrendingUp className="w-6 h-6 text-[#18C37D] mb-2" />
                    <p className="text-2xl font-bold text-[#1D1F22]">+32%</p>
                    <p className="text-xs text-gray-500">Este mês</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-16 lg:py-24 bg-[#F5F7FA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-[#1D1F22] mb-4" data-testid="text-testimonials-title">
              O que dizem os nossos clientes
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto" data-testid="text-testimonials-subtitle">
              Histórias reais de restaurantes que transformaram as suas operações
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <Card 
                key={index}
                className="bg-white border-0 shadow-sm"
                data-testid={`testimonial-card-${index}`}
              >
                <CardContent className="p-6">
                  {/* Stars */}
                  <div className="flex gap-1 mb-4" data-testid={`testimonial-rating-${index}`}>
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-[#0054FF] text-[#0054FF]" />
                    ))}
                  </div>
                  
                  {/* Quote */}
                  <p className="text-gray-600 mb-6 leading-relaxed" data-testid={`testimonial-quote-${index}`}>
                    "{testimonial.quote}"
                  </p>
                  
                  {/* Author */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#0054FF]/10 flex items-center justify-center">
                      <span className="text-sm font-semibold text-[#0054FF]">
                        {testimonial.avatar}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-[#1D1F22]" data-testid={`testimonial-name-${index}`}>{testimonial.name}</p>
                      <p className="text-sm text-gray-500" data-testid={`testimonial-role-${index}`}>{testimonial.role}, {testimonial.company}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-[#1D1F22] mb-4" data-testid="text-pricing-title">
              Planos e Preços
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-6" data-testid="text-pricing-subtitle">
              Escolha o plano ideal para o seu negócio. Todos incluem período de teste grátis.
            </p>
            
            {/* Currency Toggle */}
            <div className="inline-flex items-center gap-2 p-1 bg-[#F5F7FA] rounded-lg">
              <button
                onClick={() => setCurrency('AOA')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  currency === 'AOA' 
                    ? 'bg-white text-[#1D1F22] shadow-sm' 
                    : 'text-gray-500 hover:text-[#1D1F22]'
                }`}
                data-testid="button-currency-aoa"
              >
                Kwanzas (AOA)
              </button>
              <button
                onClick={() => setCurrency('USD')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  currency === 'USD' 
                    ? 'bg-white text-[#1D1F22] shadow-sm' 
                    : 'text-gray-500 hover:text-[#1D1F22]'
                }`}
                data-testid="button-currency-usd"
              >
                Dólares (USD)
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {pricingPlans.map((plan) => (
              <Card 
                key={plan.id}
                className={`relative border-2 transition-all ${
                  plan.popular 
                    ? 'border-[#0054FF] shadow-lg scale-105' 
                    : 'border-gray-100 shadow-sm hover:border-gray-200'
                }`}
                data-testid={`pricing-card-${plan.id}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-[#0054FF] text-white text-xs font-semibold px-3 py-1 rounded-full" data-testid="badge-popular">
                      Mais Popular
                    </span>
                  </div>
                )}
                
                <CardContent className="p-6 lg:p-8">
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-[#1D1F22] mb-2" data-testid={`pricing-name-${plan.id}`}>{plan.name}</h3>
                    <p className="text-gray-500 text-sm" data-testid={`pricing-description-${plan.id}`}>{plan.description}</p>
                  </div>
                  
                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-[#1D1F22]" data-testid={`pricing-price-${plan.id}`}>
                        {formatPrice(plan.price, plan.priceUsd)}
                      </span>
                      <span className="text-gray-500">/{plan.interval}</span>
                    </div>
                  </div>
                  
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-3">
                        <Check className="w-5 h-5 text-[#18C37D] flex-shrink-0" />
                        <span className="text-sm text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button
                    onClick={() => setLocation("/login")}
                    className={`w-full font-semibold ${
                      plan.popular 
                        ? 'bg-[#0054FF] hover:bg-[#0048DD] text-white' 
                        : 'bg-[#F5F7FA] hover:bg-gray-200 text-[#1D1F22]'
                    }`}
                    data-testid={`button-pricing-${plan.id}`}
                  >
                    {plan.cta}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24 bg-[#0054FF]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4" data-testid="text-cta-title">
            Pronto para modernizar o seu restaurante?
          </h2>
          <p className="text-lg text-white/80 mb-8" data-testid="text-cta-subtitle">
            Comece hoje mesmo com 14 dias de teste grátis. Sem compromisso.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => setLocation("/login")}
              className="bg-white hover:bg-gray-100 text-[#0054FF] font-semibold text-lg"
              data-testid="button-cta-bottom"
            >
              Começar Agora
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-[#1D1F22] py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            {/* Logo & Description */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4" data-testid="logo-footer">
                <div className="w-10 h-10 rounded-lg bg-[#0054FF] flex items-center justify-center">
                  <Utensils className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">Na Bancada</span>
              </div>
              <p className="text-gray-400 mb-6 max-w-md" data-testid="text-footer-description">
                O sistema de gestão de restaurantes mais completo de Angola. 
                Modernize as suas operações e aumente as suas vendas.
              </p>
              <div className="flex gap-4">
                <a 
                  href="tel:+244923456789" 
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                  data-testid="link-phone"
                >
                  <Phone className="w-5 h-5 text-white" />
                </a>
                <a 
                  href="mailto:info@nabancada.ao" 
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                  data-testid="link-email"
                >
                  <Mail className="w-5 h-5 text-white" />
                </a>
              </div>
            </div>
            
            {/* Links */}
            <div>
              <h4 className="text-white font-semibold mb-4">Produto</h4>
              <ul className="space-y-3">
                <li>
                  <button 
                    onClick={() => scrollToSection('features')} 
                    className="text-gray-400 hover:text-white transition-colors"
                    data-testid="footer-link-features"
                  >
                    Funcionalidades
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => scrollToSection('pricing')} 
                    className="text-gray-400 hover:text-white transition-colors"
                    data-testid="footer-link-pricing"
                  >
                    Preços
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => scrollToSection('testimonials')} 
                    className="text-gray-400 hover:text-white transition-colors"
                    data-testid="footer-link-testimonials"
                  >
                    Testemunhos
                  </button>
                </li>
              </ul>
            </div>
            
            {/* Contact */}
            <div>
              <h4 className="text-white font-semibold mb-4">Contacto</h4>
              <ul className="space-y-3">
                <li className="flex items-center gap-2 text-gray-400" data-testid="contact-phone">
                  <Phone className="w-4 h-4" />
                  <span>+244 923 456 789</span>
                </li>
                <li className="flex items-center gap-2 text-gray-400" data-testid="contact-email">
                  <Mail className="w-4 h-4" />
                  <span>info@nabancada.ao</span>
                </li>
                <li className="flex items-center gap-2 text-gray-400" data-testid="contact-location">
                  <MapPin className="w-4 h-4" />
                  <span>Luanda, Angola</span>
                </li>
              </ul>
            </div>
          </div>
          
          {/* Bottom Bar */}
          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm" data-testid="text-copyright">
              &copy; {new Date().getFullYear()} Na Bancada. Todos os direitos reservados.
            </p>
            <div className="flex gap-6">
              <a 
                href="#" 
                className="text-gray-400 hover:text-white text-sm transition-colors"
                data-testid="link-terms"
              >
                Termos de Uso
              </a>
              <a 
                href="#" 
                className="text-gray-400 hover:text-white text-sm transition-colors"
                data-testid="link-privacy"
              >
                Política de Privacidade
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
