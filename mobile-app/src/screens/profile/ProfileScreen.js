import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Switch,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useSubscription } from '../../context/SubscriptionContext';
import * as ImagePicker from 'expo-image-picker';

const ProfileScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const { isPremium, subscriptionDetails, features } = useSubscription();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);

  const handleEditProfile = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        // TODO: Implement profile picture update
        console.log('Update profile picture:', result.assets[0].uri);
      }
    } catch (error) {
      console.error('Profile picture update error:', error);
      Alert.alert('Error', 'Failed to update profile picture');
    }
  };

  const handleUpgradePress = () => {
    navigation.navigate('Subscription');
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          onPress: logout,
          style: 'destructive',
        },
      ]
    );
  };

  const renderSubscriptionStatus = () => (
    <View style={styles.subscriptionContainer}>
      <View style={styles.subscriptionHeader}>
        <Text style={styles.subscriptionTitle}>
          {isPremium ? 'Premium Member' : 'Free Plan'}
        </Text>
        {!isPremium && (
          <TouchableOpacity
            style={styles.upgradeButton}
            onPress={handleUpgradePress}
          >
            <Text style={styles.upgradeButtonText}>Upgrade</Text>
          </TouchableOpacity>
        )}
      </View>
      {isPremium && subscriptionDetails && (
        <Text style={styles.subscriptionDetails}>
          Next billing date: {new Date(subscriptionDetails.nextBilling).toLocaleDateString()}
        </Text>
      )}
    </View>
  );

  const renderFeatureItem = (title, enabled) => (
    <View style={styles.featureItem}>
      <Text style={styles.featureTitle}>{title}</Text>
      {enabled ? (
        <Text style={styles.featureEnabled}>✓</Text>
      ) : (
        <Text style={styles.featureDisabled}>✗</Text>
      )}
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleEditProfile}>
          <View style={styles.avatarContainer}>
            <Image
              source={{ uri: user?.avatarUrl || 'https://via.placeholder.com/150' }}
              style={styles.avatar}
            />
            <View style={styles.editIconContainer}>
              <Text style={styles.editIcon}>✎</Text>
            </View>
          </View>
        </TouchableOpacity>
        <Text style={styles.username}>{user?.username || 'User'}</Text>
        <Text style={styles.email}>{user?.email}</Text>
      </View>

      {renderSubscriptionStatus()}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Features</Text>
        {renderFeatureItem('Advanced Filters', features.filters.advanced)}
        {renderFeatureItem('AI Effects', features.filters.ai)}
        {renderFeatureItem('Background Removal', features.backgroundRemoval)}
        {renderFeatureItem('Text to Image', features.textToImage)}
        {renderFeatureItem('Image to Video', features.imageToVideo)}
        {renderFeatureItem('Ad-Free Experience', features.adsDisabled)}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Settings</Text>
        <View style={styles.settingItem}>
          <Text style={styles.settingTitle}>Push Notifications</Text>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
          />
        </View>
        <View style={styles.settingItem}>
          <Text style={styles.settingTitle}>Dark Mode</Text>
          <Switch
            value={darkModeEnabled}
            onValueChange={setDarkModeEnabled}
          />
        </View>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 10,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  editIconContainer: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: '#4CAF50',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  editIcon: {
    color: '#fff',
    fontSize: 16,
  },
  username: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: '#666',
  },
  subscriptionContainer: {
    margin: 15,
    padding: 15,
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
  },
  subscriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  subscriptionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  subscriptionDetails: {
    color: '#666',
  },
  upgradeButton: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 15,
  },
  upgradeButtonText: {
    color: '#000',
    fontWeight: '600',
  },
  section: {
    margin: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
  featureItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  featureTitle: {
    fontSize: 16,
  },
  featureEnabled: {
    color: '#4CAF50',
    fontSize: 18,
    fontWeight: '600',
  },
  featureDisabled: {
    color: '#ff0000',
    fontSize: 18,
    fontWeight: '600',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingTitle: {
    fontSize: 16,
  },
  logoutButton: {
    margin: 15,
    backgroundColor: '#ff0000',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ProfileScreen;
