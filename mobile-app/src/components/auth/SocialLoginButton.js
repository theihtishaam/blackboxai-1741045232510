import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Image, View } from 'react-native';

const SocialLoginButton = ({ onPress, type, loading }) => {
  const getButtonStyle = () => {
    switch (type) {
      case 'google':
        return { backgroundColor: '#fff', borderColor: '#ddd' };
      case 'apple':
        return { backgroundColor: '#000' };
      default:
        return {};
    }
  };

  const getTextStyle = () => {
    switch (type) {
      case 'google':
        return { color: '#757575' };
      case 'apple':
        return { color: '#fff' };
      default:
        return {};
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'google':
        return require('../../assets/icons/google.png'); // You'll need to add these icons
      case 'apple':
        return require('../../assets/icons/apple.png');
      default:
        return null;
    }
  };

  const getButtonText = () => {
    switch (type) {
      case 'google':
        return 'Continue with Google';
      case 'apple':
        return 'Continue with Apple';
      default:
        return '';
    }
  };

  return (
    <TouchableOpacity
      style={[styles.button, getButtonStyle()]}
      onPress={onPress}
      disabled={loading}
    >
      <View style={styles.buttonContent}>
        <Image source={getIcon()} style={styles.icon} />
        <Text style={[styles.buttonText, getTextStyle()]}>
          {getButtonText()}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    padding: 14,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    width: 20,
    height: 20,
    marginRight: 12,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SocialLoginButton;
