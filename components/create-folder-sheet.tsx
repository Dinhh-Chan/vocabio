import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import React, { useEffect, useState } from 'react';
import { Dimensions, Modal, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
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

interface CreateFolderSheetProps {
  visible: boolean;
  onClose: () => void;
  onSave?: (data: { name: string; description?: string }) => void;
}

export function CreateFolderSheet({ visible, onClose, onSave }: CreateFolderSheetProps) {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(SHEET_HEIGHT);
  const opacity = useSharedValue(0);
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [showDescription, setShowDescription] = useState(false);

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
    }
  }, [visible]);

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      if (event.translationY > 0) {
        translateY.value = event.translationY;
      }
    })
    .onEnd((event) => {
      if (event.translationY > 150) {
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

  const handleSave = () => {
    console.log('handleSave called', { name, nameTrimmed: name.trim() });
    
    // Gọi onSave callback trước (trước khi đóng sheet)
    if (onSave) {
      console.log('Calling onSave with data');
      onSave({
        name: name.trim() || 'Thư mục mới', // Default name nếu để trống
        description: showDescription ? description.trim() : undefined,
      });
    }

    // Đóng bottom sheet sau khi đã gọi onSave
    console.log('Closing sheet');
    onClose();
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
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
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
              <Pressable onPress={onClose} style={styles.headerButton}>
                <IconSymbol
                  name="xmark"
                  size={24}
                  color={Colors[colorScheme ?? 'dark'].text}
                />
              </Pressable>
              
              <ThemedText type="defaultSemiBold" style={styles.headerTitle}>
                Tạo thư mục
              </ThemedText>
              
              <View style={styles.headerRight}>
                <Pressable 
                  onPress={handleSave} 
                  style={styles.headerButton}
                >
                  <IconSymbol
                    name="checkmark"
                    size={24}
                    color={Colors[colorScheme ?? 'dark'].tint}
                  />
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
                    placeholder="Tên thư mục"
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
            </ScrollView>
          </Animated.View>
        </GestureDetector>
      </View>
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
});

