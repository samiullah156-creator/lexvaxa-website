'use client';

import Image, { type ImageLoader, type ImageProps } from 'next/image';
import { cdn, isCloudinaryImage, isRemoteImage } from '@/lib/image-source';

const cloudinaryLoader: ImageLoader = ({ src, width }) => cdn(src, width);

/**
 * A CMS picture. Cloudinary images get a full srcset (each width resized and cached on Cloudinary's CDN),
 * so a phone downloads a small file and a retina screen a sharp one. Other remote images are shown as
 * stored; files from /public go through the Next.js optimizer.
 */
export function CdnImage({ src, ...props }: Omit<ImageProps, 'src' | 'loader' | 'unoptimized'> & { src: string }) {
  if (isCloudinaryImage(src)) return <Image src={src} loader={cloudinaryLoader} {...props} />;
  return <Image src={src} unoptimized={isRemoteImage(src)} {...props} />;
}
