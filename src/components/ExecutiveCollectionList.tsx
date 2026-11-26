import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Pressable } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import moment from 'moment';
import { AppColors } from '@/constants/colors';
import { ExecutiveCollectionItem } from '@/services/api';

interface ExecutiveCollectionListProps {
  collections: ExecutiveCollectionItem[];
  isLoading: boolean;
  currency?: string;
  fromDate?: string;
  toDate?: string;
  onOpenCalendar?: () => void;
}

export const ExecutiveCollectionList: React.FC<ExecutiveCollectionListProps> = ({
  collections,
  isLoading,
  currency = 'INR',
  fromDate,
  toDate,
  onOpenCalendar,
}) => {
  const formatCurrency = (val: string | number) => {
    const num = typeof val === 'string' ? parseFloat(val) : val;
    return `₹${(num || 0).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const getModeIcon = (mode: string): React.ComponentProps<typeof Ionicons>['name'] => {
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

  if (isLoading && collections.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={AppColors.dominant} />
        <Text style={styles.loadingText}>Fetching collection records...</Text>
      </View>
    );
  }

  if (collections.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="receipt-outline" size={40} color={AppColors.border} />
        <Text style={styles.emptyTitle}>No Collections in Range</Text>
        <Text style={styles.emptySubtitle}>
          There are no recorded collections for {fromDate && toDate ? `${moment(fromDate).format('D MMM')} – ${moment(toDate).format('D MMM YYYY')}` : 'the selected date range'}.
        </Text>
        {onOpenCalendar && (
          <Pressable style={styles.emptyDateBtn} onPress={onOpenCalendar}>
            <Ionicons name="calendar-outline" size={14} color={AppColors.dominant} />
            <Text style={styles.emptyDateBtnText}>Select Different Dates</Text>
          </Pressable>
        )}
      </View>
    );
  }

  return (
    <View style={styles.listContainer}>
      {/* Header: Title on Left, Calendar Icon in Top Right Corner, Selected Date below */}
      {fromDate && toDate && onOpenCalendar && (
        <View style={styles.headerContainer}>
          <View style={styles.headerTopRow}>
            <View style={styles.titleBadgeRow}>
              <View style={styles.iconCircle}>
                <Ionicons name="receipt" size={15} color={AppColors.dominant} />
              </View>
              <Text style={styles.cardTitle}>Collection Records ({collections.length})</Text>
            </View>

            {/* Calendar Icon Button in Top Right Corner */}
            <Pressable
              style={({ pressed }) => [
                styles.calendarIconBtn,
                pressed && styles.calendarIconBtnPressed,
              ]}
              onPress={onOpenCalendar}
              hitSlop={8}>
              <Ionicons name="calendar-outline" size={18} color={AppColors.dominant} />
            </Pressable>
          </View>

          {/* Selected Date Range shown below */}
          <Pressable
            style={({ pressed }) => [
              styles.selectedDateRow,
              pressed && styles.selectedDateRowPressed,
            ]}
            onPress={onOpenCalendar}>
            <Ionicons name="calendar-outline" size={13} color={AppColors.dominant} />
            <Text style={styles.selectedDateText}>
              {fromDate === toDate
                ? moment(fromDate).isSame(moment(), 'day')
                  ? `Today (${moment(fromDate).format('D MMM YYYY')})`
                  : moment(fromDate).format('D MMM YYYY')
                : `${moment(fromDate).format('D MMM YYYY')} – ${moment(toDate).format('D MMM YYYY')}`}
            </Text>
            <Ionicons name="chevron-down" size={12} color={AppColors.dominant} />
          </Pressable>
        </View>
      )}

      {collections.map((item) => (
        <View key={item.collection_id} style={styles.card}>
          {/* Top Row: Patron and Amount */}
          <View style={styles.topRow}>
            <View style={styles.patronInfo}>
              <View style={styles.patronAvatar}>
                <Text style={styles.patronAvatarText}>
                  {item.patron ? item.patron.slice(0, 2).toUpperCase() : 'SE'}
                </Text>
              </View>
              <View>
                <Text style={styles.patronName}>{item.patron || 'Patron'}</Text>
                <Text style={styles.collectionId}>Receipt #{item.collection_id}</Text>
              </View>
            </View>

            <Text style={styles.amountText}>{formatCurrency(item.amount)}</Text>
          </View>

          <View style={styles.divider} />

          {/* Bottom Meta Row */}
          <View style={styles.bottomRow}>
            <View style={styles.modeBadge}>
              <Ionicons
                name={getModeIcon(item.transaction_mode)}
                size={13}
                color={AppColors.dominant}
              />
              <Text style={styles.modeText}>
                {item.transaction_mode ? item.transaction_mode.toUpperCase() : 'CASH'}
              </Text>
            </View>

            <View style={styles.dateRow}>
              <Ionicons name="time-outline" size={13} color={AppColors.mutedSlate} />
              <Text style={styles.dateText}>
                {moment(item.created_at).format('D MMM YYYY, h:mm A')}
              </Text>
            </View>
          </View>

          {/* Note row if present */}
          {item.note ? (
            <View style={styles.noteRow}>
              <Ionicons name="chatbubble-outline" size={12} color={AppColors.mutedSlate} />
              <Text style={styles.noteText} numberOfLines={1}>
                {item.note}
              </Text>
            </View>
          ) : null}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  listContainer: {
    gap: 10,
    marginBottom: 16,
  },
  headerContainer: {
    backgroundColor: AppColors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: AppColors.border,
    padding: 14,
    marginBottom: 4,
    gap: 8,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: AppColors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: AppColors.surface,
  },
  calendarIconBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: AppColors.primaryLight,
    borderWidth: 1,
    borderColor: AppColors.primaryBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarIconBtnPressed: {
    backgroundColor: '#DBEAFE',
    transform: [{ scale: 0.95 }],
  },
  selectedDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: AppColors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: AppColors.primaryBorder,
  },
  selectedDateRowPressed: {
    backgroundColor: '#DBEAFE',
    opacity: 0.85,
  },
  selectedDateText: {
    fontSize: 12,
    fontWeight: '700',
    color: AppColors.dominant,
  },
  card: {
    backgroundColor: AppColors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: AppColors.border,
    padding: 14,
    elevation: 2,
    shadowColor: AppColors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  patronInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  patronAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: AppColors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: AppColors.primaryBorder,
  },
  patronAvatarText: {
    fontSize: 12,
    fontWeight: '800',
    color: AppColors.dominant,
  },
  patronName: {
    fontSize: 14,
    fontWeight: '700',
    color: AppColors.surface,
  },
  collectionId: {
    fontSize: 11,
    color: AppColors.mutedSlate,
    marginTop: 1,
  },
  amountText: {
    fontSize: 15,
    fontWeight: '900',
    color: AppColors.dominant,
  },
  divider: {
    height: 1,
    backgroundColor: AppColors.borderMuted,
    marginVertical: 10,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: AppColors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  modeText: {
    fontSize: 11,
    fontWeight: '800',
    color: AppColors.dominant,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    fontSize: 11,
    fontWeight: '500',
    color: AppColors.mutedSlate,
  },
  noteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: AppColors.cardSecondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 8,
  },
  noteText: {
    fontSize: 11,
    color: AppColors.mutedSlate,
    fontStyle: 'italic',
    flex: 1,
  },
  loadingContainer: {
    paddingVertical: 32,
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 12,
    color: AppColors.mutedSlate,
    fontWeight: '500',
  },
  emptyContainer: {
    paddingVertical: 36,
    alignItems: 'center',
    backgroundColor: AppColors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: AppColors.border,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: AppColors.surface,
    marginTop: 8,
  },
  emptySubtitle: {
    fontSize: 12,
    color: AppColors.mutedSlate,
    textAlign: 'center',
    marginTop: 2,
    marginBottom: 12,
  },
  emptyDateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: AppColors.primaryLight,
    borderWidth: 1,
    borderColor: AppColors.primaryBorder,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
  },
  emptyDateBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: AppColors.dominant,
  },
});
