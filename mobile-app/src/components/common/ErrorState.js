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

const ErrorState = ({
  message,
  error,
  onRetry,
  style,
}) => {
  const { width } = useWindowDimensions();
  const maxWidth = Math.min(width * 0.8, 300);

  const errorMessage = error?.message || error;
  const showTechnicalError = __DEV__ && errorMessage;

  return (
    <View style={[styles.container, style]}>
      <View style={[styles.content, { maxWidth }]}>
        <View style={styles.iconContainer}>
          <Icon
            source={require('../../assets/icons/error.svg')}
            size={48}
            color={theme.colors.error}
          />
        </View>
        <Text style={styles.message}>{message}</Text>
        {showTechnicalError && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        )}
        {onRetry && (
          <TouchableOpacity
            style={styles.retryButton}
            onPress={onRetry}
            activeOpacity={0.8}
          >
            <BlurView intensity={80} style={styles.retryButtonContent}>
              <Icon
                source={require('../../assets/icons/refresh.svg')}
                size={16}
                color={theme.colors.white}
                style={styles.retryIcon}
              />
              <Text style={styles.retryButtonText}>Try Again</Text>
            </BlurView>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

ErrorState.propTypes = {
  message: PropTypes.string.isRequired,
  error: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.object,
  ]),
  onRetry: PropTypes.func,
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
    backgroundColor: theme.colors.error + '10', // 10% opacity
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    ...theme.shadows.md,
  },
  message: {
    fontSize: theme.typography.fontSize.lg,
    fontFamily: theme.typography.fontFamily.semiBold,
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  errorContainer: {
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.xl,
    width: '100%',
  },
  errorText: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.mono,
    color: theme.colors.text.secondary,
  },
  retryButton: {
    overflow: 'hidden',
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.sm,
  },
  retryButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.error + '20', // 20% opacity
  },
  retryIcon: {
    marginRight: theme.spacing.xs,
  },
  retryButtonText: {
    fontSize: theme.typography.fontSize.base,
    fontFamily: theme.typography.fontFamily.semiBold,
    color: theme.colors.white,
    textAlign: 'center',
  },
});

export default ErrorState;
