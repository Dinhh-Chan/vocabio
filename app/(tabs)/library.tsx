import { AppHeader } from '@/components/app-header';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useHeaderHeight } from '@/hooks/use-header-height';
import { useTabBarHeight } from '@/hooks/use-tab-bar-height';
import { folderService } from '@/services/folder.service';
import { studySetService } from '@/services/study-set.service';
import { Folder, StudySet } from '@/types';
import { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function LibraryScreen() {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useTabBarHeight();
  const [folders, setFolders] = useState<Folder[]>([]);
  const [studySets, setStudySets] = useState<StudySet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [foldersRes, studySetsRes] = await Promise.all([
        folderService.getAll(),
        studySetService.getAll({ limit: 20 }),
      ]);

      if (foldersRes.success && foldersRes.data) {
        setFolders(foldersRes.data);
      }

      if (studySetsRes.success && studySetsRes.data) {
        setStudySets(studySetsRes.data.data || []);
      }
    } catch (error) {
      console.error('Error loading library:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderFolder = ({ item }: { item: Folder }) => (
    <Pressable
      style={[
        styles.item,
        {
          backgroundColor: Colors[colorScheme ?? 'dark'].cardBackground,
          borderColor: 'transparent',
        },
      ]}
    >
      <ThemedText type="defaultSemiBold">{item.name}</ThemedText>
    </Pressable>
  );

  const renderStudySet = ({ item }: { item: StudySet }) => (
    <Pressable
      style={[
        styles.item,
        {
          backgroundColor: Colors[colorScheme ?? 'dark'].cardBackground,
          borderColor: 'transparent',
        },
      ]}
    >
      <ThemedText type="defaultSemiBold">{item.name}</ThemedText>
      {item.description && (
        <ThemedText style={styles.description}>{item.description}</ThemedText>
      )}
    </Pressable>
  );

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Đang tải...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, { paddingBottom: tabBarHeight, paddingTop: headerHeight }]}>
      <AppHeader searchPlaceholder="Tìm kiếm học phần, thư mục..." />

      {folders.length > 0 && (
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Thư mục
          </ThemedText>
          <FlatList
            data={folders}
            renderItem={renderFolder}
            keyExtractor={(item) => item._id}
            horizontal
            showsHorizontalScrollIndicator={false}
          />
        </View>
      )}

      <View style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Học phần
        </ThemedText>
        <FlatList
          data={studySets}
          renderItem={renderStudySet}
          keyExtractor={(item) => item._id}
          ListEmptyComponent={
            <ThemedView style={styles.empty}>
              <ThemedText>Chưa có học phần nào</ThemedText>
            </ThemedView>
          }
        />
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  item: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginRight: 12,
    marginBottom: 12,
    minWidth: 200,
  },
  description: {
    marginTop: 8,
    fontSize: 14,
    opacity: 0.7,
  },
  empty: {
    padding: 40,
    alignItems: 'center',
  },
});

