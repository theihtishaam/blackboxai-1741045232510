import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import * as Google from 'expo-auth-session/providers/google';
import * as AppleAuthentication from 'expo-apple-authentication';

const AuthContext = createContext({
  isAuthenticated: false,
  user: null,
  loading: false,
  login: async () => {},
  logout: async () => {},
  register: async () => {},
  resetPassword: async () => {},
  loginWithGoogle: async () => {},
  loginWithApple: async () => {},
  loginWithBiometrics: async () => {},
  enable2FA: async () => {},
  verify2FA: async () => {},
  refreshSession: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshToken, setRefreshToken] = useState(null);
  const [sessionExpiry, setSessionExpiry] = useState(null);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [hasBiometrics, setHasBiometrics] = useState(false);

  // Initialize Google OAuth and check biometric availability
  const [googleRequest, googleResponse, promptGoogleAsync] = Google.useAuthRequest({
    expoClientId: 'YOUR_EXPO_CLIENT_ID',
    iosClientId: 'YOUR_IOS_CLIENT_ID',
    androidClientId: 'YOUR_ANDROID_CLIENT_ID',
  });

  useEffect(() => {
    checkAuthStatus();
    checkBiometricAvailability();
    startSessionRefreshTimer();
  }, []);

  const checkBiometricAvailability = async () => {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      setHasBiometrics(compatible && enrolled);
    } catch (error) {
      console.error('Biometric check failed:', error);
      setHasBiometrics(false);
    }
  };

  const startSessionRefreshTimer = () => {
    if (sessionExpiry) {
      const timeUntilExpiry = new Date(sessionExpiry).getTime() - Date.now();
      if (timeUntilExpiry > 0) {
        setTimeout(() => {
          refreshSession();
        }, Math.max(0, timeUntilExpiry - 60000)); // Refresh 1 minute before expiry
      }
    }
  };

  const checkAuthStatus = async () => {
    const token = await SecureStore.getItemAsync('userToken');
    const storedRefreshToken = await SecureStore.getItemAsync('refreshToken');
    const storedExpiry = await SecureStore.getItemAsync('sessionExpiry');
    try {
      const token = await SecureStore.getItemAsync('userToken');
      if (new Date(storedExpiry) <= new Date()) {
        await refreshSession();
      } else {
        const response = await fetch('YOUR_API_URL/auth/verify', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refreshToken: storedRefreshToken }),
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          setIsAuthenticated(true);
        } else {
          // Token is invalid or expired
          await SecureStore.deleteItemAsync('userToken');
          setUser(null);
          setIsAuthenticated(false);
        }
      }
    } catch (error) {
      console.error('Auth status check failed:', error);
      // Handle error appropriately
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const refreshSession = async () => {
    try {
      const response = await fetch('YOUR_API_URL/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      const data = await response.json();

      if (response.ok) {
        await SecureStore.setItemAsync('userToken', data.token);
        await SecureStore.setItemAsync('refreshToken', data.refreshToken);
        await SecureStore.setItemAsync('sessionExpiry', data.expiry);
        
        setRefreshToken(data.refreshToken);
        setSessionExpiry(data.expiry);
        startSessionRefreshTimer();
        
        return true;
      } else {
        throw new Error(data.message || 'Session refresh failed');
      }
    } catch (error) {
      console.error('Session refresh error:', error);
      await logout();
      return false;
    }
  };

  const loginWithBiometrics = async () => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to continue',
        fallbackLabel: 'Use passcode',
      });

      if (result.success) {
        // Retrieve stored credentials and login
        const storedCredentials = await SecureStore.getItemAsync('biometricCredentials');
        if (storedCredentials) {
          const { email, password } = JSON.parse(storedCredentials);
          return login(email, password);
        }
      }
      
      return { success: false, error: 'Biometric authentication failed' };
    } catch (error) {
      console.error('Biometric login error:', error);
      return { success: false, error: error.message };
    }
  };

  const enable2FA = async () => {
    try {
      const response = await fetch('YOUR_API_URL/auth/2fa/enable', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await SecureStore.getItemAsync('userToken')}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        setIs2FAEnabled(true);
        return { success: true, secret: data.secret, qrCode: data.qrCode };
      } else {
        throw new Error(data.message || '2FA setup failed');
      }
    } catch (error) {
      console.error('2FA setup error:', error);
      return { success: false, error: error.message };
    }
  };

  const verify2FA = async (code) => {
    try {
      const response = await fetch('YOUR_API_URL/auth/2fa/verify', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await SecureStore.getItemAsync('userToken')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true };
      } else {
        throw new Error(data.message || '2FA verification failed');
      }
    } catch (error) {
      console.error('2FA verification error:', error);
      return { success: false, error: error.message };
    }
  };

  const login = async (email, password) => {
    try {
      const response = await fetch('YOUR_API_URL/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        await SecureStore.setItemAsync('userToken', data.token);
        setUser(data.user);
        setIsAuthenticated(true);
        return { success: true };
      } else {
        throw new Error(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  };

  const register = async (userData) => {
    try {
      const response = await fetch('YOUR_API_URL/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (response.ok) {
        await SecureStore.setItemAsync('userToken', data.token);
        setUser(data.user);
        setIsAuthenticated(true);
        return { success: true };
      } else {
        throw new Error(data.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: error.message };
    }
  };

  const resetPassword = async (email) => {
    try {
      const response = await fetch('YOUR_API_URL/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true };
      } else {
        throw new Error(data.message || 'Password reset failed');
      }
    } catch (error) {
      console.error('Password reset error:', error);
      return { success: false, error: error.message };
    }
  };

  const loginWithGoogle = async () => {
    try {
      const result = await promptGoogleAsync();
      
      if (result.type === 'success') {
        const response = await fetch('YOUR_API_URL/auth/google', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            token: result.authentication.accessToken,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          await SecureStore.setItemAsync('userToken', data.token);
          setUser(data.user);
          setIsAuthenticated(true);
          return { success: true };
        } else {
          throw new Error(data.message || 'Google login failed');
        }
      } else {
        throw new Error('Google login cancelled');
      }
    } catch (error) {
      console.error('Google login error:', error);
      return { success: false, error: error.message };
    }
  };

  const loginWithApple = async () => {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      const response = await fetch('YOUR_API_URL/auth/apple', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identityToken: credential.identityToken,
          fullName: credential.fullName,
          email: credential.email,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        await SecureStore.setItemAsync('userToken', data.token);
        setUser(data.user);
        setIsAuthenticated(true);
        return { success: true };
      } else {
        throw new Error(data.message || 'Apple login failed');
      }
    } catch (error) {
      console.error('Apple login error:', error);
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      await SecureStore.deleteItemAsync('userToken');
      setUser(null);
      setIsAuthenticated(false);
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, error: error.message };
    }
  };

  if (loading) {
    // You might want to return a loading component here
    return null;
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        loading,
        login,
        logout,
        register,
        resetPassword,
        loginWithGoogle,
        loginWithApple,
        loginWithBiometrics,
        enable2FA,
        verify2FA,
        refreshSession,
        is2FAEnabled,
        hasBiometrics,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
