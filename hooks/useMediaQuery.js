// hooks/useMediaQuery.js
// Subscribes to a CSS media query. Returns false on the server and before
// mount (and where matchMedia is missing, e.g. jsdom), so desktop markup
// renders first and mobile markup swaps in after hydration.

import { useEffect, useState } from 'react';

export function useMediaQuery(query) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined;
    const mql = window.matchMedia(query);
    const update = () => setMatches(mql.matches);
    update();
    mql.addEventListener('change', update);
    return () => mql.removeEventListener('change', update);
  }, [query]);

  return matches;
}

/** Below Tailwind's `md` breakpoint (768px) — tables become cards, modals full-screen. */
export const useIsMobile = () => useMediaQuery('(max-width: 767px)');

export default useMediaQuery;
