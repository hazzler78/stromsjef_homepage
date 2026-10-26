/**
 * Otovo lead helper tests (mocked fetch — never hits production API).
 * Run: node test-otovo-interest.js
 */

const assert = require('assert');

// Inline copies of pure functions for Node without TS transpile
function parseYearlyConsumptionKwh(raw) {
  if (!raw) return null;
  const digitsOnly = raw.replace(/[^\d]/g, '');
  if (!digitsOnly) return null;
  const value = Number(digitsOnly);
  if (!Number.isFinite(value) || value <= 0) return null;
  return value;
}

function buildOtovoInterestPayload(data, utm) {
  const addressParts = [];
  if (data.address?.trim()) addressParts.push(data.address.trim());
  const cityLine = [data.postalCode?.trim(), data.city?.trim()].filter(Boolean).join(' ');
  if (cityLine) addressParts.push(cityLine);
  else if (data.city?.trim()) addressParts.push(data.city.trim());

  const address = addressParts.join(', ');
  const yearlyConsumptionKwh = parseYearlyConsumptionKwh(data.consumption);

  const utm_data = {
    utm_campaign: utm.campaign,
    utm_medium: 'lead-generation',
    utm_source: utm.source,
    utm_term: '',
    utm_id: data.campaignCode || data.ref || '',
  };

  const body = {
    name: data.name || '',
    email: data.email,
    phone_number: data.phone || '',
    utm_data,
  };

  if (address) body.address = address;
  if (yearlyConsumptionKwh) {
    body.extra_information = { yearly_consumption_kwh: yearlyConsumptionKwh };
  }

  return body;
}

async function sendOtovoInterest(data, options) {
  const { apiToken, apiBaseUrl, utmSource, utmCampaign, fetchImpl = fetch } = options;

  if (!apiToken) {
    return { status: 'skipped', reason: 'OTOVO_API_TOKEN not configured' };
  }
  if (!utmSource?.trim()) {
    return { status: 'skipped', reason: 'OTOVO_UTM_SOURCE not configured' };
  }

  const body = buildOtovoInterestPayload(data, {
    source: utmSource.trim(),
    campaign: utmCampaign,
  });

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Token ${apiToken}`,
  };

  try {
    const validateRes = await fetchImpl(`${apiBaseUrl}/partner/v1/interests/validate_data`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (!validateRes.ok) {
      const text = await validateRes.text();
      return { status: 'failed', stage: 'validate', reason: `HTTP ${validateRes.status}: ${text}` };
    }

    const validateJson = await validateRes.json();

    if (!validateJson.is_valid) {
      return {
        status: 'failed',
        stage: 'invalid',
        reason: validateJson.message || JSON.stringify(validateJson.result ?? validateJson),
      };
    }

    const createRes = await fetchImpl(`${apiBaseUrl}/partner/v1/interests/`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (!createRes.ok) {
      const text = await createRes.text();
      return { status: 'failed', stage: 'create', reason: `HTTP ${createRes.status}: ${text}` };
    }

    return { status: 'success' };
  } catch (error) {
    return { status: 'failed', stage: 'network', reason: error.message };
  }
}

function testParseConsumption() {
  assert.strictEqual(parseYearlyConsumptionKwh('15 000 kWh'), 15000);
  assert.strictEqual(parseYearlyConsumptionKwh(''), null);
  assert.strictEqual(parseYearlyConsumptionKwh('abc'), null);
  console.log('✓ parseYearlyConsumptionKwh');
}

function testBuildPayload() {
  const body = buildOtovoInterestPayload(
    {
      name: 'Ola',
      email: 'ola@example.no',
      phone: '+47 912 34 567',
      address: 'Eksempelveien 1',
      postalCode: '0150',
      city: 'Oslo',
      consumption: '12 000',
      ref: 'sol_laddbox',
    },
    { source: 'Strømsjef_no_PV', campaign: 'Strømsjef_no_PV' }
  );
  assert.strictEqual(body.address, 'Eksempelveien 1, 0150 Oslo');
  assert.strictEqual(body.extra_information.yearly_consumption_kwh, 12000);
  assert.strictEqual(body.utm_data.utm_medium, 'lead-generation');
  assert.strictEqual(body.utm_data.utm_source, 'Strømsjef_no_PV');
  console.log('✓ buildOtovoInterestPayload');
}

async function testSendMockedSuccess() {
  const calls = [];
  const mockFetch = async (url, init) => {
    calls.push({ url, body: JSON.parse(init.body) });
    if (url.endsWith('/validate_data')) {
      return {
        ok: true,
        json: async () => ({ is_valid: true }),
      };
    }
    if (url.endsWith('/interests/')) {
      return { ok: true, json: async () => ({ id: 'mock-lead' }) };
    }
    throw new Error(`unexpected url ${url}`);
  };

  const result = await sendOtovoInterest(
    {
      name: 'Kari',
      email: 'kari@example.no',
      phone: '98765432',
      address: 'Gate 2',
      postalCode: '5003',
      city: 'Bergen',
    },
    {
      apiToken: 'test-token',
      apiBaseUrl: 'https://mock.otovo.test',
      utmSource: 'Strømsjef_no_PV',
      utmCampaign: 'Strømsjef_no_PV',
      fetchImpl: mockFetch,
    }
  );

  assert.strictEqual(result.status, 'success');
  assert.strictEqual(calls.length, 2);
  assert.ok(calls[0].url.includes('validate_data'));
  assert.ok(calls[1].url.includes('/interests/'));
  assert.strictEqual(calls[0].body.email, 'kari@example.no');
  console.log('✓ sendOtovoInterest (mocked success)');
}

async function testSendSkipsWithoutSource() {
  const result = await sendOtovoInterest(
    { email: 'a@b.no' },
    { apiToken: 'x', apiBaseUrl: 'https://mock.otovo.test', utmCampaign: 'Strømsjef_no_PV' }
  );
  assert.strictEqual(result.status, 'skipped');
  console.log('✓ sendOtovoInterest skips without UTM source');
}

async function run() {
  testParseConsumption();
  testBuildPayload();
  await testSendMockedSuccess();
  await testSendSkipsWithoutSource();
  console.log('\nAll Otovo tests passed.');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
