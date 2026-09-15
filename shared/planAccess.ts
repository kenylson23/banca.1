export interface PlanAccessShape {
  slug?: unknown;
  name?: unknown;
  features?: unknown;
}

export const UNLIMITED_PLAN_LIMIT = 999999;

export function normalizePlanFeatures(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((feature): feature is string => typeof feature === 'string');
  }

  if (typeof value !== 'string') {
    return [];
  }

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed)
      ? parsed.filter((feature): feature is string => typeof feature === 'string')
      : [];
  } catch {
    return [];
  }
}

export function hasEnterpriseAccess(plan: PlanAccessShape | null | undefined): boolean {
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

  return isNamedEnterprise || (
    !isKnownLowerTier &&
    normalizePlanFeatures(plan?.features).includes('tudo_ilimitado')
  );
}

export function hasPlanFeature(
  plan: PlanAccessShape | null | undefined,
  feature: string,
): boolean {
  return Boolean(plan) && (
    hasEnterpriseAccess(plan) ||
    normalizePlanFeatures(plan?.features).includes(feature)
  );
}

export function canUsePlanLimit(
  plan: PlanAccessShape | null | undefined,
  limit: number,
  usage: number,
): boolean {
  return hasEnterpriseAccess(plan) || limit >= UNLIMITED_PLAN_LIMIT || usage < limit;
}