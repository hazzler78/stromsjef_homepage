/** Default Meta Pixel (Mikael dataset). Override with NEXT_PUBLIC_META_PIXEL_ID at build. */
export const DEFAULT_META_PIXEL_ID = '1552012742628310';

export function getMetaPixelId(): string {
  const fromEnv = process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim();
  return fromEnv || DEFAULT_META_PIXEL_ID;
}