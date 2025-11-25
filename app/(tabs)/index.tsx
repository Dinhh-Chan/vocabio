import { AppHeader } from '@/components/app-header';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useHeaderHeight } from '@/hooks/use-header-height';
import { useTabBarHeight } from '@/hooks/use-tab-bar-height';
import { studySetService } from '@/services/study-set.service';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Dimensions, FlatList, Pressable, ScrollView, StyleSheet, View } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HORIZONTAL_PADDING = 20; // Padding từ scrollContent
const CARD_WIDTH = SCREEN_WIDTH - (HORIZONTAL_PADDING * 2); // Card width với padding
const CARD_SPACING = 16;

interface RecentStudySetItem {
  studySetId: string;
  name: string;
  totalCards: number;
  author: string;
  lastAccessed: string;
}

interface ContinueLearningItem {
  studySetId: string;
  name: string;
  totalCards: number;
  completedCards: number;
  progress: number;
  status: 'continue' | 'done' | 'not_started';
  lastStudied?: string;
  loading?: boolean;
  vocabularies?: Array<{
    _id: string;
    word: string;
    definition: string;
  }>;
}

export default function HomeScreen() {
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useTabBarHeight();
  const colorScheme = useColorScheme();
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [recentStudySets, setRecentStudySets] = useState<RecentStudySetItem[]>([]);
  const [loadingRecent, setLoadingRecent] = useState(true);
  const [continueLearning, setContinueLearning] = useState<ContinueLearningItem[]>([]);
  const [loadingContinue, setLoadingContinue] = useState(true);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    loadRecentStudySets();
    loadContinueLearning();
  }, []);

  const loadRecentStudySets = async () => {
    try {
      setLoadingRecent(true);
      const res = await studySetService.getMany();
      
      if (res.success && res.data) {
        // Map API response to RecentStudySetItem format
        // API trả về format: { _id, userId, title, description, difficulty, isPublic, createdAt, updatedAt, dataPartitionCode }
        const mappedData: RecentStudySetItem[] = res.data.map((item: any) => ({
          studySetId: item._id,
          name: item.title || item.name || 'Học phần không tên',
          totalCards: item.vocabulary_ids?.length || 0, // Có thể cần gọi API khác để lấy số lượng
          author: 'Bạn', // Có thể lấy từ userId nếu cần
          lastAccessed: item.updatedAt || item.createdAt || new Date().toISOString(),
        }));
        setRecentStudySets(mappedData);
      } else {
        console.error('Error loading recent study sets:', res.error);
        // Fallback to empty array on error
        setRecentStudySets([]);
      }
    } catch (error) {
      console.error('Error loading recent study sets:', error);
      setRecentStudySets([]);
    } finally {
      setLoadingRecent(false);
    }
  };

  const loadContinueLearning = async () => {
    try {
      setLoadingContinue(true);
      // Lấy danh sách study sets từ API /study-set/many
      const res = await studySetService.getMany();
      
      if (res.success && res.data && res.data.length > 0) {
        // Gọi API full-info cho từng study set để lấy status
        const continueLearningPromises = res.data.slice(0, 5).map(async (studySet: any) => {
          try {
            const fullInfoRes = await studySetService.getFullInfo(studySet._id);
            if (fullInfoRes.success && fullInfoRes.data) {
              const data = fullInfoRes.data;
              const totalCards = data.vocabularies?.length || 0;
              const status = data.status || 'not_started';
              
              // Tính progress dựa trên status (có thể cần logic phức tạp hơn)
              let completedCards = 0;
              let progress = 0;
              
              if (status === 'done') {
                completedCards = totalCards;
                progress = 100;
              } else if (status === 'continue') {
                // Giả sử đã học 50% nếu đang tiếp tục
                completedCards = Math.floor(totalCards * 0.5);
                progress = 50;
              } else {
                completedCards = 0;
                progress = 0;
              }
              
              return {
                studySetId: data.studySet._id,
                name: data.studySet.title || 'Học phần không tên',
                totalCards,
                completedCards,
                progress,
                status: status as 'continue' | 'done' | 'not_started',
                lastStudied: data.studySet.updatedAt || data.studySet.createdAt,
                loading: false,
                vocabularies: data.vocabularies?.map((vocab) => ({
                  _id: vocab._id,
                  word: vocab.word,
                  definition: vocab.definition,
                })),
              };
            }
          } catch (error) {
            console.error(`Error loading full info for ${studySet._id}:`, error);
          }
          return null;
        });
        
        const results = await Promise.all(continueLearningPromises);
        const validResults = results.filter((item) => item !== null) as ContinueLearningItem[];
        setContinueLearning(validResults);
      } else {
        setContinueLearning([]);
      }
    } catch (error) {
      console.error('Error loading continue learning:', error);
      setContinueLearning([]);
    } finally {
      setLoadingContinue(false);
    }
  };

  const handleStartTest = (studySetId: string, name: string) => {
    // Navigate to test setup screen
    router.push({
      pathname: '/study/test-setup',
      params: {
        name,
        studySetId,
      },
    });
  };

  const handleCardPress = (studySetId: string) => {
    // Navigate to study set detail screen
    router.push({
      pathname: '/study-set/[id]',
      params: {
        id: studySetId,
        studySetId: studySetId,
      },
    });
  };

  const renderContinueLearningCard = ({ item, index }: { item: ContinueLearningItem; index: number }) => {
    const isDone = item.status === 'done';
    const isContinue = item.status === 'continue';
    const isNotStarted = item.status === 'not_started';
    
    // Xác định text button dựa trên status
    let buttonText = 'Bắt đầu học';
    if (isDone) {
      buttonText = 'Bắt đầu làm bài kiểm tra';
    } else if (isContinue) {
      buttonText = 'Tiếp tục học';
    } else if (isNotStarted) {
      buttonText = 'Bắt đầu học';
    }
    
    return (
      <View style={[styles.continueCard, { width: CARD_WIDTH }]}>
        {/* Header với tên và menu */}
        <View style={styles.cardHeader}>
          <ThemedText type="title" style={styles.cardTitle}>{item.name}</ThemedText>
          <Pressable style={styles.menuButton}>
            <IconSymbol
              name="ellipsis"
              size={20}
              color={Colors[colorScheme ?? 'dark'].icon}
            />
          </Pressable>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBarBg, { backgroundColor: Colors[colorScheme ?? 'dark'].searchBackground }]}>
            <View
              style={[
                styles.progressBar,
                {
                  width: `${item.progress}%`,
                  backgroundColor: isDone ? '#34C759' : '#4255FF',
                },
              ]}
            />
          </View>
        </View>

        {/* Status Text */}
        <View style={styles.statusContainer}>
          <ThemedText style={styles.statusText}>
            {isDone ? 'Đã hoàn thành tất cả các câu hỏi' : `${item.completedCards}/${item.totalCards} thẻ đã học`}
          </ThemedText>
          {isDone && <ThemedText style={styles.emoji}>🎉</ThemedText>}
        </View>

        {/* Action Button */}
        <Pressable
          style={[
            styles.startButton,
            { backgroundColor: Colors[colorScheme ?? 'dark'].tint },
          ]}
          onPress={() => {
            if (isDone) {
              handleStartTest(item.studySetId, item.name);
            } else {
              // Navigate to flashcard screen với cards từ vocabularies
              const cards = item.vocabularies?.map((vocab) => ({
                id: vocab._id,
                front: vocab.word,
                back: vocab.definition,
                vocabularyId: vocab._id,
              })) || [];
              
              router.push({
                pathname: '/study/flashcard',
                params: {
                  name: item.name,
                  studySetId: item.studySetId,
                  cards: JSON.stringify(cards),
                },
              });
            }
          }}
        >
          <ThemedText style={styles.startButtonText}>
            {buttonText}
          </ThemedText>
        </Pressable>
      </View>
    );
  };

  const renderRecentItem = ({ item }: { item: RecentStudySetItem }) => {
    return (
      <Pressable
        style={[
          styles.recentItem,
          { backgroundColor: Colors[colorScheme ?? 'dark'].cardBackground },
        ]}
        onPress={() => handleCardPress(item.studySetId)}
      >
        <View style={styles.recentItemLeft}>
          <View style={[styles.recentIcon, { backgroundColor: Colors[colorScheme ?? 'dark'].searchBackground }]}>
            <IconSymbol
              name="doc.text.fill"
              size={24}
              color={Colors[colorScheme ?? 'dark'].tint}
            />
          </View>
        </View>
        <View style={styles.recentItemContent}>
          <ThemedText type="defaultSemiBold" style={styles.recentItemTitle}>
            {item.name}
          </ThemedText>
          <ThemedText style={styles.recentItemSubtitle}>
            {item.totalCards} thẻ • Tác giả: {item.author}
          </ThemedText>
        </View>
        <View style={styles.recentItemRight}>
          <IconSymbol
            name="chevron.right"
            size={20}
            color={Colors[colorScheme ?? 'dark'].icon}
          />
        </View>
      </Pressable>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <AppHeader searchPlaceholder="Tìm kiếm" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: headerHeight + 16,
            paddingBottom: tabBarHeight + 20,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Học tiếp Section */}
        <View style={styles.section}>
          <ThemedText type="title" style={styles.sectionTitle}>
            Học tiếp
          </ThemedText>
          
          {loadingContinue ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={Colors[colorScheme ?? 'dark'].tint} />
              <ThemedText style={styles.loadingText}>Đang tải...</ThemedText>
            </View>
          ) : continueLearning.length === 0 ? (
            <View style={styles.emptyContainer}>
              <ThemedText style={styles.emptyText}>Chưa có học phần nào đang học</ThemedText>
            </View>
          ) : (
            <>
              <FlatList
                ref={flatListRef}
                data={continueLearning}
                renderItem={renderContinueLearningCard}
                keyExtractor={(item) => item.studySetId}
                horizontal
                pagingEnabled={false}
                snapToInterval={CARD_WIDTH + CARD_SPACING}
                snapToAlignment="start"
                decelerationRate="fast"
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.continueListContent}
                onScroll={(event) => {
                  const offset = event.nativeEvent.contentOffset.x;
                  const index = Math.round(offset / (CARD_WIDTH + CARD_SPACING));
                  const newIndex = Math.max(0, Math.min(index, continueLearning.length - 1));
                  if (newIndex !== currentCardIndex) {
                    setCurrentCardIndex(newIndex);
                  }
                }}
                scrollEventThrottle={16}
                onMomentumScrollEnd={(event) => {
                  const offset = event.nativeEvent.contentOffset.x;
                  const index = Math.round(offset / (CARD_WIDTH + CARD_SPACING));
                  const newIndex = Math.max(0, Math.min(index, continueLearning.length - 1));
                  setCurrentCardIndex(newIndex);
                }}
              />

              {/* Pagination Dots */}
              <View style={styles.paginationContainer}>
                {continueLearning.map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.paginationDot,
                      {
                        backgroundColor:
                          index === currentCardIndex
                            ? Colors[colorScheme ?? 'dark'].text
                            : Colors[colorScheme ?? 'dark'].searchBackground,
                      },
                    ]}
                  />
                ))}
              </View>
            </>
          )}
        </View>

        {/* Gần đây Section */}
        <View style={styles.section}>
          <ThemedText type="title" style={styles.sectionTitle}>
            Gần đây
          </ThemedText>
          
          {loadingRecent ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={Colors[colorScheme ?? 'dark'].tint} />
              <ThemedText style={styles.loadingText}>Đang tải...</ThemedText>
            </View>
          ) : recentStudySets.length === 0 ? (
            <View style={styles.emptyContainer}>
              <ThemedText style={styles.emptyText}>Chưa có học phần nào gần đây</ThemedText>
            </View>
          ) : (
            <View style={styles.recentList}>
              {recentStudySets.map((item) => (
                <View key={item.studySetId}>
                  {renderRecentItem({ item })}
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  // Continue Learning Card Styles
  continueListContent: {
    paddingRight: CARD_SPACING,
  },
  continueCard: {
    backgroundColor: '#1A1B2E',
    borderRadius: 16,
    padding: 20,
    marginRight: CARD_SPACING,
    minHeight: 200,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  menuButton: {
    padding: 4,
  },
  progressBarContainer: {
    marginBottom: 12,
  },
  progressBarBg: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 8,
  },
  statusText: {
    fontSize: 14,
    opacity: 0.8,
  },
  emoji: {
    fontSize: 16,
  },
  startButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  // Recent Section Styles
  recentList: {
    gap: 12,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  recentItemLeft: {
    marginRight: 0,
  },
  recentIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recentItemContent: {
    flex: 1,
  },
  recentItemTitle: {
    fontSize: 16,
    marginBottom: 4,
  },
  recentItemSubtitle: {
    fontSize: 14,
    opacity: 0.7,
  },
  recentItemRight: {
    marginLeft: 8,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    opacity: 0.7,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
    opacity: 0.7,
  },
});
