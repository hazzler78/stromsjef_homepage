const STOCKHOLM = 'Europe/Stockholm';

/** Calendar date YYYY-MM-DD in Europe/Stockholm for an instant. */
export function toStockholmDateString(instant: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: STOCKHOLM }).format(instant);
}

export function addStockholmDays(ymd: string, delta: number): string {
  const [y, m, d] = ymd.split('-').map(Number);
  const utc = new Date(Date.UTC(y, m - 1, d + delta, 12, 0, 0));
  return toStockholmDateString(utc);
}

/** Inclusive list of Stockholm calendar dates from `from` through `to`. */
export function stockholmDateRange(from: string, to: string): string[] {
  const out: string[] = [];
  let cur = from;
  while (cur <= to) {
    out.push(cur);
    if (cur === to) break;
    cur = addStockholmDays(cur, 1);
  }
  return out;
}

type StockholmParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
};

function stockholmParts(instant: Date): StockholmParts {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: STOCKHOLM,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(instant);
  const pick = (type: string) =>
    Number(parts.find((p) => p.type === type)?.value ?? '0');
  return {
    year: pick('year'),
    month: pick('month'),
    day: pick('day'),
    hour: pick('hour'),
    minute: pick('minute'),
    second: pick('second'),
  };
}

/** UTC bounds for one Stockholm calendar day (for external APIs). */
export function stockholmDayIsoBounds(ymd: string): { after: string; before: string } {
  const [wantY, wantM, wantD] = ymd.split('-').map(Number);
  let startMs = Date.UTC(wantY, wantM - 1, wantD, 0, 0, 0) - 3 * 60 * 60 * 1000;
  for (let i = 0; i < 96; i++) {
    const p = stockholmParts(new Date(startMs));
    if (
      p.year === wantY &&
      p.month === wantM &&
      p.day === wantD &&
      p.hour === 0 &&
      p.minute === 0
    ) {
      break;
    }
    startMs += 15 * 60 * 1000;
  }
  const endMs = startMs + 24 * 60 * 60 * 1000 - 1;
  return {
    after: new Date(startMs).toISOString(),
    before: new Date(endMs).toISOString(),
  };
}

export function defaultVisitorsPerSaleRange(): { from: string; to: string } {
  const to = toStockholmDateString();
  const from = addStockholmDays(to, -29);
  return { from, to };
}