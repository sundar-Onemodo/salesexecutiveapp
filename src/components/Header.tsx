import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppColors } from '@/constants/colors';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  onOpenMenu: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title = 'Onemodo Sales',
  subtitle = 'Executive Dashboard',
  onOpenMenu,
  onRefresh,
  isRefreshing = false,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.headerContainer, { paddingTop: Math.max(insets.top, 16) }]}>
      <View style={styles.contentRow}>
        {/* Menu Trigger */}
        <Pressable
          style={({ pressed }) => [styles.iconButton, pressed && styles.iconButtonPressed]}
          onPress={onOpenMenu}
          accessibilityLabel="Open side menu">
          <Ionicons name="menu" size={24} color={AppColors.primaryDark} />
        </Pressable>

        {/* Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        </View>

        {/* Refresh / Actions */}
        {onRefresh ? (
          <Pressable
            style={({ pressed }) => [styles.iconButton, pressed && styles.iconButtonPressed]}
            onPress={onRefresh}
            disabled={isRefreshing}
            accessibilityLabel="Refresh data">
            <Ionicons
              name={isRefreshing ? 'sync' : 'refresh'}
              size={20}
              color={AppColors.primary}
            />
          </Pressable>
        ) : (
          <View style={{ width: 40 }} />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: AppColors.card,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.border,
    paddingHorizontal: 16,
    paddingBottom: 12,
    elevation: 3,
    shadowColor: AppColors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#FAF5F5',
    borderWidth: 1,
    borderColor: '#EFE6E6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconButtonPressed: {
    backgroundColor: '#F5E8E8',
    transform: [{ scale: 0.96 }],
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 10,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    color: AppColors.primaryDark,
    letterSpacing: 0.2,
  },
  subtitle: {
    fontSize: 11,
    color: AppColors.mutedSlate,
    fontWeight: '600',
    marginTop: 1,
  },
});
