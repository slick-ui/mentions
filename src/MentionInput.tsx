import React, { FC, MutableRefObject, useMemo, useRef, useState } from 'react';
import {
  NativeSyntheticEvent,
  TextInput,
  TextInputSelectionChangeEventData,
  View,
} from 'react-native';
import type {
  Mention,
  // Mention,
  MentionInputProps,
  PartType,
  // PartType
} from './types';
import {
  defaultMentionTextStyle,
  generateValueFromPartsAndChangedText,
  generateValueWithAddedSuggestion,
  getAllMentionValues,
  getMentionPartSuggestionKeywords,
  // generateValueWithAddedSuggestion,
  // getMentionPartSuggestionKeywords,
  parseValue,
} from './utils';
import { Text } from '@slick-ui/core';
import { useEffect } from 'react';
import { MentionPicker } from './MentionRoot';

const MentionInput: FC<MentionInputProps> = ({
  value,
  onChange,
  data = [],
  partTypes = [],
  inputRef: propInputRef,
  style,
  containerStyle,
  mentionTextStyle,

  onSelectionChange,

  ...textInputProps
}) => {
  const textInput = useRef<TextInput | null>(null);

  const [selection, setSelection] = useState({ start: 0, end: 0 });

  const { plainText, parts } = useMemo(
    () => parseValue(value, partTypes),
    [value, partTypes]
  );

  const handleSelectionChange = (
    event: NativeSyntheticEvent<TextInputSelectionChangeEventData>
  ) => {
    setSelection(event.nativeEvent.selection);

    onSelectionChange && onSelectionChange(event);
  };

  /**
   * Callback that trigger on TextInput text change
   *
   * @param changedText
   */
  const onChangeInput = (changedText: string) => {
    onChange(
      generateValueFromPartsAndChangedText(parts, plainText, changedText)
    );
  };

  /**
   * We memoize the keyword to know should we show mention suggestions or not
   */
  const keywordByTrigger = useMemo(() => {
    return getMentionPartSuggestionKeywords(
      parts,
      plainText,
      selection,
      partTypes
    );
  }, [parts, plainText, selection, partTypes]);

  /**
   * Open MentionPicker if the data length by triggers is greater than one
   */

  useEffect(() => {
    let filterData: Mention[] = [];
    let partType: PartType | undefined;
    let trigger: string | undefined;
    partTypes.forEach((part) => {
      const { trigger: trg } = part;
      const filterText = keywordByTrigger[trg] as string;
      if (!filterText || filterText.length === 0) return MentionPicker?.close();
      if (filterText.length > 0) {
        filterData = data.filter(({ name }) =>
          name
            .trim()
            .toLocaleLowerCase()
            .includes(filterText.toLocaleLowerCase())
        );
        partType = part;
        trigger = trg;
        return true;
      }
      return false;
    });

    if (!partType || !trigger) return MentionPicker?.close();

    const getMentions = getAllMentionValues(value);
    const newFilteredData = filterData.filter(
      ({ id: _id }) => !getMentions.find(({ id }) => id === _id)
    );

    MentionPicker?.show({
      data: newFilteredData,
      trigger,
      onSuggestionPress,
      partType,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keywordByTrigger, partTypes, data]);

  /**
   * Callback on mention suggestion press. We should:
   * - Get updated value
   * - Trigger onChange callback with new value
   */
  const onSuggestionPress = ({
    mentionType,
    suggestion,
  }: {
    mentionType: PartType;
    suggestion: Mention;
  }) => {
    const newValue = generateValueWithAddedSuggestion(
      parts,
      mentionType,
      plainText,
      selection,
      suggestion
    );

    if (!newValue) {
      return;
    }

    onChange(newValue);

    /**
     * Move cursor to the end of just added mention starting from trigger string and including:
     * - Length of trigger string
     * - Length of mention name
     * - Length of space after mention (1)
     *
     * Not working now due to the RN bug
     */
    // const newCursorPosition = currentPart.position.start + triggerPartIndex + trigger.length +
    // suggestion.name.length + 1;

    // textInput.current?.setNativeProps({selection: {start: newCursorPosition, end: newCursorPosition}});
  };

  const handleTextInputRef = (ref: TextInput) => {
    textInput.current = ref as TextInput;

    if (propInputRef) {
      if (typeof propInputRef === 'function') {
        propInputRef(ref);
      } else {
        (propInputRef as MutableRefObject<TextInput>).current =
          ref as TextInput;
      }
    }
  };

  return (
    <View style={containerStyle}>
      <TextInput
        {...textInputProps}
        style={[style, mentionTextStyle]}
        ref={handleTextInputRef}
        onChangeText={onChangeInput}
        onSelectionChange={handleSelectionChange}
      >
        <Text>
          {parts.map(({ text, partType, data: d }, index) =>
            partType ? (
              <Text
                key={`${index}-${d?.trigger ?? 'pattern'}`}
                style={[
                  mentionTextStyle,
                  partType.textStyle ?? defaultMentionTextStyle,
                ]}
              >
                {text}
              </Text>
            ) : (
              <Text style={mentionTextStyle} key={index}>
                {text}
              </Text>
            )
          )}
        </Text>
      </TextInput>
    </View>
  );
};

export default MentionInput;
