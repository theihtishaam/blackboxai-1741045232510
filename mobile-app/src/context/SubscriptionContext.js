import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { initStripe, useStripe } from '@stripe/stripe-react-native';
import * as StoreKit from 'expo-store-kit';
import * as InAppPurchases from 'expo-in-app-purchases';
import { Platform } from 'react-native';
import { useAuth } from './AuthContext';

const SubscriptionContext = createContext({
  isPremium: false,
  subscriptionDetails: null,
  features: {},
  loading: false,
  prices: [],
  currentPlan: null,
  checkSubscription: async () => {},
  purchaseSubscription: async () => {},
  restorePurchases: async () => {},
  cancelSubscription: async () => {},
  upgradePlan: async () => {},
  downgradePlan: async () => {},
});

export const useSubscription = () => useContext(SubscriptionContext);

export const SubscriptionProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [isPremium, setIsPremium] = useState(false);
  const [subscriptionDetails, setSubscriptionDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [prices, setPrices] = useState([]);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [features, setFeatures] = useState({
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
  });

  useEffect(() => {
    if (isAuthenticated) {
      initializeSubscriptions();
    }
  }, [isAuthenticated]);

  const initializeSubscriptions = async () => {
    try {
      setLoading(true);
      // Initialize payment providers
      if (Platform.OS === 'ios') {
        await StoreKit.connectAsync();
      } else {
        await InAppPurchases.connectAsync();
      }

      await initStripe({
        publishableKey: 'YOUR_STRIPE_PUBLISHABLE_KEY',
        merchantIdentifier: 'YOUR_MERCHANT_IDENTIFIER', // For Apple Pay
        urlScheme: 'your-app-scheme', // Required for 3D Secure
      });

      // Fetch subscription prices
      await fetchPrices();
      
      // Check current subscription status
      await checkSubscription();
    } catch (error) {
      console.error('Subscription initialization error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPrices = async () => {
    try {
      const response = await fetch('YOUR_API_URL/subscription/prices', {
        headers: {
          'Authorization': `Bearer ${await SecureStore.getItemAsync('userToken')}`,
        },
      });

      const data = await response.json();
      if (response.ok) {
        setPrices(data.prices);
      }
    } catch (error) {
      console.error('Error fetching prices:', error);
    }
  };

  const checkSubscription = async () => {
    try {
      const response = await fetch('YOUR_API_URL/subscription/status', {
        headers: {
          'Authorization': `Bearer ${await SecureStore.getItemAsync('userToken')}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setIsPremium(data.isPremium);
        setSubscriptionDetails(data.subscriptionDetails);
        setCurrentPlan(data.currentPlan);
        updateFeatures(data.subscriptionType);
      }
    } catch (error) {
      console.error('Subscription check failed:', error);
    }
  };

  const updateFeatures = (subscriptionType) => {
    switch (subscriptionType) {
      case 'premium':
        setFeatures({
          filters: {
            basic: true,
            advanced: true,
            ai: true,
          },
          stories: {
            view: true,
            create: true,
            unlimited: true,
          },
          export: {
            basic: true,
            highRes: true,
            noWatermark: true,
          },
          textToImage: true,
          imageToVideo: true,
          backgroundRemoval: true,
          adsDisabled: true,
        });
        break;
      
      case 'basic':
      default:
        setFeatures({
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
        });
    }
  };

  const purchaseSubscription = async (priceId) => {
    try {
      setLoading(true);
      // Create payment intent on backend
      const response = await fetch('YOUR_API_URL/subscription/create-payment-intent', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await SecureStore.getItemAsync('userToken')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ priceId }),
      });

      const { clientSecret, ephemeralKey, customer } = await response.json();

      // Initialize payment sheet
      const { error: initError } = await initPaymentSheet({
        merchantDisplayName: 'Your App Name',
        customerId: customer,
        customerEphemeralKeySecret: ephemeralKey,
        paymentIntentClientSecret: clientSecret,
        allowsDelayedPaymentMethods: true,
        defaultBillingDetails: {
          name: user?.name,
          email: user?.email,
        },
      });

      if (initError) {
        throw new Error(initError.message);
      }

      // Present payment sheet
      const { error: paymentError } = await presentPaymentSheet();
      
      if (paymentError) {
        throw new Error(paymentError.message);
      }

      // Verify subscription on backend
      await checkSubscription();
      return { success: true };
    } catch (error) {
      console.error('Purchase error:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const handlePurchaseCompletion = async (purchaseResult) => {
    try {
      const response = await fetch('YOUR_API_URL/subscription/verify-purchase', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await SecureStore.getItemAsync('userToken')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(purchaseResult),
      });

      if (response.ok) {
        await checkSubscription();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Purchase verification error:', error);
      return false;
    }
  };

  const restorePurchases = async () => {
    try {
      setLoading(true);
      if (Platform.OS === 'ios') {
        await StoreKit.refreshReceiptAsync();
      }

      const response = await fetch('YOUR_API_URL/subscription/restore', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await SecureStore.getItemAsync('userToken')}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        await checkSubscription();
        return { success: true, message: data.message };
      } else {
        throw new Error(data.message || 'Restore failed');
      }
    } catch (error) {
      console.error('Restore error:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const cancelSubscription = async () => {
    try {
      setLoading(true);
      const response = await fetch('YOUR_API_URL/subscription/cancel', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await SecureStore.getItemAsync('userToken')}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        await checkSubscription();
        return { success: true, message: data.message };
      } else {
        throw new Error(data.message || 'Cancellation failed');
      }
    } catch (error) {
      console.error('Cancellation error:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const upgradePlan = async (newPriceId) => {
    try {
      setLoading(true);
      const response = await fetch('YOUR_API_URL/subscription/upgrade', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await SecureStore.getItemAsync('userToken')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newPriceId }),
      });

      const data = await response.json();

      if (response.ok) {
        await checkSubscription();
        return { success: true, message: data.message };
      } else {
        throw new Error(data.message || 'Upgrade failed');
      }
    } catch (error) {
      console.error('Upgrade error:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const downgradePlan = async (newPriceId) => {
    try {
      setLoading(true);
      const response = await fetch('YOUR_API_URL/subscription/downgrade', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await SecureStore.getItemAsync('userToken')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newPriceId }),
      });

      const data = await response.json();

      if (response.ok) {
        await checkSubscription();
        return { success: true, message: data.message };
      } else {
        throw new Error(data.message || 'Downgrade failed');
      }
    } catch (error) {
      console.error('Downgrade error:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  return (
    <SubscriptionContext.Provider
      value={{
        isPremium,
        subscriptionDetails,
        features,
        loading,
        prices,
        currentPlan,
        checkSubscription,
        purchaseSubscription,
        restorePurchases,
        cancelSubscription,
        upgradePlan,
        downgradePlan,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};

export default SubscriptionContext;
