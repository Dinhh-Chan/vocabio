import { AppHeader } from '@/components/app-header';
import { CreateFolderSheet } from '@/components/create-folder-sheet';
import { CreateStudySetSheet } from '@/components/create-study-set-sheet';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useHeaderHeight } from '@/hooks/use-header-height';
import { useTabBarHeight } from '@/hooks/use-tab-bar-height';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';

export default function CreateScreen() {
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useTabBarHeight();
  const colorScheme = useColorScheme();
  const [showStudySetSheet, setShowStudySetSheet] = useState(false);
  const [showFolderSheet, setShowFolderSheet] = useState(false);
  const [studySetSettings, setStudySetSettings] = useState({
    showIPA: false,
    showAudio: false,
    showExample: false,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  // Reload settings when screen is focused (e.g., when coming back from settings screen)
  useFocusEffect(
    useCallback(() => {
      loadSettings();
    }, [])
  );

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('@study_set_settings');
      if (savedSettings) {
        setStudySetSettings(JSON.parse(savedSettings));
      } else {
        // Reset to default if no settings found
        setStudySetSettings({
          showIPA: false,
          showAudio: false,
          showExample: false,
        });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const handleSaveStudySet = (data: {
    topic: string;
    chapter: string;
    unit: string;
    description?: string;
    vocabularies?: Array<{ id: string; term: string; definition: string }>;
  }) => {
    // TODO: Save study set data
    console.log('Save study set:', data);
    
    // Đóng sheet trước
    setShowStudySetSheet(false);
    
    // Hiển thị thông báo thành công sau khi đóng sheet
    setTimeout(() => {
      Alert.alert(
        'Thành công',
        'Tạo học phần thành công'
      );
    }, 300);
    
    // Navigate to study-set/create with data or save directly
    // router.push({
    //   pathname: '/study-set/create',
    //   params: data as any,
    // });
  };

  const handleSaveFolder = (data: {
    name: string;
    description?: string;
  }) => {
    // TODO: Save folder data
    console.log('Save folder:', data);
    
    // Đóng sheet trước
    setShowFolderSheet(false);
    
    // Hiển thị thông báo thành công sau khi đóng sheet
    setTimeout(() => {
      Alert.alert(
        'Thành công',
        'Tạo thư mục thành công'
      );
    }, 300);
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
            setShowFolderSheet(true);
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
          settings={studySetSettings}
        />
      )}

      {showFolderSheet && (
        <CreateFolderSheet
          visible={showFolderSheet}
          onClose={() => {
            setShowFolderSheet(false);
          }}
          onSave={handleSaveFolder}
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

