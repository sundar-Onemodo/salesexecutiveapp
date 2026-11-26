import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Text,
  NativeSyntheticEvent,
  TextInputKeyPressEventData,
} from 'react-native';
import { AppColors } from '@/constants/colors';

interface OtpInputProps {
  length?: number;
  onComplete: (otp: string) => void;
  error?: string | null;
  disabled?: boolean;
}

export const OtpInput: React.FC<OtpInputProps> = ({
  length = 6,
  onComplete,
  error,
  disabled = false,
}) => {
  const [digits, setDigits] = useState<string[]>(Array(length).fill(''));
  const inputsRef = useRef<(TextInput | null)[]>([]);

  // Focus the first input on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      inputsRef.current[0]?.focus();
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  const handleChange = (text: string, index: number) => {
    if (disabled) return;

    // Handle paste of multiple characters
    const cleanText = text.replace(/\D/g, '');
    if (cleanText.length > 1) {
      const pastedDigits = cleanText.slice(0, length).split('');
      const newDigits = [...digits];
      pastedDigits.forEach((char, i) => {
        if (i < length) newDigits[i] = char;
      });
      setDigits(newDigits);

      // Focus last pasted or next empty
      const nextIndex = Math.min(pastedDigits.length, length - 1);
      inputsRef.current[nextIndex]?.focus();

      if (newDigits.every((d) => d !== '') && newDigits.length === length) {
        onComplete(newDigits.join(''));
      }
      return;
    }

    const digit = cleanText.slice(-1);
    const newDigits = [...digits];
    newDigits[index] = digit;
    setDigits(newDigits);

    if (digit !== '') {
      // Auto move to next input box
      if (index < length - 1) {
        inputsRef.current[index + 1]?.focus();
      } else {
        // Last digit entered! Direct API call!
        const fullOtp = newDigits.join('');
        if (fullOtp.length === length && newDigits.every((d) => d !== '')) {
          onComplete(fullOtp);
        }
      }
    }
  };

  const handleKeyPress = (
    e: NativeSyntheticEvent<TextInputKeyPressEventData>,
    index: number
  ) => {
    if (disabled) return;

    if (e.nativeEvent.key === 'Backspace') {
      if (digits[index] === '' && index > 0) {
        // Move to previous input and clear it
        const newDigits = [...digits];
        newDigits[index - 1] = '';
        setDigits(newDigits);
        inputsRef.current[index - 1]?.focus();
      } else {
        const newDigits = [...digits];
        newDigits[index] = '';
        setDigits(newDigits);
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.boxesContainer}>
        {digits.map((digit, index) => {
          const isFilled = digit !== '';
          const hasError = Boolean(error);

          return (
            <TextInput
              key={index}
              ref={(ref) => {
                inputsRef.current[index] = ref;
              }}
              style={[
                styles.box,
                isFilled && styles.boxFilled,
                hasError && styles.boxError,
                disabled && styles.boxDisabled,
              ]}
              keyboardType="number-pad"
              maxLength={1}
              value={digit}
              onChangeText={(text) => handleChange(text, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              editable={!disabled}
              selectTextOnFocus
              textAlign="center"
              cursorColor={AppColors.dominant}
            />
          );
        })}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    marginVertical: 8,
  },
  boxesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: 330,
    gap: 6,
  },
  box: {
    flex: 1,
    height: 48,
    maxWidth: 48,
    borderWidth: 1.5,
    borderColor: AppColors.border,
    borderRadius: 10,
    backgroundColor: AppColors.card,
    fontSize: 20,
    fontWeight: '700',
    color: AppColors.surface,
    elevation: 2,
    shadowColor: AppColors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
  },
  boxFilled: {
    borderColor: AppColors.dominant,
    backgroundColor: '#F0F5FC',
  },
  boxError: {
    borderColor: AppColors.error,
    backgroundColor: AppColors.errorLight,
  },
  boxDisabled: {
    backgroundColor: '#F3F4F6',
    borderColor: AppColors.border,
    opacity: 0.6,
  },
  errorText: {
    marginTop: 8,
    color: AppColors.error,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
});
