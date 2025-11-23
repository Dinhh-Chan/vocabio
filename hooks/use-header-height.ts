// ============================================
// Hook to get header height for padding
// ============================================

import { useSafeAreaInsets } from 'react-native-safe-area-context';

const HEADER_BASE_HEIGHT = 64; // Base height without safe area

export function useHeaderHeight() {
  const insets = useSafeAreaInsets();
  return HEADER_BASE_HEIGHT + insets.top;
}

