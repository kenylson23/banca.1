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
import { User, Phone, KeyRound, Loader2, Gift, LogOut, Crown, Star, TrendingUp, Award, Sparkles, Percent, ShoppingBag, Package, Tag, History, ChevronRight } from 'lucide-react';
import { formatKwanza } from '@/lib/formatters';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

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
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center mx-auto mb-4 shadow-sm border border-amber-500/30">
          <Gift className="w-8 h-8 text-amber-500" />
        </div>
        <p className="text-sm text-neutral-300">
          Acesse seus pontos de fidelidade e benefícios exclusivos
        </p>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="phone" className="text-neutral-200 font-medium">Número de Telefone</Label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
          <Input
            id="phone"
            type="tel"
            placeholder="9XX XXX XXX"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 9))}
            className="pl-10 h-11 bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500 focus:border-amber-500 focus:ring-amber-500"
            data-testid="input-customer-phone"
          />
        </div>
      </div>
      
      <Button 
        onClick={handleRequestOtp} 
        disabled={isLoading || phone.length < 9}
        className="w-full h-11 bg-amber-500 hover:bg-amber-600 text-white font-semibold shadow-md shadow-amber-500/30"
        data-testid="button-request-otp"
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : null}
        Receber Código
      </Button>
      
      <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <Gift className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-neutral-300">
            Ganhe pontos em cada pedido e troque por descontos especiais
          </p>
        </div>
      </div>
    </div>
  );

  const renderOtpStep = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center mx-auto mb-4 shadow-sm border border-amber-500/30">
          <KeyRound className="w-8 h-8 text-amber-500" />
        </div>
        <p className="text-sm text-neutral-300">
          Digite o código de 6 dígitos enviado para <span className="font-semibold text-white">{phone}</span>
        </p>
      </div>

      {devOtpCode && (
        <div className="bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-amber-500/30 rounded-lg p-3 text-center">
          <p className="text-xs text-amber-500 mb-1 font-medium">Código de teste (dev)</p>
          <p className="text-lg font-mono font-bold text-amber-400">{devOtpCode}</p>
        </div>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="otp" className="text-neutral-200 font-medium">Código de Verificação</Label>
        <Input
          id="otp"
          type="text"
          inputMode="numeric"
          placeholder="000000"
          value={otpCode}
          onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          className="text-center text-2xl tracking-widest font-mono h-14 bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-600 focus:border-amber-500 focus:ring-amber-500"
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
          className="flex-1 h-11 border-neutral-700 bg-neutral-800 hover:bg-neutral-700 text-white"
          data-testid="button-back-to-phone"
        >
          Voltar
        </Button>
        <Button 
          onClick={handleVerifyOtp} 
          disabled={isLoading || otpCode.length !== 6}
          className="flex-1 h-11 bg-amber-500 hover:bg-amber-600 text-white font-semibold shadow-md shadow-amber-500/30"
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
        className="w-full text-sm hover:bg-amber-500/10 text-amber-500"
        data-testid="button-resend-otp"
      >
        Reenviar código
      </Button>
    </div>
  );

  // Fetch customer orders
  const { data: customerOrders } = useQuery({
    queryKey: ['customer-orders', customer?.id, restaurantId],
    queryFn: async () => {
      if (!customer?.id) return [];
      const response = await fetch(`/api/public/customers/${customer.id}/orders?restaurantId=${restaurantId}`);
      if (!response.ok) return [];
      return response.json();
    },
    enabled: isAuthenticated && !!customer?.id,
  });

  // Fetch customer coupons
  const { data: customerCoupons } = useQuery({
    queryKey: ['customer-coupons', customer?.id, restaurantId],
    queryFn: async () => {
      if (!customer?.id) return [];
      const response = await fetch(`/api/public/customers/${customer.id}/coupons?restaurantId=${restaurantId}`);
      if (!response.ok) return [];
      return response.json();
    },
    enabled: isAuthenticated && !!customer?.id,
  });

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

        {/* Tabs for Orders, Coupons, and Benefits */}
        <Tabs defaultValue="benefits" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-neutral-800">
            <TabsTrigger value="benefits" className="data-[state=active]:bg-amber-500 data-[state=active]:text-white">
              <Award className="w-3.5 h-3.5 mr-1.5" />
              Benefícios
            </TabsTrigger>
            <TabsTrigger value="orders" className="data-[state=active]:bg-amber-500 data-[state=active]:text-white">
              <Package className="w-3.5 h-3.5 mr-1.5" />
              Pedidos
            </TabsTrigger>
            <TabsTrigger value="coupons" className="data-[state=active]:bg-amber-500 data-[state=active]:text-white">
              <Tag className="w-3.5 h-3.5 mr-1.5" />
              Cupons
            </TabsTrigger>
          </TabsList>

          <TabsContent value="benefits" className="mt-4">
            <motion.div 
              className="bg-neutral-800/50 rounded-xl p-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Award className="w-4 h-4 text-amber-500" />
                <span className="text-sm font-medium text-white">Seus Benefícios</span>
              </div>
              <div className="space-y-2">
                {tierBenefits.map((benefit, index) => (
                  <motion.div 
                    key={index}
                    className="flex items-center gap-3 text-sm text-neutral-300"
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <span className="text-amber-500">{benefit.icon}</span>
                    <span>{benefit.text}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </TabsContent>

          <TabsContent value="orders" className="mt-4">
            <ScrollArea className="h-[300px] pr-4">
              {customerOrders && customerOrders.length > 0 ? (
                <div className="space-y-3">
                  {customerOrders.map((order: any, index: number) => (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-neutral-800/50 rounded-lg p-3 hover:bg-neutral-800 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
                            <Package className="w-4 h-4 text-amber-500" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">Pedido #{order.orderNumber || order.id.slice(0, 8)}</p>
                            <p className="text-xs text-neutral-400">
                              {new Date(order.createdAt).toLocaleDateString('pt-AO', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </p>
                          </div>
                        </div>
                        <Badge variant={order.status === 'concluído' ? 'default' : 'secondary'} className="text-xs">
                          {order.status}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-neutral-400">{order.items?.length || 0} {order.items?.length === 1 ? 'item' : 'itens'}</p>
                        <p className="text-sm font-bold text-amber-500">{formatKwanza(order.totalAmount)}</p>
                      </div>
                      {order.pointsEarned > 0 && (
                        <div className="mt-2 pt-2 border-t border-neutral-700 flex items-center gap-1 text-xs text-amber-400">
                          <Sparkles className="w-3 h-3" />
                          +{order.pointsEarned} pontos ganhos
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center py-8">
                  <History className="w-12 h-12 text-neutral-600 mb-3" />
                  <p className="text-sm text-neutral-400">Nenhum pedido ainda</p>
                  <p className="text-xs text-neutral-500 mt-1">Seus pedidos aparecerão aqui</p>
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="coupons" className="mt-4">
            <ScrollArea className="h-[300px] pr-4">
              {customerCoupons && customerCoupons.length > 0 ? (
                <div className="space-y-3">
                  {customerCoupons.map((coupon: any, index: number) => (
                    <motion.div
                      key={coupon.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-lg p-3"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center">
                            <Tag className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white">{coupon.code}</p>
                            <p className="text-xs text-amber-400">
                              {coupon.discountType === 'percentage' 
                                ? `${coupon.discountValue}% de desconto`
                                : `${formatKwanza(coupon.discountValue)} de desconto`}
                            </p>
                          </div>
                        </div>
                        {coupon.isActive ? (
                          <Badge className="bg-green-500 text-white text-xs">Ativo</Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">Usado</Badge>
                        )}
                      </div>
                      {coupon.description && (
                        <p className="text-xs text-neutral-300 mb-2">{coupon.description}</p>
                      )}
                      {coupon.expiresAt && (
                        <p className="text-xs text-neutral-400">
                          Válido até {new Date(coupon.expiresAt).toLocaleDateString('pt-AO')}
                        </p>
                      )}
                      {coupon.minOrderValue && (
                        <p className="text-xs text-neutral-400 mt-1">
                          Pedido mínimo: {formatKwanza(coupon.minOrderValue)}
                        </p>
                      )}
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center py-8">
                  <Tag className="w-12 h-12 text-neutral-600 mb-3" />
                  <p className="text-sm text-neutral-400">Nenhum cupom disponível</p>
                  <p className="text-xs text-neutral-500 mt-1">Cupons especiais aparecerão aqui</p>
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
        
        <Button 
          variant="outline" 
          onClick={handleLogout}
          className="w-full mt-4 bg-neutral-800 hover:bg-neutral-700 text-white border-neutral-700"
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
      <DialogContent className="sm:max-w-md rounded-2xl bg-neutral-900 border-neutral-800">
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-xl font-bold text-white">
            {step === 'profile' ? 'Minha Conta' : 'Acessar Meus Benefícios'}
          </DialogTitle>
          <DialogDescription className="text-sm text-neutral-400">
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
