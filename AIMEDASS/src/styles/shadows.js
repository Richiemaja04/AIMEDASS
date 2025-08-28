/**
 * MediAssist App - Shadow System
 * Professional shadow system for depth and elevation
 */

import { Platform } from 'react-native';
import { COLORS } from './colors';

// Shadow elevation levels (Material Design inspired)
const ELEVATIONS = {
  0: 0,
  1: 1,
  2: 2,
  3: 3,
  4: 4,
  5: 5,
  6: 6,
  8: 8,
  12: 12,
  16: 16,
  24: 24,
};

// iOS shadow configurations
const iOS_SHADOWS = {
  0: {
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
  },
  1: {
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
  },
  2: {
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.20,
    shadowRadius: 1.41,
  },
  3: {
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  4: {
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
  },
  5: {
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  6: {
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
  },
  8: {
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
  },
  12: {
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.37,
    shadowRadius: 7.49,
  },
  16: {
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.44,
    shadowRadius: 10.32,
  },
  24: {
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.58,
    shadowRadius: 16.00,
  },
};

// Android shadow configurations (elevation)
const ANDROID_SHADOWS = {
  0: { elevation: 0 },
  1: { elevation: 1 },
  2: { elevation: 2 },
  3: { elevation: 3 },
  4: { elevation: 4 },
  5: { elevation: 5 },
  6: { elevation: 6 },
  8: { elevation: 8 },
  12: { elevation: 12 },
  16: { elevation: 16 },
  24: { elevation: 24 },
};

// Create platform-specific shadow function
const createShadow = (elevation, shadowColor = COLORS.shadow.black) => {
  if (Platform.OS === 'ios') {
    return {
      ...iOS_SHADOWS[elevation],
      shadowColor,
    };
  } else {
    return ANDROID_SHADOWS[elevation];
  }
};

// Main shadow system
export const SHADOWS = {
  // Basic elevation levels
  none: createShadow(0),
  small: createShadow(1),
  medium: createShadow(2),
  large: createShadow(4),
  xlarge: createShadow(8),
  xxlarge: createShadow(16),

  // Component-specific shadows
  card: createShadow(2, COLORS.shadow.card),
  cardHover: createShadow(4, COLORS.shadow.card),
  cardPressed: createShadow(1, COLORS.shadow.card),
  
  button: createShadow(2, COLORS.shadow.light),
  buttonHover: createShadow(4, COLORS.shadow.light),
  buttonPressed: createShadow(1, COLORS.shadow.light),
  
  fab: createShadow(6, COLORS.shadow.medium),
  fabHover: createShadow(8, COLORS.shadow.medium),
  fabPressed: createShadow(4, COLORS.shadow.medium),
  
  modal: createShadow(24, COLORS.shadow.dark),
  bottomSheet: createShadow(16, COLORS.shadow.medium),
  popover: createShadow(8, COLORS.shadow.medium),
  tooltip: createShadow(6, COLORS.shadow.light),
  
  header: createShadow(4, COLORS.shadow.light),
  tabBar: createShadow(8, COLORS.shadow.light),
  
  input: createShadow(1, COLORS.shadow.light),
  inputFocus: createShadow(3, COLORS.primary.main),
  
  // Medical-specific shadows
  medicationCard: createShadow(2, COLORS.shadow.light),
  appointmentCard: createShadow(3, COLORS.shadow.light),
  vitalsCard: createShadow(4, COLORS.shadow.medium),
  emergencyCard: createShadow(8, COLORS.accent.main),
  
  // State-specific shadows
  success: createShadow(3, COLORS.status.success.main),
  warning: createShadow(3, COLORS.status.warning.main),
  error: createShadow(3, COLORS.status.error.main),
  info: createShadow(3, COLORS.status.info.main),
};

// Custom shadow variations with colors
export const createColoredShadow = (elevation, color, opacity = 0.3) => {
  if (Platform.OS === 'ios') {
    const baseShadow = iOS_SHADOWS[elevation];
    return {
      ...baseShadow,
      shadowColor: color,
      shadowOpacity: opacity,
    };
  } else {
    return {
      elevation,
      shadowColor: color,
    };
  }
};

// Animated shadow utilities
export const getAnimatedShadow = (elevation, color = COLORS.shadow.black) => ({
  ...createShadow(elevation, color),
  // Additional properties for smooth animation
  shadowRadius: iOS_SHADOWS[elevation]?.shadowRadius || 0,
  shadowOpacity: iOS_SHADOWS[elevation]?.shadowOpacity || 0,
});

// Shadow presets for common UI patterns
export const SHADOW_PRESETS = {
  // Navigation shadows
  navigation: {
    header: SHADOWS.header,
    tabBar: SHADOWS.tabBar,
    drawer: createShadow(16, COLORS.shadow.dark),
  },

  // Content shadows
  content: {
    card: SHADOWS.card,
    list: SHADOWS.small,
    section: SHADOWS.medium,
  },

  // Interactive shadows
  interactive: {
    button: SHADOWS.button,
    fab: SHADOWS.fab,
    switch: SHADOWS.small,
    slider: SHADOWS.medium,
  },

  // Overlay shadows
  overlay: {
    modal: SHADOWS.modal,
    popup: SHADOWS.popover,
    dropdown: SHADOWS.large,
    toast: SHADOWS.xlarge,
  },

  // Form shadows
  form: {
    input: SHADOWS.input,
    inputFocus: SHADOWS.inputFocus,
    checkbox: SHADOWS.small,
    radio: SHADOWS.small,
  },

  // Medical UI shadows
  medical: {
    vital: SHADOWS.vitalsCard,
    medication: SHADOWS.medicationCard,
    appointment: SHADOWS.appointmentCard,
    emergency: SHADOWS.emergencyCard,
    chart: SHADOWS.large,
  },
};

// Utility functions
export const getShadowStyle = (elevation, color) => {
  return createShadow(elevation, color);
};

export const combineShadows = (...shadows) => {
  if (Platform.OS === 'ios') {
    // For iOS, we can only apply one shadow, so use the highest elevation
    const maxShadow = shadows.reduce((max, shadow) => {
      const maxRadius = max.shadowRadius || 0;
      const currentRadius = shadow.shadowRadius || 0;
      return currentRadius > maxRadius ? shadow : max;
    }, shadows[0]);
    return maxShadow;
  } else {
    // For Android, use the highest elevation
    const maxElevation = Math.max(...shadows.map(s => s.elevation || 0));
    return { elevation: maxElevation };
  }
};

export const scaleShadow = (shadow, scale) => {
  if (Platform.OS === 'ios') {
    return {
      ...shadow,
      shadowRadius: (shadow.shadowRadius || 0) * scale,
      shadowOffset: {
        width: (shadow.shadowOffset?.width || 0) * scale,
        height: (shadow.shadowOffset?.height || 0) * scale,
      },
    };
  } else {
    return {
      elevation: (shadow.elevation || 0) * scale,
    };
  }
};

// Responsive shadow system
export const getResponsiveShadow = (baseShadow, screenSize) => {
  const scale = screenSize === 'large' ? 1.2 : screenSize === 'small' ? 0.8 : 1;
  return scaleShadow(baseShadow, scale);
};

export default SHADOWS;