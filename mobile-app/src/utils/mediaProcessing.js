import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

// AI Model endpoints
const AI_FILTER_ENDPOINT = 'YOUR_AI_SERVICE_URL/filter';
const AI_VIDEO_ENDPOINT = 'YOUR_AI_SERVICE_URL/video';

export const applyAIFilter = async (imageUri, filter) => {
  try {
    // First compress the image for upload
    const compressedImage = await ImageManipulator.manipulateAsync(
      imageUri,
      [{ resize: { width: 1080 } }],
      { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG, base64: true }
    );

    // Send to AI service
    const response = await fetch(AI_FILTER_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: compressedImage.base64,
        filter: filter.id,
        settings: filter.settings,
      }),
    });

    if (!response.ok) {
      throw new Error('AI processing failed');
    }

    const { processedImage } = await response.json();
    
    // Save processed image locally
    const filename = `${FileSystem.documentDirectory}processed_${Date.now()}.jpg`;
    await FileSystem.writeAsStringAsync(filename, processedImage, {
      encoding: FileSystem.EncodingType.Base64,
    });

    return filename;
  } catch (error) {
    console.error('AI filter error:', error);
    throw error;
  }
};

export const applyBasicFilter = async (imageUri, filter) => {
  try {
    const actions = [];

    // Apply basic image adjustments based on filter settings
    if (filter.brightness !== undefined) {
      actions.push({ adjust: { brightness: filter.brightness } });
    }
    if (filter.contrast !== undefined) {
      actions.push({ adjust: { contrast: filter.contrast } });
    }
    if (filter.saturation !== undefined) {
      actions.push({ adjust: { saturation: filter.saturation } });
    }
    if (filter.temperature !== undefined) {
      actions.push({ adjust: { temperature: filter.temperature } });
    }

    // Apply filter preset if available
    if (filter.preset) {
      actions.push({ preset: filter.preset });
    }

    const processedImage = await ImageManipulator.manipulateAsync(
      imageUri,
      actions,
      { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
    );

    return processedImage.uri;
  } catch (error) {
    console.error('Basic filter error:', error);
    throw error;
  }
};

export const applyAIVideoEffects = async (videoUri) => {
  try {
    // Get video file info
    const fileInfo = await FileSystem.getInfoAsync(videoUri);
    
    // Create form data for video upload
    const formData = new FormData();
    formData.append('video', {
      uri: Platform.OS === 'ios' ? videoUri.replace('file://', '') : videoUri,
      name: 'video.mp4',
      type: 'video/mp4',
    });

    // Send to AI service
    const response = await fetch(AI_VIDEO_ENDPOINT, {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (!response.ok) {
      throw new Error('Video processing failed');
    }

    // Download processed video
    const { processedVideoUrl } = await response.json();
    const filename = `${FileSystem.documentDirectory}processed_${Date.now()}.mp4`;
    
    await FileSystem.downloadAsync(processedVideoUrl, filename);
    return filename;
  } catch (error) {
    console.error('AI video processing error:', error);
    throw error;
  }
};

export const addWatermark = async (imageUri) => {
  try {
    const watermark = require('../../assets/images/watermark.png');
    
    const processedImage = await ImageManipulator.manipulateAsync(
      imageUri,
      [
        {
          overlay: {
            uri: watermark,
            position: { bottom: 20, right: 20 },
            scale: 0.3,
            opacity: 0.7,
          },
        },
      ],
      { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
    );

    return processedImage.uri;
  } catch (error) {
    console.error('Watermark error:', error);
    throw error;
  }
};

export const compressVideo = async (videoUri, quality = 'medium') => {
  try {
    const qualitySettings = {
      high: 0.8,
      medium: 0.6,
      low: 0.4,
    };

    // Implement video compression using a third-party library or native module
    // This is a placeholder for the actual implementation
    const compressedVideo = await VideoCompressor.compress(videoUri, {
      quality: qualitySettings[quality],
      maintainAspectRatio: true,
    });

    return compressedVideo;
  } catch (error) {
    console.error('Video compression error:', error);
    throw error;
  }
};
