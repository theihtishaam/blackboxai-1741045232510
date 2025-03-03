import React from 'react';
import { View, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import theme from '../theme';

// Import SVG icons
import CameraActiveIcon from '../../assets/icons/camera-active.svg';
import CameraInactiveIcon from '../../assets/icons/camera-inactive.svg';
import StoriesActiveIcon from '../../assets/icons/stories-active.svg';
import StoriesInactiveIcon from '../../assets/icons/stories-inactive.svg';
import ProfileActiveIcon from '../../assets/icons/profile-active.svg';
import ProfileInactiveIcon from '../../assets/icons/profile-inactive.svg';

const icons = {
  Camera: {
    active: CameraActiveIcon,
    inactive: CameraInactiveIcon,
  },
  Stories: {
    active: StoriesActiveIcon,
    inactive: StoriesInactiveIcon,
  },
  Profile: {
    active: ProfileActiveIcon,
    inactive: ProfileInactiveIcon,
  },
};

const TabBarIcon = ({ routeName, focused }) => {
  const iconSet = icons[routeName];
  if (!iconSet) return null;

  const Icon = focused ? iconSet.active : iconSet.inactive;
  const color = focused ? theme.colors.primary : theme.colors.text.secondary;

  return (
    <View style={styles.container}>
      <Icon width={24} height={24} color={color} />
    </View>
  );
};

TabBarIcon.propTypes = {
  routeName: PropTypes.string.isRequired,
  focused: PropTypes.bool.isRequired,
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default TabBarIcon;
