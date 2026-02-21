import React from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Platform,
} from 'react-native';
import { useCart } from '@/contexts/CartContext';
import { Fonts, Palette } from '@/constants/theme';

export default function Checkout() {
  const { cart, removeFromCart, clearCart, updateQuantity } = useCart();
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const renderItem = ({ item }: any) => (
    <View style={styles.card}>
      <Image source={item.image} style={styles.image} />

      <View style={styles.cardContent}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productPrice}>₱{item.price} x {item.quantity}</Text>

        {/* Quantity controls */}
        <View style={styles.quantityRow}>
          <TouchableOpacity
  style={[styles.quantityBtn]}
  onPress={() => updateQuantity(item.id, item.quantity - 1)}
  disabled={item.quantity <= 1}
  activeOpacity={0.7} // React Native default, gives a pressed effect
>
  <Text style={styles.quantityText}>-</Text>
</TouchableOpacity>

<TouchableOpacity
  style={[styles.quantityBtn]}
  onPress={() => updateQuantity(item.id, item.quantity + 1)}
  activeOpacity={0.7}
>
  <Text style={styles.quantityText}>+</Text>
</TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity onPress={() => removeFromCart(item.id)}>
        <Text style={styles.removeBtn}>Remove</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: Palette.deepObsidian }]}>
      <Text style={styles.heading}>Checkout</Text>

      {cart.length === 0 ? (
        <Text style={styles.emptyText}>Your cart is empty.</Text>
      ) : (
        <FlatList
          data={cart}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 32 }}
        />
      )}

      {cart.length > 0 && (
        <View style={styles.footer}>
          <Text style={styles.total}>Total: ₱{total}</Text>

          <TouchableOpacity
            onPress={() => {
              Alert.alert('Payment', 'Proceed to payment (mock)');
              clearCart();
            }}
            style={[styles.payButton, { backgroundColor: Palette.warmCopper }]}
          >
            <Text style={styles.payButtonText}>Pay Now</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  heading: {
    fontFamily: Fonts.bold,
    fontSize: 28,
    marginBottom: 24,
    color: Palette.linenWhite,
  },
  emptyText: {
    fontFamily: Fonts.medium,
    fontSize: 16,
    textAlign: 'center',
    marginTop: 50,
    color: Palette.slate,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.charcoalEspresso,
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  image: {
    width: 64,
    height: 64,
    borderRadius: 12,
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
  },
  productName: {
    fontFamily: Fonts.semiBold,
    fontSize: 16,
    color: Palette.linenWhite,
  },
  productPrice: {
    fontFamily: Fonts.medium,
    fontSize: 14,
    color: Palette.slate,
    marginTop: 4,
  },
  removeBtn: {
    fontFamily: Fonts.bold,
    color: '#ef4444',
    fontSize: 14,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
 quantityBtn: {
  backgroundColor: Palette.warmCopper, // 🔥 changed from stoneGray
  paddingHorizontal: 12,
  paddingVertical: 4,
  borderRadius: 8,
  justifyContent: 'center',
  alignItems: 'center',
  ...Platform.select({
    ios: {
      shadowColor: Palette.warmCopper,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.4,
      shadowRadius: 4,
    },
    android: {
      elevation: 4,
    },
    web: {
      boxShadow: `0 2px 6px ${Palette.warmCopper}40`,
      transition: 'background-color 0.2s',
    },
  }),
},
quantityText: {
  color: Palette.linenWhite, // keep + and - white
  fontFamily: Fonts.bold,
  fontSize: 16,
},
  quantityNumber: {
    color: Palette.linenWhite,
    fontFamily: Fonts.semiBold,
    fontSize: 16,
    marginHorizontal: 12,
  },
  footer: {
    marginTop: 16,
  },
  total: {
    fontFamily: Fonts.bold,
    fontSize: 20,
    marginBottom: 12,
    color: Palette.linenWhite,
  },
  payButton: {
    paddingVertical: 16,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  payButtonText: {
    color: '#fff',
    fontFamily: Fonts.bold,
    fontSize: 16,
  },
});