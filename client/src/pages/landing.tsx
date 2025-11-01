import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { QrCode, ChefHat, BarChart3, Zap, Sparkles, Smartphone, TrendingUp, Users, Star, Quote } from "lucide-react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import dashboardImage from "@assets/image_1761991208974.png";
import kitchenImage from "@assets/image_1761991359072.png";

export default function Landing() {
  const [, setLocation] = useLocation();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  const features = [
    {
      icon: QrCode,
      title: "QR Codes por Mesa",
      description: "Gere códigos únicos para cada mesa — clientes fazem pedidos direto no telemóvel"
    },
    {
      icon: ChefHat,
      title: "Painel da Cozinha",
      description: "Visualização clara dos pedidos em tempo real com alertas inteligentes"
    },
    {
      icon: Zap,
      title: "Tempo Real",
      description: "Comunicação instantânea entre mesas, admin e cozinha — sem atrasos"
    },
    {
      icon: BarChart3,
      title: "Estatísticas",
      description: "Acompanhe vendas e pratos mais pedidos para decisões inteligentes"
    }
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Gradiente de fundo moderno */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/10 dark:from-primary/10 dark:via-background dark:to-primary/5" />
      
      {/* Padrão decorativo sutil */}
      <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.03]" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--foreground)) 1px, transparent 0)`,
        backgroundSize: '48px 48px'
      }} />

      <div className="relative z-10 min-h-screen flex flex-col safe-area-inset-top safe-area-inset-bottom">
        {/* Hero Section */}
        <div className="flex-1 flex items-center justify-center">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="text-center space-y-6 sm:space-y-8 mb-12 sm:mb-20 max-w-4xl mx-auto"
            >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium"
                data-testid="badge-innovation"
              >
                <Sparkles className="w-4 h-4" />
                Inovação à mesa angolana
              </motion.div>

              {/* Título Principal */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight"
              >
                Na Bancada
              </motion.h1>
              
              {/* Slogan Inspirador */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="space-y-4 sm:space-y-5"
              >
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-foreground px-2 leading-snug">
                  Gestão inteligente para restaurantes angolanos
                </h2>
                
                <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed px-4">
                  Rapidez, eficiência e inovação à mesa. Conecte clientes, cozinha e gestão em tempo real — 
                  pedidos mais rápidos, zero erros, experiência moderna.
                </p>
              </motion.div>

              {/* CTA Button com animação de pulsar */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="pt-6 sm:pt-8"
              >
                <motion.div
                  animate={{
                    scale: [1, 1.02, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "reverse",
                    ease: "easeInOut"
                  }}
                  className="inline-block"
                >
                  <Button
                    size="lg"
                    onClick={() => setLocation("/login")}
                    data-testid="button-access-system"
                    className="text-base sm:text-lg px-8 sm:px-12 py-6 sm:py-7 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg hover:shadow-xl transition-all w-full sm:w-auto min-w-[280px] sm:min-w-[320px]"
                  >
                    Acessar Sistema
                  </Button>
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Features Grid com animação */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6 max-w-6xl mx-auto w-full"
            >
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  variants={itemVariants}
                  data-testid={`card-feature-${index}`}
                >
                  <Card className="hover-elevate h-full bg-card/50 backdrop-blur-sm border-border/50">
                    <CardContent className="p-5 sm:p-6 space-y-3 sm:space-y-4 h-full flex flex-col">
                      <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center ring-1 ring-primary/10">
                        <feature.icon className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Seção de Demonstração */}
        <section className="py-16 sm:py-20 lg:py-24 border-t border-border/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12 sm:mb-16"
            >
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
                Veja o sistema em ação
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
                Descubra como o Na Bancada transforma a gestão do seu restaurante
              </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 max-w-7xl mx-auto">
              {/* Demo 1: Cliente fazendo pedido */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <Card className="overflow-hidden h-full hover-elevate bg-card/50 backdrop-blur-sm">
                  <CardContent className="p-0">
                    <div className="aspect-[4/3] bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-0 opacity-10" style={{
                        backgroundImage: `repeating-linear-gradient(45deg, hsl(var(--foreground)) 0px, hsl(var(--foreground)) 2px, transparent 2px, transparent 10px)`,
                      }} />
                      <Smartphone className="w-16 h-16 sm:w-20 sm:h-20 text-primary relative z-10" />
                    </div>
                    <div className="p-5 sm:p-6">
                      <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">
                        1. Cliente escaneia QR Code
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Cada mesa tem um código único. Cliente abre o cardápio no telemóvel e faz o pedido sem precisar chamar garçom.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Demo 2: Cozinha recebe pedido */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Card className="overflow-hidden h-full hover-elevate bg-card/50 backdrop-blur-sm">
                  <CardContent className="p-0">
                    <div className="aspect-[4/3] bg-card relative overflow-hidden">
                      <img 
                        src={kitchenImage} 
                        alt="Painel da cozinha do Na Bancada mostrando pedidos em tempo real"
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <div className="p-5 sm:p-6">
                      <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">
                        2. Cozinha recebe em tempo real
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Pedido aparece instantaneamente no painel da cozinha com alerta sonoro. Zero papel, zero erros.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Demo 3: Dashboard com estatísticas */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Card className="overflow-hidden h-full hover-elevate bg-card/50 backdrop-blur-sm">
                  <CardContent className="p-0">
                    <div className="aspect-[4/3] bg-card relative overflow-hidden">
                      <img 
                        src={dashboardImage} 
                        alt="Dashboard do Na Bancada mostrando estatísticas em tempo real"
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <div className="p-5 sm:p-6">
                      <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">
                        3. Acompanhe resultados
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Veja vendas, pratos mais pedidos e desempenho em tempo real. Decisões baseadas em dados.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Seção de Prova Social */}
        <section className="py-16 sm:py-20 lg:py-24 bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            {/* Métricas de Impacto */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-16 sm:mb-20"
            >
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground text-center mb-12 sm:mb-16">
                Resultados que falam por si
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="text-center"
                  data-testid="metric-orders"
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                    <TrendingUp className="w-8 h-8 text-primary" />
                  </div>
                  <div className="text-4xl sm:text-5xl font-bold text-foreground mb-2">
                    90%
                  </div>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    Redução de erros nos pedidos
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="text-center"
                  data-testid="metric-time"
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                    <Zap className="w-8 h-8 text-primary" />
                  </div>
                  <div className="text-4xl sm:text-5xl font-bold text-foreground mb-2">
                    2h/dia
                  </div>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    Economia de tempo na gestão
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="text-center"
                  data-testid="metric-satisfaction"
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                    <Users className="w-8 h-8 text-primary" />
                  </div>
                  <div className="text-4xl sm:text-5xl font-bold text-foreground mb-2">
                    95%
                  </div>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    Satisfação dos clientes
                  </p>
                </motion.div>
              </div>
            </motion.div>

            {/* Depoimentos */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h3 className="text-2xl sm:text-3xl font-bold text-foreground text-center mb-10 sm:mb-12">
                O que dizem nossos clientes
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
                {/* Depoimento 1 */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  <Card className="h-full hover-elevate bg-card/70 backdrop-blur-sm">
                    <CardContent className="p-6">
                      <Quote className="w-8 h-8 text-primary/30 mb-4" />
                      <div className="flex gap-1 mb-4">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                        ))}
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                        "Transformou completamente o nosso restaurante. Os clientes adoram pedir pelo telemóvel e a cozinha nunca mais errou um pedido!"
                      </p>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-semibold text-primary">MJ</span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">Maria João</p>
                          <p className="text-xs text-muted-foreground">Restaurante Sabor de Angola</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Depoimento 2 */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <Card className="h-full hover-elevate bg-card/70 backdrop-blur-sm">
                    <CardContent className="p-6">
                      <Quote className="w-8 h-8 text-primary/30 mb-4" />
                      <div className="flex gap-1 mb-4">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                        ))}
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                        "Incrível como economizamos tempo! Antes gastávamos horas anotando pedidos. Agora tudo é automático e sem erros."
                      </p>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-semibold text-primary">PC</span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">Paulo Costa</p>
                          <p className="text-xs text-muted-foreground">Churrasqueira Luanda</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Depoimento 3 */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <Card className="h-full hover-elevate bg-card/70 backdrop-blur-sm">
                    <CardContent className="p-6">
                      <Quote className="w-8 h-8 text-primary/30 mb-4" />
                      <div className="flex gap-1 mb-4">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                        ))}
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                        "As estatísticas ajudam-nos a tomar decisões inteligentes. Sabemos exatamente quais pratos investir e quais melhorar."
                      </p>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-semibold text-primary">AS</span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">Ana Silva</p>
                          <p className="text-xs text-muted-foreground">Café Colonial</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="py-6 sm:py-8 border-t border-border/50 backdrop-blur-sm"
        >
          <p className="text-center text-sm text-muted-foreground">
            Desenvolvido por{' '}
            <a
              href="https://www.instagram.com/kenylson_lourenco/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80 font-medium transition-colors hover:underline"
              data-testid="link-developer"
            >
              Kenylson Lourenço
            </a>
          </p>
        </motion.footer>
      </div>
    </div>
  );
}
