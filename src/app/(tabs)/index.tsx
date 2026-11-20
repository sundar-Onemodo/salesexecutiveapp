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
import { AppColors } from '@/constants/colors';
import { Header } from '@/components/Header';
import { SideMenu } from '@/components/SideMenu';
import { StatCard } from '@/components/StatCard';
import { PatronCard } from '@/components/PatronCard';
import { CollectionModal } from '@/components/CollectionModal';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchPatronsThunk,
  loadCollectionHistoryThunk,
} from '@/store/slices/patronsSlice';
import { Patron } from '@/services/api';

export default function DashboardScreen() {
  const dispatch = useAppDispatch();
  const { patrons, currency, isLoading, error, recentCollections } = useAppSelector(
    (state) => state.patrons
  );
  const { mobile } = useAppSelector((state) => state.auth);

  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  const [selectedPatron, setSelectedPatron] = useState<Patron | null>(null);
  const [isCollectionModalOpen, setIsCollectionModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    dispatch(fetchPatronsThunk());
    dispatch(loadCollectionHistoryThunk());
  }, [dispatch]);

  const onRefresh = async () => {
    setIsRefreshing(true);
    await dispatch(fetchPatronsThunk());
    setIsRefreshing(false);
  };

  const handleOpenCollection = (patron: Patron) => {
    setSelectedPatron(patron);
    setIsCollectionModalOpen(true);
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

  // Aggregate Metrics
  const metrics = useMemo(() => {
    let totalLimit = 0;
    let totalUsed = 0;
    let totalAvailable = 0;

    patrons.forEach((p) => {
      totalLimit += parseFloat(p.credit_limit || '0');
      totalUsed += parseFloat(p.used_credit || '0');
      totalAvailable += parseFloat(p.available_credit || '0');
    });

    const formatCurrency = (val: number) => {
      return `₹${val.toLocaleString('en-IN', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })}`;
    };

    return {
      totalPatrons: patrons.length.toString(),
      totalLimit: formatCurrency(totalLimit),
      totalUsed: formatCurrency(totalUsed),
      totalAvailable: formatCurrency(totalAvailable),
    };
  }, [patrons]);

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
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={AppColors.primary}
            colors={[AppColors.primary]}
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
            <Ionicons name="bar-chart" size={26} color={AppColors.primary} />
          </View>
        </View>

        {/* Financial Metrics Summary Grid */}
        <View style={styles.statsContainer}>
          <View style={styles.statRow}>
            <StatCard
              title="Available Credit"
              value={metrics.totalAvailable}
              subtitle="All patrons pool"
              iconName="wallet-outline"
              variant="dark"
            />
            <StatCard
              title="Credit Limit"
              value={metrics.totalLimit}
              subtitle="Total authorized"
              iconName="shield-checkmark-outline"
              variant="light"
            />
          </View>
          <View style={styles.statRow}>
            <StatCard
              title="Used Credit"
              value={metrics.totalUsed}
              subtitle="Outstanding balance"
              iconName="trending-up-outline"
              variant="primary"
            />
            <StatCard
              title="Total Patrons"
              value={metrics.totalPatrons}
              subtitle="Assigned accounts"
              iconName="people-outline"
              variant="slate"
            />
          </View>
        </View>

        {/* Quick Action Button */}
        {patrons.length > 0 ? (
          <Pressable
            style={({ pressed }) => [
              styles.quickActionButton,
              pressed && styles.quickActionButtonPressed,
            ]}
            onPress={() => handleOpenCollection(patrons[0])}>
            <Ionicons name="add-circle-outline" size={20} color={AppColors.white} />
            <Text style={styles.quickActionText}>Quick Record Collection</Text>
          </Pressable>
        ) : null}

        {/* Patrons Directory Header */}
        <View style={styles.sectionHeaderRow}>
          <View>
            <Text style={styles.sectionTitle}>Patrons Directory</Text>
            <Text style={styles.sectionSubtitle}>
              Manage credits and record collections
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
            <ActivityIndicator size="large" color={AppColors.primary} />
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

        {/* Recent Collections Feed */}
        {recentCollections.length > 0 ? (
          <View style={styles.recentSection}>
            <View style={styles.recentHeader}>
              <Ionicons name="time-outline" size={18} color={AppColors.primaryDark} />
              <Text style={styles.recentTitle}>Recent Collections</Text>
            </View>
            {recentCollections.slice(0, 3).map((item, index) => (
              <View key={item.collection_id || index} style={styles.recentCard}>
                <View style={styles.recentIcon}>
                  <Ionicons name="checkmark" size={16} color={AppColors.success} />
                </View>
                <View style={styles.recentInfo}>
                  <Text style={styles.recentName}>
                    {item.patron_name ? `${item.patron_name} ` : ''}(#{item.patron_id})
                  </Text>
                  <Text style={styles.recentMeta}>
                    Mode: {item.transaction_mode} • Status: {item.status || 'Pending'}
                  </Text>
                </View>
                <Text style={styles.recentAmount}>₹{item.amount}</Text>
              </View>
            ))}
          </View>
        ) : null}
      </ScrollView>

      {/* Collection Modal with Dropdown */}
      <CollectionModal
        visible={isCollectionModalOpen}
        patron={selectedPatron}
        onClose={() => setIsCollectionModalOpen(false)}
        onSuccess={() => {
          // Re-fetch to sync credits with server
          dispatch(fetchPatronsThunk());
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
    paddingBottom: 32,
  },
  welcomeBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: AppColors.cardSecondary,
    borderWidth: 1,
    borderColor: AppColors.primaryLight,
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
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
    color: AppColors.primaryDark,
    marginVertical: 2,
  },
  groupPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FDECEC',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 4,
  },
  groupPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: AppColors.primaryDark,
  },
  welcomeMobile: {
    fontSize: 12,
    fontWeight: '600',
    color: AppColors.mutedSlate,
    marginTop: 4,
  },
  welcomeBadgeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FCECEC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    gap: 12,
    marginBottom: 16,
  },
  statRow: {
    flexDirection: 'row',
    gap: 12,
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: AppColors.primary,
    height: 48,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 3,
    shadowColor: AppColors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
  },
  quickActionButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  quickActionText: {
    color: AppColors.white,
    fontSize: 15,
    fontWeight: '700',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: AppColors.primaryDark,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: AppColors.mutedSlate,
    marginTop: 1,
  },
  countBadge: {
    backgroundColor: AppColors.cardSecondary,
    borderWidth: 1,
    borderColor: AppColors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  countBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: AppColors.primaryDark,
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
  recentSection: {
    marginTop: 8,
    backgroundColor: AppColors.card,
    borderWidth: 1,
    borderColor: AppColors.border,
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  recentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  recentTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: AppColors.primaryDark,
  },
  recentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF7F7',
    padding: 10,
    borderRadius: 10,
    gap: 10,
  },
  recentIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: AppColors.successLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recentInfo: {
    flex: 1,
  },
  recentName: {
    fontSize: 13,
    fontWeight: '700',
    color: AppColors.textPrimary,
  },
  recentMeta: {
    fontSize: 11,
    color: AppColors.mutedSlate,
    marginTop: 2,
  },
  recentAmount: {
    fontSize: 14,
    fontWeight: '800',
    color: AppColors.primaryDark,
  },
});
