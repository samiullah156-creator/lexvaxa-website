import { services } from './services';
import { serviceExtensions } from './service-extensions';
import { SERVICE_SYSTEMS } from './service-systems';
import type { MapService } from '@/components/depth/service-map-3d';

/** The minimum each 3D map block needs; keeps full service records out of client bundles. */
export const mapServices: MapService[] = services.map((service) => ({
  slug: service.slug,
  name: service.name,
  token: SERVICE_SYSTEMS[service.slug].token,
  related: serviceExtensions[service.slug].related,
}));
