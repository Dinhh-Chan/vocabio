import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import React, { useEffect } from 'react';
import { Dimensions, Modal, Pressable, StyleSheet, View } from 'react-native';
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
const SHEET_HEIGHT = 200; // Chiều cao của bottom sheet

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  items: Array<{
    label: string;
    icon?: 'book.fill' | 'folder.fill';
    onPress: () => void;
  }>;
}

export function BottomSheet({ visible, onClose, items }: BottomSheetProps) {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(SHEET_HEIGHT);
  const opacity = useSharedValue(0);

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
    }
  }, [visible]);

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      if (event.translationY > 0) {
        translateY.value = event.translationY;
      }
    })
    .onEnd((event) => {
      if (event.translationY > 100) {
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

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
    >
      <Pressable 
        style={styles.container} 
        onPress={onClose}
      >
        <Animated.View style={[styles.backdrop, backdropStyle]} />

        <Pressable 
          style={{ flex: 1, justifyContent: 'flex-end' }}
          onPress={(e) => e.stopPropagation()}
        >
          <GestureDetector gesture={panGesture}>
            <Animated.View
              style={[
                styles.sheet,
                sheetStyle,
                {
                  backgroundColor: Colors[colorScheme ?? 'dark'].cardBackground,
                  paddingBottom: Math.max(insets.bottom, 20),
                },
              ]}
            >
              {/* Handle bar */}
              <View
                style={[
                  styles.handleBar,
                  { backgroundColor: Colors[colorScheme ?? 'dark'].icon },
                ]}
              />

              {/* Menu items */}
              <View style={styles.menuItems}>
              {items.map((item, index) => (
                <Pressable
                  key={index}
                  style={[
                    styles.menuItem,
                    {
                      backgroundColor: Colors[colorScheme ?? 'dark'].searchBackground,
                    },
                    index < items.length - 1 && styles.menuItemBorder,
                  ]}
                  onPress={() => {
                    // Gọi onPress trước, không gọi onClose vì state sẽ được quản lý bởi parent
                    item.onPress();
                  }}
                >
                  <View style={styles.menuItemContent}>
                    {item.icon && (
                      <IconSymbol
                        name={item.icon}
                        size={24}
                        color={Colors[colorScheme ?? 'dark'].text}
                        style={styles.menuItemIcon}
                      />
                    )}
                    <ThemedText type="defaultSemiBold" style={styles.menuItemText}>
                      {item.label}
                    </ThemedText>
                  </View>
                </Pressable>
              ))}
            </View>
          </Animated.View>
        </GestureDetector>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sheet: {
    height: SHEET_HEIGHT,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 15,
  },
  handleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
    opacity: 0.3,
  },
  menuItems: {
    gap: 12,
  },
  menuItem: {
    padding: 16,
    borderRadius: 12,
  },
  menuItemBorder: {
    marginBottom: 0,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuItemIcon: {
    marginRight: 0,
  },
  menuItemText: {
    fontSize: 16,
  },
});

