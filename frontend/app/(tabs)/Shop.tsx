import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import Footer from "@/components/Footer";
import { shopStyles, colors } from "@/styles/Shop.styles";
import { Fonts } from "@/constants/theme";
import Animated, { useSharedValue, useAnimatedScrollHandler, FadeInDown } from 'react-native-reanimated';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { AnimatedImage } from '@/components/ui/AnimatedImage';
import { useRouter } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthUI } from '@/contexts/AuthUIContext';
import { useUser } from '@/contexts/UserContext';
import { useCart } from '@/contexts/CartContext';



type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  image: any;
  description: string;
  isNew?: boolean;
};

const API_URL = 'http://192.168.100.242:8000'; // Update if using ngrok

export default function Shop() {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const scrollY = useSharedValue(0);
  const router = useRouter();
  const { openAuthModal } = useAuthUI();
  const { user } = useUser();  
  const { addToCart } = useCart();
  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  useEffect(() => {
    const fetchProducts = async () => {
        setLoading(true);
        try {
            // 1. Ensure API call is correct and includes ngrok header if needed
            const res = await fetch(`${API_URL}/shop/products`, {
                headers: { 'ngrok-skip-browser-warning': 'true' }
            });
            const data = await res.json();

            // 2. check if 'products' field exists in response
            if (data.success && data.products) {
                const mapped = data.products.map((p: any) => ({
                    id: p._id,
                    name: p.name,
                    category: p.category,
                    price: p.price,
                    // 3. FIX: Use 'image_url' 
                    image: p.image_url 
                        ? { uri: p.image_url } 
                        : require("../../assets/images/durian-bg.jpg"),
                    description: p.description,
                    isNew: p.isNew || false,
                }));
                setProducts(mapped);
            }
        } catch (err) {
            console.error("Fetch Error:", err);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };
    fetchProducts();
}, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bgLight }}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: 16, fontFamily: Fonts.regular, color: colors.textMedium }}>Curating your selection...</Text>
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
          <ScrollReveal scrollY={scrollY}>
            <Animated.Text
              entering={FadeInDown.duration(800).delay(200)}
              style={shopStyles.title}
            >
              Durianostics Shop
            </Animated.Text>
          </ScrollReveal>
          <ScrollReveal scrollY={scrollY}>
            <Animated.Text
              entering={FadeInDown.duration(800).delay(300)}
              style={shopStyles.subtitle}
            >
              Discover our curated collection of premium durian varieties and artisan products.
            </Animated.Text>
          </ScrollReveal>
        </View>

        <View style={shopStyles.section}>
          <View style={shopStyles.grid}>
            {products.map((product, index) => (
              <ScrollReveal key={product.id} scrollY={scrollY} style={shopStyles.card} index={index}>
                <View style={shopStyles.imageContainer}>
                  <AnimatedImage
                    source={product.image}
                    style={shopStyles.image}
                    entering={FadeInDown.delay(index * 100)}
                  />
                  {product.isNew && (
                    <View style={shopStyles.badge}>
                      <Text style={shopStyles.badgeText}>New Arrival</Text>
                    </View>
                  )}
                </View>

                <View style={shopStyles.cardContent}>
                  <Text style={shopStyles.category}>{product.category}</Text>
                  <Text style={shopStyles.productName}>{product.name}</Text>
                  <Text style={shopStyles.description} numberOfLines={2}>
                    {product.description}
                  </Text>

                  <View style={shopStyles.priceRow}>
                    <View style={shopStyles.priceContainer}>
                      <Text style={shopStyles.priceLabel}>Price</Text>
                      <Text style={shopStyles.price}>₱{typeof product.price === 'number' ? product.price.toLocaleString() : product.price ? String(product.price) : '0'}</Text>
                    </View>

                    <TouchableOpacity
  style={shopStyles.buyButton}
  onPress={() => {
     if (!user) {
      openAuthModal('login'); // open login modal for unauthenticated users
      return;
    }
     addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.image,
    });

    alert('Added to Cart');
    
  }}
  activeOpacity={0.7}
>
  <Ionicons name="add" size={24} color="#fff" />
</TouchableOpacity>
                  </View>
                </View>
              </ScrollReveal>
            ))}
          </View>
        </View>

        <Footer />
      </Animated.ScrollView>
    </View>
  );
}

