// Semantic color tokens — light and dark palettes.

export const lightColors = {
  primary: '#B5302E',
  primaryDark: '#8E2421',
  primaryTint: '#FBEAE8',
  primaryLight: '#FBEAE8',

  secondary: '#E0991B',
  secondaryDark: '#B97A0F',
  secondaryTint: '#FCF1DC',
  accent: '#E0991B',

  bg: '#FAF6F0',
  bgSunken: '#F2ECE3',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  surfaceAlt: '#FBF8F3',
  border: '#ECE5DB',
  borderStrong: '#DED5C8',

  text: '#1F1B19',
  textPrimary: '#1F1B19',
  textSecondary: '#6E665E',
  textMuted: '#6E665E',
  textFaint: '#A79F95',
  onPrimary: '#FFFFFF',
  onDark: '#FFFFFF',

  success: '#2E9E6B',
  successTint: '#E7F5EE',
  danger: '#C5362C',
  dangerTint: '#FBEAE8',
  verified: '#B5302E',
  verifiedTint: '#FBEAE8',
  live: '#E0991B',

  expertCardBorder: '#F0DCAE',
  expertMarkerBorder: '#F0D9A4',
  avatarPlaceholder: '#C7CDD4',
  offlineBanner: '#1F1B19',
  toastSuccess: '#1F5C3D',

  overlay: 'rgba(28,20,18,0.45)',
  scrim: 'rgba(28,20,18,0.06)',

  splashBg: '#B5302E',
  splashMotif: '#FFFFFF',
  splashLogoBg: '#ffffff22',
  splashText: '#FFFFFF',
  splashTextMuted: '#ffffffcc',

  imageViewerBg: '#0E0B0A',
  imageViewerSurface: '#1C1715',
  imageViewerClose: 'rgba(255,255,255,0.14)',
  imageViewerBorder: 'rgba(255,255,255,0.08)',
  imageViewerTextMuted: 'rgba(255,255,255,0.55)',
};

export const darkColors = {
  primary: '#E85A57',
  primaryDark: '#FF7A77',
  primaryTint: '#3A2220',
  primaryLight: '#3A2220',

  secondary: '#F0B340',
  secondaryDark: '#FFD080',
  secondaryTint: '#3A2E18',
  accent: '#F0B340',

  bg: '#141110',
  bgSunken: '#1C1816',
  surface: '#221E1C',
  surfaceElevated: '#2A2523',
  surfaceAlt: '#1E1A18',
  border: '#3A3430',
  borderStrong: '#4A433E',

  text: '#F5F0EA',
  textPrimary: '#F5F0EA',
  textSecondary: '#B8AFA6',
  textMuted: '#B8AFA6',
  textFaint: '#7A726A',
  onPrimary: '#FFFFFF',
  onDark: '#FFFFFF',

  success: '#4EC992',
  successTint: '#1A2E24',
  danger: '#F07066',
  dangerTint: '#3A2220',
  verified: '#E85A57',
  verifiedTint: '#3A2220',
  live: '#F0B340',

  expertCardBorder: '#5A4A28',
  expertMarkerBorder: '#5A4A28',
  avatarPlaceholder: '#4A4540',
  offlineBanner: '#2A2523',
  toastSuccess: '#1A3D2A',

  overlay: 'rgba(0,0,0,0.62)',
  scrim: 'rgba(255,255,255,0.04)',

  splashBg: '#8E2421',
  splashMotif: '#FFFFFF',
  splashLogoBg: '#ffffff18',
  splashText: '#FFFFFF',
  splashTextMuted: '#ffffffaa',

  imageViewerBg: '#0A0807',
  imageViewerSurface: '#1A1614',
  imageViewerClose: 'rgba(255,255,255,0.12)',
  imageViewerBorder: 'rgba(255,255,255,0.08)',
  imageViewerTextMuted: 'rgba(255,255,255,0.5)',
};

export function shadowsFor(colors, isDark) {
  const base = isDark ? '#000000' : '#5B4A3A';
  const float = isDark ? '#000000' : '#7A1F1C';
  return {
    card: isDark
      ? { shadowColor: 'transparent', shadowOpacity: 0, shadowRadius: 0, shadowOffset: { width: 0, height: 0 }, elevation: 0 }
      : { shadowColor: base, shadowOpacity: 0.06, shadowRadius: 10, shadowOffset: { width: 0, height: 3 }, elevation: 2 },
    raised: isDark
      ? { shadowColor: 'transparent', shadowOpacity: 0, shadowRadius: 0, shadowOffset: { width: 0, height: 0 }, elevation: 0 }
      : { shadowColor: base, shadowOpacity: 0.1, shadowRadius: 16, shadowOffset: { width: 0, height: 6 }, elevation: 5 },
    floating: isDark
      ? { shadowColor: 'transparent', shadowOpacity: 0, shadowRadius: 0, shadowOffset: { width: 0, height: 0 }, elevation: 4 }
      : { shadowColor: float, shadowOpacity: 0.28, shadowRadius: 14, shadowOffset: { width: 0, height: 6 }, elevation: 8 },
    // Dark mode uses border emphasis instead of shadows on elevated surfaces
    elevatedBorder: isDark ? { borderWidth: 1, borderColor: colors.border } : {},
  };
}
