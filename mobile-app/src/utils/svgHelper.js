import React from 'react';
import { SvgXml } from 'react-native-svg';
import theme from '../theme';

// Function to read SVG file content and return a component
export const createSvgIcon = (svgContent, { size = 24, color, style } = {}) => {
  const iconColor = color || theme.colors.text.primary;
  
  // Replace currentColor with the actual color
  const processedSvg = svgContent.replace(/currentColor/g, iconColor);

  return (
    <SvgXml 
      xml={processedSvg}
      width={size}
      height={size}
      style={style}
    />
  );
};

// Load and cache all SVG icons
export const icons = {
  tabBar: {
    camera: {
      active: require('../../assets/icons/camera-active.svg'),
      inactive: require('../../assets/icons/camera-inactive.svg'),
    },
    stories: {
      active: require('../../assets/icons/stories-active.svg'),
      inactive: require('../../assets/icons/stories-inactive.svg'),
    },
    profile: {
      active: require('../../assets/icons/profile-active.svg'),
      inactive: require('../../assets/icons/profile-inactive.svg'),
    },
  },
};

// Helper function to get tab bar icon
export const getTabBarIcon = (routeName, focused) => {
  const iconSet = icons.tabBar[routeName.toLowerCase()];
  if (!iconSet) return null;

  const svgContent = focused ? iconSet.active : iconSet.inactive;
  const color = focused ? theme.colors.primary : theme.colors.text.secondary;

  return createSvgIcon(svgContent, { color });
};

export default {
  createSvgIcon,
  icons,
  getTabBarIcon,
};
