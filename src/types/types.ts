import type { Ref } from 'react';
import type { Change } from 'diff';
import type {
  StyleProp,
  TextInput,
  TextInputProps,
  TextStyle,
  ViewStyle,
} from 'react-native';

export type MentionInterface = {
  show: (props: MentionPickerProps) => void;
  close: () => void;
};

export type MentionPickerProps = {
  data: Mention[];
  renderItem?: (mentionType: PartType, suggestion: Mention) => Element;
  trigger: string;
  itemHeight?: number;
  partType: PartType;
  onSuggestionPress: (data: {
    mentionType: PartType;
    suggestion: Mention;
  }) => void;
};

export type Mention = {
  id: string;
  name: string;
};

export type Part = {
  text: string;
  position: Position;

  partType?: PartType;

  data?: MentionData;
};

export type MentionData = {
  original: string;
  trigger: string;
  name: string;
  id: string;
};

// The same as text selection state
export type Position = {
  start: number;
  end: number;
};

export type PartType = {
  // single trigger character eg '@' or '#'
  trigger: string;

  // How much spaces are allowed for mention keyword
  allowedSpacesCount?: number;

  // Should we add a space after selected mentions if the mention is at the end of row
  isInsertSpaceAfterMention?: boolean;

  // Should we render either at the top or bottom of the input
  isBottomMentionSuggestionsRender?: boolean;

  // Custom mention styles in text input
  textStyle?: StyleProp<TextStyle>;

  // Plain string generator for mention
  getPlainString?: (mention: MentionData) => string;
};

export type MentionInputProps = Omit<TextInputProps, 'onChange'> & {
  value: string;
  data?: Mention[];
  onChange: (value: string) => any;

  partTypes?: PartType[];

  inputRef?: Ref<TextInput>;

  containerStyle?: StyleProp<ViewStyle>;
  mentionTextStyle?: StyleProp<TextStyle>;
};

export type CharactersDiffChange = Omit<Change, 'count'> & { count: number };

export type RegexMatchResult = string[] & {
  // Matched string
  0: string;

  // original
  1: string;

  // trigger
  2: string;

  // name
  3: string;

  // id
  4: string;

  // Start position of matched text in whole string
  index: number;

  // Group names (duplicates MentionData type)
  groups: MentionData;
};
