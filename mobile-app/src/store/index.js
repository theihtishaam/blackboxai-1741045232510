import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import filterReducer from './slices/filterSlice';
import storyReducer from './slices/storySlice';
import subscriptionReducer from './slices/subscriptionSlice';

const store = configureStore({
  reducer: {
    user: userReducer,
    filters: filterReducer,
    stories: storyReducer,
    subscription: subscriptionReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;
