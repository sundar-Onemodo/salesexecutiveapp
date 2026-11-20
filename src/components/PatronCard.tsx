import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { AppColors } from '@/constants/colors';
import { Patron } from '@/services/api';

interface PatronCardProps {
  patron: Patron;
  currency?: string;
  onCollect: (patron: Patron) => void;
}

export const PatronCard: React.FC<PatronCardProps> = ({
  patron,
  currency = 'INR',
  onCollect,
}) => {
  const creditLimitNum = parseFloat(patron.credit_limit) || 0;
  const usedCreditNum = parseFloat(patron.used_credit) || 0;
  const availableCreditNum = parseFloat(patron.available_credit) || 0;

  const usedPercentage =
    creditLimitNum > 0 ? Math.min(100, Math.round((usedCreditNum / creditLimitNum) * 100)) : 0;

  const formatCurrency = (val: number) => {
    return `₹${val.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {patron.name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .slice(0, 2)
              .toUpperCase()}
          </Text>
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.name}>{patron.name}</Text>
          <View style={styles.idBadge}>
            <Text style={styles.idText}>ID: #{patron.id}</Text>
          </View>
        </View>
        <Pressable
          style={({ pressed }) => [styles.collectButton, pressed && styles.collectButtonPressed]}
          onPress={() => onCollect(patron)}>
          <Ionicons name="cash-outline" size={16} color={AppColors.white} />
          <Text style={styles.collectButtonText}>Collect</Text>
        </Pressable>
      </View>

      <View style={styles.divider} />

      {/* Credit Summary Grid */}
      <View style={styles.metricsGrid}>
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>Available Credit</Text>
          <Text style={styles.metricValueAvailable}>
            {formatCurrency(availableCreditNum)}
          </Text>
        </View>

        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>Credit Limit</Text>
          <Text style={styles.metricValueNeutral}>{formatCurrency(creditLimitNum)}</Text>
        </View>

        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>Used Credit</Text>
          <Text style={styles.metricValueUsed}>{formatCurrency(usedCreditNum)}</Text>
        </View>
      </View>

      {/* Credit Usage Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressBar,
              { width: `${usedPercentage}%` },
              usedPercentage > 80 && styles.progressBarHigh,
            ]}
          />
        </View>
        <View style={styles.progressLabels}>
          <Text style={styles.progressText}>{usedPercentage}% utilized</Text>
          <Text style={styles.progressSubText}>
            {formatCurrency(availableCreditNum)} remaining
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: AppColors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: AppColors.border,
    padding: 16,
    marginBottom: 14,
    elevation: 2,
    shadowColor: AppColors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FBEBEB',
    borderWidth: 1.5,
    borderColor: AppColors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: AppColors.primaryDark,
  },
  headerInfo: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: AppColors.textPrimary,
    marginBottom: 3,
  },
  idBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#F4EEEE',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  idText: {
    fontSize: 11,
    fontWeight: '600',
    color: AppColors.mutedSlate,
  },
  collectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: AppColors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    elevation: 2,
    shadowColor: AppColors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
  },
  collectButtonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  collectButtonText: {
    color: AppColors.white,
    fontSize: 13,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: '#F0EAEA',
    marginVertical: 14,
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 12,
  },
  metricItem: {
    flex: 1,
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: AppColors.mutedSlate,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  metricValueAvailable: {
    fontSize: 14,
    fontWeight: '800',
    color: AppColors.primaryDark,
  },
  metricValueNeutral: {
    fontSize: 13,
    fontWeight: '600',
    color: AppColors.textPrimary,
  },
  metricValueUsed: {
    fontSize: 13,
    fontWeight: '600',
    color: AppColors.mutedSlate,
  },
  progressContainer: {
    marginTop: 2,
  },
  progressTrack: {
    height: 6,
    backgroundColor: '#F2EDED',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: AppColors.primaryLight,
    borderRadius: 3,
  },
  progressBarHigh: {
    backgroundColor: AppColors.primary,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  progressText: {
    fontSize: 11,
    fontWeight: '600',
    color: AppColors.mutedSlate,
  },
  progressSubText: {
    fontSize: 11,
    fontWeight: '500',
    color: AppColors.mutedSlate,
  },
});
