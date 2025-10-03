export async function scheduled(controller: any, env: any, ctx: any) {
  const base = (env && env.CRON_TARGET_BASE_URL) || 'https://www.stromsjef.no';
  const targets = ['/api/reminders/send', '/api/update-prices', '/api/prices-forbruk-update'];
  await Promise.all(
    targets.map((path) =>
      fetch(base + path, {
        method: 'POST',
        headers: env?.UPDATE_SECRET_KEY
          ? { Authorization: `Bearer ${env.UPDATE_SECRET_KEY}` }
          : undefined,
      }).catch(() => null)
    )
  );
}

export default { scheduled };


