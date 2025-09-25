export async function scheduled(controller: any, env: any, ctx: any) {
  const base = (env && env.CRON_TARGET_BASE_URL) || 'https://www.elchef.se';
  const targets = ['/api/reminders/send', '/api/update-prices'];
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


