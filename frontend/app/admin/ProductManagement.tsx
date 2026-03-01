import React, { useEffect, useState } from 'react';
import { Picker } from '@react-native-picker/picker';
import { View, Text, TextInput, TouchableOpacity, FlatList, ActivityIndicator, Alert, StyleSheet, Platform } from 'react-native';
import AdminSidebar from '../../components/admin/AdminSidebar';

interface Product {
  _id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  image: string;
  isNew?: boolean;
}

const API_URL = 'http://localhost:8000'; // Change to your backend/ngrok URL

export default function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<{ name: string; category: string; price: string; description: string; image: string; isNew: boolean }>({ name: '', category: '', price: '', description: '', image: '', isNew: false });
  const categories = ["Jams", "Candy", "Chips", "Cookies"];
  const [uploading, setUploading] = useState(false);
  // Cloudinary config from environment variables
  const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || '';
  const CLOUDINARY_UPLOAD_PRESET = process.env.CLOUDINARY_UPLOAD_PRESET || '';
  const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/upload`;
  const [editId, setEditId] = useState<string | null>(null);

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

  const handleSubmit = async () => {
  if (!form.name.trim()) {
    Alert.alert('Validation', 'Name is required');
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
      Alert.alert('Success', 'Product saved!');
    } else {
      Alert.alert('Error', data.error || 'Failed to save product');
    }
  } catch (err) {
    Alert.alert('Error', 'Failed to connect to server');
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
  };

  const handleDelete = async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/products/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) fetchProducts();
      else Alert.alert('Error', 'Failed to delete product');
    } catch (err) {
      Alert.alert('Error', 'Failed to delete product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { flexDirection: Platform.OS === 'web' ? 'row' : 'column' }]}> 
      <AdminSidebar />
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>Product Management</Text>
        <View style={styles.formSection}>
          <TextInput
            placeholder="Name*"
            value={form.name}
            onChangeText={v => setForm(f => ({ ...f, name: v }))}
            style={styles.input}
          />
          {/* Category dropdown */}
          <View style={styles.input}>
            <Text style={{ marginBottom: 4, color: '#888' }}>Category*</Text>
            <View style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 6, backgroundColor: '#fff' }}>
              <Picker
                selectedValue={form.category}
                onValueChange={(v: string) => setForm(f => ({ ...f, category: v }))}
                style={{ height: 40 }}
              >
                <Picker.Item label="Select category" value="" />
                {categories.map(cat => (
                  <Picker.Item key={cat} label={cat} value={cat} />
                ))}
              </Picker>
            </View>
          </View>
          <TextInput
            placeholder="Price"
            value={form.price}
            onChangeText={v => setForm(f => ({ ...f, price: v }))}
            keyboardType="numeric"
            style={styles.input}
          />
          <TextInput
            placeholder="Description"
            value={form.description}
            onChangeText={v => setForm(f => ({ ...f, description: v }))}
            style={styles.input}
          />
          {/* Image URL and upload button */}
          <View style={styles.input}>
            <TextInput
              placeholder="Image URL"
              value={form.image}
              onChangeText={v => setForm(f => ({ ...f, image: v }))}
              style={{ borderWidth: 0, backgroundColor: 'transparent', padding: 0, fontSize: Platform.OS === 'web' ? 16 : 14 }}
            />
            <TouchableOpacity
              onPress={async () => {
                setUploading(true);
                try {
                  let file;
                  if (Platform.OS === 'web') {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'image/*';
                    input.onchange = async (e: any) => {
                      file = e.target.files[0];
                      if (!file) {
                        setUploading(false);
                        return;
                      }
                      const formData = new FormData();
                      formData.append('file', file);
                      // Send to backend handler
                      const res = await fetch(`${API_URL}/shop/upload-image`, {
                        method: 'POST',
                        body: formData,
                      });
                      const data = await res.json();
                      if (data.url) {
                        setForm(f => ({ ...f, image: data.url }));
                        Alert.alert('Success', 'Image uploaded');
                      } else {
                        Alert.alert('Error', 'Upload failed');
                      }
                      setUploading(false);
                    };
                    input.click();
                  } else {
                    Alert.alert('Mobile', 'Image upload for mobile requires expo-image-picker setup');
                    setUploading(false);
                  }
                } catch (err) {
                  Alert.alert('Error', 'Upload failed');
                  setUploading(false);
                }
              }}
              style={[styles.button, { backgroundColor: uploading ? '#aaa' : '#2196f3', marginTop: 4 }]}
              disabled={uploading}
            >
              <Text style={styles.buttonText}>{uploading ? 'Uploading...' : 'Upload Image'}</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={handleSubmit} style={styles.button}>
            <Text style={styles.buttonText}>{editId ? 'Update' : 'Add'} Product</Text>
          </TouchableOpacity>
        </View>
        {loading ? <ActivityIndicator style={{ marginTop: 16 }} /> : (
          <FlatList
            data={products}
            keyExtractor={(item: Product) => item._id}
            renderItem={({ item }: { item: Product }) => (
              <View style={styles.productCard}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.productName}>{item.name}</Text>
                  <Text style={styles.productCategory}>{item.category} - ${item.price}</Text>
                  <Text style={styles.productDesc}>{item.description}</Text>
                </View>
                <View style={styles.actionRow}>
                  <TouchableOpacity onPress={() => handleEdit(item)} style={styles.actionButton}>
                    <Text style={styles.editText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDelete(item._id)} style={styles.actionButton}>
                    <Text style={styles.deleteText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            contentContainerStyle={{ paddingBottom: 32 }}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  formSection: {
    marginBottom: 24,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    padding: Platform.OS === 'web' ? 24 : 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: Platform.OS === 'web' ? 12 : 8,
    marginBottom: 10,
    fontSize: Platform.OS === 'web' ? 16 : 14,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#4caf50',
    padding: Platform.OS === 'web' ? 14 : 10,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: Platform.OS === 'web' ? 16 : 14,
  },
  productCard: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    alignItems: Platform.OS === 'web' ? 'center' : 'flex-start',
    backgroundColor: '#fafafa',
    borderRadius: 8,
    padding: Platform.OS === 'web' ? 16 : 10,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  productName: {
    fontWeight: 'bold',
    fontSize: Platform.OS === 'web' ? 18 : 16,
    marginBottom: 2,
  },
  productCategory: {
    color: '#888',
    fontSize: Platform.OS === 'web' ? 15 : 13,
    marginBottom: 2,
  },
  productDesc: {
    fontSize: Platform.OS === 'web' ? 14 : 12,
    color: '#555',
    marginBottom: 4,
  },
  actionRow: {
    flexDirection: 'row',
    marginTop: Platform.OS === 'web' ? 0 : 8,
    alignItems: 'center',
  },
  actionButton: {
    paddingVertical: Platform.OS === 'web' ? 8 : 6,
    paddingHorizontal: Platform.OS === 'web' ? 12 : 8,
    borderRadius: 6,
    marginLeft: 6,
    backgroundColor: '#eee',
  },
  editText: {
    color: '#2196f3',
    fontWeight: 'bold',
  },
  deleteText: {
    color: '#f44336',
    fontWeight: 'bold',
    fontSize: Platform.OS === 'web' ? 15 : 13,
  },
});