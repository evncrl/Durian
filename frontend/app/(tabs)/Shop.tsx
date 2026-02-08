
import React, { useEffect, useState } from "react";
import Footer from "../components/Footer";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Platform,
} from "react-native";

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    padding: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  subheader: {
    fontSize: 16,
    color: '#666',
    marginBottom: 18,
    textAlign: 'center',
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
  },
  productCard: {
    width: 220,
    backgroundColor: '#f4f4f4',
    borderRadius: 14,
    padding: 16,
    margin: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  productImage: {
    width: 120,
    height: 120,
    borderRadius: 10,
    marginBottom: 10,
    resizeMode: 'cover',
  },
  productName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  productDesc: {
    fontSize: 14,
    color: '#555',
    marginBottom: 8,
    textAlign: 'center',
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1b5e20',
  },
  buyButton: {
    backgroundColor: '#1b5e20',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buyButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    textAlign: 'center',
  },
});

type Product = {
  id: string;
  name: string;
  price: number;
  image: any;
  description: string;
};

const DUMMY_PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Premium Durian",
    price: 1200,
    image: require("../../assets/images/durian-bg.jpg"),
    description: "Top-grade durian, hand-picked for quality.",
  },
  {
    id: "2",
    name: "Durian Chips",
    price: 350,
    image: require("../../assets/images/durian-bg1.jpg"),
    description: "Crispy, delicious durian chips.",
  },
  {
    id: "3",
    name: "Durian Jam",
    price: 250,
    image: require("../../assets/images/durian-bg2.jpg"),
    description: "Sweet and creamy durian jam.",
  },
];

export default function Shop() {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setProducts(DUMMY_PRODUCTS);
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading shop...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, flexDirection: 'column', backgroundColor: '#fff' }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.contentContainer}>
        <Text style={styles.title}>🛒 Durian Shop</Text>
        <Text style={styles.subheader}>Buy premium durian products</Text>
        <View style={styles.productsGrid}>
          {products.map((product) => (
            <View key={product.id} style={styles.productCard}>
              <Image source={product.image} style={styles.productImage} />
              <Text style={styles.productName}>{product.name}</Text>
              <Text style={styles.productDesc}>{product.description}</Text>
              <Text style={styles.productPrice}>₱{product.price}</Text>
              <TouchableOpacity style={styles.buyButton} onPress={() => alert('Feature coming soon!')}>
                <Text style={styles.buyButtonText}>Buy Now</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>
      <Footer />
    </View>
  );
}