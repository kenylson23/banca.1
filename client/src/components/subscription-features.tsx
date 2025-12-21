import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Lock, Sparkles } from "lucide-react";

interface SubscriptionFeaturesProps {
  plan: {
    name: string;
    features: string[];
  };
}

// Mapeamento de features do backend para nomes amigáveis e categorias
const featureMapping: Record<string, { 
  display: string; 
  category: 'core' | 'advanced' | 'enterprise';
  minPlan: string;
}> = {
  // Core features
  'Sistema PDV Completo': { display: 'Sistema PDV Completo', category: 'core', minPlan: 'Básico' },
  'Gestão de Mesas': { display: 'Gestão de Mesas', category: 'core', minPlan: 'Básico' },
  'Cardápio Digital': { display: 'Cardápio Digital', category: 'core', minPlan: 'Básico' },
  'Relatórios Básicos': { display: 'Relatórios Básicos', category: 'core', minPlan: 'Básico' },
  'Controle de Estoque': { display: 'Controle de Estoque', category: 'core', minPlan: 'Básico' },
  
  // Advanced features
  'Gestão de Clientes': { display: 'Gestão de Clientes', category: 'advanced', minPlan: 'Profissional' },
  'Programa de Fidelidade': { display: 'Programa de Fidelidade', category: 'advanced', minPlan: 'Profissional' },
  'Cupons e Descontos': { display: 'Cupons e Descontos', category: 'advanced', minPlan: 'Profissional' },
  'Múltiplas Filiais': { display: 'Múltiplas Filiais', category: 'advanced', minPlan: 'Premium' },
  'Relatórios Avançados': { display: 'Relatórios Avançados', category: 'advanced', minPlan: 'Premium' },
  'Dashboard Analytics': { display: 'Dashboard Analytics', category: 'advanced', minPlan: 'Premium' },
  'API de Integração': { display: 'API de Integração', category: 'advanced', minPlan: 'Premium' },
  'Integração com Delivery': { display: 'Integração com Delivery', category: 'advanced', minPlan: 'Premium' },
  
  // Enterprise features
  'Suporte Prioritário': { display: 'Suporte Prioritário 24/7', category: 'enterprise', minPlan: 'Enterprise' },
  'Treinamento Personalizado': { display: 'Treinamento Personalizado', category: 'enterprise', minPlan: 'Enterprise' },
  'Gerente de Conta Dedicado': { display: 'Gerente de Conta Dedicado', category: 'enterprise', minPlan: 'Enterprise' },
  'SLA Garantido': { display: 'SLA Garantido (99.9%)', category: 'enterprise', minPlan: 'Enterprise' },
  'Customização Avançada': { display: 'Customização Avançada', category: 'enterprise', minPlan: 'Enterprise' },
  'Backup Diário': { display: 'Backup Diário Automático', category: 'enterprise', minPlan: 'Enterprise' },
};

export function SubscriptionFeatures({ plan }: SubscriptionFeaturesProps) {
  // Organizar features por categoria e disponibilidade
  const organizedFeatures = useMemo(() => {
    // Primeiro, pegar features do backend
    const backendFeatures = plan.features || [];
    
    // Criar lista de todas as features conhecidas
    const allKnownFeatures = Object.keys(featureMapping);
    
    // Separar em disponíveis e bloqueadas
    const available: string[] = [];
    const locked: string[] = [];
    
    allKnownFeatures.forEach(featureKey => {
      const featureInfo = featureMapping[featureKey];
      
      // Verificar se a feature está nas features do backend (sincronização 100%)
      const isInBackend = backendFeatures.some(bf => 
        bf.toLowerCase().includes(featureKey.toLowerCase()) || 
        featureKey.toLowerCase().includes(bf.toLowerCase())
      );
      
      if (isInBackend) {
        available.push(featureKey);
      } else {
        locked.push(featureKey);
      }
    });
    
    // Se houver features no backend que não estão no mapping, adicionar dinamicamente
    backendFeatures.forEach(bf => {
      const isAlreadyMapped = available.some(a => 
        a.toLowerCase().includes(bf.toLowerCase()) || 
        bf.toLowerCase().includes(a.toLowerCase())
      );
      
      if (!isAlreadyMapped) {
        available.push(bf);
      }
    });
    
    return {
      available,
      locked: locked.filter(l => featureMapping[l]), // Só mostrar features mapeadas
      hasCustomFeatures: backendFeatures.some(bf => !allKnownFeatures.includes(bf))
    };
  }, [plan.features]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">O que está incluído</CardTitle>
            <CardDescription className="text-xs">
              Recursos disponíveis no plano {plan.name}
            </CardDescription>
          </div>
          {organizedFeatures.hasCustomFeatures && (
            <Badge variant="secondary" className="text-xs">
              <Sparkles className="h-3 w-3 mr-1" />
              Customizado
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Features Disponíveis */}
          {organizedFeatures.available.length > 0 && (
            <div className="space-y-2">
              {organizedFeatures.available.map((feature, index) => {
                const featureInfo = featureMapping[feature];
                const displayName = featureInfo?.display || feature;
                
                return (
                  <div
                    key={`available-${index}`}
                    className="flex items-center gap-2 text-sm"
                  >
                    <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span className="flex-1">{displayName}</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Features Bloqueadas (mostrar top 5) */}
          {organizedFeatures.locked.length > 0 && (
            <>
              <div className="flex items-center gap-2 pt-2">
                <div className="h-px bg-border flex-1" />
                <span className="text-xs text-muted-foreground">Disponível em:</span>
                <div className="h-px bg-border flex-1" />
              </div>
              
              <div className="space-y-2">
                {organizedFeatures.locked.slice(0, 5).map((feature, index) => {
                  const featureInfo = featureMapping[feature];
                  const displayName = featureInfo?.display || feature;
                  const minPlan = featureInfo?.minPlan || 'Premium';
                  
                  return (
                    <div
                      key={`locked-${index}`}
                      className="flex items-center gap-2 text-sm opacity-40"
                    >
                      <Lock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-muted-foreground flex-1">{displayName}</span>
                      <Badge variant="outline" className="text-xs">
                        {minPlan}+
                      </Badge>
                    </div>
                  );
                })}
              </div>
              
              {organizedFeatures.locked.length > 5 && (
                <div className="text-xs text-center text-muted-foreground pt-2">
                  + {organizedFeatures.locked.length - 5} outras features
                </div>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
