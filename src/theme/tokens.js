export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 22,
  pill: 999,
};

export const font = {
  display: 28,
  title: 21,
  subtitle: 17,
  bodyLg: 16,
  body: 15,
  caption: 13,
  tiny: 11,
  h1: 28,
  h2: 21,
  h3: 17,
  small: 13,
};

export const line = {
  display: 34,
  title: 27,
  subtitle: 24,
  body: 22,
  caption: 19,
};

export const weight = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  heavy: '800',
};

const avatarPalette = [
  '#B5302E', '#C9772E', '#D9A218', '#3F7D6B', '#3C6E8F',
  '#8E5A8C', '#A14A3C', '#577A3F', '#2F6E72', '#7C5E3B',
];

export function colorForString(str = '') {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return avatarPalette[h % avatarPalette.length];
}
