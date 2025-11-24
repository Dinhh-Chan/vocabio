import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TestSetupScreen() {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const studySetName = (params.name as string) || 'CULTURE 4.1';

  // State cho các tùy chọn
  const [numberOfQuestions, setNumberOfQuestions] = useState(20);
  const [showAnswersImmediately, setShowAnswersImmediately] = useState(false);
  const [answerLanguage, setAnswerLanguage] = useState('Tiếng Việt');
  const [trueFalse, setTrueFalse] = useState(false);
  const [multipleChoice, setMultipleChoice] = useState(true);
  const [essay, setEssay] = useState(false);

  const handleBack = () => {
    router.back();
  };

  const handleStartTest = () => {
    // TODO: Navigate to test screen with settings
    console.log('Start test with settings:', {
      numberOfQuestions,
      showAnswersImmediately,
      answerLanguage,
      trueFalse,
      multipleChoice,
      essay,
    });
    // router.push({
    //   pathname: '/study/test',
    //   params: { ... },
    // });
  };

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
            name="xmark"
            size={24}
            color={Colors[colorScheme ?? 'dark'].text}
          />
        </Pressable>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 20 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Title Section */}
        <View style={styles.titleSection}>
          <ThemedText style={styles.studySetName}>{studySetName}</ThemedText>
          <View style={styles.mainTitleRow}>
            <ThemedText type="title" style={styles.mainTitle}>
              Thiết lập bài kiểm tra
            </ThemedText>
            <View style={styles.iconStackContainer}>
              <View style={[styles.iconBack, { backgroundColor: Colors[colorScheme ?? 'dark'].tint }]}>
                <View style={styles.iconBackLines}>
                  <View style={[styles.iconLine, { backgroundColor: '#FFFFFF', opacity: 0.3 }]} />
                  <View style={[styles.iconLine, { backgroundColor: '#FFFFFF', opacity: 0.3 }]} />
                  <View style={[styles.iconLine, { backgroundColor: '#FFFFFF', opacity: 0.3 }]} />
                </View>
              </View>
              <View style={[styles.iconFront, { backgroundColor: Colors[colorScheme ?? 'dark'].tint }]}>
                <View style={styles.iconFrontLines}>
                  <View style={[styles.iconLine, { backgroundColor: '#FFFFFF' }]} />
                  <View style={[styles.iconLine, { backgroundColor: '#FFFFFF' }]} />
                  <View style={[styles.iconLine, { backgroundColor: '#FFFFFF' }]} />
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Settings Section */}
        <View style={styles.settingsSection}>
          {/* Số câu hỏi */}
          <Pressable
            style={[
              styles.settingItem,
              { backgroundColor: Colors[colorScheme ?? 'dark'].cardBackground },
            ]}
          >
            <ThemedText style={styles.settingLabel}>Số câu hỏi</ThemedText>
            <View style={styles.settingValueRow}>
              <ThemedText style={styles.settingValue}>{numberOfQuestions}</ThemedText>
              <IconSymbol
                name="chevron.right"
                size={20}
                color={Colors[colorScheme ?? 'dark'].icon}
              />
            </View>
          </Pressable>

          {/* Hiển thị đáp án ngay */}
          <View
            style={[
              styles.settingItem,
              { backgroundColor: Colors[colorScheme ?? 'dark'].cardBackground },
            ]}
          >
            <ThemedText style={styles.settingLabel}>Hiển thị đáp án ngay</ThemedText>
            <Switch
              value={showAnswersImmediately}
              onValueChange={setShowAnswersImmediately}
              trackColor={{
                false: Colors[colorScheme ?? 'dark'].searchBackground,
                true: Colors[colorScheme ?? 'dark'].tint,
              }}
              thumbColor="#FFFFFF"
            />
          </View>

          {/* Trả lời bằng */}
          <Pressable
            style={[
              styles.settingItem,
              { backgroundColor: Colors[colorScheme ?? 'dark'].cardBackground },
            ]}
          >
            <ThemedText style={styles.settingLabel}>Trả lời bằng</ThemedText>
            <View style={styles.settingValueRow}>
              <ThemedText style={styles.settingValue}>{answerLanguage}</ThemedText>
              <IconSymbol
                name="chevron.right"
                size={20}
                color={Colors[colorScheme ?? 'dark'].icon}
              />
            </View>
          </Pressable>

          {/* Divider */}
          <View style={[styles.divider, { backgroundColor: Colors[colorScheme ?? 'dark'].searchBackground }]} />

          {/* Question Types */}
          <ThemedText style={styles.sectionSubtitle}>Loại câu hỏi</ThemedText>

          {/* Đúng/sai */}
          <View
            style={[
              styles.settingItem,
              { backgroundColor: Colors[colorScheme ?? 'dark'].cardBackground },
            ]}
          >
            <ThemedText style={styles.settingLabel}>Đúng/sai</ThemedText>
            <Switch
              value={trueFalse}
              onValueChange={setTrueFalse}
              trackColor={{
                false: Colors[colorScheme ?? 'dark'].searchBackground,
                true: Colors[colorScheme ?? 'dark'].tint,
              }}
              thumbColor="#FFFFFF"
            />
          </View>

          {/* Nhiều lựa chọn */}
          <View
            style={[
              styles.settingItem,
              { backgroundColor: Colors[colorScheme ?? 'dark'].cardBackground },
            ]}
          >
            <ThemedText style={styles.settingLabel}>Nhiều lựa chọn</ThemedText>
            <Switch
              value={multipleChoice}
              onValueChange={setMultipleChoice}
              trackColor={{
                false: Colors[colorScheme ?? 'dark'].searchBackground,
                true: Colors[colorScheme ?? 'dark'].tint,
              }}
              thumbColor="#FFFFFF"
            />
          </View>

          {/* Tự luận */}
          <View
            style={[
              styles.settingItem,
              { backgroundColor: Colors[colorScheme ?? 'dark'].cardBackground },
            ]}
          >
            <ThemedText style={styles.settingLabel}>Tự luận</ThemedText>
            <Switch
              value={essay}
              onValueChange={setEssay}
              trackColor={{
                false: Colors[colorScheme ?? 'dark'].searchBackground,
                true: Colors[colorScheme ?? 'dark'].tint,
              }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>
      </ScrollView>

      {/* Start Button */}
      <View style={[styles.buttonContainer, { paddingBottom: insets.bottom + 16 }]}>
        <Pressable
          style={[
            styles.startButton,
            { backgroundColor: Colors[colorScheme ?? 'dark'].tint },
          ]}
          onPress={handleStartTest}
        >
          <ThemedText style={styles.startButtonText}>Bắt đầu làm kiểm tra</ThemedText>
        </Pressable>
      </View>
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
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  titleSection: {
    marginBottom: 32,
    marginTop: 8,
  },
  studySetName: {
    fontSize: 16,
    opacity: 0.7,
    marginBottom: 8,
  },
  mainTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: '700',
    flex: 1,
  },
  iconStackContainer: {
    width: 56,
    height: 56,
    position: 'relative',
    marginLeft: 12,
  },
  iconBack: {
    position: 'absolute',
    top: 6,
    left: 6,
    width: 44,
    height: 44,
    borderRadius: 8,
    padding: 10,
    justifyContent: 'space-between',
  },
  iconFront: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 44,
    height: 44,
    borderRadius: 8,
    padding: 10,
    zIndex: 1,
    justifyContent: 'space-between',
  },
  iconBackLines: {
    flex: 1,
    justifyContent: 'space-between',
  },
  iconFrontLines: {
    flex: 1,
    justifyContent: 'space-between',
  },
  iconLine: {
    height: 2.5,
    borderRadius: 1,
    width: '100%',
  },
  settingsSection: {
    gap: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  settingValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingValue: {
    fontSize: 16,
    opacity: 0.7,
  },
  divider: {
    height: 1,
    marginVertical: 8,
  },
  sectionSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 4,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  startButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

