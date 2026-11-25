import { type ElectricityPlan, mockElectricityPlans } from '@/lib/electricity';
import { normalizeExternalUrl } from '@/lib/normalizeExternalUrl';

/** DB rows may omit affiliate_link; fall back to seeded catalog by supplier + plan name. */
export function resolvePlanAffiliateLink(
  plan: Pick<ElectricityPlan, 'supplierName' | 'planName' | 'affiliateLink'>
): string | undefined {
  const direct = normalizeExternalUrl(plan.affiliateLink);
  if (direct) return direct;
  const match = mockElectricityPlans.find(
    (p) => p.supplierName === plan.supplierName && p.planName === plan.planName && p.affiliateLink
  );
  const fallback = normalizeExternalUrl(match?.affiliateLink);
  return fallback || undefined;
}
