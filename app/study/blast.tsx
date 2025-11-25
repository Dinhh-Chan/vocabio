import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Card {
  id: string;
  front: string;
  back: string;
}

interface Bubble {
  id: string;
  x: number;
  y: number;
  text: string;
  isCorrect: boolean;
  offsetY: number;
  offsetX?: number;
  vx: number; // velocity x
  vy: number; // velocity y
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const BUBBLE_RADIUS = 65;
const GUN_Y = screenHeight - 100;

export default function BlastScreen() {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams();
  const cardsParam = params.cards as string;
  const name = params.name as string;

  const [cards, setCards] = useState<Card[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Card | null>(null);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [feedbackBubble, setFeedbackBubble] = useState<{ id: string; isCorrect: boolean } | null>(null);
  const [targetedBubble, setTargetedBubble] = useState<string | null>(null);
  const [laserTarget, setLaserTarget] = useState<{ x: number; y: number } | null>(null);
  const [isShooting, setIsShooting] = useState(false);

  const laserOpacity = useSharedValue(0);
  const laserLength = useSharedValue(0);
  const glowScale = useSharedValue(1);

  // Initialize cards
  useEffect(() => {
    if (cardsParam) {
      const parsed = JSON.parse(cardsParam);
      const selected = parsed.slice(0, 5);
      setCards(selected);
      if (selected.length > 0) {
        setCurrentQuestion(selected[0]);
        generateBubbles(selected);
      }
    }
  }, [cardsParam]);

  // Timer
  useEffect(() => {
    if (gameOver) return;
    const timer = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [gameOver]);

  // Floating animation for bubbles
  useEffect(() => {
    const floatInterval = setInterval(() => {
      setBubbles((prevBubbles) => {
        const updated = prevBubbles.map((bubble) => {
          let newX = bubble.x + bubble.vx;
          let newY = bubble.y + bubble.vy;
          let newVx = bubble.vx;
          let newVy = bubble.vy;

          // Bounce off edges
          if (newX - BUBBLE_RADIUS < 0 || newX + BUBBLE_RADIUS > screenWidth) {
            newVx = -newVx;
            newX = Math.max(BUBBLE_RADIUS, Math.min(screenWidth - BUBBLE_RADIUS, newX));
          }
          if (newY - BUBBLE_RADIUS < 100 || newY + BUBBLE_RADIUS > screenHeight * 0.7) {
            newVy = -newVy;
            newY = Math.max(BUBBLE_RADIUS + 100, Math.min(screenHeight * 0.7 - BUBBLE_RADIUS, newY));
          }

          return {
            ...bubble,
            x: newX,
            y: newY,
            vx: newVx,
            vy: newVy,
            offsetY: 0,
            offsetX: 0,
          };
        });

        // Collision detection and resolution
        for (let i = 0; i < updated.length; i++) {
          for (let j = i + 1; j < updated.length; j++) {
            const dx = updated[j].x - updated[i].x;
            const dy = updated[j].y - updated[i].y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const minDistance = BUBBLE_RADIUS * 2 + 5;

            if (distance < minDistance) {
              // Bubbles are colliding - separate them
              const angle = Math.atan2(dy, dx);
              const sin = Math.sin(angle);
              const cos = Math.cos(angle);

              // Overlap amount
              const overlap = minDistance - distance;
              const moveX = (overlap / 2) * cos;
              const moveY = (overlap / 2) * sin;

              // Push bubbles apart
              updated[i].x -= moveX;
              updated[i].y -= moveY;
              updated[j].x += moveX;
              updated[j].y += moveY;

              // Bounce velocities
              const vx1 = updated[i].vx;
              const vy1 = updated[i].vy;
              const vx2 = updated[j].vx;
              const vy2 = updated[j].vy;

              // Swap velocity components along collision angle
              updated[i].vx = (vx1 * (1 - cos * cos) - vy1 * sin * cos) + (vx2 - vy2 * sin * cos) * cos * cos;
              updated[i].vy = (vy1 * (1 - sin * sin) - vx1 * sin * cos) + (vy2 - vx2 * sin * cos) * sin * sin;
              updated[j].vx = (vx2 * (1 - cos * cos) - vy2 * sin * cos) + (vx1 - vy1 * sin * cos) * cos * cos;
              updated[j].vy = (vy2 * (1 - sin * sin) - vx2 * sin * cos) + (vy1 - vx1 * sin * cos) * sin * sin;
            }
          }
        }

        return updated;
      });
    }, 30);
    return () => clearInterval(floatInterval);
  }, []);

  // Glow animation for targeted bubble
  useEffect(() => {
    if (targetedBubble) {
      glowScale.value = withRepeat(
        withSequence(
          withTiming(1.15, { duration: 500, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 500, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      );
    } else {
      glowScale.value = withTiming(1, { duration: 200 });
    }
  }, [targetedBubble]);

  const generateBubbles = (cardsList: Card[]) => {
    if (cardsList.length === 0) return;

    const currentCard = cardsList[0];
    const allAnswers = cardsList.map((c) => ({
      text: c.back,
      isCorrect: c.id === currentCard.id,
      id: c.id,
    }));

    // Shuffle answers
    const shuffled = allAnswers.sort(() => Math.random() - 0.5);

    // Generate random positions for bubbles with better spacing
    const newBubbles: Bubble[] = [];
    const padding = BUBBLE_RADIUS * 2 + 20;
    const cols = Math.floor(screenWidth / padding);
    const rows = Math.floor((screenHeight * 0.6) / padding);
    
    // Create grid positions and shuffle
    const positions: { x: number; y: number }[] = [];
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = col * padding + BUBBLE_RADIUS + 20;
        const y = row * padding + BUBBLE_RADIUS + 150;
        if (x < screenWidth - BUBBLE_RADIUS && y < screenHeight * 0.6 + 150) {
          positions.push({ x, y });
        }
      }
    }
    
    // Shuffle positions and use them
    positions.sort(() => Math.random() - 0.5);

    shuffled.forEach((answer, index) => {
      const pos = positions[index] || {
        x: Math.random() * (screenWidth - BUBBLE_RADIUS * 2) + BUBBLE_RADIUS,
        y: Math.random() * (screenHeight * 0.5 - BUBBLE_RADIUS * 2) + 150 + BUBBLE_RADIUS,
      };

      // Random velocity for each bubble
      const angle = (Math.random() * Math.PI * 2);
      const speed = 1.5 + Math.random() * 2;

      newBubbles.push({
        id: answer.id,
        x: pos.x,
        y: pos.y,
        text: answer.text,
        isCorrect: answer.isCorrect,
        offsetY: 0,
        offsetX: 0,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
      });
    });

    setBubbles(newBubbles);
  };

  const handleBubblePress = (bubble: Bubble) => {
    if (isShooting || feedbackBubble) return;

    setTargetedBubble(bubble.id);
    setIsShooting(true);
    
    const gunX = screenWidth / 2;
    const gunY = GUN_Y;
    const dx = bubble.x - gunX;
    const dy = bubble.y - gunY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    setLaserTarget({ x: bubble.x, y: bubble.y });

    // Reset and animate laser
    laserLength.value = 0;
    laserOpacity.value = 1;

    laserLength.value = withTiming(
      distance,
      { duration: 200, easing: Easing.out(Easing.quad) },
      (finished) => {
        if (finished) {
          // Process hit
          setFeedbackBubble({ id: bubble.id, isCorrect: bubble.isCorrect });
          setTargetedBubble(null);
          
          if (bubble.isCorrect) {
            setScore((prev) => prev + 100);
            setCorrectCount((prev) => prev + 1);

            setTimeout(() => {
              setFeedbackBubble(null);
              setLaserTarget(null);
              setIsShooting(false);
              laserOpacity.value = 0;
              
              const nextIndex = cards.findIndex((c) => c.id === currentQuestion?.id) + 1;
              if (nextIndex < cards.length) {
                setCurrentQuestion(cards[nextIndex]);
                generateBubbles(cards.slice(nextIndex));
              } else {
                setGameOver(true);
              }
            }, 500);
          } else {
            setScore((prev) => Math.max(0, prev - 20));
            setWrongCount((prev) => prev + 1);
            
            setTimeout(() => {
              setFeedbackBubble(null);
              setTargetedBubble(null);
              setLaserTarget(null);
              setIsShooting(false);
              laserOpacity.value = 0;
            }, 500);
          }
        }
      }
    );
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleBack = () => {
    router.back();
  };

  // Laser animated style
  const laserStyle = useAnimatedStyle(() => {
    if (!laserTarget) return { opacity: 0 };

    const gunX = screenWidth / 2;
    const gunY = GUN_Y;
    const dx = laserTarget.x - gunX;
    const dy = laserTarget.y - gunY;
    const angle = Math.atan2(dy, dx);
    const currentLen = laserLength.value;

    const centerX = gunX + Math.cos(angle) * currentLen / 2;
    const centerY = gunY + Math.sin(angle) * currentLen / 2;

    return {
      position: 'absolute',
      left: centerX - currentLen / 2,
      top: centerY - 1,
      width: currentLen,
      height: 2,
      backgroundColor: '#FFFFFF',
      opacity: laserOpacity.value,
      transform: [{ rotate: `${angle}rad` }],
      zIndex: 10,
    };
  });

  // Glow effect style for targeted bubble
  const glowStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: glowScale.value }],
    };
  });

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: Colors[colorScheme ?? 'dark'].cardBackground,
            paddingTop: insets.top + 8,
          },
        ]}
      >
        <View style={styles.headerLeft}>
          <View style={[styles.rocketIcon, { backgroundColor: '#007AFF' }]}>
            <IconSymbol name="paperplane.fill" size={20} color="#FFFFFF" />
          </View>
        </View>
        
        <View style={styles.headerRight}>
          <Pressable style={styles.headerIconButton}>
            <IconSymbol name="speaker.wave.2.fill" size={20} color={Colors[colorScheme ?? 'dark'].text} />
          </Pressable>
          <Pressable style={styles.headerIconButton}>
            <IconSymbol name="trophy.fill" size={20} color={Colors[colorScheme ?? 'dark'].text} />
          </Pressable>
          <Pressable onPress={handleBack} style={styles.headerIconButton}>
            <IconSymbol name="xmark" size={20} color={Colors[colorScheme ?? 'dark'].text} />
          </Pressable>
        </View>
      </View>

      {/* Question */}
      {currentQuestion && !gameOver && (
        <View style={styles.questionSection}>
          <View
            style={[
              styles.questionBox,
              { backgroundColor: '#007AFF' },
            ]}
          >
            <ThemedText type="defaultSemiBold" style={styles.questionText}>
              {currentQuestion.front}
            </ThemedText>
          </View>
        </View>
      )}

      {/* Game Area */}
      {!gameOver && (
        <View style={styles.gameArea}>
          {bubbles.map((bubble) => {
            const isActive = feedbackBubble?.id === bubble.id;
            const isCorrectFeedback = isActive && feedbackBubble?.isCorrect;
            const isWrongFeedback = isActive && !feedbackBubble?.isCorrect;
            const isTargeted = targetedBubble === bubble.id;

            return (
              <Animated.View
                key={bubble.id}
                style={[
                  {
                    position: 'absolute',
                    left: bubble.x - BUBBLE_RADIUS,
                    top: bubble.y - BUBBLE_RADIUS,
                  },
                  isTargeted && glowStyle,
                ]}
              >
                {/* Glow effect */}
                {isTargeted && (
                  <View
                    style={[
                      styles.glowEffect,
                      {
                        width: BUBBLE_RADIUS * 2 + 20,
                        height: BUBBLE_RADIUS * 2 + 20,
                        borderRadius: BUBBLE_RADIUS + 10,
                        left: -10,
                        top: -10,
                      },
                    ]}
                  />
                )}
                
                <Pressable
                  onPress={() => handleBubblePress(bubble)}
                  disabled={isActive || isShooting}
                  style={[
                    styles.bubble,
                    {
                      backgroundColor: isCorrectFeedback
                        ? '#34C759'
                        : isWrongFeedback
                        ? '#FF9999'
                        : Colors[colorScheme ?? 'dark'].tint,
                      borderColor: isCorrectFeedback
                        ? '#34C759'
                        : isWrongFeedback
                        ? '#FF9999'
                        : Colors[colorScheme ?? 'dark'].text,
                    },
                  ]}
                >
                  <Text style={styles.bubbleText} numberOfLines={2}>
                    {bubble.text}
                  </Text>
                </Pressable>
              </Animated.View>
            );
          })}

          {/* Laser Beam */}
          {laserTarget && (
            <>
              <Animated.View style={laserStyle} />
              {/* Laser dots */}
              {Array.from({ length: 8 }).map((_, i) => {
                const gunX = screenWidth / 2;
                const gunY = GUN_Y;
                const dx = laserTarget.x - gunX;
                const dy = laserTarget.y - gunY;
                const angle = Math.atan2(dy, dx);
                const progress = (i + 1) / 9;
                const dotDistance = laserLength.value * progress;
                const dotX = gunX + Math.cos(angle) * dotDistance;
                const dotY = gunY + Math.sin(angle) * dotDistance;

                return (
                  <Animated.View
                    key={i}
                    style={[
                      styles.laserDot,
                      {
                        left: dotX - 3,
                        top: dotY - 3,
                        opacity: laserOpacity.value,
                      },
                    ]}
                  />
                );
              })}
            </>
          )}

          {/* Gun */}
          <View style={styles.gunContainer}>
            <View style={styles.gun}>
              <View style={styles.gunBarrel} />
            </View>
          </View>
        </View>
      )}

      {/* Score Badge (Bottom Left) */}
      {!gameOver && (
        <View style={styles.scoreBadge}>
          <ThemedText style={styles.scoreBadgeText}>
            {score.toString().padStart(2, '0')}
          </ThemedText>
        </View>
      )}

      {/* Completion Screen */}
      {gameOver && (
        <View style={styles.completionContainer}>
          <View style={styles.completionContent}>
            <ThemedText style={styles.completionTitle}>Hoàn thành!</ThemedText>
            <ThemedText style={styles.completionSubtitle}>
              Chúc mừng bạn!
            </ThemedText>
            <View style={[styles.scoreDisplay]}>
              <ThemedText style={styles.scoreLabel}>Điểm</ThemedText>
              <ThemedText style={styles.scoreBig}>{score}</ThemedText>
            </View>
          </View>

          <View style={styles.completionBottom}>
            <View
              style={[
                styles.statsContainer,
                {
                  backgroundColor: Colors[colorScheme ?? 'dark'].searchBackground,
                },
              ]}
            >
              <View style={styles.statItem}>
                <ThemedText style={[styles.statLabel, { color: '#34C759' }]}>
                  Chọn đúng
                </ThemedText>
                <ThemedText style={[styles.statValue, { color: '#34C759' }]}>
                  {correctCount}
                </ThemedText>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <ThemedText style={[styles.statLabel, { color: '#FF9999' }]}>
                  Chọn sai
                </ThemedText>
                <ThemedText style={[styles.statValue, { color: '#FF9999' }]}>
                  {wrongCount}
                </ThemedText>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <ThemedText style={styles.statLabel}>Thời gian</ThemedText>
                <ThemedText style={styles.statValue}>
                  {formatTime(elapsedTime)}
                </ThemedText>
              </View>
            </View>

            <Pressable
              onPress={handleBack}
              style={[
                styles.completionButton,
                { backgroundColor: Colors[colorScheme ?? 'dark'].tint },
              ]}
            >
              <ThemedText style={styles.completionButtonText}>
                Quay lại
              </ThemedText>
            </Pressable>
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
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rocketIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  headerIconButton: {
    padding: 4,
  },
  questionSection: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  questionBox: {
    padding: 16,
    borderRadius: 12,
    minHeight: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  questionText: {
    fontSize: 18,
    textAlign: 'center',
    color: '#FFFFFF',
  },
  gameArea: {
    flex: 1,
    position: 'relative',
    backgroundColor: 'transparent',
  },
  bubble: {
    width: BUBBLE_RADIUS * 2,
    height: BUBBLE_RADIUS * 2,
    borderRadius: BUBBLE_RADIUS,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    padding: 12,
    zIndex: 5,
  },
  bubbleText: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    color: '#fff',
  },
  glowEffect: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 149, 0, 0.4)',
    shadowColor: '#FF9500',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
    elevation: 10,
    zIndex: 4,
  },
  laserDot: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#007AFF',
    zIndex: 11,
  },
  gunContainer: {
    position: 'absolute',
    left: screenWidth / 2 - 20,
    top: GUN_Y - 30,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
  },
  gun: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#34C759',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gunBarrel: {
    width: 8,
    height: 20,
    backgroundColor: '#2A9D47',
    borderRadius: 4,
    marginTop: -10,
  },
  scoreBadge: {
    position: 'absolute',
    left: 16,
    bottom: 100,
    width: 60,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFD700',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 15,
  },
  scoreBadgeText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  completionContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
  },
  completionContent: {
    alignItems: 'center',
    gap: 4,
  },
  completionTitle: {
    fontSize: 26,
    fontWeight: '700',
  },
  completionSubtitle: {
    fontSize: 13,
    opacity: 0.7,
  },
  scoreDisplay: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    minHeight: 90,
    justifyContent: 'center',
  },
  scoreLabel: {
    fontSize: 11,
    opacity: 0.6,
    marginBottom: 3,
  },
  scoreBig: {
    fontSize: 48,
    fontWeight: '700',
    lineHeight: 52,
  },
  completionBottom: {
    gap: 16,
    marginTop: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 20,
    borderRadius: 12,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: 13,
    opacity: 0.6,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  completionButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  completionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
