import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { mockFlashcardData, mockStudySets } from '@/constants/mock-data';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { StudySet } from '@/types';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, FlatList, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HORIZONTAL_PADDING = 20;
const CARD_WIDTH = SCREEN_WIDTH - (HORIZONTAL_PADDING * 2);
const CARD_SPACING = 16;
const CARD_ITEM_WIDTH = CARD_WIDTH + CARD_SPACING;

interface Term {
  id: string;
  term: string; // Thuật ngữ
  definition: string; // Định nghĩa
}

interface StudyMode {
  id: string;
  name: string;
  icon: string;
}

const STUDY_MODES: StudyMode[] = [
  {
    id: 'flashcard',
    name: 'Flashcard',
    icon: 'doc.text.fill',
  },
  {
    id: 'practice-questions',
    name: 'Câu hỏi ôn tập',
    icon: 'arrow.left',
  },
  {
    id: 'practice-test',
    name: 'Đề thi thử',
    icon: 'doc.text.fill',
  },
  {
    id: 'match',
    name: 'Nối 2 mặt thẻ',
    icon: 'doc.text.fill',
  },
];

export default function StudySetDetailScreen() {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const studySetId = (params.id as string) || params.studySetId as string || 'studyset1';

  const [studySet, setStudySet] = useState<StudySet | null>(null);
  const [terms, setTerms] = useState<Term[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set());
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    loadStudySet();
  }, [studySetId]);

  const loadStudySet = () => {
    // Tìm study set
    const found = mockStudySets.find((s) => s._id === studySetId);
    setStudySet(found || mockStudySets[0]);

    // Tạo terms từ flashcard data
    const cards = mockFlashcardData[studySetId as keyof typeof mockFlashcardData] || 
                  mockFlashcardData['studyset6'] || [];
    
    const generatedTerms: Term[] = cards.map((card) => ({
      id: card.id,
      term: card.front,
      definition: card.back,
    }));

    // Nếu không có cards, tạo mock data
    if (generatedTerms.length === 0) {
      setTerms([
        { id: '1', term: 'Học phần', definition: 'Trên Quizlet, nội dung học được phân bổ thành nhiều học phần với các thuật ngữ và định nghĩa. Bạn có thể tạo học phần của riêng mình hoặc tìm học phần có sẵn.' },
        { id: '2', term: 'Học phần sơ đồ', definition: 'Học phần sơ đồ cho phép bạn gắn thuật ngữ với các phần của một hình ảnh. Đây là cách lý tưởng để học giải phẫu, địa lý và nhiều nội dung khác.' },
        { id: '3', term: 'Thẻ ghi nhớ (hoạt động học)', definition: 'Thẻ ghi nhớ là một trong những cách học hiệu quả nhất để ghi nhớ thông tin.' },
        { id: '4', term: 'Thuật ngữ', definition: 'Một từ hoặc cụm từ được sử dụng trong một lĩnh vực cụ thể.' },
        { id: '5', term: 'Định nghĩa', definition: 'Giải thích ý nghĩa của một từ hoặc cụm từ.' },
      ]);
    } else {
      setTerms(generatedTerms);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleBookmark = () => {
    // TODO: Toggle bookmark
    console.log('Bookmark');
  };

  const handleMenu = () => {
    // TODO: Show menu
    console.log('Menu');
  };

  const handleDownload = () => {
    // TODO: Download study set
    console.log('Download');
  };

  const handleCardFlip = (termId: string) => {
    const newFlipped = new Set(flippedCards);
    if (newFlipped.has(termId)) {
      newFlipped.delete(termId);
    } else {
      newFlipped.add(termId);
    }
    setFlippedCards(newFlipped);
  };


  const handleStudyMode = (modeId: string) => {
    if (!studySet) return;

    switch (modeId) {
      case 'flashcard':
        const cards = mockFlashcardData[studySetId as keyof typeof mockFlashcardData] || [];
        router.push({
          pathname: '/study/flashcard',
          params: {
            name: studySet.name,
            cards: JSON.stringify(cards),
          },
        });
        break;
      case 'practice-questions':
        router.push({
          pathname: '/study/learn',
          params: {
            name: studySet.name,
            studySetId: studySet._id,
          },
        });
        break;
      case 'practice-test':
        router.push({
          pathname: '/study/test-setup',
          params: {
            name: studySet.name,
            studySetId: studySet._id,
          },
        });
        break;
      case 'match':
        // TODO: Navigate to match game
        console.log('Match game');
        break;
    }
  };

  const StudySetCard = ({ item }: { item: Term }) => {
    const isFlipped = flippedCards.has(item.id);
    const flipAnimation = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      Animated.spring(flipAnimation, {
        toValue: isFlipped ? 1 : 0,
        friction: 8,
        tension: 10,
        useNativeDriver: true,
      }).start();
    }, [isFlipped]);

    const frontInterpolate = flipAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '180deg'],
    });

    const backInterpolate = flipAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: ['180deg', '360deg'],
    });

    return (
      <View style={{ width: CARD_ITEM_WIDTH, alignItems: 'center' }}>
        <Pressable
          style={[styles.studySetCard, { width: CARD_WIDTH }]}
          onPress={() => handleCardFlip(item.id)}
        >
          <View style={styles.cardContent}>
            <Animated.View
              style={[
                styles.cardFace,
                {
                  transform: [{ rotateY: frontInterpolate }],
                  opacity: flipAnimation.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [1, 0, 0],
                  }),
                },
              ]}
            >
              <ThemedText type="title" style={styles.cardText}>
                {item.term}
              </ThemedText>
            </Animated.View>
            
            <Animated.View
              style={[
                styles.cardFace,
                styles.cardBack,
                {
                  transform: [{ rotateY: backInterpolate }],
                  opacity: flipAnimation.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0, 0, 1],
                  }),
                },
              ]}
            >
              <ThemedText style={styles.cardText}>
                {item.definition}
              </ThemedText>
            </Animated.View>
          </View>
          <View style={styles.cardIconContainer}>
            <IconSymbol
              name="doc.text.fill"
              size={20}
              color={Colors[colorScheme ?? 'dark'].icon}
            />
          </View>
        </Pressable>
      </View>
    );
  };

  const renderStudySetCard = ({ item, index }: { item: Term; index: number }) => {
    return <StudySetCard item={item} />;
  };

  const TermCard = ({ item }: { item: Term }) => {
    return (
      <View
        style={[
          styles.termCard,
          { backgroundColor: Colors[colorScheme ?? 'dark'].cardBackground },
        ]}
      >
        <View style={styles.termCardContent}>
          <ThemedText type="defaultSemiBold" style={styles.termTitle}>
            {item.term}
          </ThemedText>
          <ThemedText style={styles.termDefinition}>
            {item.definition}
          </ThemedText>
        </View>
        
        <View style={styles.termCardIcons}>
          <Pressable style={styles.termIconButton}>
            <IconSymbol
              name="camera.fill"
              size={20}
              color={Colors[colorScheme ?? 'dark'].icon}
            />
          </Pressable>
          <Pressable style={styles.termIconButton}>
            <IconSymbol
              name="book.fill"
              size={20}
              color={Colors[colorScheme ?? 'dark'].icon}
            />
          </Pressable>
        </View>
      </View>
    );
  };

  const renderTermCard = ({ item }: { item: Term }) => {
    return <TermCard item={item} />;
  };

  if (!studySet) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Đang tải...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView
      style={[
        styles.container,
        {
          backgroundColor: Colors[colorScheme ?? 'dark'].background,
          paddingTop: insets.top,
        },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.headerButton}>
          <IconSymbol
            name="arrow.left"
            size={24}
            color={Colors[colorScheme ?? 'dark'].text}
          />
        </Pressable>
        
        <View style={styles.headerRight}>
          <Pressable
            style={[styles.headerActionButton, { backgroundColor: Colors[colorScheme ?? 'dark'].cardBackground }]}
            onPress={handleBookmark}
          >
            <IconSymbol
              name="book.fill"
              size={18}
              color={Colors[colorScheme ?? 'dark'].text}
            />
            <IconSymbol
              name="ellipsis"
              size={18}
              color={Colors[colorScheme ?? 'dark'].text}
              style={{ marginLeft: 12 }}
            />
          </Pressable>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 20 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Study Set Card Section */}
        <View style={styles.cardSection}>
          <FlatList
            ref={flatListRef}
            data={terms}
            renderItem={renderStudySetCard}
            keyExtractor={(item) => item.id}
            horizontal
            pagingEnabled={false}
            snapToInterval={CARD_ITEM_WIDTH}
            snapToAlignment="center"
            decelerationRate="fast"
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.cardListContent}
            onScroll={(event) => {
              const offset = event.nativeEvent.contentOffset.x;
              const index = Math.round(offset / CARD_ITEM_WIDTH);
              const newIndex = Math.max(0, Math.min(index, terms.length - 1));
              if (newIndex !== currentCardIndex) {
                setCurrentCardIndex(newIndex);
              }
            }}
            scrollEventThrottle={16}
            onMomentumScrollEnd={(event) => {
              const offset = event.nativeEvent.contentOffset.x;
              const index = Math.round(offset / CARD_ITEM_WIDTH);
              const newIndex = Math.max(0, Math.min(index, terms.length - 1));
              setCurrentCardIndex(newIndex);
            }}
          />

          {/* Pagination Dots */}
          <View style={styles.paginationContainer}>
            {terms.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.paginationDot,
                  {
                    backgroundColor:
                      index === currentCardIndex
                        ? Colors[colorScheme ?? 'dark'].tint
                        : Colors[colorScheme ?? 'dark'].searchBackground,
                  },
                ]}
              />
            ))}
          </View>
        </View>

        {/* Study Set Info */}
        <View style={styles.infoSection}>
          <View style={styles.infoHeader}>
            <ThemedText type="title" style={styles.infoTitle}>
              {studySet.name || 'Thông tin cơ bản về Quizlet'}
            </ThemedText>
            <Pressable onPress={handleDownload}>
              <IconSymbol
                name="arrow.down"
                size={24}
                color={Colors[colorScheme ?? 'dark'].text}
              />
            </Pressable>
          </View>

          <View style={styles.infoDetails}>
            <View style={styles.infoDetailRow}>
              <View style={[styles.authorIcon, { backgroundColor: Colors[colorScheme ?? 'dark'].tint }]}>
                <ThemedText style={styles.authorIconText}>Q</ThemedText>
              </View>
              <ThemedText style={styles.infoText}>Quizlet</ThemedText>
              <IconSymbol
                name="checkmark"
                size={16}
                color="#34C759"
                style={{ marginLeft: 4 }}
              />
              <View style={[styles.separator, { backgroundColor: Colors[colorScheme ?? 'dark'].searchBackground }]} />
              <ThemedText style={styles.infoText}>
                {terms.length} thuật ngữ
              </ThemedText>
            </View>

            {studySet.description && (
              <ThemedText style={styles.description}>
                {studySet.description}
              </ThemedText>
            )}
          </View>
        </View>

        {/* Study Modes */}
        <View style={styles.studyModesSection}>
          {STUDY_MODES.map((mode) => (
            <Pressable
              key={mode.id}
              style={[
                styles.studyModeButton,
                { backgroundColor: Colors[colorScheme ?? 'dark'].cardBackground },
              ]}
              onPress={() => handleStudyMode(mode.id)}
            >
              <View style={[styles.studyModeIcon, { backgroundColor: Colors[colorScheme ?? 'dark'].tint }]}>
                <IconSymbol
                  name={mode.icon as any}
                  size={24}
                  color="#FFFFFF"
                />
              </View>
              <ThemedText style={styles.studyModeText}>{mode.name}</ThemedText>
            </Pressable>
          ))}
        </View>

        {/* Terms List */}
        <View style={styles.termsSection}>
          <View style={styles.termsHeader}>
            <ThemedText type="title" style={styles.termsTitle}>
              Thuật ngữ
            </ThemedText>
            <View style={styles.termsHeaderRight}>
              <ThemedText style={styles.termsOrderText}>Thứ tự gốc</ThemedText>
              <IconSymbol
                name="ellipsis"
                size={20}
                color={Colors[colorScheme ?? 'dark'].icon}
                style={{ marginLeft: 8 }}
              />
            </View>
          </View>

          <View style={styles.termsList}>
            {terms.map((term) => (
              <View key={term.id}>
                {renderTermCard({ item: term })}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  headerButton: {
    padding: 8,
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.dark.cardBackground,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  cardSection: {
    marginBottom: 32,
  },
  cardListContent: {
    paddingVertical: 8,
  },
  studySetCard: {
    backgroundColor: Colors.dark.cardBackground,
    borderRadius: 16,
    padding: 24,
    marginRight: CARD_SPACING,
    minHeight: 200,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  cardContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  cardFace: {
    position: 'absolute',
    width: '100%',
    backfaceVisibility: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardBack: {
    transform: [{ rotateY: '180deg' }],
  },
  cardText: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  cardIconContainer: {
    position: 'absolute',
    bottom: 16,
    right: 16,
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
  infoSection: {
    marginBottom: 32,
  },
  infoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 24,
    fontWeight: '700',
    flex: 1,
  },
  infoDetails: {
    gap: 12,
  },
  infoDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  authorIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  authorIconText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  infoText: {
    fontSize: 16,
  },
  separator: {
    width: 1,
    height: 16,
    marginHorizontal: 8,
  },
  description: {
    fontSize: 14,
    opacity: 0.8,
    marginTop: 4,
  },
  studyModesSection: {
    marginBottom: 32,
    gap: 12,
  },
  studyModeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 16,
  },
  studyModeIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  studyModeText: {
    fontSize: 16,
    fontWeight: '500',
  },
  termsSection: {
    marginBottom: 20,
  },
  termsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  termsTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  termsHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  termsOrderText: {
    fontSize: 14,
    opacity: 0.8,
  },
  termsList: {
    gap: 12,
  },
  termCard: {
    padding: 16,
    borderRadius: 12,
  },
  termCardContent: {
    marginBottom: 12,
  },
  termTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  termDefinition: {
    fontSize: 16,
    lineHeight: 24,
    opacity: 0.9,
  },
  termCardIcons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 12,
  },
  termIconButton: {
    padding: 4,
  },
});

