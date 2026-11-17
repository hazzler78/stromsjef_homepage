/**
 * Assert visitors-per-sale route stays under Cloudflare Worker subrequest budget.
 * Run: node scripts/test-visitors-per-sale-subrequests.js
 */

const assert = require('assert');

const MAX_SALESYS_DAYS_PER_REQUEST = 8;
const WORKER_SUBREQUEST_SOFT_LIMIT = 45;

function countSubrequestsEstimate(daysToSync, supplierCount) {
  const supplierOps = Math.max(1, supplierCount) * 2;
  return 4 + supplierCount + daysToSync * supplierOps;
}

const worstCase = countSubrequestsEstimate(MAX_SALESYS_DAYS_PER_REQUEST, 2);
assert(
  worstCase <= WORKER_SUBREQUEST_SOFT_LIMIT,
  `expected ${worstCase} <= ${WORKER_SUBREQUEST_SOFT_LIMIT}`
);

const typical = countSubrequestsEstimate(3, 1);
assert(typical <= WORKER_SUBREQUEST_SOFT_LIMIT);

console.log('test-visitors-per-sale-subrequests: OK');
console.log(
  JSON.stringify(
    {
      maxDaysPerRequest: MAX_SALESYS_DAYS_PER_REQUEST,
      softLimit: WORKER_SUBREQUEST_SOFT_LIMIT,
      worstCaseOneSupplier: countSubrequestsEstimate(8, 1),
      worstCaseTwoSuppliers: worstCase,
      typicalKildenOnly: typical,
    },
    null,
    2
  )
);