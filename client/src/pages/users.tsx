import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useInfiniteQuery } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useInView } from "react-intersection-observer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Trash2, UserPlus, Pencil, Key, Eye, EyeOff, Search, ChevronLeft, ChevronRight, X, Users as UsersIcon, UserCheck, UserX, TrendingUp, Activity, Calendar, Filter, Download, Mail, Phone, Shield, Crown, Briefcase, ChefHat } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { AdvancedKpiCard } from "@/components/advanced-kpi-card";
import { AdvancedFilters, FilterOption } from "@/components/advanced-filters";
import { ShimmerSkeleton } from "@/components/shimmer-skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { ROLE_PERMISSIONS, UserRole, insertUserSchema, updateUserSchema, adminResetPasswordSchema } from "@shared/schema";

type User = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
};

type PaginatedUsersResponse = {
  users: User[];
  pagination: {
    total: number;
    page: number;
    totalPages: number;
    limit: number;
  };
};

const createUserFormSchema = insertUserSchema
  .pick({ email: true, password: true, firstName: true, lastName: true, role: true })
  .extend({
    email: z.string().email("Email inválido"),
    password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    role: z.enum(['admin', 'manager', 'cashier', 'waiter', 'kitchen'] as const),
  });

const editUserFormSchema = updateUserSchema
  .pick({ email: true, firstName: true, lastName: true, role: true })
  .extend({
    email: z.string().email("Email inválido"),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    role: z.enum(['admin', 'manager', 'cashier', 'waiter', 'kitchen'] as const).optional(),
  });

const passwordFormSchema = adminResetPasswordSchema.extend({
  confirmPassword: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

type CreateUserFormData = z.infer<typeof createUserFormSchema>;
type EditUserFormData = z.infer<typeof editUserFormSchema>;
type PasswordFormData = z.infer<typeof passwordFormSchema>;

export default function Users() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  
  // Pagination and filter state
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const limit = 20;

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1); // Reset to first page on search
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset page when role filter changes
  useEffect(() => {
    setPage(1);
  }, [roleFilter]);

  // Create user form
  const createForm = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserFormSchema),
    defaultValues: {
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      role: "waiter",
    },
  });

  // Edit user form
  const editForm = useForm<EditUserFormData>({
    resolver: zodResolver(editUserFormSchema),
    defaultValues: {
      email: "",
      firstName: "",
      lastName: "",
      role: "waiter",
    },
  });

  // Password form
  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Build query params
  const queryParams = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (debouncedSearch) queryParams.set("search", debouncedSearch);
  if (roleFilter && roleFilter !== "all") queryParams.set("role", roleFilter);

  const { data, isLoading } = useQuery<PaginatedUsersResponse>({
    queryKey: ['/api/users', page, debouncedSearch, roleFilter],
    queryFn: async () => {
      const res = await fetch(`/api/users?${queryParams.toString()}`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch users');
      return res.json();
    },
  });

  const users = data?.users || [];
  const pagination = data?.pagination;

  const createUserMutation = useMutation({
    mutationFn: async (formData: CreateUserFormData) => {
      return await apiRequest('POST', '/api/users', formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      setIsDialogOpen(false);
      createForm.reset();
      toast({
        title: "Sucesso",
        description: "Usuário criado com sucesso",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar usuário",
        variant: "destructive",
      });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ userId, data }: { userId: string; data: EditUserFormData }) => {
      return await apiRequest('PATCH', `/api/users/${userId}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      setIsEditDialogOpen(false);
      setSelectedUser(null);
      toast({
        title: "Sucesso",
        description: "Usuário atualizado com sucesso",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar usuário",
        variant: "destructive",
      });
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async ({ userId, newPassword }: { userId: string; newPassword: string }) => {
      return await apiRequest('PATCH', `/api/users/${userId}/reset-password`, { newPassword });
    },
    onSuccess: () => {
      setIsPasswordDialogOpen(false);
      setSelectedUser(null);
      passwordForm.reset();
      toast({
        title: "Sucesso",
        description: "Senha alterada com sucesso",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao alterar senha",
        variant: "destructive",
      });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      return await apiRequest('DELETE', `/api/users/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      toast({
        title: "Sucesso",
        description: "Usuário deletado com sucesso",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao deletar usuário",
        variant: "destructive",
      });
    },
  });

  const onCreateSubmit = (formData: CreateUserFormData) => {
    createUserMutation.mutate(formData);
  };

  const onEditSubmit = (formData: EditUserFormData) => {
    if (selectedUser) {
      updateUserMutation.mutate({ userId: selectedUser.id, data: formData });
    }
  };

  const onPasswordSubmit = (formData: PasswordFormData) => {
    if (selectedUser) {
      resetPasswordMutation.mutate({ userId: selectedUser.id, newPassword: formData.newPassword });
    }
  };

  const openEditDialog = (user: User) => {
    setSelectedUser(user);
    editForm.reset({
      email: user.email,
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      role: user.role === 'superadmin' ? 'admin' : user.role,
    });
    setIsEditDialogOpen(true);
  };

  const openPasswordDialog = (user: User) => {
    setSelectedUser(user);
    passwordForm.reset({ newPassword: "", confirmPassword: "" });
    setIsPasswordDialogOpen(true);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setDebouncedSearch("");
  };

  // Calculate KPIs
  const totalUsers = pagination?.total || 0;
  const usersByRole = users.reduce((acc, user) => {
    acc[user.role] = (acc[user.role] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'admin': return Shield;
      case 'manager': return Crown;
      case 'cashier': return Briefcase;
      case 'waiter': return Users;
      case 'kitchen': return ChefHat;
      default: return Users;
    }
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'admin': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'manager': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'cashier': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'waiter': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'kitchen': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  const getRoleName = (role: UserRole) => {
    const names: Record<UserRole, string> = {
      admin: 'Administrador',
      manager: 'Gerente',
      cashier: 'Caixa',
      waiter: 'Garçom',
      kitchen: 'Cozinha',
      superadmin: 'Super Admin'
    };
    return names[role] || role;
  };

  const getUserInitials = (user: User) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user.firstName) return user.firstName.substring(0, 2).toUpperCase();
    return user.email.substring(0, 2).toUpperCase();
  };

  const getUserFullName = (user: User) => {
    if (user.firstName || user.lastName) {
      return `${user.firstName || ''} ${user.lastName || ''}`.trim();
    }
    return user.email;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 pb-safe">
      <div className="space-y-4 sm:space-y-6 p-3 sm:p-6 lg:p-8 pb-20 sm:pb-8">
        {/* Header */}
        <motion.div
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 sticky top-0 z-10 bg-gradient-to-br from-background via-background to-muted/20 py-2 sm:py-0 -mx-3 px-3 sm:mx-0 sm:px-0 backdrop-blur-sm sm:backdrop-blur-none"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight bg-gradient-to-r from-primary via-purple-600 to-pink-600 bg-clip-text text-transparent truncate" data-testid="text-page-title">
              Gestão de Usuários
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 sm:mt-2 line-clamp-1">
              Gerencie a equipe e controle acessos ao sistema
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) createForm.reset();
          }}>
            <DialogTrigger asChild>
              <Button 
                size="default" 
                className="gap-2 shadow-lg hover:shadow-xl transition-all w-full sm:w-auto shrink-0" 
                data-testid="button-add-user"
              >
                <UserPlus className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="sm:inline">Novo</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]" data-testid="dialog-create-user">
              <DialogHeader>
                <DialogTitle className="text-2xl">Criar Novo Usuário</DialogTitle>
                <DialogDescription>
                  Preencha os dados para criar um novo utilizador no sistema
                </DialogDescription>
              </DialogHeader>
              <Form {...createForm}>
                <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
                  <FormField
                    control={createForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="email@exemplo.com"
                            data-testid="input-user-email"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Senha</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="Mínimo 6 caracteres"
                              data-testid="input-user-password"
                              {...field}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                              onClick={() => setShowPassword(!showPassword)}
                              data-testid="button-toggle-password"
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createForm.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Nome"
                            data-testid="input-user-firstname"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createForm.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sobrenome</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Sobrenome"
                            data-testid="input-user-lastname"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createForm.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Acesso</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-user-role">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(ROLE_PERMISSIONS)
                              .filter(([key]) => key !== 'superadmin')
                              .map(([key, value]) => (
                                <SelectItem key={key} value={key}>
                                  {value.label}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          {ROLE_PERMISSIONS[field.value]?.description}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                      data-testid="button-cancel"
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      disabled={createUserMutation.isPending}
                      data-testid="button-submit-user"
                    >
                      {createUserMutation.isPending ? "Criando..." : "Criar Usuário"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </motion.div>

        {/* KPIs Dashboard */}
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <AdvancedKpiCard
            title="Total"
            value={totalUsers}
            icon={Users}
            trend={0}
            iconColor="bg-blue-500/10 text-blue-600"
            className="touch-manipulation"
          />
          <AdvancedKpiCard
            title="Admins"
            value={usersByRole['admin'] || 0}
            icon={Shield}
            iconColor="bg-red-500/10 text-red-600"
            className="touch-manipulation"
          />
          <AdvancedKpiCard
            title="Gerentes"
            value={usersByRole['manager'] || 0}
            icon={Crown}
            iconColor="bg-purple-500/10 text-purple-600"
            className="touch-manipulation"
          />
          <AdvancedKpiCard
            title="Equipe"
            value={(usersByRole['waiter'] || 0) + (usersByRole['cashier'] || 0) + (usersByRole['kitchen'] || 0)}
            icon={Briefcase}
            iconColor="bg-green-500/10 text-green-600"
            className="touch-manipulation"
          />
        </motion.div>

        {/* Search and Filter Bar */}
        <motion.div
          className="flex flex-col sm:flex-row gap-2 sm:gap-3"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Pesquisar usuários..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10 h-10 sm:h-11 touch-manipulation"
              data-testid="input-search-users"
              inputMode="search"
            />
            {searchQuery && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent touch-manipulation active:scale-95"
                onClick={clearSearch}
                data-testid="button-clear-search"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-full sm:w-48 h-10 sm:h-11 touch-manipulation" data-testid="select-role-filter">
              <SelectValue placeholder="Filtrar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {Object.entries(ROLE_PERMISSIONS)
                .filter(([key]) => key !== 'superadmin')
                .map(([key, value]) => (
                  <SelectItem key={key} value={key}>
                    {value.label}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </motion.div>

        {/* Results count */}
        {pagination && (
          <motion.div 
            className="text-sm text-muted-foreground flex items-center gap-2" 
            data-testid="text-results-count"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Activity className="h-4 w-4" />
            {pagination.total === 0 
              ? "Nenhum usuário encontrado" 
              : `Mostrando ${users.length} de ${pagination.total} usuário${pagination.total !== 1 ? 's' : ''}`}
          </motion.div>
        )}

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <ShimmerSkeleton key={i} className="h-48" />
            ))}
          </div>
        ) : users.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-dashed">
              <CardContent className="py-16">
                <div className="text-center space-y-3" data-testid="text-no-users">
                  <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                    <UsersIcon className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold text-lg">
                    {debouncedSearch || roleFilter !== "all" 
                      ? "Nenhum usuário encontrado"
                      : "Nenhum usuário cadastrado"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {debouncedSearch || roleFilter !== "all" 
                      ? "Tente ajustar os filtros de busca"
                      : "Comece adicionando o primeiro usuário ao sistema"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div 
              className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {users.map((user, index) => {
                const RoleIcon = getRoleIcon(user.role);
                return (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card 
                      className="group active:scale-[0.98] sm:hover:shadow-lg transition-all duration-300 sm:hover:scale-[1.02] overflow-hidden border-l-4 touch-manipulation"
                      style={{ borderLeftColor: `hsl(var(--${user.role === 'admin' ? 'destructive' : user.role === 'manager' ? 'purple-500' : user.role === 'cashier' ? 'blue-500' : 'green-500'}))` }}
                      data-testid={`card-user-${user.id}`}
                    >
                      <CardContent className="p-4 sm:p-6">
                        <div className="flex items-start gap-3 sm:gap-4">
                          {/* Avatar */}
                          <Avatar className="h-12 w-12 sm:h-16 sm:w-16 border-2 border-border shrink-0">
                            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${getUserInitials(user)}`} />
                            <AvatarFallback className="text-base sm:text-lg font-semibold">
                              {getUserInitials(user)}
                            </AvatarFallback>
                          </Avatar>

                          {/* User Info */}
                          <div className="flex-1 min-w-0 space-y-2 sm:space-y-3">
                            <div>
                              <h3 className="font-semibold text-base sm:text-lg truncate">
                                {getUserFullName(user)}
                              </h3>
                              <p className="text-xs sm:text-sm text-muted-foreground truncate flex items-center gap-1 mt-0.5" data-testid={`text-email-${user.id}`}>
                                <Mail className="h-3 w-3 shrink-0" />
                                {user.email}
                              </p>
                            </div>

                            {/* Role Badge */}
                            <Badge 
                              className={`${getRoleColor(user.role)} border flex items-center gap-1 w-fit text-xs`}
                              data-testid={`badge-role-${user.id}`}
                            >
                              <RoleIcon className="h-3 w-3" />
                              {getRoleName(user.role)}
                            </Badge>

                            {/* Metadata - Hidden on mobile */}
                            <div className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              Criado em {new Date(user.createdAt).toLocaleDateString('pt-AO')}
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <Separator className="my-3 sm:my-4" />
                        <div className="flex items-center justify-end gap-1 sm:gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(user)}
                            className="gap-1 sm:gap-2 h-8 sm:h-9 text-xs sm:text-sm touch-manipulation active:scale-95"
                            title="Editar usuário"
                            data-testid={`button-edit-${user.id}`}
                          >
                            <Pencil className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span className="hidden xs:inline">Editar</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openPasswordDialog(user)}
                            className="gap-1 sm:gap-2 h-8 sm:h-9 text-xs sm:text-sm touch-manipulation active:scale-95"
                            title="Alterar senha"
                            data-testid={`button-password-${user.id}`}
                          >
                            <Key className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span className="hidden xs:inline">Senha</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (window.confirm('Tem certeza que deseja deletar este usuário?')) {
                                deleteUserMutation.mutate(user.id);
                              }
                            }}
                            disabled={deleteUserMutation.isPending}
                            className="gap-1 sm:gap-2 h-8 sm:h-9 text-xs sm:text-sm text-destructive hover:text-destructive touch-manipulation active:scale-95"
                            title="Deletar usuário"
                            data-testid={`button-delete-${user.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1}
              data-testid="button-prev-page"
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>
            <span className="text-sm text-muted-foreground px-4" data-testid="text-page-info">
              Página {pagination.page} de {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
              disabled={page >= pagination.totalPages}
              data-testid="button-next-page"
            >
              Próxima
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
          setIsEditDialogOpen(open);
          if (!open) {
            editForm.reset();
            setSelectedUser(null);
          }
        }}>
          <DialogContent data-testid="dialog-edit-user">
            <DialogHeader>
              <DialogTitle>Editar Usuário</DialogTitle>
              <DialogDescription>
                Atualize as informações do usuário
              </DialogDescription>
            </DialogHeader>
            <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
                <FormField
                  control={editForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="email@exemplo.com"
                          data-testid="input-edit-email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Nome"
                          data-testid="input-edit-firstname"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sobrenome</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Sobrenome"
                          data-testid="input-edit-lastname"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Acesso</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-edit-role">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(ROLE_PERMISSIONS)
                            .filter(([key]) => key !== 'superadmin')
                            .map(([key, value]) => (
                              <SelectItem key={key} value={key}>
                                {value.label}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        {field.value && ROLE_PERMISSIONS[field.value]?.description}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditDialogOpen(false)}
                    data-testid="button-cancel-edit"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={updateUserMutation.isPending}
                    data-testid="button-submit-edit"
                  >
                    {updateUserMutation.isPending ? "Salvando..." : "Salvar Alterações"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Password Dialog */}
        <Dialog open={isPasswordDialogOpen} onOpenChange={(open) => {
          setIsPasswordDialogOpen(open);
          if (!open) {
            passwordForm.reset();
            setSelectedUser(null);
          }
        }}>
          <DialogContent data-testid="dialog-reset-password">
            <DialogHeader>
              <DialogTitle>Alterar Senha</DialogTitle>
              <DialogDescription>
                Defina uma nova senha para {selectedUser?.firstName || selectedUser?.email}
              </DialogDescription>
            </DialogHeader>
            <Form {...passwordForm}>
              <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                <FormField
                  control={passwordForm.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nova Senha</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showNewPassword ? "text" : "password"}
                            placeholder="Mínimo 6 caracteres"
                            data-testid="input-new-password"
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            data-testid="button-toggle-new-password"
                          >
                            {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={passwordForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirmar Senha</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Confirme a nova senha"
                          data-testid="input-confirm-password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsPasswordDialogOpen(false)}
                    data-testid="button-cancel-password"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={resetPasswordMutation.isPending}
                    data-testid="button-submit-password"
                  >
                    {resetPasswordMutation.isPending ? "Alterando..." : "Alterar Senha"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
