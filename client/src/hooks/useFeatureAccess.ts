import { useQuery } from '@tanstack/react-query';
import {
  hasEnterpriseAccess,
  hasPlanFeature,
  normalizePlanFeatures,
} from '@shared/planAccess';

export type Feature = 
  | 'gestao_clientes'
  | 'fidelidade'
  | 'cupons'
  | 'inventario'
  | 'gestao_despesas'
  | 'multi_filial'
  | 'relatorios_avancados'
  | 'dashboard_analytics'
  | 'delivery_takeout'
  | 'relatorios_financeiros'
  | 'api_integracoes'
  | 'exportacao_dados';

export interface FeatureAccessResult {
  hasAccess: boolean;
  isLoading: boolean;
  planName?: string;
  planSlug?: string;
  features: string[];
}

/**
 * Hook para verificar acesso a features específicas baseado no plano de assinatura
 * 
 * @param feature - Nome da feature a verificar
 * @returns Objeto com hasAccess (boolean), isLoading, e informações do plano
 * 
 * @example
 * const { hasAccess, isLoading, planName } = useFeatureAccess('gestao_clientes');
 * 
 * if (isLoading) return <Loading />;
 * if (!hasAccess) return <UpgradePrompt />;
 * return <CustomerManagement />;
 */
export function useFeatureAccess(feature: Feature): FeatureAccessResult {
  const { data: subscription, isLoading } = useQuery<any>({
    queryKey: ['/api/subscription'],
    retry: false,
    staleTime: 30_000,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });

    const plan = resolveSubscriptionPlan(subscription);
    const features = normalizePlanFeatures(plan?.features ?? subscription?.features);
    const hasAccess = hasPlanFeature(plan, feature);

  return {
    hasAccess,
    isLoading,
    planName: plan?.name,
    planSlug: plan?.slug,
    features,
  };
}

/**
 * Hook para verificar acesso a múltiplas features
 * 
 * @param requiredFeatures - Array de features necessárias
 * @returns Objeto com hasAccess (true se tem TODAS as features), isLoading, e informações do plano
 * 
 * @example
 * const { hasAccess } = useMultipleFeatureAccess(['gestao_clientes', 'fidelidade']);
 */
export function useMultipleFeatureAccess(requiredFeatures: Feature[]): FeatureAccessResult {
  const { data: subscription, isLoading } = useQuery<any>({
    queryKey: ['/api/subscription'],
    retry: false,
    staleTime: 30_000,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });

    const plan = resolveSubscriptionPlan(subscription);
    const features = normalizePlanFeatures(plan?.features ?? subscription?.features);
   const hasAccess = requiredFeatures.every(
       feature => hasPlanFeature(plan, feature),
   );

  return {
    hasAccess,
    isLoading,
    planName: plan?.name,
    planSlug: plan?.slug,
    features,
  };
}

/**
 * Hook para verificar se tem PELO MENOS UMA das features
 * 
 * @param anyOfFeatures - Array de features (OR logic)
 * @returns Objeto com hasAccess (true se tem PELO MENOS UMA feature)
 * 
 * @example
 * const { hasAccess } = useAnyFeatureAccess(['cupons', 'fidelidade']);
 */
export function useAnyFeatureAccess(anyOfFeatures: Feature[]): FeatureAccessResult {
  const { data: subscription, isLoading } = useQuery<any>({
    queryKey: ['/api/subscription'],
    retry: false,
    staleTime: 30_000,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });

    const plan = resolveSubscriptionPlan(subscription);
    const features = normalizePlanFeatures(plan?.features ?? subscription?.features);
    const hasAccess = anyOfFeatures.some(
       feature => hasPlanFeature(plan, feature),
   );

  return {
    hasAccess,
    isLoading,
    planName: plan?.name,
    planSlug: plan?.slug,
    features,
  };
}

export function resolveSubscriptionPlan(subscription: any): Record<string, any> | null {
  const plan = subscription?.plan;

  if (plan && typeof plan === 'object') {
    return plan;
  }

  if (typeof plan === 'string') {
    return {
      name: plan,
      slug: subscription?.planSlug,
      features: subscription?.features,
    };
  }

  if (subscription?.planName || subscription?.planSlug || subscription?.features) {
    return {
      name: subscription.planName,
      slug: subscription.planSlug,
      features: subscription.features,
    };
  }

  return null;
}

export { hasEnterpriseAccess, hasPlanFeature };
