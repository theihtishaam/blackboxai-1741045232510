import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
  StatusBar,
  PanResponder,
  Animated,
  Text,
} from 'react-native';
import { Camera } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator';
import * as MediaLibrary from 'expo-media-library';
import * as VideoThumbnails from 'expo-video-thumbnails';
import { useDispatch, useSelector } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSubscription } from '../../context/SubscriptionContext';
import {
  toggleCameraType,
  toggleFlashMode,
  setCapturedImage,
  setRecordedVideo,
  startProcessing,
  setProcessedImage,
  setProcessingError,
  resetCamera,
  selectCameraType,
  selectFlashMode,
  selectMode,
  selectSelectedFilter,
  selectIsRecording,
} from '../../store/slices/cameraSlice';
import FilterList from '../../components/camera/FilterList';
import FilterPreview from '../../components/camera/FilterPreview';
import ProcessingOverlay from '../../components/camera/ProcessingOverlay';
import CameraModeToggle from '../../components/camera/CameraModeToggle';
import VideoControls from '../../components/camera/VideoControls';
import Icon from '../../components/common/Icon';
import theme from '../../theme';

const CameraScreen = () => {
  const dispatch = useDispatch();
  const cameraRef = useRef(null);
  const [hasPermission, setHasPermission] = useState(null);
  const [isCameraReady, setCameraReady] = useState(false);
  const [zoom, setZoom] = useState(0);
  const [focusPoint, setFocusPoint] = useState(null);
  const [exposureValue, setExposureValue] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  
  const { features } = useSubscription();
  const cameraType = useSelector(selectCameraType);
  const flashMode = useSelector(selectFlashMode);
  const mode = useSelector(selectMode);
  const selectedFilter = useSelector(selectSelectedFilter);

  useEffect(() => {
    (async () => {
      const { status: cameraStatus } = await Camera.requestCameraPermissionsAsync();
      const { status: audioStatus } = await Camera.requestMicrophonePermissionsAsync();
      const { status: mediaStatus } = await MediaLibrary.requestPermissionsAsync();
      setHasPermission(
        cameraStatus === 'granted' && 
        audioStatus === 'granted' && 
        mediaStatus === 'granted'
      );
    })();
  }, []);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (evt) => {
      const { locationX, locationY } = evt.nativeEvent;
      handleFocus(locationX, locationY);
    },
    onPanResponderMove: (evt, gestureState) => {
      // Handle zoom with vertical pan
      const newZoom = Math.min(Math.max(zoom + gestureState.dy / 500, 0), 1);
      setZoom(newZoom);
    },
  });

  const handleFocus = async (x, y) => {
    if (cameraRef.current) {
      const focusPoint = {
        x: x / 900, // Normalized coordinates (0-1)
        y: y / 600,
      };
      setFocusPoint(focusPoint);
      await cameraRef.current.focusAsync(focusPoint);
    }
  };

  const handleCameraReady = () => {
    setCameraReady(true);
  };

  const handleCapture = async () => {
    if (!isCameraReady || !cameraRef.current) return;

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: features?.export?.highRes ? 1 : 0.8,
        base64: false,
        skipProcessing: false,
      });

      // Resize image to reasonable dimensions
      const manipulatedPhoto = await ImageManipulator.manipulateAsync(
        photo.uri,
        [{ resize: { width: 1080 } }],
        { compress: features?.export?.highRes ? 1 : 0.8, format: ImageManipulator.SaveFormat.JPEG }
      );

      dispatch(setCapturedImage(manipulatedPhoto.uri));
      await processImage(manipulatedPhoto.uri);
    } catch (error) {
      Alert.alert('Error', 'Failed to take picture. Please try again.');
      console.error('Camera capture error:', error);
    }
  };

  const handleStartRecording = async () => {
    if (!isCameraReady || !cameraRef.current) return;

    try {
      setIsRecording(true);
      const videoOptions = {
        quality: features?.export?.highRes ? Camera.Constants.VideoQuality['2160p'] : Camera.Constants.VideoQuality['720p'],
        maxDuration: 60,
        maxFileSize: 100 * 1024 * 1024, // 100MB
        mute: false,
      };
      
      const video = await cameraRef.current.recordAsync(videoOptions);
      const thumbnail = await VideoThumbnails.getThumbnailAsync(video.uri);
      
      dispatch(setRecordedVideo({ uri: video.uri, thumbnail: thumbnail.uri }));
      await processVideo(video.uri);
    } catch (error) {
      Alert.alert('Error', 'Failed to record video. Please try again.');
      console.error('Video recording error:', error);
    }
  };

  const handleStopRecording = async () => {
    if (!cameraRef.current) return;
    
    try {
      await cameraRef.current.stopRecording();
      setIsRecording(false);
    } catch (error) {
      console.error('Stop recording error:', error);
    }
  };

  const processImage = async (uri) => {
    dispatch(startProcessing());
    try {
      // Apply selected filter
      if (features?.filters?.ai && selectedFilter?.type === 'ai') {
        // Process with AI filter
        const processedUri = await applyAIFilter(uri, selectedFilter);
        dispatch(setProcessedImage(processedUri));
      } else {
        // Apply basic filter
        const processedUri = await applyBasicFilter(uri, selectedFilter);
        dispatch(setProcessedImage(processedUri));
      }

      // Save to camera roll
      if (!features?.export?.noWatermark) {
        // Add watermark before saving
        await addWatermark(uri);
      }
      await MediaLibrary.saveToLibraryAsync(uri);
    } catch (error) {
      dispatch(setProcessingError('Failed to process image. Please try again.'));
      console.error('Processing error:', error);
    }
  };

  const processVideo = async (uri) => {
    dispatch(startProcessing());
    try {
      // Apply video effects
      if (features?.filters?.ai) {
        // Process with AI effects
        const processedUri = await applyAIVideoEffects(uri);
        dispatch(setProcessedImage(processedUri));
      }

      // Save to camera roll
      await MediaLibrary.saveToLibraryAsync(uri);
    } catch (error) {
      dispatch(setProcessingError('Failed to process video. Please try again.'));
      console.error('Video processing error:', error);
    }
  };

  const handleRetake = () => {
    dispatch(resetCamera());
  };

  if (hasPermission === null) {
    return <View style={styles.container} />;
  }

  if (hasPermission === false) {
    return (
      <View style={styles.permissionContainer}>
        <Icon
          source={require('../../../assets/icons/camera-off.svg')}
          size={48}
          color={theme.colors.text.secondary}
        />
        <Text style={styles.permissionText}>
          No access to camera. Please enable camera permissions to use this feature.
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Camera
        ref={cameraRef}
        style={styles.camera}
        type={cameraType}
        flashMode={flashMode}
        zoom={zoom}
        onCameraReady={handleCameraReady}
        {...panResponder.panHandlers}
      >
        <CameraModeToggle />
        
        {focusPoint && (
          <Animated.View
            style={[
              styles.focusPoint,
              {
                left: focusPoint.x * 900 - 25,
                top: focusPoint.y * 600 - 25,
              },
            ]}
          />
        )}

        <View style={styles.controlsContainer}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => dispatch(toggleFlashMode())}
          >
            <Icon
              source={
                flashMode === 'on'
                  ? require('../../../assets/icons/flash-on.svg')
                  : require('../../../assets/icons/flash-off.svg')
              }
              size={24}
              color={theme.colors.white}
            />
          </TouchableOpacity>

          {mode === 'photo' ? (
            <TouchableOpacity
              style={styles.captureButton}
              onPress={handleCapture}
              disabled={!isCameraReady}
            >
              <View style={styles.captureButtonInner} />
            </TouchableOpacity>
          ) : (
            <VideoControls
              onStartRecording={handleStartRecording}
              onStopRecording={handleStopRecording}
            />
          )}

          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => dispatch(toggleCameraType())}
          >
            <Icon
              source={require('../../../assets/icons/flip-camera.svg')}
              size={24}
              color={theme.colors.white}
            />
          </TouchableOpacity>
        </View>

        <FilterList />
      </Camera>

      <ProcessingOverlay />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.black,
  },
  camera: {
    flex: 1,
  },
  controlsContainer: {
    position: 'absolute',
    bottom: theme.layout.tabBarHeight + theme.spacing.xl,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.overlay.medium,
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: theme.colors.overlay.light,
    padding: theme.spacing.xs,
  },
  captureButtonInner: {
    flex: 1,
    borderRadius: 32,
    backgroundColor: theme.colors.white,
  },
  focusPoint: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: theme.colors.white,
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  permissionText: {
    marginTop: theme.spacing.lg,
    fontSize: theme.typography.fontSize.base,
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
});

export default CameraScreen;
