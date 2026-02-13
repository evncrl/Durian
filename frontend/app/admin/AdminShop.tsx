import React, { useState, useEffect } from 'react';
import { 
    View, 
    Text, 
    ActivityIndicator, 
    TouchableOpacity, 
    ScrollView, 
    Modal, 
    TextInput, 
    Alert, 
    Image, 
    StyleSheet as RNStyleSheet 
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAdminStyles } from '@/styles/admin_styles/index.styles';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { Fonts, Palette } from '@/constants/theme';
import { API_URL } from '@/config/appconf';
import { useResponsive } from '@/utils/platform';
import { Ionicons } from '@expo/vector-icons';

interface Product {
    _id: string;
    name: string;
    category: string;
    price: number;
    stock: number;
    image_url: string;
    description: string;
}

export default function AdminShop() {
    const styles = useAdminStyles();
    const { isWeb, isSmallScreen } = useResponsive();
    
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [sidebarVisible, setSidebarVisible] = useState(false);

    // Edit states
    const [isEditing, setIsEditing] = useState(false);
    const [editingProductId, setEditingProductId] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        category: 'Fresh Fruit',
        price: '',
        stock: '',
        description: '',
        image_url: ''
    });

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/shop/products`, {
                headers: { 'ngrok-skip-browser-warning': 'true' }
            });
            const data = await res.json();
            if (data.success) setProducts(data.products);
        } catch (e) {
            Alert.alert("Error", "Failed to load products.");
        } finally {
            setLoading(false);
        }
    };

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });
        if (!result.canceled) uploadToCloudinary(result.assets[0].uri);
    };

   const uploadToCloudinary = async (uri: string) => {
    setUploading(true);
    try {
        const uploadData = new FormData();
        const filename = uri.split('/').pop() || 'upload.jpg';
        
        // 1. IMPORTANT PARA SA WEB: I-convert ang URI sa Blob
        const response_blob = await fetch(uri);
        const blob = await response_blob.blob();
        
        // 2. I-append ang blob sa FormData
        uploadData.append('photo', blob, filename);

        console.log("[DEBUG] Sending photo to backend...");

        const response = await fetch(`${API_URL}/shop/upload-image`, {
            method: 'POST',
            body: uploadData,
            headers: { 
                'ngrok-skip-browser-warning': 'true'
                // WAG maglagay ng 'Content-Type': 'multipart/form-data' dito, 
                // kusa na itong ise-set ng fetch kasama ang boundary.
            }
        });

        const result = await response.json();
        
        if (result.success) {
            setFormData({ ...formData, image_url: result.image_url });
            Alert.alert("Success", "Image uploaded!");
        } else {
            console.error("[BACKEND ERROR]", result.error);
            Alert.alert("Upload Error", result.error || "Check terminal.");
        }
    } catch (e) {
        console.error("[FRONTEND ERROR]", e);
        Alert.alert("Error", "Failed to connect to server.");
    } finally {
        setUploading(false);
    }
};
    // Open Modal for Editing
    const openEditModal = (product: Product) => {
        setIsEditing(true);
        setEditingProductId(product._id);
        setFormData({
            name: product.name,
            category: product.category,
            price: product.price.toString(),
            stock: product.stock.toString(),
            description: product.description || '',
            image_url: product.image_url
        });
        setModalVisible(true);
    };

    // Handle Save (Add or Update)
    const handleSave = async () => {
        if (!formData.name || !formData.price || !formData.image_url) {
            Alert.alert("Error", "Name, Price, and Image are required.");
            return;
        }

        const endpoint = isEditing 
            ? `${API_URL}/admin/products/${editingProductId}` 
            : `${API_URL}/shop/products`;
        
        const method = isEditing ? 'PUT' : 'POST';

        try {
            const res = await fetch(endpoint, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'ngrok-skip-browser-warning': 'true'
                },
                body: JSON.stringify({
                    ...formData,
                    price: Number(formData.price),
                    stock: Number(formData.stock)
                })
            });
            if (res.ok) {
                Alert.alert("Success", isEditing ? "Product updated!" : "New product added!");
                closeModal();
                fetchProducts();
            }
        } catch (e) {
            Alert.alert("Error", "Failed to save product.");
        }
    };

    const closeModal = () => {
        setModalVisible(false);
        setIsEditing(false);
        setEditingProductId(null);
        setFormData({ name: '', category: 'Fresh Fruit', price: '', stock: '', description: '', image_url: '' });
    };


const handleDelete = (id: string) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this item?");
    
    if (confirmDelete) {
        performDelete(id);
    }
};

const performDelete = async (id: string) => {
    try {
        console.log(`[DEBUG] Sending DELETE request for ID: ${id}`);
        
        const res = await fetch(`${API_URL}/admin/products/${id}`, { 
            method: 'DELETE', 
            headers: { 
                'ngrok-skip-browser-warning': 'true',
                'Accept': 'application/json'
            } 
        });

        const data = await res.json();
        
        if (data.success) {
            Alert.alert("Success", "Product deleted!");
            fetchProducts(); // I-refresh ang listahan
        } else {
            Alert.alert("Error", data.error || "Failed to delete");
        }
    } catch (e) {
        console.error("[FRONTEND DELETE ERROR]", e);
        Alert.alert("Error", "Server connection failed.");
    }
};

    useEffect(() => { fetchProducts(); }, []);

    return (
        <View style={{ flex: 1, flexDirection: (isSmallScreen || !isWeb) ? 'column' : 'row', backgroundColor: Palette.linenWhite }}>
            <AdminSidebar isVisible={sidebarVisible} onClose={() => setSidebarVisible(false)} />
            
            <View style={{ flex: 1 }}>
                <ScrollView style={styles.container}>
                    <View style={styles.header}>
                        <View>
                            <Text style={styles.title}>Shop Inventory</Text>
                            <Text style={styles.statusText}>Manage your durian products and pricing.</Text>
                        </View>
                        <TouchableOpacity style={styles.retryBtn} onPress={() => setModalVisible(true)}>
                            <Text style={styles.retryBtnText}>+ Add Item</Text>
                        </TouchableOpacity>
                    </View>

                    {loading ? (
                        <ActivityIndicator size="large" color={Palette.warmCopper} style={{ marginTop: 40 }} />
                    ) : (
                        <View style={styles.card}>
                            <Text style={styles.cardTitle}>Current Stock</Text>
                            {products.length === 0 ? (
                                <Text style={styles.emptyText}>No products found.</Text>
                            ) : (
                                products.map((item) => (
                                    <View key={item._id} style={localStyles.itemRow}>
                                        <Image source={{ uri: item.image_url }} style={localStyles.thumbnail} />
                                        <View style={{ flex: 1 }}>
                                            <Text style={localStyles.itemName}>{item.name}</Text>
                                            <Text style={localStyles.itemInfo}>₱{item.price.toLocaleString()} • Stock: {item.stock}</Text>
                                        </View>
                                        <View style={{ flexDirection: 'row', gap: 15 }}>
                                            <TouchableOpacity onPress={() => openEditModal(item)}>
                                                <Ionicons name="create-outline" size={22} color={Palette.warmCopper} />
                                            </TouchableOpacity>
                                            <TouchableOpacity onPress={() => handleDelete(item._id)}>
                                                <Ionicons name="trash-outline" size={22} color="#ef4444" />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                ))
                            )}
                        </View>
                    )}
                </ScrollView>
            </View>

            {/* Product Modal (Add/Edit) */}
            <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={closeModal}>
                <View style={localStyles.modalOverlay}>
                    <View style={localStyles.modalContainer}>
                        <Text style={localStyles.modalTitle}>{isEditing ? 'Edit Product' : 'New Inventory Item'}</Text>
                        
                        <TouchableOpacity style={localStyles.imageBox} onPress={pickImage}>
                            {uploading ? <ActivityIndicator color={Palette.warmCopper} /> : (
                                formData.image_url ? 
                                <Image source={{ uri: formData.image_url }} style={localStyles.previewImg} /> :
                                <View style={{ alignItems: 'center' }}>
                                    <Ionicons name="cloud-upload-outline" size={32} color="#999" />
                                    <Text style={{ color: '#999', fontSize: 12 }}>Upload Photo</Text>
                                </View>
                            )}
                        </TouchableOpacity>

                        <TextInput placeholder="Durian Name" style={localStyles.input} value={formData.name} onChangeText={(t) => setFormData({...formData, name: t})} />
                        <TextInput placeholder="Price (₱)" keyboardType="numeric" style={localStyles.input} value={formData.price} onChangeText={(t) => setFormData({...formData, price: t})} />
                        <TextInput placeholder="Stock" keyboardType="numeric" style={localStyles.input} value={formData.stock} onChangeText={(t) => setFormData({...formData, stock: t})} />
                        <TextInput placeholder="Description" multiline style={[localStyles.input, { height: 60 }]} value={formData.description} onChangeText={(t) => setFormData({...formData, description: t})} />
                        
                        <View style={localStyles.modalButtons}>
                            <TouchableOpacity style={localStyles.cancelBtn} onPress={closeModal}>
                                <Text style={localStyles.cancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={localStyles.saveBtn} onPress={handleSave}>
                                <Text style={localStyles.saveText}>{isEditing ? 'Update Item' : 'Save Item'}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const localStyles = RNStyleSheet.create({
    itemRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
    thumbnail: { width: 50, height: 50, borderRadius: 10, marginRight: 15, backgroundColor: '#eee' },
    itemName: { fontFamily: Fonts.bold, fontSize: 16, color: Palette.charcoalEspresso },
    itemInfo: { fontSize: 13, color: Palette.slate, marginTop: 2 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 },
    modalContainer: { backgroundColor: '#fff', borderRadius: 28, padding: 30, width: '100%', maxWidth: 450 },
    modalTitle: { fontSize: 22, fontFamily: Fonts.bold, marginBottom: 20, textAlign: 'center' },
    imageBox: { width: '100%', height: 140, backgroundColor: '#f9f9f9', borderRadius: 15, borderStyle: 'dashed', borderWidth: 1, borderColor: '#ccc', justifyContent: 'center', alignItems: 'center', marginBottom: 20, overflow: 'hidden' },
    previewImg: { width: '100%', height: '100%' },
    input: { borderBottomWidth: 1, borderBottomColor: '#eee', paddingVertical: 10, marginBottom: 15, fontFamily: Fonts.medium },
    modalButtons: { flexDirection: 'row', gap: 12, marginTop: 10 },
    saveBtn: { flex: 1, backgroundColor: Palette.warmCopper, padding: 14, borderRadius: 10, alignItems: 'center' },
    saveText: { color: '#fff', fontFamily: Fonts.bold },
    cancelBtn: { flex: 1, backgroundColor: '#eee', padding: 14, borderRadius: 10, alignItems: 'center' },
    cancelText: { color: '#666', fontFamily: Fonts.semiBold }
});