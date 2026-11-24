import { IndustryIso, hasIndustryScene } from '@/components/depth/industry-iso';

/**
 * The industry's object (scales, truck, servers, shopping bag, medical cross, briefcase, house,
 * books and cap, finance chart, design tablet) as a crisp isometric vector scene. Decorative; the
 * page text carries the meaning. `id` and `running` are kept for the existing call sites.
 */
export function IndustryScene({ slug, running = true }: { slug: string; id?: string; running?: boolean }) {
  if (!hasIndustryScene(slug)) return null;
  return <IndustryIso slug={slug} still={!running} />;
}
