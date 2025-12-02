import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Mail, Lock, Building2, Phone, MapPin, Check, CreditCard, ChevronRight, Users, TrendingUp, BarChart3 } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, insertRestaurantSchema, type LoginUser, type InsertRestaurant, type SubscriptionPlan } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useLocation, Link } from "wouter";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatKwanza } from "@/lib/formatters";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

export default function Login() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const loginForm = useForm<LoginUser>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const registerForm = useForm<InsertRestaurant>({
    resolver: zodResolver(insertRestaurantSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      password: "",
      planId: "",
    },
  });

  const { data: plans, isLoading: plansLoading } = useQuery<SubscriptionPlan[]>({
    queryKey: ["/api/subscription-plans"],
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginUser) => {
      const response = await apiRequest("POST", "/api/auth/login", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Bem-vindo!",
        description: "Login realizado com sucesso.",
      });
      setLocation("/dashboard");
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao fazer login",
        description: error.message || "Email ou senha incorretos",
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: InsertRestaurant) => {
      const response = await apiRequest("POST", "/api/restaurants/register", data);
      return response.json();
    },
    onSuccess: (data) => {
      registerForm.reset();
      setAcceptedTerms(false);
      toast({
        title: "Cadastro enviado!",
        description: "Seu cadastro foi enviado e está aguardando aprovação do administrador.",
      });
      setIsLoginMode(true);
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao cadastrar",
        description: error.message || "Erro ao enviar cadastro",
        variant: "destructive",
      });
    },
  });

  const onLogin = (data: LoginUser) => {
    loginMutation.mutate(data);
  };

  const onRegister = (data: InsertRestaurant) => {
    if (!acceptedTerms) {
      toast({
        title: "Termos obrigatórios",
        description: "Você precisa aceitar os termos e condições.",
        variant: "destructive",
      });
      return;
    }
    registerMutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col min-h-screen bg-background">
        <div className="flex-1 flex flex-col px-6 sm:px-8 lg:px-12 xl:px-16 py-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 mb-8" data-testid="link-home-logo">
            <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-4 h-4 text-primary-foreground" fill="currentColor">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="font-bold text-lg text-foreground">Na Bancada</span>
          </Link>

          {/* Form Content */}
          <div className="flex-1 flex flex-col justify-center max-w-sm w-full mx-auto lg:mx-0">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-foreground mb-1">
                {isLoginMode ? "Bem-vindo de volta" : "Comece Agora"}
              </h1>
              <p className="text-sm text-muted-foreground">
                {isLoginMode 
                  ? "Entre com suas credenciais para acessar sua conta"
                  : "Cadastre seu restaurante e comece a gerenciar"}
              </p>
            </div>

            {isLoginMode ? (
              /* Login Form */
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                  <FormField
                    control={loginForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem className="space-y-1.5">
                        <FormLabel className="text-xs font-medium text-foreground">Email</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                            <Input
                              type="email"
                              placeholder="seu@email.com"
                              className="pl-9 h-9 text-sm bg-muted/30 border-border/50 focus:border-primary focus:bg-background transition-all"
                              data-testid="input-login-email"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <FormLabel className="text-xs font-medium text-foreground">Senha</FormLabel>
                          <button 
                            type="button" 
                            className="text-xs text-primary hover:underline"
                            onClick={() => toast({ title: "Em breve", description: "Funcionalidade de recuperação de senha em desenvolvimento." })}
                            data-testid="button-forgot-password"
                          >
                            Esqueceu a senha?
                          </button>
                        </div>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="min 6 caracteres"
                              className="pl-9 pr-9 h-9 text-sm bg-muted/30 border-border/50 focus:border-primary focus:bg-background transition-all"
                              data-testid="input-login-password"
                              {...field}
                            />
                            <button
                              type="button"
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                              onClick={() => setShowPassword(!showPassword)}
                              data-testid="button-toggle-password"
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <div className="flex items-center gap-2">
                    <Checkbox 
                      id="remember" 
                      className="h-3.5 w-3.5 border-border/50 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      data-testid="checkbox-remember-me"
                    />
                    <label htmlFor="remember" className="text-xs text-muted-foreground cursor-pointer">
                      Lembrar de mim
                    </label>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-9 text-sm font-medium"
                    data-testid="button-login-submit"
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? (
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                        Entrando...
                      </div>
                    ) : (
                      "Entrar"
                    )}
                  </Button>

                  <p className="text-center text-xs text-muted-foreground">
                    Não tem uma conta?{" "}
                    <button
                      type="button"
                      className="text-primary font-medium hover:underline"
                      onClick={() => setIsLoginMode(false)}
                      data-testid="link-register"
                    >
                      Cadastre-se
                    </button>
                  </p>
                </form>
              </Form>
            ) : (
              /* Register Form */
              <Form {...registerForm}>
                <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-3">
                  <div className="p-2.5 rounded-md bg-primary/5 border border-primary/10">
                    <div className="flex items-center gap-2">
                      <Check className="h-3.5 w-3.5 text-primary" />
                      <span className="text-xs text-foreground">
                        Cadastro com aprovação pelo administrador
                      </span>
                    </div>
                  </div>

                  <FormField
                    control={registerForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormLabel className="text-xs font-medium text-foreground">Nome do Restaurante</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                            <Input
                              type="text"
                              placeholder="Restaurante ABC"
                              className="pl-9 h-9 text-sm bg-muted/30 border-border/50 focus:border-primary focus:bg-background transition-all"
                              data-testid="input-restaurant-name"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={registerForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormLabel className="text-xs font-medium text-foreground">Email</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                            <Input
                              type="email"
                              placeholder="contato@restaurante.com"
                              className="pl-9 h-9 text-sm bg-muted/30 border-border/50 focus:border-primary focus:bg-background transition-all"
                              data-testid="input-restaurant-email"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={registerForm.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormLabel className="text-xs font-medium text-foreground">Telefone</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                            <Input
                              type="tel"
                              placeholder="+244 923 456 789"
                              className="pl-9 h-9 text-sm bg-muted/30 border-border/50 focus:border-primary focus:bg-background transition-all"
                              data-testid="input-restaurant-phone"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={registerForm.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormLabel className="text-xs font-medium text-foreground">Endereço</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                            <Textarea
                              placeholder="Rua Comandante Gika, 123 - Maianga - Luanda"
                              className="pl-9 pt-2 min-h-[60px] text-sm bg-muted/30 border-border/50 focus:border-primary focus:bg-background transition-all resize-none"
                              data-testid="input-restaurant-address"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={registerForm.control}
                    name="planId"
                    render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormLabel className="text-xs font-medium text-foreground">Plano de Subscrição</FormLabel>
                        <FormControl>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                            disabled={plansLoading}
                          >
                            <SelectTrigger 
                              className="h-9 text-sm bg-muted/30 border-border/50 focus:border-primary focus:bg-background transition-all" 
                              data-testid="select-plan"
                            >
                              <div className="flex items-center gap-2">
                                <CreditCard className="h-4 w-4 text-muted-foreground pointer-events-none" />
                                <SelectValue placeholder={plansLoading ? "Carregando planos..." : "Selecione um plano"} />
                              </div>
                            </SelectTrigger>
                            <SelectContent>
                              {plans?.filter(p => p.isActive).map((plan) => (
                                <SelectItem key={plan.id} value={plan.id} data-testid={`option-plan-${plan.id}`}>
                                  <div className="flex flex-col gap-0.5">
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm font-medium">{plan.name}</span>
                                      {plan.name === "Profissional" && (
                                        <Badge variant="default" className="text-[10px] px-1.5 py-0">Popular</Badge>
                                      )}
                                    </div>
                                    <span className="text-[10px] text-muted-foreground">
                                      A partir de {formatKwanza(plan.priceMonthlyKz)}/mês
                                    </span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormDescription className="text-[10px]">
                          Escolha o plano ideal para seu restaurante
                        </FormDescription>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={registerForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormLabel className="text-xs font-medium text-foreground">Senha</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                            <Input
                              type={showRegPassword ? "text" : "password"}
                              placeholder="min 6 caracteres"
                              className="pl-9 pr-9 h-9 text-sm bg-muted/30 border-border/50 focus:border-primary focus:bg-background transition-all"
                              data-testid="input-restaurant-password"
                              {...field}
                            />
                            <button
                              type="button"
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                              onClick={() => setShowRegPassword(!showRegPassword)}
                              data-testid="button-toggle-reg-password"
                            >
                              {showRegPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <div className="flex items-start gap-2 pt-1">
                    <Checkbox 
                      id="terms" 
                      checked={acceptedTerms}
                      onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
                      className="mt-0.5 h-3.5 w-3.5 border-border/50 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      data-testid="checkbox-terms"
                    />
                    <label htmlFor="terms" className="text-xs text-muted-foreground cursor-pointer leading-tight">
                      Eu concordo com os{" "}
                      <span className="text-primary hover:underline cursor-pointer">Termos de Uso</span>
                      {" "}e{" "}
                      <span className="text-primary hover:underline cursor-pointer">Política de Privacidade</span>
                    </label>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-9 text-sm font-medium mt-1"
                    data-testid="button-register-submit"
                    disabled={registerMutation.isPending}
                  >
                    {registerMutation.isPending ? (
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                        Cadastrando...
                      </div>
                    ) : (
                      "Criar Conta"
                    )}
                  </Button>

                  <p className="text-center text-xs text-muted-foreground">
                    Já tem uma conta?{" "}
                    <button
                      type="button"
                      className="text-primary font-medium hover:underline"
                      onClick={() => setIsLoginMode(true)}
                      data-testid="link-login"
                    >
                      Entrar
                    </button>
                  </p>
                </form>
              </Form>
            )}
          </div>

          {/* Footer */}
          <div className="pt-6 text-center lg:text-left">
            <p className="text-xs text-muted-foreground">
              2024 Na Bancada. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Hero/Preview */}
      <div className="hidden lg:flex w-1/2 bg-primary relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-10 xl:px-14 py-8 w-full">
          <div className="mb-8">
            <h2 className="text-2xl xl:text-3xl font-bold text-primary-foreground mb-3 leading-tight">
              A forma mais simples de<br />gerir seu restaurante
            </h2>
            <p className="text-primary-foreground/80 text-sm">
              Entre com suas credenciais para acessar sua conta
            </p>
          </div>

          {/* Dashboard Preview Card */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
              </div>
              <div className="text-[10px] text-primary-foreground/60 bg-white/10 px-2 py-0.5 rounded-full">
                Dashboard
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-white/10 rounded-lg p-3">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <TrendingUp className="h-3 w-3 text-green-400" />
                  <span className="text-[10px] text-primary-foreground/70">Vendas</span>
                </div>
                <p className="text-lg font-bold text-primary-foreground">12.4h</p>
                <span className="text-[10px] text-green-400">+22% vs ontem</span>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Users className="h-3 w-3 text-blue-400" />
                  <span className="text-[10px] text-primary-foreground/70">Clientes</span>
                </div>
                <p className="text-lg font-bold text-primary-foreground">8.5h</p>
                <span className="text-[10px] text-blue-400">+15% vs semana</span>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <BarChart3 className="h-3 w-3 text-purple-400" />
                  <span className="text-[10px] text-primary-foreground/70">Pedidos</span>
                </div>
                <p className="text-lg font-bold text-primary-foreground">156</p>
                <span className="text-[10px] text-purple-400">+8% hoje</span>
              </div>
            </div>

            {/* Team Utilization */}
            <div className="bg-white/10 rounded-lg p-3">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-primary-foreground">Desempenho da Equipe</span>
                <ChevronRight className="h-3 w-3 text-primary-foreground/50" />
              </div>
              <div className="space-y-2">
                {[
                  { name: "Marketing", value: 89, color: "bg-pink-400" },
                  { name: "Vendas", value: 76, color: "bg-blue-400" },
                  { name: "Suporte", value: 92, color: "bg-green-400" },
                ].map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <span className="text-[10px] text-primary-foreground/70 w-14">{item.name}</span>
                    <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${item.color} rounded-full transition-all`} 
                        style={{ width: `${item.value}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-primary-foreground/70 w-8 text-right">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="mt-8 flex items-center gap-6 opacity-60">
            <div className="flex items-center gap-1.5 text-primary-foreground/70">
              <Check className="h-3 w-3" />
              <span className="text-xs">Dados seguros</span>
            </div>
            <div className="flex items-center gap-1.5 text-primary-foreground/70">
              <Check className="h-3 w-3" />
              <span className="text-xs">Suporte 24/7</span>
            </div>
            <div className="flex items-center gap-1.5 text-primary-foreground/70">
              <Check className="h-3 w-3" />
              <span className="text-xs">Fácil de usar</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
