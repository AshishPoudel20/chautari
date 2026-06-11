// Color math for circle accents — contrast clamp + luminance helpers.

function parseHex(hex) {
  const h = String(hex).replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h.slice(0, 6);
  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
  };
}

function toHex({ r, g, b }) {
  const c = (n) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
  return `#${c(r)}${c(g)}${c(b)}`;
}

export function relativeLuminance(hex) {
  const { r, g, b } = parseHex(hex);
  const lin = (c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

export function contrastRatio(fg, bg) {
  const l1 = relativeLuminance(fg);
  const l2 = relativeLuminance(bg);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function hexToHsl(hex) {
  const { r, g, b } = parseHex(hex);
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6;
  else if (max === gn) h = ((bn - rn) / d + 2) / 6;
  else h = ((rn - gn) / d + 4) / 6;
  return { h, s, l };
}

function hslToHex(h, s, l) {
  if (s === 0) {
    const v = l * 255;
    return toHex({ r: v, g: v, b: v });
  }
  const hue2rgb = (p, q, t) => {
    let tt = t;
    if (tt < 0) tt += 1;
    if (tt > 1) tt -= 1;
    if (tt < 1 / 6) return p + (q - p) * 6 * tt;
    if (tt < 1 / 2) return q;
    if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return toHex({
    r: hue2rgb(p, q, h + 1 / 3) * 255,
    g: hue2rgb(p, q, h) * 255,
    b: hue2rgb(p, q, h - 1 / 3) * 255,
  });
}

/** Raise lightness toward pastel range for dark surfaces (65–72% target). */
export function brightenForDarkMode(lightHex) {
  const { h, s, l } = hexToHsl(lightHex);
  const targetL = Math.max(l, 0.68);
  const targetS = Math.max(0.28, s * 0.72);
  return hslToHex(h, targetS, Math.min(0.78, targetL));
}

export function contrastOnBackground(hex, light = '#1F1B19', dark = '#FFFFFF') {
  return relativeLuminance(hex) > 0.52 ? light : dark;
}

const MIN_SURFACE_CONTRAST = 2.8;

/** Brighten accent until it reads clearly on a dark surface — safety clamp. */
export function clampForDarkSurface(accentHex, surfaceHex, minRatio = MIN_SURFACE_CONTRAST) {
  let { h, s, l } = hexToHsl(accentHex);
  let hex = accentHex;
  let guard = 0;
  while (contrastRatio(hex, surfaceHex) < minRatio && guard < 24) {
    l = Math.min(0.88, l + 0.04);
    s = Math.max(0.2, s * 0.96);
    hex = hslToHex(h, s, l);
    guard += 1;
  }
  return hex;
}

export function withAlpha(hex, alphaHex) {
  const { r, g, b } = parseHex(hex);
  const a = Math.round(parseInt(alphaHex, 16) / 255 * 1000) / 1000;
  return `rgba(${r},${g},${b},${a})`;
}
