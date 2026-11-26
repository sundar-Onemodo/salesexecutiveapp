import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import moment from 'moment';
import { AppColors } from '@/constants/colors';
import { ExecutiveCollectionSummaryResponse } from '@/services/api';

interface CollectionSummaryChartProps {
  summary: ExecutiveCollectionSummaryResponse | null;
  fromDate: string;
  toDate: string;
  isLoading: boolean;
  onOpenCalendar: () => void;
}

interface ChartDayItem {
  date: string;       // YYYY-MM-DD
  dayLabel: string;   // '10' or '10 Nov'
  weekDay: string;    // 'Mon', 'Tue'
  amount: number;
  count: number;
}

export const CollectionSummaryChart: React.FC<CollectionSummaryChartProps> = ({
  summary,
  fromDate,
  toDate,
  isLoading,
  onOpenCalendar,
}) => {
  // Generate all dates in range
  const chartDays: ChartDayItem[] = useMemo(() => {
    if (!fromDate || !toDate) return [];

    const start = moment(fromDate, 'YYYY-MM-DD');
    const end = moment(toDate, 'YYYY-MM-DD');

    // Prevent extreme loop if invalid
    if (!start.isValid() || !end.isValid() || end.diff(start, 'days') > 90) {
      return [];
    }

    const totalsMap = new Map<string, { amount: number; count: number }>();
    if (summary?.daily_totals) {
      summary.daily_totals.forEach((item) => {
        totalsMap.set(item.collection_date, {
          amount: parseFloat(item.total_amount) || 0,
          count: parseInt(String(item.collection_count), 10) || 0,
        });
      });
    }

    const items: ChartDayItem[] = [];
    const curr = start.clone();
    while (curr.isSameOrBefore(end, 'day')) {
      const dateKey = curr.format('YYYY-MM-DD');
      const found = totalsMap.get(dateKey);

      items.push({
        date: dateKey,
        dayLabel: curr.format('D MMM'),
        weekDay: curr.format('dd'),
        amount: found ? found.amount : 0,
        count: found ? found.count : 0,
      });

      curr.add(1, 'day');
    }

    return items;
  }, [fromDate, toDate, summary]);

  // Selected bar for detailed popover
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const selectedItem = useMemo(() => {
    if (!chartDays.length) return null;
    if (selectedDate) {
      const found = chartDays.find((d) => d.date === selectedDate);
      if (found) return found;
    }
    // Default to the day with max amount or the latest day
    const dayWithMax = [...chartDays].sort((a, b) => b.amount - a.amount)[0];
    return dayWithMax && dayWithMax.amount > 0 ? dayWithMax : chartDays[chartDays.length - 1];
  }, [chartDays, selectedDate]);

  // Maximum value for scaling bar heights
  const maxAmount = useMemo(() => {
    const highest = Math.max(...chartDays.map((d) => d.amount), 0);
    return highest > 0 ? highest * 1.15 : 1000;
  }, [chartDays]);

  const formatCurrency = (val: number) => {
    return `₹${val.toLocaleString('en-IN', {
      maximumFractionDigits: 0,
    })}`;
  };

  const formatYAxis = (val: number) => {
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
    if (val >= 1000) return `₹${(val / 1000).toFixed(0)}k`;
    return `₹${Math.round(val)}`;
  };

  const totalAmountNum = parseFloat(summary?.total_amount || '0') || 0;
  const totalCount = summary?.collection_count || 0;

  return (
    <View style={styles.container}>
      {/* Chart Card Header with Calendar Icon in Top Right Corner & Selected Date Below */}
      <View style={styles.headerContainer}>
        <View style={styles.headerTopRow}>
          <View style={styles.titleBadgeRow}>
            <View style={styles.iconCircle}>
              <Ionicons name="bar-chart" size={16} color={AppColors.dominant} />
            </View>
            <View style={styles.titleTextGroup}>
              <Text style={styles.cardTitle}>Daily Collection Summary</Text>
            </View>
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

      {/* Summary KPI Strip */}
      <View style={styles.kpiRow}>
        <View style={styles.kpiBlock}>
          <Text style={styles.kpiLabel}>TOTAL COLLECTED</Text>
          <Text style={styles.kpiValueMain}>{formatCurrency(totalAmountNum)}</Text>
        </View>
        <View style={styles.kpiDivider} />
        <View style={styles.kpiBlock}>
          <Text style={styles.kpiLabel}>COLLECTIONS</Text>
          <Text style={styles.kpiValueSecondary}>{totalCount} Completed</Text>
        </View>
        <View style={styles.kpiDivider} />
        <View style={styles.kpiBlock}>
          <Text style={styles.kpiLabel}>DAYS RANGE</Text>
          <Text style={styles.kpiValueSecondary}>{chartDays.length} Days</Text>
        </View>
      </View>

      {/* Selected Day Inspect Bubble */}
      {selectedItem ? (
        <View style={styles.activeDayBanner}>
          <View style={styles.activeDayIcon}>
            <Ionicons name="today-outline" size={16} color={AppColors.dominant} />
          </View>
          <View style={styles.activeDayInfo}>
            <Text style={styles.activeDayDate}>
              {moment(selectedItem.date).format('dddd, D MMMM YYYY')}
            </Text>
            <Text style={styles.activeDayMeta}>
              {selectedItem.count > 0
                ? `${selectedItem.count} collection${selectedItem.count > 1 ? 's' : ''} recorded`
                : 'No collections on this date'}
            </Text>
          </View>
          <Text style={styles.activeDayAmount}>
            {formatCurrency(selectedItem.amount)}
          </Text>
        </View>
      ) : null}

      {/* Chart Canvas */}
      {isLoading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="small" color={AppColors.dominant} />
          <Text style={styles.loadingText}>Loading chart summary...</Text>
        </View>
      ) : chartDays.length > 0 ? (
        <View style={styles.chartArea}>
          {/* Y-Axis Guide Labels */}
          <View style={styles.yAxisCol}>
            <Text style={styles.yAxisText}>{formatYAxis(maxAmount)}</Text>
            <Text style={styles.yAxisText}>{formatYAxis(maxAmount / 2)}</Text>
            <Text style={styles.yAxisText}>₹0</Text>
          </View>

          {/* Bars Horizontal Scroll Container */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.barsScrollContent}>
            {/* Horizontal Grid Lines */}
            <View style={styles.gridLineTop} />
            <View style={styles.gridLineMid} />
            <View style={styles.gridLineBase} />

            {chartDays.map((item) => {
              const hasAmount = item.amount > 0;
              const isSelected = selectedItem?.date === item.date;

              // Only scale height if there is a value; 0 value stays flat at the baseline
              const heightPercent =
                hasAmount && maxAmount > 0
                  ? Math.min(100, Math.max(12, Math.round((item.amount / maxAmount) * 100)))
                  : 0;

              return (
                <Pressable
                  key={item.date}
                  style={styles.barColumn}
                  onPress={() => setSelectedDate(item.date)}>
                  {/* Amount Badge on Top of Bar - Only show when day has value */}
                  <View style={styles.barTopAmountWrapper}>
                    {hasAmount ? (
                      <Text
                        style={[
                          styles.barTopAmountText,
                          isSelected && styles.barTopAmountTextSelected,
                        ]}>
                        {item.amount >= 1000
                          ? `${(item.amount / 1000).toFixed(0)}k`
                          : Math.round(item.amount)}
                      </Text>
                    ) : null}
                  </View>

                  {/* Bar Graphic Slot: Transparent background so zero values have NO line height */}
                  <View style={styles.barTrack}>
                    {hasAmount ? (
                      <View
                        style={[
                          styles.barFill,
                          {
                            height: `${heightPercent}%`,
                            backgroundColor: isSelected
                              ? AppColors.success
                              : AppColors.dominant,
                          },
                        ]}
                      />
                    ) : (
                      /* Zero value stays flat at the baseline with a subtle 2px marker */
                      <View
                        style={[
                          styles.barZeroLine,
                          isSelected && styles.barZeroLineSelected,
                        ]}
                      />
                    )}
                  </View>

                  {/* Day Label at Bottom */}
                  <View
                    style={[
                      styles.dayLabelBox,
                      isSelected && styles.dayLabelBoxSelected,
                    ]}>
                    <Text
                      style={[
                        styles.dayLabelText,
                        isSelected && styles.dayLabelTextSelected,
                      ]}>
                      {moment(item.date).format('D')}
                    </Text>
                    <Text
                      style={[
                        styles.weekDayText,
                        isSelected && styles.weekDayTextSelected,
                      ]}>
                      {item.weekDay}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      ) : (
        <View style={styles.emptyChart}>
          <Text style={styles.emptyChartText}>No collection data in selected range</Text>
        </View>
      )}

      {/* Chart Legend / Hint */}
      <View style={styles.chartFooter}>
        <View style={styles.legendRow}>
          <View style={[styles.legendDot, { backgroundColor: AppColors.dominant }]} />
          <Text style={styles.legendText}>Daily Volume</Text>
          <View style={[styles.legendDot, { backgroundColor: AppColors.success, marginLeft: 12 }]} />
          <Text style={styles.legendText}>Selected Date</Text>
        </View>
        <Text style={styles.hintText}>Tap a day column to view details</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: AppColors.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: AppColors.border,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: AppColors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  headerContainer: {
    marginBottom: 14,
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
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: AppColors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleTextGroup: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: AppColors.surface,
  },
  calendarIconBtn: {
    width: 36,
    height: 36,
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
  kpiRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: AppColors.cardSecondary,
    borderWidth: 1,
    borderColor: AppColors.border,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 12,
  },
  kpiBlock: {
    flex: 1,
    alignItems: 'center',
  },
  kpiLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: AppColors.mutedSlate,
    letterSpacing: 0.5,
  },
  kpiValueMain: {
    fontSize: 16,
    fontWeight: '900',
    color: AppColors.dominant,
    marginTop: 2,
  },
  kpiValueSecondary: {
    fontSize: 13,
    fontWeight: '700',
    color: AppColors.surface,
    marginTop: 2,
  },
  kpiDivider: {
    width: 1,
    height: 28,
    backgroundColor: AppColors.border,
  },
  activeDayBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.primaryLight,
    borderWidth: 1,
    borderColor: AppColors.primaryBorder,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 14,
    gap: 10,
  },
  activeDayIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: AppColors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeDayInfo: {
    flex: 1,
  },
  activeDayDate: {
    fontSize: 12,
    fontWeight: '800',
    color: AppColors.surface,
  },
  activeDayMeta: {
    fontSize: 11,
    color: AppColors.mutedSlate,
    marginTop: 1,
  },
  activeDayAmount: {
    fontSize: 15,
    fontWeight: '900',
    color: AppColors.dominant,
  },
  chartArea: {
    flexDirection: 'row',
    height: 190,
    marginTop: 4,
    marginBottom: 10,
  },
  yAxisCol: {
    width: 44,
    height: 120,
    marginTop: 18,
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 2,
  },
  yAxisText: {
    fontSize: 9,
    fontWeight: '700',
    color: AppColors.mutedSlate,
  },
  barsScrollContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    minWidth: '85%',
    height: 190,
    paddingRight: 16,
    position: 'relative',
  },
  gridLineTop: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 20,
    height: 1,
    backgroundColor: AppColors.borderMuted,
  },
  gridLineMid: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 80,
    height: 1,
    backgroundColor: AppColors.borderMuted,
  },
  gridLineBase: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 138,
    height: 1.5,
    backgroundColor: AppColors.border,
  },
  barColumn: {
    width: 42,
    alignItems: 'center',
    marginHorizontal: 3,
  },
  barTopAmountWrapper: {
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  barTopAmountText: {
    fontSize: 9,
    fontWeight: '700',
    color: AppColors.mutedSlate,
  },
  barTopAmountTextSelected: {
    color: AppColors.success,
    fontWeight: '800',
  },
  barTrack: {
    height: 120,
    width: 22,
    backgroundColor: 'transparent',
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
  barZeroLine: {
    width: '100%',
    height: 2,
    backgroundColor: AppColors.border,
    borderRadius: 1,
  },
  barZeroLineSelected: {
    backgroundColor: AppColors.dominant,
    height: 3,
  },
  dayLabelBox: {
    alignItems: 'center',
    marginTop: 6,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 6,
  },
  dayLabelBoxSelected: {
    backgroundColor: AppColors.primaryLight,
  },
  dayLabelText: {
    fontSize: 11,
    fontWeight: '800',
    color: AppColors.textPrimary,
  },
  dayLabelTextSelected: {
    color: AppColors.dominant,
  },
  weekDayText: {
    fontSize: 9,
    fontWeight: '600',
    color: AppColors.mutedSlate,
    marginTop: 1,
  },
  weekDayTextSelected: {
    color: AppColors.dominant,
    fontWeight: '700',
  },
  loadingBox: {
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 12,
    color: AppColors.mutedSlate,
    fontWeight: '600',
  },
  emptyChart: {
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyChartText: {
    fontSize: 13,
    color: AppColors.mutedSlate,
    fontWeight: '600',
  },
  chartFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: AppColors.borderMuted,
    marginTop: 4,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  legendText: {
    fontSize: 10,
    fontWeight: '700',
    color: AppColors.mutedSlate,
  },
  hintText: {
    fontSize: 10,
    color: AppColors.mutedSlate,
    fontStyle: 'italic',
  },
});
