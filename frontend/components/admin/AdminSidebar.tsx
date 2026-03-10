import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Alert } from 'react-native';
import { router, usePathname } from 'expo-router';
import { Fonts, Palette } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '@/contexts/UserContext'; // ✅ Import ang context
import { useResponsive } from '@/utils/platform';

const sidebarItems = [
	{ label: 'Analytics', route: '/admin/GenAnalytics' as const, icon: 'analytics-outline' as const },
	{ label: 'Scans', route: '/admin/Scans' as const, icon: 'scan-outline' as const },
	{ label: 'Users', route: '/admin/UserManage' as const, icon: 'people-outline' as const },
	{ label: 'Forum', route: '/admin/ForumManage' as const, icon: 'chatbubbles-outline' as const },
	{ label: 'Product Management', route: '/admin/ProductManagement' as const, icon: 'pricetags-outline' as const },
	{ label: 'Orders', route: '/admin/OrderManage' as const, icon: 'cart-outline' as const },
	{ label: 'Reviews', route: '/admin/ReviewManage' as const, icon: 'star-outline' as const },
];

interface AdminSidebarProps {
	isVisible?: boolean;
	onClose?: () => void;
}

const AdminSidebar = ({ isVisible, onClose }: AdminSidebarProps) => {
	const pathname = usePathname();
	const { isSmallScreen } = useResponsive();
	const { logout } = useUser(); 

	const handleLogout = () => {
		const performLogout = async () => {
			try {
				console.log('[AdminSidebar] Starting logout...');
				await logout(); 
			} catch (err) {
				console.error('[AdminSidebar] Logout error:', err);
			}
		};

		if (Platform.OS === 'web') {
			if (confirm("Are you sure you want to logout?")) {
				performLogout();
			}
		} else {
			Alert.alert(
				"Logout",
				"Are you sure you want to logout as Admin?",
				[
					{ text: "Cancel", style: "cancel" },
					{ text: "Logout", style: "destructive", onPress: performLogout }
				]
			);
		}
	};

	const showSidebar = (Platform.OS === 'web' && !isSmallScreen) || isVisible;

	if (!showSidebar && Platform.OS !== 'web') return null;
	if (Platform.OS === 'web' && isSmallScreen && !isVisible) return null;

	return (
		<View style={[
			styles.sidebar,
			(isSmallScreen || Platform.OS !== 'web') && styles.mobileSidebar,
			isVisible && styles.mobileSidebarVisible
		]}>
			<View style={styles.header}>
				<View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
					<View>
						<Text style={styles.title}>Durianostics</Text>
						<Text style={styles.subtitle}>ADMIN PANEL</Text>
					</View>
					{(isSmallScreen || Platform.OS !== 'web') && (
						<TouchableOpacity onPress={onClose} style={styles.closeButton}>
							<Ionicons name="close" size={28} color={Palette.slate} />
						</TouchableOpacity>
					)}
				</View>
			</View>

			<View style={styles.menu}>
				{sidebarItems.map((item) => {
					const isActive = pathname === item.route;
					return (
						<TouchableOpacity
							key={item.label}
							style={[styles.item, isActive && styles.activeItem]}
							onPress={() => router.replace(item.route)}
						>
							<Ionicons
								name={item.icon}
								size={22}
								color={isActive ? Palette.white : Palette.slate}
								style={styles.icon}
							/>
							<Text style={[styles.itemText, isActive && styles.activeItemText]}>
								{item.label}
							</Text>
						</TouchableOpacity>
					);
				})}
			</View>

			{/* ✅ LOGOUT BUTTON SA ILALIM */}
			<View style={styles.footer}>
				<TouchableOpacity 
					style={styles.logoutButton} 
					onPress={handleLogout}
					activeOpacity={0.7}
				>
					<Ionicons name="log-out-outline" size={22} color="#ef4444" />
					<Text style={styles.logoutText}>Logout</Text>
				</TouchableOpacity>
			</View>
			
		</View>
	);
};

export default AdminSidebar;

const styles = StyleSheet.create({
	sidebar: {
		width: 260,
		backgroundColor: Palette.deepObsidian,
		paddingVertical: 40,
		paddingHorizontal: 20,
		minHeight: '100%',
		borderRightWidth: 1,
		borderRightColor: 'rgba(255,255,255,0.05)',
	},
	mobileSidebar: {
		position: 'absolute',
		left: 0, top: 0, bottom: 0,
		zIndex: 1000,
		width: 280,
		transform: [{ translateX: -280 }],
	},
	mobileSidebarVisible: {
		transform: [{ translateX: 0 }],
	},
	header: {
		marginBottom: 48,
		paddingHorizontal: 12,
	},
	title: {
		color: Palette.warmCopper,
		fontSize: 24,
		fontFamily: Fonts.bold,
		letterSpacing: -0.5,
	},
	subtitle: {
		color: Palette.slate,
		fontSize: 10,
		fontFamily: Fonts.bold,
		letterSpacing: 2,
		marginTop: 4,
	},
	menu: {
		flex: 1,
	},
	item: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingVertical: 14,
		paddingHorizontal: 15,
		borderRadius: 12,
		marginBottom: 8,
	},
	activeItem: {
		backgroundColor: Palette.warmCopper,
	},
	icon: {
		marginRight: 14,
	},
	itemText: {
		color: Palette.slate,
		fontSize: 15,
		fontFamily: Fonts.medium,
	},
	activeItemText: {
		color: Palette.white,
		fontFamily: Fonts.bold,
	},
	// ✅ BAGONG STYLES PARA SA LOGOUT
	footer: {
		borderTopWidth: 1,
		borderTopColor: 'rgba(255,255,255,0.05)',
		paddingTop: 20,
		marginTop: 20,
	},
	logoutButton: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingVertical: 14,
		paddingHorizontal: 15,
		borderRadius: 12,
		backgroundColor: 'rgba(239, 68, 68, 0.1)', // Subtle red background
	},
	logoutText: {
		color: '#ef4444',
		fontSize: 15,
		fontFamily: Fonts.semiBold,
		marginLeft: 14,
	},
	closeButton: {
		padding: 4,
	},
});