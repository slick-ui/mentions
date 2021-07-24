import React, { FC } from 'react';
import type { MentionInterface } from './types';
import MentionPickerComponent from './MentionPicker';
import { MentionProvider } from './context';
import Animated, { useAnimatedRef } from 'react-native-reanimated';
import { useSharedValue } from 'react-native-reanimated';

let MentionPicker: MentionInterface | null;

/**
 * MentionRoot
 */
const MentionRoot: FC = ({ children }) => {
  const viewRef = useAnimatedRef<Animated.View>();
  const scrollValue = useSharedValue(0);
  return (
    <MentionProvider value={{ viewRef, scrollValue }}>
      {children}
      <MentionPickerComponent ref={(ref) => (MentionPicker = ref)} />
    </MentionProvider>
  );
};

export default MentionRoot;

export { MentionPicker };
