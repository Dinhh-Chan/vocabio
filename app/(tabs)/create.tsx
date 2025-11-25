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
import { studySetService } from '@/services/study-set.service';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, View } from 'react-native';

export default function CreateScreen() {
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useTabBarHeight();
  const colorScheme = useColorScheme();
  const [showStudySetSheet, setShowStudySetSheet] = useState(false);
  const [showFolderSheet, setShowFolderSheet] = useState(false);
  const [savingStudySet, setSavingStudySet] = useState(false);
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

  const handleSaveStudySet = async (data: {
    topic: string;
    chapter: string;
    unit: string;
    description?: string;
    vocabularies?: Array<{
      id: string;
      term: string;
      definition: string;
      termLanguage?: string;
      definitionLanguage?: string;
      ipa?: string;
      audio?: string;
      example?: string;
    }>;
  }) => {
    if (!data.vocabularies || data.vocabularies.length === 0) {
      Alert.alert('Lỗi', 'Vui lòng thêm ít nhất một từ vựng');
      return;
    }

    // Validate vocabularies
    const invalidVocabs = data.vocabularies.filter(
      (v) => !v.term.trim() || !v.definition.trim()
    );
    if (invalidVocabs.length > 0) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ từ và định nghĩa cho tất cả từ vựng');
      return;
    }

    try {
      setSavingStudySet(true);

      // Map vocabularies to API format
      const vocabularies = data.vocabularies.map((vocab, index) => ({
        word: vocab.term.trim(),
        wordLanguage: vocab.termLanguage || 'en',
        definition: vocab.definition.trim(),
        definitionLanguage: vocab.definitionLanguage || 'vi',
        ...(vocab.ipa && vocab.ipa.trim() && { ipa: vocab.ipa.trim() }),
        ...(vocab.audio && vocab.audio.trim() && { audioUrl: vocab.audio.trim() }),
        priority: index + 1,
      }));

      const res = await studySetService.createWithVocabularies({
        title: data.topic.trim() || 'Học phần mới',
        description: data.description?.trim(),
        difficulty: 1, // Default difficulty
        isPublic: false, // Default to private
        vocabularies,
      });

      // Kiểm tra nếu POST trả về status 200 thì hiển thị popup thành công
      if (res.success && res.status === 200) {
        // Đóng sheet trước
        setShowStudySetSheet(false);
        
        // Hiển thị popup "Tạo thành công học phần" sau khi đóng sheet
        setTimeout(() => {
          Alert.alert(
            'Thành công',
            'Tạo thành công học phần',
            [{ text: 'OK' }]
          );
        }, 300);
      } else {
        Alert.alert('Lỗi', res.error || 'Không thể tạo học phần');
      }
    } catch (error: any) {
      console.error('Error creating study set:', error);
      Alert.alert('Lỗi', error.message || 'Đã xảy ra lỗi khi tạo học phần');
    } finally {
      setSavingStudySet(false);
    }
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
            if (!savingStudySet) {
              setShowStudySetSheet(false);
            }
          }}
          onSave={handleSaveStudySet}
          settings={studySetSettings}
        />
      )}

      {savingStudySet && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors[colorScheme ?? 'dark'].tint} />
            <ThemedText style={styles.loadingText}>Đang tạo học phần...</ThemedText>
          </View>
        </View>
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
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingContainer: {
    backgroundColor: Colors.dark.cardBackground,
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    marginTop: 8,
  },
});

