// ============================================
// Hook to get tab bar height for padding
// ============================================

import { useSafeAreaInsets } from 'react-native-safe-area-context';

const TAB_BAR_BASE_HEIGHT = 70;

export function useTabBarHeight() {
  const insets = useSafeAreaInsets();
  return TAB_BAR_BASE_HEIGHT + Math.max(insets.bottom, 10);
}

