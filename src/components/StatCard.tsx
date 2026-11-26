import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { AppColors } from '@/constants/colors';

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  iconName: React.ComponentProps<typeof Ionicons>['name'];
  variant?: 'primary' | 'dark' | 'light' | 'slate';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  iconName,
  variant = 'light',
}) => {
  const getColors = () => {
    switch (variant) {
      case 'dark':
        // Available Credit (Precision Cobalt)
        return {
          bg: AppColors.card,
          border: AppColors.primaryBorder,
          iconBg: AppColors.primaryLight,
          iconColor: AppColors.dominant,
          valColor: AppColors.dominant,
        };
      case 'light':
        // Credit Limit (Midnight Navy)
        return {
          bg: AppColors.card,
          border: AppColors.border,
          iconBg: AppColors.cardSecondary,
          iconColor: AppColors.surface,
          valColor: AppColors.surface,
        };
      case 'primary':
        // Used Credit (Amber Gold - Outstanding)
        return {
          bg: AppColors.card,
          border: AppColors.warningBorder,
          iconBg: AppColors.warningLight,
          iconColor: AppColors.warning,
          valColor: AppColors.warning,
        };
      case 'slate':
      default:
        // Total Patrons (Emerald Growth)
        return {
          bg: AppColors.card,
          border: AppColors.successBorder,
          iconBg: AppColors.successLight,
          iconColor: AppColors.success,
          valColor: AppColors.success,
        };
    }
  };

  const scheme = getColors();

  return (
    <View style={[styles.card, { backgroundColor: scheme.bg, borderColor: scheme.border }]}>
      <View style={styles.topRow}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <View style={[styles.iconWrapper, { backgroundColor: scheme.iconBg }]}>
          <Ionicons name={iconName} size={18} color={scheme.iconColor} />
        </View>
      </View>
      <Text style={[styles.value, { color: scheme.valColor }]} numberOfLines={1}>
        {value}
      </Text>
      {subtitle ? (
        <Text style={styles.subtitle} numberOfLines={1}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 145,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    elevation: 2,
    shadowColor: AppColors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 12,
    fontWeight: '700',
    color: AppColors.mutedSlate,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    flex: 1,
    marginRight: 6,
  },
  iconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  value: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 11,
    color: AppColors.mutedSlate,
    fontWeight: '500',
  },
});
