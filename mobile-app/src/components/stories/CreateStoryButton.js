import React from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { BlurView } from 'expo-blur';
import PropTypes from 'prop-types';
import Icon from '../common/Icon';
import theme from '../../theme';

const CreateStoryButton = ({ style }) => {
  const navigation = useNavigation();

  const handlePress = () => {
    navigation.navigate('Camera', { mode: 'story' });
  };

  const ButtonContent = () => (
    <>
      <View style={styles.iconContainer}>
        <Icon
          source={require('../../../assets/icons/add-story.svg')}
          size={24}
          color={theme.colors.primary}
        />
      </View>
      <Text style={styles.text}>Create Story</Text>
    </>
  );

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      {Platform.OS === 'ios' ? (
        <BlurView intensity={80} style={styles.blurContainer}>
          <ButtonContent />
        </BlurView>
      ) : (
        <View style={styles.androidContainer}>
          <ButtonContent />
        </View>
      )}
    </TouchableOpacity>
  );
};

CreateStoryButton.propTypes = {
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};

const styles = StyleSheet.create({
  container: {
    width: 80,
    height: 120,
    marginHorizontal: theme.spacing.xs,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
  },
  blurContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  androidContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.background.secondary,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
    ...theme.shadows.sm,
  },
  text: {
    fontSize: theme.typography.fontSize.xs,
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.text.primary,
    textAlign: 'center',
  },
});

export default CreateStoryButton;
