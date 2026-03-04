import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Platform,
  TextInput,
  Modal,
  ScrollView as RNScrollView,
  KeyboardAvoidingView,
} from 'react-native';
import { useCart } from '@/contexts/CartContext';
import { Fonts, Palette } from '@/constants/theme';
import axios from 'axios';
import { useUser } from '@/contexts/UserContext';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { API_URL } from '@/config/appconf'; // ✅ Sourced from your checkout.tsx

export default function CartScreen() {
  const { cart, removeFromCart, clearCart, updateQuantity } = useCart();
  const { user, loading: userLoading } = useUser();
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const [loading, setLoading] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  // --- 📝 ADDRESS & PAYMENT STATES (Integrated from checkout.tsx) ---
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'GCash' | 'Card'>('COD');

  if (userLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', backgroundColor: Palette.deepObsidian }]}>
        <Text style={{ color: Palette.linenWhite }}>Loading user profile...</Text>
      </View>
    );
  }

  const renderItem = ({ item }: any) => (
    <View style={styles.card}>
      <Image source={item.image} style={styles.image} />
      <View style={styles.cardContent}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productPrice}>₱{item.price} x {item.quantity}</Text>
        <View style={styles.quantityRow}>
          <TouchableOpacity
            style={styles.quantityBtn}
            onPress={() => updateQuantity(item.id, item.quantity - 1)}
            disabled={item.quantity <= 1}
          >
            <Text style={styles.quantityText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.quantityNumber}>{item.quantity}</Text>
          <TouchableOpacity
            style={styles.quantityBtn}
            onPress={() => updateQuantity(item.id, item.quantity + 1)}
          >
            <Text style={styles.quantityText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
      <TouchableOpacity onPress={() => removeFromCart(item.id)}>
        <Ionicons name="trash-outline" size={20} color="#ef4444" />
      </TouchableOpacity>
    </View>
  );

  // --- 💳 FINAL PAYMENT LOGIC ---
  const handleProcessPayment = async () => {
    if (loading) return;
    if (!user || !user.email) {
      Alert.alert("Login Required", "Please log in to continue.");
      return;
    }

    setLoading(true);
    const payload = {
      email: user.email,
      items: cart.map(item => ({ name: item.name, price: item.price, quantity: item.quantity })),
      total: total,
      address,
      phone,
      paymentMethod,
    };

    try {
      const response = await axios.post(`${API_URL}/api/checkout`, payload);
      if (response.data.success) {
        setReceiptData({ 
          items: [...cart], 
          total, 
          transaction_id: response.data.transaction_id || 'TXN-' + Math.random().toString(36).substr(2, 9).toUpperCase()
        });
        setShowConfirm(false);
        setShowReceipt(true);
        clearCart();
      }
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.error || 'Checkout failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleContinueToConfirm = () => {
    if (!address.trim() || !phone.trim()) {
      Alert.alert('Missing Information', 'Please fill in all required fields.');
      return;
    }
    if (phone.length < 10) {
      Alert.alert('Invalid Phone', 'Please enter a valid phone number.');
      return;
    }
    setShowAddressModal(false);
    setShowConfirm(true);
  };

  return (
    <View style={[styles.container, { backgroundColor: Palette.deepObsidian }]}>
      <Text style={styles.heading}>Checkout</Text>

      {cart.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <Text style={styles.emptyText}>Your cart is empty.</Text>
          <TouchableOpacity style={[styles.payButton, { marginTop: 20, backgroundColor: Palette.warmCopper }]} onPress={() => router.push('/Shop')}>
            <Text style={styles.payButtonText}>Go to Shop</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={cart}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 120 }}
        />
      )}

      {cart.length > 0 && (
        <View style={styles.footer}>
          <Text style={styles.total}>Total: ₱{total.toLocaleString()}</Text>
          <TouchableOpacity
            onPress={() => setShowAddressModal(true)}
            style={[styles.payButton, { backgroundColor: Palette.warmCopper }]} 
            disabled={loading}
          >
            <Text style={styles.payButtonText}>Pay Now</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* --- 🏠 MODAL 1: Address & Payment Details --- */}
      <Modal visible={showAddressModal} animationType="slide" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Delivery Details</Text>
            
            <Text style={styles.inputLabel}>Delivery Address</Text>
            <TextInput 
              style={[styles.input, { height: 80 }]} 
              placeholder="House No., Street, Barangay, City" 
              placeholderTextColor="#666"
              multiline
              value={address}
              onChangeText={setAddress}
            />

            <Text style={styles.inputLabel}>Phone Number</Text>
            <TextInput 
              style={styles.input} 
              placeholder="09XXXXXXXXX" 
              placeholderTextColor="#666"
              keyboardType="phone-pad"
              maxLength={11}
              value={phone}
              onChangeText={setPhone}
            />

            <Text style={styles.inputLabel}>Payment Method</Text>
            <View style={styles.paymentRow}>
              {['COD', 'GCash', 'Card'].map((method) => (
                <TouchableOpacity 
                  key={method} 
                  style={[styles.methodBtn, paymentMethod === method && styles.methodBtnActive]}
                  onPress={() => setPaymentMethod(method as any)}
                >
                  <Text style={[styles.methodText, paymentMethod === method && styles.methodTextActive]}>{method}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalActionRow}>
              <TouchableOpacity onPress={() => setShowAddressModal(false)} style={[styles.payButton, { flex: 1, backgroundColor: Palette.slate }]}>
                <Text style={styles.payButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleContinueToConfirm} style={[styles.payButton, { flex: 1, backgroundColor: Palette.warmCopper }]}>
                <Text style={styles.payButtonText}>Continue</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* --- ⚠️ MODAL 2: Final Confirmation --- */}
      {showConfirm && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Confirm Your Order</Text>
            <Text style={styles.modalItemText}>You are about to pay ₱{total.toLocaleString()} via {paymentMethod}. Proceed?</Text>
            
            <View style={styles.confirmBox}>
               <Text style={styles.confirmLabel}>Deliver to:</Text>
               <Text style={styles.confirmValue}>{phone}</Text>
               <Text style={styles.confirmValue}>{address}</Text>
            </View>

            <View style={styles.modalActionRow}>
              <TouchableOpacity onPress={() => setShowConfirm(false)} style={[styles.payButton, { flex: 1, backgroundColor: Palette.slate }]}>
                <Text style={styles.payButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleProcessPayment} style={[styles.payButton, { flex: 1, backgroundColor: Palette.warmCopper }]}>
                <Text style={styles.payButtonText}>{loading ? "Processing..." : "Confirm"}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* --- ✅ MODAL 3: Success Receipt --- */}
      {showReceipt && receiptData && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Ionicons name="checkmark-circle" size={60} color="#22c55e" style={{ alignSelf: 'center', marginBottom: 10 }} />
            <Text style={[styles.modalTitle, { textAlign: 'center' }]}>Order Placed!</Text>
            <RNScrollView style={{ maxHeight: 200, marginVertical: 10 }}>
              {receiptData.items.map((item: any, i: number) => (
                <View key={i} style={styles.receiptRow}>
                  <Text style={styles.modalItemText}>{item.name} x {item.quantity}</Text>
                  <Text style={styles.modalItemText}>₱{item.price * item.quantity}</Text>
                </View>
              ))}
            </RNScrollView>
            <Text style={styles.receiptTotal}>Grand Total: ₱{receiptData.total.toLocaleString()}</Text>
            <TouchableOpacity style={[styles.payButton, { marginTop: 15, backgroundColor: Palette.warmCopper }]} onPress={() => setShowReceipt(false)}>
              <Text style={styles.payButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  heading: { fontFamily: Fonts.bold, fontSize: 28, marginBottom: 24, color: Palette.linenWhite },
  emptyText: { fontFamily: Fonts.medium, fontSize: 16, textAlign: 'center', color: Palette.slate },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: Palette.charcoalEspresso, padding: 16, borderRadius: 16, marginBottom: 16 },
  image: { width: 64, height: 64, borderRadius: 12, marginRight: 16 },
  cardContent: { flex: 1 },
  productName: { fontFamily: Fonts.semiBold, fontSize: 16, color: Palette.linenWhite },
  productPrice: { fontFamily: Fonts.medium, fontSize: 14, color: Palette.slate, marginTop: 4 },
  quantityRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  quantityBtn: { backgroundColor: Palette.warmCopper, width: 28, height: 28, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  quantityText: { color: '#fff', fontFamily: Fonts.bold, fontSize: 18 },
  quantityNumber: { color: Palette.linenWhite, marginHorizontal: 12, fontFamily: Fonts.semiBold },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 24, backgroundColor: Palette.deepObsidian, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)' },
  total: { fontFamily: Fonts.bold, fontSize: 22, marginBottom: 12, color: Palette.linenWhite },
  payButton: { paddingVertical: 14, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  payButtonText: { color: '#fff', fontFamily: Fonts.bold, fontSize: 16 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' },
  modalContainer: { width: '90%', backgroundColor: Palette.charcoalEspresso, borderRadius: 20, padding: 24 },
  modalTitle: { fontFamily: Fonts.bold, fontSize: 22, marginBottom: 15, color: Palette.linenWhite },
  inputLabel: { color: Palette.slate, fontSize: 12, marginBottom: 5, fontFamily: Fonts.medium, marginTop: 10 },
  input: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 10, padding: 12, color: '#fff', fontFamily: Fonts.regular, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  paymentRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
  methodBtn: { flex: 1, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: Palette.slate, alignItems: 'center' },
  methodBtnActive: { backgroundColor: Palette.warmCopper, borderColor: Palette.warmCopper },
  methodText: { color: Palette.slate, fontFamily: Fonts.semiBold, fontSize: 12 },
  methodTextActive: { color: '#fff' },
  modalActionRow: { flexDirection: 'row', gap: 10, marginTop: 25 },
  confirmBox: { marginTop: 15, padding: 12, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 10 },
  confirmLabel: { color: Palette.slate, fontSize: 11, textTransform: 'uppercase' },
  confirmValue: { color: Palette.linenWhite, fontSize: 14, marginTop: 2 },
  receiptRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  receiptTotal: { fontFamily: Fonts.bold, fontSize: 18, marginTop: 15, color: Palette.linenWhite, textAlign: 'right' },
  modalItemText: { fontFamily: Fonts.medium, fontSize: 14, color: Palette.linenWhite }, // ✅ FIXED DUPLICATE KEY ISSUE
});