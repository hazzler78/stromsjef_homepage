import { NextResponse } from 'next/server';

// Read-only test endpoint for Forbrukerrådets strømprisportal.
// Uses client-credentials to obtain an access token, then fetches offers.
// No persistence. Intended for verification before integrating with DB.

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const requestedPath = url.searchParams.get('path') || undefined; // e.g. /feeds/prices or /feeds/agreements
    const debug = url.searchParams.get('debug') === '1';
    const overrideAuthUrl = url.searchParams.get('auth') || undefined; // optional: override token endpoint
    const overrideBaseUrl = url.searchParams.get('base') || undefined; // optional: override base API URL
    const overrideScope = url.searchParams.get('scope') || undefined; // optional: override scope
    const overrideTokenMode = (url.searchParams.get('mode') || '').toLowerCase() as 'form' | 'basic' | 'none' | '';
    const overrideAccept = url.searchParams.get('accept') || undefined; // optional: override Accept header

    const baseUrl = overrideBaseUrl || process.env.FORBRUK_BASE_URL || 'https://strom-api.forbrukerradet.no';
    const authUrl = overrideAuthUrl || process.env.FORBRUK_AUTH_URL || `${baseUrl}/oauth/token`;
    const clientId = process.env.FORBRUK_CLIENT_ID;
    const clientSecret = process.env.FORBRUK_CLIENT_SECRET;
    const scope = overrideScope || process.env.FORBRUK_SCOPE; // optional
    const tokenAuthMode = (overrideTokenMode || process.env.FORBRUK_TOKEN_AUTH || 'form').toLowerCase(); // 'form' | 'basic' | 'none'

    // If a path is provided, target baseUrl + path; otherwise use explicit offers URL from env.
    const offersUrl = requestedPath
      ? `${baseUrl}${requestedPath.startsWith('/') ? requestedPath : `/${requestedPath}`}`
      : process.env.FORBRUK_OFFERS_URL;

    const noAuth = tokenAuthMode === 'none' || url.searchParams.get('noauth') === '1' || process.env.FORBRUK_NO_AUTH === '1';

    if (noAuth) {
      if (!offersUrl) {
        return NextResponse.json(
          {
            error: 'Missing feed path/URL for no-auth mode',
            hint: 'Provide ?path=/feeds/... or FORBRUK_OFFERS_URL',
          },
          { status: 400 }
        );
      }
      const resp = await fetch(offersUrl, { headers: { Accept: overrideAccept || 'application/json', 'User-Agent': 'stromsjef-prices/1.0' }, cache: 'no-store' });
      const text = await resp.text();
      let parsed: unknown;
      try { parsed = JSON.parse(text); } catch { parsed = { raw: text }; }
      if (!resp.ok) {
        return NextResponse.json({ error: 'Feed request failed (no-auth mode)', status: resp.status, body: debug ? parsed : undefined, target: offersUrl }, { status: 502 });
      }
      return NextResponse.json({ success: true, timestamp: new Date().toISOString(), target: offersUrl, data: parsed, debug: debug ? { baseUrl, requestedPath: requestedPath || null, tokenAuthMode: 'none', accept: overrideAccept || 'application/json' } : undefined });
    }

    if (!authUrl || !clientId || !clientSecret || !offersUrl) {
      return NextResponse.json(
        {
          error: 'Missing configuration',
          requiredEnv: ['FORBRUK_BASE_URL (optional, defaults)', 'FORBRUK_AUTH_URL (optional, defaults)', 'FORBRUK_CLIENT_ID', 'FORBRUK_CLIENT_SECRET', 'FORBRUK_OFFERS_URL (or provide ?path=/feeds/...)'],
          received: {
            baseUrl,
            authUrl,
            hasClientId: Boolean(clientId),
            hasClientSecret: Boolean(clientSecret),
            offersUrl,
            overrides: {
              overrideBaseUrl: Boolean(overrideBaseUrl),
              overrideAuthUrl: Boolean(overrideAuthUrl),
              overrideScope: Boolean(overrideScope),
              overrideTokenMode: overrideTokenMode || null,
            },
          },
        },
        { status: 500 }
      );
    }

    // 1) Get access token via client-credentials
    const formBody = new URLSearchParams(
      Object.fromEntries(
        Object.entries({
          grant_type: 'client_credentials',
          client_id: tokenAuthMode === 'form' ? clientId : undefined,
          client_secret: tokenAuthMode === 'form' ? clientSecret : undefined,
          scope,
        }).filter((entry) => entry[1])
      )
    );

    const basicAuthHeader = `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`;

    async function requestTokenOnce(endpoint: string) {
      return fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          ...(tokenAuthMode === 'basic' ? { Authorization: basicAuthHeader } : {}),
          'User-Agent': 'stromsjef-prices/1.0',
        },
        body: formBody,
        cache: 'no-store',
      });
    }

    let tokenResponse = await requestTokenOnce(authUrl);
    // Fallback: try /connect/token if first attempt fails and we used default-ish path
    if (!tokenResponse.ok && (!process.env.FORBRUK_AUTH_URL || debug)) {
      const fallbackAuthUrl = `${baseUrl}/connect/token`;
      const second = await requestTokenOnce(fallbackAuthUrl);
      if (second.ok) {
        tokenResponse = second;
      } else if (debug) {
        // Include both attempts in debug
        const [firstText, secondText] = await Promise.all([
          tokenResponse.text().catch(() => ''),
          second.text().catch(() => ''),
        ]);
        return NextResponse.json(
          {
            error: 'Failed to obtain access token (both endpoints)',
            attempts: [
              { endpoint: authUrl, status: tokenResponse.status, body: firstText },
              { endpoint: fallbackAuthUrl, status: second.status, body: secondText },
            ],
          },
          { status: 502 }
        );
      }
    }

    if (!tokenResponse.ok) {
      const text = await tokenResponse.text().catch(() => '');
      return NextResponse.json(
        {
          error: 'Failed to obtain access token',
          status: tokenResponse.status,
          body: debug ? text : undefined,
          hint: debug
            ? {
                authUrl,
                tokenAuthMode,
                hasClientId: Boolean(clientId),
                hasClientSecret: Boolean(clientSecret),
                usedScope: scope,
              }
            : undefined,
        },
        { status: 502 }
      );
    }

    const tokenJson = (await tokenResponse.json()) as { access_token?: string; token_type?: string; expires_in?: number };
    const accessToken = tokenJson.access_token;

    if (!accessToken) {
      return NextResponse.json(
        {
          error: 'No access_token in token response',
          tokenKeys: Object.keys(tokenJson || {}),
        },
        { status: 502 }
      );
    }

    // 2) Call offers endpoint with the bearer token
    const offersResponse = await fetch(offersUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: overrideAccept || 'application/json',
        'User-Agent': 'stromsjef-prices/1.0',
      },
      // We want fresh data for verification
      cache: 'no-store',
    });

    const rawText = await offersResponse.text();
    let parsed: unknown;
    try {
      parsed = JSON.parse(rawText);
    } catch {
      parsed = { raw: rawText };
    }

    if (!offersResponse.ok) {
      return NextResponse.json(
        {
          error: 'Offers request failed',
          status: offersResponse.status,
          body: debug ? parsed : undefined,
          hint: debug
            ? {
                baseUrl,
                target: offersUrl,
                requestedPath: requestedPath || null,
              }
            : undefined,
        },
        { status: 502 }
      );
    }

    // Return raw data so we can inspect structure before mapping
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      target: offersUrl,
      data: parsed,
      debug: debug
        ? {
            baseUrl,
            authUrl,
            tokenAuthMode,
            requestedPath: requestedPath || null,
            overrides: {
              overrideBaseUrl: Boolean(overrideBaseUrl),
              overrideAuthUrl: Boolean(overrideAuthUrl),
              overrideScope: Boolean(overrideScope),
              overrideTokenMode: overrideTokenMode || null,
            },
          }
        : undefined,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Unexpected error while fetching Forbrukerrådet prices',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export const runtime = 'edge';


