// Circles — user-created communities replacing categories as the bundling system.
import { CATEGORIES } from './categories';

// Preset accent colors (work in light + dark; chips use onAccent for text).
export const CIRCLE_ACCENT_PRESETS = [
  { id: 'crimson', color: '#B5302E', onAccent: '#FFFFFF' },
  { id: 'saffron', color: '#C9772E', onAccent: '#1F1B19' },
  { id: 'teal', color: '#2F6E72', onAccent: '#FFFFFF' },
  { id: 'forest', color: '#3F7D6B', onAccent: '#FFFFFF' },
  { id: 'ocean', color: '#3C6E8F', onAccent: '#FFFFFF' },
  { id: 'plum', color: '#8E5A8C', onAccent: '#FFFFFF' },
  { id: 'clay', color: '#A14A3C', onAccent: '#FFFFFF' },
  { id: 'olive', color: '#577A3F', onAccent: '#FFFFFF' },
  { id: 'amber', color: '#D9A218', onAccent: '#1F1B19' },
  { id: 'slate', color: '#5C6B7A', onAccent: '#FFFFFF' },
];

export const CIRCLE_ICON_PRESETS = ['🛂', '💰', '🩺', '🏠', '🏦', '💻', '🌏', '📌', '⚽', '🎓', '🍲', '🏏', '🌿', '☕', '🎉'];

const OFFICIAL_META = {
  migration: { name: 'Visa & Migration', handle: 'visa-migration', description: 'Visas, PR pathways, bridging visas and migration agents.' },
  tax_super: { name: 'Tax & Super', handle: 'tax-super', description: 'Tax returns, ABN, super and small-business questions.' },
  health: { name: 'Health & Medical', handle: 'health-medical', description: 'GPs, Medicare, mental health and navigating care in Australia.' },
  real_estate: { name: 'Real Estate', handle: 'real-estate', description: 'Renting, buying, auctions and tenant rights in Victoria.' },
  loans: { name: 'Loans & Mortgages', handle: 'loans-mortgages', description: 'Home loans, refinancing and first-home buyer schemes.' },
  it_careers: { name: 'IT & Careers', handle: 'it-careers', description: 'Jobs, resumes, interviews and breaking into the local market.' },
  general: { name: 'Life in Australia', handle: 'life-australia', description: 'Settling in, culture, community and everyday life.' },
  others: { name: 'Others', handle: 'others', description: 'Everything else — ask away.' },
};

const OFFICIAL_ACCENTS = ['crimson', 'saffron', 'teal', 'ocean', 'forest', 'plum', 'clay', 'slate'];
const DAY = 24 * 60 * 60 * 1000;
const ago = (ms) => Date.now() - ms;

const OFFICIAL_PINNED = {
  migration: 'q1',
  loans: 'q16',
};

export function buildOfficialCircles() {
  return CATEGORIES.map((c, i) => ({
    id: c.id,
    name: OFFICIAL_META[c.id]?.name || c.name,
    handle: OFFICIAL_META[c.id]?.handle || c.id,
    description: OFFICIAL_META[c.id]?.description || c.name,
    icon: c.icon,
    accentId: OFFICIAL_ACCENTS[i % OFFICIAL_ACCENTS.length],
    creatorId: null,
    memberCount: 800 + i * 220,
    createdAt: ago(400 * DAY),
    isOfficial: true,
    pinnedQuestionId: OFFICIAL_PINNED[c.id] || null,
  }));
}

export const seedUserCircles = [
  {
    id: 'c_footscray',
    name: 'Footscray Nepali Community',
    handle: 'footscray-nepali',
    description: 'Local meetups, temple events and helping newcomers in the west.',
    icon: '🍲',
    accentId: 'saffron',
    creatorId: 'u_bibek',
    memberCount: 340,
    createdAt: ago(90 * DAY),
    isOfficial: false,
  },
  {
    id: 'c_fhb',
    name: 'First Home Buyers AU',
    handle: 'first-home-buyers-au',
    description: 'Deposits, FHOG, stamp duty and the emotional rollercoaster of buying.',
    icon: '🏠',
    accentId: 'teal',
    creatorId: 'me',
    memberCount: 120,
    createdAt: ago(60 * DAY),
    isOfficial: false,
    pinnedQuestionId: 'q_fhb_pin',
  },
  {
    id: 'c_monash',
    name: 'Monash Uni Nepalese Students',
    handle: 'monash-nepalese',
    description: 'Units, placements, casual work and surviving exam season together.',
    icon: '🎓',
    accentId: 'plum',
    creatorId: 'u_dipesh',
    memberCount: 85,
    createdAt: ago(45 * DAY),
    isOfficial: false,
  },
  {
    id: 'c_cricket',
    name: 'Cricket Melbourne',
    handle: 'cricket-melbourne',
    description: 'Weekend games, gear swaps and finding a side that needs one more.',
    icon: '🏏',
    accentId: 'forest',
    creatorId: 'u_niraj',
    memberCount: 60,
    createdAt: ago(30 * DAY),
    isOfficial: false,
  },
  {
    id: 'c_tiny',
    name: 'Gundruk Recipe Club',
    handle: 'gundruk-recipe-club',
    description: 'A tiny circle for fermenting, drying and cooking gundruk properly.',
    icon: '🌿',
    accentId: 'olive',
    creatorId: 'u_sabina',
    memberCount: 4,
    createdAt: ago(3 * DAY),
    isOfficial: false,
  },
];

export const seedJoinedCircles = [
  ...CATEGORIES.map((c) => c.id),
  'c_footscray',
  'c_monash',
  'c_fhb',
];

export function accentById(accentId) {
  return CIRCLE_ACCENT_PRESETS.find((a) => a.id === accentId) || CIRCLE_ACCENT_PRESETS[0];
}

export function circleAccentColor(circle, isDark) {
  const base = accentById(circle?.accentId);
  if (!isDark) return base;
  // Slightly brighten accents on dark surfaces for contrast.
  const brighten = { crimson: '#E85A57', saffron: '#F0B340', teal: '#4A9EA3', forest: '#5A9E88', ocean: '#5A8FAF', plum: '#B07AB0', clay: '#C86A5C', olive: '#7A9E5F', amber: '#F0C050', slate: '#8A9AAA' };
  return { ...base, color: brighten[base.id] || base.color };
}

export function slugify(name) {
  return name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);
}

// Simple similarity for create-circle suggestions.
function levenshtein(a, b) {
  const m = a.length;
  const n = b.length;
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
    }
  }
  return dp[m][n];
}

export function findSimilarCircles(name, circles, limit = 3) {
  const q = name.trim().toLowerCase();
  if (q.length < 2) return [];
  return circles
    .map((c) => {
      const n = c.name.toLowerCase();
      const sub = n.includes(q) || q.includes(n);
      const dist = levenshtein(q, n);
      const score = sub ? 0 : dist;
      return { circle: c, score };
    })
    .filter((x) => x.score <= 4)
    .sort((a, b) => a.score - b.score || b.circle.memberCount - a.circle.memberCount)
    .slice(0, limit)
    .map((x) => x.circle);
}

export function isCircleNameTaken(name, circles, exceptId = null) {
  const n = name.trim().toLowerCase();
  return circles.some((c) => c.id !== exceptId && c.name.trim().toLowerCase() === n);
}

// Banner gradient stops tuned per theme (accent-derived, no hardcoded UI outside tokens).
export function circleBannerGradient(circle, isDark) {
  const accent = circleAccentColor(circle, isDark);
  const rich = circle?.isOfficial ? 1 : 0;
  if (isDark) {
    return {
      colors: [
        accent.color,
        `${accent.color}cc`,
        rich ? '#1a1412' : '#141110',
      ],
      locations: rich ? [0, 0.45, 1] : [0, 0.55, 1],
      motifOpacity: rich ? 0.14 : 0.1,
    };
  }
  return {
    colors: [
      accent.color,
      `${accent.color}dd`,
      rich ? '#FAF6F0' : '#F2ECE3',
    ],
    locations: rich ? [0, 0.4, 1] : [0, 0.5, 1],
    motifOpacity: rich ? 0.12 : 0.08,
  };
}
