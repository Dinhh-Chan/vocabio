import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { mockFlashcardData } from '@/constants/mock-data';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Question {
  id: string;
  question: string; // Tiếng Việt
  correctAnswer: string;
  options: string[];
  illustration?: string; // Mô tả hình minh họa
}

// Mock questions data - tạo câu hỏi từ study set
const generateQuestionsFromStudySet = (studySetId: string): Question[] => {
  const cards = mockFlashcardData[studySetId as keyof typeof mockFlashcardData] || [];
  
  // Mock data với câu hỏi tiếng Việt và đáp án tiếng Anh
  const mockQuestions: Question[] = [
    {
      id: 'q1',
      question: 'bạn bè xã giao',
      correctAnswer: 'casual acquaintance',
      options: [
        'have a lot in common',
        'fall out with sb',
        'cooperative attitude',
        'casual acquaintance',
      ],
      illustration: 'handshake',
    },
    {
      id: 'q2',
      question: 'có nhiều điểm chung',
      correctAnswer: 'have a lot in common',
      options: [
        'have a lot in common',
        'casual acquaintance',
        'cooperative attitude',
        'fall out with sb',
      ],
      illustration: 'handshake',
    },
    {
      id: 'q3',
      question: 'cãi nhau với ai đó',
      correctAnswer: 'fall out with sb',
      options: [
        'cooperative attitude',
        'fall out with sb',
        'have a lot in common',
        'casual acquaintance',
      ],
      illustration: 'handshake',
    },
  ];
  
  // Nếu có cards, tạo câu hỏi từ cards
  if (cards.length > 0) {
    return cards.map((card, index) => {
      // Lấy các đáp án khác từ các cards khác
      const otherCards = cards.filter((c) => c.id !== card.id);
      const wrongAnswers = otherCards.slice(0, 3).map((c) => c.back);
      
      // Đảm bảo có đủ 4 đáp án
      const allOptions = [card.back, ...wrongAnswers].slice(0, 4);
      // Xáo trộn đáp án
      const shuffled = [...allOptions].sort(() => Math.random() - 0.5);
      
      return {
        id: card.id,
        question: card.front, // Sử dụng front làm câu hỏi (tiếng Việt)
        correctAnswer: card.back, // Đáp án đúng (tiếng Anh)
        options: shuffled,
        illustration: 'handshake',
      };
    });
  }
  
  return mockQuestions;
};

export default function LearnScreen() {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const studySetId = (params.studySetId as string) || 'studyset1';
  const studySetName = (params.name as string) || 'Học';

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [showRetry, setShowRetry] = useState(false);

  useEffect(() => {
    const generatedQuestions = generateQuestionsFromStudySet(studySetId);
    setQuestions(generatedQuestions);
  }, [studySetId]);

  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;
  const progress = totalQuestions > 0 ? (currentQuestionIndex + 1) / totalQuestions : 0;

  const handleAnswerSelect = (answer: string) => {
    if (selectedAnswer) return; // Đã chọn rồi, không cho chọn lại
    
    setSelectedAnswer(answer);
    const correct = answer === currentQuestion?.correctAnswer;
    setIsCorrect(correct);
    
    if (correct) {
      setCorrectCount(correctCount + 1);
      // Tự động chuyển câu tiếp theo sau 1 giây
      setTimeout(() => {
        handleNext();
      }, 1000);
    } else {
      setShowRetry(true);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setIsCorrect(null);
      setShowRetry(false);
    } else {
      // Hoàn thành
      handleComplete();
    }
  };

  const handleRetry = () => {
    setSelectedAnswer(null);
    setIsCorrect(null);
    setShowRetry(false);
  };

  const handleComplete = () => {
    // TODO: Navigate to completion screen
    console.log('Completed!', { correctCount, totalQuestions });
    router.back();
  };

  const handleBack = () => {
    router.back();
  };

  const handleSettings = () => {
    // TODO: Open settings
    console.log('Settings');
  };

  // Render illustration (placeholder - có thể thay bằng hình ảnh thực)
  const renderIllustration = () => {
    return (
      <View style={styles.illustrationContainer}>
        <View style={styles.illustration}>
          {/* Hình minh họa 2 người bắt tay - style sketched */}
          <View style={styles.handshakeIcon}>
            {/* Person 1 */}
            <View style={styles.personContainer}>
              <View style={[styles.personHead, { borderColor: Colors[colorScheme ?? 'dark'].text }]} />
              <View style={[styles.personBody, { borderColor: Colors[colorScheme ?? 'dark'].text }]} />
              <View style={[styles.personArm, styles.personArmLeft, { borderColor: Colors[colorScheme ?? 'dark'].text }]} />
            </View>
            
            {/* Handshake */}
            <View style={[styles.handshake, { borderColor: Colors[colorScheme ?? 'dark'].text }]} />
            
            {/* Person 2 */}
            <View style={styles.personContainer}>
              <View style={[styles.personHead, { borderColor: Colors[colorScheme ?? 'dark'].text }]} />
              <View style={[styles.personBody, { borderColor: Colors[colorScheme ?? 'dark'].text }]} />
              <View style={[styles.personArm, styles.personArmRight, { borderColor: Colors[colorScheme ?? 'dark'].text }]} />
            </View>
          </View>
        </View>
      </View>
    );
  };

  if (!currentQuestion) {
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
            name="xmark"
            size={24}
            color={Colors[colorScheme ?? 'dark'].text}
          />
        </Pressable>
        
        <View style={styles.headerCenter}>
          <View style={[styles.headerIcon, { backgroundColor: Colors[colorScheme ?? 'dark'].tint }]}>
            <ThemedText style={styles.headerIconText}>C</ThemedText>
          </View>
          <ThemedText style={styles.headerTitle}>{studySetName}</ThemedText>
        </View>
        
        <Pressable onPress={handleSettings} style={styles.headerButton}>
          <IconSymbol
            name="gearshape.fill"
            size={24}
            color={Colors[colorScheme ?? 'dark'].text}
          />
        </Pressable>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressCircle, { backgroundColor: '#34C759' }]}>
          <ThemedText style={styles.progressNumber}>{correctCount}</ThemedText>
        </View>
        
        <View style={styles.progressBars}>
          {[0, 1, 2].map((index) => {
            const segmentProgress = Math.min(
              Math.max((progress * 3) - index, 0),
              1
            );
            return (
              <View
                key={index}
                style={[
                  styles.progressBar,
                  {
                    backgroundColor: Colors[colorScheme ?? 'dark'].searchBackground,
                  },
                ]}
              >
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${segmentProgress * 100}%`,
                      backgroundColor: Colors[colorScheme ?? 'dark'].tint,
                    },
                  ]}
                />
              </View>
            );
          })}
        </View>
        
        <View style={[styles.progressCircle, { backgroundColor: Colors[colorScheme ?? 'dark'].searchBackground }]}>
          <ThemedText style={styles.progressNumber}>{totalQuestions}</ThemedText>
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
        {/* Retry Button (khi sai) */}
        {showRetry && (
          <Pressable
            style={[styles.retryButton, { backgroundColor: '#FF9500' }]}
            onPress={handleRetry}
          >
            <ThemedText style={styles.retryButtonText}>Hãy thử lại lần nữa</ThemedText>
          </Pressable>
        )}

        {/* Question */}
        <View style={styles.questionContainer}>
          <ThemedText type="title" style={styles.questionText}>
            {currentQuestion.question}
          </ThemedText>
        </View>

        {/* Illustration */}
        {renderIllustration()}

        {/* Instruction */}
        <ThemedText style={styles.instructionText}>Chọn câu trả lời</ThemedText>

        {/* Answer Options */}
        <View style={styles.optionsContainer}>
          {currentQuestion.options.map((option, index) => {
            let buttonStyle = [
              styles.optionButton,
              { backgroundColor: Colors[colorScheme ?? 'dark'].cardBackground },
            ];
            let textStyle = styles.optionText;

            if (selectedAnswer === option) {
              if (isCorrect) {
                buttonStyle.push({ backgroundColor: '#34C759' });
                textStyle = styles.optionTextCorrect;
              } else {
                buttonStyle.push({ backgroundColor: '#FF3B30' });
                textStyle = styles.optionTextWrong;
              }
            } else if (selectedAnswer && option === currentQuestion.correctAnswer) {
              // Highlight correct answer if wrong answer was selected
              buttonStyle.push({ backgroundColor: '#34C759', opacity: 0.7 });
              textStyle = styles.optionTextCorrect;
            }

            return (
              <Pressable
                key={index}
                style={buttonStyle}
                onPress={() => handleAnswerSelect(option)}
                disabled={!!selectedAnswer}
              >
                <ThemedText style={textStyle}>{option}</ThemedText>
              </Pressable>
            );
          })}
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
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIconText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  progressCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  progressBars: {
    flex: 1,
    flexDirection: 'row',
    gap: 4,
    height: 8,
  },
  progressBar: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  retryButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  questionContainer: {
    marginBottom: 24,
    alignItems: 'center',
  },
  questionText: {
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'center',
  },
  illustrationContainer: {
    alignItems: 'center',
    marginBottom: 24,
    minHeight: 150,
    justifyContent: 'center',
  },
  illustration: {
    width: 240,
    height: 150,
    alignItems: 'center',
    justifyContent: 'center',
  },
  handshakeIcon: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 12,
    height: '100%',
  },
  personContainer: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: '100%',
    position: 'relative',
  },
  personHead: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: 'solid',
    marginBottom: 4,
  },
  personBody: {
    width: 40,
    height: 50,
    borderWidth: 2,
    borderStyle: 'solid',
    borderRadius: 8,
  },
  personArm: {
    position: 'absolute',
    width: 24,
    height: 8,
    borderWidth: 2,
    borderStyle: 'solid',
    borderRadius: 4,
    bottom: 20,
  },
  personArmLeft: {
    right: -8,
    transform: [{ rotate: '-20deg' }],
  },
  personArmRight: {
    left: -8,
    transform: [{ rotate: '20deg' }],
  },
  handshake: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'solid',
    alignSelf: 'flex-end',
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    opacity: 0.8,
  },
  optionsContainer: {
    gap: 12,
    marginBottom: 20,
  },
  optionButton: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.dark.searchBackground,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
  },
  optionTextCorrect: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  optionTextWrong: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  },
});

