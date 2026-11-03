"use client";

import { useState } from 'react';
import { adminFetch } from '@/lib/adminClient';

export default function SeedPlans() {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const run = async () => {
    setRunning(true);
    setResult(null);
    try {
      const res = await adminFetch('/api/admin/electricity-plans/seed', { method: 'POST' });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Seed misslyckades');
      }
      const json = await res.json();
      setResult(`Importerad ${json.count ?? '?'} planer`);
    } catch (e) {
      setResult('Fel: ' + (e as Error).message);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <button onClick={run} disabled={running}>{running ? 'Importerar…' : 'Importera mock-planer'}</button>
      {result && <div style={{ marginTop: 8 }}>{result}</div>}
    </div>
  );
}
