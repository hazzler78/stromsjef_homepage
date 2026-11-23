/** Default TikTok Pixel (Strømsjef pixel). Override with NEXT_PUBLIC_TIKTOK_PIXEL_ID at build. */
export const DEFAULT_TIKTOK_PIXEL_ID = 'D4K2J7BC77U4IAHDMR40';

export function getTikTokPixelId(): string {
  const fromEnv = process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID?.trim();
  return fromEnv || DEFAULT_TIKTOK_PIXEL_ID;
}