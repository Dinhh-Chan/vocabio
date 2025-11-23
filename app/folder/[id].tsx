import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { mockFlashcardData, mockFolders, mockStudySets } from '@/constants/mock-data';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Folder, StudySet } from '@/types';
import { useNavigation } from '@react-navigation/native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, View } from 'react-native';

export default function FolderDetailScreen() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const navigation = useNavigation();
  const params = useLocalSearchParams();
  const folderId = params.id as string;

  const [folder, setFolder] = useState<Folder | null>(null);
  const [studySets, setStudySets] = useState<StudySet[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudySet, setSelectedStudySet] = useState<StudySet | null>(null);
  const [showStudyModeModal, setShowStudyModeModal] = useState(false);
  const hasLoaded = useRef(false);

  const loadData = useCallback(() => {
    if (hasLoaded.current) return;
    hasLoaded.current = true;
    try {
      setLoading(true);
      // Find the folder
      const foundFolder = mockFolders.find((f) => f._id === folderId);
      setFolder(foundFolder || null);

      // For demo, show all study sets in this folder
      // In real app, this would be filtered by folder ID
      const filteredStudySets = mockStudySets;
      setStudySets(filteredStudySets);
    } catch (error) {
      console.error('Error loading folder:', error);
    } finally {
      setLoading(false);
    }
  }, [folderId]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
      animationEnabled: false,
    });
  }, [navigation]);

  useEffect(() => {
    loadData();
  }, [loadData, folderId]);

  const handleGoBack = () => {
    router.back();
  };

  const getDifficultyColor = useCallback((difficulty?: string) => {
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
  }, []);

  const renderStudySet = useCallback(
    ({ item }: { item: StudySet }) => (
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
            <ThemedText style={styles.difficultyText}>{item.difficulty}</ThemedText>
          </View>
        </View>
        {item.description && (
          <ThemedText style={styles.description}>{item.description}</ThemedText>
        )}
        <View style={styles.studySetFooter}>
          <ThemedText style={styles.smallText}>
            {item.vocabulary_ids.length} từ vựng
          </ThemedText>
          {item.level && <ThemedText style={styles.smallText}>{item.level}</ThemedText>}
        </View>
      </Pressable>
    ),
    [colorScheme, getDifficultyColor]
  );

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Đang tải...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: Colors[colorScheme ?? 'dark'].background,
      }}
    >
      <ThemedView
        style={[
          styles.container,
          { 
            paddingBottom: 36, 
            paddingTop: 36,
          },
        ]}
      >
        {/* Header */}
        <View style={styles.headerSection}>
          <Pressable onPress={handleGoBack} style={styles.backButton}>
            <IconSymbol name="arrow.left" size={28} color={Colors[colorScheme ?? 'dark'].text} />
          </Pressable>
          <View style={{ flex: 1 }}>
            <ThemedText type="defaultSemiBold" style={styles.folderName}>
              {folder?.name || 'Thư mục'}
            </ThemedText>
            <ThemedText style={styles.folderDescription}>{folder?.description}</ThemedText>
          </View>
        </View>

        {/* Study Sets List */}
        {studySets.length > 0 ? (
          <FlatList
            data={studySets}
            renderItem={renderStudySet}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            removeClippedSubviews={true}
            maxToRenderPerBatch={10}
            updateCellsBatchingPeriod={50}
          />
        ) : (
          <ThemedView style={styles.empty}>
            <ThemedText>Chưa có học phần nào trong thư mục này</ThemedText>
          </ThemedView>
        )}
      </ThemedView>

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
            <Pressable
              onPress={() => {
                setShowStudyModeModal(false);
                if (selectedStudySet) {
                  const cards = mockFlashcardData[selectedStudySet._id as keyof typeof mockFlashcardData] || mockFlashcardData['studyset1'];
                  router.push({
                    pathname: '/study/flashcard',
                    params: {
                      studySetId: selectedStudySet._id,
                      name: selectedStudySet.name,
                      cards: JSON.stringify(cards),
                    },
                  });
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
                name="book.fill"
                size={28}
                color={Colors[colorScheme ?? 'dark'].text}
                style={styles.studyModeIcon}
              />
              <View style={{ flex: 1 }}>
                <ThemedText type="defaultSemiBold">Flashcard</ThemedText>
              </View>
            </Pressable>
          </ThemedView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  headerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  folderName: {
    fontSize: 18,
    marginBottom: 4,
  },
  folderDescription: {
    fontSize: 12,
    opacity: 0.6,
  },
  listContent: {
    gap: 12,
  },
  item: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  studySetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
  },
  description: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 8,
  },
  studySetFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  smallText: {
    fontSize: 11,
    opacity: 0.5,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
});
