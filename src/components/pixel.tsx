/**
 * Original pixel-art sprites, drawn as character grids and rendered as crisp SVG rects.
 * Each character maps to a colour; '.' is transparent. Horizontal runs of the same colour
 * are merged into one rect so the SVGs stay small.
 */
import type { SVGProps } from 'react';

export const PAL: Record<string, string> = {
  k: '#1d1a33', // ink outline
  w: '#fffdf7', // white
  g: '#b9b3d6', // light grey
  G: '#7d77a3', // grey
  l: '#c7b6ff', // lavender
  L: '#8f78f0', // lavender shade
  p: '#ffb3cf', // pink
  P: '#e66d9c', // pink shade
  s: '#9fd3ff', // sky
  S: '#4a95e0', // sky shade
  m: '#9eedc1', // mint
  M: '#3fb57a', // mint shade
  y: '#ffe27a', // butter
  Y: '#e7a92a', // gold shade
  o: '#ffc096', // peach
  O: '#e7804a', // peach shade
  r: '#ef4f5f', // red
  f: '#f6c9a4', // skin
  F: '#d99a72', // skin shade
  h: '#3d2c4a', // hair
  b: '#9a6440', // wood
  B: '#6b4128', // wood shade
};

export type Art = readonly string[];

export function runs(art: Art, palette: Record<string, string> = PAL) {
  const out: { x: number; y: number; w: number; c: string }[] = [];
  art.forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      const ch = row[x];
      if (ch === '.' || ch === ' ' || !palette[ch]) {
        x++;
        continue;
      }
      let w = 1;
      while (row[x + w] === ch) w++;
      out.push({ x, y, w, c: palette[ch] });
      x += w;
    }
  });
  return out;
}

/**
 * Pixel rects for use inside a larger <svg>. The position lives on an outer group and any
 * animation class on an inner one, so a CSS transform animation (bob, drift) never
 * overrides where the sprite is placed.
 */
export function Pixels({ art, x = 0, y = 0, palette, className, style }: { art: Art; x?: number; y?: number; palette?: Record<string, string>; className?: string; style?: React.CSSProperties }) {
  const rects = runs(art, palette).map((r, i) => <rect key={i} x={r.x} y={r.y} width={r.w} height={1} fill={r.c} />);
  return (
    <g transform={x || y ? `translate(${x} ${y})` : undefined}>
      {className || style ? (
        <g className={className} style={style}>
          {rects}
        </g>
      ) : (
        rects
      )}
    </g>
  );
}

/** A standalone sprite. `scale` is the size of one art pixel in CSS pixels. */
export function Sprite({ art, scale = 4, palette, title, ...rest }: { art: Art; scale?: number; palette?: Record<string, string>; title?: string } & SVGProps<SVGSVGElement>) {
  const h = art.length;
  const w = Math.max(...art.map((r) => r.length));
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${w} ${h}`}
      width={w * scale}
      height={h * scale}
      shapeRendering="crispEdges"
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      {...rest}
    >
      {title && <title>{title}</title>}
      <Pixels art={art} palette={palette} />
    </svg>
  );
}

// ---------------------------------------------------------------- sprites

/** The adventurer: a learner with a backpack, two walking frames. */
export const HERO_A: Art = [
  '....kkkkk...',
  '...khhhhhk..',
  '..khhhhhhhk.',
  '..khffkffhk.',
  '..kffffffFk.',
  '...kfffFFk..',
  '..kkllllkkk.',
  '.kfkllllkYYk',
  '.kfkllLlkYYk',
  '..kkllLLkYYk',
  '...kssssskk.',
  '...kss.ssk..',
  '..kkss.kssk.',
  '..kkk...kkk.',
];
export const HERO_B: Art = [
  '....kkkkk...',
  '...khhhhhk..',
  '..khhhhhhhk.',
  '..khffkffhk.',
  '..kffffffFk.',
  '...kfffFFk..',
  '..kkllllkkk.',
  '.kfkllllkYYk',
  '.kfkllLlkYYk',
  '..kkllLLkYYk',
  '...kssssskk.',
  '....kssssk..',
  '....ksskk...',
  '...kkkkk....',
];

export const COIN: Art = ['..kkkk..', '.kyyyyk.', 'kyywyyYk', 'kyywyyYk', 'kyyyyyYk', 'kyyyyyYk', '.kYYYYk.', '..kkkk..'];

export const HEART: Art = ['.kk...kk.', 'kppk.kppk', 'kpwppppPk', 'kppppppPk', '.kppppPk.', '..kpppk..', '...kPk...', '....k....'];

export const FLAG: Art = [
  'kk.........',
  'kmkkkkkk...',
  'kmmmmmmmk..',
  'kmwmmmmmmk.',
  'kmmmmmmMk..',
  'kmkkkkkk...',
  'kk.........',
  'kk.........',
  'kk.........',
  'kk.........',
  'kk.........',
  'kkk........',
];

export const TROPHY: Art = [
  '.kkkkkkkkkk.',
  'kkyyyyyyyykk',
  'kykywyyyyYkk',
  'kykywyyyyYky',
  '.kkyyyyyyYk.',
  '..kkyyyyYkk.',
  '....kyYk....',
  '.....kk.....',
  '....kYYk....',
  '...kkkkkk...',
  '...kyyyYk...',
  '...kkkkkk...',
].map((r) => r.replace(/y$/, 'k'));

export const STAR: Art = ['..k..', '.kyk.', 'kyyyk', '.kyk.', '..k..'];

export const FLAME: Art = ['...k....', '..kok...', '..kook..', '.kooyk..', '.koyyok.', 'kooyyyok', 'koyywyok', 'koyyyyok', '.koyyok.', '..kkkk..'];

export const SCROLL: Art = [
  '.kkkkkkkkkk.',
  'kwwwwwwwwwwk',
  'kwkkkkkkkwgk',
  'kwwwwwwwwwgk',
  'kwkkkkkkwwgk',
  'kwwwwwwwwwgk',
  'kwkkkkkkkwgk',
  'kwwwwwwwwwgk',
  'kwkkkkkwwwgk',
  'kwwwwwwwwwgk',
  '.kkkkkkkkkk.',
];

export const CHEST: Art = ['.kkkkkkkkkkkk.', 'kooooooooooOOk', 'kobbbbbbbbbbOk', 'kkkkkkyykkkkkk', 'kbbbbkyYkbbbBk', 'kbbbbbkkbbbbBk', 'kbbbbbbbbbbbBk', 'kBBBBBBBBBBBBk', '.kkkkkkkkkkkk.'];

export const CHAT: Art = ['.kkkkkkkkkkk.', 'kwwwwwwwwwwwk', 'kwwwwwwwwwwgk', 'kwwkwwkwwkwgk', 'kwwwwwwwwwwgk', 'kwggggggggggk', '.kkkkwkkkkkk.', '....kwk......', '....kk.......'];

export const CALENDAR: Art = [
  '..k....k....',
  '.kkkkkkkkkk.',
  'kpkpppppkppk',
  'kppppppppPPk',
  'kkkkkkkkkkkk',
  'kwwwwwwwwwgk',
  'kwkwkwkwkwgk',
  'kwwwwwwwwwgk',
  'kwkwmMkwkwgk',
  'kwwwMMwwwwgk',
  '.kkkkkkkkkk.',
];

export const GLASS: Art = [
  '..kkkkk.....',
  '.kssssSk....',
  'kswwssSSk...',
  'kswsssSSk...',
  'kssssSSSk...',
  'kSSSSSSSk...',
  '.kSSSSSk....',
  '..kkkkkbk...',
  '.......kbk..',
  '........kbk.',
  '.........kbk',
  '..........kk',
];

export const BRIEFCASE: Art = ['....kkkk....', '...k....k...', '.kkkkkkkkkk.', 'kbbbbbbbbbBk', 'kbbbbbbbbbBk', 'kkkkkyykkkkk', 'kbbbbkkbbbBk', 'kbbbbbbbbbBk', 'kBBBBBBBBBBk', '.kkkkkkkkkk.'];

export const CLOUD: Art = ['......kkkk......', '.....kwwwwk.....', '..kkkwwwwwwkkk..', '.kwwwwwwwwwwwwk.', 'kwwwwwwwwwwwwwwk', 'kwwwwwwwwwwwwwgk', '.kgwwwwwwwwwwgk.', '..kkkkkkkkkkkk..'];

export const LAPTOP: Art = [
  '..kkkkkkkkkkkk..',
  '..kssssssssssk..',
  '..kswwSssssssk..',
  '..ksllllssmmsk..',
  '..kssssssssssk..',
  '..ksyyyysssssk..',
  '..kssssssssssk..',
  '..kkkkkkkkkkkk..',
  '.kggggggggggggk.',
  'kgGgGgGgGgGgGgGk',
  'kkkkkkkkkkkkkkkk',
];

export const PHONE: Art = ['kkkkkkkk', 'kGkkkkGk', 'kkssssk.', 'kssssssk', 'kslllssk', 'kssssssk', 'ksmmsssk', 'kssssssk', 'ksyyyssk', 'kssssssk', 'kkkkkkkk', 'kGGwwGGk', 'kkkkkkkk'].map((r) =>
  r.padEnd(8, 'k').slice(0, 8),
);

export const SIGNPOST: Art = [
  '......kk........',
  '.kkkkkbbkkkkkk..',
  '.kmmmmbbmmmmmmk.',
  '.kmkkmbbmkkmmmmk',
  '.kmmmmbbmmmmmmk.',
  '.kkkkkbbkkkkkk..',
  '..kkkkbbkkkkkk..',
  '.kppppbbppppppk.',
  'kppkkpbbpkkppppk',
  '.kppppbbppppppk.',
  '..kkkkbbkkkkkk..',
  '......bB........',
  '......bB........',
  '......bB........',
  '...kkkbBkkk.....',
  '..kmmmmmmmmMk...',
];

export const TREE: Art = ['...kkk...', '..kmmmk..', '.kmmwmmk.', '.kmmmmMk.', 'kmmmmmmMk', 'kmmmmmMMk', '.kMMMMMk.', '..kkbkk..', '....bk...', '...kbBk..'];

export const MOUNTAIN: Art = ['.......kk.......', '......kwwk......', '.....kwwwgk.....', '....kGGwgGGk....', '...kGGGGGGGGk...', '..kGGGGGGGGGGk..', '.kGGGGGGGGGGGGk.', 'kGGGGGGGGGGGGGGk'];

export const CASTLE: Art = [
  'kk.kk.kk......kk.kk.kk',
  'kllllllk......kllllllk',
  'kllllllkkkkkkkkllllllk',
  'kllkkllk.kk.kkkllkkllk',
  'kllkkllkkllkkllllkkllk',
  'kllllllllllllllllllllk',
  'kllllllllkkkkllllllllk',
  'kllkkllllkyykllllkkllk',
  'kllkkllllkyykllllkkllk',
  'kLLLLLLLLkyYkLLLLLLLLk',
  'kLLLLLLLLkyYkLLLLLLLLk',
  'kkkkkkkkkkkkkkkkkkkkkk',
];

export const LOGO: Art = [
  'kkkkkkkkkkkk',
  'kllllllllllk',
  'klkkkkkkllLk',
  'klkyyyyykLLk',
  'klkykkkykLLk',
  'klkyyyyykLLk',
  'klkykkkkLLLk',
  'klkykLLLLLLk',
  'klkkkLLLLLLk',
  'kLLLLLLLLLLk',
  'kkkkkkkkkkkk',
];

export const CHECKLIST_ART: Art = [
  '.kkkkkkkkkk.',
  'kwwwwwwwwwgk',
  'kwmMwwkkkkgk',
  'kwMMwwwwwwgk',
  'kwwwwwwwwwgk',
  'kwmMwwkkkkgk',
  'kwMMwwwwwwgk',
  'kwwwwwwwwwgk',
  'kwppwwkkkwgk',
  'kwppwwwwwwgk',
  '.kkkkkkkkkk.',
];

/** The pet: a little pixel blob with a squash-and-stretch hop. */
export const PET_A: Art = ['...kkkk...', '..kmmmmk..', '.kmwmmmmk.', 'kmmmkmmkMk', 'kmmmmmmmMk', 'kMMmmmmMMk', '.kkkkkkkk.'];
export const PET_B: Art = ['..........', '...kkkk...', '.kkmwmmkk.', 'kmmmkmmkMk', 'kmmmmmmmMk', 'kMMMMMMMMk', '.kkkkkkkk.'];

export const BIRD_A: Art = ['.k...k.', 'k.k.k.k', '...k...'];
export const BIRD_B: Art = ['.......', 'kkk.kkk', '...k...'];

export const PENNANT_A: Art = ['kyyyy', 'kyyy.', 'k....', 'k....'];
export const PENNANT_B: Art = ['kyyy.', 'kyyyy', 'k....', 'k....'];

export const SPARK: Art = ['.y.', 'yYy', '.y.'];
