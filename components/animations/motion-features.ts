// Layout projection needs domMax; load it after hydration rather than in the
// initial animation-wrapper chunk. This also includes viewport and gestures.
import { domMax } from 'framer-motion';

// Until this feature chunk succeeds, CSS keeps server-rendered content visible.
// Module evaluation can also happen on the server, where no document exists.
if (typeof document !== 'undefined') document.documentElement.dataset.motionReady = 'true';

export default domMax;
