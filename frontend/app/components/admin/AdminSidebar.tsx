import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';

const sidebarItems = [
  { label: 'User Management', route: '/admin/UserManage' as const },
  { label: 'Admin Shop', route: '/admin/AdminShop' as const },
  { label: 'Gen Analytics', route: '/admin/GenAnalytics' as const },
];

const AdminSidebar = () => {
	return (
		<View style={styles.sidebar}>
			<Text style={styles.title}>Admin Panel</Text>
			{sidebarItems.map((item) => (
				<TouchableOpacity
					key={item.label}
					style={styles.item}
					onPress={() => router.replace(item.route)}
				>
					<Text style={styles.itemText}>{item.label}</Text>
				</TouchableOpacity>
			))}
		</View>
	);
};

export default AdminSidebar;

const styles = StyleSheet.create({
	sidebar: {
		width: 220,
		backgroundColor: '#1b5e20',
		paddingVertical: 32,
		paddingHorizontal: 16,
		minHeight: '100%',
		justifyContent: 'flex-start',
	},
	title: {
		color: '#fff',
		fontSize: 22,
		fontWeight: 'bold',
		marginBottom: 32,
		textAlign: 'center',
	},
	item: {
		paddingVertical: 14,
		paddingHorizontal: 8,
		borderRadius: 8,
		marginBottom: 12,
		backgroundColor: '#256029',
	},
	itemText: {
		color: '#fff',
		fontSize: 16,
		fontWeight: '600',
	},
});
