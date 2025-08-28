/**
 * MediAssist App - Spacing System
 * Consistent spacing scale for layouts and components
 */

// Base spacing unit (4px)
const BASE_UNIT = 4;

// Spacing scale
export const SPACING = {
  // Extra small spacing
  xs: BASE_UNIT * 1,      // 4px
  sm: BASE_UNIT * 2,      // 8px
  md: BASE_UNIT * 3,      // 12px
  lg: BASE_UNIT * 4,      // 16px
  xl: BASE_UNIT * 5,      // 20px
  xxl: BASE_UNIT * 6,     // 24px
  xxxl: BASE_UNIT * 8,    // 32px

  // Semantic spacing
  tiny: BASE_UNIT * 0.5,   // 2px
  small: BASE_UNIT * 2,    // 8px
  medium: BASE_UNIT * 4,   // 16px
  large: BASE_UNIT * 6,    // 24px
  xlarge: BASE_UNIT * 8,   // 32px
  huge: BASE_UNIT * 12,    // 48px
  massive: BASE_UNIT * 16, // 64px

  // Component specific spacing
  component: {
    padding: BASE_UNIT * 4,        // 16px
    margin: BASE_UNIT * 4,         // 16px
    buttonPadding: BASE_UNIT * 3,  // 12px
    inputPadding: BASE_UNIT * 4,   // 16px
    cardPadding: BASE_UNIT * 5,    // 20px
    sectionPadding: BASE_UNIT * 6, // 24px
  },

  // Layout spacing
  layout: {
    screenPadding: BASE_UNIT * 4,     // 16px
    screenMargin: BASE_UNIT * 4,      // 16px
    sectionGap: BASE_UNIT * 6,        // 24px
    containerGap: BASE_UNIT * 4,      // 16px
    listItemGap: BASE_UNIT * 3,       // 12px
    headerHeight: BASE_UNIT * 14,     // 56px
    tabBarHeight: BASE_UNIT * 16,     // 64px
    bottomSheetHandle: BASE_UNIT * 1, // 4px
  },

  // Interactive element spacing
  interaction: {
    touchTarget: BASE_UNIT * 11,      // 44px (iOS minimum)
    iconPadding: BASE_UNIT * 2,       // 8px
    buttonSpacing: BASE_UNIT * 4,     // 16px
    formFieldSpacing: BASE_UNIT * 5,  // 20px
    modalPadding: BASE_UNIT * 6,      // 24px
  },

  // Medical UI spacing
  medical: {
    vitalsSpacing: BASE_UNIT * 4,     // 16px
    medicationCardGap: BASE_UNIT * 3, // 12px
    appointmentGap: BASE_UNIT * 4,    // 16px
    chartPadding: BASE_UNIT * 5,      // 20px
    timelineSpacing: BASE_UNIT * 6,   // 24px
  },

  // Animation spacing
  animation: {
    slideDistance: BASE_UNIT * 25,    // 100px
    parallaxOffset: BASE_UNIT * 5,    // 20px
    fabOffset: BASE_UNIT * 4,         // 16px
    rippleRadius: BASE_UNIT * 10,     // 40px
  },
};

// Border radius scale
export const BORDER_RADIUS = {
  none: 0,
  sm: BASE_UNIT * 1,    // 4px
  md: BASE_UNIT * 2,    // 8px
  lg: BASE_UNIT * 3,    // 12px
  xl: BASE_UNIT * 4,    // 16px
  xxl: BASE_UNIT * 6,   // 24px
  round: BASE_UNIT * 50, // 200px (circular)

  // Component specific
  button: BASE_UNIT * 2,     // 8px
  input: BASE_UNIT * 2,      // 8px
  card: BASE_UNIT * 3,       // 12px
  modal: BASE_UNIT * 4,      // 16px
  avatar: BASE_UNIT * 50,    // 200px (circular)
  fab: BASE_UNIT * 14,       // 56px (circular)
  pill: BASE_UNIT * 50,      // 200px (pill shape)
};

// Icon sizes
export const ICON_SIZES = {
  xs: BASE_UNIT * 3,      // 12px
  sm: BASE_UNIT * 4,      // 16px
  md: BASE_UNIT * 5,      // 20px
  lg: BASE_UNIT * 6,      // 24px
  xl: BASE_UNIT * 8,      // 32px
  xxl: BASE_UNIT * 10,    // 40px
  xxxl: BASE_UNIT * 12,   // 48px

  // Contextual sizes
  tab: BASE_UNIT * 6,     // 24px
  header: BASE_UNIT * 6,  // 24px
  fab: BASE_UNIT * 6,     // 24px
  avatar: BASE_UNIT * 10, // 40px
  logo: BASE_UNIT * 12,   // 48px
};

// Layout dimensions
export const DIMENSIONS = {
  // Screen breakpoints
  breakpoints: {
    sm: 480,
    md: 768,
    lg: 1024,
    xl: 1200,
  },

  // Component dimensions
  button: {
    height: {
      small: BASE_UNIT * 8,   // 32px
      medium: BASE_UNIT * 11, // 44px
      large: BASE_UNIT * 12,  // 48px
    },
    minWidth: BASE_UNIT * 16,  // 64px
  },

  input: {
    height: BASE_UNIT * 11,    // 44px
    multilineMinHeight: BASE_UNIT * 20, // 80px
  },

  card: {
    minHeight: BASE_UNIT * 20,  // 80px
    maxWidth: BASE_UNIT * 100,  // 400px
  },

  avatar: {
    small: BASE_UNIT * 8,      // 32px
    medium: BASE_UNIT * 10,    // 40px
    large: BASE_UNIT * 12,     // 48px
    xlarge: BASE_UNIT * 20,    // 80px
  },

  fab: {
    small: BASE_UNIT * 10,     // 40px
    medium: BASE_UNIT * 14,    // 56px
    large: BASE_UNIT * 18,     // 72px
  },

  // Medical specific dimensions
  medical: {
    vitalsCard: {
      height: BASE_UNIT * 30,  // 120px
      width: BASE_UNIT * 35,   // 140px
    },
    medicationCard: {
      height: BASE_UNIT * 20,  // 80px
      minWidth: BASE_UNIT * 70, // 280px
    },
    appointmentCard: {
      height: BASE_UNIT * 25,  // 100px
    },
    chartHeight: BASE_UNIT * 50, // 200px
  },
};

// Z-index scale
export const Z_INDEX = {
  base: 0,
  dropdown: 100,
  sticky: 200,
  overlay: 300,
  modal: 400,
  popover: 500,
  tooltip: 600,
  notification: 700,
  loading: 800,
  emergency: 900,
  debug: 999,
};

// Utility functions
export const spacing = (multiplier = 1) => BASE_UNIT * multiplier;

export const horizontalScale = (size) => ({
  paddingHorizontal: size,
  marginHorizontal: size,
});

export const verticalScale = (size) => ({
  paddingVertical: size,
  marginVertical: size,
});

export const uniformScale = (size) => ({
  padding: size,
  margin: size,
});

export const createSpacing = (top = 0, right = top, bottom = top, left = right) => ({
  paddingTop: top,
  paddingRight: right,
  paddingBottom: bottom,
  paddingLeft: left,
});

export const createMargin = (top = 0, right = top, bottom = top, left = right) => ({
  marginTop: top,
  marginRight: right,
  marginBottom: bottom,
  marginLeft: left,
});

// Responsive spacing utilities
export const getResponsiveSpacing = (baseSize, screenWidth) => {
  const { breakpoints } = DIMENSIONS;
  
  if (screenWidth >= breakpoints.xl) {
    return baseSize * 1.5;
  } else if (screenWidth >= breakpoints.lg) {
    return baseSize * 1.25;
  } else if (screenWidth >= breakpoints.md) {
    return baseSize * 1.1;
  } else {
    return baseSize;
  }
};

export const getGridSpacing = (columns, screenWidth, gutterSize = SPACING.md) => {
  const containerPadding = SPACING.layout.screenPadding;
  const availableWidth = screenWidth - (containerPadding * 2);
  const totalGutters = (columns - 1) * gutterSize;
  const columnWidth = (availableWidth - totalGutters) / columns;
  
  return {
    columnWidth,
    gutterSize,
    containerPadding,
  };
};

export default SPACING;