import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { mockUser } from '@/constants/mock-data';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTabBarHeight } from '@/hooks/use-tab-bar-height';
import { authService } from '@/services/auth.service';
import { User } from '@/types';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const tabBarHeight = useTabBarHeight();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser || (mockUser as User));
    } catch (error) {
      console.error('Error loading user:', error);
      // Use mock data as fallback
      setUser(mockUser as User);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await authService.signOut();
    router.replace('/login');
  };

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Đang tải...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, { paddingBottom: tabBarHeight }]}>
      <ThemedView style={[styles.header, { paddingTop: insets.top }]}>
        <ThemedText type="title">Cá nhân</ThemedText>
      </ThemedView>

      {user ? (
        <ThemedView style={styles.profileSection}>
          <View
            style={[
              styles.avatarContainer,
              { backgroundColor: Colors[colorScheme ?? 'dark'].tint },
            ]}
          >
            <ThemedText style={styles.avatarText}>
              {user.name?.charAt(0).toUpperCase() || 'U'}
            </ThemedText>
          </View>
          <ThemedText type="subtitle">{user.name || 'Người dùng'}</ThemedText>
        </ThemedView>
      ) : (
        <Pressable
          style={[
            styles.button,
            {
              backgroundColor: Colors[colorScheme ?? 'light'].tint,
            },
          ]}
          onPress={() => router.push('/login')}
        >
          <ThemedText style={styles.buttonText}>Đăng nhập</ThemedText>
        </Pressable>
      )}

      {user && (
        <ThemedView style={[styles.streakSection, { backgroundColor: Colors[colorScheme ?? 'dark'].cardBackground }]}>
          <View style={styles.streakItem}>
            <ThemedText style={styles.streakLabel}>Chuỗi học tập</ThemedText>
            <ThemedText style={styles.streakValue}>7 ngày</ThemedText>
          </View>
          <View style={styles.streakDivider} />
          <View style={styles.streakItem}>
            <ThemedText style={styles.streakLabel}>Tổng học</ThemedText>
            <ThemedText style={styles.streakValue}>42 phút</ThemedText>
          </View>
          <View style={styles.streakDivider} />
          <View style={styles.streakItem}>
            <ThemedText style={styles.streakLabel}>Từ vựng</ThemedText>
            <ThemedText style={styles.streakValue}>156</ThemedText>
          </View>
        </ThemedView>
      )}

      {user && (
        <ThemedView style={[styles.calendarSection, { backgroundColor: Colors[colorScheme ?? 'dark'].cardBackground }]}>
          <ThemedText type="defaultSemiBold" style={styles.calendarTitle}>Hoạt động tuần này</ThemedText>
          <View style={styles.weekRow}>
            {['Cn', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'].map((day, index) => {
              const isActive = [0, 2, 4, 6].includes(index);
              return (
                <View key={index} style={styles.weekDayContainer}>
                  <View
                    style={[
                      styles.weekDayBox,
                      {
                        backgroundColor: isActive ? '#FF9500' : Colors[colorScheme ?? 'dark'].background,
                      },
                    ]}
                  >
                    {isActive && (
                      <IconSymbol
                        name="flame.fill"
                        size={16}
                        color="#fff"
                      />
                    )}
                  </View>
                  <ThemedText style={styles.weekDayLabel}>{day}</ThemedText>
                </View>
              );
            })}
          </View>
        </ThemedView>
      )}

      <ThemedView style={styles.menuSection}>
        <Pressable
          style={[
            styles.menuItem,
            { backgroundColor: Colors[colorScheme ?? 'dark'].cardBackground },
          ]}
        >
          <IconSymbol
            name="gearshape.fill"
            size={20}
            color={Colors[colorScheme ?? 'dark'].text}
            style={styles.menuIcon}
          />
          <ThemedText type="defaultSemiBold" style={{ flex: 1 }}>Cài đặt</ThemedText>
          <IconSymbol
            name="chevron.right"
            size={16}
            color={Colors[colorScheme ?? 'dark'].text}
            style={{ opacity: 0.5 }}
          />
        </Pressable>

        <Pressable
          style={[
            styles.menuItem,
            { backgroundColor: Colors[colorScheme ?? 'dark'].cardBackground },
          ]}
        >
          <IconSymbol
            name="arrow.2.circlepath"
            size={20}
            color={Colors[colorScheme ?? 'dark'].text}
            style={styles.menuIcon}
          />
          <ThemedText type="defaultSemiBold" style={{ flex: 1 }}>Đồng bộ dữ liệu</ThemedText>
          <IconSymbol
            name="chevron.right"
            size={16}
            color={Colors[colorScheme ?? 'dark'].text}
            style={{ opacity: 0.5 }}
          />
        </Pressable>

        <Pressable
          style={[
            styles.menuItem,
            { backgroundColor: Colors[colorScheme ?? 'dark'].cardBackground },
          ]}
        >
          <IconSymbol
            name="questionmark.circle.fill"
            size={20}
            color={Colors[colorScheme ?? 'dark'].text}
            style={styles.menuIcon}
          />
          <ThemedText type="defaultSemiBold" style={{ flex: 1 }}>Giúp đỡ & Hỗ trợ</ThemedText>
          <IconSymbol
            name="chevron.right"
            size={16}
            color={Colors[colorScheme ?? 'dark'].text}
            style={{ opacity: 0.5 }}
          />
        </Pressable>

        {user && (
          <Pressable
            style={[
              styles.menuItem,
              { backgroundColor: Colors[colorScheme ?? 'dark'].cardBackground },
            ]}
            onPress={handleSignOut}
          >
            <IconSymbol
              name="arrow.right.square.fill"
              size={20}
              color="#ff4444"
              style={styles.menuIcon}
            />
              <ThemedText type="defaultSemiBold" style={[styles.signOutText, { flex: 1 }]}>
                Đăng xuất
              </ThemedText>
            <IconSymbol
              name="chevron.right"
              size={16}
              color="#ff4444"
              style={{ opacity: 0.5 }}
            />
          </Pressable>
        )}
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  profileSection: {
    alignItems: 'center',
    padding: 20,
    marginBottom: 30,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#ccc',
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 40,
    fontWeight: '700',
    color: '#fff',
  },
  email: {
    marginTop: 8,
    opacity: 0.7,
  },
  button: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 30,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  menuSection: {
    gap: 12,
  },
  streakSection: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  streakItem: {
    alignItems: 'center',
    flex: 1,
  },
  streakLabel: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 8,
  },
  streakValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  streakDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#ccc',
    opacity: 0.3,
  },
  calendarSection: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  calendarTitle: {
    marginBottom: 12,
    fontSize: 14,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  weekDayContainer: {
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  weekDayBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  weekDayLabel: {
    fontSize: 10,
    opacity: 0.7,
  },
  menuItem: {
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 56,
  },
  menuIcon: {
    marginRight: 8,
  },
  menuSubtext: {
    fontSize: 12,
    marginTop: 4,
    opacity: 0.6,
  },
  signOutText: {
    color: '#ff4444',
  },
});

