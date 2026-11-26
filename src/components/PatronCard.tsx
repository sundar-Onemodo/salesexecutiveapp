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
  onCollect,
}) => {
  const creditLimitNum = parseFloat(patron.credit_limit) || 0;
  const usedCreditNum = parseFloat(patron.used_credit) || 0;
  const availableCreditNum = parseFloat(patron.available_credit) || 0;

  const usedPercentage =
    creditLimitNum > 0 ? Math.min(100, Math.round((usedCreditNum / creditLimitNum) * 100)) : 0;
  const isHealthy = usedPercentage < 60;

  const formatCurrency = (val: number) => {
    return `₹${val.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.cardContainer,
        pressed && styles.cardPressed,
      ]}
      onPress={() => onCollect(patron)}
      accessibilityLabel={`Patron ${patron.name}, tap to record collection`}>
      {/* Left Health Pillar */}
      <View
        style={[
          styles.leftPillar,
          { backgroundColor: isHealthy ? AppColors.success : AppColors.warning },
        ]}
      />

      <View style={styles.cardInner}>
        {/* Header Row */}
        <View style={styles.headerRow}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{getInitials(patron.name)}</Text>
          </View>
          <View style={styles.titleInfo}>
            <Text style={styles.clientName}>{patron.name}</Text>
            <View style={styles.tagRow}>
              <View style={styles.idTag}>
                <Ionicons name="card-outline" size={11} color={AppColors.mutedSlate} />
                <Text style={styles.idTagText}>#{patron.id}</Text>
              </View>
              <View
                style={[
                  styles.healthBadge,
                  { backgroundColor: isHealthy ? AppColors.successLight : AppColors.warningLight },
                ]}>
                <View
                  style={[
                    styles.dotIndicator,
                    { backgroundColor: isHealthy ? AppColors.success : AppColors.warning },
                  ]}
                />
                <Text
                  style={[
                    styles.healthBadgeText,
                    { color: isHealthy ? AppColors.success : AppColors.warning },
                  ]}>
                  {usedPercentage === 0 ? 'Full Credit' : `${usedPercentage}% Utilized`}
                </Text>
              </View>
            </View>
          </View>

          {/* Action Indicator Chevron */}
          <View style={styles.chevronBox}>
            <Ionicons name="chevron-forward" size={18} color={AppColors.dominant} />
          </View>
        </View>

        {/* Central Financial Display Panel */}
        <View style={styles.financialPanel}>
          <View style={styles.availableSection}>
            <Text style={styles.availableLabel}>AVAILABLE CREDIT</Text>
            <Text style={styles.availableValue}>{formatCurrency(availableCreditNum)}</Text>
          </View>

          <View style={styles.financialDivider} />

          <View style={styles.miniStatsCol}>
            <View style={styles.miniStatItem}>
              <Text style={styles.miniStatLabel}>Limit:</Text>
              <Text style={styles.miniStatValue}>{formatCurrency(creditLimitNum)}</Text>
            </View>
            <View style={styles.miniStatItem}>
              <Text style={styles.miniStatLabel}>Used:</Text>
              <Text
                style={[
                  styles.miniStatValue,
                  usedCreditNum > 0 && { color: AppColors.warning, fontWeight: '700' },
                ]}>
                {formatCurrency(usedCreditNum)}
              </Text>
            </View>
          </View>
        </View>

        {/* Dual-Tone Visual Progress Bar */}
        <View style={styles.gaugeContainer}>
          <View style={styles.gaugeTrack}>
            <View
              style={[
                styles.gaugeFill,
                {
                  width: `${usedPercentage}%`,
                  backgroundColor: usedPercentage > 75 ? AppColors.warning : AppColors.dominant,
                },
              ]}
            />
          </View>
          <View style={styles.gaugeLegendRow}>
            <Text style={styles.gaugeLegendText}>
              {usedPercentage}% used • {(100 - usedPercentage).toFixed(0)}% available
            </Text>
            <View style={styles.tapToCollectRow}>
              <Ionicons name="wallet-outline" size={12} color={AppColors.dominant} />
              <Text style={styles.tapToCollectText}>Tap to collect</Text>
            </View>
          </View>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: AppColors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: AppColors.border,
    marginBottom: 14,
    flexDirection: 'row',
    overflow: 'hidden',
    elevation: 2,
    shadowColor: AppColors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
  },
  cardPressed: {
    opacity: 0.94,
    transform: [{ scale: 0.99 }],
    borderColor: AppColors.dominant,
  },
  leftPillar: {
    width: 4,
    height: '100%',
  },
  cardInner: {
    flex: 1,
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: AppColors.primaryLight,
    borderWidth: 1.5,
    borderColor: AppColors.primaryBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 15,
    fontWeight: '800',
    color: AppColors.dominant,
  },
  titleInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: 16,
    fontWeight: '800',
    color: AppColors.textPrimary,
    letterSpacing: -0.2,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 3,
  },
  idTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: AppColors.cardSecondary,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  idTagText: {
    fontSize: 11,
    fontWeight: '600',
    color: AppColors.mutedSlate,
  },
  healthBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  dotIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  healthBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  chevronBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: AppColors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  financialPanel: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.cardSecondary,
    borderWidth: 1,
    borderColor: AppColors.border,
    borderRadius: 12,
    padding: 12,
    marginTop: 14,
  },
  availableSection: {
    flex: 1.3,
  },
  availableLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: AppColors.mutedSlate,
    letterSpacing: 0.6,
  },
  availableValue: {
    fontSize: 18,
    fontWeight: '900',
    color: AppColors.dominant,
    marginTop: 2,
  },
  financialDivider: {
    width: 1,
    height: 36,
    backgroundColor: AppColors.border,
    marginHorizontal: 10,
  },
  miniStatsCol: {
    flex: 1,
    gap: 4,
  },
  miniStatItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  miniStatLabel: {
    fontSize: 11,
    color: AppColors.mutedSlate,
    fontWeight: '500',
  },
  miniStatValue: {
    fontSize: 11,
    fontWeight: '700',
    color: AppColors.textPrimary,
  },
  gaugeContainer: {
    marginTop: 12,
  },
  gaugeTrack: {
    height: 6,
    backgroundColor: AppColors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  gaugeFill: {
    height: '100%',
    borderRadius: 3,
  },
  gaugeLegendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  gaugeLegendText: {
    fontSize: 11,
    color: AppColors.mutedSlate,
    fontWeight: '500',
  },
  tapToCollectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tapToCollectText: {
    fontSize: 11,
    fontWeight: '700',
    color: AppColors.dominant,
  },
});
