/**
 * Card thumbnails, drawn as SVG from the entry's accent colour.
 *
 * No image files ship with the portal. A game only declares one colour, and the
 * motif is picked from a hash of its id, so two games never look identical and
 * the registry stays a single line per game. Swap in real artwork later by
 * giving `GameEntry` an image field — nothing else knows how a card is drawn.
 */

const MOTIF_COUNT = 4;

/** Small deterministic string hash (FNV-1a). Same id, same motif, forever. */
function hash(value: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < value.length; i++) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** Mix a `#rrggbb` colour toward black (amount < 0) or white (amount > 0). */
function shade(hex: string, amount: number): string {
  const value = Number.parseInt(hex.slice(1), 16);
  const target = amount > 0 ? 255 : 0;
  const ratio = Math.abs(amount);
  const channel = (shift: number): number => {
    const base = (value >> shift) & 0xff;
    return Math.round(base + (target - base) * ratio);
  };
  const mixed = (channel(16) << 16) | (channel(8) << 8) | channel(0);
  return `#${mixed.toString(16).padStart(6, '0')}`;
}

function motif(index: number, accent: string): string {
  const light = shade(accent, 0.45);
  const dark = shade(accent, -0.35);

  switch (index) {
    // Stacked discs — merge/physics games.
    case 0:
      return `
        <circle cx="90" cy="130" r="42" fill="${light}" opacity="0.85" />
        <circle cx="164" cy="146" r="28" fill="${dark}" opacity="0.7" />
        <circle cx="212" cy="112" r="34" fill="${light}" opacity="0.55" />`;
    // Falling dots — drop games.
    case 1:
      return `
        <circle cx="80" cy="46" r="14" fill="${light}" opacity="0.8" />
        <circle cx="140" cy="88" r="20" fill="${light}" opacity="0.6" />
        <circle cx="206" cy="132" r="28" fill="${dark}" opacity="0.65" />`;
    // Grid — puzzle/board games.
    case 2:
      return `
        <g fill="${light}" opacity="0.7">
          <rect x="84" y="48" width="48" height="48" rx="10" />
          <rect x="146" y="48" width="48" height="48" rx="10" opacity="0.6" />
          <rect x="84" y="110" width="48" height="48" rx="10" opacity="0.6" />
          <rect x="146" y="110" width="48" height="48" rx="10" fill="${dark}" />
        </g>`;
    // Arcs — aim/launch games.
    default:
      return `
        <path d="M40 152 Q160 24 280 152" fill="none" stroke="${light}" stroke-width="12"
              stroke-linecap="round" opacity="0.75" />
        <circle cx="280" cy="152" r="16" fill="${dark}" />`;
  }
}

/** Returns SVG markup. The caller owns where it goes. */
export function thumbnailSvg(id: string, accent: string): string {
  const index = hash(id) % MOTIF_COUNT;
  const gradientId = `thumb-${id}`;
  return `
    <svg viewBox="0 0 320 180" preserveAspectRatio="xMidYMid slice" role="presentation"
         xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="${gradientId}" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${shade(accent, 0.15)}" />
          <stop offset="100%" stop-color="${shade(accent, -0.45)}" />
        </linearGradient>
      </defs>
      <rect width="320" height="180" fill="url(#${gradientId})" />
      ${motif(index, accent)}
    </svg>`;
}
