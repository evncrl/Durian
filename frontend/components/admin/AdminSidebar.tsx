import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { router, usePathname } from 'expo-router';
import { Fonts, Palette } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';

const sidebarItems = [
	{ label: 'Dashboard', route: '/admin' as const, icon: 'grid-outline' as const },
	{ label: 'Users', route: '/admin/UserManage' as const, icon: 'people-outline' as const },
	{ label: 'Shop', route: '/admin/AdminShop' as const, icon: 'cart-outline' as const },
	{ label: 'Analytics', route: '/admin/GenAnalytics' as const, icon: 'analytics-outline' as const },
];

import { useResponsive } from '@/utils/platform';

interface AdminSidebarProps {
	isVisible?: boolean;
	onClose?: () => void;
}

const AdminSidebar = ({ isVisible, onClose }: AdminSidebarProps) => {
	const pathname = usePathname();
	const { isWeb, isSmallScreen, isMediumScreen } = useResponsive();

	// On desktop, it's always visible. On mobile, it depends on isVisible prop.
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
			<TouchableOpacity
				style={styles.backButton}
				onPress={() => router.replace('/')}
			>
				<Ionicons name="arrow-back" size={20} color={Palette.slate} />
				<Text style={styles.backText}>View Site</Text>
			</TouchableOpacity>
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
		minHeight: Platform.OS === 'web' ? '100%' : '100%',
		borderRightWidth: 1,
		borderRightColor: 'rgba(255,255,255,0.05)',
	},
	mobileSidebar: {
		position: 'absolute',
		left: 0,
		top: 0,
		bottom: 0,
		zIndex: 1000,
		width: 280,
		transform: [{ translateX: -280 }],
	},
	mobileSidebarVisible: {
		transform: [{ translateX: 0 }],
	},
	closeButton: {
		padding: 4,
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
	backButton: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingVertical: 12,
		paddingHorizontal: 15,
		marginTop: 'auto',
	},
	backText: {
		color: Palette.slate,
		fontSize: 14,
		fontFamily: Fonts.medium,
		marginLeft: 10,
	},
});

