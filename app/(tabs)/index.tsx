import { AppHeader } from '@/components/app-header';
import { ThemedView } from '@/components/themed-view';
import { useHeaderHeight } from '@/hooks/use-header-height';
import { StyleSheet, View } from 'react-native';

export default function HomeScreen() {
  const headerHeight = useHeaderHeight();

  return (
    <ThemedView style={styles.container}>
      <AppHeader searchPlaceholder="Tìm kiếm từ vựng..." />
      <View style={{ paddingTop: headerHeight, flex: 1 }}>
        {/* Content sẽ được thêm vào đây */}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
