import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCart } from '@/contexts/CartContext';
import { useUser } from '@/contexts/UserContext';
import axios from 'axios';
import { API_URL } from '@/config/appconf';

interface CheckoutResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export default function AddressInput() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { cart, clearCart } = useCart();
  const { user, loading: userLoading } = useUser();

  // Debug log for user context
  useEffect(() => {
    console.log('[AddressInput] user:', user, 'userLoading:', userLoading);
    if (!userLoading && !user) {
      console.log('[AddressInput] No user found, redirecting to login.');
      navigation.navigate('login' as never); // Adjust 'login' to your login route name
    }
  }, [user, userLoading, navigation]);

  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'GCash' | 'Card'>('COD');
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    console.log('Continue button pressed');
    if (!address.trim() || !phone.trim()) {
      console.log('Validation failed: missing address or phone');
      Alert.alert('Missing Information', 'Please fill in all required fields.');
      return;
    }
    if (phone.length < 10) {
      console.log('Validation failed: invalid phone');
      Alert.alert('Invalid Phone Number', 'Please enter a valid phone number.');
      return;
    }
    if (!user || !user.email) {
      console.log('Validation failed: user not logged in');
      Alert.alert('Login Required', 'Please log in to continue.');
      return;
    }
    if (!cart || cart.length === 0) {
      console.log('Validation failed: cart empty');
      Alert.alert('Cart Empty', 'Your cart is empty.');
      return;
    }

    setLoading(true);
    console.log('Sending payload:', {
      email: user.email,
      items: cart.map(item => ({ name: item.name, price: item.price, quantity: item.quantity })),
      total: cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
      address,
      phone,
      paymentMethod,
    });

    const payload = {
      email: user.email,
      items: cart.map(item => ({
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
      total: cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
      address,
      phone,
      paymentMethod,
    };

    try {
      const response = await axios.post<CheckoutResponse>(
        `${API_URL}/api/checkout`,
        payload
      );
      console.log('API response:', response.data);

      if (response.data.success) {
        clearCart();
        Alert.alert('Order Confirmed', 'A confirmation email has been sent.');
        console.log('Navigating to checkout');
        navigation.navigate('checkout' as never);
      } else {
        console.log('API error:', response.data.message);
        Alert.alert('Error', response.data.message || 'Checkout failed.');
      }
    } catch (err: any) {
      let message = 'Checkout failed.';
      if (err?.response?.data?.error) {
        message = err.response.data.error;
      }
      console.log('Catch error:', err, message);
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
      console.log('Done processing continue');
    }
  };

  if (userLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Loading user...</Text>
      </View>
    );
  }
  if (!user) {
    // Optionally render nothing or a fallback while redirecting
    return null;
  }
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Delivery Details</Text>

      <Text style={styles.label}>Delivery Address</Text>
      <TextInput
        style={styles.input}
        placeholder="House No., Street, Barangay, City"
        value={address}
        onChangeText={setAddress}
        multiline
      />

      <Text style={styles.label}>Phone Number</Text>
      <TextInput
        style={styles.input}
        placeholder="09XXXXXXXXX"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        maxLength={11}
      />

      <Text style={styles.label}>Payment Method</Text>
      <View style={styles.paymentContainer}>
        {['COD', 'GCash', 'Card'].map(method => (
          <TouchableOpacity
            key={method}
            style={[
              styles.paymentOption,
              paymentMethod === method && styles.paymentSelected,
            ]}
            onPress={() => setPaymentMethod(method as 'COD' | 'GCash' | 'Card')}
          >
            <Text
              style={[
                styles.paymentText,
                paymentMethod === method && styles.paymentTextSelected,
              ]}
            >
              {method}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={handleContinue}
        disabled={loading || userLoading}
      >
        <Text style={styles.buttonText}>
          {loading || userLoading ? 'Processing...' : 'Continue'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    marginBottom: 6,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: '#f9f9f9',
  },
  paymentContainer: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  paymentOption: {
    flex: 1,
    paddingVertical: 12,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    alignItems: 'center',
  },
  paymentSelected: {
    backgroundColor: '#e6b800',
    borderColor: '#e6b800',
  },
  paymentText: {
    fontSize: 16,
    color: '#333',
  },
  paymentTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#e6b800',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});