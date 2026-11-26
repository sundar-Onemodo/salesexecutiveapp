import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  RefreshControl,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import moment from 'moment';
import { AppColors } from '@/constants/colors';
import { Header } from '@/components/Header';
import { SideMenu } from '@/components/SideMenu';
import { PatronCard } from '@/components/PatronCard';
import { CollectionModal } from '@/components/CollectionModal';
import { DateRangeModal } from '@/components/DateRangeModal';
import { CollectionSummaryChart } from '@/components/CollectionSummaryChart';
import { ExecutiveCollectionList } from '@/components/ExecutiveCollectionList';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchPatronsThunk,
  fetchExecutiveCollectionsThunk,
  fetchCollectionSummaryThunk,
} from '@/store/slices/patronsSlice';
import { Patron } from '@/services/api';

type CollectionViewTab = 'chart' | 'list';

export default function DashboardScreen() {
  const dispatch = useAppDispatch();
  const {
    patrons,
    currency,
    isLoading,
    error,
    executiveCollections,
    isLoadingCollections,
    collectionSummary,
    isLoadingSummary,
  } = useAppSelector((state) => state.patrons);
  const { mobile } = useAppSelector((state) => state.auth);

  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  const [selectedPatron, setSelectedPatron] = useState<Patron | null>(null);
  const [isCollectionModalOpen, setIsCollectionModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Date Range State for Executive Collections & Summary APIs
  // Defaults to current date (today) on first entry
  const [fromDate, setFromDate] = useState(() => moment().format('YYYY-MM-DD'));
  const [toDate, setToDate] = useState(() => moment().format('YYYY-MM-DD'));
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [collectionTab, setCollectionTab] = useState<CollectionViewTab>('chart');

  useEffect(() => {
    dispatch(fetchPatronsThunk());
    dispatch(fetchExecutiveCollectionsThunk({ fromDate, toDate }));
    dispatch(fetchCollectionSummaryThunk({ fromDate, toDate }));
  }, [dispatch, fromDate, toDate]);

  const onRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([
      dispatch(fetchPatronsThunk()),
      dispatch(fetchExecutiveCollectionsThunk({ fromDate, toDate })),
      dispatch(fetchCollectionSummaryThunk({ fromDate, toDate })),
    ]);
    setIsRefreshing(false);
  };

  const handleOpenCollection = (patron: Patron) => {
    setSelectedPatron(patron);
    setIsCollectionModalOpen(true);
  };

  const handleDateRangeApply = (newFrom: string, newTo: string) => {
    setFromDate(newFrom);
    setToDate(newTo);
  };

  // Filtered Patrons
  const filteredPatrons = useMemo(() => {
    if (!searchQuery.trim()) return patrons;
    const q = searchQuery.toLowerCase().trim();
    return patrons.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q)
    );
  }, [patrons, searchQuery]);

  return (
    <View style={styles.screen}>
      {/* Top App Header */}
      <Header
        title="Onemodo Sales"
        subtitle="Executive Dashboard"
        onOpenMenu={() => setIsSideMenuOpen(true)}
        onRefresh={onRefresh}
        isRefreshing={isRefreshing}
      />

      {/* Side Menu with REQUIRED Bottom Logout */}
      <SideMenu
        visible={isSideMenuOpen}
        onClose={() => setIsSideMenuOpen(false)}
        activeRoute="dashboard"
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={AppColors.dominant}
            colors={[AppColors.dominant]}
          />
        }>
        {/* Welcome Executive Card */}
        <View style={styles.welcomeBanner}>
          <View style={styles.welcomeInfo}>
            <Text style={styles.welcomeGreeting}>Welcome Back,</Text>
            <Text style={styles.welcomeName}>Sales Executive</Text>
            {mobile ? (
              <Text style={styles.welcomeMobile}>+91 {mobile}</Text>
            ) : null}
          </View>
          <View style={styles.welcomeBadgeIcon}>
            <Ionicons name="bar-chart" size={24} color={AppColors.dominant} />
          </View>
        </View>

        {/* ==================================================== */}
        {/* COLLECTIONS & SUMMARY APIS SECTION (Replacing Recent) */}
        {/* ==================================================== */}
        <View style={styles.collectionsSection}>
          {/* Segment Tabs: Chart vs List */}
          <View style={styles.tabPillsRow}>
            <Pressable
              style={[
                styles.tabPill,
                collectionTab === 'chart' && styles.tabPillActive,
              ]}
              onPress={() => setCollectionTab('chart')}>
              <Ionicons
                name="bar-chart-outline"
                size={14}
                color={
                  collectionTab === 'chart'
                    ? AppColors.white
                    : AppColors.mutedSlate
                }
              />
              <Text
                style={[
                  styles.tabPillText,
                  collectionTab === 'chart' && styles.tabPillTextActive,
                ]}>
                Daily Chart
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.tabPill,
                collectionTab === 'list' && styles.tabPillActive,
              ]}
              onPress={() => setCollectionTab('list')}>
              <Ionicons
                name="receipt-outline"
                size={14}
                color={
                  collectionTab === 'list'
                    ? AppColors.white
                    : AppColors.mutedSlate
                }
              />
              <Text
                style={[
                  styles.tabPillText,
                  collectionTab === 'list' && styles.tabPillTextActive,
                ]}>
                Collections List ({executiveCollections.length})
              </Text>
            </Pressable>
          </View>

          {/* TAB 1: Collections Summary Chart */}
          {collectionTab === 'chart' ? (
            <CollectionSummaryChart
              summary={collectionSummary}
              fromDate={fromDate}
              toDate={toDate}
              isLoading={isLoadingSummary}
              onOpenCalendar={() => setIsCalendarOpen(true)}
            />
          ) : (
            /* TAB 2: Collections List Type */
            <ExecutiveCollectionList
              collections={executiveCollections}
              isLoading={isLoadingCollections}
              currency={currency}
              fromDate={fromDate}
              toDate={toDate}
              onOpenCalendar={() => setIsCalendarOpen(true)}
            />
          )}
        </View>

        {/* ==================================================== */}
        {/* PATRONS DIRECTORY SECTION                            */}
        {/* ==================================================== */}
        <View style={styles.sectionHeaderRow}>
          <View>
            <Text style={styles.sectionTitle}>Patrons Directory</Text>
            <Text style={styles.sectionSubtitle}>
              Tap any account to record collection
            </Text>
          </View>
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>{filteredPatrons.length}</Text>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={AppColors.mutedSlate} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by patron name or ID..."
            placeholderTextColor={AppColors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <Pressable onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={AppColors.mutedSlate} />
            </Pressable>
          ) : null}
        </View>

        {/* Error Notification */}
        {error ? (
          <View style={styles.errorCard}>
            <Ionicons name="alert-circle" size={18} color={AppColors.error} />
            <Text style={styles.errorCardText}>{error}</Text>
            <Pressable style={styles.retryButton} onPress={onRefresh}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </Pressable>
          </View>
        ) : null}

        {/* Loading Spinner */}
        {isLoading && !isRefreshing && patrons.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={AppColors.dominant} />
            <Text style={styles.loadingText}>Fetching Patrons Data...</Text>
          </View>
        ) : null}

        {/* Patrons List */}
        {filteredPatrons.map((patron) => (
          <PatronCard
            key={patron.id}
            patron={patron}
            currency={currency}
            onCollect={handleOpenCollection}
          />
        ))}

        {/* Empty State */}
        {!isLoading && filteredPatrons.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={44} color={AppColors.border} />
            <Text style={styles.emptyTitle}>No Patrons Found</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery
                ? `No patron matched "${searchQuery}"`
                : 'No patrons assigned currently.'}
            </Text>
          </View>
        ) : null}
      </ScrollView>

      {/* Date Range Modal with react-native-calendar-picker */}
      <DateRangeModal
        visible={isCalendarOpen}
        initialFromDate={fromDate}
        initialToDate={toDate}
        onClose={() => setIsCalendarOpen(false)}
        onApply={handleDateRangeApply}
      />

      {/* Collection Modal with Dropdown */}
      <CollectionModal
        visible={isCollectionModalOpen}
        patron={selectedPatron}
        onClose={() => setIsCollectionModalOpen(false)}
        onSuccess={() => {
          // Sync patrons, executive collections, and summary
          dispatch(fetchPatronsThunk());
          dispatch(fetchExecutiveCollectionsThunk({ fromDate, toDate }));
          dispatch(fetchCollectionSummaryThunk({ fromDate, toDate }));
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 36,
  },
  welcomeBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: AppColors.card,
    borderWidth: 1,
    borderColor: AppColors.border,
    padding: 16,
    borderRadius: 16,
    marginBottom: 14,
    shadowColor: AppColors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
  },
  welcomeInfo: {
    flex: 1,
  },
  welcomeGreeting: {
    fontSize: 13,
    fontWeight: '600',
    color: AppColors.mutedSlate,
  },
  welcomeName: {
    fontSize: 20,
    fontWeight: '800',
    color: AppColors.surface,
    marginVertical: 2,
  },
  welcomeMobile: {
    fontSize: 12,
    fontWeight: '600',
    color: AppColors.dominant,
    marginTop: 4,
  },
  welcomeBadgeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: AppColors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  /* Collections & Analytics Section */
  collectionsSection: {
    marginTop: 4,
    marginBottom: 20,
  },
  tabPillsRow: {
    flexDirection: 'row',
    backgroundColor: AppColors.cardSecondary,
    borderWidth: 1,
    borderColor: AppColors.border,
    padding: 3,
    borderRadius: 12,
    marginBottom: 12,
    gap: 4,
  },
  tabPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 9,
  },
  tabPillActive: {
    backgroundColor: AppColors.dominant,
    elevation: 2,
  },
  tabPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: AppColors.mutedSlate,
  },
  tabPillTextActive: {
    color: AppColors.white,
  },
  /* Patrons Directory Header */
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: AppColors.surface,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: AppColors.mutedSlate,
    marginTop: 1,
  },
  countBadge: {
    backgroundColor: AppColors.primaryLight,
    borderWidth: 1,
    borderColor: AppColors.primaryBorder,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  countBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: AppColors.dominant,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.card,
    borderWidth: 1,
    borderColor: AppColors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 46,
    marginBottom: 16,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: AppColors.textPrimary,
  },
  errorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.errorLight,
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },
  errorCardText: {
    flex: 1,
    fontSize: 13,
    color: AppColors.error,
    fontWeight: '600',
  },
  retryButton: {
    backgroundColor: AppColors.error,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  retryButtonText: {
    color: AppColors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: AppColors.mutedSlate,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 36,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: AppColors.textPrimary,
    marginTop: 10,
  },
  emptySubtitle: {
    fontSize: 13,
    color: AppColors.mutedSlate,
    marginTop: 4,
  },
});
