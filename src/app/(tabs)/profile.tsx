import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  Platform,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import * as Updates from 'expo-updates';
import { AppColors } from '@/constants/colors';
import { Header } from '@/components/Header';
import { SideMenu } from '@/components/SideMenu';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logoutThunk } from '@/store/slices/authSlice';

export default function ProfileScreen() {
  const dispatch = useAppDispatch();
  const { mobile } = useAppSelector((state) => state.auth);
  const { patrons, recentCollections } = useAppSelector((state) => state.patrons);

  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);

  const handleCheckUpdate = async () => {
    if (__DEV__) {
      Alert.alert(
        'Development Mode',
        'OTA updates are only active in preview or production standalone builds.'
      );
      return;
    }

    setIsCheckingUpdate(true);
    try {
      const update = await Updates.checkForUpdateAsync();
      if (update.isAvailable) {
        await Updates.fetchUpdateAsync();
        Alert.alert(
          'Update Downloaded',
          'A new update is ready. Restart the app now to apply changes?',
          [
            { text: 'Later', style: 'cancel' },
            {
              text: 'Restart',
              onPress: async () => {
                await Updates.reloadAsync();
              },
            },
          ]
        );
      } else {
        Alert.alert('Up to Date', 'You are on the latest version of Onemodo Patrons.');
      }
    } catch (err: any) {
      Alert.alert('Update Check', err?.message || 'Unable to check for updates right now.');
    } finally {
      setIsCheckingUpdate(false);
    }
  };

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Are you sure you want to log out?');
      if (confirmed) {
        dispatch(logoutThunk());
        router.replace('/login');
      }
      return;
    }

    Alert.alert(
      'Log Out',
      'Are you sure you want to log out from Onemodo Sales Executive?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: () => {
            dispatch(logoutThunk());
            router.replace('/login');
          },
        },
      ]
    );
  };

  return (
    <View style={styles.screen}>
      <Header
        title="Executive Profile"
        subtitle="Account & Settings"
        onOpenMenu={() => setIsSideMenuOpen(true)}
      />

      <SideMenu
        visible={isSideMenuOpen}
        onClose={() => setIsSideMenuOpen(false)}
        activeRoute="profile"
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Executive Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarLargeText}>SE</Text>
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark" size={12} color={AppColors.white} />
            </View>
          </View>
          <Text style={styles.profileTitle}>Sales Executive</Text>
          <Text style={styles.profileSubtitle}>
            {mobile ? `+91 ${mobile}` : 'Verified Executive'}
          </Text>
        </View>

        {/* Quick Stats Banner */}
        <View style={styles.statsBanner}>
          <View style={styles.statCol}>
            <Text style={styles.statNum}>{patrons.length}</Text>
            <Text style={styles.statLabel}>Patrons</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCol}>
            <Text style={styles.statNum}>{recentCollections.length}</Text>
            <Text style={styles.statLabel}>Collections</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCol}>
            <Text style={styles.statNumActive}>Active</Text>
            <Text style={styles.statLabel}>Status</Text>
          </View>
        </View>

        {/* Account Details Section */}
        <View style={styles.cardSection}>
          <Text style={styles.sectionHeading}>ACCOUNT DETAILS</Text>

          <View style={styles.infoRow}>
            <View style={styles.infoIconBox}>
              <Ionicons name="person-outline" size={18} color={AppColors.dominant} />
            </View>
            <View style={styles.infoTexts}>
              <Text style={styles.infoLabel}>Role</Text>
              <Text style={styles.infoValue}>Sales Executive</Text>
            </View>
          </View>

          <View style={styles.rowDivider} />

          <View style={styles.infoRow}>
            <View style={styles.infoIconBox}>
              <Ionicons name="call-outline" size={18} color={AppColors.dominant} />
            </View>
            <View style={styles.infoTexts}>
              <Text style={styles.infoLabel}>Registered Mobile</Text>
              <Text style={styles.infoValue}>
                {mobile ? `+91 ${mobile}` : 'Registered Mobile'}
              </Text>
            </View>
          </View>

          <View style={styles.rowDivider} />

          <View style={styles.infoRow}>
            <View style={styles.infoIconBox}>
              <Ionicons name="shield-checkmark-outline" size={18} color={AppColors.surface} />
            </View>
            <View style={styles.infoTexts}>
              <Text style={styles.infoLabel}>Account Status</Text>
              <Text style={styles.infoValue}>Verified & Active</Text>
            </View>
          </View>
        </View>

        {/* App Preferences */}
        <View style={styles.cardSection}>
          <Text style={styles.sectionHeading}>APP PREFERENCES</Text>

          <View style={styles.infoRow}>
            <View style={styles.infoIconBox}>
              <Ionicons name="sunny-outline" size={18} color={AppColors.surface} />
            </View>
            <View style={styles.infoTexts}>
              <Text style={styles.infoLabel}>Theme Appearance</Text>
              <Text style={styles.infoValue}>Light Mode (System Enforced)</Text>
            </View>
          </View>

          <View style={styles.rowDivider} />

          <View style={styles.infoRow}>
            <View style={styles.infoIconBox}>
              <Ionicons name="information-circle-outline" size={18} color={AppColors.dominant} />
            </View>
            <View style={styles.infoTexts}>
              <Text style={styles.infoLabel}>Application Version</Text>
              <Text style={styles.infoValue}>v1.0.0</Text>
            </View>
          </View>

          <View style={styles.rowDivider} />

          {/* EAS Update Check */}
          <Pressable
            style={({ pressed }) => [
              styles.infoRow,
              pressed && styles.infoRowPressed,
            ]}
            onPress={handleCheckUpdate}
            disabled={isCheckingUpdate}>
            <View style={styles.infoIconBox}>
              <Ionicons name="cloud-download-outline" size={18} color={AppColors.dominant} />
            </View>
            <View style={styles.infoTexts}>
              <Text style={styles.infoLabel}>EAS Update</Text>
              <Text style={styles.infoValue}>
                {isCheckingUpdate ? 'Checking for updates...' : 'Check for Updates'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={AppColors.mutedSlate} />
          </Pressable>
        </View>

        {/* Prominent Logout Button */}
        <Pressable
          style={({ pressed }) => [styles.logoutButton, pressed && styles.logoutButtonPressed]}
          onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={AppColors.white} />
          <Text style={styles.logoutButtonText}>Log Out from Account</Text>
        </Pressable>

        <Text style={styles.footerNote}>
          Onemodo Sales Executive Mobile • Build v1.0.0
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  profileCard: {
    alignItems: 'center',
    backgroundColor: AppColors.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: AppColors.border,
    padding: 24,
    marginBottom: 16,
    elevation: 3,
    shadowColor: AppColors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  avatarLarge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: AppColors.iceBlue,
    borderWidth: 2,
    borderColor: AppColors.dominant,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    position: 'relative',
  },
  avatarLargeText: {
    fontSize: 24,
    fontWeight: '900',
    color: AppColors.dominant,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: AppColors.surface,
    borderWidth: 2,
    borderColor: AppColors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: AppColors.surface,
  },
  profileSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: AppColors.mutedSlate,
    marginTop: 2,
  },
  statsBanner: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: AppColors.card,
    borderWidth: 1,
    borderColor: AppColors.border,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  statCol: {
    alignItems: 'center',
    flex: 1,
  },
  statNum: {
    fontSize: 18,
    fontWeight: '800',
    color: AppColors.dominant,
  },
  statNumActive: {
    fontSize: 18,
    fontWeight: '800',
    color: AppColors.surface,
  },
  statLabel: {
    fontSize: 11,
    color: AppColors.mutedSlate,
    fontWeight: '500',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: AppColors.border,
  },
  cardSection: {
    backgroundColor: AppColors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: AppColors.border,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: AppColors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: '700',
    color: AppColors.mutedSlate,
    letterSpacing: 0.8,
    marginBottom: 14,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 4,
  },
  infoRowPressed: {
    opacity: 0.7,
  },
  infoIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: AppColors.primaryTint,
    borderWidth: 1,
    borderColor: AppColors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoTexts: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    color: AppColors.mutedSlate,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '700',
    color: AppColors.textPrimary,
    marginTop: 1,
  },
  rowDivider: {
    height: 1,
    backgroundColor: AppColors.borderMuted,
    marginVertical: 10,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: AppColors.error,
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 6,
    elevation: 3,
    shadowColor: AppColors.error,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
  },
  logoutButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  logoutButtonText: {
    color: AppColors.white,
    fontSize: 15,
    fontWeight: '700',
  },
  footerNote: {
    fontSize: 11,
    color: AppColors.mutedSlate,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
});
