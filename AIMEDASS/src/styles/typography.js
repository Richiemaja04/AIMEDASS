/**
 * MediAssist App - Typography System
 * Professional typography scale for healthcare applications
 */

import { Platform, PixelRatio } from 'react-native';
import { COLORS } from './colors';

// Font families
export const FONT_FAMILIES = {
  primary: Platform.select({
    ios: 'SF Pro Display',
    android: 'Roboto',
    default: 'System',
  }),
  secondary: Platform.select({
    ios: 'SF Pro Text',
    android: 'Roboto',
    default: 'System',
  }),
  monospace: Platform.select({
    ios: 'SF Mono',
    android: 'Roboto Mono',
    default: 'monospace',
  }),
};

// Font weights
export const FONT_WEIGHTS = {
  thin: '100',
  ultraLight: '200',
  light: '300',
  regular: '400',
  medium: '500',
  semiBold: '600',
  bold: '700',
  heavy: '800',
  black: '900',
};

// Base font sizes (scaled for accessibility)
const normalize = (size) => {
  const scale = PixelRatio.getFontScale();
  const newSize = size * scale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

export const FONT_SIZES = {
  // Display sizes
  display: {
    large: normalize(40),
    medium: normalize(36),
    small: normalize(32),
  },
  
  // Heading sizes
  heading: {
    h1: normalize(32),
    h2: normalize(28),
    h3: normalize(24),
    h4: normalize(20),
    h5: normalize(18),
    h6: normalize(16),
  },

  // Body text sizes
  body: {
    large: normalize(18),
    medium: normalize(16),
    small: normalize(14),
    extraSmall: normalize(12),
  },

  // UI element sizes
  button: normalize(16),
  input: normalize(16),
  label: normalize(14),
  caption: normalize(12),
  overline: normalize(10),
};

// Line heights
export const LINE_HEIGHTS = {
  tight: 1.2,
  normal: 1.4,
  relaxed: 1.6,
  loose: 1.8,
};

// Letter spacing
export const LETTER_SPACING = {
  tight: -0.5,
  normal: 0,
  wide: 0.5,
  wider: 1,
  widest: 2,
};

// Typography styles
export const TYPOGRAPHY = {
  // Display styles
  displayLarge: {
    fontFamily: FONT_FAMILIES.primary,
    fontSize: FONT_SIZES.display.large,
    fontWeight: FONT_WEIGHTS.bold,
    lineHeight: FONT_SIZES.display.large * LINE_HEIGHTS.tight,
    letterSpacing: LETTER_SPACING.tight,
    color: COLORS.text.primary,
  },

  displayMedium: {
    fontFamily: FONT_FAMILIES.primary,
    fontSize: FONT_SIZES.display.medium,
    fontWeight: FONT_WEIGHTS.bold,
    lineHeight: FONT_SIZES.display.medium * LINE_HEIGHTS.tight,
    letterSpacing: LETTER_SPACING.tight,
    color: COLORS.text.primary,
  },

  displaySmall: {
    fontFamily: FONT_FAMILIES.primary,
    fontSize: FONT_SIZES.display.small,
    fontWeight: FONT_WEIGHTS.bold,
    lineHeight: FONT_SIZES.display.small * LINE_HEIGHTS.tight,
    letterSpacing: LETTER_SPACING.normal,
    color: COLORS.text.primary,
  },

  // Heading styles
  h1: {
    fontFamily: FONT_FAMILIES.primary,
    fontSize: FONT_SIZES.heading.h1,
    fontWeight: FONT_WEIGHTS.bold,
    lineHeight: FONT_SIZES.heading.h1 * LINE_HEIGHTS.tight,
    letterSpacing: LETTER_SPACING.tight,
    color: COLORS.text.primary,
  },

  h2: {
    fontFamily: FONT_FAMILIES.primary,
    fontSize: FONT_SIZES.heading.h2,
    fontWeight: FONT_WEIGHTS.bold,
    lineHeight: FONT_SIZES.heading.h2 * LINE_HEIGHTS.tight,
    letterSpacing: LETTER_SPACING.normal,
    color: COLORS.text.primary,
  },

  h3: {
    fontFamily: FONT_FAMILIES.primary,
    fontSize: FONT_SIZES.heading.h3,
    fontWeight: FONT_WEIGHTS.semiBold,
    lineHeight: FONT_SIZES.heading.h3 * LINE_HEIGHTS.normal,
    letterSpacing: LETTER_SPACING.normal,
    color: COLORS.text.primary,
  },

  h4: {
    fontFamily: FONT_FAMILIES.primary,
    fontSize: FONT_SIZES.heading.h4,
    fontWeight: FONT_WEIGHTS.semiBold,
    lineHeight: FONT_SIZES.heading.h4 * LINE_HEIGHTS.normal,
    letterSpacing: LETTER_SPACING.normal,
    color: COLORS.text.primary,
  },

  h5: {
    fontFamily: FONT_FAMILIES.primary,
    fontSize: FONT_SIZES.heading.h5,
    fontWeight: FONT_WEIGHTS.medium,
    lineHeight: FONT_SIZES.heading.h5 * LINE_HEIGHTS.normal,
    letterSpacing: LETTER_SPACING.normal,
    color: COLORS.text.primary,
  },

  h6: {
    fontFamily: FONT_FAMILIES.primary,
    fontSize: FONT_SIZES.heading.h6,
    fontWeight: FONT_WEIGHTS.medium,
    lineHeight: FONT_SIZES.heading.h6 * LINE_HEIGHTS.normal,
    letterSpacing: LETTER_SPACING.wide,
    color: COLORS.text.primary,
  },

  // Body text styles
  bodyLarge: {
    fontFamily: FONT_FAMILIES.secondary,
    fontSize: FONT_SIZES.body.large,
    fontWeight: FONT_WEIGHTS.regular,
    lineHeight: FONT_SIZES.body.large * LINE_HEIGHTS.relaxed,
    letterSpacing: LETTER_SPACING.normal,
    color: COLORS.text.primary,
  },

  bodyMedium: {
    fontFamily: FONT_FAMILIES.secondary,
    fontSize: FONT_SIZES.body.medium,
    fontWeight: FONT_WEIGHTS.regular,
    lineHeight: FONT_SIZES.body.medium * LINE_HEIGHTS.normal,
    letterSpacing: LETTER_SPACING.normal,
    color: COLORS.text.primary,
  },

  bodySmall: {
    fontFamily: FONT_FAMILIES.secondary,
    fontSize: FONT_SIZES.body.small,
    fontWeight: FONT_WEIGHTS.regular,
    lineHeight: FONT_SIZES.body.small * LINE_HEIGHTS.normal,
    letterSpacing: LETTER_SPACING.normal,
    color: COLORS.text.secondary,
  },

  // UI element styles
  buttonLarge: {
    fontFamily: FONT_FAMILIES.primary,
    fontSize: FONT_SIZES.body.large,
    fontWeight: FONT_WEIGHTS.semiBold,
    lineHeight: FONT_SIZES.body.large * LINE_HEIGHTS.tight,
    letterSpacing: LETTER_SPACING.wide,
    color: COLORS.text.inverse,
    textTransform: 'uppercase',
  },

  buttonMedium: {
    fontFamily: FONT_FAMILIES.primary,
    fontSize: FONT_SIZES.button,
    fontWeight: FONT_WEIGHTS.semiBold,
    lineHeight: FONT_SIZES.button * LINE_HEIGHTS.tight,
    letterSpacing: LETTER_SPACING.wide,
    color: COLORS.text.inverse,
    textTransform: 'uppercase',
  },

  buttonSmall: {
    fontFamily: FONT_FAMILIES.primary,
    fontSize: FONT_SIZES.body.small,
    fontWeight: FONT_WEIGHTS.medium,
    lineHeight: FONT_SIZES.body.small * LINE_HEIGHTS.tight,
    letterSpacing: LETTER_SPACING.normal,
    color: COLORS.text.inverse,
  },

  // Input styles
  input: {
    fontFamily: FONT_FAMILIES.secondary,
    fontSize: FONT_SIZES.input,
    fontWeight: FONT_WEIGHTS.regular,
    lineHeight: FONT_SIZES.input * LINE_HEIGHTS.normal,
    letterSpacing: LETTER_SPACING.normal,
    color: COLORS.text.primary,
  },

  label: {
    fontFamily: FONT_FAMILIES.secondary,
    fontSize: FONT_SIZES.label,
    fontWeight: FONT_WEIGHTS.medium,
    lineHeight: FONT_SIZES.label * LINE_HEIGHTS.normal,
    letterSpacing: LETTER_SPACING.normal,
    color: COLORS.text.secondary,
  },

  // Utility styles
  caption: {
    fontFamily: FONT_FAMILIES.secondary,
    fontSize: FONT_SIZES.caption,
    fontWeight: FONT_WEIGHTS.regular,
    lineHeight: FONT_SIZES.caption * LINE_HEIGHTS.normal,
    letterSpacing: LETTER_SPACING.normal,
    color: COLORS.text.tertiary,
  },

  overline: {
    fontFamily: FONT_FAMILIES.secondary,
    fontSize: FONT_SIZES.overline,
    fontWeight: FONT_WEIGHTS.medium,
    lineHeight: FONT_SIZES.overline * LINE_HEIGHTS.normal,
    letterSpacing: LETTER_SPACING.widest,
    color: COLORS.text.tertiary,
    textTransform: 'uppercase',
  },

  // Medical specific styles
  medicalValue: {
    fontFamily: FONT_FAMILIES.monospace,
    fontSize: FONT_SIZES.body.medium,
    fontWeight: FONT_WEIGHTS.bold,
    lineHeight: FONT_SIZES.body.medium * LINE_HEIGHTS.tight,
    letterSpacing: LETTER_SPACING.normal,
    color: COLORS.primary.main,
  },

  dosage: {
    fontFamily: FONT_FAMILIES.monospace,
    fontSize: FONT_SIZES.body.small,
    fontWeight: FONT_WEIGHTS.semiBold,
    lineHeight: FONT_SIZES.body.small * LINE_HEIGHTS.normal,
    letterSpacing: LETTER_SPACING.normal,
    color: COLORS.medical.medication.prescription,
  },

  // Status styles
  success: {
    fontFamily: FONT_FAMILIES.secondary,
    fontSize: FONT_SIZES.body.small,
    fontWeight: FONT_WEIGHTS.medium,
    lineHeight: FONT_SIZES.body.small * LINE_HEIGHTS.normal,
    letterSpacing: LETTER_SPACING.normal,
    color: COLORS.status.success.main,
  },

  warning: {
    fontFamily: FONT_FAMILIES.secondary,
    fontSize: FONT_SIZES.body.small,
    fontWeight: FONT_WEIGHTS.medium,
    lineHeight: FONT_SIZES.body.small * LINE_HEIGHTS.normal,
    letterSpacing: LETTER_SPACING.normal,
    color: COLORS.status.warning.main,
  },

  error: {
    fontFamily: FONT_FAMILIES.secondary,
    fontSize: FONT_SIZES.body.small,
    fontWeight: FONT_WEIGHTS.medium,
    lineHeight: FONT_SIZES.body.small * LINE_HEIGHTS.normal,
    letterSpacing: LETTER_SPACING.normal,
    color: COLORS.status.error.main,
  },
};

// Typography utility functions
export const createTypographyVariant = (
  fontSize,
  fontWeight = FONT_WEIGHTS.regular,
  lineHeight = LINE_HEIGHTS.normal,
  letterSpacing = LETTER_SPACING.normal,
  color = COLORS.text.primary,
  fontFamily = FONT_FAMILIES.secondary
) => ({
  fontFamily,
  fontSize: normalize(fontSize),
  fontWeight,
  lineHeight: normalize(fontSize) * lineHeight,
  letterSpacing,
  color,
});

export const getResponsiveTypography = (variant, scale = 1) => ({
  ...TYPOGRAPHY[variant],
  fontSize: TYPOGRAPHY[variant].fontSize * scale,
  lineHeight: TYPOGRAPHY[variant].lineHeight * scale,
});

export default TYPOGRAPHY;