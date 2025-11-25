import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { authService } from '@/services/auth.service';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Dimensions, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function LoginScreen() {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    // Reset error
    setError(null);

    if (!username.trim() || !password.trim()) {
      setError('Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu');
      return;
    }

    try {
      setLoading(true);

      const res = await authService.login(username.trim(), password);

      if (res.success && res.data) {
        router.replace('/(tabs)');
      } else {
        // Hiển thị thông báo lỗi cụ thể
        const errorMessage = res.error || 'Tên đăng nhập hoặc mật khẩu không đúng';
        setError(errorMessage);
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Đã xảy ra lỗi khi đăng nhập. Vui lòng thử lại.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <ThemedView style={styles.content}>
          <ThemedText
            type="title"
            style={[
              styles.title,
              { fontSize: Math.min(48, SCREEN_WIDTH * 0.12) }
            ]}
            numberOfLines={1}
          >
            Vocabio
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            Học từ vựng thông minh với SRS
          </ThemedText>

          <ThemedView style={styles.form}>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: Colors[colorScheme ?? 'dark'].searchBackground,
                  color: Colors[colorScheme ?? 'dark'].text,
                },
                error && styles.inputError,
              ]}
              placeholder="Tên đăng nhập"
              placeholderTextColor={Colors[colorScheme ?? 'dark'].icon}
              value={username}
              onChangeText={(text) => {
                setUsername(text);
                // Clear error when user starts typing
                if (error) setError(null);
              }}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />

            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: Colors[colorScheme ?? 'dark'].searchBackground,
                  color: Colors[colorScheme ?? 'dark'].text,
                },
                error && styles.inputError,
              ]}
              placeholder="Mật khẩu"
              placeholderTextColor={Colors[colorScheme ?? 'dark'].icon}
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                // Clear error when user starts typing
                if (error) setError(null);
              }}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />

            {/* Error Message */}
            {error && (
              <View style={styles.errorContainer}>
                <ThemedText style={styles.errorText}>{error}</ThemedText>
              </View>
            )}

            <Pressable
              style={[
                styles.loginButton,
                {
                  backgroundColor: Colors[colorScheme ?? 'dark'].tint,
                },
                loading && styles.buttonDisabled,
              ]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <ThemedText style={styles.buttonText}>Đăng nhập</ThemedText>
              )}
            </Pressable>
          </ThemedView>

          <ThemedText style={styles.footer}>
            Bằng cách đăng nhập, bạn đồng ý với Điều khoản sử dụng và Chính sách bảo mật
          </ThemedText>
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    paddingVertical: 40,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
    minHeight: 60,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    marginBottom: 40,
    textAlign: 'center',
  },
  form: {
    width: '100%',
    gap: 16,
    marginBottom: 20,
  },
  input: {
    width: '100%',
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    minHeight: 50,
  },
  inputError: {
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  errorContainer: {
    width: '100%',
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    textAlign: 'center',
  },
  loginButton: {
    width: '100%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  footer: {
    fontSize: 12,
    opacity: 0.5,
    textAlign: 'center',
    marginTop: 20,
  },
});

