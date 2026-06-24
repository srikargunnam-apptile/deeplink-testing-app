// LiveLayer — pulls per-environment "live" config from a remote manifest
// and exposes a getIn-style hook. Two-arg category fallback chain:
//   [c1, c2] → [c1, "default"] → ["default", "default"]
//
// Cold-launch budget caps the initial manifest fetch so app boot doesn't
// stall on a slow CDN; on timeout we fall through with an empty manifest
// and useLiveLayer returns undefined (callers handle their own defaults).
//
// No external deps beyond React.
import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

type Cats = [string, string]; // [cat1, cat2]
type Manifest = Record<string, string>; // url → updatedAt
type ConfigBody = Record<string, unknown>;

interface LiveLayerContextValue {
  cache: Map<string, ConfigBody>;
  manifest: Manifest | null;
  endpoint: string;
  codePushId: string;
}

const Ctx = createContext<LiveLayerContextValue | null>(null);

interface LiveLayerProviderProps {
  /** Base URL of the live-layer CDN/origin — auto-derived per env. */
  endpoint: string;
  /** Current CodePush bundle id — auto-derived per env. */
  codePushId: string;
  children: ReactNode;
  /** Hard cap on the cold-launch manifest fetch. */
  coldLaunchBudgetMs?: number;
  /** Refresh the manifest if app resumes after this many ms in background. */
  resumeRefreshAfterMs?: number;
}

export function LiveLayerProvider({
  endpoint,
  codePushId,
  children,
  coldLaunchBudgetMs = 800,
  // resumeRefreshAfterMs reserved for a future AppState listener; the
  // prop is accepted now so callers can wire it without a breaking change
  // later.
  resumeRefreshAfterMs: _resumeRefreshAfterMs = 300000,
}: LiveLayerProviderProps) {
  const [manifest, setManifest] = useState<Manifest | null>(null);
  const [cache] = useState<Map<string, ConfigBody>>(new Map());

  useEffect(() => {
    const ctrl = new AbortController();
    const timeout = setTimeout(() => ctrl.abort(), coldLaunchBudgetMs);
    fetch(`${endpoint}/${codePushId}/manifest.json`, { signal: ctrl.signal })
      .then((r) => r.json())
      .then(setManifest)
      .catch(() => setManifest({}))
      .finally(() => clearTimeout(timeout));
    return () => {
      clearTimeout(timeout);
      ctrl.abort();
    };
  }, [endpoint, codePushId, coldLaunchBudgetMs]);

  return (
    <Ctx.Provider value={{ cache, manifest, endpoint, codePushId }}>
      {children}
    </Ctx.Provider>
  );
}

/**
 * Read a value from the live-layer config at `getIn` path, with a
 * category fallback chain so partial environments still resolve:
 *
 *   [cat1, cat2] → [cat1, "default"] → ["default", "default"]
 *
 * Returns undefined while the manifest is loading or when nothing in
 * the fallback chain has a value at the path. Callers decide what to do
 * with `undefined` (usually: render a hardcoded default).
 */
export function useLiveLayer<T = unknown>(
  cats: Cats,
  getIn: string[]
): T | undefined {
  const ctx = useContext(Ctx);
  const [, force] = useState(0);
  if (!ctx || !ctx.manifest) return undefined;

  const tries: Cats[] = [
    [cats[0], cats[1]],
    [cats[0], "default"],
    ["default", "default"],
  ];

  for (const [c1, c2] of tries) {
    const url = Object.keys(ctx.manifest).find(
      (u) =>
        u.endsWith(`/${c1}/${c2}/config-`) ||
        u.includes(`/${c1}/${c2}/config-`)
    );
    if (!url) continue;
    const body = ctx.cache.get(url);
    if (!body) {
      // First touch — kick off a fetch and force a re-render when it
      // lands. Subsequent renders read from the cache.
      fetch(url)
        .then((r) => r.json())
        .then((b) => {
          ctx.cache.set(url, b);
          force((n) => n + 1);
        })
        .catch(() => {
          /* swallow — fallback chain handles missing data */
        });
      continue;
    }
    let n: unknown = body;
    for (const p of getIn) {
      if (n == null) break;
      n = (n as Record<string, unknown>)[p];
    }
    if (n !== undefined) return n as T;
  }
  return undefined;
}
