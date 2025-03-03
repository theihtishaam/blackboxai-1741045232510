import React, { useEffect, useCallback } from 'react';
import {
  View,
  FlatList,
  RefreshControl,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import {
  fetchStories,
  selectAllStories,
  selectStoriesLoading,
  selectStoriesError,
} from '../../store/slices/storySlice';
import { useAuth } from '../../context/AuthContext';
import StoryPreview from '../../components/stories/StoryPreview';
import CreateStoryButton from '../../components/stories/CreateStoryButton';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import theme from '../../theme';

const StoriesScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { user } = useAuth();
  
  const stories = useSelector(selectAllStories);
  const isLoading = useSelector(selectStoriesLoading);
  const error = useSelector(selectStoriesError);
  
  const loadStories = useCallback(() => {
    dispatch(fetchStories());
  }, [dispatch]);

  useEffect(() => {
    loadStories();
  }, [loadStories]);

  const handleRefresh = useCallback(() => {
    loadStories();
  }, [loadStories]);

  const renderHeader = useCallback(() => (
    <CreateStoryButton style={styles.createButton} />
  ), []);

  const renderStory = useCallback(({ item }) => (
    <StoryPreview
      story={item}
      style={styles.storyPreview}
    />
  ), []);

  const renderEmpty = useCallback(() => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={theme.colors.primary} size="large" />
        </View>
      );
    }

    if (error) {
      return (
        <ErrorState
          message="Couldn't load stories"
          error={error}
          onRetry={loadStories}
        />
      );
    }

    return (
      <EmptyState
        icon="stories"
        title="No Stories Yet"
        message="Be the first to share your creative masterpiece!"
        actionLabel="Create Story"
        onAction={() => navigation.navigate('Camera', { mode: 'story' })}
      />
    );
  }, [isLoading, error, loadStories, navigation]);

  const keyExtractor = useCallback((item) => item.id, []);

  return (
    <View style={styles.container}>
      <FlatList
        data={stories}
        renderItem={renderStory}
        keyExtractor={keyExtractor}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  listContent: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
    minHeight: '100%',
  },
  createButton: {
    marginRight: theme.spacing.sm,
  },
  storyPreview: {
    marginRight: theme.spacing.sm,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
  },
});

export default StoriesScreen;
