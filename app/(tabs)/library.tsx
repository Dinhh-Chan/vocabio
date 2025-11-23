import { AppHeader } from '@/components/app-header';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { mockFlashcardData, mockFolders, mockStudySets } from '@/constants/mock-data';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useHeaderHeight } from '@/hooks/use-header-height';
import { useTabBarHeight } from '@/hooks/use-tab-bar-height';
import { Folder, StudySet } from '@/types';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, View } from 'react-native';

type TabType = 'study-sets' | 'folders';

interface StudyMode {
  id: string;
  name: string;
  icon: string; // Material Icon name
}

const STUDY_MODES: StudyMode[] = [
  {
    id: 'flashcard',
    name: 'Flashcard',
    icon: 'book.fill',
  },
];

export default function LibraryScreen() {
  const colorScheme = useColorScheme();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useTabBarHeight();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('study-sets');
  const [folders, setFolders] = useState<Folder[]>([]);
  const [studySets, setStudySets] = useState<StudySet[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudySet, setSelectedStudySet] = useState<StudySet | null>(null);
  const [showStudyModeModal, setShowStudyModeModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // Using mock data for testing
      setFolders(mockFolders);
      setStudySets(mockStudySets);

      // ============================================
      // API call code (commented for now, using mock data)
      // ============================================
      // const [foldersRes, studySetsRes] = await Promise.all([
      //   folderService.getAll(),
      //   studySetService.getAll({ limit: 20 }),
      // ]);

      // if (foldersRes.success && foldersRes.data) {
      //   setFolders(foldersRes.data);
      // }

      // if (studySetsRes.success && studySetsRes.data) {
      //   setStudySets(studySetsRes.data.data || []);
      // }
      // ============================================
    } catch (error) {
      console.error('Error loading library:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderFolder = ({ item }: { item: Folder }) => (
    <Pressable
      onPress={() => {
        router.push({
          pathname: '/folder/[id]',
          params: { id: item._id },
        });
      }}
      style={[
        styles.item,
        {
          backgroundColor: Colors[colorScheme ?? 'dark'].cardBackground,
          borderColor: Colors[colorScheme ?? 'dark'].icon,
        },
      ]}
    >
      <ThemedText type="defaultSemiBold">{item.name}</ThemedText>
      {item.description && (
        <ThemedText style={styles.description}>{item.description}</ThemedText>
      )}
      {item.item_count && (
        <ThemedText style={styles.itemCount}>{item.item_count} mục</ThemedText>
      )}
    </Pressable>
  );

  const renderStudySet = ({ item }: { item: StudySet }) => (
    <Pressable
      onPress={() => {
        setSelectedStudySet(item);
        setShowStudyModeModal(true);
      }}
      style={[
        styles.item,
        {
          backgroundColor: Colors[colorScheme ?? 'dark'].cardBackground,
          borderColor: Colors[colorScheme ?? 'dark'].icon,
        },
      ]}
    >
      <View style={styles.studySetHeader}>
        <ThemedText type="defaultSemiBold" style={{ flex: 1 }}>
          {item.name}
        </ThemedText>
        <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(item.difficulty) }]}>
          <ThemedText style={styles.difficultyText}>
            {item.difficulty}
          </ThemedText>
        </View>
      </View>
      {item.description && (
        <ThemedText style={styles.description}>{item.description}</ThemedText>
      )}
      <View style={styles.studySetFooter}>
        <ThemedText style={styles.smallText}>
          {item.vocabulary_ids.length} từ vựng
        </ThemedText>
        {item.level && (
          <ThemedText style={styles.smallText}>{item.level}</ThemedText>
        )}
      </View>
    </Pressable>
  );

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'beginner':
        return '#4CAF50';
      case 'intermediate':
        return '#FFC107';
      case 'advanced':
        return '#F44336';
      default:
        return '#999';
    }
  };

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Đang tải...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, { paddingBottom: tabBarHeight + 10, paddingTop: headerHeight }]}>
      <AppHeader searchPlaceholder="Tìm kiếm..." />

      {/* Tab Switcher */}
      <View style={[styles.tabSwitcher, { borderColor: Colors[colorScheme ?? 'dark'].icon }]}>
        <Pressable
          style={[
            styles.tabButton,
            activeTab === 'study-sets' && styles.tabButtonActive,
            {
              borderBottomColor:
                activeTab === 'study-sets'
                  ? Colors[colorScheme ?? 'dark'].tint
                  : 'transparent',
            },
          ]}
          onPress={() => setActiveTab('study-sets')}
        >
          <ThemedText
            type="defaultSemiBold"
            style={[
              styles.tabText,
              activeTab === 'study-sets' && styles.tabTextActive,
            ]}
          >
            Học phần ({studySets.length})
          </ThemedText>
        </Pressable>

        <Pressable
          style={[
            styles.tabButton,
            activeTab === 'folders' && styles.tabButtonActive,
            {
              borderBottomColor:
                activeTab === 'folders'
                  ? Colors[colorScheme ?? 'dark'].tint
                  : 'transparent',
            },
          ]}
          onPress={() => setActiveTab('folders')}
        >
          <ThemedText
            type="defaultSemiBold"
            style={[
              styles.tabText,
              activeTab === 'folders' && styles.tabTextActive,
            ]}
          >
            Thư mục ({folders.length})
          </ThemedText>
        </Pressable>
      </View>

      {/* Study Sets Tab */}
      {activeTab === 'study-sets' && (
        <FlatList
          data={studySets}
          renderItem={renderStudySet}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          scrollIndicatorInsets={{ bottom: tabBarHeight }}
          ListEmptyComponent={
            <ThemedView style={styles.empty}>
              <ThemedText>Chưa có học phần nào</ThemedText>
            </ThemedView>
          }
        />
      )}

      {/* Folders Tab */}
      {activeTab === 'folders' && (
        <FlatList
          data={folders}
          renderItem={renderFolder}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          scrollIndicatorInsets={{ bottom: tabBarHeight }}
          ListEmptyComponent={
            <ThemedView style={styles.empty}>
              <ThemedText>Chưa có thư mục nào</ThemedText>
            </ThemedView>
          }
        />
      )}

      {/* Study Mode Modal */}
      <Modal
        visible={showStudyModeModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowStudyModeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <ThemedView style={[styles.modalContent, { backgroundColor: Colors[colorScheme ?? 'dark'].background }]}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <ThemedText type="subtitle">
                {selectedStudySet?.name}
              </ThemedText>
              <Pressable
                onPress={() => setShowStudyModeModal(false)}
                style={styles.closeButton}
              >
                <ThemedText style={styles.closeButtonText}>✕</ThemedText>
              </Pressable>
            </View>

            {/* Study Modes */}
            <ThemedText style={styles.modalSubtitle}>Chọn cách học:</ThemedText>
            {STUDY_MODES.map((mode) => (
              <Pressable
                key={mode.id}
                onPress={() => {
                  setShowStudyModeModal(false);
                  if (mode.id === 'flashcard') {
                    // Get cards from mock data based on study set ID
                    const cards = mockFlashcardData[selectedStudySet?._id as keyof typeof mockFlashcardData] || mockFlashcardData['studyset1'];
                    router.push({
                      pathname: '/study/flashcard',
                      params: { 
                        studySetId: selectedStudySet?._id,
                        name: selectedStudySet?.name,
                        cards: JSON.stringify(cards),
                      },
                    });
                  } else if (mode.id === 'stack-card') {
                    // TODO: Implement stack card
                    console.log('Stack card not implemented yet');
                  }
                }}
                style={[
                  styles.studyModeButton,
                  {
                    backgroundColor: Colors[colorScheme ?? 'dark'].cardBackground,
                    borderColor: Colors[colorScheme ?? 'dark'].icon,
                  },
                ]}
              >
                <IconSymbol
                  name={mode.icon as any}
                  size={28}
                  color={Colors[colorScheme ?? 'dark'].text}
                  style={styles.studyModeIcon}
                />
                <View style={{ flex: 1 }}>
                  <ThemedText type="defaultSemiBold">{mode.name}</ThemedText>
                </View>
              </Pressable>
            ))}
          </ThemedView>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  tabSwitcher: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    marginVertical: 12,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabButtonActive: {
    borderBottomWidth: 3,
  },
  tabText: {
    fontSize: 14,
    opacity: 0.6,
  },
  tabTextActive: {
    opacity: 1,
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: 20,
  },
  item: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  description: {
    marginTop: 8,
    fontSize: 13,
    opacity: 0.7,
  },
  itemCount: {
    marginTop: 8,
    fontSize: 12,
    opacity: 0.6,
  },
  studySetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  difficultyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 8,
  },
  difficultyText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  studySetFooter: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  smallText: {
    fontSize: 12,
    opacity: 0.6,
  },
  empty: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 32,
    paddingHorizontal: 16,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
  },
  closeButtonText: {
    fontSize: 24,
    fontWeight: '300',
  },
  modalSubtitle: {
    fontSize: 14,
    marginTop: 20,
    marginBottom: 12,
    opacity: 0.7,
  },
  studyModeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  studyModeIcon: {
    marginRight: 12,
  },
  studyModeDescription: {
    fontSize: 12,
    marginTop: 4,
    opacity: 0.6,
  },
});

