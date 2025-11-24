import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Card {
  id: string;
  front: string;
  back: string;
}

interface MatchItem {
  id: string;
  text: string;
  type: 'left' | 'right';
  cardId: string;
  matched?: boolean;
  matchedWith?: string;
}

export default function MatchScreen() {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  
  const name = (params.name as string) || 'Nối 2 mặt thẻ';
  const cardsJson = (params.cards as string) || '[]';
  const [cards, setCards] = useState<Card[]>([]);
  const [leftItems, setLeftItems] = useState<MatchItem[]>([]);
  const [rightItems, setRightItems] = useState<MatchItem[]>([]);
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [selectedRight, setSelectedRight] = useState<string | null>(null);
  const [matches, setMatches] = useState<Set<string>>(new Set());
  const [completedCount, setCompletedCount] = useState(0);
  const [wrongMatch, setWrongMatch] = useState<{ left: string; right: string } | null>(null);
  const [correctMatch, setCorrectMatch] = useState<{ left: string; right: string } | null>(null);
  const [correctAttempts, setCorrectAttempts] = useState(0);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    try {
      const parsedCards = JSON.parse(cardsJson);
      // Take only first 5 cards
      const limitedCards = parsedCards.slice(0, 5);
      setCards(limitedCards);
      initializeItems(limitedCards);
    } catch (error) {
      console.error('Error parsing cards:', error);
    }
  }, [cardsJson]);

  useEffect(() => {
    if (completedCount === cards.length && cards.length > 0) {
      return; // Stop timer when completed
    }

    const interval = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [completedCount, cards.length]);

  const initializeItems = (cardsData: Card[]) => {
    // Create left items (fronts) and right items (backs) shuffled
    const left: MatchItem[] = cardsData.map((card) => ({
      id: `left-${card.id}`,
      text: card.front,
      type: 'left',
      cardId: card.id,
    }));

    const right: MatchItem[] = cardsData.map((card) => ({
      id: `right-${card.id}`,
      text: card.back,
      type: 'right',
      cardId: card.id,
    }));

    // Shuffle right items
    const shuffledRight = [...right].sort(() => Math.random() - 0.5);

    setLeftItems(left);
    setRightItems(shuffledRight);
  };

  const handleSelectItem = (itemId: string) => {
    // Prevent interaction while showing feedback
    if (wrongMatch || correctMatch) {
      return;
    }

    const isLeft = itemId.startsWith('left');
    const baseId = itemId.replace('left-', '').replace('right-', '');

    if (matches.has(baseId)) {
      return; // Already matched
    }

    // Don't allow selecting same item twice
    if (isLeft && selectedLeft === itemId) {
      setSelectedLeft(null);
      return;
    }
    if (!isLeft && selectedRight === itemId) {
      setSelectedRight(null);
      return;
    }

    // Update selection
    let newSelectedLeft = selectedLeft;
    let newSelectedRight = selectedRight;

    if (isLeft) {
      newSelectedLeft = itemId;
    } else {
      newSelectedRight = itemId;
    }

    // Check if both sides are selected
    if (newSelectedLeft && newSelectedRight) {
      const leftCardId = newSelectedLeft.replace('left-', '');
      const rightCardId = newSelectedRight.replace('right-', '');

      if (leftCardId === rightCardId) {
        // Correct match
        setCorrectAttempts((prev) => prev + 1);
        setCorrectMatch({ left: newSelectedLeft, right: newSelectedRight });
        setTimeout(() => {
          const newMatches = new Set(matches);
          newMatches.add(leftCardId);
          setMatches(newMatches);
          setCompletedCount((prev) => prev + 1);
          setSelectedLeft(null);
          setSelectedRight(null);
          setCorrectMatch(null);
        }, 600);
      } else {
        // Wrong match - show error and deselect after delay
        setWrongAttempts((prev) => prev + 1);
        setWrongMatch({ left: newSelectedLeft, right: newSelectedRight });
        setTimeout(() => {
          setSelectedLeft(null);
          setSelectedRight(null);
          setWrongMatch(null);
        }, 600);
      }
    } else {
      // Just update the selection
      if (isLeft) {
        setSelectedLeft(newSelectedLeft);
      } else {
        setSelectedRight(newSelectedRight);
      }
    }
  };

  const handleBack = () => {
    router.back();
  };

  const isCompleted = completedCount === cards.length;

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
        <Pressable onPress={handleBack} style={styles.backButton}>
          <IconSymbol
            name="arrow.left"
            size={24}
            color={Colors[colorScheme ?? 'dark'].text}
          />
        </Pressable>
        <ThemedText type="title" style={styles.title}>
          {name}
        </ThemedText>
        <View style={{ width: 40 }} />
      </View>

      {/* Progress */}
      <View style={styles.progressSection}>
        <ThemedText style={styles.progressText}>
          {completedCount} / {cards.length}
        </ThemedText>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${(completedCount / cards.length) * 100}%`,
                backgroundColor: Colors[colorScheme ?? 'dark'].tint,
              },
            ]}
          />
        </View>
      </View>

      {isCompleted ? (
        // Completion Screen
        <View style={styles.completionContainer}>
          <View style={styles.completionContent}>
            <ThemedText style={styles.completionTitle}>Hoàn thành!</ThemedText>
            <ThemedText style={styles.completionSubtitle}>
              Bạn đã nối đúng tất cả {cards.length} cặp
            </ThemedText>
          </View>
          <View style={styles.completionBottom}>
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <ThemedText style={styles.statLabel}>Chọn đúng</ThemedText>
                <ThemedText style={[styles.statValue, { color: '#34C759' }]}>
                  {correctAttempts}
                </ThemedText>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <ThemedText style={styles.statLabel}>Chọn sai</ThemedText>
                <ThemedText style={[styles.statValue, { color: '#FF9999' }]}>
                  {wrongAttempts}
                </ThemedText>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <ThemedText style={styles.statLabel}>Thời gian</ThemedText>
                <ThemedText style={[styles.statValue, { color: Colors[colorScheme ?? 'dark'].tint }]}>
                  {Math.floor(elapsedTime / 60)}:{String(elapsedTime % 60).padStart(2, '0')}
                </ThemedText>
              </View>
            </View>
            <Pressable
              style={[
                styles.completionButton,
                { backgroundColor: Colors[colorScheme ?? 'dark'].tint, width: '100%' },
              ]}
              onPress={handleBack}
            >
              <ThemedText style={styles.completionButtonText}>Quay lại</ThemedText>
            </Pressable>
          </View>
        </View>
      ) : (
        // Game Content
        <View
          style={styles.gameContainer}
        >
          <View style={styles.gameContent}>
            {/* Left Column */}
            <View style={styles.column}>
              {leftItems.map((item) => {
                const isMatched = matches.has(item.cardId);
                const isSelected = selectedLeft === item.id;
                const isWrong = wrongMatch?.left === item.id;
                const isCorrect = correctMatch?.left === item.id;

                return (
                  <Pressable
                    key={item.id}
                    style={[
                      styles.matchItem,
                      {
                        backgroundColor: isMatched
                          ? Colors[colorScheme ?? 'dark'].searchBackground
                          : Colors[colorScheme ?? 'dark'].cardBackground,
                        borderWidth: isWrong ? 2 : isSelected ? 2 : isCorrect ? 2 : 0,
                        borderColor: isWrong ? '#FF9999' : isCorrect ? '#34C759' : Colors[colorScheme ?? 'dark'].tint,
                      },
                      isMatched && styles.matchedItem,
                    ]}
                    onPress={() => !isMatched && handleSelectItem(item.id)}
                    disabled={isMatched}
                  >
                    <ThemedText
                      style={[
                        styles.matchItemText,
                        {
                          color: isMatched
                            ? Colors[colorScheme ?? 'dark'].text + '66'
                            : isWrong
                            ? '#FF9999'
                            : isCorrect
                            ? '#34C759'
                            : Colors[colorScheme ?? 'dark'].text,
                        },
                      ]}
                    >
                      {item.text}
                    </ThemedText>
                    {isMatched && (
                      <IconSymbol
                        name="checkmark.circle.fill"
                        size={20}
                        color="#34C759"
                        style={{ position: 'absolute', right: 12 }}
                      />
                    )}
                    {isWrong && (
                      <IconSymbol
                        name="xmark.circle.fill"
                        size={20}
                        color="#FF9999"
                        style={{ position: 'absolute', right: 12 }}
                      />
                    )}
                    {isCorrect && (
                      <IconSymbol
                        name="checkmark.circle.fill"
                        size={20}
                        color="#34C759"
                        style={{ position: 'absolute', right: 12 }}
                      />
                    )}
                  </Pressable>
                );
              })}
            </View>

            {/* Right Column */}
            <View style={styles.column}>
              {rightItems.map((item) => {
                const isMatched = matches.has(item.cardId);
                const isSelected = selectedRight === item.id;
                const isWrong = wrongMatch?.right === item.id;
                const isCorrect = correctMatch?.right === item.id;

                return (
                  <Pressable
                    key={item.id}
                    style={[
                      styles.matchItem,
                      {
                        backgroundColor: isMatched
                          ? Colors[colorScheme ?? 'dark'].searchBackground
                          : Colors[colorScheme ?? 'dark'].cardBackground,
                        borderWidth: isWrong ? 2 : isSelected ? 2 : isCorrect ? 2 : 0,
                        borderColor: isWrong ? '#FF9999' : isCorrect ? '#34C759' : Colors[colorScheme ?? 'dark'].tint,
                      },
                      isMatched && styles.matchedItem,
                    ]}
                    onPress={() => !isMatched && handleSelectItem(item.id)}
                    disabled={isMatched}
                  >
                    <ThemedText
                      style={[
                        styles.matchItemText,
                        {
                          color: isMatched
                            ? Colors[colorScheme ?? 'dark'].text + '66'
                            : isWrong
                            ? '#FF9999'
                            : isCorrect
                            ? '#34C759'
                            : Colors[colorScheme ?? 'dark'].text,
                        },
                      ]}
                    >
                      {item.text}
                    </ThemedText>
                    {isMatched && (
                      <IconSymbol
                        name="checkmark.circle.fill"
                        size={20}
                        color="#34C759"
                        style={{ position: 'absolute', right: 12 }}
                      />
                    )}
                    {isWrong && (
                      <IconSymbol
                        name="xmark.circle.fill"
                        size={20}
                        color="#FF9999"
                        style={{ position: 'absolute', right: 12 }}
                      />
                    )}
                    {isCorrect && (
                      <IconSymbol
                        name="checkmark.circle.fill"
                        size={20}
                        color="#34C759"
                        style={{ position: 'absolute', right: 12 }}
                      />
                    )}
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>
      )}
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
  backButton: {
    padding: 8,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
  },
  progressSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 8,
  },
  progressText: {
    fontSize: 14,
    opacity: 0.7,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  gameContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  gameContent: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 16,
    flex: 1,
  },
  column: {
    flex: 1,
    gap: 12,
    justifyContent: 'space-between',
  },
  matchItem: {
    padding: 16,
    borderRadius: 12,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  matchedItem: {
    opacity: 0.5,
  },
  matchItemText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  completionContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  completionContent: {
    alignItems: 'center',
    gap: 12,
  },
  completionBottom: {
    gap: 16,
  },
  completionTitle: {
    fontSize: 32,
    fontWeight: '700',
  },
  completionSubtitle: {
    fontSize: 16,
    opacity: 0.7,
  },
  completionButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 26,
  },
  completionButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    gap: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
});
