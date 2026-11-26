import { OtpInput } from "@/components/OtpInput";
import { AppColors } from "@/constants/colors";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  clearError,
  requestOtpThunk,
  resetOtpState,
  verifyOtpThunk,
} from "@/store/slices/authSlice";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const OTP_EXPIRY_SECONDS = 600; // 10 minutes

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

  const [mobileNumber, setMobileNumber] = useState("");
  const [mobileError, setMobileError] = useState<string | null>(null);
  const [enteredOtp, setEnteredOtp] = useState("");
  const [timeLeft, setTimeLeft] = useState(OTP_EXPIRY_SECONDS);
  const [timerKey, setTimerKey] = useState(0);
  const [resendSuccessMessage, setResendSuccessMessage] = useState<
    string | null
  >(null);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/(tabs)" as any);
    }
  }, [isAuthenticated]);

  // 10-minute countdown timer effect
  useEffect(() => {
    if (!otpRequested) {
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [otpRequested, timerKey]);

  const formatTimer = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const validateMobile = (num: string): boolean => {
    const clean = num.replace(/\D/g, "");
    if (!clean) {
      setMobileError("Please enter your mobile number");
      return false;
    }
    if (clean.length !== 10) {
      setMobileError("Please enter a valid 10-digit mobile number");
      return false;
    }
    setMobileError(null);
    return true;
  };

  const handleSendOtp = async () => {
    Keyboard.dismiss();
    dispatch(clearError());
    setResendSuccessMessage(null);
    if (!validateMobile(mobileNumber)) {
      return;
    }

    const clean = mobileNumber.replace(/\D/g, "");
    const result = await dispatch(requestOtpThunk(clean));
    if (requestOtpThunk.fulfilled.match(result)) {
      setTimeLeft(OTP_EXPIRY_SECONDS);
      setTimerKey((k) => k + 1);
    }
  };

  const handleResendOtp = async () => {
    Keyboard.dismiss();
    dispatch(clearError());
    setEnteredOtp("");
    const clean = mobileNumber.replace(/\D/g, "");
    const result = await dispatch(requestOtpThunk(clean));
    if (requestOtpThunk.fulfilled.match(result)) {
      setTimeLeft(OTP_EXPIRY_SECONDS);
      setTimerKey((k) => k + 1);
      setResendSuccessMessage("New OTP has been sent to your mobile number.");
    }
  };

  const handleVerifyOtp = async (otp: string) => {
    Keyboard.dismiss();
    dispatch(clearError());
    const clean = mobileNumber.replace(/\D/g, "");
    const result = await dispatch(verifyOtpThunk({ mobile: clean, otp }));
    if (verifyOtpThunk.fulfilled.match(result)) {
      router.replace("/(tabs)" as any);
    }
  };

  const handleEditMobile = () => {
    dispatch(resetOtpState());
    setEnteredOtp("");
    setTimeLeft(OTP_EXPIRY_SECONDS);
    setResendSuccessMessage(null);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.keyboardView}
    >
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
          showsVerticalScrollIndicator={false}
        >
          {/* Brand Header */}
          <View
            style={[
              styles.brandContainer,
              otpRequested && styles.brandContainerCompact,
            ]}
          >
            <View
              style={[
                styles.logoBadge,
                otpRequested && styles.logoBadgeCompact,
              ]}
            >
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
              ]}
            >
              ONEMODO
            </Text>
            <View style={styles.badgeRow}>
              <View style={styles.executiveBadge}>
                <Text style={styles.executiveBadgeText}>SALES EXECUTIVE</Text>
              </View>
            </View>
            <Text style={styles.welcomeSubtitle}>
              {otpRequested
                ? "Enter the 6-digit verification code"
                : "Sign in to access your dashboard"}
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
                  ]}
                >
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
                      setMobileNumber(text.replace(/\D/g, ""));
                      if (mobileError) setMobileError(null);
                    }}
                  />
                  {mobileNumber.length > 0 ? (
                    <Pressable
                      onPress={() => setMobileNumber("")}
                      style={styles.clearIcon}
                    >
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
                    <Ionicons
                      name="alert-circle"
                      size={14}
                      color={AppColors.error}
                    />
                    <Text style={styles.errorBannerText}>{mobileError}</Text>
                  </View>
                ) : null}

                {error ? (
                  <View style={styles.errorBanner}>
                    <Ionicons
                      name="alert-circle"
                      size={14}
                      color={AppColors.error}
                    />
                    <Text style={styles.errorBannerText}>{error}</Text>
                  </View>
                ) : null}

                <Pressable
                  style={({ pressed }) => [
                    styles.ctaButton,
                    isLoading && styles.ctaButtonDisabled,
                    pressed && styles.ctaButtonPressed,
                  ]}
                  onPress={handleSendOtp}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color={AppColors.white} size="small" />
                  ) : (
                    <>
                      <Text style={styles.ctaButtonText}>
                        Get Verification Code
                      </Text>
                      <Ionicons
                        name="arrow-forward"
                        size={18}
                        color={AppColors.white}
                      />
                    </>
                  )}
                </Pressable>
              </View>
            ) : (
              /* Stage 2: OTP Entry */
              <View style={styles.stageContainer}>
                {/* Mobile Preview & Edit */}
                <View style={styles.mobilePreviewRow}>
                  <View style={styles.mobilePreviewTexts}>
                    <Text style={styles.mobilePreviewLabel}>Sent code to</Text>
                    <Text style={styles.mobilePreviewNumber}>
                      +91 {mobileNumber}
                    </Text>
                  </View>
                  <Pressable
                    style={styles.editMobileBtn}
                    onPress={handleEditMobile}
                  >
                    <Ionicons
                      name="pencil-outline"
                      size={14}
                      color={AppColors.dominant}
                    />
                    <Text style={styles.editMobileText}>Change</Text>
                  </Pressable>
                </View>

                {/* Server info message */}
                {otpMessage ? (
                  <View style={styles.infoBanner}>
                    <Ionicons
                      name="information-circle"
                      size={15}
                      color={AppColors.dominant}
                    />
                    <Text style={styles.infoBannerText}>{otpMessage}</Text>
                  </View>
                ) : null}

                {/* Resend success notice */}
                {resendSuccessMessage ? (
                  <View style={styles.resendSuccessBanner}>
                    <Ionicons
                      name="checkmark-circle"
                      size={15}
                      color={AppColors.success}
                    />
                    <Text style={styles.resendSuccessText}>
                      {resendSuccessMessage}
                    </Text>
                  </View>
                ) : null}

                {/* 6-Digit OTP Box Grid */}
                <View style={styles.otpWrapper}>
                  <Text style={styles.otpPrompt}>
                    Enter the 6-digit code below:
                  </Text>
                  <OtpInput
                    key={timerKey}
                    length={6}
                    onComplete={(otp) => {
                      setEnteredOtp(otp);
                      if (timeLeft > 0) {
                        handleVerifyOtp(otp);
                      }
                    }}
                    error={
                      timeLeft === 0
                        ? "This OTP has expired. Please tap Resend OTP below."
                        : error
                    }
                    disabled={isVerifying || timeLeft === 0}
                  />
                </View>

                {/* 10-Minute Countdown Timer or Resend OTP Button */}
                <View style={styles.timerSection}>
                  {timeLeft > 0 ? (
                    <View style={styles.timerRow}>
                      <Ionicons
                        name="time-outline"
                        size={15}
                        color={AppColors.mutedSlate}
                      />
                      <Text style={styles.timerText}>
                        OTP expires in{" "}
                        <Text style={styles.timerDigits}>
                          {formatTimer(timeLeft)}
                        </Text>
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.expiredWrapper}>
                      <View style={styles.expiredBanner}>
                        <Ionicons
                          name="alert-circle"
                          size={15}
                          color={AppColors.warning}
                        />
                        <Text style={styles.expiredText}>
                          OTP expired after 10 mins
                        </Text>
                      </View>
                      <Pressable
                        style={({ pressed }) => [
                          styles.resendButton,
                          isLoading && styles.resendButtonDisabled,
                          pressed && styles.resendButtonPressed,
                        ]}
                        disabled={isLoading}
                        onPress={handleResendOtp}
                      >
                        {isLoading ? (
                          <ActivityIndicator
                            size="small"
                            color={AppColors.dominant}
                          />
                        ) : (
                          <>
                            <Ionicons
                              name="refresh"
                              size={16}
                              color={AppColors.dominant}
                            />
                            <Text style={styles.resendButtonText}>
                              Resend OTP
                            </Text>
                          </>
                        )}
                      </Pressable>
                    </View>
                  )}
                </View>

                {/* Manual Verify CTA */}
                {isVerifying ? (
                  <View style={styles.verifyingIndicator}>
                    <ActivityIndicator
                      size="small"
                      color={AppColors.dominant}
                    />
                    <Text style={styles.verifyingText}>
                      Verifying with Onemodo Server...
                    </Text>
                  </View>
                ) : (
                  <Pressable
                    style={({ pressed }) => [
                      styles.ctaButton,
                      (enteredOtp.length !== 6 || timeLeft === 0) &&
                        styles.ctaButtonDisabled,
                      pressed && styles.ctaButtonPressed,
                    ]}
                    disabled={
                      enteredOtp.length !== 6 || isVerifying || timeLeft === 0
                    }
                    onPress={() => {
                      if (enteredOtp.length === 6 && timeLeft > 0) {
                        handleVerifyOtp(enteredOtp);
                      }
                    }}
                  >
                    <Text style={styles.ctaButtonText}>Verify Code</Text>
                    <Ionicons
                      name="checkmark-circle"
                      size={18}
                      color={AppColors.white}
                    />
                  </Pressable>
                )}
              </View>
            )}
          </View>

          {/* Security & Support Footer */}
          <View style={styles.footer}>
            <Ionicons
              name="lock-closed"
              size={14}
              color={AppColors.mutedSlate}
            />
            <Text style={styles.footerText}>Protected by Onemodo Security</Text>
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
    justifyContent: "center",
  },
  containerTop: {
    justifyContent: "flex-start",
  },
  brandContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  brandContainerCompact: {
    marginBottom: 12,
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: AppColors.dominant,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
    elevation: 4,
    shadowColor: AppColors.dominant,
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
    fontWeight: "900",
    color: AppColors.surface,
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
    backgroundColor: AppColors.primaryLight,
    borderWidth: 1,
    borderColor: AppColors.primaryBorder,
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: 8,
  },
  executiveBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: AppColors.dominant,
    letterSpacing: 1,
  },
  welcomeSubtitle: {
    fontSize: 13,
    color: AppColors.mutedSlate,
    textAlign: "center",
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
    width: "100%",
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: AppColors.surface,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  phoneInputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: AppColors.border,
    borderRadius: 12,
    backgroundColor: AppColors.white,
    paddingHorizontal: 12,
    height: 52,
  },
  countryCodeBadge: {
    flexDirection: "row",
    alignItems: "center",
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
    fontWeight: "800",
    color: AppColors.dominant,
  },
  phoneInput: {
    flex: 1,
    fontSize: 17,
    fontWeight: "700",
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
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: AppColors.errorLight,
    padding: 8,
    borderRadius: 8,
    marginTop: 8,
  },
  errorBannerText: {
    fontSize: 12,
    color: AppColors.error,
    fontWeight: "600",
    flex: 1,
  },
  ctaButton: {
    backgroundColor: AppColors.dominant,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 52,
    borderRadius: 12,
    marginTop: 18,
    elevation: 3,
    shadowColor: AppColors.dominant,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
  },
  ctaButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  ctaButtonDisabled: {
    opacity: 0.5,
  },
  ctaButtonText: {
    color: AppColors.white,
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  mobilePreviewRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: AppColors.cardSecondary,
    borderWidth: 1,
    borderColor: AppColors.border,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  mobilePreviewTexts: {
    flex: 1,
  },
  mobilePreviewLabel: {
    fontSize: 11,
    color: AppColors.mutedSlate,
    fontWeight: "500",
  },
  mobilePreviewNumber: {
    fontSize: 15,
    fontWeight: "800",
    color: AppColors.surface,
    marginTop: 2,
  },
  editMobileBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: AppColors.card,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  editMobileText: {
    fontSize: 12,
    fontWeight: "700",
    color: AppColors.dominant,
  },
  infoBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: AppColors.primaryLight,
    borderWidth: 1,
    borderColor: AppColors.primaryBorder,
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  infoBannerText: {
    fontSize: 12,
    color: AppColors.dominant,
    fontWeight: "600",
    flex: 1,
  },
  resendSuccessBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: AppColors.successLight,
    borderWidth: 1,
    borderColor: AppColors.successBorder,
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  resendSuccessText: {
    fontSize: 12,
    color: AppColors.success,
    fontWeight: "600",
    flex: 1,
  },
  otpWrapper: {
    marginVertical: 4,
  },
  otpPrompt: {
    fontSize: 12,
    color: AppColors.mutedSlate,
    fontWeight: "600",
    marginBottom: 4,
    textAlign: "center",
  },
  timerSection: {
    marginTop: 10,
    marginBottom: 4,
    alignItems: "center",
  },
  timerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: AppColors.primaryLight,
    borderWidth: 1,
    borderColor: AppColors.primaryBorder,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  timerText: {
    fontSize: 12,
    color: AppColors.mutedSlate,
    fontWeight: "500",
  },
  timerDigits: {
    fontWeight: "800",
    color: AppColors.dominant,
  },
  expiredWrapper: {
    alignItems: "center",
    width: "100%",
    gap: 8,
  },
  expiredBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: AppColors.warningLight,
    borderWidth: 1,
    borderColor: AppColors.warningBorder,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
  },
  expiredText: {
    fontSize: 12,
    fontWeight: "700",
    color: AppColors.warning,
  },
  resendButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: AppColors.primaryLight,
    borderWidth: 1.5,
    borderColor: AppColors.dominant,
    marginTop: 4,
  },
  resendButtonPressed: {
    backgroundColor: "#DBEAFE",
    transform: [{ scale: 0.98 }],
  },
  resendButtonDisabled: {
    opacity: 0.6,
  },
  resendButtonText: {
    fontSize: 13,
    fontWeight: "800",
    color: AppColors.dominant,
  },
  verifyingIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 18,
    paddingVertical: 12,
  },
  verifyingText: {
    fontSize: 13,
    color: AppColors.dominant,
    fontWeight: "600",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 20,
    marginBottom: 8,
  },
  footerText: {
    fontSize: 11,
    color: AppColors.mutedSlate,
    fontWeight: "500",
  },
});
