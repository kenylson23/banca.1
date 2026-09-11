import { useQuery } from '@tanstack/react-query';

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
    const features = normalizeFeatures(plan?.features ?? subscription?.features);
    const hasAccess = hasEnterpriseAccess(plan) || features.includes(feature);

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
    const features = normalizeFeatures(plan?.features ?? subscription?.features);
   const hasAccess = requiredFeatures.every(
      feature => hasEnterpriseAccess(plan) || features.includes(feature),
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
    const features = normalizeFeatures(plan?.features ?? subscription?.features);
    const hasAccess = anyOfFeatures.some(
      feature => hasEnterpriseAccess(plan) || features.includes(feature),
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

function normalizeFeatures(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((feature): feature is string => typeof feature === 'string');
  }

  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed)
        ? parsed.filter((feature): feature is string => typeof feature === 'string')
        : [];
    } catch {
      return [];
    }
  }

  return [];
}

export function hasEnterpriseAccess(plan: {
  slug?: unknown;
  name?: unknown;
  features?: unknown;
} | null | undefined): boolean {
  const identifiers = [plan?.slug, plan?.name]
    .map((value) => String(value || '').trim().toLowerCase())
    .filter(Boolean);

  const isNamedEnterprise = identifiers.some((identifier) => identifier.includes('enterprise'));
  const isKnownLowerTier = identifiers.some((identifier) => (
    identifier === 'basico' ||
    identifier.startsWith('basico ') ||
    identifier === 'profissional' ||
    identifier.startsWith('profissional ') ||
    identifier === 'empresarial' ||
    identifier.startsWith('empresarial ')
  ));
  const features = normalizeFeatures(plan?.features);

  return isNamedEnterprise || (!isKnownLowerTier && features.includes('tudo_ilimitado'));
}
