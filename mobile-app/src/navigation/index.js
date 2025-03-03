import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';
import TabBarIcon from './TabBarIcon';
import theme from '../theme';

// Import screens
import CameraScreen from '../screens/camera/CameraScreen';
import StoriesScreen from '../screens/stories/StoriesScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const AuthStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      cardStyle: { backgroundColor: theme.colors.background.primary },
      headerTitleStyle: {
        fontFamily: theme.typography.fontFamily.semiBold,
        fontSize: theme.typography.fontSize.lg,
        color: theme.colors.text.primary,
      },
    }}
  >
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
    <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
  </Stack.Navigator>
);

const MainTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused }) => (
        <TabBarIcon routeName={route.name} focused={focused} />
      ),
      tabBarStyle: {
        backgroundColor: theme.colors.background.primary,
        borderTopWidth: 0,
        ...theme.shadows.md,
        height: theme.layout.tabBarHeight,
      },
      tabBarLabelStyle: {
        fontFamily: theme.typography.fontFamily.medium,
        fontSize: theme.typography.fontSize.xs,
        marginBottom: theme.spacing.xs,
      },
      tabBarActiveTintColor: theme.colors.primary,
      tabBarInactiveTintColor: theme.colors.text.secondary,
      headerStyle: {
        backgroundColor: theme.colors.background.primary,
        elevation: 0,
        shadowOpacity: 0,
      },
      headerTitleStyle: {
        fontFamily: theme.typography.fontFamily.semiBold,
        fontSize: theme.typography.fontSize.lg,
        color: theme.colors.text.primary,
      },
    })}
  >
    <Tab.Screen 
      name="Camera" 
      component={CameraScreen}
      options={{
        headerShown: false,
        tabBarLabel: 'Camera',
      }}
    />
    <Tab.Screen 
      name="Stories" 
      component={StoriesScreen}
      options={{
        headerShown: true,
        tabBarLabel: 'Stories',
      }}
    />
    <Tab.Screen 
      name="Profile" 
      component={ProfileScreen}
      options={{
        headerShown: true,
        tabBarLabel: 'Profile',
      }}
    />
  </Tab.Navigator>
);

const Navigation = () => {
  const { isAuthenticated } = useAuth();

  return isAuthenticated ? <MainTabs /> : <AuthStack />;
};

export default Navigation;
