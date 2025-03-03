import React from 'react';
import { Image, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import theme from '../../theme';

const Icon = ({ source, size = 24, color, style }) => {
  const tintColor = color || theme.colors.text.primary;
  
  return (
    <Image
      source={source}
      style={[
        styles.icon,
        {
          width: size,
          height: size,
          tintColor,
        },
        style,
      ]}
      resizeMode="contain"
    />
  );
};

Icon.propTypes = {
  source: PropTypes.number.isRequired,
  size: PropTypes.number,
  color: PropTypes.string,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};

const styles = StyleSheet.create({
  icon: {
    width: 24,
    height: 24,
  },
});

export default Icon;
