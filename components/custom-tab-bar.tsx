// ============================================
// Custom Tab Bar Component - Quizlet Style
// ============================================

import { Colors } from '@/constants/theme';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { PlatformPressable } from '@react-navigation/elements';
import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconSymbol } from './ui/icon-symbol';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TAB_BAR_WIDTH = 300; // Fixed width for tab bar

interface TabButtonProps {
  route: any;
  isFocused: boolean;
  options: any;
  label: string;
  onPress: () => void;
  onLongPress: () => void;
}

function TabButton({ route, isFocused, label, onPress, onLongPress }: TabButtonProps) {
  const [isPressed, setIsPressed] = useState(false);

  // Get icon name based on route name
  const getIconName = () => {
    if (route.name === 'index') return 'house.fill';
    if (route.name === 'library') return 'folder.fill';
    return 'chevron.right';
  };

  const iconName = getIconName();

  return (
    <PlatformPressable
      accessibilityRole="button"
      accessibilityState={isFocused ? { selected: true } : {}}
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      style={styles.tabButton}
    >
      <View 
        style={[
          styles.tabContent, 
          isFocused && styles.tabContentActive,
          isPressed && styles.tabContentHover,
        ]}
      >
        {route.name === 'create' ? (
          <View style={styles.plusIcon}>
            <Text style={[styles.plusText, isFocused && styles.plusTextActive]}>+</Text>
          </View>
        ) : (
          <IconSymbol
            size={22}
            name={iconName}
            color={isFocused ? Colors.dark.navBarActiveText : Colors.dark.navBarInactiveIcon}
          />
        )}
        <Text
          style={[
            styles.tabLabel,
            isFocused ? styles.tabLabelActive : styles.tabLabelInactive,
          ]}
        >
          {label}
        </Text>
      </View>
    </PlatformPressable>
  );
}

export function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  // Filter to only show the 3 main tabs
  const mainRoutes = state.routes.filter(
    (route) => route.name === 'index' || route.name === 'create' || route.name === 'library'
  );

  return (
    <View style={[styles.tabBar, { 
      paddingBottom: Math.max(insets.bottom, 10),
      marginBottom: 16,
    }]}>
      {mainRoutes.map((route) => {
        const routeIndex = state.routes.findIndex((r) => r.key === route.key);
        const isFocused = state.index === routeIndex;
        const { options } = descriptors[route.key];
        const label =
          typeof options.tabBarLabel === 'string'
            ? options.tabBarLabel
            : typeof options.title === 'string'
            ? options.title
            : route.name;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }

          if (process.env.EXPO_OS === 'ios') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        return (
          <TabButton
            key={route.key}
            route={route}
            isFocused={isFocused}
            options={options}
            label={label}
            onPress={onPress}
            onLongPress={onLongPress}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: (SCREEN_WIDTH - TAB_BAR_WIDTH) / 2, // Center horizontally
    flexDirection: 'row',
    backgroundColor: Colors.dark.navBarBackground,
    borderRadius: 24,
    paddingTop: 8,
    paddingBottom: 6,
    paddingHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 15,
    minHeight: 60,
    width: TAB_BAR_WIDTH,
    zIndex: 1000,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    minWidth: 44,
  },
  tabContentActive: {
    backgroundColor: Colors.dark.navBarActiveBg, // #29335C
    borderRadius: 12,
  },
  tabContentHover: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)', // Light white overlay on press
    borderRadius: 12,
  },
  tabLabel: {
    marginTop: 4,
    fontSize: 10,
    fontWeight: '600',
  },
  tabLabelActive: {
    color: Colors.dark.navBarActiveText, // #CFE0FF
  },
  tabLabelInactive: {
    color: Colors.dark.navBarInactiveIcon, // #AEB5C7
  },
  plusIcon: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusText: {
    fontSize: 26,
    fontWeight: '300',
    color: Colors.dark.navBarInactiveIcon,
    lineHeight: 26,
  },
  plusTextActive: {
    color: Colors.dark.navBarActiveText, // #CFE0FF
  },
});

