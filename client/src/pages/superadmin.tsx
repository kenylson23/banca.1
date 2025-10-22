import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Store, CheckCircle2, Clock, Ban, DollarSign, Send, MessageSquare } from "lucide-react";
import { formatKwanza } from "@/lib/formatters";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Restaurant, Message } from "@shared/schema";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  const [selectedRestaurantForMessage, setSelectedRestaurantForMessage] = useState<string | null>(null);
  const [messageSubject, setMessageSubject] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false);

  const { data: stats, isLoading: statsLoading } = useQuery<SuperAdminStats>({
    queryKey: ["/api/superadmin/stats"],
  });

  const { data: restaurants, isLoading: restaurantsLoading } = useQuery<Restaurant[]>({
    queryKey: ["/api/superadmin/restaurants"],
  });

  const { data: messages, isLoading: messagesLoading } = useQuery<Array<Message & { restaurant: Restaurant }>>({
    queryKey: ["/api/superadmin/messages"],
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

  const sendMessageMutation = useMutation({
    mutationFn: async ({ restaurantId, subject, content }: { restaurantId: string; subject: string; content: string }) => {
      const response = await apiRequest("POST", "/api/superadmin/messages", { restaurantId, subject, content });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/superadmin/messages"] });
      setMessageSubject('');
      setMessageContent('');
      setSelectedRestaurantForMessage(null);
      setIsMessageDialogOpen(false);
      toast({
        title: "Mensagem enviada",
        description: "A mensagem foi enviada ao restaurante com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao enviar mensagem",
        description: error.message || "Erro ao enviar mensagem",
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = () => {
    if (!selectedRestaurantForMessage) {
      toast({
        title: "Restaurante não selecionado",
        description: "Por favor, selecione um restaurante.",
        variant: "destructive",
      });
      return;
    }

    if (!messageSubject.trim() || !messageContent.trim()) {
      toast({
        title: "Dados incompletos",
        description: "Por favor, preencha o assunto e o conteúdo da mensagem.",
        variant: "destructive",
      });
      return;
    }

    sendMessageMutation.mutate({
      restaurantId: selectedRestaurantForMessage,
      subject: messageSubject.trim(),
      content: messageContent.trim(),
    });
  };

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
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">Super Administrador</h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2">
          Gestão e controle geral da plataforma NaBancada
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
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

      <Card>
        <CardHeader>
          <CardTitle>Contatos dos Restaurantes</CardTitle>
          <CardDescription>Envie mensagens e acompanhe o histórico de comunicação com os restaurantes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Enviar Nova Mensagem</h3>
            <Dialog open={isMessageDialogOpen} onOpenChange={setIsMessageDialogOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-new-message">
                  <Send className="h-4 w-4 mr-2" />
                  Nova Mensagem
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Enviar Mensagem ao Restaurante</DialogTitle>
                  <DialogDescription>
                    Selecione um restaurante e escreva sua mensagem
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <Label htmlFor="restaurant-select">Restaurante *</Label>
                    <select
                      id="restaurant-select"
                      value={selectedRestaurantForMessage || ''}
                      onChange={(e) => setSelectedRestaurantForMessage(e.target.value)}
                      className="w-full mt-1 px-3 py-2 border rounded-md bg-background"
                      data-testid="select-restaurant"
                    >
                      <option value="">Selecione um restaurante</option>
                      {restaurants?.map((restaurant) => (
                        <option key={restaurant.id} value={restaurant.id}>
                          {restaurant.name} - {restaurant.email}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="message-subject">Assunto *</Label>
                    <Input
                      id="message-subject"
                      placeholder="Digite o assunto da mensagem"
                      value={messageSubject}
                      onChange={(e) => setMessageSubject(e.target.value)}
                      data-testid="input-message-subject"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="message-content">Mensagem *</Label>
                    <Textarea
                      id="message-content"
                      placeholder="Digite sua mensagem"
                      value={messageContent}
                      onChange={(e) => setMessageContent(e.target.value)}
                      rows={6}
                      data-testid="textarea-message-content"
                      className="mt-1"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsMessageDialogOpen(false)}
                      data-testid="button-cancel-message"
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={handleSendMessage}
                      disabled={sendMessageMutation.isPending}
                      data-testid="button-send-message"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      {sendMessageMutation.isPending ? 'Enviando...' : 'Enviar'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-semibold mb-4">Histórico de Mensagens</h3>
            {messagesLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="p-4 border rounded-md">
                    <Skeleton className="h-5 w-1/3 mb-2" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                ))}
              </div>
            ) : messages && messages.length > 0 ? (
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-3">
                  {messages.map((message) => (
                    <Card key={message.id} data-testid={`message-${message.id}`}>
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <CardTitle className="text-base" data-testid={`text-message-subject-${message.id}`}>
                              {message.subject}
                            </CardTitle>
                            <CardDescription className="mt-1">
                              <div className="flex flex-col gap-1">
                                <span data-testid={`text-message-restaurant-${message.id}`}>
                                  Para: <strong>{message.restaurant.name}</strong> ({message.restaurant.email})
                                </span>
                                <span className="text-xs">
                                  Enviado por: {message.sentBy} em {new Date(message.createdAt!).toLocaleString('pt-BR')}
                                </span>
                              </div>
                            </CardDescription>
                          </div>
                          <Badge variant={message.isRead ? "default" : "secondary"} data-testid={`badge-message-status-${message.id}`}>
                            {message.isRead ? 'Lida' : 'Não lida'}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap" data-testid={`text-message-content-${message.id}`}>
                          {message.content}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <MessageSquare className="h-12 w-12 mb-3 opacity-50" />
                <p data-testid="text-no-messages">Nenhuma mensagem enviada ainda</p>
                <p className="text-sm">Envie sua primeira mensagem aos restaurantes!</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
