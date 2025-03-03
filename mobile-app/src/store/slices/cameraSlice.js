import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  cameraType: 'back',
  flashMode: 'off',
  capturedImage: null,
  mode: 'photo', // 'photo' or 'video'
  isRecording: false,
  recordingDuration: 0,
  recordedVideo: null,
  error: null,
  processing: {
    status: 'idle', // 'idle' | 'processing' | 'completed' | 'failed'
    progress: 0,
  }
};

const cameraSlice = createSlice({
  name: 'camera',
  initialState,
  reducers: {
    toggleCameraType: (state) => {
      state.cameraType = state.cameraType === 'back' ? 'front' : 'back';
    },
    toggleFlashMode: (state) => {
      state.flashMode = state.flashMode === 'off' ? 'on' : 'off';
    },
    setCapturedImage: (state, action) => {
      state.capturedImage = action.payload;
    },
    setMode: (state, action) => {
      state.mode = action.payload;
      // Reset states when switching modes
      state.capturedImage = null;
      state.recordedVideo = null;
      state.isRecording = false;
      state.recordingDuration = 0;
      state.error = null;
    },
    startRecording: (state) => {
      state.isRecording = true;
      state.recordingDuration = 0;
      state.error = null;
    },
    stopRecording: (state) => {
      state.isRecording = false;
    },
    updateRecordingDuration: (state, action) => {
      state.recordingDuration = action.payload;
    },
    setRecordedVideo: (state, action) => {
      state.recordedVideo = action.payload;
      state.isRecording = false;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.isRecording = false;
    },
    resetCamera: (state) => {
      state.capturedImage = null;
      state.recordedVideo = null;
      state.isRecording = false;
      state.recordingDuration = 0;
      state.error = null;
      state.processing.status = 'idle';
      state.processing.progress = 0;
    },
    startProcessing: (state) => {
      state.processing.status = 'processing';
      state.processing.progress = 0;
    },
    updateProcessingProgress: (state, action) => {
      state.processing.progress = action.payload;
    },
    completeProcessing: (state) => {
      state.processing.status = 'completed';
      state.processing.progress = 100;
    },
    setProcessingError: (state, action) => {
      state.processing.status = 'failed';
      state.error = action.payload;
    }
  },
});

export const {
  toggleCameraType,
  toggleFlashMode,
  setCapturedImage,
  setMode,
  startRecording,
  stopRecording,
  updateRecordingDuration,
  setRecordedVideo,
  setError,
  resetCamera,
  startProcessing,
  updateProcessingProgress,
  completeProcessing,
  setProcessingError,
} = cameraSlice.actions;

// Selectors
export const selectCameraType = (state) => state.camera.cameraType;
export const selectFlashMode = (state) => state.camera.flashMode;
export const selectCapturedImage = (state) => state.camera.capturedImage;
export const selectMode = (state) => state.camera.mode;
export const selectIsRecording = (state) => state.camera.isRecording;
export const selectRecordingDuration = (state) => state.camera.recordingDuration;
export const selectRecordedVideo = (state) => state.camera.recordedVideo;
export const selectError = (state) => state.camera.error;
export const selectProcessing = (state) => state.camera.processing;

export default cameraSlice.reducer;
