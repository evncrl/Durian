
import React, { useState, useCallback, useRef, useEffect } from "react";
import { View, StyleSheet, ActivityIndicator, Text, Platform } from "react-native";
import YoutubePlayer, { YoutubeIframeRef } from "react-native-youtube-iframe";
import { Palette } from "@/constants/theme";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import Animated, { FadeInDown, SharedValue, useAnimatedReaction, runOnJS } from "react-native-reanimated";

interface VideoSectionProps {
    videoId: string;
    scrollY: SharedValue<number>;
    width: number;
    index: number;
}

export const VideoSection: React.FC<VideoSectionProps> = ({ videoId, scrollY, width, index }) => {
    const [playing, setPlaying] = useState(false);
    const [loading, setLoading] = useState(true);
    const playerRef = useRef<YoutubeIframeRef>(null);

    // Calculate approximate position based on index (rough estimate or passed prop would be better)
    // For now, let's assume it's the second section (index 1) after hero
    // Hero height is roughly width * 0.5 or 500px depending on screen
    // We can use a threshold logic: if scrollY is > 200 and < 1000, play

    // Play immediately on mount and keep playing
    useEffect(() => {
        setPlaying(true);
    }, []);

    const onStateChange = useCallback((state: string) => {
        if (state === "ended") {
            setPlaying(false);
        }
    }, []);

    // Web-specific implementation to avoid postMessage errors and ensure reliable autoplay
    if (Platform.OS === 'web') {
        const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0&controls=1&enablejsapi=1&origin=${window.location.origin}`;

        return (
            <View style={styles.container}>
                <ScrollReveal scrollY={scrollY} index={index} style={{ width: '100%' }}>
                    <Animated.View entering={FadeInDown.duration(800).delay(200)} style={styles.videoWrapper}>
                        <iframe
                            width="100%"
                            height="100%"
                            src={embedUrl}
                            style={{ border: 'none', width: '100%', height: width * 0.5625 }} // Keep 16:9 ratio based on full width
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    </Animated.View>
                </ScrollReveal>
            </View>
        );
    }

    // Mobile render
    return (
        <View style={styles.container}>
            <ScrollReveal scrollY={scrollY} index={index} style={{ width: '100%' }}>
                <Animated.View entering={FadeInDown.duration(800).delay(200)} style={styles.videoWrapper}>
                    {loading && (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color={Palette.warmCopper} />
                        </View>
                    )}
                    <YoutubePlayer
                        ref={playerRef}
                        height={width * 0.5625}
                        width={width} // Full width
                        play={playing}
                        videoId={videoId}
                        mute={false} // Try to play with sound
                        onChangeState={onStateChange}
                        onReady={() => setLoading(false)}
                        webViewStyle={{ opacity: 0.99 }}
                        webViewProps={{
                            allowsInlineMediaPlayback: true,
                        }}
                    />
                </Animated.View>
            </ScrollReveal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingVertical: 0, // Remove vertical padding if desired, or keep as needed
        alignItems: 'center',
        width: '100%',
        marginBottom: 40,
    },
    videoWrapper: {
        width: '100%', // Full width
        backgroundColor: Palette.deepObsidian,
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
    },
    loadingContainer: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Palette.stoneGray,
        zIndex: 1,
    },
    caption: {
        // Removed caption for cleaner full-width look, or can be re-added below with padding
        display: 'none'
    }
});
