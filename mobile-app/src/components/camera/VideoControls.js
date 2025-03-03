import React, { useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import {
  startRecording,
  stopRecording,
  updateRecordingDuration,
  selectIsRecording,
  selectRecordingDuration,
} from '../../store/slices/cameraSlice';
import theme from '../../theme';

const MAX_RECORDING_DURATION = 60; // Maximum recording duration in seconds

const VideoControls = ({ onStartRecording, onStopRecording }) => {
  const dispatch = useDispatch();
  const isRecording = useSelector(selectIsRecording);
  const duration = useSelector(selectRecordingDuration);
  const recordingAnimation = new Animated.Value(1);

  useEffect(() => {
    let interval;
    if (isRecording) {
      interval = setInterval(() => {
        dispatch(updateRecordingDuration(duration + 1));
        if (duration >= MAX_RECORDING_DURATION) {
          handleStopRecording();
        }
      }, 1000);

      // Start blinking animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(recordingAnimation, {
            toValue: 0.3,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(recordingAnimation, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }

    return () => {
      if (interval) clearInterval(interval);
      recordingAnimation.setValue(1);
    };
  }, [isRecording, duration]);

  const handleStartRecording = useCallback(async () => {
    dispatch(startRecording());
    onStartRecording();
  }, [dispatch, onStartRecording]);

  const handleStopRecording = useCallback(async () => {
    dispatch(stopRecording());
    onStopRecording();
  }, [dispatch, onStopRecording]);

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      {isRecording && (
        <View style={styles.durationContainer}>
          <Animated.View
            style={[
              styles.recordingIndicator,
              { opacity: recordingAnimation },
            ]}
          />
          <Text style={styles.durationText}>
            {formatDuration(duration)} / {formatDuration(MAX_RECORDING_DURATION)}
          </Text>
        </View>
      )}
      <TouchableOpacity
        style={[styles.recordButton, isRecording && styles.recordingButton]}
        onPress={isRecording ? handleStopRecording : handleStartRecording}
      >
        <View style={[styles.recordButtonInner, isRecording && styles.recordingButtonInner]} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    backgroundColor: theme.colors.overlay.dark,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: 16,
  },
  recordingIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.error,
    marginRight: theme.spacing.xs,
  },
  durationText: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.medium,
  },
  recordButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: theme.colors.overlay.light,
    padding: theme.spacing.xs,
  },
  recordingButton: {
    backgroundColor: theme.colors.error,
  },
  recordButtonInner: {
    flex: 1,
    borderRadius: 32,
    backgroundColor: theme.colors.white,
  },
  recordingButtonInner: {
    borderRadius: 4,
    backgroundColor: theme.colors.white,
  },
});

export default VideoControls;
