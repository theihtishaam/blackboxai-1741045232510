import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchFilters = createAsyncThunk(
  'filters/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('YOUR_API_URL/filters');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch filters');
      }
      
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const processImage = createAsyncThunk(
  'filters/processImage',
  async ({ imageUri, filterId }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('image', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'image.jpg',
      });
      formData.append('filterId', filterId);

      const response = await fetch('YOUR_API_URL/process-image', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to process image');
      }

      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const filterSlice = createSlice({
  name: 'filters',
  initialState: {
    availableFilters: {
      basic: [
        { id: 'basic_1', name: 'Classic Toon', icon: '🎨' },
        { id: 'basic_2', name: 'Sketch', icon: '✏️' },
      ],
      advanced: [
        { id: 'advanced_1', name: 'Anime', icon: '👾' },
        { id: 'advanced_2', name: 'Big Head', icon: '🤪' },
      ],
      ai: [
        { id: 'ai_1', name: 'AI Portrait', icon: '🤖' },
        { id: 'ai_2', name: 'Neural Art', icon: '🧠' },
      ],
    },
    selectedFilter: null,
    recentlyUsed: [],
    processing: {
      status: 'idle',
      progress: 0,
      error: null,
    },
    currentImage: null,
    processedImage: null,
  },
  reducers: {
    selectFilter: (state, action) => {
      state.selectedFilter = action.payload;
    },
    setCurrentImage: (state, action) => {
      state.currentImage = action.payload;
      state.processedImage = null;
    },
    clearProcessedImage: (state) => {
      state.processedImage = null;
      state.processing.status = 'idle';
      state.processing.progress = 0;
      state.processing.error = null;
    },
    addToRecentlyUsed: (state, action) => {
      const filterId = action.payload;
      state.recentlyUsed = [
        filterId,
        ...state.recentlyUsed.filter(id => id !== filterId),
      ].slice(0, 5); // Keep only last 5
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFilters.pending, (state) => {
        state.processing.status = 'loading';
        state.processing.error = null;
      })
      .addCase(fetchFilters.fulfilled, (state, action) => {
        state.processing.status = 'idle';
        state.availableFilters = action.payload;
      })
      .addCase(fetchFilters.rejected, (state, action) => {
        state.processing.status = 'failed';
        state.processing.error = action.payload;
      })
      .addCase(processImage.pending, (state) => {
        state.processing.status = 'processing';
        state.processing.progress = 0;
        state.processing.error = null;
      })
      .addCase(processImage.fulfilled, (state, action) => {
        state.processing.status = 'completed';
        state.processing.progress = 100;
        state.processedImage = action.payload.processedImageUrl;
        if (state.selectedFilter) {
          state.recentlyUsed = [
            state.selectedFilter,
            ...state.recentlyUsed.filter(id => id !== state.selectedFilter),
          ].slice(0, 5);
        }
      })
      .addCase(processImage.rejected, (state, action) => {
        state.processing.status = 'failed';
        state.processing.error = action.payload;
      });
  },
});

export const {
  selectFilter,
  setCurrentImage,
  clearProcessedImage,
  addToRecentlyUsed,
} = filterSlice.actions;

export const selectAvailableFilters = (state) => state.filters.availableFilters;
export const selectCurrentFilter = (state) => state.filters.selectedFilter;
export const selectProcessingStatus = (state) => state.filters.processing;
export const selectCurrentImage = (state) => state.filters.currentImage;
export const selectProcessedImage = (state) => state.filters.processedImage;
export const selectRecentlyUsedFilters = (state) => state.filters.recentlyUsed;

export default filterSlice.reducer;
