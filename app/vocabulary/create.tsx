import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { vocabularyService } from '@/services/vocabulary.service';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function CreateVocabularyScreen() {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const [word, setWord] = useState('');
  const [definitions, setDefinitions] = useState<Array<{ definition: string; example?: string }>>([
    { definition: '' },
  ]);
  const [pronunciation, setPronunciation] = useState('');
  const [ipa, setIpa] = useState('');
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(false);

  const addDefinition = () => {
    setDefinitions([...definitions, { definition: '' }]);
  };

  const updateDefinition = (index: number, field: 'definition' | 'example', value: string) => {
    const newDefinitions = [...definitions];
    newDefinitions[index] = { ...newDefinitions[index], [field]: value };
    setDefinitions(newDefinitions);
  };

  const removeDefinition = (index: number) => {
    if (definitions.length > 1) {
      setDefinitions(definitions.filter((_, i) => i !== index));
    }
  };

  const handleSave = async () => {
    if (!word.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập từ vựng');
      return;
    }

    const validDefinitions = definitions.filter((d) => d.definition.trim());
    if (validDefinitions.length === 0) {
      Alert.alert('Lỗi', 'Vui lòng nhập ít nhất một định nghĩa');
      return;
    }

    try {
      setLoading(true);
      const res = await vocabularyService.create({
        word: word.trim(),
        definitions: validDefinitions.map((d) => ({
          definition: d.definition.trim(),
          example: d.example?.trim(),
        })),
        pronunciation: pronunciation.trim() || undefined,
        ipa: ipa.trim() || undefined,
        tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      });

      if (res.success) {
        Alert.alert('Thành công', 'Đã tạo từ vựng mới', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      } else {
        Alert.alert('Lỗi', res.error || 'Không thể tạo từ vựng');
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Đã xảy ra lỗi khi tạo từ vựng');
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
          Tạo từ vựng mới
        </ThemedText>

        <ThemedView style={styles.section}>
          <ThemedText type="defaultSemiBold" style={styles.label}>
            Từ vựng *
          </ThemedText>
          <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: Colors[colorScheme ?? 'dark'].searchBackground,
                  color: Colors[colorScheme ?? 'dark'].text,
                },
              ]}
            value={word}
            onChangeText={setWord}
            placeholder="Nhập từ vựng"
            placeholderTextColor={Colors[colorScheme ?? 'dark'].icon}
          />
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="defaultSemiBold" style={styles.label}>
            Định nghĩa *
          </ThemedText>
          {definitions.map((def, index) => (
            <ThemedView key={index} style={styles.definitionItem}>
              <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: Colors[colorScheme ?? 'dark'].searchBackground,
                  color: Colors[colorScheme ?? 'dark'].text,
                },
              ]}
                value={def.definition}
                onChangeText={(value) => updateDefinition(index, 'definition', value)}
                placeholder="Định nghĩa"
                placeholderTextColor={Colors[colorScheme ?? 'dark'].icon}
                multiline
              />
              <TextInput
                style={[
                  styles.input,
                  styles.exampleInput,
                  {
                    backgroundColor: colorScheme === 'dark' ? '#333' : '#f5f5f5',
                    color: Colors[colorScheme ?? 'light'].text,
                  },
                ]}
                value={def.example || ''}
                onChangeText={(value) => updateDefinition(index, 'example', value)}
                placeholder="Ví dụ (tùy chọn)"
                placeholderTextColor={Colors[colorScheme ?? 'dark'].icon}
                multiline
              />
              {definitions.length > 1 && (
                <Pressable
                  style={styles.removeButton}
                  onPress={() => removeDefinition(index)}
                >
                  <ThemedText style={styles.removeButtonText}>Xóa</ThemedText>
                </Pressable>
              )}
            </ThemedView>
          ))}
          <Pressable style={styles.addButton} onPress={addDefinition}>
            <ThemedText style={styles.addButtonText}>+ Thêm định nghĩa</ThemedText>
          </Pressable>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="defaultSemiBold" style={styles.label}>
            Phát âm
          </ThemedText>
          <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: Colors[colorScheme ?? 'dark'].searchBackground,
                  color: Colors[colorScheme ?? 'dark'].text,
                },
              ]}
            value={pronunciation}
            onChangeText={setPronunciation}
            placeholder="Phát âm"
            placeholderTextColor={Colors[colorScheme ?? 'dark'].icon}
          />
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="defaultSemiBold" style={styles.label}>
            IPA
          </ThemedText>
          <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: Colors[colorScheme ?? 'dark'].searchBackground,
                  color: Colors[colorScheme ?? 'dark'].text,
                },
              ]}
            value={ipa}
            onChangeText={setIpa}
            placeholder="Phiên âm IPA"
            placeholderTextColor={Colors[colorScheme ?? 'dark'].icon}
          />
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="defaultSemiBold" style={styles.label}>
            Tags (phân cách bằng dấu phẩy)
          </ThemedText>
          <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: Colors[colorScheme ?? 'dark'].searchBackground,
                  color: Colors[colorScheme ?? 'dark'].text,
                },
              ]}
            value={tags}
            onChangeText={setTags}
            placeholder="tag1, tag2, tag3"
            placeholderTextColor={Colors[colorScheme ?? 'dark'].icon}
          />
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
  definitionItem: {
    marginBottom: 12,
  },
  exampleInput: {
    marginTop: 8,
  },
  addButton: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#0a7ea4',
    alignItems: 'center',
    marginTop: 8,
  },
  addButtonText: {
    color: '#0a7ea4',
    fontWeight: '600',
  },
  removeButton: {
    padding: 8,
    marginTop: 8,
    alignItems: 'center',
  },
  removeButtonText: {
    color: '#ff4444',
    fontSize: 14,
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

