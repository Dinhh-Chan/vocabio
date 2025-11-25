import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, Modal, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedText } from './themed-text';
import { IconSymbol } from './ui/icon-symbol';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SHEET_HEIGHT = SCREEN_HEIGHT; // Full screen để che cả header

interface VocabularyItem {
  id: string;
  term: string;
  definition: string;
  termLanguage?: string;
  definitionLanguage?: string;
  ipa?: string;
  audio?: string;
  example?: string;
}

interface CreateStudySetSheetProps {
  visible: boolean;
  onClose: () => void;
  onSave?: (data: { topic: string; chapter: string; unit: string; description?: string; vocabularies?: VocabularyItem[] }) => void | Promise<void>;
  settings?: {
    showIPA?: boolean;
    showAudio?: boolean;
    showExample?: boolean;
  };
}

export function CreateStudySetSheet({ visible, onClose, onSave, settings = {} }: CreateStudySetSheetProps) {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(SHEET_HEIGHT);
  const opacity = useSharedValue(0);
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [showDescription, setShowDescription] = useState(false);
  const [vocabularies, setVocabularies] = useState<VocabularyItem[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [showFolderList, setShowFolderList] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [languageModalContext, setLanguageModalContext] = useState<{
    vocabId: string;
    type: 'term' | 'definition';
  } | null>(null);
  const [saving, setSaving] = useState(false);

  // Mock folders data
  const mockFolders = [
    { id: '1', name: 'Toán học' },
    { id: '2', name: 'Vật lý' },
    { id: '3', name: 'Hóa học' },
    { id: '4', name: 'Tiếng Anh' },
    { id: '5', name: 'Lịch sử' },
  ];

  // Danh sách ngôn ngữ
  const languages = [
    { id: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
    { id: 'en', name: 'English', flag: '🇺🇸' },
    { id: 'zh', name: '中文', flag: '🇨🇳' },
    { id: 'ja', name: '日本語', flag: '🇯🇵' },
    { id: 'ko', name: '한국어', flag: '🇰🇷' },
    { id: 'fr', name: 'Français', flag: '🇫🇷' },
    { id: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { id: 'es', name: 'Español', flag: '🇪🇸' },
    { id: 'pt', name: 'Português', flag: '🇵🇹' },
    { id: 'ru', name: 'Русский', flag: '🇷🇺' },
  ];

  useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0, {
        damping: 20,
        stiffness: 90,
      });
      opacity.value = withTiming(1, { duration: 200 });
    } else {
      translateY.value = withSpring(SHEET_HEIGHT, {
        damping: 20,
        stiffness: 90,
      });
      opacity.value = withTiming(0, { duration: 200 });
      // Reset form khi đóng
      setName('');
      setDescription('');
      setShowDescription(false);
      setVocabularies([]);
      setSelectedFolder(null);
      setShowFolderList(false);
      setShowLanguageModal(false);
      setLanguageModalContext(null);
    }
  }, [visible]);

  // Cập nhật các từ vựng hiện có khi settings thay đổi
  useEffect(() => {
    if (vocabularies.length > 0 && visible) {
      setVocabularies(vocabularies.map(vocab => ({
        ...vocab,
        // Thêm các trường mới nếu settings được bật và chưa có
        ...(settings?.showIPA && vocab.ipa === undefined && { ipa: '' }),
        ...(settings?.showAudio && vocab.audio === undefined && { audio: '' }),
        ...(settings?.showExample && vocab.example === undefined && { example: '' }),
      })));
    }
  }, [settings?.showIPA, settings?.showAudio, settings?.showExample, visible]);

  const addVocabulary = () => {
    // Lấy ngôn ngữ từ từ vựng đầu tiên (nếu có), nếu không thì dùng mặc định
    const firstVocab = vocabularies[0];
    const newVocab: VocabularyItem = {
      id: Date.now().toString(),
      term: '',
      definition: '',
      termLanguage: firstVocab?.termLanguage || 'en', // Lấy từ từ vựng đầu tiên hoặc mặc định
      definitionLanguage: firstVocab?.definitionLanguage || 'vi', // Lấy từ từ vựng đầu tiên hoặc mặc định
      ...(settings?.showIPA && { ipa: '' }),
      ...(settings?.showAudio && { audio: '' }),
      ...(settings?.showExample && { example: '' }),
    };
    setVocabularies([...vocabularies, newVocab]);
  };

  const updateVocabulary = (id: string, field: 'term' | 'definition' | 'ipa' | 'audio' | 'example', value: string) => {
    setVocabularies(vocabularies.map(vocab => 
      vocab.id === id ? { ...vocab, [field]: value } : vocab
    ));
  };

  const updateVocabularyLanguage = (id: string, type: 'term' | 'definition', languageId: string) => {
    // Nếu đang cập nhật từ vựng đầu tiên, áp dụng cho tất cả các từ vựng khác
    const firstVocab = vocabularies[0];
    const isFirstVocab = firstVocab?.id === id;
    
    if (isFirstVocab) {
      // Cập nhật tất cả các từ vựng với cùng ngôn ngữ
      setVocabularies(vocabularies.map(vocab => ({
        ...vocab,
        [type === 'term' ? 'termLanguage' : 'definitionLanguage']: languageId
      })));
    } else {
      // Chỉ cập nhật từ vựng cụ thể (trường hợp này không nên xảy ra nếu chỉ hiển thị cho từ vựng đầu tiên)
      setVocabularies(vocabularies.map(vocab => 
        vocab.id === id ? { 
          ...vocab, 
          [type === 'term' ? 'termLanguage' : 'definitionLanguage']: languageId 
        } : vocab
      ));
    }
  };

  const openLanguageModal = (vocabId: string, type: 'term' | 'definition') => {
    setLanguageModalContext({ vocabId, type });
    setShowLanguageModal(true);
  };

  const getLanguageName = (languageId?: string) => {
    if (!languageId) return 'Chọn ngôn ngữ';
    return languages.find(lang => lang.id === languageId)?.name || 'Chọn ngôn ngữ';
  };

  const removeVocabulary = (id: string) => {
    setVocabularies(vocabularies.filter(vocab => vocab.id !== id));
  };

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      if (event.translationY > 0) {
        translateY.value = event.translationY;
      }
    })
    .onEnd((event) => {
      if (event.translationY > 150 && !saving) {
        onClose();
      } else {
        translateY.value = withSpring(0, {
          damping: 20,
          stiffness: 90,
        });
      }
    });

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const handleSave = async () => {
    if (saving) return;
    
    console.log('handleSave called - Gọi API POST để tạo học phần', { name, nameTrimmed: name.trim() });
    
    // Validate tên học phần
    if (!name.trim()) {
      // Có thể hiển thị error message
      return;
    }
    
    // Validate vocabularies
    const validVocabularies = vocabularies.filter(v => v.term.trim() && v.definition.trim());
    if (validVocabularies.length === 0) {
      // Có thể hiển thị error message
      return;
    }
    
    try {
      setSaving(true);
      
      // Gọi onSave callback - callback này sẽ gọi API POST /study-set/with-vocabularies
      if (onSave) {
        console.log('Calling onSave - sẽ gọi API POST /study-set/with-vocabularies');
        await onSave({
          topic: name.trim(),
          chapter: '',
          unit: '',
          description: showDescription ? description.trim() : undefined,
          vocabularies: validVocabularies,
        });
      }

      // Đóng bottom sheet sau khi đã gọi API POST thành công
      console.log('API POST thành công, đóng sheet');
      onClose();
    } catch (error) {
      console.error('Error saving study set:', error);
      // Error đã được xử lý trong onSave, không cần đóng sheet
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.container}>
        <Animated.View style={[styles.backdrop, backdropStyle]}>
          <Pressable 
            style={StyleSheet.absoluteFill} 
            onPress={() => {
              if (!saving) {
                onClose();
              }
            }}
            disabled={saving}
          />
        </Animated.View>

        <GestureDetector gesture={panGesture}>
          <Animated.View
            style={[
              styles.sheet,
              sheetStyle,
              {
                backgroundColor: Colors[colorScheme ?? 'dark'].cardBackground,
                paddingTop: Math.max(insets.top, 20),
                paddingBottom: Math.max(insets.bottom, 20),
              },
            ]}
          >
            {/* Header */}
            <View style={styles.header}>
              <Pressable 
                onPress={() => {
                  if (!saving) {
                    onClose();
                  }
                }} 
                style={styles.headerButton}
                disabled={saving}
              >
                <IconSymbol
                  name="xmark"
                  size={24}
                  color={Colors[colorScheme ?? 'dark'].text}
                />
              </Pressable>
              
              <ThemedText type="defaultSemiBold" style={styles.headerTitle}>
                Tạo học phần
              </ThemedText>
              
              <View style={styles.headerRight}>
                <Pressable 
                  onPress={() => {
                    if (!saving) {
                      onClose();
                      setTimeout(() => {
                        router.push('/study-set/settings');
                      }, 300);
                    }
                  }} 
                  style={styles.headerButton}
                  disabled={saving}
                >
                  <IconSymbol
                    name="gearshape.fill"
                    size={24}
                    color={Colors[colorScheme ?? 'dark'].text}
                  />
                </Pressable>
                <Pressable 
                  onPress={() => {
                    console.log('Checkmark button pressed');
                    handleSave();
                  }} 
                  style={[styles.headerButton, saving && styles.headerButtonDisabled]}
                  disabled={saving}
                >
                  {saving ? (
                    <ActivityIndicator size="small" color={Colors[colorScheme ?? 'dark'].tint} />
                  ) : (
                    <IconSymbol
                      name="checkmark"
                      size={24}
                      color={Colors[colorScheme ?? 'dark'].tint}
                    />
                  )}
                </Pressable>
              </View>
            </View>

            <ScrollView 
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Form inputs */}
              <View style={styles.form}>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: Colors[colorScheme ?? 'dark'].searchBackground,
                        color: Colors[colorScheme ?? 'dark'].text,
                      },
                    ]}
                    placeholder="Tên học phần"
                    placeholderTextColor={Colors[colorScheme ?? 'dark'].icon}
                    value={name}
                    onChangeText={setName}
                  />
                </View>
              </View>

              {/* Action buttons */}
              <View style={styles.actionButtons}>
                <Pressable
                  style={[
                    styles.actionButton,
                    {
                      backgroundColor: Colors[colorScheme ?? 'dark'].searchBackground,
                    },
                  ]}
                  onPress={() => {
                    // TODO: Scan document
                    console.log('Scan document');
                  }}
                >
                  <IconSymbol
                    name="camera.fill"
                    size={20}
                    color={Colors[colorScheme ?? 'dark'].text}
                    style={styles.actionButtonIcon}
                  />
                  <ThemedText type="defaultSemiBold" style={styles.actionButtonText}>
                    Quét tài liệu
                  </ThemedText>
                </Pressable>

                <Pressable
                  style={[
                    styles.actionButton,
                    {
                      backgroundColor: Colors[colorScheme ?? 'dark'].searchBackground,
                    },
                  ]}
                  onPress={() => setShowFolderList(true)}
                >
                  <IconSymbol
                    name="folder.fill"
                    size={20}
                    color={Colors[colorScheme ?? 'dark'].text}
                    style={styles.actionButtonIcon}
                  />
                  <ThemedText type="defaultSemiBold" style={styles.actionButtonText}>
                    Chọn thư mục
                  </ThemedText>
                </Pressable>

                <Pressable
                  style={[
                    styles.actionButton,
                    {
                      backgroundColor: Colors[colorScheme ?? 'dark'].searchBackground,
                    },
                  ]}
                  onPress={() => setShowDescription(!showDescription)}
                >
                  <IconSymbol
                    name="doc.text.fill"
                    size={20}
                    color={Colors[colorScheme ?? 'dark'].text}
                    style={styles.actionButtonIcon}
                  />
                  <ThemedText type="defaultSemiBold" style={styles.actionButtonText}>
                    + Mô tả
                  </ThemedText>
                </Pressable>
              </View>

              {/* Selected folder display */}
              {selectedFolder && (
                <View style={styles.selectedFolderContainer}>
                  <ThemedText type="defaultSemiBold" style={styles.selectedFolderLabel}>
                    Thư mục đã chọn:
                  </ThemedText>
                  <View style={[
                    styles.selectedFolderBadge,
                    { backgroundColor: Colors[colorScheme ?? 'dark'].tint + '20' }
                  ]}>
                    <ThemedText style={styles.selectedFolderText}>
                      {mockFolders.find(f => f.id === selectedFolder)?.name}
                    </ThemedText>
                    <Pressable
                      onPress={() => setSelectedFolder(null)}
                      style={styles.removeFolderButton}
                    >
                      <IconSymbol
                        name="xmark"
                        size={16}
                        color={Colors[colorScheme ?? 'dark'].text}
                      />
                    </Pressable>
                  </View>
                </View>
              )}

              {/* Description input (conditional) */}
              {showDescription && (
                <View style={styles.descriptionContainer}>
                  <TextInput
                    style={[
                      styles.descriptionInput,
                      {
                        backgroundColor: Colors[colorScheme ?? 'dark'].searchBackground,
                        color: Colors[colorScheme ?? 'dark'].text,
                      },
                    ]}
                    placeholder="Nhập mô tả..."
                    placeholderTextColor={Colors[colorScheme ?? 'dark'].icon}
                    value={description}
                    onChangeText={setDescription}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                </View>
              )}

              {/* Vocabulary list */}
              {vocabularies.length > 0 && (
                <View style={styles.vocabSection}>
                  {vocabularies.map((vocab, index) => (
                    <View key={vocab.id} style={styles.vocabItem}>
                      <View style={styles.vocabHeader}>
                        <ThemedText type="defaultSemiBold" style={styles.vocabItemLabel}>
                          Thuật ngữ {index + 1}
                        </ThemedText>
                        {vocabularies.length > 1 && (
                          <Pressable
                            onPress={() => removeVocabulary(vocab.id)}
                            style={styles.removeButton}
                          >
                            <IconSymbol
                              name="xmark"
                              size={18}
                              color={Colors[colorScheme ?? 'dark'].text}
                            />
                          </Pressable>
                        )}
                      </View>
                      <TextInput
                        style={[
                          styles.vocabInput,
                          {
                            backgroundColor: Colors[colorScheme ?? 'dark'].searchBackground,
                            color: Colors[colorScheme ?? 'dark'].text,
                          },
                        ]}
                        placeholder="Nhập thuật ngữ..."
                        placeholderTextColor={Colors[colorScheme ?? 'dark'].icon}
                        value={vocab.term}
                        onChangeText={(value) => updateVocabulary(vocab.id, 'term', value)}
                      />
                      
                      {/* Hiển thị ngôn ngữ cho thuật ngữ */}
                      {index === 0 ? (
                        // Từ vựng đầu tiên: có thể chọn ngôn ngữ
                        <Pressable
                          onPress={() => openLanguageModal(vocab.id, 'term')}
                          style={styles.languageSelector}
                        >
                          <ThemedText type="defaultSemiBold" style={styles.languageText}>
                            {getLanguageName(vocab.termLanguage)}
                          </ThemedText>
                        </Pressable>
                      ) : (
                        // Các từ vựng sau: chỉ hiển thị ngôn ngữ (không thể chọn)
                        <View style={styles.languageSelector}>
                          <ThemedText type="defaultSemiBold" style={styles.languageText}>
                            {getLanguageName(vocab.termLanguage)}
                          </ThemedText>
                        </View>
                      )}
                      
                      <ThemedText type="defaultSemiBold" style={[styles.vocabItemLabel, { marginTop: 16 }]}>
                        Định nghĩa {index + 1}
                      </ThemedText>
                      <TextInput
                        style={[
                          styles.vocabInput,
                          {
                            backgroundColor: Colors[colorScheme ?? 'dark'].searchBackground,
                            color: Colors[colorScheme ?? 'dark'].text,
                          },
                        ]}
                        placeholder="Nhập định nghĩa..."
                        placeholderTextColor={Colors[colorScheme ?? 'dark'].icon}
                        value={vocab.definition}
                        onChangeText={(value) => updateVocabulary(vocab.id, 'definition', value)}
                        multiline
                        numberOfLines={3}
                        textAlignVertical="top"
                      />
                      
                      {/* Hiển thị ngôn ngữ cho định nghĩa */}
                      {index === 0 ? (
                        // Từ vựng đầu tiên: có thể chọn ngôn ngữ
                        <Pressable
                          onPress={() => openLanguageModal(vocab.id, 'definition')}
                          style={styles.languageSelector}
                        >
                          <ThemedText type="defaultSemiBold" style={styles.languageText}>
                            {getLanguageName(vocab.definitionLanguage)}
                          </ThemedText>
                        </Pressable>
                      ) : (
                        // Các từ vựng sau: chỉ hiển thị ngôn ngữ (không thể chọn)
                        <View style={styles.languageSelector}>
                          <ThemedText type="defaultSemiBold" style={styles.languageText}>
                            {getLanguageName(vocab.definitionLanguage)}
                          </ThemedText>
                        </View>
                      )}

                      {/* IPA - chỉ hiển thị nếu được bật trong settings */}
                      {settings.showIPA && (
                        <>
                          <ThemedText type="defaultSemiBold" style={[styles.vocabItemLabel, { marginTop: 16 }]}>
                            IPA {index + 1}
                          </ThemedText>
                          <TextInput
                            style={[
                              styles.vocabInput,
                              {
                                backgroundColor: Colors[colorScheme ?? 'dark'].searchBackground,
                                color: Colors[colorScheme ?? 'dark'].text,
                              },
                            ]}
                            placeholder="Nhập IPA..."
                            placeholderTextColor={Colors[colorScheme ?? 'dark'].icon}
                            value={vocab.ipa || ''}
                            onChangeText={(value) => updateVocabulary(vocab.id, 'ipa', value)}
                          />
                        </>
                      )}

                      {/* Audio - chỉ hiển thị nếu được bật trong settings */}
                      {settings.showAudio && (
                        <>
                          <ThemedText type="defaultSemiBold" style={[styles.vocabItemLabel, { marginTop: 16 }]}>
                            Audio {index + 1}
                          </ThemedText>
                          <TextInput
                            style={[
                              styles.vocabInput,
                              {
                                backgroundColor: Colors[colorScheme ?? 'dark'].searchBackground,
                                color: Colors[colorScheme ?? 'dark'].text,
                              },
                            ]}
                            placeholder="Nhập link audio hoặc URL..."
                            placeholderTextColor={Colors[colorScheme ?? 'dark'].icon}
                            value={vocab.audio || ''}
                            onChangeText={(value) => updateVocabulary(vocab.id, 'audio', value)}
                          />
                        </>
                      )}

                      {/* Example - chỉ hiển thị nếu được bật trong settings */}
                      {settings.showExample && (
                        <>
                          <ThemedText type="defaultSemiBold" style={[styles.vocabItemLabel, { marginTop: 16 }]}>
                            Example {index + 1}
                          </ThemedText>
                          <TextInput
                            style={[
                              styles.vocabInput,
                              {
                                backgroundColor: Colors[colorScheme ?? 'dark'].searchBackground,
                                color: Colors[colorScheme ?? 'dark'].text,
                              },
                            ]}
                            placeholder="Nhập ví dụ..."
                            placeholderTextColor={Colors[colorScheme ?? 'dark'].icon}
                            value={vocab.example || ''}
                            onChangeText={(value) => updateVocabulary(vocab.id, 'example', value)}
                            multiline
                            numberOfLines={3}
                            textAlignVertical="top"
                          />
                        </>
                      )}
                    </View>
                  ))}
                </View>
              )}

              {/* Add vocabulary button */}
              <Pressable
                onPress={addVocabulary}
                style={styles.addVocabButton}
              >
                <ThemedText type="defaultSemiBold" style={styles.addVocabButtonText}>
                  + Thêm từ vựng
                </ThemedText>
              </Pressable>
            </ScrollView>
          </Animated.View>
        </GestureDetector>
      </View>

      {/* Language selection modal */}
      <Modal
        transparent
        visible={showLanguageModal}
        animationType="fade"
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <Pressable 
          style={styles.folderModalBackdrop}
          onPress={() => setShowLanguageModal(false)}
        >
          <Pressable 
            style={[
              styles.folderModalContent,
              { backgroundColor: Colors[colorScheme ?? 'dark'].cardBackground }
            ]}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.folderModalHeader}>
              <ThemedText type="defaultSemiBold" style={styles.folderModalTitle}>
                Chọn ngôn ngữ
              </ThemedText>
              <Pressable
                onPress={() => setShowLanguageModal(false)}
                style={styles.folderModalCloseButton}
              >
                <IconSymbol
                  name="xmark"
                  size={24}
                  color={Colors[colorScheme ?? 'dark'].text}
                />
              </Pressable>
            </View>

            <ScrollView style={styles.folderList}>
              {languages.map((language) => {
                const currentVocab = vocabularies.find(v => v.id === languageModalContext?.vocabId);
                const currentLanguage = languageModalContext?.type === 'term' 
                  ? currentVocab?.termLanguage 
                  : currentVocab?.definitionLanguage;
                const isSelected = currentLanguage === language.id;
                
                return (
                  <Pressable
                    key={language.id}
                    style={[
                      styles.folderItem,
                      {
                        backgroundColor: isSelected
                          ? Colors[colorScheme ?? 'dark'].tint + '20'
                          : Colors[colorScheme ?? 'dark'].searchBackground,
                      },
                    ]}
                    onPress={() => {
                      if (languageModalContext) {
                        updateVocabularyLanguage(
                          languageModalContext.vocabId,
                          languageModalContext.type,
                          language.id
                        );
                      }
                      setShowLanguageModal(false);
                    }}
                  >
                    <ThemedText style={styles.languageFlag}>
                      {language.flag}
                    </ThemedText>
                    <ThemedText type="defaultSemiBold" style={styles.folderItemText}>
                      {language.name}
                    </ThemedText>
                    {isSelected && (
                      <IconSymbol
                        name="checkmark"
                        size={20}
                        color={Colors[colorScheme ?? 'dark'].tint}
                      />
                    )}
                  </Pressable>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Folder selection modal */}
      <Modal
        transparent
        visible={showFolderList}
        animationType="fade"
        onRequestClose={() => setShowFolderList(false)}
      >
        <Pressable 
          style={styles.folderModalBackdrop}
          onPress={() => setShowFolderList(false)}
        >
          <Pressable 
            style={[
              styles.folderModalContent,
              { backgroundColor: Colors[colorScheme ?? 'dark'].cardBackground }
            ]}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.folderModalHeader}>
              <ThemedText type="defaultSemiBold" style={styles.folderModalTitle}>
                Chọn thư mục
              </ThemedText>
              <Pressable
                onPress={() => setShowFolderList(false)}
                style={styles.folderModalCloseButton}
              >
                <IconSymbol
                  name="xmark"
                  size={24}
                  color={Colors[colorScheme ?? 'dark'].text}
                />
              </Pressable>
            </View>

            <ScrollView style={styles.folderList}>
              {mockFolders.map((folder) => (
                <Pressable
                  key={folder.id}
                  style={[
                    styles.folderItem,
                    {
                      backgroundColor: selectedFolder === folder.id
                        ? Colors[colorScheme ?? 'dark'].tint + '20'
                        : Colors[colorScheme ?? 'dark'].searchBackground,
                    },
                  ]}
                  onPress={() => {
                    setSelectedFolder(folder.id);
                    setShowFolderList(false);
                  }}
                >
                  <IconSymbol
                    name="folder.fill"
                    size={24}
                    color={Colors[colorScheme ?? 'dark'].text}
                    style={styles.folderItemIcon}
                  />
                  <ThemedText type="defaultSemiBold" style={styles.folderItemText}>
                    {folder.name}
                  </ThemedText>
                  {selectedFolder === folder.id && (
                    <IconSymbol
                      name="checkmark"
                      size={20}
                      color={Colors[colorScheme ?? 'dark'].tint}
                    />
                  )}
                </Pressable>
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sheet: {
    height: SHEET_HEIGHT,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 15,
    zIndex: 10000, // Che cả header
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 20,
  },
  headerButton: {
    padding: 8,
    minWidth: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerButtonDisabled: {
    opacity: 0.5,
  },
  headerTitle: {
    fontSize: 18,
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    gap: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  form: {
    gap: 16,
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 0,
  },
  input: {
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    minHeight: 50,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
    flexWrap: 'wrap',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 12,
    gap: 8,
  },
  actionButtonIcon: {
    marginRight: 0,
  },
  actionButtonText: {
    fontSize: 14,
  },
  descriptionContainer: {
    marginTop: 8,
  },
  descriptionInput: {
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    minHeight: 100,
  },
  vocabSection: {
    marginTop: 24,
    gap: 20,
  },
  vocabItem: {
    marginBottom: 20,
  },
  vocabHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  vocabItemLabel: {
    fontSize: 14,
    opacity: 0.7,
  },
  removeButton: {
    padding: 4,
  },
  vocabInput: {
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    minHeight: 50,
    marginTop: 8,
  },
  languageSelector: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  languageText: {
    fontSize: 14,
    opacity: 0.8,
  },
  languageFlag: {
    fontSize: 24,
    marginRight: 12,
  },
  addVocabButton: {
    marginTop: 16,
    marginBottom: 20,
    alignSelf: 'flex-start',
  },
  addVocabButtonText: {
    fontSize: 16,
    textDecorationLine: 'underline',
    color: Colors.dark.tint,
  },
  selectedFolderContainer: {
    marginBottom: 16,
  },
  selectedFolderLabel: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 8,
  },
  selectedFolderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 12,
  },
  selectedFolderText: {
    fontSize: 14,
    flex: 1,
  },
  removeFolderButton: {
    padding: 4,
  },
  folderModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  folderModalContent: {
    width: '85%',
    maxWidth: 400,
    maxHeight: '70%',
    borderRadius: 24,
    padding: 20,
  },
  folderModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  folderModalTitle: {
    fontSize: 18,
  },
  folderModalCloseButton: {
    padding: 4,
  },
  folderList: {
    maxHeight: 400,
  },
  folderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  folderItemIcon: {
    marginRight: 12,
  },
  folderItemText: {
    flex: 1,
    fontSize: 16,
  },
});

