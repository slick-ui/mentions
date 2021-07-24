/* eslint-disable no-shadow */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { forwardRef, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { useSlideHook, ReHighlight, Text, useColors } from '@slick-ui/core';
import Animated, {
  measure,
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  useAnimatedReaction,
} from 'react-native-reanimated';
import { useColorScheme } from 'react-native-appearance';
import { useMentionConfig } from './context';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type {
  MentionInterface,
  MentionPickerProps,
  PartType,
  Mention,
} from './types';
import { useImperativeHandle } from 'react';
import { Platform } from 'react-native';

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);
const DEFAULT_ITEM_HEIGHT = 40;

let onPress: (data: { mentionType: PartType; suggestion: Mention }) => void =
  () => {};

/**
 * MentionPicker
 */
const MentionPicker = forwardRef<MentionInterface>((_, ref) => {
  const { viewRef, scrollValue } = useMentionConfig();
  const [{ visible, isVisible, data, itemHeight, partType }, setState] =
    useState<{
      visible: boolean;
      isVisible: boolean;
      data: Mention[];
      itemHeight: number;
      trigger?: string;
      partType: PartType;
    }>({
      visible: false,
      isVisible: false,
      data: [],
      itemHeight: DEFAULT_ITEM_HEIGHT,
      partType: { trigger: '' },
    });

  const colors = useColors();
  const scheme = useColorScheme();

  const { top } = useSafeAreaInsets();

  // Values
  const viewHeight = useSharedValue(0);
  const viewOffset = useSharedValue(0);

  const defaultRenderItem = (mentionType: PartType, item: Mention) => (
    <ReHighlight
      onPress={() => {
        onPress?.({
          mentionType: mentionType,
          suggestion: item,
        });
        close();
      }}
      overlayColor={colors.underlay}
      style={styles.button}
    >
      <Text color={colors.darkText} style={styles.text}>
        {item.name}
      </Text>
    </ReHighlight>
  );

  let renderItem = defaultRenderItem;

  const show = ({
    data: mentionData,
    renderItem: rt,
    trigger: tgr,
    onSuggestionPress,
    partType: pt,
    itemHeight: ih,
  }: MentionPickerProps) => {
    renderItem = (rt as any) || defaultRenderItem;
    onPress = onSuggestionPress;
    setState((st) => ({
      ...st,
      data: mentionData,
      visible: true,
      isVisible: true,
      itemHeight: ih || DEFAULT_ITEM_HEIGHT,
      partType: pt,
      trigger: tgr,
    }));
  };

  useAnimatedReaction(
    () => {
      return scrollValue.value;
    },
    () => {
      'worklet';
      try {
        const measured = measure(viewRef);
        viewHeight.value = measured.height;
        viewOffset.value = measured.pageY;
      } catch (error) {}
    }
  );

  const close = () => {
    setState((st) => ({ ...st, isVisible: false }));
  };

  useImperativeHandle(
    ref,
    () => ({
      show,
      close,
    }),
    []
  );

  const [opacity] = useSlideHook(isVisible, 150, 'slideInBottom', ([v]) => {
    if (v !== 0) return;
    setState((st) => ({ ...st, visible: false, data: [] }));
  });

  // Animated Styles
  const animatedStyles = useAnimatedStyle(() => {
    console.log('data:', data.length);
    const pickerHeight =
      data.length === 0
        ? itemHeight * 3
        : data.length >= 5
        ? itemHeight * 5
        : data.length * itemHeight;
    const condition =
      viewOffset.value > pickerHeight + (Platform.OS === 'ios' ? 0 : top);
    const insetTop = condition
      ? viewOffset.value -
        pickerHeight -
        (data.length >= 5 ? 10 : data.length * 12)
      : viewOffset.value + viewHeight.value + 10;
    console.log('insetTop:', insetTop, viewOffset.value, pickerHeight, 10);
    const translateY = interpolate(
      opacity.value,
      [0, 1],
      [condition ? 120 : -120, 0]
    );
    return {
      top: insetTop,
      transform: [{ translateY }],
      opacity: opacity.value,
    };
  }, [top, data.length, itemHeight]);

  return (
    <Animated.View
      pointerEvents={visible ? 'auto' : 'none'}
      style={[
        styles.container,
        animatedStyles,
        { backgroundColor: colors.background },
      ]}
    >
      {visible && data.length === 0 ? (
        <View style={[styles.empty, { height: itemHeight * 3 }]}>
          <Text color={colors.darkText}>No data found</Text>
        </View>
      ) : (
        <View
          // eslint-disable-next-line react-native/no-inline-styles
          style={{
            alignSelf: 'stretch',
            height: data.length >= 5 ? itemHeight * 5 : data.length * 5,
          }}
        >
          <AnimatedFlatList
            indicatorStyle={scheme === 'dark' ? 'white' : 'black'}
            keyExtractor={(_, index) => index.toString()}
            data={data}
            renderItem={({ item }) => renderItem(partType, item as Mention)}
          />
        </View>
      )}
    </Animated.View>
  );
});

export default MentionPicker;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 10,
    right: 10,
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,

    elevation: 5,
    zIndex: 40,
  },

  petItemListContainer: {
    width: '100%',
  },
  customScrollBar: {
    backgroundColor: '#ccc',
    borderRadius: 3,
    width: 6,
  },
  customScrollBarBackground: {
    position: 'absolute',
    right: 0,
    top: 0,
  },
  button: {
    alignSelf: 'stretch',
    height: 50,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  text: {
    fontSize: 14,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
