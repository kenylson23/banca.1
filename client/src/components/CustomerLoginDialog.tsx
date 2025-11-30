import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useCustomerAuth } from '@/contexts/CustomerAuthContext';
import { User, Phone, KeyRound, Loader2, Gift, LogOut, Crown, Star } from 'lucide-react';
import { formatKwanza } from '@/lib/formatters';

interface CustomerLoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  restaurantId: string;
  primaryColor?: string;
}

type Step = 'phone' | 'otp' | 'profile';

export function CustomerLoginDialog({ 
  open, 
  onOpenChange, 
  restaurantId,
  primaryColor = '#EA580C'
}: CustomerLoginDialogProps) {
  const { toast } = useToast();
  const { 
    isAuthenticated, 
    customer, 
    loyalty, 
    requestOtp, 
    verifyOtp, 
    logout 
  } = useCustomerAuth();
  
  const [step, setStep] = useState<Step>(isAuthenticated ? 'profile' : 'phone');
  const [phone, setPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [devOtpCode, setDevOtpCode] = useState<string | null>(null);

  const handleRequestOtp = async () => {
    if (!phone || phone.length < 9) {
      toast({
        title: 'Telefone inválido',
        description: 'Por favor, insira um número de telefone válido',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await requestOtp(phone, restaurantId);
      
      if (result.success) {
        setStep('otp');
        if (result.otpCode) {
          setDevOtpCode(result.otpCode);
        }
        toast({
          title: 'Código enviado',
          description: 'Verifique seu telefone para o código de verificação',
        });
      } else {
        toast({
          title: 'Erro',
          description: result.message || 'Não foi possível enviar o código',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível enviar o código de verificação',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpCode || otpCode.length !== 6) {
      toast({
        title: 'Código inválido',
        description: 'O código deve ter 6 dígitos',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const success = await verifyOtp(phone, restaurantId, otpCode);
      
      if (success) {
        setStep('profile');
        toast({
          title: 'Login realizado',
          description: 'Bem-vindo de volta!',
        });
      } else {
        toast({
          title: 'Código inválido',
          description: 'O código está incorreto ou expirou',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível verificar o código',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setStep('phone');
    setPhone('');
    setOtpCode('');
    setDevOtpCode(null);
    toast({
      title: 'Logout realizado',
      description: 'Até a próxima!',
    });
  };

  const getTierIcon = (tier: string | null) => {
    switch (tier) {
      case 'platina':
        return <Crown className="w-5 h-5 text-purple-500" />;
      case 'ouro':
        return <Crown className="w-5 h-5 text-yellow-500" />;
      case 'prata':
        return <Star className="w-5 h-5 text-gray-400" />;
      default:
        return <Star className="w-5 h-5 text-amber-700" />;
    }
  };

  const getTierLabel = (tier: string | null) => {
    switch (tier) {
      case 'platina':
        return 'Platina';
      case 'ouro':
        return 'Ouro';
      case 'prata':
        return 'Prata';
      default:
        return 'Bronze';
    }
  };

  const renderPhoneStep = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <div 
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ backgroundColor: `${primaryColor}20` }}
        >
          <Gift className="w-8 h-8" style={{ color: primaryColor }} />
        </div>
        <p className="text-sm text-muted-foreground">
          Acesse seus pontos de fidelidade e benefícios exclusivos
        </p>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="phone">Número de Telefone</Label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            id="phone"
            type="tel"
            placeholder="9XX XXX XXX"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 9))}
            className="pl-10"
            data-testid="input-customer-phone"
          />
        </div>
      </div>
      
      <Button 
        onClick={handleRequestOtp} 
        disabled={isLoading || phone.length < 9}
        className="w-full"
        style={{ backgroundColor: primaryColor }}
        data-testid="button-request-otp"
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : null}
        Receber Código
      </Button>
    </div>
  );

  const renderOtpStep = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <div 
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ backgroundColor: `${primaryColor}20` }}
        >
          <KeyRound className="w-8 h-8" style={{ color: primaryColor }} />
        </div>
        <p className="text-sm text-muted-foreground">
          Digite o código de 6 dígitos enviado para {phone}
        </p>
      </div>

      {devOtpCode && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 text-center">
          <p className="text-xs text-yellow-600 dark:text-yellow-400 mb-1">Código de teste (dev)</p>
          <p className="text-lg font-mono font-bold text-yellow-700 dark:text-yellow-300">{devOtpCode}</p>
        </div>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="otp">Código de Verificação</Label>
        <Input
          id="otp"
          type="text"
          inputMode="numeric"
          placeholder="000000"
          value={otpCode}
          onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          className="text-center text-2xl tracking-widest font-mono"
          maxLength={6}
          data-testid="input-otp-code"
        />
      </div>
      
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          onClick={() => {
            setStep('phone');
            setOtpCode('');
            setDevOtpCode(null);
          }}
          className="flex-1"
          data-testid="button-back-to-phone"
        >
          Voltar
        </Button>
        <Button 
          onClick={handleVerifyOtp} 
          disabled={isLoading || otpCode.length !== 6}
          className="flex-1"
          style={{ backgroundColor: primaryColor }}
          data-testid="button-verify-otp"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : null}
          Verificar
        </Button>
      </div>
      
      <Button 
        variant="ghost" 
        onClick={handleRequestOtp}
        disabled={isLoading}
        className="w-full text-sm"
        data-testid="button-resend-otp"
      >
        Reenviar código
      </Button>
    </div>
  );

  const renderProfileStep = () => {
    if (!customer) return null;
    
    const pointsValue = loyalty 
      ? (customer.loyaltyPoints * parseFloat(loyalty.currencyPerPoint || '0.1'))
      : 0;
    
    return (
      <div className="space-y-4">
        <div className="text-center mb-6">
          <div 
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: `${primaryColor}20` }}
          >
            <User className="w-10 h-10" style={{ color: primaryColor }} />
          </div>
          <h3 className="text-lg font-semibold">{customer.name}</h3>
          <p className="text-sm text-muted-foreground">{customer.phone}</p>
        </div>

        {loyalty?.isActive && (
          <div 
            className="rounded-xl p-4 text-white"
            style={{ backgroundColor: primaryColor }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {getTierIcon(customer.tier)}
                <span className="font-medium">{getTierLabel(customer.tier)}</span>
              </div>
              <span className="text-sm opacity-90">{customer.visitCount} visitas</span>
            </div>
            
            <div className="text-center py-4">
              <p className="text-4xl font-bold">{customer.loyaltyPoints}</p>
              <p className="text-sm opacity-90">pontos disponíveis</p>
              {pointsValue > 0 && (
                <p className="text-xs opacity-75 mt-1">
                  equivalente a {formatKwanza(pointsValue.toString())}
                </p>
              )}
            </div>
            
            {loyalty.minPointsToRedeem > 0 && customer.loyaltyPoints < loyalty.minPointsToRedeem && (
              <p className="text-xs text-center opacity-75">
                Faltam {loyalty.minPointsToRedeem - customer.loyaltyPoints} pontos para resgatar
              </p>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 text-center">
          <div className="bg-muted rounded-lg p-3">
            <p className="text-2xl font-bold">{customer.visitCount}</p>
            <p className="text-xs text-muted-foreground">Visitas</p>
          </div>
          <div className="bg-muted rounded-lg p-3">
            <p className="text-2xl font-bold">{formatKwanza(customer.totalSpent)}</p>
            <p className="text-xs text-muted-foreground">Total gasto</p>
          </div>
        </div>
        
        <Button 
          variant="outline" 
          onClick={handleLogout}
          className="w-full"
          data-testid="button-customer-logout"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sair da conta
        </Button>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {step === 'profile' ? 'Minha Conta' : 'Acessar Meus Benefícios'}
          </DialogTitle>
          <DialogDescription>
            {step === 'phone' && 'Entre com seu telefone para ver seus pontos e benefícios'}
            {step === 'otp' && 'Confirme seu acesso com o código enviado'}
            {step === 'profile' && 'Seus pontos e benefícios de fidelidade'}
          </DialogDescription>
        </DialogHeader>
        
        {step === 'phone' && renderPhoneStep()}
        {step === 'otp' && renderOtpStep()}
        {step === 'profile' && renderProfileStep()}
      </DialogContent>
    </Dialog>
  );
}
