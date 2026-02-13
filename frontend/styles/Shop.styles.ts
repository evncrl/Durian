import { StyleSheet, Platform, Dimensions } from 'react-native';
import { Palette, Fonts } from '@/constants/theme';

const { width } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';
const isLarge = width > 1024;
const isMedium = width > 768;

export const colors = {
    primary: Palette.warmCopper,
    primaryDark: Palette.deepObsidian,
    primaryLight: Palette.mutedSage,
    accent: Palette.warmCopper,
    bgLight: Palette.deepObsidian,
    bgWhite: '#1A291A',
    textDark: Palette.linenWhite,
    textMedium: Palette.slate,
    textLight: Palette.mutedSage,
    borderLight: Palette.charcoalEspresso,
    borderMedium: Palette.charcoalEspresso,
};

export const shopStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.bgLight,
    },
    scrollContainer: {
        paddingBottom: 40,
    },
    header: {
        paddingTop: 40,
        paddingBottom: 30,
        paddingHorizontal: 24,
        alignItems: 'center',
        backgroundColor: colors.bgWhite,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderLight,
    },
    title: {
        fontFamily: Fonts.bold,
        fontSize: isLarge ? 42 : 32,
        color: colors.primaryDark,
        textAlign: 'center',
        letterSpacing: -1,
    },
    subtitle: {
        fontFamily: Fonts.regular,
        fontSize: 16,
        color: colors.textMedium,
        marginTop: 8,
        textAlign: 'center',
        maxWidth: 600,
    },
    section: {
        paddingHorizontal: isLarge ? 60 : 20,
        marginTop: 30,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginHorizontal: -10,
    },
    card: {
        width: isLarge ? '23%' : isMedium ? '45%' : '95%',
        marginHorizontal: '1%',
        marginBottom: 24,
        backgroundColor: colors.bgWhite,
        borderRadius: 24,
        overflow: 'hidden',
        ...Platform.select({
            web: {
                boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
                transition: 'transform 0.3s ease',
            },
            default: {
                elevation: 8,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 12,
            }
        }),
    },
    imageContainer: {
        height: 200,
        width: '100%',
        backgroundColor: colors.borderLight,
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    badge: {
        position: 'absolute',
        top: 12,
        right: 12,
        backgroundColor: colors.accent,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    badgeText: {
        fontFamily: Fonts.semiBold,
        color: '#fff',
        fontSize: 10,
        textTransform: 'uppercase',
    },
    cardContent: {
        padding: 20,
    },
    category: {
        fontFamily: Fonts.semiBold,
        fontSize: 12,
        color: colors.primary,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 4,
    },
    productName: {
        fontFamily: Fonts.bold,
        fontSize: 18,
        color: colors.textDark,
        marginBottom: 8,
    },
    description: {
        fontFamily: Fonts.regular,
        fontSize: 14,
        color: colors.textMedium,
        lineHeight: 20,
        marginBottom: 16,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: colors.borderLight,
    },
    priceContainer: {
        flexDirection: 'column',
    },
    priceLabel: {
        fontFamily: Fonts.regular,
        fontSize: 12,
        color: colors.textLight,
    },
    price: {
        fontFamily: Fonts.bold,
        fontSize: 20,
        color: colors.primaryDark,
    },
    buyButton: {
        backgroundColor: colors.primary,
        width: 44,
        height: 44,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

