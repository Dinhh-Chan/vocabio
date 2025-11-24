import { AppHeader } from '@/components/app-header';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { mockContinueLearning, mockRecentStudySets } from '@/constants/mock-data';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useHeaderHeight } from '@/hooks/use-header-height';
import { useTabBarHeight } from '@/hooks/use-tab-bar-height';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { Dimensions, FlatList, Pressable, ScrollView, StyleSheet, View } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HORIZONTAL_PADDING = 20; // Padding từ scrollContent
const CARD_WIDTH = SCREEN_WIDTH - (HORIZONTAL_PADDING * 2); // Card width với padding
const CARD_SPACING = 16;

export default function HomeScreen() {
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useTabBarHeight();
  const colorScheme = useColorScheme();
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

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

  const renderContinueLearningCard = ({ item, index }: { item: typeof mockContinueLearning[0]; index: number }) => {
    const isCompleted = item.status === 'completed';
    
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
                  backgroundColor: isCompleted ? '#34C759' : '#4255FF',
                },
              ]}
            />
          </View>
        </View>

        {/* Status Text */}
        <View style={styles.statusContainer}>
          <ThemedText style={styles.statusText}>
            {isCompleted ? 'Đã hoàn thành tất cả các câu hỏi' : `${item.completedCards}/${item.totalCards} thẻ đã học`}
          </ThemedText>
          {isCompleted && <ThemedText style={styles.emoji}>🎉</ThemedText>}
        </View>

        {/* Start Test Button */}
        <Pressable
          style={[
            styles.startButton,
            { backgroundColor: Colors[colorScheme ?? 'dark'].tint },
          ]}
          onPress={() => {
            if (isCompleted) {
              handleStartTest(item.studySetId, item.name);
            } else {
              // Navigate to learn screen
              router.push({
                pathname: '/study/learn',
                params: {
                  name: item.name,
                  studySetId: item.studySetId,
                },
              });
            }
          }}
        >
          <ThemedText style={styles.startButtonText}>
            {isCompleted ? 'Bắt đầu bài kiểm tra' : 'Tiếp tục học'}
          </ThemedText>
        </Pressable>
      </View>
    );
  };

  const renderRecentItem = ({ item }: { item: typeof mockRecentStudySets[0] }) => {
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
          
          <FlatList
            ref={flatListRef}
            data={mockContinueLearning}
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
              const newIndex = Math.max(0, Math.min(index, mockContinueLearning.length - 1));
              if (newIndex !== currentCardIndex) {
                setCurrentCardIndex(newIndex);
              }
            }}
            scrollEventThrottle={16}
            onMomentumScrollEnd={(event) => {
              const offset = event.nativeEvent.contentOffset.x;
              const index = Math.round(offset / (CARD_WIDTH + CARD_SPACING));
              const newIndex = Math.max(0, Math.min(index, mockContinueLearning.length - 1));
              setCurrentCardIndex(newIndex);
            }}
          />

          {/* Pagination Dots */}
          <View style={styles.paginationContainer}>
            {mockContinueLearning.map((_, index) => (
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
        </View>

        {/* Gần đây Section */}
        <View style={styles.section}>
          <ThemedText type="title" style={styles.sectionTitle}>
            Gần đây
          </ThemedText>
          
          <View style={styles.recentList}>
            {mockRecentStudySets.map((item) => (
              <View key={item.studySetId}>
                {renderRecentItem({ item })}
              </View>
            ))}
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
});
