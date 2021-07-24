/* eslint-disable react-native/no-inline-styles */
import * as React from 'react';

import { StyleSheet, View } from 'react-native';
import { MentionInput, MentionRoot } from '../../src';
import Animated from 'react-native-reanimated';
import { useMentionConfig } from '../../src/context';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useState } from 'react';
import { ThemeProvider } from '@slick-ui/core';
import { MentionPicker } from '../../src/MentionRoot';
import { useAnimatedScrollHandler } from 'react-native-reanimated';

export default function App() {
  return (
    <ThemeProvider>
      <SafeAreaProvider>
        <MentionRoot>
          <AppSub />
        </MentionRoot>
      </SafeAreaProvider>
    </ThemeProvider>
  );
}

const AppSub = () => {
  const { viewRef, scrollValue } = useMentionConfig();
  const [value, setValue] = useState('');

  const handler = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollValue.value = e.contentOffset.y;
    },
  });

  return (
    <Animated.ScrollView
      onScroll={handler}
      scrollEventThrottle={16}
      keyboardShouldPersistTaps="always"
      keyboardDismissMode="none"
      style={styles.container}
    >
      <View style={{ height: 500 }} />
      <Animated.View
        style={{
          alignSelf: 'stretch',
          marginTop: 400,
          borderWidth: 1,
          paddingVertical: 10,
        }}
        ref={viewRef}
      >
        <MentionInput
          multiline
          data={[
            { name: 'Ashwith', id: '43' },
            { name: 'Asmi', id: '432' },
            { name: 'AsmiTH', id: '432' },
            { name: 'Asha', id: '943' },
            { name: 'MAAsha', id: '943' },
            { name: 'Shasha', id: '323423' },
            { name: 'Shasha', id: '323423' },
          ]}
          style={{ flex: 1 }}
          containerStyle={{ flex: 1 }}
          {...{ value }}
          mentionTextStyle={{ fontSize: 16 }}
          partTypes={[
            {
              trigger: '@',
              textStyle: { color: 'green' },
              isInsertSpaceAfterMention: true,
            },
          ]}
          onChange={(val) => {
            setValue(val);
          }}
          onBlur={() => {
            MentionPicker?.close();
          }}
        />
      </Animated.View>
      <View style={{ height: 500 }} />
    </Animated.ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  box: {
    width: 60,
    height: 60,
    marginVertical: 20,
  },
});
