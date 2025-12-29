import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { UserPlus } from 'lucide-react';

interface ConvertGuestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  guestId: string;
  tableId: string;
}

export function ConvertGuestDialog({ open, onOpenChange, guestId, tableId }: ConvertGuestDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  const convertMutation = useMutation({
    mutationFn: async () => {
      // 1. Create customer
      const customerResponse = await apiRequest('POST', '/api/customers', {
        name,
        phone: phone || undefined,
        email: email || undefined,
      });
      const customer = await customerResponse.json();
      
      // 2. Update guest with customer ID
      const guestResponse = await apiRequest('PATCH', `/api/tables/${tableId}/guests/${guestId}`, {
        customerId: customer.id,
        name: customer.name,
      });
      return guestResponse.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/tables/${tableId}/guests`] });
      queryClient.invalidateQueries({ queryKey: ['/api/customers'] });
      toast({
        title: 'Convidado convertido',
        description: 'O convidado foi convertido em cliente e agora pode acumular pontos.',
      });
      onOpenChange(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível converter o convidado.',
        variant: 'destructive',
      });
    },
  });

  const resetForm = () => {
    setName('');
    setPhone('');
    setEmail('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast({
        title: 'Nome obrigatório',
        description: 'Por favor, informe o nome do cliente.',
        variant: 'destructive',
      });
      return;
    }
    convertMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Converter em Cliente
          </DialogTitle>
          <DialogDescription>
            Cadastre o convidado como cliente para que ele possa acumular pontos de fidelidade.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome *</Label>
            <Input
              id="name"
              type="text"
              placeholder="Nome completo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Telefone</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+244 9XX XXX XXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="exemplo@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={convertMutation.isPending}
              className="flex-1"
            >
              {convertMutation.isPending ? 'Convertendo...' : 'Converter em Cliente'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
