import { useState } from 'react';
import { useParams, useLocation } from 'wouter';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, UserPlus, Users, Loader2 } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

export default function GuestRegister() {
  const { tableId } = useParams<{ tableId: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [guestName, setGuestName] = useState('');
  const [customerCount, setCustomerCount] = useState<number>(1);
  const [isSuccess, setIsSuccess] = useState(false);

  // Query table info
  const { data: table, isLoading: loadingTable } = useQuery({
    queryKey: [`/api/tables/${tableId}`],
    enabled: !!tableId,
  });

  // Mutation to create guest
  const createGuestMutation = useMutation({
    mutationFn: async () => {
      if (!guestName.trim()) {
        throw new Error('Por favor, digite seu nome');
      }
      const response = await apiRequest('POST', `/api/tables/${tableId}/guests`, {
        name: guestName.trim(),
        customerCount: Number(customerCount) || 1,
      });
      return response.json();
    },
    onSuccess: () => {
      setIsSuccess(true);
      toast({
        title: '✅ Cadastro realizado!',
        description: 'Você foi adicionado à mesa com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao cadastrar',
        description: error.message || 'Não foi possível completar o cadastro.',
        variant: 'destructive',
      });
    },
  });

  if (loadingTable) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!table) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-destructive/5 to-destructive/10 p-4">
        <Card className="w-full max-w-md border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Mesa não encontrada</CardTitle>
            <CardDescription>
              A mesa que você está tentando acessar não existe ou não está disponível.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 p-4">
        <Card className="w-full max-w-md border-green-500">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-2xl text-green-700 dark:text-green-300">
              Bem-vindo à Mesa {table.number}!
            </CardTitle>
            <CardDescription className="text-base">
              Você foi cadastrado com sucesso como <span className="font-semibold">{guestName}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-green-50 dark:bg-green-950 rounded-lg p-4 border border-green-200 dark:border-green-800">
              <p className="text-sm text-green-800 dark:text-green-200 text-center">
                🎉 Aproveite sua refeição!
              </p>
              <p className="text-xs text-green-700 dark:text-green-300 text-center mt-2">
                Seu garçom já foi notificado.
              </p>
            </div>

            <Separator />

            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Agora você pode:
              </p>
              <ul className="text-sm space-y-1 text-left max-w-xs mx-auto">
                <li>• Ver o cardápio digital</li>
                <li>• Fazer pedidos pelo celular</li>
                <li>• Dividir a conta no final</li>
              </ul>
            </div>

            <Button
              className="w-full"
              size="lg"
              onClick={() => setLocation(`/public-menu/${table.restaurantId}`)}
            >
              📱 Ver Cardápio
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <UserPlus className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-2xl">Cadastro na Mesa {table.number}</CardTitle>
          <CardDescription>
            Registre-se para aproveitar todas as funcionalidades
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Table Info */}
          <div className="bg-muted rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Mesa:</span>
              <span className="font-semibold">#{table.number}</span>
            </div>
            {table.customerName && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Responsável:</span>
                <span className="font-semibold">{table.customerName}</span>
              </div>
            )}
            {table.customerCount && table.customerCount > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Pessoas:</span>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span className="font-semibold">{table.customerCount}</span>
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Registration Form */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="guestName" className="text-base font-semibold">
                Seu Nome
              </Label>
              <Input
                id="guestName"
                placeholder="Ex: Maria Silva"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                className="h-12 text-base"
                autoFocus
                disabled={createGuestMutation.isPending}
              />
              <p className="text-xs text-muted-foreground">
                Seu nome ajudará na divisão da conta e nos pedidos
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="customerCount" className="text-base font-semibold flex items-center justify-between">
                <span>Quantas pessoas estão na mesa?</span>
                <span className="text-xs font-normal text-muted-foreground">(Acompanhantes)</span>
              </Label>
              <div className="grid grid-cols-5 gap-2">
                {[1, 2, 3, 4, 5].map((num) => (
                  <Button
                    key={num}
                    type="button"
                    variant={customerCount === num ? 'default' : 'outline'}
                    className="h-11 text-base font-bold"
                    onClick={() => setCustomerCount(num)}
                    disabled={createGuestMutation.isPending}
                  >
                    {num}{num === 5 ? '+' : ''}
                  </Button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Ajuda o restaurante a calcular a ocupação e sugerir a divisão da conta
              </p>
            </div>

            <Button
              className="w-full h-12 text-base"
              size="lg"
              onClick={() => createGuestMutation.mutate()}
              disabled={!guestName.trim() || createGuestMutation.isPending}
            >
              {createGuestMutation.isPending ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Cadastrando...
                </>
              ) : (
                <>
                  <UserPlus className="h-5 w-5 mr-2" />
                  Confirmar Cadastro
                </>
              )}
            </Button>
          </div>

          {/* Benefits */}
          <div className="bg-primary/5 rounded-lg p-4 border border-primary/10">
            <p className="text-xs font-semibold text-primary mb-2">
              ✨ Benefícios de se cadastrar:
            </p>
            <ul className="text-xs space-y-1 text-muted-foreground">
              <li>• Faça pedidos direto do seu celular</li>
              <li>• Acompanhe seus itens individualmente</li>
              <li>• Facilite a divisão da conta no final</li>
              <li>• Receba notificações sobre seus pedidos</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
