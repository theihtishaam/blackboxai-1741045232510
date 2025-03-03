export const colors = {
  // Primary colors
  primary: '#4CAF50',
  primaryLight: '#81C784',
  primaryDark: '#388E3C',

  // Secondary colors
  secondary: '#2196F3',
  secondaryLight: '#64B5F6',
  secondaryDark: '#1976D2',

  // Accent colors
  accent: '#FF4081',
  accentLight: '#FF80AB',
  accentDark: '#F50057',

  // Status colors
  success: '#4CAF50',
  warning: '#FFC107',
  error: '#F44336',
  info: '#2196F3',

  // Grayscale
  black: '#000000',
  darkGray: '#212121',
  gray: '#757575',
  lightGray: '#BDBDBD',
  white: '#FFFFFF',

  // Background colors
  background: {
    primary: '#FFFFFF',
    secondary: '#F5F5F5',
    tertiary: '#EEEEEE',
  },

  // Text colors
  text: {
    primary: '#1a1a1a',
    secondary: '#666666',
    tertiary: '#999999',
    inverse: '#FFFFFF',
  },

  // Border colors
  border: {
    light: '#e9ecef',
    medium: '#dee2e6',
    dark: '#ced4da',
  },

  // Overlay colors
  overlay: {
    light: 'rgba(0, 0, 0, 0.1)',
    medium: 'rgba(0, 0, 0, 0.3)',
    dark: 'rgba(0, 0, 0, 0.5)',
  },
};

export const typography = {
  // Font families
  fontFamily: {
    regular: 'Inter-Regular',
    medium: 'Inter-Medium',
    semiBold: 'Inter-SemiBold',
    bold: 'Inter-Bold',
  },

  // Font sizes
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
  },

  // Line heights
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
    loose: 2,
  },
};

export const spacing = {
  // Base spacing unit (4px)
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
};

export const borderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 24,
  full: 9999,
};

export const shadows = {
  none: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 6,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.37,
    shadowRadius: 7.49,
    elevation: 12,
  },
};

export const animation = {
  // Animation durations
  duration: {
    fast: 200,
    normal: 300,
    slow: 500,
  },

  // Animation timing functions
  easing: {
    easeInOut: 'ease-in-out',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    linear: 'linear',
  },
};

// Common style mixins
export const mixins = {
  // Centered content
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Row with space between
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  // Row with space around
  rowAround: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },

  // Absolute fill
  absoluteFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
};

// Layout constants
export const layout = {
  // Screen padding
  screenPadding: spacing.md,
  
  // Header height
  headerHeight: 56,
  
  // Bottom tab height
  tabBarHeight: 60,
  
  // Maximum content width
  maxWidth: 500,
};

export default {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  animation,
  mixins,
  layout,
};
