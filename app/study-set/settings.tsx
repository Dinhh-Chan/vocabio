import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useHeaderHeight } from '@/hooks/use-header-height';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import { router, useNavigation } from 'expo-router';
import { useEffect, useLayoutEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface StudySetSettings {
  showIPA: boolean;
  showAudio: boolean;
  showExample: boolean;
}

const SETTINGS_KEY = '@study_set_settings';

export default function StudySetSettingsScreen() {
  const headerHeight = useHeaderHeight();
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [settings, setSettings] = useState<StudySetSettings>({
    showIPA: false,
    showAudio: false,
    showExample: false,
  });

  // Ẩn tab bar khi vào màn hình này
  useLayoutEffect(() => {
    const parent = navigation.getParent();
    if (parent) {
      parent.setOptions({
        tabBarStyle: { display: 'none' },
      });
    }
    
    return () => {
      // Hiện lại tab bar khi rời màn hình
      if (parent) {
        parent.setOptions({
          tabBarStyle: { display: 'flex' },
        });
      }
    };
  }, [navigation]);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem(SETTINGS_KEY);
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = async (newSettings: StudySetSettings) => {
    try {
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const handleToggleColumn = (column: keyof StudySetSettings) => {
    const newSettings = {
      ...settings,
      [column]: !settings[column],
    };
    setSettings(newSettings);
    // Không lưu ngay, chỉ lưu khi nhấn save
  };

  const handleSave = async () => {
    await saveSettings(settings);
    // Không hiển thị alert, chỉ quay lại
    router.back();
  };

  const handleBack = () => {
    // Quay lại mà không lưu thay đổi
    router.back();
  };

  const handleUploadDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        console.log('Selected file:', file);
        Alert.alert(
          'Thành công',
          `Đã chọn tài liệu: ${file.name}\n\nKích thước: ${Math.round((file.size || 0) / 1024)} KB`
        );
        // TODO: Upload file to server and extract vocabulary
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Lỗi', 'Không thể chọn tài liệu');
    }
  };

  const handleDownloadTemplate = () => {
    // TODO: Download template document
    Alert.alert('Thông báo', 'Tải về mẫu tài liệu');
  };

  return (
    <ThemedView style={styles.container}>
      {/* Custom Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable 
          onPress={handleBack} 
          style={styles.headerButton}
        >
          <IconSymbol
            name="chevron.left"
            size={24}
            color={Colors[colorScheme ?? 'dark'].text}
          />
        </Pressable>
        
        <ThemedText type="defaultSemiBold" style={styles.headerTitle}>
          Cài đặt học phần
        </ThemedText>
        
        <Pressable 
          onPress={handleSave} 
          style={styles.headerButton}
        >
          <IconSymbol
            name="checkmark"
            size={24}
            color={Colors[colorScheme ?? 'dark'].tint}
          />
        </Pressable>
      </View>
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingTop: headerHeight }]}
      >
        {/* Quản lý cột hiển thị */}
        <View style={styles.section}>
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
            Quản lý cột hiển thị
          </ThemedText>
          <ThemedText style={styles.sectionDescription}>
            Chọn các cột bạn muốn hiển thị khi thêm từ vựng
          </ThemedText>

          <View style={styles.columnList}>
            {/* Thuật ngữ - luôn hiển thị */}
            <View style={[
              styles.columnItem,
              { backgroundColor: Colors[colorScheme ?? 'dark'].searchBackground }
            ]}>
              <View style={styles.columnItemContent}>
                <ThemedText type="defaultSemiBold" style={styles.columnItemLabel}>
                  Thuật ngữ
                </ThemedText>
                <ThemedText style={styles.columnItemNote}>
                  (Luôn hiển thị)
                </ThemedText>
              </View>
            </View>

            {/* Định nghĩa - luôn hiển thị */}
            <View style={[
              styles.columnItem,
              { backgroundColor: Colors[colorScheme ?? 'dark'].searchBackground }
            ]}>
              <View style={styles.columnItemContent}>
                <ThemedText type="defaultSemiBold" style={styles.columnItemLabel}>
                  Định nghĩa
                </ThemedText>
                <ThemedText style={styles.columnItemNote}>
                  (Luôn hiển thị)
                </ThemedText>
              </View>
            </View>

            {/* IPA */}
            <View style={[
              styles.columnItem,
              { backgroundColor: Colors[colorScheme ?? 'dark'].searchBackground }
            ]}>
              <View style={styles.columnItemContent}>
                <ThemedText type="defaultSemiBold" style={styles.columnItemLabel}>
                  IPA
                </ThemedText>
              </View>
              <Switch
                value={settings.showIPA}
                onValueChange={() => handleToggleColumn('showIPA')}
                trackColor={{
                  false: Colors[colorScheme ?? 'dark'].searchBackground,
                  true: Colors[colorScheme ?? 'dark'].tint,
                }}
                thumbColor={settings.showIPA ? '#fff' : Colors[colorScheme ?? 'dark'].icon}
              />
            </View>

            {/* Audio */}
            <View style={[
              styles.columnItem,
              { backgroundColor: Colors[colorScheme ?? 'dark'].searchBackground }
            ]}>
              <View style={styles.columnItemContent}>
                <ThemedText type="defaultSemiBold" style={styles.columnItemLabel}>
                  Audio
                </ThemedText>
              </View>
              <Switch
                value={settings.showAudio}
                onValueChange={() => handleToggleColumn('showAudio')}
                trackColor={{
                  false: Colors[colorScheme ?? 'dark'].searchBackground,
                  true: Colors[colorScheme ?? 'dark'].tint,
                }}
                thumbColor={settings.showAudio ? '#fff' : Colors[colorScheme ?? 'dark'].icon}
              />
            </View>

            {/* Example */}
            <View style={[
              styles.columnItem,
              { backgroundColor: Colors[colorScheme ?? 'dark'].searchBackground }
            ]}>
              <View style={styles.columnItemContent}>
                <ThemedText type="defaultSemiBold" style={styles.columnItemLabel}>
                  Example
                </ThemedText>
              </View>
              <Switch
                value={settings.showExample}
                onValueChange={() => handleToggleColumn('showExample')}
                trackColor={{
                  false: Colors[colorScheme ?? 'dark'].searchBackground,
                  true: Colors[colorScheme ?? 'dark'].tint,
                }}
                thumbColor={settings.showExample ? '#fff' : Colors[colorScheme ?? 'dark'].icon}
              />
            </View>
          </View>
        </View>

        {/* Tải lên tài liệu của tôi */}
        <View style={styles.section}>
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
            Tải lên tài liệu của tôi
          </ThemedText>
          <ThemedText style={styles.sectionDescription}>
            Tải lên tài liệu để tự động trích xuất từ vựng
          </ThemedText>

          <View style={styles.documentActions}>
            <Pressable
              style={[
                styles.documentButton,
                { backgroundColor: Colors[colorScheme ?? 'dark'].tint }
              ]}
              onPress={handleUploadDocument}
            >
              <IconSymbol
                name="doc.text.fill"
                size={20}
                color="#fff"
                style={styles.documentButtonIcon}
              />
              <ThemedText type="defaultSemiBold" style={styles.documentButtonText}>
                Tải lên tài liệu
              </ThemedText>
            </Pressable>

            <Pressable
              style={[
                styles.documentButton,
                { backgroundColor: Colors[colorScheme ?? 'dark'].searchBackground }
              ]}
              onPress={handleDownloadTemplate}
            >
              <IconSymbol
                name="doc.text.fill"
                size={20}
                color={Colors[colorScheme ?? 'dark'].text}
                style={styles.documentButtonIcon}
              />
              <ThemedText type="defaultSemiBold" style={[styles.documentButtonText, { color: Colors[colorScheme ?? 'dark'].text }]}>
                Tải về mẫu tài liệu
              </ThemedText>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
    zIndex: 1000,
    backgroundColor: 'transparent',
  },
  headerButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    flex: 1,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 16,
  },
  columnList: {
    gap: 12,
  },
  columnItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
  },
  columnItemContent: {
    flex: 1,
  },
  columnItemLabel: {
    fontSize: 16,
    marginBottom: 4,
  },
  columnItemNote: {
    fontSize: 12,
    opacity: 0.6,
  },
  documentActions: {
    gap: 12,
  },
  documentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  documentButtonIcon: {
    marginRight: 0,
  },
  documentButtonText: {
    fontSize: 16,
  },
});

