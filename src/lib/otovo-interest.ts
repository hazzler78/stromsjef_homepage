import type { ContactFormData } from '@/lib/types';

/** Otovo-assigned UTM source and campaign for Strømsjef.no (Norway). */
export const OTOVO_UTM_DEFAULT_NO = 'Strømsjef_no_PV';

export type OtovoInterestInput = ContactFormData & {
  ref?: string;
  campaignCode?: string;
  postalCode?: string;
};

export type OtovoSendResult =
  | { status: 'skipped'; reason: string }
  | { status: 'success' }
  | { status: 'failed'; reason: string; stage: 'config' | 'validate' | 'invalid' | 'create' | 'network' };

export function parseYearlyConsumptionKwh(raw?: string | null): number | null {
  if (!raw) return null;
  const digitsOnly = raw.replace(/[^\d]/g, '');
  if (!digitsOnly) return null;
  const value = Number(digitsOnly);
  if (!Number.isFinite(value) || value <= 0) return null;
  return value;
}

export function buildOtovoInterestPayload(
  data: OtovoInterestInput,
  utm: { source: string; campaign: string }
): Record<string, unknown> {
  const addressParts: string[] = [];
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

  const body: Record<string, unknown> = {
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

type FetchFn = typeof fetch;

export async function sendOtovoInterest(
  data: OtovoInterestInput,
  options: {
    apiToken?: string;
    apiBaseUrl: string;
    utmSource?: string;
    utmCampaign: string;
    fetchImpl?: FetchFn;
  }
): Promise<OtovoSendResult> {
  const { apiToken, apiBaseUrl, utmSource, utmCampaign, fetchImpl = fetch } = options;

  if (!apiToken) {
    return { status: 'skipped', reason: 'OTOVO_API_TOKEN not configured' };
  }
  const source = utmSource?.trim() || OTOVO_UTM_DEFAULT_NO;
  const campaign = utmCampaign?.trim() || OTOVO_UTM_DEFAULT_NO;

  const body = buildOtovoInterestPayload(data, {
    source,
    campaign,
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

    const validateJson = (await validateRes.json()) as {
      is_valid?: boolean;
      result?: unknown;
      message?: string;
    };

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
    const message = error instanceof Error ? error.message : String(error);
    return { status: 'failed', stage: 'network', reason: message };
  }
}
