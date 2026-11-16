/**
 * Pixel-art scenes built from the sprites in ./pixel. All original artwork, drawn in code,
 * so it themes with light/dark mode, stays sharp at any size and works offline.
 * Motion uses stepped CSS animations (see styles/index.css) and switches off for people
 * who prefer reduced motion.
 */
import { useId, type SVGProps } from 'react';
import {
  BIRD_A,
  BIRD_B,
  BRIEFCASE,
  CALENDAR,
  CASTLE,
  CHAT,
  CHEST,
  CLOUD,
  COIN,
  FLAG,
  GLASS,
  HERO_A,
  HERO_B,
  LAPTOP,
  MOUNTAIN,
  PENNANT_A,
  PENNANT_B,
  PET_A,
  PET_B,
  PHONE,
  Pixels,
  SCROLL,
  SIGNPOST,
  SPARK,
  STAR,
  TREE,
  type Art,
} from './pixel';

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

const COINS = [30, 84, 120, 147];
/** Draw a silhouette sprite in the theme's line colour, so it shows in light and dark mode. */
const INK_PAL = { k: 'var(--c-line)' };

/**
 * Builds the CSS for one map's animation. Everything is generated from the same timeline so
 * the walk, the pet, the coins and the castle stay in sync:
 *   - loop (new visitors): walk to the castle, step inside, sparkle, start again
 *   - no loop (returning visitors): walk once to the current week, then idle
 * Movement uses steps() so sprites move in whole pixels.
 */
function mapCss(id: string, o: { x0: number; x1: number; y: number; walk: number; loop: boolean }) {
  const { x0, x1, y, walk, loop } = o;
  const total = loop ? walk + 3.2 : walk;
  const pct = (sec: number) => +((sec / total) * 100).toFixed(2);
  const steps = Math.max(8, Math.round((x1 - x0) / 2));
  const wEnd = pct(walk);
  const kf: string[] = [];
  // the adventurer
  kf.push(`@keyframes ${id}-hero {
    0% { transform: translate(${x0}px, ${y}px); opacity: 1; animation-timing-function: steps(${steps}, end); }
    ${wEnd}% { transform: translate(${x1}px, ${y}px); opacity: 1; }
    ${
      loop
        ? `${pct(walk + 0.35)}% { transform: translate(${x1}px, ${y}px); opacity: 0; }
    ${pct(total - 0.3)}% { transform: translate(${x0}px, ${y}px); opacity: 0; }
    100% { transform: translate(${x0}px, ${y}px); opacity: 1; }`
        : `100% { transform: translate(${x1}px, ${y}px); opacity: 1; }`
    }
  }`);
  // the pet trails 13 pixels behind, a beat later
  const petLag = 0.25;
  kf.push(`@keyframes ${id}-pet {
    0% { transform: translate(${x0 - 13}px, ${y + 7}px); opacity: 1; animation-timing-function: steps(${steps}, end); }
    ${pct(Math.min(walk + petLag, total))}% { transform: translate(${x1 - (loop ? 2 : 13)}px, ${y + 7}px); opacity: 1; }
    ${
      loop
        ? `${pct(walk + petLag + 0.35)}% { transform: translate(${x1 - 2}px, ${y + 7}px); opacity: 0; }
    ${pct(total - 0.3)}% { transform: translate(${x0 - 13}px, ${y + 7}px); opacity: 0; }
    100% { transform: translate(${x0 - 13}px, ${y + 7}px); opacity: 1; }`
        : `100% { transform: translate(${x1 - 13}px, ${y + 7}px); opacity: 1; }`
    }
  }`);
  // coins are collected as the adventurer passes them
  COINS.forEach((cx, i) => {
    if (cx + 4 > x1 + 6) return;
    const t = ((cx - x0) / (x1 - x0)) * walk;
    const a = pct(t);
    const b = pct(t + 0.45);
    kf.push(`@keyframes ${id}-coin${i} {
      0%, ${a}% { transform: translateY(0); opacity: 1; }
      ${b}% { transform: translateY(-8px); opacity: 0; }
      ${loop ? `${pct(total - 0.4)}% { transform: translateY(0); opacity: 0; } 100% { transform: translateY(0); opacity: 1; }` : '100% { transform: translateY(-8px); opacity: 0; }'}
    }`);
  });
  // a sparkle burst over the castle when the adventurer steps inside
  if (loop) {
    kf.push(`@keyframes ${id}-burst {
      0%, ${pct(walk + 0.2)}% { opacity: 0; transform: translateY(0); }
      ${pct(walk + 0.5)}% { opacity: 1; transform: translateY(-3px); }
      ${pct(walk + 1.6)}% { opacity: 1; transform: translateY(-7px); }
      ${pct(walk + 2)}%, 100% { opacity: 0; transform: translateY(-9px); }
    }`);
  }
  const iter = loop ? 'infinite' : '1';
  const legsIter = loop ? 'infinite' : String(Math.max(1, Math.round(walk / 0.3)));
  return `
${kf.join('\n')}
.${id} .mv-hero { animation: ${id}-hero ${total}s 0.4s linear ${iter} both; }
.${id} .mv-pet { animation: ${id}-pet ${total}s 0.4s linear ${iter} both; }
.${id} .legs-a { animation: frame-a 0.3s 0.4s linear ${legsIter}; }
.${id} .legs-b { opacity: 0; animation: frame-b 0.3s 0.4s linear ${legsIter}; }
.${id} .pet-a { animation: frame-a 0.36s 0.4s linear ${legsIter}; }
.${id} .pet-b { opacity: 0; animation: frame-b 0.36s 0.4s linear ${legsIter}; }
${COINS.map((_, i) => `.${id} .coin${i} { animation: ${id}-coin${i} ${total}s 0.4s linear ${iter} both; }`).join('\n')}
.${id} .burst { opacity: 0; animation: ${id}-burst ${total}s 0.4s linear infinite both; }
`;
}

/**
 * The PM Path world map: four phases on a path from the start flag to the Offer castle.
 * The adventurer and their pet walk the path; coins are collected on the way.
 * With `loop`, they walk into the castle and start again; otherwise they stop at `heroWeek`.
 */
export function WorldMap({
  heroWeek = 15,
  animate = true,
  loop = false,
  labels = true,
  youWeek,
  className,
  ...props
}: P & { heroWeek?: number; animate?: boolean; loop?: boolean; labels?: boolean; youWeek?: number }) {
  const rawId = useId();
  const id = 'map' + rawId.replace(/[^a-zA-Z0-9]/g, '');
  const moving = animate && !reducedMotion();
  const GROUND = 70;
  const y = GROUND - 14;
  const x0 = 2;
  const x1 = loop ? 183 : Math.round(weekX(heroWeek) - 6);
  const walk = Math.max(2.4, (x1 - x0) / 24);
  const coinGone = (cx: number) => !moving && cx + 4 <= x1 + 6;
  const petRest = x1 - 13 >= 0 ? x1 - 13 : x1 + 13;
  return (
    <Scene viewBox="0 16 202 82" className={[id, 'world-map', className].filter(Boolean).join(' ')} {...props}>
      {moving && <style>{mapCss(id, { x0, x1, y, walk, loop })}</style>}
      {/* sky */}
      <Pixels art={CLOUD} x={52} y={21} className="ill-drift" />
      <Pixels art={CLOUD} x={112} y={19} className="ill-drift" style={{ animationDelay: '-7s' }} />
      {moving && (
        <g className="bird-fly">
          <Pixels art={BIRD_A} className="wing-a" palette={INK_PAL} />
          <Pixels art={BIRD_B} className="wing-b" palette={INK_PAL} />
        </g>
      )}
      <Pixels art={MOUNTAIN} x={56} y={GROUND - 8} />
      <Pixels art={MOUNTAIN} x={66} y={GROUND - 8} />
      <Pixels art={MOUNTAIN} x={126} y={GROUND - 8} />

      {/* ground: one platform per phase */}
      <rect x={1} y={GROUND} width={8} height={4} fill="var(--c-butter)" />
      <rect x={1} y={GROUND + 4} width={8} height={10} fill="#e7a92a" />
      {WORLDS.map((w) => {
        const a = Math.round(weekX(w.weeks[0]) - 5);
        const b = w.n === 4 ? 201 : Math.round(weekX(w.weeks[1] + 1) - 5);
        return (
          <g key={w.n}>
            <rect x={a} y={GROUND} width={b - a} height={4} fill={w.top} />
            <rect x={a} y={GROUND + 4} width={b - a} height={10} fill={w.side} />
            {Array.from({ length: Math.floor((b - a) / 7) }, (_, i) => (
              <rect key={i} x={a + 2 + i * 7} y={GROUND + 7 + (i % 2) * 3} width={3} height={1} fill="#1d1a33" opacity={0.28} />
            ))}
            {labels && (
              <text x={a + 1} y={GROUND + 23} className="map-label" fontFamily="'Pixelify Sans', sans-serif" fontSize="5" fontWeight="600" fill="var(--c-ink)">
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
      {Array.from({ length: 15 }, (_, i) => (
        <rect key={i} x={Math.round(weekX(i + 1)) - 1} y={GROUND + 1} width={3} height={2} fill="#1d1a33" opacity={loop || i + 1 <= heroWeek ? 0.85 : 0.25} />
      ))}

      <Pixels art={TREE} x={40} y={GROUND - 10} />
      <Pixels art={TREE} x={102} y={GROUND - 10} />
      <Pixels art={TREE} x={150} y={GROUND - 10} />

      {/* coins sit just above the adventurer's head */}
      {COINS.map((cx, i) =>
        coinGone(cx) ? null : (
          <g key={cx} className={moving ? `coin${i}` : undefined}>
            <Pixels art={COIN} x={cx} y={GROUND - 26} className="ill-bob" style={{ animationDelay: `${i * 200}ms` }} />
          </g>
        ),
      )}

      <Pixels art={FLAG} x={2} y={GROUND - 12} />

      {/* castle, pennant and banner */}
      <Pixels art={CASTLE} x={178} y={GROUND - 12} />
      <g transform={`translate(${187} ${GROUND - 16})`}>
        <Pixels art={PENNANT_A} className={moving ? 'wave-a' : undefined} />
        {moving && <Pixels art={PENNANT_B} className="wave-b" />}
      </g>
      <g>
        <rect x={174} y={GROUND - 30} width={27} height={9} fill="var(--c-butter)" />
        <rect x={174} y={GROUND - 31} width={27} height={1} fill="#1d1a33" />
        <rect x={174} y={GROUND - 21} width={27} height={1} fill="#1d1a33" />
        <rect x={173} y={GROUND - 30} width={1} height={9} fill="#1d1a33" />
        <rect x={201} y={GROUND - 30} width={1} height={9} fill="#1d1a33" />
        <text x={187.5} y={GROUND - 23.4} textAnchor="middle" fontFamily="'Pixelify Sans', sans-serif" fontSize="6" fontWeight="700" fill="#1d1a33">
          Offer
        </text>
      </g>
      {loop && moving && (
        <g className="burst">
          <Pixels art={SPARK} x={176} y={GROUND - 38} />
          <Pixels art={STAR} x={186} y={GROUND - 42} />
          <Pixels art={SPARK} x={196} y={GROUND - 37} />
        </g>
      )}

      {youWeek && (
        <g transform={`translate(${Math.round(weekX(youWeek)) - 6} ${GROUND - 40})`} className="ill-blink-slow">
          <rect x={0} y={0} width={13} height={7} fill="var(--c-pink)" />
          <rect x={0} y={-1} width={13} height={1} fill="#1d1a33" />
          <rect x={0} y={7} width={13} height={1} fill="#1d1a33" />
          <rect x={-1} y={0} width={1} height={7} fill="#1d1a33" />
          <rect x={13} y={0} width={1} height={7} fill="#1d1a33" />
          <rect x={5} y={8} width={3} height={1} fill="#1d1a33" />
          <rect x={6} y={9} width={1} height={1} fill="#1d1a33" />
          <text x={6.5} y={5.4} textAnchor="middle" fontFamily="'Pixelify Sans', sans-serif" fontSize="5" fontWeight="700" fill="#1d1a33">
            You
          </text>
        </g>
      )}

      {/* the pet */}
      <g className={moving ? 'mv-pet' : undefined} transform={moving ? undefined : `translate(${petRest} ${y + 7})`}>
        <Pixels art={PET_A} className={moving ? 'pet-a' : undefined} />
        {moving && <Pixels art={PET_B} className="pet-b" />}
      </g>

      {/* the adventurer (hops when you point at the map) */}
      <g className={moving ? 'mv-hero' : undefined} transform={moving ? undefined : `translate(${x1} ${y})`}>
        <g className="hop">
          <Pixels art={HERO_A} className={moving ? 'legs-a' : undefined} />
          {moving && <Pixels art={HERO_B} className="legs-b" />}
        </g>
      </g>
    </Scene>
  );
}

/** Hero section art for the landing page. */
export function HeroIllustration(props: P & { heroWeek?: number; loop?: boolean }) {
  return <WorldMap {...props} />;
}

/** The roadmap's compact map, with the adventurer standing on the current week. */
export function PhasePathIllustration({ heroWeek = 1, ...props }: P & { heroWeek?: number }) {
  return <WorldMap heroWeek={heroWeek} {...props} />;
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
