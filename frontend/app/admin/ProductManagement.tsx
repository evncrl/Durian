import React, { useEffect, useState } from 'react';
import { Picker } from '@react-native-picker/picker';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert, 
  StyleSheet, 
  Platform, 
  ScrollView,
  StatusBar,
  Image
} from 'react-native';
import AdminSidebar from '../../components/admin/AdminSidebar';
import { useAdminStyles } from '@/styles/admin_styles/index.styles';
import { useResponsive } from '@/utils/platform';
import { Fonts, Palette } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';

interface Product {
  _id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  image: string;
  isNew?: boolean;
}

const API_URL = 'http://localhost:8000'; 

export default function ProductManagement() {
  // 🎨 UI Hooks & State
  const styles = useAdminStyles();
  const { isWeb, isSmallScreen } = useResponsive();
  const [sidebarVisible, setSidebarVisible] = useState(false);

  // 📦 Data State
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ 
    name: '', 
    category: '', 
    price: '', 
    description: '', 
    image: '', 
    isNew: false 
  });

  const categories = ["Jams", "Candy", "Chips", "Cookies"];

  // 🔍 Fetch Data Logic
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/shop/products`, {
        headers: { 'ngrok-skip-browser-warning': 'true' }
      });
      const data = await res.json();
      if (data.success && data.products) {
        setProducts(data.products);
      }
    } catch (err) {
      console.error('Fetch Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  // 📝 Submission Logic
  const handleSubmit = async () => {
    if (!form.name.trim() || !form.category) {
      Alert.alert('Validation', 'Name and Category are required');
      return;
    }
    setLoading(true);
    try {
      const method = editId ? 'PUT' : 'POST';
      const url = editId ? `${API_URL}/shop/products/${editId}` : `${API_URL}/shop/products`;
      
      const payload = {
        name: form.name,
        category: form.category,
        price: Number(form.price),
        description: form.description,
        image_url: form.image, 
        isNew: form.isNew
      };

      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true' 
        },
        body: JSON.stringify(payload),
      });
      
      const data = await res.json();
      if (data.success || data.id) { 
        fetchProducts();
        setForm({ name: '', category: '', price: '', description: '', image: '', isNew: false });
        setEditId(null);
        Alert.alert('Success', 'Inventory updated successfully!');
      }
    } catch (err) {
      Alert.alert('Error', 'Server connection failed');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product: Product) => {
    setForm({
      name: product.name,
      category: product.category,
      price: String(product.price),
      description: product.description,
      image: product.image,
      isNew: product.isNew ?? false
    });
    setEditId(product._id);
    // Scroll to top on web for convenience
    if (isWeb) window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id: string) => {
    Alert.alert('Confirm Delete', 'Are you sure you want to remove this product?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        setLoading(true);
        try {
          await fetch(`${API_URL}/shop/products/${id}`, { method: 'DELETE' });
          fetchProducts();
        } catch (err) {
          Alert.alert('Error', 'Failed to delete');
        } finally {
          setLoading(false);
        }
      }}
    ]);
  };

  // ✅ SUB-COMPONENT: Table Header
  const TableHeader = () => (
    <View style={localStyles.tableHeader}>
      <Text style={[localStyles.columnHeader, { flex: 1.5 }]}>PRODUCT</Text>
      <Text style={[localStyles.columnHeader, { flex: 1 }]}>CATEGORY</Text>
      <Text style={[localStyles.columnHeader, { flex: 0.8 }]}>PRICE</Text>
      <Text style={[localStyles.columnHeader, { flex: 2 }]}>DESCRIPTION</Text>
      <Text style={[localStyles.columnHeader, { flex: 1, textAlign: 'right' }]}>ACTIONS</Text>
    </View>
  );

  return (
    <View style={{ flex: 1, flexDirection: (isSmallScreen || !isWeb) ? 'column' : 'row', backgroundColor: Palette.linenWhite }}>
      <StatusBar barStyle="dark-content" />
      
      <AdminSidebar isVisible={sidebarVisible} onClose={() => setSidebarVisible(false)} />

      {sidebarVisible && (isSmallScreen || !isWeb) && (
        <TouchableOpacity style={localStyles.overlay} activeOpacity={1} onPress={() => setSidebarVisible(false)} />
      )}

      <View style={{ flex: 1 }}>
        <ScrollView 
          style={styles.container} 
          contentContainerStyle={(isSmallScreen || !isWeb) ? undefined : { paddingBottom: 40, paddingHorizontal: 24 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Mobile Header Toggle */}
          {(isSmallScreen || !isWeb) && (
            <View style={localStyles.mobileHeader}>
              <TouchableOpacity onPress={() => setSidebarVisible(true)}>
                <Ionicons name="menu" size={32} color={Palette.deepObsidian} />
              </TouchableOpacity>
              <Text style={localStyles.mobileTitle}>Inventory Panel</Text>
              <View style={{ width: 32 }} />
            </View>
          )}

          <View style={styles.header}>
            <Text style={styles.title}>Shop Management</Text>
          </View>

          {/* Form Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{editId ? '📝 Edit Existing Item' : '✨ Add New Inventory Item'}</Text>
            <View style={localStyles.formGrid}>
              <TextInput
                placeholder="Product Name*"
                value={form.name}
                onChangeText={v => setForm(f => ({ ...f, name: v }))}
                style={localStyles.input}
              />
              <View style={localStyles.pickerWrapper}>
                <Picker selectedValue={form.category} onValueChange={(v) => setForm(f => ({ ...f, category: v }))} style={localStyles.picker}>
                  <Picker.Item label="Select Category" value="" />
                  {categories.map(cat => <Picker.Item key={cat} label={cat} value={cat} />)}
                </Picker>
              </View>
              <TextInput
                placeholder="Price (USD)"
                value={form.price}
                onChangeText={v => setForm(f => ({ ...f, price: v }))}
                keyboardType="numeric"
                style={localStyles.input}
              />
              <TextInput
                placeholder="Description"
                value={form.description}
                onChangeText={v => setForm(f => ({ ...f, description: v }))}
                style={[localStyles.input, { height: 60 }]}
                multiline
              />
              <TouchableOpacity onPress={handleSubmit} style={[styles.retryBtn, { width: '100%' }]} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.retryBtnText}>{editId ? 'Apply Changes' : 'Add to Inventory'}</Text>}
              </TouchableOpacity>
              {editId && (
                <TouchableOpacity onPress={() => {setEditId(null); setForm({name:'', category:'', price:'', description:'', image:'', isNew:false})}}>
                   <Text style={{textAlign: 'center', marginTop: 12, color: Palette.slate, fontFamily: Fonts.medium}}>Cancel Editing</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* ✅ DATA TABLE SECTION */}
          <View style={[styles.card, { marginTop: 10 }]}>
            <Text style={styles.cardTitle}>Live Inventory Dashboard</Text>
            
            {!isSmallScreen && isWeb ? (
              <View style={localStyles.tableContainer}>
                <TableHeader />
                {products.length === 0 ? (
                  <Text style={styles.emptyText}>No items found.</Text>
                ) : (
                  products.map((item) => (
                    <View key={item._id} style={localStyles.tableRow}>
                      {/* Product Name Column */}
                      <View style={{ flex: 1.5, flexDirection: 'row', alignItems: 'center' }}>
                         <View style={localStyles.tableImgPlaceholder}>
                            <Ionicons name="cube-outline" size={18} color={Palette.slate} />
                         </View>
                         <Text style={localStyles.tableCellName}>{item.name}</Text>
                      </View>

                      {/* Category Column */}
                      <Text style={[localStyles.tableCellText, { flex: 1 }]}>{item.category}</Text>

                      {/* Price Column */}
                      <Text style={[localStyles.tableCellPrice, { flex: 0.8 }]}>${item.price}</Text>

                      {/* Description Column */}
                      <Text style={[localStyles.tableCellText, { flex: 2 }]} numberOfLines={1}>{item.description}</Text>

                      {/* Actions Column */}
                      <View style={[localStyles.tableCellActions, { flex: 1 }]}>
                        <TouchableOpacity onPress={() => handleEdit(item)} style={localStyles.iconBtn}>
                          <Ionicons name="pencil" size={18} color="#2196f3" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleDelete(item._id)} style={localStyles.iconBtn}>
                          <Ionicons name="trash" size={18} color="#f44336" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))
                )}
              </View>
            ) : (
              // MOBILE VIEW: Keep Card Style for better UX
              products.map((item) => (
                <View key={item._id} style={styles.userRow}>
                  <View style={styles.userInfo}>
                    <Text style={styles.userName}>{item.name}</Text>
                    <Text style={styles.userEmail}>{item.category} • ${item.price}</Text>
                  </View>
                  <View style={styles.userActions}>
                    <TouchableOpacity onPress={() => handleEdit(item)} style={localStyles.editBtn}>
                      <Text style={localStyles.editBtnText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDelete(item._id)} style={styles.deleteBtn}>
                      <Text style={styles.deleteBtnText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const localStyles = StyleSheet.create({
  tableContainer: { width: '100%', marginTop: 10 },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    marginBottom: 8,
  },
  columnHeader: {
    fontSize: 12,
    fontFamily: Fonts.bold,
    color: '#64748b',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  tableCellName: { fontSize: 14, fontFamily: Fonts.semiBold, color: '#1e293b', marginLeft: 10 },
  tableCellText: { fontSize: 14, color: '#64748b', fontFamily: Fonts.medium },
  tableCellPrice: { fontSize: 14, color: '#059669', fontFamily: Fonts.bold },
  tableCellActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
  tableImgPlaceholder: { width: 32, height: 32, borderRadius: 6, backgroundColor: '#e2e8f0', alignItems: 'center', justifyContent: 'center' },
  iconBtn: { padding: 8, borderRadius: 6, backgroundColor: '#f8fafc' },
  formGrid: { width: '100%' },
  input: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    fontFamily: Fonts.medium,
  },
  pickerWrapper: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  picker: { height: 50, width: '100%' },
  editBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, backgroundColor: '#e3f2fd', borderWidth: 1, borderColor: '#2196f3' },
  editBtnText: { color: '#2196f3', fontFamily: Fonts.bold, fontSize: 13 },
  mobileHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 15, marginBottom: 20 },
  mobileTitle: { fontSize: 18, fontFamily: Fonts.bold, color: Palette.deepObsidian },
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 999 }
});