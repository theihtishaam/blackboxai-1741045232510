import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import PropTypes from 'prop-types';
import { BlurView } from 'expo-blur';
import Icon from './Icon';
import theme from '../../theme';

const EmptyState = ({
  icon,
  title,
  message,
  actionLabel,
  onAction,
  style,
}) => {
  const { width } = useWindowDimensions();
  const maxWidth = Math.min(width * 0.8, 300);

  const getIconSource = () => {
    switch (icon) {
      case 'stories':
        return require('../../assets/icons/stories-inactive.svg');
      case 'camera':
        return require('../../assets/icons/camera-inactive.svg');
      case 'profile':
        return require('../../assets/icons/profile-inactive.svg');
      default:
        return require('../../assets/icons/stories-inactive.svg');
    }
  };

  return (
    <View style={[styles.container, style]}>
      <View style={[styles.content, { maxWidth }]}>
        <View style={styles.iconContainer}>
          <Icon
            source={getIconSource()}
            size={48}
            color={theme.colors.text.secondary}
          />
        </View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>
        {actionLabel && onAction && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={onAction}
            activeOpacity={0.8}
          >
            <BlurView intensity={80} style={styles.actionButtonContent}>
              <Text style={styles.actionButtonText}>{actionLabel}</Text>
            </BlurView>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

EmptyState.propTypes = {
  icon: PropTypes.oneOf(['stories', 'camera', 'profile']).isRequired,
  title: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  actionLabel: PropTypes.string,
  onAction: PropTypes.func,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  content: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    ...theme.shadows.md,
  },
  title: {
    fontSize: theme.typography.fontSize.xl,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  message: {
    fontSize: theme.typography.fontSize.base,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
    lineHeight: theme.typography.lineHeight.relaxed,
  },
  actionButton: {
    overflow: 'hidden',
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.sm,
  },
  actionButtonContent: {
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  actionButtonText: {
    fontSize: theme.typography.fontSize.base,
    fontFamily: theme.typography.fontFamily.semiBold,
    color: theme.colors.primary,
    textAlign: 'center',
  },
});

export default EmptyState;
