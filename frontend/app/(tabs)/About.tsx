import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Linking,
  Platform,
  Pressable,
  Image,
  ImageBackground,
  Dimensions,
} from 'react-native';
import Footer from '@/components/Footer';
import { Ionicons } from '@expo/vector-icons';
import { Fonts } from '@/constants/theme';

const { width } = Dimensions.get('window');

export default function About() {
  const handleLinkPress = (url: string) => {
    if (Platform.OS === 'web') {
      window.open(url, '_blank');
    } else {
      Linking.openURL(url);
    }
  };

  const isWeb = Platform.OS === 'web';

  // Developer team data with individual social links
  const developers = [
    {
      id: 1,
      name: 'Aia A. Garcia',
      role: 'Group Leader',
      description: 'Full-stack engineer with 8+ years of experience in mobile and web development. Passionate about creating seamless user experiences.',
      avatar: require('../../assets/images/aia.jpg'),
      github: 'https://github.com/towppy',
      linkedin: 'https://linkedin.com',
      twitter: 'https://twitter.com',
      gradient: ['#FF6B6B', '#FF8E53'],
    },
    {
      id: 2,
      name: 'Carl Evan T. Piad',
      role: 'Member 1',
      description: 'Creative designer focused on intuitive interfaces. Specializes in cross-platform design systems and accessibility.',
      avatar: require('../../assets/images/evan.jpg'),
      github: 'https://github.com/evncrl',
      linkedin: 'https://linkedin.com',
      dribbble: 'https://dribbble.com',
      gradient: ['#4ECDC4', '#44A08D'],
    },
    {
      id: 3,
      name: 'Kathleen Mae R. Priol',
      role: 'Member 2',
      description: 'Systems architect with expertise in scalable cloud infrastructure and API development. Loves solving complex problems.',
      avatar: require('../../assets/images/kat.jpg'),
      github: 'https://github.com',
      linkedin: 'https://linkedin.com',
      twitter: 'https://twitter.com',
      gradient: ['#A8E6CF', '#3DDC84'],
    },
    {
      id: 4,
      name: 'Kevin R. Ofracio',
      role: 'Member 3',
      description: 'React Native specialist with a keen eye for performance optimization. Committed to delivering native-quality experiences.',
      avatar: require('../../assets/images/kevin.png'),
      github: 'https://github.com',
      linkedin: 'https://linkedin.com',
      twitter: 'https://twitter.com',
      gradient: ['#A890FE', '#8E54E9'],
    },
    {
      id: 5,
      name: 'Prof. Pops V. Madriaga',
      role: 'Professor',
      description: 'Product strategist bridging user needs with technical solutions. Drives innovation through data-driven decisions.',
      avatar: require('../../assets/images/mam.png'),
      linkedin: 'https://linkedin.com',
      twitter: 'https://twitter.com',
      website: 'https://example.com',
      gradient: ['#FFD93D', '#F6C90E'],
    },
  ];

  const SocialLink = ({ icon, url, label }: { icon: string; url?: string; label: string }) => {
    if (!url) return null;

    return (
      <Pressable
        onPress={() => handleLinkPress(url)}
        style={({ pressed, hovered }: any) => [
          styles.modernSocialButton,
          (pressed || hovered) && styles.modernSocialButtonHovered,
        ]}
      >
        {({ hovered }: any) => (
          <>
            <Ionicons name={icon as any} size={16} color={hovered ? "#fff" : "#64748B"} />
            <Text style={[styles.modernSocialLabel, hovered && { color: '#fff' }]}>{label}</Text>
          </>
        )}
      </Pressable>
    );
  };

  const TeamMember = ({ member, index }: { member: typeof developers[0]; index: number }) => (
    <View style={[styles.modernTeamCard, { transform: [{ rotate: index % 2 === 0 ? '1deg' : '-1deg' }] }]}>
      {/* Decorative corner accent */}
      <View style={[styles.cornerAccent, { backgroundColor: member.gradient[0] }]} />

      <View style={styles.modernCardContent}>
        {/* Avatar with unique frame */}
        <View style={styles.modernAvatarWrapper}>
          <View style={[styles.modernAvatarFrame, {
            borderColor: member.gradient[0],
          }]}>
            <Image
              source={member.avatar}
              style={styles.modernAvatar}
              accessibilityLabel={`Photo of ${member.name}`}
            />
          </View>
          <View style={[styles.modernStatusDot, { backgroundColor: member.gradient[1] }]} />
        </View>

        {/* Info */}
        <View style={styles.modernMemberInfo}>
          <Text style={styles.modernMemberName}>{member.name}</Text>
          <View style={[styles.modernRolePill, { backgroundColor: member.gradient[0] }]}>
            <Text style={styles.modernRoleText}>{member.role}</Text>
          </View>
          <Text style={styles.modernMemberDesc}>{member.description}</Text>
        </View>

        {/* Social links - horizontal style */}
        <View style={styles.modernSocialRow}>
          {member.linkedin && <SocialLink icon="logo-linkedin" url={member.linkedin} label="LinkedIn" />}
          {member.github && <SocialLink icon="logo-github" url={member.github} label="GitHub" />}
          {member.twitter && <SocialLink icon="logo-twitter" url={member.twitter} label="Twitter" />}
          {member.dribbble && <SocialLink icon="logo-dribbble" url={member.dribbble} label="Dribbble" />}
          {member.website && <SocialLink icon="link-outline" url={member.website} label="Web" />}
        </View>
      </View>
    </View>
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero Section with Mesh Gradient Effect */}
      <View style={styles.modernHero}>
        <ImageBackground
          source={require('../../assets/images/durian-bg.jpg')}
          style={styles.modernHeroImage}
          imageStyle={styles.modernHeroImageStyle}
        >
          <View style={styles.modernHeroOverlay}>
            {/* Floating elements */}
            <View style={[styles.floatingShape, styles.floatingShape1]} />
            <View style={[styles.floatingShape, styles.floatingShape2]} />
            <View style={[styles.floatingShape, styles.floatingShape3]} />

            <View style={styles.modernHeroContent}>
              <View style={styles.modernBadge}>
                <Text style={styles.modernBadgeText}>EST. 2026</Text>
              </View>
              <Text style={styles.modernHeroTitle}>
                ASSESSING DURIAN, {'\n'}
                <Text style={styles.modernHeroTitleAccent}>THE RIGHT WAY.</Text>
              </Text>
              <Text style={styles.modernHeroSubtitle}>
                An app made with love by team Durianostics.
              </Text>
            </View>
          </View>
        </ImageBackground>
      </View>

      <View style={[styles.content, isWeb && styles.contentWeb]}>
        {/* Vision Block */}
        <View style={styles.visionBlock}>
          <View style={styles.visionIconBox}>
            <Ionicons name="sparkles" size={24} color="#fff" />
          </View>
          <Text style={styles.visionTitle}>Our Vision</Text>
          <Text style={styles.visionText}>
            To create a durian quality assessment app that combines cutting-edge technology with user-centric design, empowering farmers, sellers, and enthusiasts worldwide to make informed decisions and elevate the durian experience.
          </Text>
        </View>

        {/* Metrics Grid */}
        <View style={styles.metricsGrid}>
          <View style={styles.metricBox}>
            <View style={[styles.metricIconCircle, { backgroundColor: '#FF6B6B20' }]}>
              <Ionicons name="rocket" size={32} color="#FF6B6B" />
            </View>
            <Text style={styles.metricValue}>50+</Text>
            <Text style={styles.metricLabel}>Launched Projects</Text>
          </View>

          <View style={styles.metricBox}>
            <View style={[styles.metricIconCircle, { backgroundColor: '#4ECDC420' }]}>
              <Ionicons name="star" size={32} color="#4ECDC4" />
            </View>
            <Text style={styles.metricValue}>98%</Text>
            <Text style={styles.metricLabel}>Client Satisfaction</Text>
          </View>

          <View style={styles.metricBox}>
            <View style={[styles.metricIconCircle, { backgroundColor: '#A8E6CF20' }]}>
              <Ionicons name="trophy" size={32} color="#A8E6CF" />
            </View>
            <Text style={styles.metricValue}>15+</Text>
            <Text style={styles.metricLabel}>Awards Won</Text>
          </View>
        </View>

        {/* Team Section with new header */}
        <View style={styles.teamHeader}>
          <View style={styles.teamHeaderLine} />
          <Text style={styles.teamHeaderText}>The Dream Team</Text>
          <View style={styles.teamHeaderLine} />
        </View>

        <Text style={styles.teamTagline}>
          Meet the minds behind the magic <Ionicons name="sparkles" size={16} color="#FACC15" />
        </Text>

        <View style={styles.modernTeamGrid}>
          {developers.map((developer, index) => (
            <TeamMember key={developer.id} member={developer} index={index} />
          ))}
        </View>




        {/* Footer */}
        <Footer />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0C1A10',
  },
  scrollContent: {
    flexGrow: 1,
  },

  // Modern Hero Section
  modernHero: {
    width: '100%',
    height: 500,
    position: 'relative',
  },
  modernHeroImage: {
    width: '100%',
    height: '100%',
  },
  modernHeroImageStyle: {
    width: '100%',
    height: '100%',
  },
  modernHeroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(12, 26, 16, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  floatingShape: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    opacity: 0.1,
  },
  floatingShape1: {
    backgroundColor: '#FF6B6B',
    top: 50,
    left: 30,
    width: 120,
    height: 120,
  },
  floatingShape2: {
    backgroundColor: '#4ECDC4',
    bottom: 80,
    right: 50,
    width: 80,
    height: 80,
  },
  floatingShape3: {
    backgroundColor: '#A8E6CF',
    top: 200,
    right: 100,
    width: 60,
    height: 60,
  },
  modernHeroContent: {
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 1,
  },
  modernBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    marginBottom: 24,
  },
  modernBadgeText: {
    color: '#fff',
    fontSize: 12,

    fontFamily: Fonts.bold,
    letterSpacing: 2,
  },
  modernHeroTitle: {
    fontSize: 52,
    fontFamily: Fonts.bold,
    color: '#fff',
    textAlign: 'center',
    lineHeight: 60,
    marginBottom: 16,
  },
  modernHeroTitleAccent: {
    color: '#4ECDC4',
  },
  modernHeroSubtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    maxWidth: 500,
  },

  // Content
  content: {
    width: '100%',
    maxWidth: 1200,
    alignSelf: 'center',
    padding: 20,
    paddingTop: 60,
  },
  contentWeb: {
    paddingHorizontal: 40,
  },

  // Vision Block
  visionBlock: {
    backgroundColor: '#1A291A',
    borderRadius: 24,
    padding: 40,
    marginBottom: 40,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2D241E',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.05,
        shadowRadius: 20,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.05)',
      },
    }),
  },
  visionIconBox: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#C1773E',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  visionIcon: {
    fontSize: 24,
    color: '#fff',
  },
  visionTitle: {
    fontSize: 32,
    fontFamily: Fonts.bold,
    color: '#FAF9F6',
    marginBottom: 16,
    textAlign: 'center',
  },
  visionText: {
    fontSize: 16,
    lineHeight: 28,
    color: '#94a3b8',
    textAlign: 'center',
    maxWidth: 700,
  },

  // Metrics Grid
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
    marginBottom: 60,
    justifyContent: 'center',
  },
  metricBox: {
    flex: 1,
    minWidth: 180,
    backgroundColor: '#1A291A',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2D241E',
  },
  metricIconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  metricEmoji: {
    fontSize: 32,
  },
  metricValue: {
    fontSize: 36,
    fontFamily: Fonts.bold,
    color: '#FAF9F6',
    marginBottom: 8,
  },
  metricLabel: {
    fontSize: 13,
    color: '#94a3b8',
    textAlign: 'center',
    fontFamily: Fonts.semiBold,
  },

  // Team Header
  teamHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 20,
  },
  teamHeaderLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#2D241E',
  },
  teamHeaderText: {
    fontSize: 32,
    fontFamily: Fonts.bold,
    color: '#FAF9F6',
  },
  teamTagline: {
    fontSize: 18,
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 40,
  },

  // Modern Team Cards
  modernTeamGrid: {
    gap: 32,
    marginBottom: 60,
  },
  modernTeamCard: {
    backgroundColor: '#1A291A',
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: '#2D241E',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.08,
        shadowRadius: 24,
      },
      android: {
        elevation: 5,
      },
      web: {
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
      },
    }),
  },
  cornerAccent: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 120,
    height: 120,
    borderBottomLeftRadius: 120,
    opacity: 0.15,
  },
  modernCardContent: {
    padding: 32,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 24,
    alignItems: 'center',
  },
  modernAvatarWrapper: {
    position: 'relative',
  },
  modernAvatarFrame: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    padding: 4,
    backgroundColor: '#1A291A',
  },
  modernAvatar: {
    width: '100%',
    height: '100%',
    borderRadius: 46,
  },
  modernStatusDot: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 3,
    borderColor: '#1A291A',
  },
  modernMemberInfo: {
    flex: 1,
    minWidth: 200,
  },
  modernMemberName: {
    fontSize: 24,
    fontFamily: Fonts.bold,
    color: '#FAF9F6',
    marginBottom: 8,
  },
  modernRolePill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
  },
  modernRoleText: {
    fontSize: 13,
    fontFamily: Fonts.bold,
    color: '#fff',
  },
  modernMemberDesc: {
    fontSize: 14,
    lineHeight: 22,
    color: '#94a3b8',
    fontFamily: Fonts.regular,
  },
  modernSocialRow: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#2D241E',
    paddingTop: 20,
  },
  modernSocialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0C1A10',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: '#2D241E',
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transition: 'all 0.2s',
      },
    }),
  },
  modernSocialButtonHovered: {
    backgroundColor: '#C1773E',
    borderColor: '#C1773E',
  },
  modernSocialIcon: {
    fontSize: 16,
    fontFamily: Fonts.bold,
  },
  modernSocialLabel: {
    fontSize: 13,
    fontFamily: Fonts.semiBold,
    color: '#64748B',
  },

});
