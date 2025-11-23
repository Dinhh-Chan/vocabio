import { AppHeader } from '@/components/app-header';
import { CreateStudySetSheet } from '@/components/create-study-set-sheet';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useHeaderHeight } from '@/hooks/use-header-height';
import { useTabBarHeight } from '@/hooks/use-tab-bar-height';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

export default function CreateScreen() {
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useTabBarHeight();
  const colorScheme = useColorScheme();
  const [showStudySetSheet, setShowStudySetSheet] = useState(false);

  const handleSaveStudySet = (data: {
    topic: string;
    chapter: string;
    unit: string;
    description?: string;
  }) => {
    // TODO: Save study set data
    console.log('Save study set:', data);
    // Navigate to study-set/create with data or save directly
    router.push({
      pathname: '/study-set/create',
      params: data,
    });
    setShowStudySetSheet(false);
  };

  return (
    <ThemedView style={[styles.container, { paddingBottom: tabBarHeight, paddingTop: headerHeight }]}>
      <AppHeader searchPlaceholder="Tìm kiếm..." showSearch={false} />
      
      <View style={styles.content}>
        <ThemedText type="title" style={styles.title}>Tạo mới</ThemedText>
        
        <Pressable
          style={[
            styles.menuItem,
            { backgroundColor: Colors[colorScheme ?? 'dark'].searchBackground }
          ]}
          onPress={() => {
            setShowStudySetSheet(true);
          }}
        >
          <View style={styles.menuItemContent}>
            <IconSymbol
              name="book.fill"
              size={24}
              color={Colors[colorScheme ?? 'dark'].text}
              style={styles.menuItemIcon}
            />
            <ThemedText type="defaultSemiBold" style={styles.menuItemText}>
              Học phần
            </ThemedText>
          </View>
        </Pressable>

        <Pressable
          style={[
            styles.menuItem,
            { backgroundColor: Colors[colorScheme ?? 'dark'].searchBackground }
          ]}
          onPress={() => {
            // TODO: Navigate to folder create screen when implemented
            console.log('Create folder - to be implemented');
          }}
        >
          <View style={styles.menuItemContent}>
            <IconSymbol
              name="folder.fill"
              size={24}
              color={Colors[colorScheme ?? 'dark'].text}
              style={styles.menuItemIcon}
            />
            <ThemedText type="defaultSemiBold" style={styles.menuItemText}>
              Thư mục
            </ThemedText>
          </View>
        </Pressable>
      </View>

      {showStudySetSheet && (
        <CreateStudySetSheet
          visible={showStudySetSheet}
          onClose={() => {
            setShowStudySetSheet(false);
          }}
          onSave={handleSaveStudySet}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    marginBottom: 24,
  },
  menuItem: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuItemIcon: {
    marginRight: 0,
  },
  menuItemText: {
    fontSize: 16,
  },
});

