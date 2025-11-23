import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTabBarHeight } from '@/hooks/use-tab-bar-height';
import { statisticsService } from '@/services/statistics.service';
import { Statistics } from '@/types';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function StatisticsScreen() {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const tabBarHeight = useTabBarHeight();
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      setLoading(true);
      const res = await statisticsService.getStatistics();
      if (res.success && res.data) {
        setStatistics(res.data);
      }
    } catch (error) {
      console.error('Error loading statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Đang tải...</ThemedText>
      </ThemedView>
    );
  }

  if (!statistics) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Không có dữ liệu thống kê</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={{ 
        paddingTop: insets.top,
        paddingBottom: tabBarHeight + 20,
      }}
    >
      <ThemedView style={styles.header}>
        <ThemedText type="title">Thống kê</ThemedText>
      </ThemedView>

      <ThemedView style={[styles.section, { backgroundColor: Colors[colorScheme ?? 'dark'].cardBackground }]}>
        <ThemedText type="subtitle">Từ vựng</ThemedText>
        <View style={styles.statRow}>
          <ThemedText>Tổng số từ:</ThemedText>
          <ThemedText type="defaultSemiBold">{statistics.total_vocabularies}</ThemedText>
        </View>
        <View style={styles.statRow}>
          <ThemedText>Đã thuộc:</ThemedText>
          <ThemedText type="defaultSemiBold">{statistics.mastered_vocabularies}</ThemedText>
        </View>
        <View style={styles.statRow}>
          <ThemedText>Đang học:</ThemedText>
          <ThemedText type="defaultSemiBold">{statistics.learning_vocabularies}</ThemedText>
        </View>
      </ThemedView>

      <ThemedView style={[styles.section, { backgroundColor: Colors[colorScheme ?? 'dark'].cardBackground }]}>
        <ThemedText type="subtitle">Học tập</ThemedText>
        <View style={styles.statRow}>
          <ThemedText>Học phần:</ThemedText>
          <ThemedText type="defaultSemiBold">{statistics.total_study_sets}</ThemedText>
        </View>
        <View style={styles.statRow}>
          <ThemedText>Bài kiểm tra:</ThemedText>
          <ThemedText type="defaultSemiBold">{statistics.total_quizzes}</ThemedText>
        </View>
        <View style={styles.statRow}>
          <ThemedText>Thời gian học:</ThemedText>
          <ThemedText type="defaultSemiBold">{statistics.total_study_time} phút</ThemedText>
        </View>
      </ThemedView>

      <ThemedView style={[styles.section, { backgroundColor: Colors[colorScheme ?? 'dark'].cardBackground }]}>
        <ThemedText type="subtitle">Thành tích</ThemedText>
        <View style={styles.statRow}>
          <ThemedText>Chuỗi ngày:</ThemedText>
          <ThemedText type="defaultSemiBold">{statistics.current_streak} ngày</ThemedText>
        </View>
        <View style={styles.statRow}>
          <ThemedText>Chuỗi dài nhất:</ThemedText>
          <ThemedText type="defaultSemiBold">{statistics.longest_streak} ngày</ThemedText>
        </View>
        <View style={styles.statRow}>
          <ThemedText>Điểm trung bình:</ThemedText>
          <ThemedText type="defaultSemiBold">{statistics.average_score.toFixed(1)}%</ThemedText>
        </View>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  section: {
    marginBottom: 24,
    padding: 16,
    borderRadius: 12,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
});

