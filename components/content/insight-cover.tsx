import Image from 'next/image';
import { srcSet } from '@/lib/cms';
import type { InsightCard } from '@/lib/data/insights';

/**
 * Cover for an insight card. Built-in guides use their SVG cover; admin posts use the uploaded
 * image in the smallest size that fits (`sizes` tells the browser how wide the slot is).
 * A post without a cover shows its category on a plain brand tile.
 */
export function InsightCover({ cover, label, className, sizes, priority = false }: { cover: InsightCard['cover']; label: string; className?: string; sizes: string; priority?: boolean }) {
  if (!cover) return <span className="insight-cover-blank" aria-hidden="true"><i />{label}</span>;
  if (cover.kind === 'guide') return <Image src={cover.src} alt={cover.alt} width={cover.width} height={cover.height} unoptimized className={className} preload={priority} />;
  const { image } = cover;
  return (
    // Uploaded images are already resized to WebP by the backend, so the plain element is the fastest path.
    // eslint-disable-next-line @next/next/no-img-element
    <img src={image.variants[Math.min(1, image.variants.length - 1)].url} srcSet={srcSet(image)} sizes={sizes} width={image.width} height={image.height}
      alt={image.alt} loading={priority ? 'eager' : 'lazy'} fetchPriority={priority ? 'high' : undefined} decoding="async" className={className} style={{ backgroundColor: image.color, objectFit: 'cover' }} />
  );
}
