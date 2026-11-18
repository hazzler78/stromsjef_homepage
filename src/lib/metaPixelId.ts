/** Default Meta Pixel (Stromsjef-data). Override with NEXT_PUBLIC_META_PIXEL_ID at build. */
export const DEFAULT_META_PIXEL_ID = '25319650941056197';

export function getMetaPixelId(): string {
  const fromEnv = process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim();
  return fromEnv || DEFAULT_META_PIXEL_ID;
}