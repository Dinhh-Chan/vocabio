import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { MD3DarkTheme, MD3LightTheme, Provider as PaperProvider } from 'react-native-paper';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { enableScreens } from 'react-native-screens';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { authService } from '@/services/auth.service';

enableScreens();

export const unstable_settings = {
  anchor: '(tabs)',
};

function useProtectedRoute() {
  const segments = useSegments();
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isAuthenticated = await authService.isAuthenticated();
        const currentRoute = segments[0];
        const isLoginRoute = currentRoute === 'login';

        if (!isAuthenticated) {
          // Nếu chưa đăng nhập và không phải route login, redirect về login
          if (!isLoginRoute) {
            router.replace('/login');
          }
        } else {
          // Nếu đã đăng nhập và đang ở trang login, redirect về trang chủ
          if (isLoginRoute) {
            router.replace('/(tabs)');
          }
          // Nếu đã đăng nhập nhưng chưa có route (app khởi động), điều hướng về trang chủ
          else if (!currentRoute) {
            router.replace('/(tabs)');
          }
        }
      } catch (error) {
        console.error('Auth check error:', error);
        // Nếu có lỗi, redirect về login để đảm bảo an toàn
        router.replace('/login');
      } finally {
        setIsReady(true);
      }
    };

    checkAuth();
  }, [segments, router]);

  return isReady;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const isReady = useProtectedRoute();

  if (!isReady) {
    return null; // Or a loading screen
  }

  // Tạo Material UI theme tùy chỉnh
  const paperTheme = colorScheme === 'dark' 
    ? {
        ...MD3DarkTheme,
        colors: {
          ...MD3DarkTheme.colors,
          primary: Colors.dark.tint,
          background: Colors.dark.background,
          surface: Colors.dark.cardBackground,
          text: Colors.dark.text,
        },
      }
    : {
        ...MD3LightTheme,
        colors: {
          ...MD3LightTheme.colors,
          primary: Colors.light.tint,
          background: Colors.light.background,
          surface: Colors.light.cardBackground,
          text: Colors.light.text,
        },
      };

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <PaperProvider theme={paperTheme}>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <Stack
            screenOptions={{
              gestureEnabled: true,
              gestureDirection: 'vertical',
              transitionSpec: {
                open: {
                  animation: 'spring',
                  config: {
                    stiffness: 500,
                    damping: 300,
                    mass: 3,
                    overshootClamping: false,
                    restDisplacementThreshold: 0.01,
                    restSpeedThreshold: 0.01,
                  },
                },
                close: {
                  animation: 'spring',
                  config: {
                    stiffness: 500,
                    damping: 300,
                    mass: 3,
                    overshootClamping: false,
                    restDisplacementThreshold: 0.01,
                    restSpeedThreshold: 0.01,
                  },
                },
              },
              cardStyleInterpolator: ({ current, next, layouts }: any) => {
                return {
                  cardStyle: {
                    transform: [
                      {
                        translateY: current.progress.interpolate({
                          inputRange: [0, 1],
                          outputRange: [layouts.screen.height, 0],
                        }),
                      },
                    ],
                    opacity: current.progress.interpolate({
                      inputRange: [0, 0.5, 0.9, 1],
                      outputRange: [0, 0.5, 0.9, 1],
                    }),
                  },
                  overlayStyle: {
                    opacity: current.progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 0.5],
                    }),
                  },
                };
              },
            } as any}>
            <Stack.Screen name="login" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="folder/[id]" options={{ headerShown: false }} />
            <Stack.Screen name="study/flashcard" options={{ headerShown: false }} />
            <Stack.Screen name="study/match" options={{ headerShown: false }} />
            <Stack.Screen name="study/blast" options={{ headerShown: false }} />
            <Stack.Screen name="study/learn" options={{ headerShown: false }} />
            <Stack.Screen name="study/test-setup" options={{ headerShown: false }} />
            <Stack.Screen name="study-set/[id]" options={{ headerShown: false }} />
            <Stack.Screen 
              name="study-set/settings" 
              options={{ 
                headerShown: false,
                presentation: 'card',
              }} 
            />
            <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
          </Stack>
          <StatusBar style="light" hidden={false} translucent={true} backgroundColor="transparent" />
          </ThemeProvider>
        </PaperProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
