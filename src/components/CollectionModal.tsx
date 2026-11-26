import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  Pressable,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { AppColors } from '@/constants/colors';
import { Patron, TRANSACTION_MODES, TransactionMode } from '@/services/api';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { submitCollectionThunk, clearLastCollection } from '@/store/slices/patronsSlice';

interface CollectionModalProps {
  visible: boolean;
  patron: Patron | null;
  initialMode?: TransactionMode;
  onClose: () => void;
  onSuccess?: () => void;
}

export const CollectionModal: React.FC<CollectionModalProps> = ({
  visible,
  patron,
  initialMode = 'Cash',
  onClose,
  onSuccess,
}) => {
  const dispatch = useAppDispatch();
  const { isSubmittingCollection, lastCollectionSuccess, error } = useAppSelector(
    (state) => state.patrons
  );

  const [amount, setAmount] = useState('');
  const [transactionMode, setTransactionMode] = useState<TransactionMode>(initialMode);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const resetForm = () => {
    setAmount('');
    setTransactionMode(initialMode);
    setIsDropdownOpen(false);
    setValidationError(null);
    dispatch(clearLastCollection());
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleModeSelect = (mode: TransactionMode) => {
    setTransactionMode(mode);
    setIsDropdownOpen(false);
  };

  const handleSubmit = async () => {
    if (!patron) return;

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setValidationError('Please enter a valid amount greater than 0');
      return;
    }

    setValidationError(null);

    const result = await dispatch(
      submitCollectionThunk({
        patron_id: patron.id,
        patron_name: patron.name,
        amount: parsedAmount.toFixed(2),
        transaction_mode: transactionMode,
      })
    );

    if (submitCollectionThunk.fulfilled.match(result)) {
      if (onSuccess) {
        onSuccess();
      }
    }
  };

  const getModeIcon = (mode: TransactionMode): React.ComponentProps<typeof Ionicons>['name'] => {
    switch (mode) {
      case 'Cash':
        return 'cash-outline';
      case 'Card':
        return 'card-outline';
      case 'Cheque':
        return 'document-text-outline';
      case 'GPAY':
      case 'PHONEPAY':
        return 'phone-portrait-outline';
      case 'RTGS':
      case 'IMPS':
      case 'NEFT':
        return 'business-outline';
      default:
        return 'wallet-outline';
    }
  };

  if (!patron) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        style={styles.overlay}>
        <View style={styles.backdrop}>
          {/* Backdrop Tap to Dismiss Dropdown or Close */}
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => {
              if (isDropdownOpen) {
                setIsDropdownOpen(false);
              } else {
                handleClose();
              }
            }}
          />

          <View style={styles.sheetContainer}>
            {/* Sheet Header */}
            <View style={styles.sheetHeader}>
              <View style={styles.indicator} />
              <View style={styles.headerRow}>
                <View>
                  <Text style={styles.sheetTitle}>Executive Collection</Text>
                  <Text style={styles.sheetSubtitle}>Record a new patron payment</Text>
                </View>
                <Pressable style={styles.closeButton} onPress={handleClose} hitSlop={8}>
                  <Ionicons name="close" size={22} color={AppColors.mutedSlate} />
                </Pressable>
              </View>
            </View>

            <ScrollView
              style={styles.sheetBody}
              contentContainerStyle={styles.sheetContentContainer}
              keyboardShouldPersistTaps="handled"
              automaticallyAdjustKeyboardInsets={true}
              showsVerticalScrollIndicator={false}>
              {/* Success State */}
              {lastCollectionSuccess ? (
                <View style={styles.successContainer}>
                  <View style={styles.successIconBadge}>
                    <Ionicons name="checkmark-circle" size={54} color={AppColors.dominant} />
                  </View>
                  <Text style={styles.successTitle}>Collection Recorded!</Text>
                  <Text style={styles.successSubtitle}>
                    Payment of ₹{lastCollectionSuccess.amount} recorded for {patron.name}
                  </Text>

                  <View style={styles.receiptBox}>
                    <View style={styles.receiptRow}>
                      <Text style={styles.receiptLabel}>Collection ID</Text>
                      <Text style={styles.receiptValue}>
                        #{lastCollectionSuccess.collection_id}
                      </Text>
                    </View>
                    <View style={styles.receiptRow}>
                      <Text style={styles.receiptLabel}>Status</Text>
                      <View style={styles.statusBadge}>
                        <Text style={styles.statusBadgeText}>
                          {lastCollectionSuccess.status?.toUpperCase() || 'COMPLETED'}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.receiptRow}>
                      <Text style={styles.receiptLabel}>Transaction Mode</Text>
                      <Text style={styles.receiptValue}>{transactionMode}</Text>
                    </View>
                    {lastCollectionSuccess.request_id ? (
                      <View style={styles.receiptRow}>
                        <Text style={styles.receiptLabel}>Request ID</Text>
                        <Text style={styles.receiptValueSmall} numberOfLines={1}>
                          {lastCollectionSuccess.request_id}
                        </Text>
                      </View>
                    ) : null}
                  </View>

                  <Pressable
                    style={({ pressed }) => [
                      styles.doneButton,
                      pressed && styles.doneButtonPressed,
                    ]}
                    onPress={handleClose}
                    hitSlop={12}>
                    <Text style={styles.doneButtonText}>Done</Text>
                  </Pressable>
                </View>
              ) : (
                  /* Form State */
                  <View style={styles.formContainer}>
                    {/* Patron Info Card */}
                    <View style={styles.patronCard}>
                      <View style={styles.patronAvatar}>
                        <Text style={styles.patronAvatarText}>
                          {patron.name.slice(0, 2).toUpperCase()}
                        </Text>
                      </View>
                      <View style={styles.patronDetails}>
                        <Text style={styles.patronName}>{patron.name}</Text>
                        <Text style={styles.patronId}>Patron ID: #{patron.id}</Text>
                        <Text style={styles.patronCredit}>
                          Avail Credit: ₹{parseFloat(patron.available_credit).toLocaleString('en-IN')}
                        </Text>
                      </View>
                    </View>

                    {/* Amount Input */}
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Collection Amount (₹)</Text>
                      <View
                        style={[
                          styles.amountInputContainer,
                          Boolean(validationError) && styles.inputErrorBorder,
                        ]}>
                        <Text style={styles.currencyPrefix}>₹</Text>
                        <TextInput
                          style={styles.amountInput}
                          placeholder="0.00"
                          placeholderTextColor={AppColors.textMuted}
                          keyboardType="decimal-pad"
                          value={amount}
                          onChangeText={(text) => {
                            setAmount(text);
                            if (validationError) setValidationError(null);
                          }}
                        />
                      </View>
                      {validationError ? (
                        <Text style={styles.errorText}>{validationError}</Text>
                      ) : null}
                    </View>

                    {/* Transaction Mode Dropdown */}
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Transaction Mode</Text>
                      <Pressable
                        style={styles.dropdownTrigger}
                        onPress={() => setIsDropdownOpen(!isDropdownOpen)}>
                        <View style={styles.selectedModeRow}>
                          <Ionicons
                            name={getModeIcon(transactionMode)}
                            size={18}
                            color={AppColors.dominant}
                          />
                          <Text style={styles.dropdownTriggerText}>
                            {transactionMode}
                          </Text>
                        </View>
                        <Ionicons
                          name={isDropdownOpen ? 'chevron-up' : 'chevron-down'}
                          size={18}
                          color={AppColors.mutedSlate}
                        />
                      </Pressable>

                      {/* Dropdown Menu Options */}
                      {isDropdownOpen ? (
                        <View style={styles.dropdownMenu}>
                          {TRANSACTION_MODES.map((mode) => {
                            const isSelected = transactionMode === mode;
                            return (
                              <Pressable
                                key={mode}
                                style={[
                                  styles.dropdownItem,
                                  isSelected && styles.dropdownItemSelected,
                                ]}
                                onPress={() => handleModeSelect(mode)}>
                                <View style={styles.selectedModeRow}>
                                  <Ionicons
                                    name={getModeIcon(mode)}
                                    size={18}
                                    color={
                                      isSelected
                                        ? AppColors.dominant
                                        : AppColors.mutedSlate
                                    }
                                  />
                                  <Text
                                    style={[
                                      styles.dropdownItemText,
                                      isSelected && styles.dropdownItemTextSelected,
                                    ]}>
                                    {mode}
                                  </Text>
                                </View>
                                {isSelected ? (
                                  <Ionicons
                                    name="checkmark"
                                    size={16}
                                    color={AppColors.dominant}
                                  />
                                ) : null}
                              </Pressable>
                            );
                          })}
                        </View>
                      ) : null}
                    </View>

                    {/* Server Error Message */}
                    {error ? (
                      <Text style={styles.serverErrorText}>{error}</Text>
                    ) : null}

                    {/* Submit Button */}
                    <Pressable
                      style={[
                        styles.submitButton,
                        isSubmittingCollection && styles.submitButtonDisabled,
                      ]}
                      onPress={handleSubmit}
                      disabled={isSubmittingCollection}>
                      {isSubmittingCollection ? (
                        <ActivityIndicator color={AppColors.white} size="small" />
                      ) : (
                        <>
                          <Ionicons
                            name="arrow-forward-circle"
                            size={20}
                            color={AppColors.white}
                          />
                          <Text style={styles.submitButtonText}>
                            Record Collection
                          </Text>
                        </>
                      )}
                    </Pressable>
                  </View>
                )}
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
  },
  backdrop: {
    flex: 1,
    backgroundColor: AppColors.overlay,
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: AppColors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    elevation: 20,
    shadowColor: AppColors.shadow,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  sheetHeader: {
    alignItems: 'center',
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.borderMuted,
  },
  indicator: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: AppColors.border,
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: AppColors.surface,
  },
  sheetSubtitle: {
    fontSize: 12,
    color: AppColors.mutedSlate,
    marginTop: 2,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: AppColors.primaryTint,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sheetBody: {
    padding: 20,
  },
  formContainer: {
    paddingBottom: 24,
  },
  patronCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.primaryTint,
    borderWidth: 1,
    borderColor: AppColors.border,
    padding: 14,
    borderRadius: 14,
    marginBottom: 18,
    gap: 12,
  },
  patronAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: AppColors.iceBlue,
    justifyContent: 'center',
    alignItems: 'center',
  },
  patronAvatarText: {
    fontSize: 15,
    fontWeight: '800',
    color: AppColors.dominant,
  },
  patronDetails: {
    flex: 1,
  },
  patronName: {
    fontSize: 15,
    fontWeight: '700',
    color: AppColors.textPrimary,
  },
  patronId: {
    fontSize: 12,
    color: AppColors.mutedSlate,
    marginTop: 1,
  },
  patronCredit: {
    fontSize: 12,
    fontWeight: '700',
    color: AppColors.dominant,
    marginTop: 2,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: AppColors.surface,
    marginBottom: 8,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: AppColors.border,
    borderRadius: 12,
    backgroundColor: AppColors.white,
    paddingHorizontal: 14,
    height: 52,
  },
  currencyPrefix: {
    fontSize: 20,
    fontWeight: '800',
    color: AppColors.dominant,
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: AppColors.textPrimary,
  },
  inputErrorBorder: {
    borderColor: AppColors.error,
  },
  errorText: {
    fontSize: 12,
    color: AppColors.error,
    marginTop: 4,
  },
  serverErrorText: {
    fontSize: 13,
    color: AppColors.error,
    marginVertical: 10,
    textAlign: 'center',
    fontWeight: '600',
  },
  dropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: AppColors.border,
    borderRadius: 12,
    backgroundColor: AppColors.white,
    paddingHorizontal: 14,
    height: 52,
  },
  selectedModeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dropdownTriggerText: {
    fontSize: 15,
    fontWeight: '600',
    color: AppColors.textPrimary,
  },
  dropdownMenu: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: AppColors.border,
    borderRadius: 12,
    backgroundColor: AppColors.white,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: AppColors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.borderMuted,
  },
  dropdownItemSelected: {
    backgroundColor: AppColors.iceBlue,
  },
  dropdownItemText: {
    fontSize: 14,
    fontWeight: '500',
    color: AppColors.textPrimary,
  },
  dropdownItemTextSelected: {
    fontWeight: '800',
    color: AppColors.dominant,
  },
  submitButton: {
    backgroundColor: AppColors.dominant,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 52,
    borderRadius: 12,
    marginTop: 10,
    elevation: 3,
    shadowColor: AppColors.dominant,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: AppColors.white,
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  successIconBadge: {
    marginBottom: 12,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: AppColors.surface,
    marginBottom: 6,
  },
  successSubtitle: {
    fontSize: 13,
    color: AppColors.mutedSlate,
    textAlign: 'center',
    marginBottom: 20,
  },
  receiptBox: {
    width: '100%',
    backgroundColor: AppColors.primaryTint,
    borderWidth: 1,
    borderColor: AppColors.border,
    borderRadius: 14,
    padding: 16,
    gap: 12,
    marginBottom: 20,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  receiptLabel: {
    fontSize: 13,
    color: AppColors.mutedSlate,
    fontWeight: '500',
  },
  receiptValue: {
    fontSize: 14,
    fontWeight: '700',
    color: AppColors.surface,
  },
  receiptValueSmall: {
    fontSize: 11,
    fontWeight: '600',
    color: AppColors.mutedSlate,
    maxWidth: 160,
  },
  statusBadge: {
    backgroundColor: AppColors.tealLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: AppColors.surface,
  },
  doneButton: {
    width: '100%',
    backgroundColor: AppColors.dominant,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  doneButtonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
  doneButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: AppColors.white,
  },
  sheetContentContainer: {
    paddingBottom: 40,
  },
});
