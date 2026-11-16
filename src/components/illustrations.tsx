/**
 * Pixel-art scenes built from the sprites in ./pixel. All original artwork, drawn in code,
 * so it themes with light/dark mode, stays sharp at any size and works offline.
 * Motion uses stepped CSS animations (see styles/index.css) and switches off for people
 * who prefer reduced motion.
 */
import type { SVGProps } from 'react';
import { BRIEFCASE, CALENDAR, CASTLE, CHAT, CHEST, CLOUD, COIN, FLAG, GLASS, HERO_A, HERO_B, LAPTOP, MOUNTAIN, PHONE, Pixels, SCROLL, SIGNPOST, STAR, TREE, type Art } from './pixel';

type P = SVGProps<SVGSVGElement> & { title?: string };

function Scene({ title, children, className, ...rest }: P & { children: React.ReactNode }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      shapeRendering="crispEdges"
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      className={['ill', className].filter(Boolean).join(' ')}
      {...rest}
    >
      {title && <title>{title}</title>}
      {children}
    </svg>
  );
}

const reducedMotion = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

export const WORLDS = [
  { n: 1, name: 'Foundations', weeks: [1, 4], top: 'var(--c-lavender)', side: '#8f78f0' },
  { n: 2, name: 'Data, tech, UX', weeks: [5, 8], top: 'var(--c-sky)', side: '#4a95e0' },
  { n: 3, name: 'AI PM', weeks: [9, 11], top: 'var(--c-mint)', side: '#3fb57a' },
  { n: 4, name: 'Get hired', weeks: [12, 15], top: 'var(--c-peach)', side: '#e7804a' },
] as const;

const PATH_X0 = 14;
const PATH_X1 = 166;
/** x position on the path for a week number (1–15). */
export const weekX = (week: number) => PATH_X0 + ((Math.min(Math.max(week, 1), 15) - 1) / 14) * (PATH_X1 - PATH_X0);

// Discrete steps make the walk move in whole pixels, like a real sprite.
function stepTimes(n: number) {
  return Array.from({ length: n + 1 }, (_, i) => (i / n).toFixed(4)).join(';');
}
function stepValues(x0: number, x1: number, y: number, n: number) {
  return Array.from({ length: n + 1 }, (_, i) => `${Math.round(x0 + ((x1 - x0) * i) / n)} ${y}`).join(';');
}

/**
 * The PM Path world map: four worlds (one per phase) on a path from the start flag to the
 * Offer castle. The adventurer walks from the start to `heroWeek` once, then stops.
 */
export function WorldMap({ heroWeek = 15, animate = true, labels = true, ...props }: P & { heroWeek?: number; animate?: boolean; labels?: boolean }) {
  const walk = animate && !reducedMotion();
  const GROUND = 70;
  const y = GROUND - 14;
  const target = Math.round(weekX(heroWeek) - 6);
  const start = 2;
  const steps = Math.max(6, Math.round((target - start) / 2));
  const dur = Math.max(2, steps * 0.18);
  return (
    <Scene viewBox="0 16 202 82" {...props}>
      {/* sky: clouds and mountains */}
      <Pixels art={CLOUD} x={24} y={22} className="ill-drift" />
      <Pixels art={CLOUD} x={112} y={19} className="ill-drift" style={{ animationDelay: '-7s' }} />
      <Pixels art={MOUNTAIN} x={56} y={GROUND - 8} />
      <Pixels art={MOUNTAIN} x={66} y={GROUND - 8} />
      <Pixels art={MOUNTAIN} x={126} y={GROUND - 8} />

      {/* the four worlds as ground platforms */}
      <rect x={1} y={GROUND} width={8} height={4} fill="var(--c-butter)" />
      <rect x={1} y={GROUND + 4} width={8} height={10} fill="#e7a92a" />
      {WORLDS.map((w) => {
        const x0 = Math.round(weekX(w.weeks[0]) - 5);
        const x1 = w.n === 4 ? 201 : Math.round(weekX(w.weeks[1] + 1) - 5);
        return (
          <g key={w.n}>
            <rect x={x0} y={GROUND} width={x1 - x0} height={4} fill={w.top} />
            <rect x={x0} y={GROUND + 4} width={x1 - x0} height={10} fill={w.side} />
            {Array.from({ length: Math.floor((x1 - x0) / 7) }, (_, i) => (
              <rect key={i} x={x0 + 2 + i * 7} y={GROUND + 7 + (i % 2) * 3} width={3} height={1} fill="#1d1a33" opacity={0.28} />
            ))}
            {labels && (
              <text x={x0 + 1} y={GROUND + 23} className="map-label" fontFamily="'Pixelify Sans', sans-serif" fontSize="5" fontWeight="600" fill="var(--c-ink)">
                {w.n}. {w.name}
              </text>
            )}
          </g>
        );
      })}
      <rect x={1} y={GROUND - 1} width={200} height={1} fill="#1d1a33" />
      <rect x={1} y={GROUND + 4} width={200} height={1} fill="#1d1a33" opacity={0.4} />
      <rect x={1} y={GROUND + 14} width={200} height={1} fill="#1d1a33" />
      <rect x={0} y={GROUND} width={1} height={14} fill="#1d1a33" />
      <rect x={201} y={GROUND} width={1} height={14} fill="#1d1a33" />

      {/* path stones, one per week; done weeks are dark */}
      {Array.from({ length: 15 }, (_, i) => (
        <rect key={i} x={Math.round(weekX(i + 1)) - 1} y={GROUND + 1} width={3} height={2} fill="#1d1a33" opacity={i + 1 <= heroWeek ? 0.85 : 0.25} />
      ))}

      <Pixels art={TREE} x={40} y={GROUND - 10} />
      <Pixels art={TREE} x={102} y={GROUND - 10} />
      <Pixels art={TREE} x={150} y={GROUND - 10} />

      {[30, 84, 120, 147].map((x, i) => (
        <Pixels key={x} art={COIN} x={x} y={40 + (i % 2) * 5} className="ill-blink" style={{ animationDelay: `${i * 300}ms` }} />
      ))}

      <Pixels art={FLAG} x={2} y={GROUND - 12} />

      {/* the Offer castle with its banner */}
      <Pixels art={CASTLE} x={178} y={GROUND - 12} />
      <g>
        <rect x={174} y={GROUND - 27} width={27} height={9} fill="var(--c-butter)" />
        <rect x={174} y={GROUND - 28} width={27} height={1} fill="#1d1a33" />
        <rect x={174} y={GROUND - 18} width={27} height={1} fill="#1d1a33" />
        <rect x={173} y={GROUND - 27} width={1} height={9} fill="#1d1a33" />
        <rect x={201} y={GROUND - 27} width={1} height={9} fill="#1d1a33" />
        <text x={187.5} y={GROUND - 20.4} textAnchor="middle" fontFamily="'Pixelify Sans', sans-serif" fontSize="6" fontWeight="700" fill="#1d1a33">
          Offer
        </text>
      </g>
      <Pixels art={STAR} x={168} y={GROUND - 34} className="ill-blink" />
      <Pixels art={STAR} x={195} y={GROUND - 37} className="ill-blink" style={{ animationDelay: '500ms' }} />

      {/* the adventurer */}
      <g transform={`translate(${walk ? start : target} ${y})`}>
        {walk && <animateTransform attributeName="transform" type="translate" dur={`${dur}s`} begin="0.5s" fill="freeze" calcMode="discrete" keyTimes={stepTimes(steps)} values={stepValues(start, target, y, steps)} />}
        <g className={walk ? 'walking' : undefined} style={walk ? ({ '--walk-n': Math.max(1, Math.round(dur / 0.3)) } as React.CSSProperties) : undefined}>
          <Pixels art={HERO_A} className="frame-a" />
          {walk && <Pixels art={HERO_B} className="frame-b" />}
        </g>
      </g>
    </Scene>
  );
}

/** Hero section art for the landing page. */
export function HeroIllustration(props: P & { heroWeek?: number }) {
  return <WorldMap {...props} />;
}

/** The roadmap's compact map, with the adventurer standing on the current week. */
export function PhasePathIllustration({ heroWeek = 1, ...props }: P & { heroWeek?: number }) {
  return <WorldMap heroWeek={heroWeek} animate={false} {...props} />;
}

/** A laptop and a phone kept in step through the cloud. */
export function SyncIllustration(props: P) {
  return (
    <Scene viewBox="0 0 72 36" {...props}>
      <Pixels art={LAPTOP} x={2} y={22} />
      <Pixels art={PHONE} x={60} y={20} />
      <g className="ill-bob">
        <Pixels art={CLOUD} x={28} y={2} />
        <rect x={33} y={6} width={1} height={1} fill="#3fb57a" />
        <rect x={34} y={7} width={1} height={1} fill="#3fb57a" />
        <rect x={35} y={6} width={1} height={1} fill="#3fb57a" />
        <rect x={36} y={5} width={1} height={1} fill="#3fb57a" />
        <rect x={37} y={4} width={1} height={1} fill="#3fb57a" />
      </g>
      {[0, 1, 2].map((i) => (
        <rect key={`l${i}`} x={14 + i * 5} y={18 - i * 3} width={2} height={2} fill="var(--c-line)" className="ill-blink" style={{ animationDelay: `${i * 200}ms` }} />
      ))}
      {[0, 1, 2].map((i) => (
        <rect key={`r${i}`} x={48 + i * 5} y={10 + i * 3} width={2} height={2} fill="var(--c-line)" className="ill-blink" style={{ animationDelay: `${600 + i * 200}ms` }} />
      ))}
    </Scene>
  );
}

const EMPTY: Record<string, Art> = { board: BRIEFCASE, chat: CHAT, notebook: SCROLL, calendar: CALENDAR, search: GLASS, folder: CHEST };
type EmptyKind = 'board' | 'chat' | 'notebook' | 'calendar' | 'search' | 'folder';

/** A single sprite with a pixel shadow, for empty states. */
export function EmptyIllustration({ kind, ...props }: P & { kind: EmptyKind }) {
  const art = EMPTY[kind];
  const w = Math.max(...art.map((r) => r.length));
  const W = w + 8;
  const H = art.length + 6;
  return (
    <Scene viewBox={`0 0 ${W} ${H}`} width={W * 5} height={H * 5} {...props}>
      <rect x={5} y={art.length + 3} width={w - 2} height={2} fill="var(--c-line)" opacity={0.15} />
      <g className="ill-bob">
        <Pixels art={art} x={4} y={1} />
      </g>
    </Scene>
  );
}

/** The adventurer at a signpost, for the 404 page. */
export function LostIllustration(props: P) {
  return (
    <Scene viewBox="0 0 46 28" {...props}>
      <rect x={0} y={26} width={46} height={1} fill="var(--c-line)" opacity={0.25} />
      <Pixels art={SIGNPOST} x={3} y={10} />
      <g className="ill-bob">
        <Pixels art={HERO_A} x={27} y={12} />
      </g>
      <text x={36} y={9} fontFamily="'Pixelify Sans', sans-serif" fontSize="9" fontWeight="700" fill="var(--c-line)" className="ill-blink">
        ?
      </text>
    </Scene>
  );
}
