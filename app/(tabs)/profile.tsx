import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
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
      setUser(currentUser);
    } catch (error) {
      console.error('Error loading user:', error);
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
          {user.avatar && (
            <View style={styles.avatarContainer}>
              {/* Avatar image would go here */}
            </View>
          )}
          <ThemedText type="subtitle">{user.name}</ThemedText>
          <ThemedText style={styles.email}>{user.email}</ThemedText>
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

      <ThemedView style={styles.menuSection}>
        <Pressable style={[styles.menuItem, { backgroundColor: Colors[colorScheme ?? 'dark'].cardBackground }]}>
          <ThemedText>Cài đặt</ThemedText>
        </Pressable>
        <Pressable style={[styles.menuItem, { backgroundColor: Colors[colorScheme ?? 'dark'].cardBackground }]}>
          <ThemedText>Đồng bộ dữ liệu</ThemedText>
        </Pressable>
        <Pressable style={[styles.menuItem, { backgroundColor: Colors[colorScheme ?? 'dark'].cardBackground }]}>
          <ThemedText>Giúp đỡ & Hỗ trợ</ThemedText>
        </Pressable>
        {user && (
          <Pressable style={[styles.menuItem, { backgroundColor: Colors[colorScheme ?? 'dark'].cardBackground }]} onPress={handleSignOut}>
            <ThemedText style={styles.signOutText}>Đăng xuất</ThemedText>
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
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ccc',
    marginBottom: 12,
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
  menuItem: {
    padding: 16,
    borderRadius: 12,
  },
  signOutText: {
    color: '#ff4444',
  },
});

