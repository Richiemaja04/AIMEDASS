/**
 * MediAssist App - Color Palette
 * Professional healthcare color scheme with accessibility compliance
 */

export const COLORS = {
  // Primary Colors
  primary: {
    main: '#4A7EFF',
    light: '#7BA3FF',
    dark: '#2E5BFF',
    100: '#E8EFFF',
    200: '#C7D9FF',
    300: '#A6C3FF',
    400: '#85ADFF',
    500: '#4A7EFF',
    600: '#2E5BFF',
    700: '#1E47E6',
    800: '#1836CC',
    900: '#1229B3',
  },

  // Secondary Colors
  secondary: {
    main: '#28C76F',
    light: '#5ED78A',
    dark: '#1BAE5F',
    100: '#E8F8F0',
    200: '#C7F0D8',
    300: '#9FE8BF',
    400: '#77E0A6',
    500: '#28C76F',
    600: '#1BAE5F',
    700: '#16954F',
    800: '#127C40',
    900: '#0E6330',
  },

  // Accent Colors
  accent: {
    main: '#FF6B6B',
    light: '#FF8E8E',
    dark: '#FF4848',
    100: '#FFE8E8',
    200: '#FFCACA',
    300: '#FFACAC',
    400: '#FF8E8E',
    500: '#FF6B6B',
    600: '#FF4848',
    700: '#E63946',
    800: '#CC2936',
    900: '#B31B26',
  },

  // Neutral Colors
  neutral: {
    white: '#FFFFFF',
    black: '#000000',
    gray: {
      50: '#F8F9FA',
      100: '#F1F3F4',
      200: '#E8EAED',
      300: '#DADCE0',
      400: '#BDC1C6',
      500: '#9AA0A6',
      600: '#80868B',
      700: '#5F6368',
      800: '#3C4043',
      900: '#202124',
    },
  },

  // Background Colors
  background: {
    primary: '#FFFFFF',
    secondary: '#F8F9FA',
    tertiary: '#F1F3F4',
    dark: '#1A1A1A',
    surface: '#FFFFFF',
    card: '#FFFFFF',
    modal: 'rgba(0, 0, 0, 0.5)',
  },

  // Text Colors
  text: {
    primary: '#2C3E50',
    secondary: '#5F6368',
    tertiary: '#80868B',
    disabled: '#BDC1C6',
    inverse: '#FFFFFF',
    link: '#4A7EFF',
  },

  // Status Colors
  status: {
    success: {
      main: '#28A745',
      light: '#5CB85C',
      dark: '#1E7E34',
      background: '#D4EDDA',
    },
    warning: {
      main: '#FFC107',
      light: '#FFD54F',
      dark: '#F57C00',
      background: '#FFF3CD',
    },
    error: {
      main: '#DC3545',
      light: '#E57373',
      dark: '#C62828',
      background: '#F8D7DA',
    },
    info: {
      main: '#17A2B8',
      light: '#4FC3F7',
      dark: '#0288D1',
      background: '#D1ECF1',
    },
  },

  // Medical Specific Colors
  medical: {
    vital: {
      heartRate: '#E74C3C',
      bloodPressure: '#8E44AD',
      temperature: '#F39C12',
      oxygen: '#3498DB',
      glucose: '#27AE60',
    },
    medication: {
      prescription: '#9B59B6',
      overTheCounter: '#16A085',
      supplement: '#F1C40F',
      emergency: '#E74C3C',
    },
    appointment: {
      scheduled: '#3498DB',
      confirmed: '#27AE60',
      cancelled: '#E74C3C',
      completed: '#95A5A6',
    },
  },

  // Gradient Colors
  gradients: {
    primary: ['#4A7EFF', '#7BA3FF'],
    secondary: ['#28C76F', '#5ED78A'],
    accent: ['#FF6B6B', '#FF8E8E'],
    medical: ['#4A7EFF', '#28C76F'],
    sunset: ['#FF6B6B', '#FFC107'],
    ocean: ['#17A2B8', '#4A7EFF'],
    success: ['#28A745', '#28C76F'],
    warning: ['#FFC107', '#FF8E8E'],
  },

  // Semantic Colors
  semantic: {
    online: '#28C76F',
    offline: '#95A5A6',
    syncing: '#FFC107',
    emergency: '#E74C3C',
    urgent: '#FF6B6B',
    normal: '#4A7EFF',
    low: '#28C76F',
  },

  // Shadow Colors
  shadow: {
    light: 'rgba(74, 126, 255, 0.1)',
    medium: 'rgba(74, 126, 255, 0.15)',
    dark: 'rgba(74, 126, 255, 0.2)',
    black: 'rgba(0, 0, 0, 0.1)',
    card: 'rgba(0, 0, 0, 0.05)',
  },

  // Border Colors
  border: {
    light: '#E8EAED',
    medium: '#DADCE0',
    dark: '#BDC1C6',
    focus: '#4A7EFF',
    error: '#DC3545',
    success: '#28A745',
  },
};

// Color utility functions
export const getColorWithOpacity = (color, opacity) => {
  const hex = color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

export const isDarkColor = (color) => {
  const hex = color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance < 0.5;
};

export const getContrastColor = (backgroundColor) => {
  return isDarkColor(backgroundColor) ? COLORS.text.inverse : COLORS.text.primary;
};

// Theme variants
export const THEME_VARIANTS = {
  light: {
    background: COLORS.background.primary,
    surface: COLORS.background.surface,
    text: COLORS.text.primary,
    border: COLORS.border.light,
  },
  dark: {
    background: COLORS.background.dark,
    surface: COLORS.neutral.gray[800],
    text: COLORS.text.inverse,
    border: COLORS.neutral.gray[600],
  },
};

export default COLORS;