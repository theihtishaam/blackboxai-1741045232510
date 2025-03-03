import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { setMode, selectMode } from '../../store/slices/cameraSlice';
import Icon from '../common/Icon';
import theme from '../../theme';

const CameraModeToggle = () => {
  const dispatch = useDispatch();
  const currentMode = useSelector(selectMode);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.modeButton, currentMode === 'photo' && styles.activeMode]}
        onPress={() => dispatch(setMode('photo'))}
      >
        <Icon
          source={require('../../../assets/icons/camera-active.svg')}
          size={24}
          color={currentMode === 'photo' ? theme.colors.primary : theme.colors.white}
        />
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.modeButton, currentMode === 'video' && styles.activeMode]}
        onPress={() => dispatch(setMode('video'))}
      >
        <Icon
          source={require('../../../assets/icons/video-active.svg')}
          size={24}
          color={currentMode === 'video' ? theme.colors.primary : theme.colors.white}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    position: 'absolute',
    top: theme.spacing.xl,
    alignSelf: 'center',
    backgroundColor: theme.colors.overlay.medium,
    borderRadius: 20,
    padding: 4,
  },
  modeButton: {
    padding: theme.spacing.sm,
    borderRadius: 16,
  },
  activeMode: {
    backgroundColor: theme.colors.overlay.light,
  },
});

export default CameraModeToggle;
