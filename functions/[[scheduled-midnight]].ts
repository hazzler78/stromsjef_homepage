// Midnight cron job for Forbrukerrådet price updates
// Runs at 00:05 every day to fetch latest prices after they're updated

export async function scheduled(controller: any, env: any, ctx: any) {
  const base = (env && env.CRON_TARGET_BASE_URL) || 'https://www.stromsjef.no';
  
  console.log('🌙 Running midnight price update...');
  
  // Wait 5 minutes after midnight to ensure prices are updated
  await new Promise(resolve => setTimeout(resolve, 5 * 60 * 1000));
  
  const targets = [
    '/api/update-prices',           // Existing price update
    '/api/prices-forbruk-update'    // Forbrukerrådet price update
  ];
  
  const results = await Promise.allSettled(
    targets.map(async (path) => {
      try {
        const response = await fetch(base + path, {
          method: 'POST',
          headers: env?.UPDATE_SECRET_KEY
            ? { Authorization: `Bearer ${env.UPDATE_SECRET_KEY}` }
            : undefined,
        });
        
        if (response.ok) {
          console.log(`✅ ${path} completed successfully`);
        } else {
          console.error(`❌ ${path} failed:`, response.status, response.statusText);
        }
        
        return { path, status: response.status, ok: response.ok };
      } catch (error) {
        console.error(`❌ ${path} error:`, error);
        return { path, error: error instanceof Error ? error.message : 'Unknown error' };
      }
    })
  );
  
  console.log('🌙 Midnight price update completed:', results);
}

export default { scheduled };
