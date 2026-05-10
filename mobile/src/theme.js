// mobile/src/theme.js
// Liquid Glass Design System — frosted transparency, depth, luminance

export const Colors = {
  light: {
    // Glass surfaces
    background: '#EEF2F7',
    gradientStart: '#DFE7F2',
    gradientEnd: '#C9D6E8',
    glass: 'rgba(255, 255, 255, 0.55)',
    glassBorder: 'rgba(255, 255, 255, 0.75)',
    glassHighlight: 'rgba(255, 255, 255, 0.85)',
    glassShadow: 'rgba(100, 116, 139, 0.12)',
    glassInner: 'rgba(255, 255, 255, 0.35)',

    // Accent colors
    primary: '#0A6CFF',
    primaryGlow: 'rgba(10, 108, 255, 0.18)',
    primarySoft: 'rgba(10, 108, 255, 0.10)',
    accent: '#00C896',
    accentGlow: 'rgba(0, 200, 150, 0.15)',
    danger: '#FF3B5C',
    dangerGlow: 'rgba(255, 59, 92, 0.12)',
    dangerSoft: 'rgba(255, 59, 92, 0.08)',
    warning: '#FFB020',
    warningGlow: 'rgba(255, 176, 32, 0.12)',
    success: '#00C896',
    successGlow: 'rgba(0, 200, 150, 0.12)',

    // Text
    text: '#0F1729',
    textSecondary: '#4A5568',
    textMuted: '#8896AB',

    // Misc
    border: 'rgba(255, 255, 255, 0.60)',
    borderSubtle: 'rgba(0, 0, 0, 0.06)',
    divider: 'rgba(0, 0, 0, 0.05)',
    overlay: 'rgba(15, 23, 41, 0.4)',
  },
  dark: {
    background: '#0B1120',
    gradientStart: '#0F1A2E',
    gradientEnd: '#0B1120',
    glass: 'rgba(25, 40, 70, 0.55)',
    glassBorder: 'rgba(255, 255, 255, 0.10)',
    glassHighlight: 'rgba(255, 255, 255, 0.08)',
    glassShadow: 'rgba(0, 0, 0, 0.35)',
    glassInner: 'rgba(255, 255, 255, 0.04)',

    primary: '#4D9AFF',
    primaryGlow: 'rgba(77, 154, 255, 0.20)',
    primarySoft: 'rgba(77, 154, 255, 0.10)',
    accent: '#34EDBA',
    accentGlow: 'rgba(52, 237, 186, 0.15)',
    danger: '#FF6B81',
    dangerGlow: 'rgba(255, 107, 129, 0.15)',
    dangerSoft: 'rgba(255, 107, 129, 0.08)',
    warning: '#FFCF5C',
    warningGlow: 'rgba(255, 207, 92, 0.12)',
    success: '#34EDBA',
    successGlow: 'rgba(52, 237, 186, 0.12)',

    text: '#EDF2F7',
    textSecondary: '#94A3B8',
    textMuted: '#5A6A80',

    border: 'rgba(255, 255, 255, 0.08)',
    borderSubtle: 'rgba(255, 255, 255, 0.04)',
    divider: 'rgba(255, 255, 255, 0.05)',
    overlay: 'rgba(0, 0, 0, 0.55)',
  },
};

export const Glass = {
  blur: 25,
  borderRadius: 22,
  borderRadiusSm: 14,
  borderRadiusLg: 28,
  borderRadiusFull: 999,
  borderWidth: 1.2,
  shadowRadius: 20,
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 1,
};

export const Typography = {
  h1: { fontSize: 30, fontWeight: '800', letterSpacing: -0.8 },
  h2: { fontSize: 24, fontWeight: '700', letterSpacing: -0.5 },
  h3: { fontSize: 19, fontWeight: '700', letterSpacing: -0.2 },
  body: { fontSize: 15, fontWeight: '400', lineHeight: 22 },
  bodyBold: { fontSize: 15, fontWeight: '600' },
  caption: { fontSize: 13, fontWeight: '500' },
  captionBold: { fontSize: 13, fontWeight: '700' },
  small: { fontSize: 11, fontWeight: '600', letterSpacing: 0.8, textTransform: 'uppercase' },
  mono: { fontSize: 14, fontWeight: '600', fontFamily: 'Courier' },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};
