import { createContext, useContext } from 'react';
import type Animated from 'react-native-reanimated';

interface MentionContextProps {
  viewRef: React.RefObject<Animated.View>;
  scrollValue: Animated.SharedValue<number>;
}

const MentionContext = createContext<MentionContextProps>({
  viewRef: 0 as any,
  scrollValue: 0 as unknown as Animated.SharedValue<number>,
});

export const MentionProvider = MentionContext.Provider;

export const useMentionConfig = () => {
  return useContext(MentionContext);
};
