import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { BlurView } from 'expo-blur';

const LoadingScreen = ({ message = 'Loading...' }) => {
  return (
    <BlurView intensity={70} style={styles.container}>
      <View style={styles.content}>
        <ActivityIndicator size="large" color="#4CAF50" style={styles.spinner} />
        <Text style={styles.message}>{message}</Text>
      </View>
    </BlurView>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  content: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  spinner: {
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default LoadingScreen;
