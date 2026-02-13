import React, { useState } from 'react';
import { useWindowDimensions } from 'react-native';
import Animated, { useAnimatedStyle, withSpring, SharedValue, withDelay } from 'react-native-reanimated';

interface ScrollRevealProps {
    children: React.ReactNode;
    scrollY: SharedValue<number>;
    index?: number;
    style?: any;
}

export const ScrollReveal = ({ children, scrollY, index = 0, style }: ScrollRevealProps) => {
    const [layoutY, setLayoutY] = useState(0);
    const { height: windowHeight } = useWindowDimensions();

    const animatedStyle = useAnimatedStyle(() => {
        const isVisible = scrollY.value + windowHeight > layoutY + 100;
        return {
            opacity: withDelay(
                index * 100,
                withSpring(isVisible ? 1 : 0, { damping: 20, stiffness: 90 })
            ),
            transform: [
                {
                    translateY: withDelay(
                        index * 100,
                        withSpring(isVisible ? 0 : 50, { damping: 20, stiffness: 90 })
                    )
                },
                {
                    scale: withDelay(
                        index * 100,
                        withSpring(isVisible ? 1 : 0.9, { damping: 20, stiffness: 90 })
                    )
                }
            ],
        };
    });

    return (
        <Animated.View
            onLayout={(e) => {
                // Only set layoutY if it hasn't been set or if it changes significantly
                // This avoids potential re-render loops if layout shifts slightly
                if (Math.abs(e.nativeEvent.layout.y - layoutY) > 1) {
                    setLayoutY(e.nativeEvent.layout.y);
                }
            }}
            style={[style, animatedStyle]}
        >
            {children}
        </Animated.View>
    );
};
