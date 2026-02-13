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

type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  image: any;
  description: string;
  isNew?: boolean;
};

const DUMMY_PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Musang King Premium",
    category: "Fresh Fruit",
    price: 1850,
    image: require("../../assets/images/durian-bg.jpg"),
    description: "The gold standard of durians. Creamy, bittersweet, and incredibly rich flavor.",
    isNew: true,
  },
  {
    id: "2",
    name: "Golden Durian Chips",
    category: "Snacks",
    price: 450,
    image: require("../../assets/images/durian-bg1.jpg"),
    description: "Vacuum-fried to preserve the intense natural flavor and crunch.",
  },
  {
    id: "3",
    name: "Artisan Durian Spread",
    category: "Pantry",
    price: 320,
    image: require("../../assets/images/durian-bg2.jpg"),
    description: "Hand-crafted with 100% real pulp. Perfect for toasts and desserts.",
  },
  {
    id: "4",
    name: "D24 Traditional Harvest",
    category: "Fresh Fruit",
    price: 1250,
    image: require("../../assets/images/feature1.jpg"),
    description: "Balanced sweetness with a smooth, custard-like texture. A classic favorite.",
    isNew: true,
  },
];

export default function Shop() {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setProducts(DUMMY_PRODUCTS);
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
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
                      <Text style={shopStyles.price}>₱{product.price.toLocaleString()}</Text>
                    </View>

                    <TouchableOpacity
                      style={shopStyles.buyButton}
                      onPress={() => alert('Adding to cart...')}
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

