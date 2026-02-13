import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Fonts, Palette, Colors } from '@/constants/theme';
import { useResponsive } from '@/utils/platform';

interface FooterProps {
  showSocials?: boolean;
  showLinks?: boolean;
  compact?: boolean;
}

const Footer: React.FC<FooterProps> = ({
  showSocials = true,
  showLinks = true,
  compact = false
}) => {
  const { isWeb } = useResponsive();
  const currentYear = new Date().getFullYear();

  const handleLink = (url: string) => {
    Linking.openURL(url);
  };

  const socialLinks = [
    { icon: 'logo-facebook', url: 'https://facebook.com', label: 'Facebook' },
    { icon: 'logo-twitter', url: 'https://twitter.com', label: 'Twitter' },
    { icon: 'logo-instagram', url: 'https://instagram.com', label: 'Instagram' },
    { icon: 'logo-linkedin', url: 'https://linkedin.com', label: 'LinkedIn' },
  ];

  const footerLinks = [
    { title: 'About Us', url: '#about' },
    { title: 'Privacy Policy', url: '#privacy' },
    { title: 'Terms of Service', url: '#terms' },
    { title: 'Contact', url: '#contact' },
  ];

  if (compact) {
    return (
      <View style={styles.compactContainer}>
        <Text style={styles.compactText}>
          © {currentYear} DurianApp. All rights reserved.
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, isWeb && { marginTop: 'auto' }]}>
      {/* Top Section */}
      <View style={[styles.topSection, { flexDirection: isWeb ? 'row' : 'column' }]}>
        {/* Brand */}
        <View style={[styles.brandSection, isWeb && { maxWidth: 300 }]}>
          <View style={styles.logoContainer}>
            <Ionicons name="leaf" size={28} color={Palette.deepObsidian} />
            <Text style={styles.brandName}>Durianostics</Text>
          </View>
          <Text style={styles.brandTagline}>
            Quality Durian Detection & Export Management
          </Text>
        </View>

        {/* Links */}
        {showLinks && (
          <View style={styles.linksSection}>
            <Text style={styles.sectionTitle}>Quick Links</Text>
            <View style={styles.linksContainer}>
              {footerLinks.map((link, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleLink(link.url)}
                  style={styles.linkItem}
                >
                  <Text style={styles.linkText}>{link.title}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Contact Info */}
        <View style={styles.contactSection}>
          <Text style={styles.sectionTitle}>Contact Us</Text>
          <View style={styles.contactItem}>
            <Ionicons name="mail-outline" size={16} color={Palette.warmCopper} />
            <Text style={styles.contactText}>support@durianostics.com</Text>
          </View>
          <View style={styles.contactItem}>
            <Ionicons name="call-outline" size={16} color={Palette.warmCopper} />
            <Text style={styles.contactText}>+63 912 345 6789</Text>
          </View>
          <View style={styles.contactItem}>
            <Ionicons name="location-outline" size={16} color={Palette.warmCopper} />
            <Text style={styles.contactText}>Taguig City, Philippines</Text>
          </View>
        </View>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Bottom Section */}
      <View style={styles.bottomSection}>
        {/* Social Links */}
        {showSocials && (
          <View style={styles.socialContainer}>
            {socialLinks.map((social, index) => (
              <TouchableOpacity
                key={index}
                style={styles.socialButton}
                onPress={() => handleLink(social.url)}
                accessibilityLabel={social.label}
              >
                <Ionicons name={social.icon as any} size={20} color={Palette.deepObsidian} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Copyright */}
        <Text style={styles.copyright}>
          © {currentYear} Durianostics. All rights reserved.
        </Text>

        {/* Legal */}
        <Text style={styles.legalText}>
          Empowering Philippine Durian Farmers & Exporters
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Palette.warmCopper,
    paddingTop: 40,
    paddingBottom: 24,
    paddingHorizontal: 24,
  },
  compactContainer: {
    backgroundColor: Palette.deepObsidian,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  compactText: {
    color: Palette.linenWhite,
    fontSize: 12,
    fontFamily: Fonts.medium,
  },
  topSection: {
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 32,
  },
  brandSection: {
    flex: 1,
    minWidth: 200,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  brandName: {
    fontSize: 24,
    fontFamily: Fonts.bold,
    color: Palette.deepObsidian,
    letterSpacing: 0.5,
  },
  brandTagline: {
    fontSize: 14,
    color: Palette.deepObsidian,
    opacity: 0.8,
    lineHeight: 20,
    fontFamily: Fonts.regular,
  },
  linksSection: {
    flex: 1,
    minWidth: 150,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: Fonts.bold,
    color: Palette.deepObsidian,
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  linksContainer: {
    gap: 10,
  },
  linkItem: {
    paddingVertical: 4,
  },
  linkText: {
    fontSize: 14,
    color: Palette.deepObsidian,
    fontFamily: Fonts.medium,
  },
  contactSection: {
    flex: 1,
    minWidth: 200,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  contactText: {
    fontSize: 14,
    color: Palette.deepObsidian,
    fontFamily: Fonts.regular,
  },
  divider: {
    height: 1,
    backgroundColor: Palette.deepObsidian,
    opacity: 0.1,
    marginVertical: 24,
  },
  bottomSection: {
    alignItems: 'center',
    gap: 16,
  },
  socialContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  socialButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(12, 26, 16, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Palette.deepObsidian,
  },
  copyright: {
    fontSize: 14,
    color: Palette.deepObsidian,
    fontFamily: Fonts.semiBold,
  },
  legalText: {
    fontSize: 12,
    color: Palette.deepObsidian,
    opacity: 0.6,
    textAlign: 'center',
    fontFamily: Fonts.regular,
  },
});

export default Footer;

