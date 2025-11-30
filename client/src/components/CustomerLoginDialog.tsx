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
import { User, Phone, KeyRound, Loader2, Gift, LogOut, Crown, Star, TrendingUp, Award, Sparkles, Percent, ShoppingBag } from 'lucide-react';
import { formatKwanza } from '@/lib/formatters';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';

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

  const getTierColor = (tier: string | null) => {
    switch (tier) {
      case 'platina':
        return { bg: 'from-purple-600 to-purple-800', text: 'text-purple-100', badge: 'bg-purple-400/20' };
      case 'ouro':
        return { bg: 'from-yellow-500 to-amber-600', text: 'text-yellow-100', badge: 'bg-yellow-400/20' };
      case 'prata':
        return { bg: 'from-gray-400 to-gray-600', text: 'text-gray-100', badge: 'bg-gray-400/20' };
      default:
        return { bg: 'from-amber-600 to-amber-800', text: 'text-amber-100', badge: 'bg-amber-400/20' };
    }
  };

  const getNextTier = (tier: string | null) => {
    switch (tier) {
      case 'bronze':
        return { name: 'Prata', minVisits: 10, icon: <Star className="w-4 h-4" /> };
      case 'prata':
        return { name: 'Ouro', minVisits: 25, icon: <Crown className="w-4 h-4" /> };
      case 'ouro':
        return { name: 'Platina', minVisits: 50, icon: <Crown className="w-4 h-4" /> };
      case 'platina':
        return null;
      default:
        return { name: 'Prata', minVisits: 10, icon: <Star className="w-4 h-4" /> };
    }
  };

  const getTierBenefits = (tier: string | null) => {
    const benefits: { [key: string]: { icon: JSX.Element; text: string }[] } = {
      bronze: [
        { icon: <Gift className="w-4 h-4" />, text: 'Acumule pontos em cada compra' },
        { icon: <Percent className="w-4 h-4" />, text: 'Troque pontos por descontos' },
      ],
      prata: [
        { icon: <Gift className="w-4 h-4" />, text: 'Acumule pontos em cada compra' },
        { icon: <Percent className="w-4 h-4" />, text: '5% extra em pontos' },
        { icon: <Award className="w-4 h-4" />, text: 'Ofertas exclusivas' },
      ],
      ouro: [
        { icon: <Gift className="w-4 h-4" />, text: 'Acumule pontos em cada compra' },
        { icon: <Percent className="w-4 h-4" />, text: '10% extra em pontos' },
        { icon: <Award className="w-4 h-4" />, text: 'Ofertas exclusivas VIP' },
        { icon: <ShoppingBag className="w-4 h-4" />, text: 'Prioridade em promoções' },
      ],
      platina: [
        { icon: <Gift className="w-4 h-4" />, text: 'Acumule pontos em cada compra' },
        { icon: <Percent className="w-4 h-4" />, text: '15% extra em pontos' },
        { icon: <Award className="w-4 h-4" />, text: 'Acesso antecipado a novidades' },
        { icon: <ShoppingBag className="w-4 h-4" />, text: 'Atendimento prioritário' },
        { icon: <Sparkles className="w-4 h-4" />, text: 'Experiências exclusivas' },
      ],
    };
    return benefits[tier || 'bronze'] || benefits.bronze;
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
    
    const tierColors = getTierColor(customer.tier);
    const nextTier = getNextTier(customer.tier);
    const tierBenefits = getTierBenefits(customer.tier);
    const minPointsToRedeem = loyalty?.minPointsToRedeem ?? 100;
    const hasRedeemThreshold = minPointsToRedeem > 0;
    const progressToRedeem = hasRedeemThreshold 
      ? Math.min((customer.loyaltyPoints / minPointsToRedeem) * 100, 100) 
      : 100;
    const canRedeem = !hasRedeemThreshold || customer.loyaltyPoints >= minPointsToRedeem;
    
    const getCurrentTierMinVisits = () => {
      switch (customer.tier) {
        case 'prata': return 10;
        case 'ouro': return 25;
        case 'platina': return 50;
        default: return 0;
      }
    };
    
    const calculateProgressToNextTier = () => {
      if (!nextTier) return 100;
      const currentMin = getCurrentTierMinVisits();
      const nextMin = nextTier.minVisits;
      const range = nextMin - currentMin;
      if (range <= 0) return 100;
      const progress = ((customer.visitCount - currentMin) / range) * 100;
      return Math.max(0, Math.min(progress, 100));
    };
    
    const progressToNextTier = calculateProgressToNextTier();
    
    return (
      <motion.div 
        className="space-y-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div 
          className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${tierColors.bg} p-5 text-white shadow-lg`}
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12" />
          
          <div className="relative">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full ${tierColors.badge} flex items-center justify-center`}>
                  {getTierIcon(customer.tier)}
                </div>
                <div>
                  <p className="text-sm opacity-80">Membro</p>
                  <p className="font-bold text-lg">{getTierLabel(customer.tier)}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs opacity-70">{customer.phone}</p>
                <p className="font-medium">{customer.name || 'Cliente'}</p>
              </div>
            </div>
            
            {loyalty?.isActive && (
              <div className="bg-white/10 backdrop-blur rounded-xl p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Seus Pontos</span>
                  <Sparkles className="w-4 h-4 opacity-70" />
                </div>
                <motion.p 
                  className="text-4xl font-bold"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                >
                  {customer.loyaltyPoints.toLocaleString('pt-AO')}
                </motion.p>
                {pointsValue > 0 && (
                  <p className="text-sm opacity-80 mt-1">
                    = {formatKwanza(pointsValue.toString())} em descontos
                  </p>
                )}
                
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span>Progresso para resgate</span>
                    <span>{Math.round(progressToRedeem)}%</span>
                  </div>
                  <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-white rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${progressToRedeem}%` }}
                      transition={{ duration: 0.8, delay: 0.3 }}
                    />
                  </div>
                  {canRedeem ? (
                    <p className="text-xs mt-2 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      Pronto para resgatar!
                    </p>
                  ) : (
                    <p className="text-xs opacity-70 mt-2">
                      Faltam {minPointsToRedeem - customer.loyaltyPoints} pontos
                    </p>
                  )}
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/10 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold">{customer.visitCount}</p>
                <p className="text-xs opacity-80">Visitas</p>
              </div>
              <div className="bg-white/10 rounded-lg p-3 text-center">
                <p className="text-lg font-bold">{formatKwanza(customer.totalSpent)}</p>
                <p className="text-xs opacity-80">Total gasto</p>
              </div>
            </div>
          </div>
        </motion.div>

        {nextTier && (
          <motion.div 
            className="bg-muted/50 rounded-xl p-4"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Próximo Nível</span>
              </div>
              <div className="flex items-center gap-1 text-sm font-medium" style={{ color: primaryColor }}>
                {nextTier.icon}
                {nextTier.name}
              </div>
            </div>
            <Progress value={progressToNextTier} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {nextTier.minVisits - customer.visitCount > 0 
                ? `Faltam ${nextTier.minVisits - customer.visitCount} visitas para ${nextTier.name}`
                : 'Parabéns! Você está quase lá!'}
            </p>
          </motion.div>
        )}

        <motion.div 
          className="bg-muted/30 rounded-xl p-4"
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Award className="w-4 h-4" style={{ color: primaryColor }} />
            <span className="text-sm font-medium">Seus Benefícios</span>
          </div>
          <div className="space-y-2">
            {tierBenefits.map((benefit, index) => (
              <motion.div 
                key={index}
                className="flex items-center gap-3 text-sm"
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
              >
                <span className="text-muted-foreground">{benefit.icon}</span>
                <span>{benefit.text}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
        
        <Button 
          variant="outline" 
          onClick={handleLogout}
          className="w-full"
          data-testid="button-customer-logout"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sair da conta
        </Button>
      </motion.div>
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
