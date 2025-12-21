import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  User, Phone, UserPlus, Gift, Award, Tag, Receipt, 
  Settings, LogOut, ChevronRight, X, Mail, MapPin, Calendar
} from 'lucide-react';
import { formatKwanza } from '@/lib/formatters';

interface ProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isAuthenticated: boolean;
  customer?: {
    id: string;
    name: string;
    phone: string;
    email?: string;
    loyaltyPoints: number;
    tier: string;
    totalSpent: string;
    visitCount: number;
    createdAt?: string;
  };
  onLogout: () => void;
  onOpenLogin: () => void;
  onOpenRegister: () => void;
  onOpenHistory: () => void;
  orderCount?: number;
}

export function ProfileDialog({
  open,
  onOpenChange,
  isAuthenticated,
  customer,
  onLogout,
  onOpenLogin,
  onOpenRegister,
  onOpenHistory,
  orderCount = 0
}: ProfileDialogProps) {
  
  // Usuário autenticado - Mostrar perfil completo
  if (isAuthenticated && customer) {
    const getTierColor = (tier: string) => {
      switch (tier.toLowerCase()) {
        case 'bronze': return 'bg-orange-500/10 text-orange-700 border-orange-500/20';
        case 'prata': return 'bg-gray-500/10 text-gray-700 border-gray-500/20';
        case 'ouro': return 'bg-amber-500/10 text-amber-700 border-amber-500/20';
        case 'platinum': return 'bg-purple-500/10 text-purple-700 border-purple-500/20';
        default: return 'bg-gray-500/10 text-gray-700 border-gray-500/20';
      }
    };

    const getTierIcon = (tier: string) => {
      switch (tier.toLowerCase()) {
        case 'ouro':
        case 'platinum':
          return '👑';
        case 'prata':
          return '⭐';
        default:
          return '🎖️';
      }
    };

    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md bg-white rounded-2xl overflow-hidden p-0 [&>button]:hidden">
          {/* Header com gradiente escuro igual ao menu */}
          <div className="relative bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 pt-6 pb-12 px-6">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors z-10"
              data-testid="button-close-profile-dialog"
            >
              <X className="h-4 w-4" />
            </button>
            
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }} />
            </div>

            <div className="relative">
              {/* Avatar e Nome */}
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm border-2 border-white/20 flex items-center justify-center">
                  <User className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-white mb-1">{customer.name}</h2>
                  <Badge className={`${getTierColor(customer.tier)} border text-xs font-medium`}>
                    {getTierIcon(customer.tier)} {customer.tier}
                  </Badge>
                </div>
              </div>

              {/* Stats rápidos */}
              <div className="grid grid-cols-3 gap-2 mt-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 text-center">
                  <p className="text-2xl font-bold text-white">{customer.visitCount}</p>
                  <p className="text-xs text-white/70">Pedidos</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 text-center">
                  <p className="text-2xl font-bold text-white">{formatKwanza(customer.totalSpent)}</p>
                  <p className="text-xs text-white/70">Gasto</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 text-center">
                  <p className="text-2xl font-bold text-white">{customer.loyaltyPoints}</p>
                  <p className="text-xs text-white/70">Pontos</p>
                </div>
              </div>
            </div>
          </div>

          {/* Card de Pontos - Destaque */}
          <div className="px-6 -mt-8 relative z-10">
            <Card className="bg-gradient-to-r from-amber-500 to-amber-400 border-0 shadow-lg shadow-amber-500/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/90 font-medium">Pontos Disponíveis</p>
                    <p className="text-4xl font-bold text-white">{customer.loyaltyPoints}</p>
                    <p className="text-xs text-white/80 mt-1">
                      🎁 Use no próximo pedido
                    </p>
                  </div>
                  <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center">
                    <Gift className="h-8 w-8 text-white/90" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Dados pessoais */}
          <div className="px-6 py-4 space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <User className="h-4 w-4 text-amber-600" />
              Meus Dados
            </h3>
            
            <div className="space-y-2">
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-gray-400" />
                <span className="text-gray-700">{customer.phone}</span>
              </div>
              
              {customer.email && (
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-700">{customer.email}</span>
                </div>
              )}

              {customer.createdAt && (
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-700">
                    Cliente desde {new Date(customer.createdAt).toLocaleDateString('pt-BR', { 
                      month: 'long', 
                      year: 'numeric' 
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Menu de ações */}
          <div className="px-6 py-2">
            <Button 
              variant="ghost" 
              className="w-full justify-between h-12 hover:bg-amber-50 transition-colors"
              onClick={() => {
                onOpenChange(false);
                onOpenHistory();
              }}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                  <Receipt className="h-4 w-4 text-amber-600" />
                </div>
                <span className="font-medium text-gray-700">Meus Pedidos</span>
              </div>
              <div className="flex items-center gap-2">
                {orderCount > 0 && (
                  <Badge variant="secondary" className="bg-amber-100 text-amber-700 border-0">
                    {orderCount}
                  </Badge>
                )}
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </div>
            </Button>

            <Button 
              variant="ghost" 
              className="w-full justify-between h-12 hover:bg-amber-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                  <Award className="h-4 w-4 text-amber-600" />
                </div>
                <span className="font-medium text-gray-700">Programa de Fidelidade</span>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </Button>

            <Button 
              variant="ghost" 
              className="w-full justify-between h-12 hover:bg-amber-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                  <Tag className="h-4 w-4 text-amber-600" />
                </div>
                <span className="font-medium text-gray-700">Cupons Disponíveis</span>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </Button>
          </div>

          <Separator />

          {/* Logout */}
          <div className="px-6 py-4">
            <Button 
              variant="outline" 
              className="w-full h-11 text-gray-700 border-gray-200 hover:bg-gray-50 hover:text-red-600 hover:border-red-200 transition-all"
              onClick={() => {
                onLogout();
                onOpenChange(false);
              }}
              data-testid="button-logout"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sair da Conta
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Usuário não autenticado - Mostrar opções de login/cadastro
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white rounded-2xl overflow-hidden p-0 [&>button]:hidden">
        {/* Header */}
        <div className="relative bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 pt-6 pb-10 px-6">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors z-10"
            data-testid="button-close-profile-dialog"
          >
            <X className="h-4 w-4" />
          </button>
          
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }} />
          </div>

          <div className="relative text-center">
            <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm border-2 border-white/20 flex items-center justify-center mx-auto mb-3">
              <User className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white mb-1">
              Bem-vindo!
            </h2>
            <p className="text-sm text-white/80">
              Entre ou crie uma conta para aproveitar
            </p>
          </div>
        </div>

        {/* Benefícios */}
        <div className="px-6 py-4">
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-100 p-4">
            <p className="text-xs font-semibold text-amber-700 mb-3 text-center uppercase tracking-wide">
              Benefícios Exclusivos
            </p>
            <div className="flex items-center justify-around gap-2">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-amber-500 flex items-center justify-center mb-2 shadow-sm">
                  <Gift className="h-6 w-6 text-white" />
                </div>
                <span className="text-xs font-medium text-gray-700">Ganhe<br/>Pontos</span>
              </div>
              <div className="w-px h-12 bg-amber-200" />
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-amber-500 flex items-center justify-center mb-2 shadow-sm">
                  <Tag className="h-6 w-6 text-white" />
                </div>
                <span className="text-xs font-medium text-gray-700">Descontos<br/>Especiais</span>
              </div>
              <div className="w-px h-12 bg-amber-200" />
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-amber-500 flex items-center justify-center mb-2 shadow-sm">
                  <Award className="h-6 w-6 text-white" />
                </div>
                <span className="text-xs font-medium text-gray-700">Bônus de<br/>Aniversário</span>
              </div>
            </div>
          </div>
        </div>

        {/* Botões de ação */}
        <div className="px-6 pb-6 space-y-3">
          <Button 
            className="w-full h-12 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl shadow-md shadow-amber-500/30 transition-all"
            onClick={() => {
              onOpenChange(false);
              onOpenLogin();
            }}
            data-testid="button-open-login"
          >
            <Phone className="mr-2 h-5 w-5" />
            Entrar com Telefone
          </Button>
          
          <Button 
            variant="outline"
            className="w-full h-12 border-2 border-amber-200 hover:bg-amber-50 font-semibold rounded-xl text-amber-700 hover:border-amber-300 transition-all"
            onClick={() => {
              onOpenChange(false);
              onOpenRegister();
            }}
            data-testid="button-open-register"
          >
            <UserPlus className="mr-2 h-5 w-5" />
            Criar Nova Conta
          </Button>

          <p className="text-xs text-center text-gray-500 mt-4">
            Ao continuar, você concorda com nossos termos de uso
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
