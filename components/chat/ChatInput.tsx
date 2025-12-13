import { useState, useEffect } from 'react';
import { View, StyleSheet, Keyboard } from 'react-native';
import { TextInput, IconButton } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DraculaColors } from '../../constants/theme';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export default function ChatInput({ onSend, disabled = false, placeholder = 'Type a message...' }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardWillShow', () => {
      setKeyboardVisible(true);
    });
    const hideSubscription = Keyboard.addListener('keyboardWillHide', () => {
      setKeyboardVisible(false);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage('');
    }
  };

  return (
    <View style={[styles.container, { paddingBottom: keyboardVisible ? 5 : (insets.bottom || 8) }]}>
      <TextInput
        style={styles.input}
        mode="outlined"
        placeholder={placeholder}
        placeholderTextColor={DraculaColors.comment}
        value={message}
        onChangeText={setMessage}
        onSubmitEditing={handleSend}
        disabled={disabled}
        multiline
        maxLength={2000}
        outlineColor={DraculaColors.current}
        activeOutlineColor={DraculaColors.purple}
        textColor={DraculaColors.foreground}
        returnKeyType="send"
        blurOnSubmit={false}
        enablesReturnKeyAutomatically={true}
        theme={{
          colors: {
            background: DraculaColors.background,
          },
        }}
      />
      <IconButton
        icon="send"
        size={24}
        iconColor={disabled || !message.trim() ? DraculaColors.comment : DraculaColors.purple}
        onPress={handleSend}
        disabled={disabled || !message.trim()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 8,
    backgroundColor: DraculaColors.background,
    borderTopWidth: 1,
    borderTopColor: DraculaColors.current,
  },
  input: {
    flex: 1,
    marginRight: 8,
    maxHeight: 400,
  },
});
