import React from 'react';
import { TouchableOpacity, StyleProp, ViewStyle, ImageStyle } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

interface AnimatedImageProps {
    source: any;
    style?: StyleProp<ViewStyle>;
    imageStyle?: StyleProp<ImageStyle>;
    entering?: any;
    hoverScale?: number;
    onPress?: () => void;
    borderRadius?: number;
    resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center';
}

export const AnimatedImage = ({
    source,
    style,
    imageStyle,
    entering,
    hoverScale = 1.05,
    onPress,
    borderRadius,
    resizeMode = 'cover'
}: AnimatedImageProps) => {
    const scale = useSharedValue(1);
    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: withSpring(scale.value, { damping: 15, stiffness: 150 }) }],
    }));

    const containerStyle = style as any;
    const derivedBorderRadius = borderRadius || containerStyle?.borderRadius || 0;

    return (
        <TouchableOpacity
            activeOpacity={1}
            onPressIn={() => scale.value = hoverScale}
            onPressOut={() => scale.value = 1}
            onPress={onPress}
            style={[style, { overflow: 'hidden' }]} // Ensure overflow hidden for scaling image inside bounds if needed, or remove if scaling the whole container
        >
            <Animated.Image
                source={source}
                resizeMode={resizeMode}
                style={[
                    { width: '100%', height: '100%', borderRadius: derivedBorderRadius },
                    imageStyle,
                    animatedStyle
                ]}
                entering={entering}
            />
        </TouchableOpacity>
    );
};
