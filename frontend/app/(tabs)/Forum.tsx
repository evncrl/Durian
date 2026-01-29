import React, { useState, useEffect } from "react";
import styles from "../styles/Forum.styles";
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  Image, 
  StyleSheet, 
  Platform,
  Dimensions 
} from "react-native";

const { width } = Dimensions.get("window");
const isWeb = Platform.OS === "web";
const isMobile = width < 768;

interface ForumPost {
  id: number;
  author: string;
  avatar: string;
  title: string;
  content: string;
  category: string;
  replies: number;
  views: number;
  likes: number;
  timestamp: string;
  isPinned?: boolean;
}

interface Reply {
  id: number;
  author: string;
  avatar: string;
  content: string;
  timestamp: string;
  likes: number;
}

export default function Forum() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewPostModal, setShowNewPostModal] = useState(false);

  const categories = ["All", "Quality Issues", "Best Practices", "Export Tips", "General Discussion"];

  const forumPosts: ForumPost[] = [
    {
      id: 1,
      author: "Maria Santos",
      avatar: "https://via.placeholder.com/40",
      title: "How to identify early signs of durian rot?",
      content: "I've been having trouble identifying early rot in my durian harvest. What are the key indicators to look for?",
      category: "Quality Issues",
      replies: 12,
      views: 234,
      likes: 8,
      timestamp: "2h ago",
      isPinned: true,
    },
    {
      id: 2,
      author: "Juan Dela Cruz",
      avatar: "https://via.placeholder.com/40",
      title: "Best storage temperature for export-grade durian",
      content: "What's the optimal temperature range for storing durian before export? I want to maintain quality during transport.",
      category: "Export Tips",
      replies: 8,
      views: 156,
      likes: 15,
      timestamp: "5h ago",
    },
    {
      id: 3,
      author: "Anna Reyes",
      avatar: "https://via.placeholder.com/40",
      title: "AI scanning accuracy - sharing my results",
      content: "I've been using Durianostics for 3 months now. Here are my accuracy stats and observations.",
      category: "General Discussion",
      replies: 23,
      views: 445,
      likes: 31,
      timestamp: "1d ago",
    },
    {
      id: 4,
      author: "Pedro Garcia",
      avatar: "https://via.placeholder.com/40",
      title: "Tips for photographing durian for best scan results",
      content: "I noticed better scan accuracy with certain lighting and angles. Here's what works for me.",
      category: "Best Practices",
      replies: 6,
      views: 178,
      likes: 12,
      timestamp: "2d ago",
    },
    {
      id: 5,
      author: "Lisa Tan",
      avatar: "https://via.placeholder.com/40",
      title: "Export requirements for China market 2026",
      content: "Anyone familiar with the updated export requirements for shipping durian to China this year?",
      category: "Export Tips",
      replies: 19,
      views: 389,
      likes: 24,
      timestamp: "3d ago",
      isPinned: true,
    },
  ];

  const filteredPosts = forumPosts.filter(post => {
    const matchesCategory = selectedCategory === "All" || post.category === selectedCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getCategoryColor = (category: string) => {
    switch(category) {
      case "Quality Issues": return styles.categoryRed;
      case "Best Practices": return styles.categoryBlue;
      case "Export Tips": return styles.categoryGreen;
      case "General Discussion": return styles.categoryGray;
      default: return styles.categoryGray;
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>Community Forum</Text>
            <Text style={styles.headerSubtitle}>Share knowledge and get expert advice</Text>
          </View>
          <TouchableOpacity 
            style={styles.newPostButton}
            onPress={() => setShowNewPostModal(true)}
          >
            <Text style={styles.newPostButtonText}>+ New Post</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.mainContent}>
        {/* Search and Filters */}
        <View style={styles.searchSection}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search discussions..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9ca3af"
          />
        </View>

        {/* Category Tabs */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoryTabs}
          contentContainerStyle={styles.categoryTabsContent}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryTab,
                selectedCategory === category && styles.categoryTabActive
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text style={[
                styles.categoryTabText,
                selectedCategory === category && styles.categoryTabTextActive
              ]}>
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Forum Stats */}
        <View style={styles.statsBar}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{filteredPosts.length}</Text>
            <Text style={styles.statLabel}>Posts</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>1.2k</Text>
            <Text style={styles.statLabel}>Members</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>24</Text>
            <Text style={styles.statLabel}>Online</Text>
          </View>
        </View>

        {/* Forum Posts */}
        <View style={styles.postsContainer}>
          {filteredPosts.map((post) => (
            <View key={post.id} style={styles.postCard}>
              {/* Pinned Badge */}
              {post.isPinned && (
                <View style={styles.pinnedBadge}>
                  <Text style={styles.pinnedText}>📌 Pinned</Text>
                </View>
              )}

              {/* Post Header */}
              <View style={styles.postHeader}>
                <Image source={{ uri: post.avatar }} style={styles.authorAvatar} />
                <View style={styles.postHeaderInfo}>
                  <Text style={styles.authorName}>{post.author}</Text>
                  <Text style={styles.postTimestamp}>{post.timestamp}</Text>
                </View>
                <View style={[styles.categoryBadge, getCategoryColor(post.category)]}>
                  <Text style={[styles.categoryBadgeText, getCategoryColor(post.category)]}>
                    {post.category}
                  </Text>
                </View>
              </View>

              {/* Post Content */}
              <TouchableOpacity>
                <Text style={styles.postTitle}>{post.title}</Text>
                <Text style={styles.postContent} numberOfLines={2}>
                  {post.content}
                </Text>
              </TouchableOpacity>

              {/* Post Footer */}
              <View style={styles.postFooter}>
                <View style={styles.postStats}>
                  <View style={styles.statGroup}>
                    <Text style={styles.statIcon}>💬</Text>
                    <Text style={styles.statText}>{post.replies}</Text>
                  </View>
                  <View style={styles.statGroup}>
                    <Text style={styles.statIcon}>👁</Text>
                    <Text style={styles.statText}>{post.views}</Text>
                  </View>
                  <View style={styles.statGroup}>
                    <Text style={styles.statIcon}>👍</Text>
                    <Text style={styles.statText}>{post.likes}</Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.replyButton}>
                  <Text style={styles.replyButtonText}>Reply</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Empty State */}
        {filteredPosts.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>🔍</Text>
            <Text style={styles.emptyStateText}>No posts found</Text>
            <Text style={styles.emptyStateSubtext}>
              Try adjusting your search or filter
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}