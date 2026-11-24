/** True for images served from another host (the CMS or Cloudinary). They are already resized WebP, so the optimizer is skipped. */
export const isRemoteImage = (src: string) => src.startsWith('https://') || src.startsWith('http://');

/** True for images stored on Cloudinary, which can be resized on request. */
export const isCloudinaryImage = (src: string) => src.startsWith('https://res.cloudinary.com/') && src.includes('/image/upload/');

/**
 * A Cloudinary image at the width it is shown, in the best format the browser accepts (AVIF/WebP)
 * and automatic quality. Never enlarged past the stored size (c_limit). Other sources are returned
 * unchanged. Cloudinary caches each size on its CDN.
 */
export function cdn(src: string, width: number) {
  const marker = '/image/upload/';
  if (!isCloudinaryImage(src)) return src;
  return src.replace(marker, `${marker}f_auto,q_auto,c_limit,w_${Math.round(width)}/`);
}
