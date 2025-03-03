import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchSubscriptionStatus = createAsyncThunk(
  'subscription/fetchStatus',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('YOUR_API_URL/subscription/status');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch subscription status');
      }
      
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const purchaseSubscription = createAsyncThunk(
  'subscription/purchase',
  async ({ planId, paymentMethod }, { rejectWithValue }) => {
    try {
      const response = await fetch('YOUR_API_URL/subscription/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ planId, paymentMethod }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to purchase subscription');
      }

      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const cancelSubscription = createAsyncThunk(
  'subscription/cancel',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('YOUR_API_URL/subscription/cancel', {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to cancel subscription');
      }

      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const subscriptionSlice = createSlice({
  name: 'subscription',
  initialState: {
    status: 'free', // 'free', 'premium', 'cancelled'
    plan: null,
    features: {
      filters: {
        basic: true,
        advanced: false,
        ai: false,
      },
      stories: {
        view: true,
        create: true,
        unlimited: false,
      },
      export: {
        basic: true,
        highRes: false,
        noWatermark: false,
      },
      textToImage: false,
      imageToVideo: false,
      backgroundRemoval: false,
      adsDisabled: false,
    },
    limits: {
      dailyProcessingLimit: 5,
      processingCount: 0,
      storiesPerDay: 2,
      storiesCount: 0,
    },
    billing: {
      currentPeriodStart: null,
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false,
    },
    loading: false,
    error: null,
    availablePlans: [
      {
        id: 'premium_monthly',
        name: 'Premium Monthly',
        price: 9.99,
        interval: 'month',
        features: [
          'All Filters',
          'Unlimited Stories',
          'Background Removal',
          'Text to Image',
          'Image to Video',
          'No Ads',
        ],
      },
      {
        id: 'premium_yearly',
        name: 'Premium Yearly',
        price: 99.99,
        interval: 'year',
        features: [
          'All Premium Monthly Features',
          '2 Months Free',
          'Priority Support',
        ],
      },
    ],
  },
  reducers: {
    resetError: (state) => {
      state.error = null;
    },
    updateProcessingCount: (state) => {
      state.limits.processingCount += 1;
    },
    updateStoriesCount: (state) => {
      state.limits.storiesCount += 1;
    },
    resetDailyCounts: (state) => {
      state.limits.processingCount = 0;
      state.limits.storiesCount = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch subscription status
      .addCase(fetchSubscriptionStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSubscriptionStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.status = action.payload.status;
        state.plan = action.payload.plan;
        state.features = action.payload.features;
        state.limits = action.payload.limits;
        state.billing = action.payload.billing;
      })
      .addCase(fetchSubscriptionStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Purchase subscription
      .addCase(purchaseSubscription.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(purchaseSubscription.fulfilled, (state, action) => {
        state.loading = false;
        state.status = 'premium';
        state.plan = action.payload.plan;
        state.features = action.payload.features;
        state.billing = action.payload.billing;
      })
      .addCase(purchaseSubscription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Cancel subscription
      .addCase(cancelSubscription.fulfilled, (state, action) => {
        state.billing.cancelAtPeriodEnd = true;
      });
  },
});

export const {
  resetError,
  updateProcessingCount,
  updateStoriesCount,
  resetDailyCounts,
} = subscriptionSlice.actions;

export const selectSubscriptionStatus = (state) => state.subscription.status;
export const selectSubscriptionPlan = (state) => state.subscription.plan;
export const selectSubscriptionFeatures = (state) => state.subscription.features;
export const selectSubscriptionLimits = (state) => state.subscription.limits;
export const selectSubscriptionBilling = (state) => state.subscription.billing;
export const selectAvailablePlans = (state) => state.subscription.availablePlans;
export const selectSubscriptionLoading = (state) => state.subscription.loading;
export const selectSubscriptionError = (state) => state.subscription.error;

export default subscriptionSlice.reducer;
