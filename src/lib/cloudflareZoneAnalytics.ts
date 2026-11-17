export type CfDailyVisitors = {
  date: string;
  uniques: number;
  pageViews: number;
};

const CF_GRAPHQL = 'https://api.cloudflare.com/client/v4/graphql';

const HTTP_REQUESTS_1D_QUERY = `
  query ZoneDailyHttp($zoneTag: string!, $since: Date!, $until: Date!) {
    viewer {
      zones(filter: { zoneTag: $zoneTag }) {
        httpRequests1dGroups(
          limit: 10000
          filter: { date_geq: $since, date_leq: $until }
          orderBy: [date_ASC]
        ) {
          dimensions {
            date
          }
          sum {
            pageViews
          }
          uniq {
            uniques
          }
        }
      }
    }
  }
`;

export async function fetchCloudflareDailyVisitors(
  from: string,
  to: string
): Promise<{ rows: CfDailyVisitors[]; configured: boolean; error?: string }> {
  const token = process.env.CF_ANALYTICS_API_TOKEN?.trim();
  const zoneId = process.env.CF_ZONE_ID?.trim();
  if (!token || !zoneId) {
    return { rows: [], configured: false };
  }

  try {
    const res = await fetch(CF_GRAPHQL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: HTTP_REQUESTS_1D_QUERY,
        variables: {
          zoneTag: zoneId,
          since: from,
          until: to,
        },
      }),
    });

    const json = (await res.json()) as {
      errors?: { message: string }[];
      data?: {
        viewer?: {
          zones?: {
            httpRequests1dGroups?: {
              dimensions: { date: string };
              sum: { pageViews: number };
              uniq: { uniques: number };
            }[];
          }[];
        };
      };
    };

    if (!res.ok || json.errors?.length) {
      const msg = json.errors?.map((e) => e.message).join('; ') || res.statusText;
      return { rows: [], configured: true, error: msg };
    }

    const groups = json.data?.viewer?.zones?.[0]?.httpRequests1dGroups ?? [];
    const rows = groups.map((g) => ({
      date: g.dimensions.date,
      uniques: g.uniq.uniques ?? 0,
      pageViews: g.sum.pageViews ?? 0,
    }));

    return { rows, configured: true };
  } catch (err) {
    return {
      rows: [],
      configured: true,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}