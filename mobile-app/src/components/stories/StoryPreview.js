import React, { useCallback } from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  Image,
  StyleSheet,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from 'expo-blur';
import PropTypes from 'prop-types';
import { setActiveStory } from '../../store/slices/storySlice';
import { selectViewedStories } from '../../store/slices/storySlice';
import Icon from '../common/Icon';
import theme from '../../theme';

const StoryPreview = ({ story, style }) => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const viewedStories = useSelector(selectViewedStories);
  const isViewed = viewedStories.has(story.id);

  const handlePress = useCallback(() => {
    dispatch(setActiveStory(story));
    navigation.navigate('ViewStory', { storyId: story.id });
  }, [dispatch, navigation, story]);

  const handleLongPress = useCallback(() => {
    navigation.navigate('StoryOptions', { storyId: story.id });
  }, [navigation, story.id]);

  const renderGradient = () => (
    <View style={styles.gradient}>
      <Text style={styles.username} numberOfLines={1}>
        {story.user.username}
      </Text>
      {story.isPremium && (
        <Icon
          source={require('../../../assets/icons/lock.svg')}
          size={12}
          color={theme.colors.white}
          style={styles.premiumIcon}
        />
      )}
    </View>
  );

  const renderBorder = () => {
    if (isViewed) return null;

    return (
      <View
        style={[
          styles.border,
          story.isPremium && styles.borderPremium,
        ]}
      />
    );
  };

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={handlePress}
      onLongPress={handleLongPress}
      activeOpacity={0.9}
    >
      {renderBorder()}
      <Image
        source={{ uri: story.thumbnail }}
        style={styles.thumbnail}
        resizeMode="cover"
      />
      {Platform.OS === 'ios' ? (
        <BlurView intensity={80} style={styles.overlay}>
          {renderGradient()}
        </BlurView>
      ) : (
        <View style={[styles.overlay, styles.overlayAndroid]}>
          {renderGradient()}
        </View>
      )}
      {story.hasMultiple && (
        <View style={styles.multipleIndicator}>
          <Icon
            source={require('../../../assets/icons/more.svg')}
            size={16}
            color={theme.colors.white}
          />
        </View>
      )}
    </TouchableOpacity>
  );
};

StoryPreview.propTypes = {
  story: PropTypes.shape({
    id: PropTypes.string.isRequired,
    thumbnail: PropTypes.string.isRequired,
    user: PropTypes.shape({
      username: PropTypes.string.isRequired,
    }).isRequired,
    isPremium: PropTypes.bool,
    hasMultiple: PropTypes.bool,
  }).isRequired,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};

const styles = StyleSheet.create({
  container: {
    width: 80,
    height: 120,
    marginHorizontal: theme.spacing.xs,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
  },
  border: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    borderRadius: theme.borderRadius.lg,
    zIndex: 1,
  },
  borderPremium: {
    borderColor: theme.colors.accent,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    backgroundColor: theme.colors.background.secondary,
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 48,
  },
  overlayAndroid: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  gradient: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: theme.spacing.xs,
  },
  username: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.xs,
    fontFamily: theme.typography.fontFamily.medium,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  premiumIcon: {
    position: 'absolute',
    top: theme.spacing.xs,
    right: theme.spacing.xs,
  },
  multipleIndicator: {
    position: 'absolute',
    top: theme.spacing.xs,
    right: theme.spacing.xs,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.overlay.medium,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default React.memo(StoryPreview);
