import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  RocketLaunch, 
  CheckCircle, 
  Star,
  Users,
  Gift,
  ChartBar,
  X
} from '@phosphor-icons/react';
import { useNavigate } from 'wouter';

interface UpgradeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feature: 'gestao_clientes' | 'fidelidade' | 'cupons' | 'inventario' | 'multi_filial';
  featureLabel: string;
  featureDescription: string;
}

const featureIcons = {
  gestao_clientes: Users,
  fidelidade: Star,
  cupons: Gift,
  inventario: ChartBar,
  multi_filial: ChartBar,
};

const featureBenefits = {
  gestao_clientes: [
    'Cadastro completo de clientes',
    'Histórico de pedidos por cliente',
    'Análise de comportamento de consumo',
    'Segmentação para marketing',
    'Vinculação com mesas e pedidos',
  ],
  fidelidade: [
    'Sistema de pontos automático',
    'Tiers de clientes (Bronze, Prata, Ouro, Platina)',
    'Resgate de pontos por produtos',
    'Campanhas de fidelização',
    'Recompensas personalizadas',
  ],
  cupons: [
    'Criar cupons de desconto',
    'Campanhas promocionais',
    'Cupons por percentual ou valor fixo',
    'Limite de uso por cliente',
    'Relatórios de efetividade',
  ],
  inventario: [
    'Controle de estoque completo',
    'Alertas de estoque baixo',
    'Transferências entre filiais',
    'Rastreamento de custos',
    'Relatórios de movimentação',
  ],
  multi_filial: [
    'Gerenciar múltiplas filiais',
    'Dashboard consolidado',
    'Relatórios por filial',
    'Transferências entre filiais',
    'Usuários por filial',
  ],
};

export function UpgradeDialog({
  open,
  onOpenChange,
  feature,
  featureLabel,
  featureDescription,
}: UpgradeDialogProps) {
  const navigate = useNavigate();
  const Icon = featureIcons[feature];
  const benefits = featureBenefits[feature];

  const handleUpgrade = () => {
    onOpenChange(false);
    navigate('/subscription');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Icon className="w-6 h-6 text-primary" weight="duotone" />
              </div>
              <div>
                <DialogTitle className="text-xl">
                  Funcionalidade Premium
                </DialogTitle>
                <Badge variant="outline" className="mt-1">
                  Plano Profissional ou superior
                </Badge>
              </div>
            </div>
          </div>
          <DialogDescription className="text-base">
            <strong>{featureLabel}</strong> está disponível apenas nos planos Profissional, Empresarial e Enterprise.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Feature Description */}
          <div className="p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              {featureDescription}
            </p>
          </div>

          {/* Benefits List */}
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <RocketLaunch className="w-4 h-4 text-primary" weight="duotone" />
              O que você ganha com esta funcionalidade:
            </h4>
            <ul className="space-y-2">
              {benefits.map((benefit, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" weight="fill" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Pricing Highlight */}
          <div className="p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border border-primary/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">A partir de</p>
                <p className="text-2xl font-bold text-primary">35.000 Kz<span className="text-sm font-normal">/mês</span></p>
                <p className="text-xs text-muted-foreground mt-1">Plano Profissional</p>
              </div>
              <RocketLaunch className="w-12 h-12 text-primary/30" weight="duotone" />
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto"
          >
            Agora Não
          </Button>
          <Button
            onClick={handleUpgrade}
            className="w-full sm:w-auto bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
          >
            <RocketLaunch className="w-4 h-4 mr-2" weight="duotone" />
            Ver Planos e Fazer Upgrade
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
