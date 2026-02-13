/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#354024'; // Kombu Green
const tintColorDark = '#E5D7C4'; // Bone

export const Palette = {
  deepObsidian: '#0C1A10',
  linenWhite: '#FAF9F6',
  warmCopper: '#C1773E',
  mutedSage: '#8E9775',
  charcoalEspresso: '#2D241E',
  stoneGray: '#E2E2E2',
  white: '#FFFFFF',
  slate: '#94a3b8',
};

export const Colors = {
  light: {
    text: Palette.charcoalEspresso,
    background: Palette.linenWhite,
    tint: Palette.warmCopper,
    surface: Palette.white,
    border: Palette.stoneGray,
    icon: Palette.warmCopper,
    tabIconDefault: Palette.mutedSage,
    tabIconSelected: Palette.warmCopper,
  },
  dark: {
    text: Palette.linenWhite,
    background: Palette.deepObsidian,
    tint: Palette.warmCopper,
    surface: '#1A291A', // Darker green surface for depth
    border: Palette.mutedSage,
    icon: Palette.linenWhite,
    tabIconDefault: Palette.mutedSage,
    tabIconSelected: Palette.warmCopper,
  },
};

export const Fonts = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semiBold: 'Montserrat_600SemiBold',
  bold: 'Montserrat_700Bold',
};

