import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    ActivityIndicator,
    Platform,
    Modal,
    ScrollView,
    StyleSheet,
    Dimensions,
} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import Footer from "@/components/Footer";
import { shopStyles, colors } from "@/styles/Shop.styles";
import { Fonts, Palette } from "@/constants/theme";
import Animated, { useSharedValue, useAnimatedScrollHandler, FadeInDown } from 'react-native-reanimated';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { AnimatedImage } from '@/components/ui/AnimatedImage';
import { useAuthUI } from '@/contexts/AuthUIContext';
import { useUser } from '@/contexts/UserContext';
import { useCart } from '@/contexts/CartContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type Review = {
    _id: string;
    username: string;
    rating: number;
    comment: string;
    created_at: string;
};

type Product = {
    id: string;
    name: string;
    category: string;
    price: number;
    image: any;
    description: string;
    isNew?: boolean;
    avgRating?: number;
};

const API_URL = 'https://unacademic-amusingly-vernie.ngrok-free.dev'; 

export default function Shop() {
    const [loading, setLoading] = useState(true);
    const [products, setProducts] = useState<Product[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loadingReviews, setLoadingReviews] = useState(false);
    const [showModal, setShowModal] = useState(false);

    const scrollY = useSharedValue(0);
    const { openAuthModal } = useAuthUI();
    const { user } = useUser();  
    const { addToCart } = useCart();

    const scrollHandler = useAnimatedScrollHandler((event) => {
        scrollY.value = event.contentOffset.y;
    });

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/shop/products`, {
                headers: { 
                    'ngrok-skip-browser-warning': 'true',
                    'Accept': 'application/json'
                }
            });
            const data = await res.json();
            if (data.success && data.products) {
                const mapped = data.products.map((p: any) => ({
                    id: p._id,
                    name: p.name,
                    category: p.category,
                    price: p.price,
                    image: p.image_url ? { uri: p.image_url } : require("../../assets/images/durian-bg.jpg"),
                    description: p.description,
                    isNew: p.isNew || false,
                    avgRating: p.rating || 0,
                }));
                setProducts(mapped);
            }
        } catch (err) {
            console.error("Fetch Error:", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchReviews = async (productId: string) => {
        setLoadingReviews(true);
        setReviews([]); 
        try {
            const res = await fetch(`${API_URL}/shop/products/${productId}/reviews`, {
                headers: { 
                    'ngrok-skip-browser-warning': 'true',
                    'Accept': 'application/json'
                }
            });
            const data = await res.json();
            if (data.success) {
                setReviews(data.reviews || []);
            }
        } catch (err) {
            console.error("Reviews Error:", err);
        } finally {
            setLoadingReviews(false);
        }
    };

    const openProductDetails = (product: Product) => {
        setSelectedProduct(product);
        setShowModal(true);
        fetchReviews(product.id);
    };

    useEffect(() => { fetchProducts(); }, []);

    const renderStars = (rating: number) => {
        return (
            <View style={{ flexDirection: 'row', gap: 2 }}>
                {[1, 2, 3, 4, 5].map((star) => (
                    <Ionicons 
                        key={star} 
                        name={star <= rating ? "star" : "star-outline"} 
                        size={14} 
                        color={Palette.warmCopper} 
                    />
                ))}
            </View>
        );
    };

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Palette.deepObsidian }}>
                <ActivityIndicator size="large" color={Palette.warmCopper} />
                <Text style={{ marginTop: 16, color: Palette.slate, fontFamily: Fonts.regular }}>Curating selection...</Text>
            </View>
        );
    }

    return (
        <View style={shopStyles.container}>
            <Animated.ScrollView
                style={shopStyles.container}
                contentContainerStyle={shopStyles.scrollContainer}
                showsVerticalScrollIndicator={false}
                onScroll={scrollHandler}
                scrollEventThrottle={16}
            >
                <View style={shopStyles.header}>
                    <Text style={[shopStyles.title, { color: Palette.linenWhite }]}>Durianostics Shop</Text>
                    <Text style={[shopStyles.subtitle, { color: Palette.slate }]}>Premium durian varieties and artisan products.</Text>
                </View>

                <View style={shopStyles.section}>
                    <View style={shopStyles.grid}>
                        {products.map((product, index) => (
                            <ScrollReveal key={product.id} scrollY={scrollY} style={shopStyles.card} index={index}>
                                <TouchableOpacity onPress={() => openProductDetails(product)} activeOpacity={0.9}>
                                    <View style={shopStyles.imageContainer}>
                                        <AnimatedImage source={product.image} style={shopStyles.image} />
                                        {product.isNew && (
                                            <View style={shopStyles.badge}><Text style={shopStyles.badgeText}>New</Text></View>
                                        )}
                                    </View>

                                    <View style={shopStyles.cardContent}>
                                        <Text style={shopStyles.category}>{product.category}</Text>
                                        <Text style={shopStyles.productName}>{product.name}</Text>
                                        
                                        {/* ✅ STAR RATING REMOVED FROM CARD */}
                                        
                                        <Text style={shopStyles.description} numberOfLines={2}>{product.description}</Text>
                                        
                                        <View style={shopStyles.priceRow}>
                                            <View>
                                                <Text style={shopStyles.priceLabel}>Price</Text>
                                                <Text style={[shopStyles.price, { color: Palette.warmCopper }]}>₱{product.price.toLocaleString()}</Text>
                                            </View>
                                            <TouchableOpacity 
                                                style={[shopStyles.buyButton, { backgroundColor: Palette.warmCopper }]}
                                                onPress={() => {
                                                    if (!user) { openAuthModal('login'); return; }
                                                    addToCart({ ...product, quantity: 1 });
                                                    alert('Added to Cart');
                                                }}
                                            >
                                                <Ionicons name="add" size={24} color="#fff" />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            </ScrollReveal>
                        ))}
                    </View>
                </View>
                <Footer />
            </Animated.ScrollView>

            <Modal visible={showModal} animationType="fade" transparent={true} onRequestClose={() => setShowModal(false)}>
                <View style={modalStyles.overlay}>
                    <View style={modalStyles.content}>
                        <TouchableOpacity style={modalStyles.closeBtn} onPress={() => setShowModal(false)}>
                            <Ionicons name="close" size={24} color={Palette.slate} />
                        </TouchableOpacity>

                        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
                            <AnimatedImage source={selectedProduct?.image} style={modalStyles.headerImage} />
                            
                            <View style={modalStyles.infoSection}>
                                <Text style={modalStyles.modalCategory}>{selectedProduct?.category}</Text>
                                <Text style={modalStyles.modalName}>{selectedProduct?.name}</Text>
                                <Text style={modalStyles.modalPrice}>₱{selectedProduct?.price.toLocaleString()}</Text>
                                <Text style={modalStyles.modalDesc}>{selectedProduct?.description}</Text>
                            </View>

                            <View style={modalStyles.reviewSection}>
                                <Text style={modalStyles.reviewTitle}>Customer Reviews</Text>
                                {loadingReviews ? (
                                    <ActivityIndicator color={Palette.warmCopper} style={{ marginVertical: 10 }} />
                                ) : reviews.length === 0 ? (
                                    <View style={modalStyles.noReviewsContainer}>
                                        <Ionicons name="chatbubble-ellipses-outline" size={32} color={Palette.slate} />
                                        <Text style={modalStyles.noReviews}>No reviews yet for this product.</Text>
                                    </View>
                                ) : (
                                    reviews.map((rev) => (
                                        <View key={rev._id} style={modalStyles.reviewCard}>
                                            <View style={modalStyles.reviewHeader}>
                                                <Text style={modalStyles.reviewerName}>{rev.username}</Text>
                                                {/* STARS KEPT IN REVIEWS AS PER PROF REQUIREMENT */}
                                                {renderStars(rev.rating)}
                                            </View>
                                            <Text style={modalStyles.reviewText}>{rev.comment}</Text>
                                        </View>
                                    ))
                                )}
                            </View>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const modalStyles = StyleSheet.create({
    overlay: { 
        flex: 1, 
        backgroundColor: 'rgba(0,0,0,0.85)', 
        justifyContent: 'center', 
        alignItems: 'center' 
    },
    content: { 
        backgroundColor: Palette.deepObsidian, 
        borderRadius: 24, 
        width: Platform.OS === 'web' ? 450 : SCREEN_WIDTH * 0.85, 
        maxHeight: SCREEN_HEIGHT * 0.65, // ✅ REDUCED HEIGHT FOR COMPACT LOOK
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)'
    },
    closeBtn: { position: 'absolute', top: 15, right: 15, zIndex: 10, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 20, padding: 6 },
    headerImage: { width: '100%', height: 180 }, // Slightly smaller image
    infoSection: { padding: 20, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
    modalCategory: { color: Palette.warmCopper, fontFamily: Fonts.bold, textTransform: 'uppercase', letterSpacing: 1, fontSize: 11 },
    modalName: { color: Palette.linenWhite, fontFamily: Fonts.bold, fontSize: 20, marginTop: 4 },
    modalPrice: { color: Palette.warmCopper, fontFamily: Fonts.bold, fontSize: 16, marginTop: 4 },
    modalDesc: { color: Palette.slate, fontFamily: Fonts.regular, fontSize: 13, marginTop: 10, lineHeight: 18 },
    reviewSection: { padding: 20 },
    reviewTitle: { color: Palette.linenWhite, fontFamily: Fonts.bold, fontSize: 16, marginBottom: 12 },
    noReviewsContainer: { alignItems: 'center', paddingVertical: 15, gap: 8 },
    noReviews: { color: Palette.slate, fontStyle: 'italic', fontSize: 12 },
    reviewCard: { backgroundColor: 'rgba(255,255,255,0.03)', padding: 12, borderRadius: 12, marginBottom: 8 },
    reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
    reviewerName: { color: Palette.linenWhite, fontFamily: Fonts.semiBold, fontSize: 13 },
    reviewText: { color: Palette.slate, fontSize: 12, lineHeight: 18 },
});