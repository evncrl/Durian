import React from 'react';
import { View, Text } from 'react-native';
import { useAdminStyles } from '@/styles/admin_styles/index.styles';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { Fonts, Palette } from '@/constants/theme';

export default function GenAnalytics() {
    return (
        <View style={{ flex: 1, flexDirection: 'row', backgroundColor: Palette.linenWhite }}>
            <AdminSidebar />
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 }}>
                <Text style={{ fontSize: 32, fontFamily: Fonts.bold, color: Palette.charcoalEspresso }}>AI Analytics</Text>
                <Text style={{ marginTop: 12, fontSize: 16, color: Palette.slate, fontFamily: Fonts.medium, textAlign: 'center' }}>
                    Monitor AI model performance, scan accuracy, and geographical distribution data.
                </Text>
            </View>
        </View>
    );
}
