import { ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import { useFeatureAccess, Feature } from '@/hooks/useFeatureAccess';
import { 
  AlertCircle,
  RocketLaunch,
  CheckCircle,
  Lock
} from '@phosphor-icons/react';

interface FeatureGuardProps {
  feature: Feature;
  featureName: string;
  featureDescription: string;
  children: ReactNode;
  fallbackComponent?: ReactNode;
}

/**
 * Componente que protege conteúdo baseado em features do plano
 * 
 * @example
 * <FeatureGuard 
 *   feature="gestao_clientes" 
 *   featureName="Gestão de Clientes"
 *   featureDescription="Cadastre e gerencie clientes..."
 * >
 *   <CustomersPage />
 * </FeatureGuard>
 */
export function FeatureGuard({
  feature,
  featureName,
  featureDescription,
  children,
  fallbackComponent,
}: FeatureGuardProps) {
  const [, navigate] = useLocation();
  const { hasAccess, isLoading } = useFeatureAccess(feature);

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-sm text-muted-foreground">Verificando acesso...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    if (fallbackComponent) {
      return <>{fallbackComponent}</>;
    }

    return (
      <div className="p-6">
        <Card className="p-8 max-w-2xl mx-auto">
          <div className="text-center space-y-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-orange-100 to-orange-50 text-orange-600">
              <Lock className="w-8 h-8" weight="duotone" />
            </div>
            
            <div>
              <h2 className="text-2xl font-bold mb-2">Funcionalidade Premium</h2>
              <p className="text-lg text-muted-foreground mb-1">
                <strong>{featureName}</strong>
              </p>
              <p className="text-sm text-muted-foreground">
                {featureDescription}
              </p>
            </div>

            <div className="p-4 bg-muted/50 rounded-lg text-left">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <RocketLaunch className="w-4 h-4 text-primary" weight="duotone" />
                Benefícios desta funcionalidade:
              </h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" weight="fill" />
                  <span>Acesso completo a funcionalidades avançadas</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" weight="fill" />
                  <span>Relatórios e análises detalhadas</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" weight="fill" />
                  <span>Suporte prioritário</span>
                </li>
              </ul>
            </div>

            <div className="p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border border-primary/20">
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <p className="text-sm text-muted-foreground">Disponível a partir de</p>
                  <p className="text-2xl font-bold text-primary">35.000 Kz<span className="text-sm font-normal">/mês</span></p>
                  <p className="text-xs text-muted-foreground mt-1">Plano Profissional</p>
                </div>
                <RocketLaunch className="w-12 h-12 text-primary/30" weight="duotone" />
              </div>
            </div>

            <div className="flex gap-4 justify-center pt-2">
              <Button 
                variant="outline" 
                onClick={() => navigate("/")}
                className="w-full sm:w-auto"
              >
                Voltar ao Início
              </Button>
              <Button 
                onClick={() => navigate("/subscription")}
                className="w-full sm:w-auto bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
              >
                <RocketLaunch className="w-4 h-4 mr-2" weight="duotone" />
                Ver Planos e Fazer Upgrade
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
