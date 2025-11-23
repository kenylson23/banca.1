import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { resetRestaurantAdminCredentialsSchema, type ResetRestaurantAdminCredentials } from "@shared/schema";
import { Key, Mail, User, Shield } from "lucide-react";
import type { User as UserType } from "@shared/schema";

interface RestaurantCredentialsDialogProps {
  restaurantId: string | null;
  restaurantName: string;
  isOpen: boolean;
  onClose: () => void;
}

type AdminUser = Omit<UserType, 'password'>;

export function RestaurantCredentialsDialog({ 
  restaurantId, 
  restaurantName,
  isOpen, 
  onClose 
}: RestaurantCredentialsDialogProps) {
  const { toast } = useToast();
  const [selectedAdmin, setSelectedAdmin] = useState<AdminUser | null>(null);

  const { data: admins, isLoading } = useQuery<AdminUser[]>({
    queryKey: ['/api/superadmin/restaurants', restaurantId, 'admins'],
    enabled: !!restaurantId && isOpen,
  });

  const form = useForm<ResetRestaurantAdminCredentials>({
    resolver: zodResolver(resetRestaurantAdminCredentialsSchema),
    defaultValues: {
      email: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (!isOpen) {
      setSelectedAdmin(null);
      form.reset({
        email: "",
        newPassword: "",
        confirmPassword: "",
      });
    }
  }, [isOpen, form]);

  const resetCredentialsMutation = useMutation({
    mutationFn: async (data: ResetRestaurantAdminCredentials) => {
      if (!selectedAdmin || !restaurantId) return;
      const response = await apiRequest(
        "PATCH",
        `/api/superadmin/restaurants/${restaurantId}/admins/${selectedAdmin.id}/credentials`,
        data
      );
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['/api/superadmin/restaurants', restaurantId, 'admins'] 
      });
      toast({
        title: "Credenciais atualizadas",
        description: "As credenciais do administrador foram atualizadas com sucesso.",
      });
      form.reset();
      setSelectedAdmin(null);
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar credenciais",
        description: error.message || "Erro ao atualizar credenciais",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ResetRestaurantAdminCredentials) => {
    resetCredentialsMutation.mutate(data);
  };

  const handleEditAdmin = (admin: AdminUser) => {
    setSelectedAdmin(admin);
    form.reset({
      email: admin.email,
      newPassword: "",
      confirmPassword: "",
    });
  };

  const handleCancelEdit = () => {
    setSelectedAdmin(null);
    form.reset({
      email: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Credenciais de Acesso - {restaurantName}
          </DialogTitle>
          <DialogDescription>
            Gerencie os acessos dos administradores do restaurante
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(2)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        ) : admins && admins.length > 0 ? (
          <div className="space-y-6">
            {/* Lista de Administradores */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground">
                Administradores ({admins.length})
              </h3>
              {admins.map((admin) => (
                <Card key={admin.id} className={selectedAdmin?.id === admin.id ? "border-primary" : ""}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <User className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <CardTitle className="text-base">
                            {admin.firstName && admin.lastName 
                              ? `${admin.firstName} ${admin.lastName}` 
                              : "Nome não informado"}
                          </CardTitle>
                          <CardDescription className="flex items-center gap-2 mt-1">
                            <Mail className="h-3 w-3" />
                            {admin.email}
                          </CardDescription>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditAdmin(admin)}
                        disabled={selectedAdmin?.id === admin.id}
                        data-testid={`button-edit-credentials-${admin.id}`}
                      >
                        <Key className="h-4 w-4 mr-1" />
                        {selectedAdmin?.id === admin.id ? "Editando..." : "Editar Credenciais"}
                      </Button>
                    </div>
                  </CardHeader>
                  {selectedAdmin?.id === admin.id && (
                    <CardContent>
                      <Separator className="mb-4" />
                      <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                          <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email de Acesso</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="email@exemplo.com"
                                    {...field}
                                    data-testid="input-admin-email"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="newPassword"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Nova Senha (opcional)</FormLabel>
                                <FormControl>
                                  <Input
                                    type="password"
                                    placeholder="Deixe em branco para não alterar"
                                    {...field}
                                    data-testid="input-admin-password"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="confirmPassword"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Confirmar Nova Senha</FormLabel>
                                <FormControl>
                                  <Input
                                    type="password"
                                    placeholder="Confirme a nova senha"
                                    {...field}
                                    data-testid="input-admin-password-confirm"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="flex justify-end gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={handleCancelEdit}
                              disabled={resetCredentialsMutation.isPending}
                              data-testid="button-cancel-edit"
                            >
                              Cancelar
                            </Button>
                            <Button
                              type="submit"
                              disabled={resetCredentialsMutation.isPending}
                              data-testid="button-save-credentials"
                            >
                              {resetCredentialsMutation.isPending ? "Salvando..." : "Salvar Alterações"}
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>

            <div className="bg-muted/50 p-4 rounded-md">
              <p className="text-sm text-muted-foreground">
                <strong>Nota:</strong> As alterações de credenciais são aplicadas imediatamente. 
                O administrador precisará usar as novas credenciais no próximo login.
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <User className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">
              Nenhum administrador encontrado para este restaurante
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
