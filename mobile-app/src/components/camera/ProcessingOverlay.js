import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from 'expo-blur';
import LottieView from 'lottie-react-native';
import {
  selectProcessing,
  selectError,
  resetCamera,
} from '../../store/slices/cameraSlice';
import Icon from '../common/Icon';
import theme from '../../theme';

const ProcessingOverlay = () => {
  const dispatch = useDispatch();
  const processing = useSelector(selectProcessing);
  const error = useSelector(selectError);
  const progressAnimation = new Animated.Value(0);

  React.useEffect(() => {
    if (processing.status === 'processing') {
      Animated.timing(progressAnimation, {
        toValue: processing.progress,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  }, [processing.progress]);

  if (processing.status === 'idle') return null;

  const renderContent = () => {
    switch (processing.status) {
      case 'processing':
        return (
          <View style={styles.contentContainer}>
            <LottieView
              source={require('../../../assets/animations/processing.json')}
              autoPlay
              loop
              style={styles.animation}
            />
            <Text style={styles.title}>Processing your masterpiece...</Text>
            <Text style={styles.subtitle}>
              {processing.progress < 100
                ? 'Applying filters and effects'
                : 'Almost done!'}
            </Text>
            <View style={styles.progressContainer}>
              <Animated.View
                style={[
                  styles.progressBar,
                  {
                    width: progressAnimation.interpolate({
                      inputRange: [0, 100],
                      outputRange: ['0%', '100%'],
                    }),
                  },
                ]}
              />
            </View>
            <Text style={styles.progressText}>{`${Math.round(processing.progress)}%`}</Text>
          </View>
        );

      case 'completed':
        return (
          <View style={styles.contentContainer}>
            <LottieView
              source={require('../../../assets/animations/success.json')}
              autoPlay
              loop={false}
              style={styles.animation}
            />
            <Text style={styles.title}>Processing Complete!</Text>
            <Text style={styles.subtitle}>Your creation is ready to share</Text>
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.primaryButton]}
                onPress={() => {
                  // Navigate to share screen or show share options
                }}
              >
                <Icon
                  source={require('../../../assets/icons/share.svg')}
                  size={20}
                  color={theme.colors.white}
                  style={styles.buttonIcon}
                />
                <Text style={styles.buttonText}>Share</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.secondaryButton]}
                onPress={() => dispatch(resetCamera())}
              >
                <Icon
                  source={require('../../../assets/icons/camera-active.svg')}
                  size={20}
                  color={theme.colors.primary}
                  style={styles.buttonIcon}
                />
                <Text style={[styles.buttonText, styles.secondaryButtonText]}>
                  Take Another
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        );

      case 'failed':
        return (
          <View style={styles.contentContainer}>
            <LottieView
              source={require('../../../assets/animations/error.json')}
              autoPlay
              loop={false}
              style={styles.animation}
            />
            <Text style={styles.title}>Oops! Something went wrong</Text>
            <Text style={styles.subtitle}>{error || 'Failed to process media'}</Text>
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={() => dispatch(resetCamera())}
            >
              <Icon
                source={require('../../../assets/icons/refresh.svg')}
                size={20}
                color={theme.colors.white}
                style={styles.buttonIcon}
              />
              <Text style={styles.buttonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        );

      default:
        return <ActivityIndicator size="large" color={theme.colors.primary} />;
    }
  };

  return (
    <BlurView intensity={100} style={StyleSheet.absoluteFill}>
      <View style={styles.container}>{renderContent()}</View>
    </BlurView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  contentContainer: {
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  animation: {
    width: 200,
    height: 200,
  },
  title: {
    fontSize: theme.typography.fontSize.xl,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.white,
    marginTop: theme.spacing.lg,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: theme.typography.fontSize.base,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.sm,
    textAlign: 'center',
  },
  progressContainer: {
    width: '80%',
    height: 4,
    backgroundColor: theme.colors.overlay.light,
    borderRadius: 2,
    marginTop: theme.spacing.xl,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: theme.colors.primary,
  },
  progressText: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.sm,
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: theme.spacing.xl,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    marginHorizontal: theme.spacing.sm,
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
  },
  secondaryButton: {
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  buttonIcon: {
    marginRight: theme.spacing.xs,
  },
  buttonText: {
    fontSize: theme.typography.fontSize.base,
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.white,
  },
  secondaryButtonText: {
    color: theme.colors.primary,
  },
});

export default ProcessingOverlay;
