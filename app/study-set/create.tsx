import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { studySetService } from '@/services/study-set.service';
import { vocabularyService } from '@/services/vocabulary.service';
import { Vocabulary } from '@/types';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function CreateStudySetScreen() {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [vocabularies, setVocabularies] = useState<Vocabulary[]>([]);
  const [selectedVocabIds, setSelectedVocabIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingVocab, setLoadingVocab] = useState(true);

  useEffect(() => {
    loadVocabularies();
  }, []);

  const loadVocabularies = async () => {
    try {
      setLoadingVocab(true);
      const res = await vocabularyService.getAll({ limit: 100 });
      if (res.success && res.data) {
        setVocabularies(res.data.data || []);
      }
    } catch (error) {
      console.error('Error loading vocabularies:', error);
    } finally {
      setLoadingVocab(false);
    }
  };

  const toggleVocabulary = (vocabId: string) => {
    if (selectedVocabIds.includes(vocabId)) {
      setSelectedVocabIds(selectedVocabIds.filter((id) => id !== vocabId));
    } else {
      setSelectedVocabIds([...selectedVocabIds, vocabId]);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên học phần');
      return;
    }

    if (selectedVocabIds.length === 0) {
      Alert.alert('Lỗi', 'Vui lòng chọn ít nhất một từ vựng');
      return;
    }

    try {
      setLoading(true);
      const res = await studySetService.create({
        name: name.trim(),
        description: description.trim() || undefined,
        vocabulary_ids: selectedVocabIds,
      });

      if (res.success) {
        Alert.alert('Thành công', 'Đã tạo học phần mới', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      } else {
        Alert.alert('Lỗi', res.error || 'Không thể tạo học phần');
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Đã xảy ra lỗi khi tạo học phần');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={{ paddingTop: insets.top }}
      >
        <ThemedText type="title" style={styles.title}>
          Tạo học phần mới
        </ThemedText>

        <ThemedView style={styles.section}>
          <ThemedText type="defaultSemiBold" style={styles.label}>
            Tên học phần *
          </ThemedText>
          <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: Colors[colorScheme ?? 'dark'].searchBackground,
                  color: Colors[colorScheme ?? 'dark'].text,
                },
              ]}
            value={name}
            onChangeText={setName}
            placeholder="Nhập tên học phần"
            placeholderTextColor={Colors[colorScheme ?? 'dark'].icon}
          />
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="defaultSemiBold" style={styles.label}>
            Mô tả
          </ThemedText>
          <TextInput
            style={[
              styles.input,
              styles.textArea,
              {
                backgroundColor: colorScheme === 'dark' ? '#333' : '#f5f5f5',
                color: Colors[colorScheme ?? 'light'].text,
              },
            ]}
            value={description}
            onChangeText={setDescription}
            placeholder="Mô tả học phần (tùy chọn)"
            placeholderTextColor={Colors[colorScheme ?? 'dark'].icon}
            multiline
            numberOfLines={4}
          />
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="defaultSemiBold" style={styles.label}>
            Chọn từ vựng ({selectedVocabIds.length} đã chọn)
          </ThemedText>
          {loadingVocab ? (
            <ThemedText>Đang tải...</ThemedText>
          ) : vocabularies.length === 0 ? (
            <ThemedView style={styles.emptyState}>
              <ThemedText>Chưa có từ vựng nào</ThemedText>
              <Pressable
                style={styles.linkButton}
                onPress={() => router.push('/vocabulary/create')}
              >
                <ThemedText style={styles.linkButtonText}>Tạo từ vựng mới</ThemedText>
              </Pressable>
            </ThemedView>
          ) : (
            vocabularies.map((vocab) => {
              const isSelected = selectedVocabIds.includes(vocab._id);
              return (
                <Pressable
                  key={vocab._id}
                  style={[
                    styles.vocabItem,
                    {
                      backgroundColor: isSelected
                        ? Colors[colorScheme ?? 'dark'].tint + '20'
                        : Colors[colorScheme ?? 'dark'].searchBackground,
                      borderColor: isSelected
                        ? Colors[colorScheme ?? 'dark'].tint
                        : 'transparent',
                    },
                  ]}
                  onPress={() => toggleVocabulary(vocab._id)}
                >
                  <ThemedText type="defaultSemiBold">{vocab.word}</ThemedText>
                  {vocab.definitions[0] && (
                    <ThemedText style={styles.definition} numberOfLines={1}>
                      {vocab.definitions[0].definition}
                    </ThemedText>
                  )}
                </Pressable>
              );
            })
          )}
        </ThemedView>

        <Pressable
          style={[
            styles.saveButton,
            {
              backgroundColor: Colors[colorScheme ?? 'dark'].tint,
            },
            loading && styles.buttonDisabled,
          ]}
          onPress={handleSave}
          disabled={loading}
        >
          <ThemedText style={styles.saveButtonText}>
            {loading ? 'Đang lưu...' : 'Lưu'}
          </ThemedText>
        </Pressable>
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
    padding: 20,
  },
  title: {
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    marginBottom: 8,
  },
  input: {
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    minHeight: 44,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  vocabItem: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 2,
  },
  definition: {
    marginTop: 4,
    fontSize: 14,
    opacity: 0.7,
  },
  emptyState: {
    padding: 20,
    alignItems: 'center',
  },
  linkButton: {
    marginTop: 12,
    padding: 12,
  },
  linkButtonText: {
    color: '#0a7ea4',
    fontWeight: '600',
  },
  saveButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});

