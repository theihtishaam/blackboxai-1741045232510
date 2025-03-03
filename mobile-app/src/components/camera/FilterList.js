import React, { useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  StyleSheet,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useSubscription } from '../../context/SubscriptionContext';
import {
  selectSelectedFilter,
  setSelectedFilter,
} from '../../store/slices/filterSlice';
import Icon from '../common/Icon';
import theme from '../../theme';

const BASIC_FILTERS = [
  { id: 'normal', name: 'Normal', type: 'basic' },
  { id: 'vivid', name: 'Vivid', type: 'basic', settings: { saturation: 1.5, contrast: 1.2 } },
  { id: 'warm', name: 'Warm', type: 'basic', settings: { temperature: 0.3, saturation: 1.1 } },
  { id: 'cool', name: 'Cool', type: 'basic', settings: { temperature: -0.3, saturation: 1.1 } },
  { id: 'bw', name: 'B&W', type: 'basic', settings: { saturation: 0 } },
];

const AI_FILTERS = [
  { id: 'cartoon', name: 'Cartoon', type: 'ai', premium: true },
  { id: 'anime', name: 'Anime', type: 'ai', premium: true },
  { id: 'oil-painting', name: 'Oil Painting', type: 'ai', premium: true },
  { id: 'sketch', name: 'Sketch', type: 'ai', premium: true },
  { id: 'cyberpunk', name: 'Cyberpunk', type: 'ai', premium: true },
];

const FilterList = () => {
  const dispatch = useDispatch();
  const { features } = useSubscription();
  const selectedFilter = useSelector(selectSelectedFilter);
  const [previewImages, setPreviewImages] = useState({});
  const [loadingPreviews, setLoadingPreviews] = useState({});

  const handleFilterSelect = useCallback((filter) => {
    if (filter.premium && !features?.filters?.ai) {
      // Show premium upgrade prompt
      Alert.alert(
        'Premium Feature',
        'Upgrade to Premium to unlock AI filters and more!',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Upgrade',
            onPress: () => navigation.navigate('Subscription')
          }
        ]
      );
      return;
    }
    dispatch(setSelectedFilter(filter));
  }, [dispatch, features]);

  const generatePreview = useCallback(async (filter) => {
    if (previewImages[filter.id]) return;

    try {
      setLoadingPreviews(prev => ({ ...prev, [filter.id]: true }));
      
      // In a real app, you would generate a preview using the actual filter
      // For now, we'll simulate it with a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setPreviewImages(prev => ({
        ...prev,
        [filter.id]: `preview_url_for_${filter.id}`,
      }));
    } catch (error) {
      console.error('Preview generation error:', error);
    } finally {
      setLoadingPreviews(prev => ({ ...prev, [filter.id]: false }));
    }
  }, [previewImages]);

  const renderFilterItem = useCallback(({ item: filter }) => (
    <TouchableOpacity
      style={[
        styles.filterItem,
        selectedFilter?.id === filter.id && styles.selectedFilter,
      ]}
      onPress={() => handleFilterSelect(filter)}
    >
      {filter.premium && !features?.filters?.ai && (
        <View style={styles.premiumBadge}>
          <Icon
            source={require('../../../assets/icons/lock.svg')}
            size={12}
            color={theme.colors.white}
          />
        </View>
      )}
      
      {loadingPreviews[filter.id] ? (
        <ActivityIndicator color={theme.colors.primary} />
      ) : (
        <Image
          source={previewImages[filter.id] ? { uri: previewImages[filter.id] } : null}
          style={styles.filterPreview}
        />
      )}
      
      <Text style={styles.filterName}>{filter.name}</Text>
    </TouchableOpacity>
  ), [selectedFilter, features, loadingPreviews, previewImages]);

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {BASIC_FILTERS.map(filter => renderFilterItem({ item: filter }))}
        
        {AI_FILTERS.map(filter => renderFilterItem({ item: filter }))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: theme.layout.tabBarHeight + theme.spacing.xxl + 80,
    left: 0,
    right: 0,
    height: 100,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
  },
  filterItem: {
    alignItems: 'center',
    marginHorizontal: theme.spacing.xs,
    opacity: 0.7,
  },
  selectedFilter: {
    opacity: 1,
    transform: [{ scale: 1.1 }],
  },
  filterPreview: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.overlay.light,
    marginBottom: theme.spacing.xs,
  },
  filterName: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.xs,
    fontFamily: theme.typography.fontFamily.medium,
  },
  premiumBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
});

export default FilterList;
