import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Store, CheckCircle2, Clock, Ban, DollarSign } from "lucide-react";
import { formatKwanza } from "@/lib/formatters";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Restaurant } from "@shared/schema";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useState } from "react";

interface SuperAdminStats {
  totalRestaurants: number;
  activeRestaurants: number;
  pendingRestaurants: number;
  suspendedRestaurants: number;
  totalRevenue: string;
}

export default function SuperAdmin() {
  const { toast } = useToast();
  const [selectedRestaurant, setSelectedRestaurant] = useState<string | null>(null);

  const { data: stats, isLoading: statsLoading } = useQuery<SuperAdminStats>({
    queryKey: ["/api/superadmin/stats"],
  });

  const { data: restaurants, isLoading: restaurantsLoading } = useQuery<Restaurant[]>({
    queryKey: ["/api/superadmin/restaurants"],
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'pendente' | 'ativo' | 'suspenso' }) => {
      const response = await apiRequest("PATCH", `/api/superadmin/restaurants/${id}/status`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/superadmin/restaurants"] });
      queryClient.invalidateQueries({ queryKey: ["/api/superadmin/stats"] });
      toast({
        title: "Status atualizado",
        description: "O status do restaurante foi atualizado com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar status",
        description: error.message || "Erro ao atualizar status do restaurante",
        variant: "destructive",
      });
    },
  });

  const deleteRestaurantMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/superadmin/restaurants/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/superadmin/restaurants"] });
      queryClient.invalidateQueries({ queryKey: ["/api/superadmin/stats"] });
      setSelectedRestaurant(null);
      toast({
        title: "Restaurante excluído",
        description: "O restaurante foi excluído com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao excluir restaurante",
        description: error.message || "Erro ao excluir restaurante",
        variant: "destructive",
      });
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ativo':
        return <Badge variant="default" className="bg-green-500 hover:bg-green-600" data-testid={`badge-status-${status}`}>Ativo</Badge>;
      case 'pendente':
        return <Badge variant="secondary" data-testid={`badge-status-${status}`}>Pendente</Badge>;
      case 'suspenso':
        return <Badge variant="destructive" data-testid={`badge-status-${status}`}>Suspenso</Badge>;
      default:
        return <Badge data-testid={`badge-status-${status}`}>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-foreground">Super Administrador</h1>
        <p className="text-muted-foreground mt-2">
          Gestão e controle geral da plataforma NaBancada
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Restaurantes
            </CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-3xl font-bold" data-testid="text-total-restaurants">
                  {stats?.totalRestaurants || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Cadastrados
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Ativos
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-3xl font-bold text-green-500" data-testid="text-active-restaurants">
                  {stats?.activeRestaurants || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Aprovados
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pendentes
            </CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-3xl font-bold text-yellow-500" data-testid="text-pending-restaurants">
                  {stats?.pendingRestaurants || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Aguardando aprovação
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Suspensos
            </CardTitle>
            <Ban className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-3xl font-bold text-red-500" data-testid="text-suspended-restaurants">
                  {stats?.suspendedRestaurants || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Bloqueados
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Receita Total
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-3xl font-bold" data-testid="text-total-revenue">
                  {formatKwanza(stats?.totalRevenue || "0")}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Todos os restaurantes
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Restaurantes Cadastrados</CardTitle>
        </CardHeader>
        <CardContent>
          {restaurantsLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-4 border rounded-md">
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-1/3" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                  <Skeleton className="h-10 w-24" />
                </div>
              ))}
            </div>
          ) : restaurants && restaurants.length > 0 ? (
            <div className="space-y-4">
              {restaurants.map((restaurant) => (
                <div
                  key={restaurant.id}
                  className="flex flex-col md:flex-row md:items-center gap-4 p-4 border rounded-md"
                  data-testid={`restaurant-${restaurant.id}`}
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg" data-testid={`text-restaurant-name-${restaurant.id}`}>
                        {restaurant.name}
                      </h3>
                      {getStatusBadge(restaurant.status)}
                    </div>
                    <p className="text-sm text-muted-foreground" data-testid={`text-restaurant-email-${restaurant.id}`}>
                      {restaurant.email}
                    </p>
                    {restaurant.phone && (
                      <p className="text-sm text-muted-foreground" data-testid={`text-restaurant-phone-${restaurant.id}`}>
                        Tel: {restaurant.phone}
                      </p>
                    )}
                    {restaurant.address && (
                      <p className="text-sm text-muted-foreground" data-testid={`text-restaurant-address-${restaurant.id}`}>
                        {restaurant.address}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Cadastrado em: {new Date(restaurant.createdAt!).toLocaleDateString('pt-BR')}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {restaurant.status === 'pendente' && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => updateStatusMutation.mutate({ id: restaurant.id, status: 'ativo' })}
                        disabled={updateStatusMutation.isPending}
                        data-testid={`button-approve-${restaurant.id}`}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        Aprovar
                      </Button>
                    )}
                    
                    {restaurant.status === 'ativo' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateStatusMutation.mutate({ id: restaurant.id, status: 'suspenso' })}
                        disabled={updateStatusMutation.isPending}
                        data-testid={`button-suspend-${restaurant.id}`}
                      >
                        <Ban className="h-4 w-4 mr-1" />
                        Suspender
                      </Button>
                    )}
                    
                    {restaurant.status === 'suspenso' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateStatusMutation.mutate({ id: restaurant.id, status: 'ativo' })}
                        disabled={updateStatusMutation.isPending}
                        data-testid={`button-activate-${restaurant.id}`}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        Reativar
                      </Button>
                    )}

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setSelectedRestaurant(restaurant.id)}
                          data-testid={`button-delete-${restaurant.id}`}
                        >
                          Excluir
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja excluir o restaurante "{restaurant.name}"? 
                            Esta ação não pode ser desfeita e todos os dados do restaurante serão permanentemente removidos.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel data-testid="button-cancel-delete">Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteRestaurantMutation.mutate(restaurant.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            data-testid="button-confirm-delete"
                          >
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              Nenhum restaurante cadastrado
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
