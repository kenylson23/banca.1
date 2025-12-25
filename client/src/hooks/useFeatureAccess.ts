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
  });

  const features = subscription?.plan?.features || [];
  const hasAccess = features.includes(feature);

  return {
    hasAccess,
    isLoading,
    planName: subscription?.plan?.name,
    planSlug: subscription?.plan?.slug,
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
  });

  const features = subscription?.plan?.features || [];
  const hasAccess = requiredFeatures.every(feature => features.includes(feature));

  return {
    hasAccess,
    isLoading,
    planName: subscription?.plan?.name,
    planSlug: subscription?.plan?.slug,
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
  });

  const features = subscription?.plan?.features || [];
  const hasAccess = anyOfFeatures.some(feature => features.includes(feature));

  return {
    hasAccess,
    isLoading,
    planName: subscription?.plan?.name,
    planSlug: subscription?.plan?.slug,
    features,
  };
}
