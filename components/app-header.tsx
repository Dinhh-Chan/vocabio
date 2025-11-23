// ============================================
// App Header Component with Search and Avatar
// ============================================

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { authService } from '@/services/auth.service';
import { User } from '@/types';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconSymbol } from './ui/icon-symbol';

interface AppHeaderProps {
  searchPlaceholder?: string;
  onSearchChange?: (text: string) => void;
  showSearch?: boolean;
}

export function AppHeader({ 
  searchPlaceholder = 'Tìm kiếm', 
  onSearchChange,
  showSearch = true,
}: AppHeaderProps) {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const [user, setUser] = useState<User | null>(null);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  const handleSearchChange = (text: string) => {
    setSearchText(text);
    onSearchChange?.(text);
  };

  const handleAvatarPress = () => {
    router.push('/(tabs)/profile');
  };

  return (
    <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
      {showSearch && (
        <View style={[styles.searchContainer, { backgroundColor: Colors[colorScheme ?? 'dark'].searchBackground }]}>
          <IconSymbol 
            name="magnifyingglass" 
            size={20} 
            color={Colors[colorScheme ?? 'dark'].icon}
            style={styles.searchIcon}
          />
          <TextInput
            style={[styles.searchInput, { color: Colors[colorScheme ?? 'dark'].text }]}
            placeholder={searchPlaceholder}
            placeholderTextColor={Colors[colorScheme ?? 'dark'].icon}
            value={searchText}
            onChangeText={handleSearchChange}
          />
        </View>
      )}
      
      {!showSearch && <View style={{ flex: 1 }} />}
      
      <Pressable 
        style={styles.avatarContainer}
        onPress={handleAvatarPress}
      >
        {user?.avatar ? (
          <View style={[styles.avatar, { backgroundColor: Colors[colorScheme ?? 'dark'].tint }]}>
            {/* Avatar image would go here - using placeholder for now */}
            <IconSymbol 
              name="person.circle.fill" 
              size={24} 
              color={Colors[colorScheme ?? 'dark'].navBarActiveText}
            />
          </View>
        ) : (
          <View style={[styles.avatar, { backgroundColor: Colors[colorScheme ?? 'dark'].tint }]}>
            <IconSymbol 
              name="person.circle.fill" 
              size={24} 
              color={Colors[colorScheme ?? 'dark'].navBarActiveText}
            />
          </View>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
    gap: 12,
    zIndex: 1000,
    backgroundColor: 'transparent',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 0,
  },
  avatarContainer: {
    width: 44,
    height: 44,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
});

