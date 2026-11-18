import { type ElectricityPlan, mockElectricityPlans } from '@/lib/electricity';

/** DB rows may omit affiliate_link; fall back to seeded catalog by supplier + plan name. */
export function resolvePlanAffiliateLink(
  plan: Pick<ElectricityPlan, 'supplierName' | 'planName' | 'affiliateLink'>
): string | undefined {
  if (plan.affiliateLink?.trim()) return plan.affiliateLink.trim();
  const match = mockElectricityPlans.find(
    (p) => p.supplierName === plan.supplierName && p.planName === plan.planName && p.affiliateLink
  );
  return match?.affiliateLink;
}