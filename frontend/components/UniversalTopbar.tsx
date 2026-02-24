import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Image,
    ScrollView,
    useWindowDimensions,
    Platform,
} from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, usePathname } from 'expo-router';
import { useUser } from '@/contexts/UserContext';
import { useAuthUI } from '@/contexts/AuthUIContext';
import { Ionicons } from '@expo/vector-icons';
import { Fonts, Colors, Palette } from '@/constants/theme';
import { useCart } from '@/contexts/CartContext';



interface UniversalTopbarProps {
    // No props needed now, uses context
}

const NAV_ITEMS = [
    { label: 'Home', path: '/(tabs)', icon: 'home-outline', activeIcon: 'home' },
    { label: 'Scanner', path: '/Scanner', icon: 'scan-outline', activeIcon: 'scan' },
    { label: 'Shop', path: '/Shop', icon: 'cart-outline', activeIcon: 'cart' },
    { label: 'Chatbot', path: '/Chatbot', icon: 'chatbubble-ellipses-outline', activeIcon: 'chatbubble-ellipses' },
    { label: 'Analytics', path: '/Analytics', icon: 'analytics-outline', activeIcon: 'analytics' },
    { label: 'Forum', path: '/Forum', icon: 'people-outline', activeIcon: 'people' },
    { label: 'About', path: '/About', icon: 'information-circle-outline', activeIcon: 'information-circle' },
];

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const NavItem = ({ item, isActive, onPress, isMobile = false }: any) => {
    const scale = useSharedValue(1);
    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    return (
        <AnimatedTouchable
            style={[
                isMobile ? styles.mobileItem : styles.navItem,
                isActive && (isMobile ? styles.mobileItemActive : styles.navItemActive),
                animatedStyle
            ]}
            onPress={onPress}
            onPressIn={() => scale.value = withSpring(0.95)}
            onPressOut={() => scale.value = withSpring(1)}
            activeOpacity={0.8}
        >
            <Animated.View
                entering={FadeInDown.duration(600).delay(200 + (item.label.length * 20))} // Subtle staggered effect
                style={{ flexDirection: 'row', alignItems: 'center' }}
            >
                <Ionicons
                    name={(isActive ? item.activeIcon : item.icon) as any}
                    size={isMobile ? 22 : 18}
                    color={isActive ? Palette.warmCopper : Palette.slate}
                    style={{ marginRight: isMobile ? 16 : 8 }}
                />
                <Text style={[
                    isMobile ? styles.mobileItemLabel : styles.navLabel,
                    isActive && (isMobile ? styles.mobileItemLabelActive : styles.navLabelActive)
                ]}>
                    {item.label}
                </Text>
            </Animated.View>
        </AnimatedTouchable>
    );
};

export default function UniversalTopbar({ }: UniversalTopbarProps) {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const pathname = usePathname();
    const { user } = useUser();
    const { openAuthModal } = useAuthUI();
    const { width } = useWindowDimensions();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { cart } = useCart();

    const visibleNavItems = NAV_ITEMS.filter(item => {
        const restrictedTabs = ['Scanner', 'Chatbot', 'Analytics'];
        if (restrictedTabs.includes(item.label) && !user) {
            return false;
        }
        return true;
    });

    const isCompact = width < 768;

    const handleNav = (path: string) => {
        router.push(path as any);
        setMobileMenuOpen(false);
    };
    

    return (
        <View style={[styles.wrapper, { paddingTop: Platform.OS === 'web' ? 0 : insets.top, backgroundColor: Palette.deepObsidian }]}>
            <View style={styles.topbar}>
                {/* Brand */}
                <TouchableOpacity
                    style={[styles.brand, isCompact && { marginRight: 0, flex: 1, justifyContent: 'center' }]}
                    onPress={() => handleNav('Landing')}
                >
                    <Image source={require('../assets/images/icon.png')} style={styles.logo} />
                    <Text style={styles.brandText}>Durianostics</Text>
                </TouchableOpacity>

                {/* Desktop nav items */}
                {!isCompact && (
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.navItems}
                    >
                        {visibleNavItems.map((item) => {
                            const isActive = pathname === item.path || (item.path === '/(tabs)' && pathname === '/');
                            return (
                                <NavItem
                                    key={item.path}
                                    isActive={isActive}
                                    item={item}
                                    onPress={() => handleNav(item.path)}
                                />
                            );
                        })}
                    </ScrollView>
                )}

                {/* Right side: auth / profile + hamburger */}
                <View style={[styles.rightSection, isCompact && { marginLeft: 0 }]}>
                    {/* Cart icon */}
{user && (
  <TouchableOpacity
    style={{ marginRight: 12 }}
    onPress={() => router.push('/checkout')} // Navigate to checkout page
    activeOpacity={0.7}
  >
    <Ionicons name="cart-outline" size={28} color={Palette.warmCopper} />
    {cart.length > 0 && (
      <View style={{
        position: 'absolute',
        top: -4,
        right: -4,
        backgroundColor: 'red',
        borderRadius: 8,
        width: 16,
        height: 16,
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <Text style={{ color: '#fff', fontSize: 10, fontFamily: Fonts.bold }}>
          {cart.length}
        </Text>
      </View>
    )}
  </TouchableOpacity>
)}
                    {!isCompact && !user && (
                        <TouchableOpacity style={styles.loginBtn} onPress={() => openAuthModal('login')}>
                            <Text style={styles.loginBtnText}>Sign In</Text>
                        </TouchableOpacity>
                    )}
                    {!isCompact && user && (
                        <TouchableOpacity
                            style={styles.profileBtn}
                            onPress={() => handleNav('Profile')}
                        >
                            {user.photoProfile ? (
                                <Image source={{ uri: user.photoProfile }} style={styles.avatar} />
                            ) : (
                                <View style={styles.avatarFallback}>
                                    <Text style={styles.avatarText}>
                                        {(user.name || 'U').charAt(0).toUpperCase()}
                                    </Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    )}
                    {isCompact && (
                        <TouchableOpacity
                            style={styles.hamburger}
                            onPress={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            <Text style={styles.hamburgerIcon}>{mobileMenuOpen ? '✕' : '☰'}</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Mobile dropdown menu */}
            {isCompact && mobileMenuOpen && (
                <View style={styles.mobileMenu}>
                    {visibleNavItems.map((item) => {
                        const isActive = pathname === item.path || (item.path === '/(tabs)' && pathname === '/');
                        return (
                            <NavItem
                                key={item.path}
                                isActive={isActive}
                                item={item}
                                onPress={() => handleNav(item.path)}
                                isMobile
                            />
                        );
                    })}
                    {!user && (
                        <TouchableOpacity
                            style={styles.mobileLoginButton}
                            onPress={() => {
                                openAuthModal('login');
                                setMobileMenuOpen(false);
                            }}
                        >
                            <Text style={styles.mobileLoginBtnText}>Sign In</Text>
                        </TouchableOpacity>
                    )}
                    {user && (
                        <TouchableOpacity
                            style={styles.mobileProfileRow}
                            onPress={() => handleNav('Profile')}
                        >
                            {user.photoProfile ? (
                                <Image source={{ uri: user.photoProfile }} style={styles.avatar} />
                            ) : (
                                <View style={styles.avatarFallback}>
                                    <Text style={styles.avatarText}>
                                        {(user.name || 'U').charAt(0).toUpperCase()}
                                    </Text>
                                </View>
                            )}
                            <Text style={styles.mobileProfileName}>{user.name || 'Profile'}</Text>
                        </TouchableOpacity>
                    )}
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        zIndex: 100,
        ...(Platform.OS === 'web'
            ? { position: 'sticky' as any, top: 0 }
            : {}),
    },
    topbar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Palette.deepObsidian,
        paddingHorizontal: 16,
        paddingVertical: 10,
        height: 64,
        ...Platform.select({
            web: {
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            },
            default: {
                elevation: 3,
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            },
        }),
    },
    brand: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 24,
    },
    logo: {
        width: 36,
        height: 36,
        borderRadius: 10,
        marginRight: 10,
    },
    brandText: {
        fontFamily: Fonts.bold,
        color: Palette.warmCopper,
        fontSize: 20,
        letterSpacing: -0.6,
    },
    navItems: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    navItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
    },
    navItemActive: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    navLabel: {
        fontFamily: Fonts.medium,
        color: Palette.slate,
        fontSize: 14,
    },
    navLabelActive: {
        fontFamily: Fonts.bold,
        color: Palette.linenWhite,
    },
    rightSection: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 'auto',
        gap: 12,
    },
    loginBtn: {
        backgroundColor: Palette.warmCopper,
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 24,
    },
    loginBtnText: {
        fontFamily: Fonts.semiBold,
        color: '#fff',
        fontSize: 14,
    },
    profileBtn: {
        padding: 2,
    },
    avatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        borderWidth: 2,
        borderColor: Palette.warmCopper,
    },
    avatarFallback: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: Palette.mutedSage,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: Palette.warmCopper,
    },
    avatarText: {
        fontFamily: Fonts.bold,
        color: '#fff',
        fontSize: 14,
    },
    hamburger: {
        padding: 8,
        borderRadius: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
    },
    hamburgerIcon: {
        color: Palette.linenWhite,
        fontSize: 20,
        fontFamily: Fonts.bold,
    },
    mobileMenu: {
        backgroundColor: Palette.deepObsidian,
        paddingHorizontal: 12,
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.1)',
        ...Platform.select({
            web: {
                boxShadow: '0 8px 16px rgba(0,0,0,0.3)',
            },
            default: {
                elevation: 10,
            },
        }),
    },
    mobileItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 16,
        marginBottom: 4,
    },
    mobileItemActive: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    mobileItemLabel: {
        color: Palette.slate,
        fontSize: 16,
        fontFamily: Fonts.medium,
    },
    mobileItemLabelActive: {
        color: Palette.warmCopper,
        fontFamily: Fonts.bold,
    },
    mobileLoginButton: { // Mapping the manual find from before
        backgroundColor: Palette.warmCopper,
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
        marginTop: 12,
        marginBottom: 8,
    },
    mobileLoginBtnText: {
        color: '#fff',
        fontSize: 16,
        fontFamily: Fonts.bold,
    },
    mobileProfileRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.1)',
        marginTop: 8,
    },
    mobileProfileName: {
        color: Palette.linenWhite,
        fontSize: 16,
        fontFamily: Fonts.semiBold,
        marginLeft: 12,
    },
});
