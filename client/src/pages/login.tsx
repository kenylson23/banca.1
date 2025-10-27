import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, EyeOff, ArrowLeft, Mail, Lock, Building2, Phone, MapPin, Sparkles, Check } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, insertRestaurantSchema, type LoginUser, type InsertRestaurant } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useLocation } from "wouter";

export default function Login() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);

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
    },
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
      toast({
        title: "Cadastro enviado!",
        description: "Seu cadastro foi enviado e está aguardando aprovação do administrador.",
      });
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
    registerMutation.mutate(data);
  };

  return (
    <div className="min-h-screen relative overflow-hidden safe-area-inset-top safe-area-inset-bottom">
      {/* Background gradient decorative elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-20"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl opacity-20"></div>
      
      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 min-h-screen flex flex-col">
        <div className="mb-4 sm:mb-6">
          <Button
            variant="ghost"
            onClick={() => setLocation("/")}
            data-testid="button-back-home"
            className="gap-2 hover-elevate min-h-10 group"
          >
            <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
            <span className="text-sm sm:text-base">Voltar</span>
          </Button>
        </div>

        <div className="flex-1 flex items-center justify-center py-6">
          <div className="w-full max-w-md">
            {/* Logo and title section */}
            <div className="text-center mb-8 sm:mb-10">
              <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 mb-4 sm:mb-6 shadow-lg shadow-orange-500/20">
                <Sparkles className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent mb-3">
                Na Bancada
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Gestão moderna para o seu restaurante
              </p>
            </div>

            <Card className="border-border/50 shadow-2xl backdrop-blur-sm bg-card/95">
              <CardHeader className="space-y-1 pb-6 px-6 sm:px-8 pt-8">
                <CardTitle className="text-2xl sm:text-2xl font-bold text-center">
                  Bem-vindo de volta
                </CardTitle>
                <CardDescription className="text-center text-sm">
                  Escolha uma opção para continuar
                </CardDescription>
              </CardHeader>
              <CardContent className="px-6 sm:px-8 pb-8">
                <Tabs defaultValue="login" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-8 h-11 bg-muted/50">
                    <TabsTrigger 
                      value="login" 
                      data-testid="tab-login" 
                      className="text-sm sm:text-base font-medium data-[state=active]:shadow-sm"
                    >
                      Entrar
                    </TabsTrigger>
                    <TabsTrigger 
                      value="register" 
                      data-testid="tab-register" 
                      className="text-sm sm:text-base font-medium data-[state=active]:shadow-sm"
                    >
                      Cadastrar
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="login" className="space-y-5 mt-0">
                    <Form {...loginForm}>
                      <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-5">
                        <FormField
                          control={loginForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium">Email</FormLabel>
                              <FormControl>
                                <div className="relative group">
                                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-primary/20 rounded-lg opacity-0 group-focus-within:opacity-100 blur transition-opacity"></div>
                                  <div className="relative flex items-center">
                                    <Mail className="absolute left-3.5 h-5 w-5 text-muted-foreground pointer-events-none transition-colors group-focus-within:text-primary" />
                                    <Input
                                      type="email"
                                      placeholder="seu@email.com"
                                      className="pl-11 h-12 w-full bg-background border-border/50 focus:border-primary/50 transition-all"
                                      data-testid="input-login-email"
                                      {...field}
                                    />
                                  </div>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={loginForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium">Senha</FormLabel>
                              <FormControl>
                                <div className="relative group">
                                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-primary/20 rounded-lg opacity-0 group-focus-within:opacity-100 blur transition-opacity"></div>
                                  <div className="relative flex items-center">
                                    <Lock className="absolute left-3.5 h-5 w-5 text-muted-foreground pointer-events-none transition-colors group-focus-within:text-primary" />
                                    <Input
                                      type={showPassword ? "text" : "password"}
                                      placeholder="••••••••"
                                      className="pl-11 pr-12 h-12 w-full bg-background border-border/50 focus:border-primary/50 transition-all"
                                      data-testid="input-login-password"
                                      {...field}
                                    />
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      className="absolute right-0.5 h-11 w-11 hover:bg-muted/80 rounded-md"
                                      onClick={() => setShowPassword(!showPassword)}
                                      data-testid="button-toggle-password"
                                    >
                                      {showPassword ? (
                                        <EyeOff className="h-5 w-5 text-muted-foreground" />
                                      ) : (
                                        <Eye className="h-5 w-5 text-muted-foreground" />
                                      )}
                                    </Button>
                                  </div>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button
                          type="submit"
                          className="w-full h-12 text-base font-semibold bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/30 transition-all mt-8"
                          data-testid="button-login-submit"
                          disabled={loginMutation.isPending}
                        >
                          {loginMutation.isPending ? (
                            <>
                              <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                              Entrando...
                            </>
                          ) : (
                            "Entrar no Sistema"
                          )}
                        </Button>
                      </form>
                    </Form>
                  </TabsContent>

                  <TabsContent value="register" className="space-y-5 mt-0">
                    <div className="bg-gradient-to-r from-primary/5 to-orange-500/5 rounded-xl p-4 border border-primary/10 mb-6">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                          <Check className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium mb-1">Cadastro com aprovação</p>
                          <p className="text-xs text-muted-foreground">
                            Seu restaurante será revisado e aprovado pelo administrador
                          </p>
                        </div>
                      </div>
                    </div>
                    <Form {...registerForm}>
                      <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
                        <FormField
                          control={registerForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium">Nome do Restaurante</FormLabel>
                              <FormControl>
                                <div className="relative group">
                                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-primary/20 rounded-lg opacity-0 group-focus-within:opacity-100 blur transition-opacity"></div>
                                  <div className="relative flex items-center">
                                    <Building2 className="absolute left-3.5 h-5 w-5 text-muted-foreground pointer-events-none transition-colors group-focus-within:text-primary" />
                                    <Input
                                      type="text"
                                      placeholder="Restaurante ABC"
                                      className="pl-11 h-12 w-full bg-background border-border/50 focus:border-primary/50 transition-all"
                                      data-testid="input-restaurant-name"
                                      {...field}
                                    />
                                  </div>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={registerForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium">Email</FormLabel>
                              <FormControl>
                                <div className="relative group">
                                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-primary/20 rounded-lg opacity-0 group-focus-within:opacity-100 blur transition-opacity"></div>
                                  <div className="relative flex items-center">
                                    <Mail className="absolute left-3.5 h-5 w-5 text-muted-foreground pointer-events-none transition-colors group-focus-within:text-primary" />
                                    <Input
                                      type="email"
                                      placeholder="contato@restaurante.com"
                                      className="pl-11 h-12 w-full bg-background border-border/50 focus:border-primary/50 transition-all"
                                      data-testid="input-restaurant-email"
                                      {...field}
                                    />
                                  </div>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={registerForm.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium">Telefone</FormLabel>
                              <FormControl>
                                <div className="relative group">
                                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-primary/20 rounded-lg opacity-0 group-focus-within:opacity-100 blur transition-opacity"></div>
                                  <div className="relative flex items-center">
                                    <Phone className="absolute left-3.5 h-5 w-5 text-muted-foreground pointer-events-none transition-colors group-focus-within:text-primary" />
                                    <Input
                                      type="tel"
                                      placeholder="+244 923 456 789"
                                      className="pl-11 h-12 w-full bg-background border-border/50 focus:border-primary/50 transition-all"
                                      data-testid="input-restaurant-phone"
                                      {...field}
                                    />
                                  </div>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={registerForm.control}
                          name="address"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium">Endereço Completo</FormLabel>
                              <FormControl>
                                <div className="relative group">
                                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-primary/20 rounded-lg opacity-0 group-focus-within:opacity-100 blur transition-opacity"></div>
                                  <div className="relative">
                                    <MapPin className="absolute left-3.5 top-3.5 h-5 w-5 text-muted-foreground pointer-events-none transition-colors group-focus-within:text-primary" />
                                    <Textarea
                                      placeholder="Rua Comandante Gika, 123 - Maianga - Luanda"
                                      className="pl-11 pt-3.5 min-h-[90px] w-full bg-background border-border/50 focus:border-primary/50 transition-all resize-none"
                                      data-testid="input-restaurant-address"
                                      {...field}
                                    />
                                  </div>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={registerForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium">Senha</FormLabel>
                              <FormControl>
                                <div className="relative group">
                                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-primary/20 rounded-lg opacity-0 group-focus-within:opacity-100 blur transition-opacity"></div>
                                  <div className="relative flex items-center">
                                    <Lock className="absolute left-3.5 h-5 w-5 text-muted-foreground pointer-events-none transition-colors group-focus-within:text-primary" />
                                    <Input
                                      type={showRegPassword ? "text" : "password"}
                                      placeholder="Mínimo 6 caracteres"
                                      className="pl-11 pr-12 h-12 w-full bg-background border-border/50 focus:border-primary/50 transition-all"
                                      data-testid="input-restaurant-password"
                                      {...field}
                                    />
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      className="absolute right-0.5 h-11 w-11 hover:bg-muted/80 rounded-md"
                                      onClick={() => setShowRegPassword(!showRegPassword)}
                                      data-testid="button-toggle-register-password"
                                    >
                                      {showRegPassword ? (
                                        <EyeOff className="h-5 w-5 text-muted-foreground" />
                                      ) : (
                                        <Eye className="h-5 w-5 text-muted-foreground" />
                                      )}
                                    </Button>
                                  </div>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button
                          type="submit"
                          className="w-full h-12 text-base font-semibold bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/30 transition-all mt-6"
                          data-testid="button-restaurant-submit"
                          disabled={registerMutation.isPending}
                        >
                          {registerMutation.isPending ? (
                            <>
                              <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                              Cadastrando...
                            </>
                          ) : (
                            "Cadastrar Restaurante"
                          )}
                        </Button>
                      </form>
                    </Form>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Footer text */}
            <p className="text-center text-xs sm:text-sm text-muted-foreground mt-6 sm:mt-8">
              Sistema protegido e seguro para a gestão do seu restaurante
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
