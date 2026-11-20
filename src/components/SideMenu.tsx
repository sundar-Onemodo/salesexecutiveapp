import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  Alert,
  Platform,
  TouchableWithoutFeedback,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppColors } from '@/constants/colors';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logoutThunk } from '@/store/slices/authSlice';
import { router } from 'expo-router';

interface SideMenuProps {
  visible: boolean;
  onClose: () => void;
  activeRoute?: 'dashboard' | 'profile';
}

export const SideMenu: React.FC<SideMenuProps> = ({
  visible,
  onClose,
  activeRoute = 'dashboard',
}) => {
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const { mobile } = useAppSelector((state) => state.auth);

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Are you sure you want to log out?');
      if (confirmed) {
        dispatch(logoutThunk());
        onClose();
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
            onClose();
            router.replace('/login');
          },
        },
      ]
    );
  };

  const navigateTo = (route: string) => {
    onClose();
    router.replace(route as any);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <View style={styles.container}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>

        <View
          style={[
            styles.drawer,
            {
              paddingTop: Math.max(insets.top, 24),
              paddingBottom: Math.max(insets.bottom, 20),
            },
          ]}>
          {/* Executive Profile Header */}
          <View style={styles.header}>
            <View style={styles.headerBrand}>
              <View style={styles.logoBadge}>
                <Ionicons name="briefcase" size={20} color={AppColors.white} />
              </View>
              <View>
                <Text style={styles.appName}>ONEMODO</Text>
                <Text style={styles.appSub}>Sales Executive</Text>
              </View>
            </View>

            <View style={styles.executiveCard}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>SE</Text>
              </View>
              <View style={styles.executiveDetails}>
                <Text style={styles.executiveId}>Sales Executive</Text>
                {mobile ? (
                  <Text style={styles.mobileText}>+91 {mobile}</Text>
                ) : null}
              </View>
            </View>
          </View>

          {/* Navigation Links */}
          <View style={styles.navSection}>
            <Text style={styles.sectionTitle}>MENU</Text>

            <Pressable
              style={[
                styles.navItem,
                activeRoute === 'dashboard' && styles.navItemActive,
              ]}
              onPress={() => navigateTo('/(tabs)')}>
              <Ionicons
                name="grid-outline"
                size={20}
                color={
                  activeRoute === 'dashboard'
                    ? AppColors.primary
                    : AppColors.mutedSlate
                }
              />
              <Text
                style={[
                  styles.navText,
                  activeRoute === 'dashboard' && styles.navTextActive,
                ]}>
                Dashboard
              </Text>
              {activeRoute === 'dashboard' ? (
                <View style={styles.activeDot} />
              ) : null}
            </Pressable>

            <Pressable
              style={[
                styles.navItem,
                activeRoute === 'profile' && styles.navItemActive,
              ]}
              onPress={() => navigateTo('/(tabs)/profile')}>
              <Ionicons
                name="person-circle-outline"
                size={20}
                color={
                  activeRoute === 'profile'
                    ? AppColors.primary
                    : AppColors.mutedSlate
                }
              />
              <Text
                style={[
                  styles.navText,
                  activeRoute === 'profile' && styles.navTextActive,
                ]}>
                Executive Profile
              </Text>
            </Pressable>

            <View style={styles.divider} />

            <View style={styles.infoBox}>
              <Ionicons name="shield-checkmark" size={16} color={AppColors.primary} />
              <Text style={styles.infoBoxText}>
                Active Session • Verified API v3
              </Text>
            </View>
          </View>

          {/* Bottom Section with REQUIRED Logout Button */}
          <View style={styles.bottomSection}>
            <View style={styles.bottomDivider} />

            <Pressable
              style={({ pressed }) => [
                styles.logoutButton,
                pressed && styles.logoutButtonPressed,
              ]}
              onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={20} color={AppColors.primary} />
              <Text style={styles.logoutText}>Log Out</Text>
            </Pressable>

            <Text style={styles.versionText}>Onemodo Mobile v1.0.0 (Light)</Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  backdrop: {
    flex: 1,
    backgroundColor: AppColors.overlay,
  },
  drawer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: '78%',
    maxWidth: 320,
    backgroundColor: AppColors.card,
    borderRightWidth: 1,
    borderRightColor: AppColors.border,
    paddingHorizontal: 20,
    flexDirection: 'column',
    justifyContent: 'space-between',
    shadowColor: AppColors.shadow,
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 12,
  },
  header: {
    borderBottomWidth: 1,
    borderBottomColor: '#F2EDED',
    paddingBottom: 16,
  },
  headerBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  logoBadge: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: AppColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appName: {
    fontSize: 16,
    fontWeight: '900',
    color: AppColors.primaryDark,
    letterSpacing: 1,
  },
  appSub: {
    fontSize: 11,
    fontWeight: '600',
    color: AppColors.mutedSlate,
  },
  executiveCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.cardSecondary,
    borderWidth: 1,
    borderColor: AppColors.primaryLight,
    padding: 12,
    borderRadius: 12,
    gap: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FBEBEB',
    borderWidth: 1,
    borderColor: AppColors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '800',
    color: AppColors.primaryDark,
  },
  executiveDetails: {
    flex: 1,
  },
  executiveId: {
    fontSize: 14,
    fontWeight: '700',
    color: AppColors.textPrimary,
  },
  groupText: {
    fontSize: 11,
    color: AppColors.mutedSlate,
    fontWeight: '500',
  },
  mobileText: {
    fontSize: 11,
    color: AppColors.primaryDark,
    fontWeight: '600',
  },
  navSection: {
    flex: 1,
    paddingTop: 20,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: AppColors.mutedSlate,
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  navItemActive: {
    backgroundColor: '#FDECEC',
  },
  navText: {
    fontSize: 14,
    fontWeight: '600',
    color: AppColors.textPrimary,
    flex: 1,
  },
  navTextActive: {
    color: AppColors.primary,
    fontWeight: '700',
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: AppColors.primary,
  },
  divider: {
    height: 1,
    backgroundColor: '#F0EAEA',
    marginVertical: 12,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FAF5F5',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F2E6E6',
  },
  infoBoxText: {
    fontSize: 11,
    color: AppColors.mutedSlate,
    fontWeight: '500',
  },
  bottomSection: {
    paddingTop: 10,
  },
  bottomDivider: {
    height: 1,
    backgroundColor: AppColors.border,
    marginBottom: 14,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#FFF2F2',
    borderWidth: 1.5,
    borderColor: AppColors.primaryLight,
    paddingVertical: 13,
    borderRadius: 12,
    elevation: 1,
  },
  logoutButtonPressed: {
    backgroundColor: '#FCE6E6',
    transform: [{ scale: 0.98 }],
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '700',
    color: AppColors.primary,
  },
  versionText: {
    fontSize: 11,
    color: AppColors.mutedSlate,
    textAlign: 'center',
    marginTop: 10,
  },
});
