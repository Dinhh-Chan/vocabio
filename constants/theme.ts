/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

// Quizlet-inspired colors
const quizletBlue = '#4255FF';
const quizletCyan = '#3CCFCF';
const quizletDarkBlue = '#0A092D';
const quizletDarkBlueLight = '#1A1B2E';
const quizletLightBlue = '#2E3856'; // Light blue for tab bar

// Navigation bar colors - iOS dark style
const navBarBackground = '#0F1428'; // Navy dark with purple tint (#0D1230 - #11173A)
const navBarActiveBg = '#29335C'; // Light blue-purple for active tab
const navBarActiveText = '#CFE0FF'; // Light blue-white for active text/icon
const navBarInactiveIcon = '#AEB5C7'; // Light gray for inactive icons

export const Colors = {
  light: {
    text: '#ECEDEE',
    background: quizletDarkBlue,
    tint: quizletBlue,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: quizletBlue,
    cardBackground: quizletDarkBlueLight,
    searchBackground: '#2E3856',
    tabBarBackground: quizletLightBlue,
    hoverBackground: 'rgba(255, 255, 255, 0.1)',
    navBarBackground: navBarBackground,
    navBarActiveBg: navBarActiveBg,
    navBarActiveText: navBarActiveText,
    navBarInactiveIcon: navBarInactiveIcon,
  },
  dark: {
    text: '#ECEDEE',
    background: quizletDarkBlue,
    tint: quizletBlue,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: quizletBlue,
    cardBackground: quizletDarkBlueLight,
    searchBackground: '#2E3856',
    tabBarBackground: quizletLightBlue,
    hoverBackground: 'rgba(255, 255, 255, 0.1)',
    navBarBackground: navBarBackground,
    navBarActiveBg: navBarActiveBg,
    navBarActiveText: navBarActiveText,
    navBarInactiveIcon: navBarInactiveIcon,
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
