import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  ScrollView,
  Modal,
  Image,
  Alert,
} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import Footer from "@/components/Footer";
import { shopStyles, colors } from "@/styles/Shop.styles";
import { Fonts } from "@/constants/theme";
import Animated, { useSharedValue, useAnimatedScrollHandler, FadeInDown } from 'react-native-reanimated';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { API_URL } from "@/config/appconf";

// Interface for real data from MongoDB
interface Product {
  _id: string;
  name: string;
  category: string;
  price: number;
  image_url: string; // URL from Cloudinary/Backend
  description: string;
  stock: number;
  isNew?: boolean;
}

export default function Shop() {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  
  // Modal States
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  const categories = ["All", "Fresh Fruit", "Snacks", "Pantry", "Beverages"];

  // 1. Fetch Products from Backend
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/shop/products`, {
        headers: {
          'ngrok-skip-browser-warning': 'true',
          'Accept': 'application/json',
        }
      });
      const data = await response.json();
      if (data.success) {
        setProducts(data.products);
        setFilteredProducts(data.products);
      }
    } catch (error) {
      console.error("Shop Fetch Error:", error);
      // Fallback to local data if API fails for testing
      // setProducts(DUMMY_PRODUCTS); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // 2. Filter & Search Logic
  useEffect(() => {
    let result = products;
    if (selectedCategory !== "All") {
      result = result.filter(p => p.category === selectedCategory);
    }
    if (searchQuery) {
      result = result.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    setFilteredProducts(result);
  }, [searchQuery, selectedCategory, products]);

  const handleAddToCart = (product: Product) => {
    Alert.alert("Success", `${product.name} added to cart!`);
    setDetailModalVisible(false);
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bgLight }}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: 16, fontFamily: Fonts.regular, color: colors.textMedium }}>Gathering fresh harvests...</Text>
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
        {/* Header Section */}
        <View style={shopStyles.header}>
          <Text style={shopStyles.title}>Durianostics Shop</Text>
          <Text style={shopStyles.subtitle}>Premium durian varieties delivered to your door.</Text>
        </View>

        {/* Search & Filter Controls */}
        <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
          <View style={shopStyles.searchBarContainer}>
            <Ionicons name="search" size={20} color={colors.textLight} />
            <TextInput
              style={shopStyles.searchInput}
              placeholder="Search products..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 15 }}>
            {categories.map((cat) => (
              <TouchableOpacity 
                key={cat} 
                onPress={() => setSelectedCategory(cat)}
                style={[
                  shopStyles.categoryPill, 
                  selectedCategory === cat && { backgroundColor: colors.primary }
                ]}
              >
                <Text style={[
                  shopStyles.categoryPillText,
                  selectedCategory === cat && { color: '#fff' }
                ]}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Product Grid */}
        <View style={shopStyles.section}>
          <View style={shopStyles.grid}>
            {filteredProducts.map((product, index) => (
              <ScrollReveal key={product._id} scrollY={scrollY} style={shopStyles.card} index={index}>
                <TouchableOpacity 
                  onPress={() => {
                    setSelectedProduct(product);
                    setDetailModalVisible(true);
                  }}
                  activeOpacity={0.9}
                >
                  <View style={shopStyles.imageContainer}>
                    <Image
                      source={{ uri: product.image_url || 'https://via.placeholder.com/150' }}
                      style={shopStyles.image}
                    />
                    {product.isNew && (
                      <View style={shopStyles.badge}>
                        <Text style={shopStyles.badgeText}>New</Text>
                      </View>
                    )}
                  </View>

                  <View style={shopStyles.cardContent}>
                    <Text style={shopStyles.categoryLabel}>{product.category}</Text>
                    <Text style={shopStyles.productName}>{product.name}</Text>
                    
                    <View style={shopStyles.priceRow}>
                      <Text style={shopStyles.price}>₱{product.price.toLocaleString()}</Text>
                      <TouchableOpacity 
                        style={shopStyles.smallAddBtn}
                        onPress={() => handleAddToCart(product)}
                      >
                        <Ionicons name="cart-outline" size={20} color="#fff" />
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

      {/* Product Detail Modal */}
      <Modal
        visible={detailModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setDetailModalVisible(false)}
      >
        <View style={shopStyles.modalOverlay}>
          <View style={shopStyles.modalContent}>
            <TouchableOpacity 
              style={shopStyles.closeModalBtn} 
              onPress={() => setDetailModalVisible(false)}
            >
              <Ionicons name="close" size={28} color={colors.textDark} />
            </TouchableOpacity>

            {selectedProduct && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <Image source={{ uri: selectedProduct.image_url }} style={shopStyles.modalImage} />
                <View style={{ padding: 20 }}>
                  <Text style={shopStyles.modalCategory}>{selectedProduct.category}</Text>
                  <Text style={shopStyles.modalTitle}>{selectedProduct.name}</Text>
                  <Text style={shopStyles.modalPrice}>₱{selectedProduct.price.toLocaleString()}</Text>
                  
                  <Text style={shopStyles.modalSectionTitle}>Description</Text>
                  <Text style={shopStyles.modalDescription}>{selectedProduct.description}</Text>
                  
                  <View style={shopStyles.stockRow}>
                    <Ionicons name="cube-outline" size={18} color={colors.textMedium} />
                    <Text style={shopStyles.stockText}>Stock: {selectedProduct.stock} units available</Text>
                  </View>

                  <TouchableOpacity 
                    style={shopStyles.bigBuyBtn}
                    onPress={() => handleAddToCart(selectedProduct)}
                  >
                    <Text style={shopStyles.bigBuyBtnText}>Add to Shopping Cart</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}