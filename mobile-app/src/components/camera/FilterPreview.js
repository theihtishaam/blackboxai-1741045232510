import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { useSelector } from 'react-redux';
import { Camera } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator';
import { selectSelectedFilter } from '../../store/slices/filterSlice';
import { useSubscription } from '../../context/SubscriptionContext';
import { applyBasicFilter } from '../../utils/mediaProcessing';
import theme from '../../theme';

const PREVIEW_INTERVAL = 500; // Update preview every 500ms

const FilterPreview = ({ cameraRef }) => {
  const selectedFilter = useSelector(selectSelectedFilter);
  const { features } = useSubscription();
  const [previewImage, setPreviewImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const capturePreview = useCallback(async () => {
    if (!cameraRef.current || isProcessing) return;

    try {
      setIsProcessing(true);

      // Take a low-res photo for preview
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.1,
        skipProcessing: true,
      });

      // Resize to an even smaller size for quick processing
      const resized = await ImageManipulator.manipulateAsync(
        photo.uri,
        [{ resize: { width: 240 } }],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      );

      if (selectedFilter && selectedFilter.id !== 'normal') {
        if (selectedFilter.type === 'basic' || !features?.filters?.ai) {
          // Apply basic filter preview
          const processed = await applyBasicFilter(resized.uri, selectedFilter);
          setPreviewImage(processed);
        } else {
          // For AI filters, we'll just show a placeholder effect
          // Real AI processing would be too slow for live preview
          const placeholderEffect = await ImageManipulator.manipulateAsync(
            resized.uri,
            [
              { adjust: { saturation: 1.2 } },
              { adjust: { contrast: 1.1 } },
            ],
            { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
          );
          setPreviewImage(placeholderEffect.uri);
        }
      } else {
        setPreviewImage(resized.uri);
      }
    } catch (error) {
      console.error('Preview capture error:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [cameraRef, selectedFilter, features, isProcessing]);

  useEffect(() => {
    let interval;

    if (selectedFilter) {
      // Start capturing previews periodically
      interval = setInterval(capturePreview, PREVIEW_INTERVAL);
      // Capture initial preview
      capturePreview();
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [selectedFilter, capturePreview]);

  if (!selectedFilter || selectedFilter.id === 'normal') {
    return null;
  }

  return (
    <View style={styles.container}>
      {previewImage && (
        <Image
          source={{ uri: previewImage }}
          style={styles.preview}
          resizeMode="cover"
        />
      )}
      <View style={styles.overlay}>
        <View style={styles.filterIndicator}>
          <View
            style={[
              styles.filterDot,
              selectedFilter.type === 'ai' && styles.aiFilterDot,
            ]}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: theme.spacing.xl,
    right: theme.spacing.lg,
    width: 80,
    height: 120,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    backgroundColor: theme.colors.overlay.medium,
  },
  preview: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    padding: theme.spacing.xs,
  },
  filterIndicator: {
    position: 'absolute',
    top: theme.spacing.xs,
    right: theme.spacing.xs,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: theme.colors.overlay.dark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
  },
  aiFilterDot: {
    backgroundColor: theme.colors.secondary,
  },
});

export default React.memo(FilterPreview);
