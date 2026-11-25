/**
 * Scheme-less partner URLs must become absolute https links.
 * Run: npm run test:normalize-external-url
 */

import assert from 'node:assert/strict';
import { normalizeExternalUrl } from '../src/lib/normalizeExternalUrl';
import { resolvePlanAffiliateLink } from '../src/lib/planAffiliateLink';

const kilden = 'kildenkraft.no/bedrift/kampanje-fastpris-5-ar/?utm_source=stromsjef.no';

assert.equal(
  normalizeExternalUrl(`  ${kilden}  `),
  `https://${kilden}`,
);
assert.equal(normalizeExternalUrl('https://kildenkraft.no/x'), 'https://kildenkraft.no/x');
assert.equal(normalizeExternalUrl('http://example.com/a'), 'http://example.com/a');
assert.equal(normalizeExternalUrl('HTTPS://Example.com/x'), 'HTTPS://Example.com/x');
assert.equal(normalizeExternalUrl('/bedrift'), '/bedrift');
assert.equal(normalizeExternalUrl('//cdn.example.com/a'), '//cdn.example.com/a');
assert.equal(normalizeExternalUrl('mailto:post@stromsjef.no'), 'mailto:post@stromsjef.no');
assert.equal(normalizeExternalUrl('tel:+46736862360'), 'tel:+46736862360');
assert.equal(normalizeExternalUrl(''), '');
assert.equal(normalizeExternalUrl('   '), '');
assert.equal(normalizeExternalUrl(null), '');
assert.equal(normalizeExternalUrl(undefined), '');

assert.equal(
  resolvePlanAffiliateLink({
    supplierName: 'Kilden Kraft',
    planName: 'Fastpris 5 år',
    affiliateLink: kilden,
  }),
  `https://${kilden}`,
);

console.log('normalizeExternalUrl: ok');
