import { StackCardView } from '@/components/stack-card-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useNavigation } from '@react-navigation/native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useLayoutEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

interface Card {
  id: string;
  front: string;
  back: string;
}

// Mock flashcard data
const MOCK_CARDS: Card[] = [
  {
    id: '1',
    front: 'Serendipity',
    back: 'The occurrence of events by chance in a happy or beneficial way',
  },
  {
    id: '2',
    front: 'Ephemeral',
    back: 'Lasting for a very short time',
  },
  {
    id: '3',
    front: 'Pragmatic',
    back: 'Dealing with things in a realistic and practical way',
  },
  {
    id: '4',
    front: 'Melancholy',
    back: 'A feeling of pensive sadness, typically with no obvious cause',
  },
  {
    id: '5',
    front: 'Obfuscate',
    back: 'To deliberately make something unclear or difficult to understand',
  },
];

export default function FlashcardScreen() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const navigation = useNavigation();
  const params = useLocalSearchParams();
  const studySetName = (params.name as string) || 'Flashcard';
  const cardsJson = (params.cards as string) || '[]';
  
  let parsedCards: Card[] = MOCK_CARDS;
  try {
    const parsed = JSON.parse(cardsJson);
    if (Array.isArray(parsed) && parsed.length > 0) {
      parsedCards = parsed;
    }
  } catch {
    console.log('Could not parse cards from params, using mock data');
  }

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  const [cards] = useState<Card[]>(parsedCards);
  const [unknownCount, setUnknownCount] = useState(0);
  const [knownCount, setKnownCount] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const handleSwipeLeft = (card: Card) => {
    const newUnknownCount = unknownCount + 1;
    setUnknownCount(newUnknownCount);
    checkCompletion(newUnknownCount, knownCount);
    console.log('Swiped left on:', card.front);
  };

  const handleSwipeRight = (card: Card) => {
    const newKnownCount = knownCount + 1;
    setKnownCount(newKnownCount);
    checkCompletion(unknownCount, newKnownCount);
    console.log('Swiped right on:', card.front);
  };

  const checkCompletion = (unknown: number, known: number) => {
    if (unknown + known >= cards.length) {
      setIsCompleted(true);
    }
  };

  const handleExit = () => {
    router.back();
  };

  return (
    <ThemedView
      style={[
        styles.container,
        {
          backgroundColor: Colors[colorScheme ?? 'dark'].background,
        },
      ]}
    >
      {/* Header with Title and Close Button */}
      <View style={styles.headerContainer}>
        <ThemedText style={styles.headerTitle}>{studySetName}</ThemedText>
        <Pressable style={styles.closeButton} onPress={handleExit}>
          <ThemedText style={styles.closeButtonText}>✕</ThemedText>
        </Pressable>
      </View>
      {/* Counter */}
      {!isCompleted && (
        <View style={styles.counterContainer}>
          <View style={styles.counterItem}>
            <View style={styles.counterContent}>
              <ThemedText style={[styles.counterValue, { color: '#FF9500' }]}>{unknownCount}</ThemedText>
              <ThemedText style={[styles.counterLabel, { color: '#FF9500' }]}>Chưa biết</ThemedText>
            </View>
          </View>
          <View style={styles.counterDivider} />
          <View style={styles.counterItem}>
            <View style={styles.counterContent}>
              <ThemedText style={[styles.counterValue, { color: '#34C759' }]}>{knownCount}</ThemedText>
              <ThemedText style={[styles.counterLabel, { color: '#34C759' }]}>Đã biết</ThemedText>
            </View>
          </View>
        </View>
      )}

      {/* Completion Screen */}
      {isCompleted ? (
        <View style={styles.completionContainer}>
        <ThemedText style={styles.completionTitle}>Hoàn thành!</ThemedText>
          {/* Progress Chart */}
          <View style={styles.chartContainer}>
            {/* Unknown Progress */}
            <View style={styles.progressItem}>
              <View style={styles.progressLabelRow}>
                <ThemedText style={styles.progressLabel}>Chưa biết</ThemedText>
                <ThemedText style={[styles.progressValue, { color: '#FF9500' }]}>
                  {unknownCount} ({Math.round((unknownCount / (unknownCount + knownCount)) * 100)}%)
                </ThemedText>
              </View>
              <View style={styles.progressBarBg}>
                <View
                  style={[
                    styles.progressBar,
                    {
                      width: `${(unknownCount / (unknownCount + knownCount)) * 100}%`,
                      backgroundColor: '#FF9500',
                    },
                  ]}
                />
              </View>
            </View>

            {/* Known Progress */}
            <View style={styles.progressItem}>
              <View style={styles.progressLabelRow}>
                <ThemedText style={styles.progressLabel}>Đã biết</ThemedText>
                <ThemedText style={[styles.progressValue, { color: '#34C759' }]}>
                  {knownCount} ({Math.round((knownCount / (unknownCount + knownCount)) * 100)}%)
                </ThemedText>
              </View>
              <View style={styles.progressBarBg}>
                <View
                  style={[
                    styles.progressBar,
                    {
                      width: `${(knownCount / (unknownCount + knownCount)) * 100}%`,
                      backgroundColor: '#34C759',
                    },
                  ]}
                />
              </View>
            </View>
          </View>

          <Pressable
            style={[
              styles.completionButton,
              { backgroundColor: Colors[colorScheme ?? 'dark'].cardBackground },
            ]}
            onPress={handleExit}
          >
            <ThemedText style={styles.completionButtonText}>Quay lại</ThemedText>
          </Pressable>
        </View>
      ) : (
        <>
          {/* Instructions */}
          <View style={styles.instructionsContainer}>
            <ThemedText style={styles.instructionText}>← Vuốt trái: Chưa biết</ThemedText>
            <ThemedText style={styles.instructionText}>Vuốt phải: Đã biết →</ThemedText>
          </View>

          {/* Stack Card Component */}
          <View style={styles.cardContainer}>
            <StackCardView cards={cards} onSwipeLeft={handleSwipeLeft} onSwipeRight={handleSwipeRight} />
          </View>
        </>
      )}

    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingTop: 24,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 28,
    fontWeight: '300',
    lineHeight: 28,
  },
  counterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
  },
  counterItem: {
    flex: 1,
    alignItems: 'center',
  },
  counterContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  counterLabel: {
    fontSize: 12,
    opacity: 0.7,
  },
  counterValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  counterDivider: {
    width: 1,
    height: 40,
    opacity: 0.3,
    marginHorizontal: 12,
  },
  cardContainer: {
    flex: 1,
    marginVertical: 20,
  },
  instructionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  instructionText: {
    fontSize: 12,
    opacity: 0.6,
  },
  // Completion screen styles
  completionContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingVertical: 40,
    paddingHorizontal: 24,
  },
  chartContainer: {
    width: '100%',
    marginBottom: 40,
    paddingHorizontal: 0,
  },
  chartTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 24,
    textAlign: 'left',
  },
  progressItem: {
    marginBottom: 24,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  progressValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  progressBarBg: {
    height: 16,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  progressBar: {
    height: '100%',
    borderRadius: 8,
  },
  completionTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 32,
    textAlign: 'left',
    paddingHorizontal: 0,
  },
  completionButton: {
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  completionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
