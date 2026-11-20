import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { AppColors } from '@/constants/colors';
import { OtpInput } from '@/components/OtpInput';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  requestOtpThunk,
  verifyOtpThunk,
  resetOtpState,
  clearError,
} from '@/store/slices/authSlice';

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const {
    isLoading,
    isVerifying,
    otpRequested,
    otpMessage,
    error,
    isAuthenticated,
  } = useAppSelector((state) => state.auth);

  const [mobileNumber, setMobileNumber] = useState('');
  const [mobileError, setMobileError] = useState<string | null>(null);
  const [enteredOtp, setEnteredOtp] = useState('');

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/(tabs)' as any);
    }
  }, [isAuthenticated]);

  const validateMobile = (num: string): boolean => {
    const clean = num.replace(/\D/g, '');
    if (!clean) {
      setMobileError('Please enter your mobile number');
      return false;
    }
    if (clean.length !== 10) {
      setMobileError('Please enter a valid 10-digit mobile number');
      return false;
    }
    setMobileError(null);
    return true;
  };

  const handleSendOtp = async () => {
    Keyboard.dismiss();
    dispatch(clearError());
    if (!validateMobile(mobileNumber)) {
      return;
    }

    const clean = mobileNumber.replace(/\D/g, '');
    await dispatch(requestOtpThunk(clean));
  };

  const handleVerifyOtp = async (otp: string) => {
    Keyboard.dismiss();
    dispatch(clearError());
    const clean = mobileNumber.replace(/\D/g, '');
    const result = await dispatch(verifyOtpThunk({ mobile: clean, otp }));
    if (verifyOtpThunk.fulfilled.match(result)) {
      router.replace('/(tabs)' as any);
    }
  };

  const handleEditMobile = () => {
    dispatch(resetOtpState());
    setEnteredOtp('');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.keyboardView}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <ScrollView
          contentContainerStyle={[
            styles.container,
            otpRequested ? styles.containerTop : styles.containerCenter,
            {
              paddingTop: otpRequested
                ? Math.max(insets.top, 16) + 8
                : Math.max(insets.top, 24) + 16,
              paddingBottom: Math.max(insets.bottom, 20) + 16,
            },
          ]}
          keyboardShouldPersistTaps="handled"
          automaticallyAdjustKeyboardInsets
          showsVerticalScrollIndicator={false}>
          {/* Brand Header */}
          <View
            style={[
              styles.brandContainer,
              otpRequested && styles.brandContainerCompact,
            ]}>
            <View
              style={[
                styles.logoBadge,
                otpRequested && styles.logoBadgeCompact,
              ]}>
              <Ionicons
                name="briefcase"
                size={otpRequested ? 22 : 32}
                color={AppColors.white}
              />
            </View>
            <Text
              style={[
                styles.brandTitle,
                otpRequested && styles.brandTitleCompact,
              ]}>
              ONEMODO
            </Text>
            <View style={styles.badgeRow}>
              <View style={styles.executiveBadge}>
                <Text style={styles.executiveBadgeText}>SALES EXECUTIVE</Text>
              </View>
            </View>
            <Text style={styles.welcomeSubtitle}>
              {otpRequested
                ? 'Enter the 6-digit verification code'
                : 'Sign in to access your dashboard'}
            </Text>
          </View>

          {/* Card Container */}
          <View style={[styles.card, otpRequested && styles.cardCompact]}>
            {!otpRequested ? (
              /* Stage 1: Mobile Input */
              <View style={styles.stageContainer}>
                <Text style={styles.inputLabel}>Mobile Number</Text>
                <View
                  style={[
                    styles.phoneInputRow,
                    Boolean(mobileError) && styles.inputErrorBorder,
                  ]}>
                  <View style={styles.countryCodeBadge}>
                    <Text style={styles.flagEmoji}>🇮🇳</Text>
                    <Text style={styles.countryCode}>+91</Text>
                  </View>
                  <TextInput
                    style={styles.phoneInput}
                    placeholder="Enter 10-digit number"
                    placeholderTextColor={AppColors.textMuted}
                    keyboardType="phone-pad"
                    maxLength={10}
                    value={mobileNumber}
                    onChangeText={(text) => {
                      setMobileNumber(text.replace(/\D/g, ''));
                      if (mobileError) setMobileError(null);
                    }}
                  />
                  {mobileNumber.length > 0 ? (
                    <Pressable
                      onPress={() => setMobileNumber('')}
                      style={styles.clearIcon}>
                      <Ionicons
                        name="close-circle"
                        size={18}
                        color={AppColors.border}
                      />
                    </Pressable>
                  ) : null}
                </View>

                {mobileError ? (
                  <View style={styles.errorBanner}>
                    <Ionicons name="alert-circle" size={14} color={AppColors.error} />
                    <Text style={styles.errorText}>{mobileError}</Text>
                  </View>
                ) : null}

                {error ? (
                  <View style={styles.errorBanner}>
                    <Ionicons name="alert-circle" size={14} color={AppColors.error} />
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                ) : null}

                {/* Submit CTA */}
                <Pressable
                  style={({ pressed }) => [
                    styles.ctaButton,
                    isLoading && styles.ctaButtonDisabled,
                    pressed && styles.ctaButtonPressed,
                  ]}
                  onPress={handleSendOtp}
                  disabled={isLoading}>
                  {isLoading ? (
                    <ActivityIndicator color={AppColors.white} size="small" />
                  ) : (
                    <>
                      <Text style={styles.ctaButtonText}>Get Verification Code</Text>
                      <Ionicons name="arrow-forward" size={18} color={AppColors.white} />
                    </>
                  )}
                </Pressable>
              </View>
            ) : (
              /* Stage 2: 6-Digit Separate OTP Boxes */
              <View style={styles.stageContainer}>
                <View style={styles.mobileConfirmationBox}>
                  <View style={styles.mobileInfo}>
                    <Ionicons
                      name="phone-portrait-outline"
                      size={18}
                      color={AppColors.primaryDark}
                    />
                    <Text style={styles.mobileConfirmationText}>
                      +91 {mobileNumber}
                    </Text>
                  </View>
                  <Pressable style={styles.editMobileBtn} onPress={handleEditMobile}>
                    <Ionicons name="pencil" size={14} color={AppColors.primary} />
                    <Text style={styles.editMobileText}>Change</Text>
                  </Pressable>
                </View>

                {otpMessage ? (
                  <View style={styles.messageBanner}>
                    <Ionicons
                      name="information-circle"
                      size={16}
                      color={AppColors.primaryDark}
                    />
                    <Text style={styles.messageBannerText}>{otpMessage}</Text>
                  </View>
                ) : null}

                <Text style={styles.otpPromptText}>
                  Enter the 6-digit code sent to your mobile
                </Text>

                {/* 6 Individual OTP Boxes with Auto-Submit on 6th digit */}
                <OtpInput
                  length={6}
                  onComplete={(code) => {
                    setEnteredOtp(code);
                    handleVerifyOtp(code);
                  }}
                  error={error}
                  disabled={isVerifying}
                />

                {isVerifying ? (
                  <View style={styles.verifyingContainer}>
                    <ActivityIndicator color={AppColors.primary} size="small" />
                    <Text style={styles.verifyingText}>Verifying code with server...</Text>
                  </View>
                ) : (
                  <Pressable
                    style={({ pressed }) => [
                      styles.ctaButton,
                      styles.verifyButton,
                      pressed && styles.ctaButtonPressed,
                    ]}
                    onPress={() => {
                      if (enteredOtp.length === 6) {
                        handleVerifyOtp(enteredOtp);
                      }
                    }}>
                    <Text style={styles.ctaButtonText}>Verify Code</Text>
                    <Ionicons name="checkmark-circle" size={18} color={AppColors.white} />
                  </Pressable>
                )}
              </View>
            )}
          </View>

          {/* Security & Support Footer */}
          <View style={styles.footer}>
            <Ionicons name="lock-closed" size={14} color={AppColors.mutedSlate} />
            <Text style={styles.footerText}>
              Protected by Onemodo Security • API v3
            </Text>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 20,
  },
  containerCenter: {
    justifyContent: 'center',
  },
  containerTop: {
    justifyContent: 'flex-start',
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  brandContainerCompact: {
    marginBottom: 12,
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: AppColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    elevation: 4,
    shadowColor: AppColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  logoBadgeCompact: {
    width: 44,
    height: 44,
    borderRadius: 12,
    marginBottom: 6,
  },
  brandTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: AppColors.primaryDark,
    letterSpacing: 2,
  },
  brandTitleCompact: {
    fontSize: 20,
  },
  badgeRow: {
    marginTop: 4,
    marginBottom: 6,
  },
  executiveBadge: {
    backgroundColor: '#FDECEC',
    borderWidth: 1,
    borderColor: AppColors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: 8,
  },
  executiveBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: AppColors.primaryDark,
    letterSpacing: 1,
  },
  welcomeSubtitle: {
    fontSize: 13,
    color: AppColors.mutedSlate,
    textAlign: 'center',
    marginTop: 2,
  },
  card: {
    backgroundColor: AppColors.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: AppColors.border,
    padding: 22,
    elevation: 4,
    shadowColor: AppColors.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  cardCompact: {
    padding: 16,
    borderRadius: 16,
  },
  stageContainer: {
    width: '100%',
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: AppColors.textPrimary,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  phoneInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: AppColors.border,
    borderRadius: 12,
    backgroundColor: AppColors.white,
    paddingHorizontal: 12,
    height: 52,
  },
  countryCodeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingRight: 10,
    borderRightWidth: 1,
    borderRightColor: AppColors.border,
    marginRight: 10,
  },
  flagEmoji: {
    fontSize: 16,
  },
  countryCode: {
    fontSize: 15,
    fontWeight: '700',
    color: AppColors.primaryDark,
  },
  phoneInput: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    color: AppColors.textPrimary,
    letterSpacing: 1,
  },
  clearIcon: {
    padding: 4,
  },
  inputErrorBorder: {
    borderColor: AppColors.error,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: AppColors.errorLight,
    padding: 8,
    borderRadius: 8,
    marginTop: 8,
  },
  errorText: {
    fontSize: 12,
    color: AppColors.error,
    fontWeight: '600',
    flex: 1,
  },
  ctaButton: {
    backgroundColor: AppColors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 52,
    borderRadius: 12,
    marginTop: 18,
    elevation: 3,
    shadowColor: AppColors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  verifyButton: {
    marginTop: 14,
    height: 48,
  },
  ctaButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  ctaButtonDisabled: {
    opacity: 0.7,
  },
  ctaButtonText: {
    color: AppColors.white,
    fontSize: 15,
    fontWeight: '700',
  },
  mobileConfirmationBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FAF5F5',
    borderWidth: 1,
    borderColor: AppColors.primaryLight,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginBottom: 10,
  },
  mobileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mobileConfirmationText: {
    fontSize: 14,
    fontWeight: '700',
    color: AppColors.primaryDark,
  },
  editMobileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#FDECEC',
  },
  editMobileText: {
    fontSize: 12,
    fontWeight: '700',
    color: AppColors.primary,
  },
  messageBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F3F4F6',
    padding: 8,
    borderRadius: 8,
    marginBottom: 10,
  },
  messageBannerText: {
    fontSize: 12,
    color: AppColors.mutedSlate,
    fontWeight: '500',
  },
  otpPromptText: {
    fontSize: 13,
    color: AppColors.textPrimary,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 2,
  },
  verifyingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginVertical: 12,
  },
  verifyingText: {
    fontSize: 13,
    color: AppColors.primary,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 20,
  },
  footerText: {
    fontSize: 12,
    color: AppColors.mutedSlate,
    fontWeight: '500',
  },
});
