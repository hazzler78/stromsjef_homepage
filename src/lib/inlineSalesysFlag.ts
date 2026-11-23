/**
 * Inline Salesys embed on /start-her for Kilden Kraft plans.
 * Off by default — deploys from master keep affiliate CTAs unless explicitly enabled.
 * Set NEXT_PUBLIC_ENABLE_INLINE_SALESYS_FORM=true at build time to re-enable.
 */
export const ENABLE_INLINE_SALESYS_FORM =
  process.env.NEXT_PUBLIC_ENABLE_INLINE_SALESYS_FORM === 'true';