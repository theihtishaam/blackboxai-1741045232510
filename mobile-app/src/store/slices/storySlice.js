import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunks
export const fetchStories = createAsyncThunk(
  'stories/fetchStories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('YOUR_API_URL/stories');
      if (!response.ok) throw new Error('Failed to fetch stories');
      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createStory = createAsyncThunk(
  'stories/createStory',
  async ({ image, filter, caption }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('image', {
        uri: image,
        type: 'image/jpeg',
        name: 'story.jpg',
      });
      formData.append('filter', filter);
      formData.append('caption', caption);

      const response = await fetch('YOUR_API_URL/stories', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!response.ok) throw new Error('Failed to create story');
      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteStory = createAsyncThunk(
  'stories/deleteStory',
  async (storyId, { rejectWithValue }) => {
    try {
      const response = await fetch(`YOUR_API_URL/stories/${storyId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete story');
      return storyId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  stories: [],
  myStories: [],
  viewedStories: new Set(),
  activeStory: null,
  loading: false,
  error: null,
  creating: false,
  createError: null,
  deleting: false,
  deleteError: null,
};

const storySlice = createSlice({
  name: 'stories',
  initialState,
  reducers: {
    setActiveStory: (state, action) => {
      state.activeStory = action.payload;
    },
    markStoryAsViewed: (state, action) => {
      state.viewedStories.add(action.payload);
    },
    clearActiveStory: (state) => {
      state.activeStory = null;
    },
    resetStoryErrors: (state) => {
      state.error = null;
      state.createError = null;
      state.deleteError = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch stories
    builder
      .addCase(fetchStories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStories.fulfilled, (state, action) => {
        state.loading = false;
        state.stories = action.payload.stories;
        state.myStories = action.payload.stories.filter(
          story => story.userId === action.payload.currentUserId
        );
      })
      .addCase(fetchStories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

    // Create story
    builder
      .addCase(createStory.pending, (state) => {
        state.creating = true;
        state.createError = null;
      })
      .addCase(createStory.fulfilled, (state, action) => {
        state.creating = false;
        state.stories.unshift(action.payload);
        state.myStories.unshift(action.payload);
      })
      .addCase(createStory.rejected, (state, action) => {
        state.creating = false;
        state.createError = action.payload;
      })

    // Delete story
    builder
      .addCase(deleteStory.pending, (state) => {
        state.deleting = true;
        state.deleteError = null;
      })
      .addCase(deleteStory.fulfilled, (state, action) => {
        state.deleting = false;
        state.stories = state.stories.filter(story => story.id !== action.payload);
        state.myStories = state.myStories.filter(story => story.id !== action.payload);
        if (state.activeStory?.id === action.payload) {
          state.activeStory = null;
        }
      })
      .addCase(deleteStory.rejected, (state, action) => {
        state.deleting = false;
        state.deleteError = action.payload;
      });
  },
});

// Actions
export const {
  setActiveStory,
  markStoryAsViewed,
  clearActiveStory,
  resetStoryErrors,
} = storySlice.actions;

// Selectors
export const selectAllStories = (state) => state.stories.stories;
export const selectMyStories = (state) => state.stories.myStories;
export const selectActiveStory = (state) => state.stories.activeStory;
export const selectViewedStories = (state) => state.stories.viewedStories;
export const selectStoriesLoading = (state) => state.stories.loading;
export const selectStoriesError = (state) => state.stories.error;
export const selectStoryCreating = (state) => state.stories.creating;
export const selectStoryCreateError = (state) => state.stories.createError;
export const selectStoryDeleting = (state) => state.stories.deleting;
export const selectStoryDeleteError = (state) => state.stories.deleteError;

// Helper selectors
export const selectUnviewedStories = (state) => {
  const viewedSet = state.stories.viewedStories;
  return state.stories.stories.filter(story => !viewedSet.has(story.id));
};

export const selectStoriesByUser = (userId) => (state) => 
  state.stories.stories.filter(story => story.userId === userId);

export default storySlice.reducer;
