/**
 * Original illustrations, drawn as inline SVG so they theme with light/dark mode,
 * stay sharp at any size, work offline and cost no extra requests.
 * Motion classes (ill-float, ill-draw, ill-blink…) are defined in styles/index.css
 * and switch off for people who prefer reduced motion.
 */
import type { SVGProps } from 'react';

const INK = 'var(--c-line)';
const SW = 3;

type P = SVGProps<SVGSVGElement> & { title?: string };

function Svg({ title, children, ...rest }: P & { children: React.ReactNode }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" role={title ? 'img' : undefined} aria-hidden={title ? undefined : true} {...rest} className={['ill', rest.className].filter(Boolean).join(' ')}>
      {title && <title>{title}</title>}
      {children}
    </svg>
  );
}

/** Landing hero: the app window with today’s blocks, a path to an offer, and floating skill chips. */
export function HeroIllustration(props: P) {
  return (
    <Svg viewBox="0 0 560 440" {...props}>
      {/* dotted grid backdrop */}
      <defs>
        <pattern id="hero-dots" width="22" height="22" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1.6" fill={INK} opacity="0.18" />
        </pattern>
      </defs>
      <rect x="10" y="20" width="540" height="400" rx="28" fill="url(#hero-dots)" />

      {/* path from start flag to trophy */}
      <path className="ill-draw" d="M58 380 C 140 380, 120 300, 200 300 S 300 360, 360 300 S 430 190, 500 170" fill="none" stroke={INK} strokeWidth="4" strokeDasharray="10 10" strokeLinecap="round" />
      <g className="ill-pop" style={{ animationDelay: '200ms' }}>
        <line x1="58" y1="382" x2="58" y2="330" stroke={INK} strokeWidth={SW} strokeLinecap="round" />
        <path d="M58 332 l34 10 -34 12z" fill="var(--c-mint)" stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
      </g>

      {/* app window */}
      <g className="ill-float-slow">
        <rect x="120" y="44" width="320" height="230" rx="16" fill="var(--c-surface)" stroke={INK} strokeWidth={SW} />
        <path d="M120 82 h320" stroke={INK} strokeWidth={SW} />
        <circle cx="142" cy="63" r="6" fill="var(--c-pink)" stroke={INK} strokeWidth="2" />
        <circle cx="162" cy="63" r="6" fill="var(--c-butter)" stroke={INK} strokeWidth="2" />
        <circle cx="182" cy="63" r="6" fill="var(--c-mint)" stroke={INK} strokeWidth="2" />
        <text x="290" y="68" textAnchor="middle" className="d-text" fontWeight="700" fontSize="13">
          Today · Week 5
        </text>
        {[
          {
            y: 96,
            w: 190,
            c: 'var(--c-lavender)',
            t: 'Learn · SQL joins',
            done: true,
          },
          {
            y: 130,
            w: 160,
            c: 'var(--c-sky)',
            t: 'Tools · 5 queries',
            done: true,
          },
          {
            y: 164,
            w: 210,
            c: 'var(--c-butter)',
            t: 'Build · metrics tree',
            done: false,
          },
          {
            y: 198,
            w: 120,
            c: 'var(--c-peach)',
            t: 'Mock interview',
            done: false,
          },
          {
            y: 232,
            w: 140,
            c: 'var(--c-pink)',
            t: 'Post + 5 outreach',
            done: false,
          },
        ].map((b, i) => (
          <g key={b.y} className="ill-slide" style={{ animationDelay: `${300 + i * 120}ms` }}>
            <rect x="140" y={b.y} width="22" height="22" rx="6" fill={b.done ? 'var(--c-mint)' : 'var(--c-surface)'} stroke={INK} strokeWidth="2.5" />
            {b.done && <path d={`M145 ${b.y + 11} l5 5 9 -10`} fill="none" stroke="#1e1e24" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />}
            <rect x="172" y={b.y} width={b.w} height="22" rx="7" fill={b.c} stroke={INK} strokeWidth="2.5" />
            <text x="182" y={b.y + 15.5} className="d-text-dark" fontSize="11.5" fontWeight="600">
              {b.t}
            </text>
          </g>
        ))}
        {/* progress ring */}
        <g transform="translate(398 150)">
          <circle r="26" fill="none" stroke={INK} strokeWidth="2" />
          <circle r="16" fill="none" stroke={INK} strokeWidth="2" />
          <circle className="ill-ring" r="21" fill="none" stroke="var(--c-mint)" strokeWidth="9" strokeDasharray="132" strokeDashoffset="52" transform="rotate(-90)" />
          <text y="5" textAnchor="middle" className="d-text" fontSize="11" fontWeight="700">
            38%
          </text>
        </g>
      </g>

      {/* floating chips */}
      <g className="ill-float" style={{ animationDelay: '0ms' }}>
        <rect x="24" y="88" width="84" height="34" rx="17" fill="var(--c-sky)" stroke={INK} strokeWidth={SW} />
        <text x="66" y="110" textAnchor="middle" className="d-text-dark" fontSize="13" fontWeight="700">
          SQL
        </text>
      </g>
      <g className="ill-float" style={{ animationDelay: '-1.4s' }}>
        <rect x="456" y="64" width="82" height="34" rx="17" fill="var(--c-pink)" stroke={INK} strokeWidth={SW} />
        <text x="497" y="86" textAnchor="middle" className="d-text-dark" fontSize="13" fontWeight="700">
          PRD
        </text>
      </g>
      <g className="ill-float" style={{ animationDelay: '-2.6s' }}>
        <rect x="30" y="200" width="90" height="34" rx="17" fill="var(--c-lavender)" stroke={INK} strokeWidth={SW} />
        <text x="75" y="222" textAnchor="middle" className="d-text-dark" fontSize="13" fontWeight="700">
          AI evals
        </text>
      </g>
      <g className="ill-float" style={{ animationDelay: '-0.8s' }}>
        <rect x="452" y="250" width="90" height="34" rx="17" fill="var(--c-peach)" stroke={INK} strokeWidth={SW} />
        <text x="497" y="272" textAnchor="middle" className="d-text-dark" fontSize="13" fontWeight="700">
          A/B tests
        </text>
      </g>

      {/* trophy at the end of the path */}
      <g transform="translate(500 120)">
        <g className="ill-bob">
          <path d="M-22 0 h44 v14 a22 22 0 0 1 -44 0z" fill="var(--c-butter)" stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
          <path d="M-22 6 h-10 a10 10 0 0 0 10 14 M22 6 h10 a10 10 0 0 1 -10 14" fill="none" stroke={INK} strokeWidth={SW} />
          <path d="M0 36 v12 M-14 52 h28" stroke={INK} strokeWidth={SW} strokeLinecap="round" />
          <text y="74" textAnchor="middle" className="d-text" fontSize="12" fontWeight="700">
            Offer
          </text>
        </g>
      </g>
      <g className="ill-twinkle" style={{ animationDelay: '0.4s' }}>
        <path d="M540 120 l4 -10 4 10 10 4 -10 4 -4 10 -4 -10 -10 -4z" fill="var(--c-butter)" stroke={INK} strokeWidth="2" />
      </g>
      <g className="ill-twinkle" style={{ animationDelay: '1.2s' }}>
        <path d="M456 132 l3 -7 3 7 7 3 -7 3 -3 7 -3 -7 -7 -3z" fill="var(--c-pink)" stroke={INK} strokeWidth="2" />
      </g>
    </Svg>
  );
}

/** Two devices kept in step through the cloud. */
export function SyncIllustration(props: P) {
  return (
    <Svg viewBox="0 0 320 200" {...props}>
      {/* laptop */}
      <g>
        <rect x="18" y="70" width="120" height="78" rx="10" fill="var(--c-surface)" stroke={INK} strokeWidth={SW} />
        <rect x="30" y="84" width="60" height="10" rx="4" fill="var(--c-lavender)" stroke={INK} strokeWidth="2" />
        <rect x="30" y="102" width="90" height="10" rx="4" fill="var(--c-mint)" stroke={INK} strokeWidth="2" />
        <rect x="30" y="120" width="44" height="10" rx="4" fill="var(--c-butter)" stroke={INK} strokeWidth="2" />
        <path d="M6 156 h144 l-8 10 h-128z" fill="var(--c-surface)" stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
      </g>
      {/* phone */}
      <g>
        <rect x="236" y="62" width="62" height="112" rx="12" fill="var(--c-surface)" stroke={INK} strokeWidth={SW} />
        <rect x="246" y="82" width="42" height="9" rx="4" fill="var(--c-lavender)" stroke={INK} strokeWidth="2" />
        <rect x="246" y="98" width="42" height="9" rx="4" fill="var(--c-mint)" stroke={INK} strokeWidth="2" />
        <rect x="246" y="114" width="30" height="9" rx="4" fill="var(--c-butter)" stroke={INK} strokeWidth="2" />
        <path d="M258 162 h18" stroke={INK} strokeWidth={SW} strokeLinecap="round" />
      </g>
      {/* cloud */}
      <g className="ill-bob">
        <path d="M128 52 a22 22 0 0 1 40 -16 a26 26 0 0 1 48 14 a18 18 0 0 1 -4 36 h-82 a18 18 0 0 1 -2 -34z" fill="var(--c-sky)" stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
        <path d="M160 64 l10 10 18 -20" fill="none" stroke="#1e1e24" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      {/* arrows */}
      <path className="ill-dash" d="M96 66 C 104 46, 116 44, 124 50" fill="none" stroke={INK} strokeWidth="2.5" strokeDasharray="6 6" strokeLinecap="round" />
      <path className="ill-dash" d="M222 62 C 236 50, 250 52, 262 58" fill="none" stroke={INK} strokeWidth="2.5" strokeDasharray="6 6" strokeLinecap="round" />
    </Svg>
  );
}

/** A winding road with four milestone pins, one per phase. */
export function PhasePathIllustration(props: P) {
  const pins = [
    { x: 70, y: 120, c: 'var(--c-lavender)', n: '1' },
    { x: 230, y: 64, c: 'var(--c-sky)', n: '2' },
    { x: 390, y: 120, c: 'var(--c-mint)', n: '3' },
    { x: 550, y: 64, c: 'var(--c-peach)', n: '4' },
  ];
  return (
    <Svg viewBox="0 0 620 170" {...props}>
      <path
        className="ill-draw"
        d="M20 140 C 70 140, 60 100, 120 100 S 190 60, 240 80 S 320 150, 390 140 S 470 70, 600 80"
        fill="none"
        stroke={INK}
        strokeWidth="4"
        strokeDasharray="12 10"
        strokeLinecap="round"
      />
      {pins.map((p, i) => (
        <g key={p.n} transform={`translate(${p.x} ${p.y})`}>
          <g className="ill-pop" style={{ animationDelay: `${400 + i * 180}ms` }}>
            <path d="M0 26 C -18 4, -18 -22, 0 -22 S 18 4, 0 26z" fill={p.c} stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
            <text y="-1" textAnchor="middle" className="d-text-dark" fontWeight="700" fontSize="16">
              {p.n}
            </text>
          </g>
        </g>
      ))}
    </Svg>
  );
}

type EmptyKind = 'board' | 'chat' | 'notebook' | 'calendar' | 'search' | 'folder';

/** Small, friendly illustrations for empty states. */
export function EmptyIllustration({ kind, ...props }: P & { kind: EmptyKind }) {
  return (
    <Svg viewBox="0 0 160 110" width="160" height="110" {...props}>
      <ellipse cx="80" cy="100" rx="56" ry="6" fill={INK} opacity="0.12" />
      <g className="ill-bob">
        {kind === 'board' && (
          <>
            <rect x="24" y="14" width="112" height="74" rx="10" fill="var(--c-surface)" stroke={INK} strokeWidth={SW} />
            {[34, 70, 106].map((x, i) => (
              <g key={x}>
                <rect x={x - 6} y="26" width="28" height="52" rx="5" fill={['var(--c-butter)', 'var(--c-sky)', 'var(--c-mint)'][i]} stroke={INK} strokeWidth="2" />
                <rect x={x - 2} y={i === 1 ? 34 : 32} width="20" height="9" rx="3" fill="var(--c-surface)" stroke={INK} strokeWidth="1.8" opacity={i === 2 ? 0 : 1} />
              </g>
            ))}
          </>
        )}
        {kind === 'chat' && (
          <>
            <path
              d="M22 22 h78 a10 10 0 0 1 10 10 v28 a10 10 0 0 1 -10 10 h-50 l-16 14 v-14 h-12 a10 10 0 0 1 -10 -10 v-28 a10 10 0 0 1 10 -10z"
              fill="var(--c-lavender)"
              stroke={INK}
              strokeWidth={SW}
              strokeLinejoin="round"
            />
            <path
              d="M58 44 h80 a8 8 0 0 1 8 8 v22 a8 8 0 0 1 -8 8 h-8 v12 l-14 -12 h-58 a8 8 0 0 1 -8 -8 v-22 a8 8 0 0 1 8 -8z"
              fill="var(--c-butter)"
              stroke={INK}
              strokeWidth={SW}
              strokeLinejoin="round"
            />
            <circle cx="82" cy="63" r="3.5" fill="#1e1e24" className="ill-blink" />
            <circle cx="96" cy="63" r="3.5" fill="#1e1e24" className="ill-blink" style={{ animationDelay: '150ms' }} />
            <circle cx="110" cy="63" r="3.5" fill="#1e1e24" className="ill-blink" style={{ animationDelay: '300ms' }} />
          </>
        )}
        {kind === 'notebook' && (
          <>
            <rect x="44" y="10" width="76" height="84" rx="8" fill="var(--c-peach)" stroke={INK} strokeWidth={SW} />
            <path d="M56 10 v84" stroke={INK} strokeWidth="2" />
            {[30, 44, 58, 72].map((y) => (
              <path key={y} d={`M66 ${y} h42`} stroke={INK} strokeWidth="2" strokeLinecap="round" opacity="0.7" />
            ))}
            <g className="ill-wiggle" style={{ transformOrigin: '128px 70px' }}>
              <path d="M112 86 l30 -40 8 6 -30 40 -10 4z" fill="var(--c-butter)" stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
            </g>
          </>
        )}
        {kind === 'calendar' && (
          <>
            <rect x="36" y="18" width="88" height="74" rx="10" fill="var(--c-surface)" stroke={INK} strokeWidth={SW} />
            <path d="M36 40 h88" stroke={INK} strokeWidth={SW} />
            <rect x="36" y="18" width="88" height="22" rx="10" fill="var(--c-pink)" stroke={INK} strokeWidth={SW} />
            <path d="M58 12 v14 M102 12 v14" stroke={INK} strokeWidth={SW} strokeLinecap="round" />
            {[0, 1, 2, 3].map((c) =>
              [0, 1].map((r) => (
                <rect key={`${c}${r}`} x={48 + c * 18} y={50 + r * 18} width="12" height="12" rx="3" fill={c === 2 && r === 1 ? 'var(--c-mint)' : 'var(--c-surface)'} stroke={INK} strokeWidth="1.8" />
              )),
            )}
          </>
        )}
        {kind === 'search' && (
          <>
            <circle cx="70" cy="48" r="28" fill="var(--c-sky)" stroke={INK} strokeWidth={SW} />
            <circle cx="70" cy="48" r="16" fill="var(--c-surface)" stroke={INK} strokeWidth="2.5" />
            <path d="M92 70 l26 22" stroke={INK} strokeWidth="8" strokeLinecap="round" />
          </>
        )}
        {kind === 'folder' && (
          <>
            <path
              d="M30 26 h34 l8 10 h58 a6 6 0 0 1 6 6 v46 a6 6 0 0 1 -6 6 h-100 a6 6 0 0 1 -6 -6 v-56 a6 6 0 0 1 6 -6z"
              fill="var(--c-butter)"
              stroke={INK}
              strokeWidth={SW}
              strokeLinejoin="round"
            />
            <path d="M24 46 h112" stroke={INK} strokeWidth="2.5" />
            <path d="M74 66 h12 M80 60 v12" stroke={INK} strokeWidth="3" strokeLinecap="round" />
          </>
        )}
      </g>
    </Svg>
  );
}

/** A lost signpost for the 404 page. */
export function LostIllustration(props: P) {
  return (
    <Svg viewBox="0 0 220 170" {...props}>
      <ellipse cx="110" cy="156" rx="70" ry="7" fill={INK} opacity="0.12" />
      <path d="M110 40 v114" stroke={INK} strokeWidth="5" strokeLinecap="round" />
      <g className="ill-sway" style={{ transformOrigin: '110px 56px' }}>
        <path d="M110 40 h70 l14 14 -14 14 h-70z" fill="var(--c-mint)" stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
        <text x="146" y="59" textAnchor="middle" className="d-text-dark" fontWeight="700" fontSize="13">
          Roadmap
        </text>
      </g>
      <g className="ill-sway" style={{ transformOrigin: '110px 96px', animationDelay: '-1s' }}>
        <path d="M110 80 h-70 l-14 14 14 14 h70z" fill="var(--c-pink)" stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
        <text x="72" y="99" textAnchor="middle" className="d-text-dark" fontWeight="700" fontSize="13">
          Dashboard
        </text>
      </g>
      <text x="168" y="130" className="d-text ill-twinkle" fontWeight="700" fontSize="34">
        ?
      </text>
    </Svg>
  );
}
