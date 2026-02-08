import React, { useState, useEffect } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  Image, 
  StyleSheet,
  Modal,
  Alert,
  ActivityIndicator,
  RefreshControl
} from "react-native";

import { useResponsive } from '../utils/platform';
import styles from "../styles/Forum.styles";
import { API_URL } from "../config/appconf";

interface ForumPost {
  _id: string;
  user_id: string;
  username: string;
  user_avatar: string;
  title: string;
  content: string;
  category: string;
  replies: number;
  views: number;
  likes: number;
  liked_by: string[];
  is_pinned: boolean;
  timestamp: string;
  created_at: string;
  updated_at: string;
}

interface Comment {
  _id: string;
  user_id: string;
  username: string;
  user_avatar: string;
  post_id: string;
  content: string;
  likes: number;
  liked_by: string[];
  timestamp: string;
  created_at: string;
}

interface ForumProps {
  embedded?: boolean;
}

export default function Forum({ embedded = false }: ForumProps) {
  // Regex to block links, emails, and some bad words (customize as needed)
  const forbiddenRegex = /(https?:\/\/|www\.|@|\b(badword1|badword2|fuck|shit|bitch|asshole|damn|cunt|nigger|fag|faggot|slut|whore|dick|pussy|cock|cum|sex|porn|rape|kill|murder|suicide|die)\b)/i;
  const { isWeb, isSmallScreen, isMediumScreen, isLargeScreen, width } = useResponsive();
  const isMobile = width < 768;
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewPostModal, setShowNewPostModal] = useState(false);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState<ForumPost | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);

  // New Post state
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [inputError, setInputError] = useState<string | null>(null);
  const [newPostCategory, setNewPostCategory] = useState<string>("All");
  const [creatingPost, setCreatingPost] = useState(false);

  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userId, setUserId] = useState<string | null>(null); // Get from auth context
  const [username, setUsername] = useState<string | null>(null); // Get from auth context

  const categories = ["All", "Quality Issues", "Best Practices", "Export Tips", "General Discussion"];

  // Fetch posts from API
  const fetchPosts = async () => {
    try {
      setLoadingPosts(true);
      const url = `${API_URL}/forum/posts?category=${selectedCategory}&search=${searchQuery}`;
      console.log('[CLIENT] fetchPosts url:', url);

      const response = await fetch(url, {
        headers: {
          'ngrok-skip-browser-warning': 'true',
          'Accept': 'application/json',
        }
      });
      console.log('[CLIENT] fetchPosts status:', response.status, response.headers.get('content-type'));

      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        const text = await response.text();
        console.error('[CLIENT] fetchPosts non-JSON response:', response.status, text);
        Alert.alert('Error', `Server error: ${response.status}`);
        return;
      }

      const data = await response.json();
      
      if (data.success) {
        console.log('[CLIENT] fetchPosts data.posts length:', data.posts?.length, 'firstId:', data.posts?.[0]?._id);
        setPosts(data.posts);
      } else {
        Alert.alert("Error", "Failed to load posts");
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
      Alert.alert("Error", "Network error");
    } finally {
      setLoadingPosts(false);
      setRefreshing(false);
    }
  };

  // Fetch comments for a post
  const fetchComments = async (postId: string) => {
    try {
      setLoadingComments(true);
      const response = await fetch(`${API_URL}/forum/posts/${postId}/comments`, {
        headers: {
          'ngrok-skip-browser-warning': 'true',
          'Accept': 'application/json',
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setComments(data.comments);
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
      Alert.alert("Error", "Failed to load comments");
    } finally {
      setLoadingComments(false);
    }
  };

  // Submit a new comment
  const submitComment = async () => {
    if (!newComment.trim()) {
      Alert.alert("Error", "Comment cannot be empty");
      return;
    }
    if (forbiddenRegex.test(newComment)) {
      setInputError("This message contains inappropriate language");
      return;
    }
    if (!userId || !selectedPost) {
      Alert.alert("Error", "Please login to comment");
      return;
    }
    setInputError(null);
    try {
      setSubmittingComment(true);
      const response = await fetch(`${API_URL}/forum/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify({
          post_id: selectedPost._id,
          content: newComment,
          user_id: userId,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setComments([...comments, data.comment]);
        setNewComment("");
        setPosts(posts.map(post => 
          post._id === selectedPost._id 
            ? { ...post, replies: post.replies + 1 }
            : post
        ));
      } else {
        Alert.alert("Error", data.error || "Failed to post comment");
      }
    } catch (error) {
      console.error("Error posting comment:", error);
      Alert.alert("Error", "Network error");
    } finally {
      setSubmittingComment(false);
    }
  };

  // Create a new post
  const submitNewPost = async () => {
    if (!newPostTitle.trim() || !newPostContent.trim()) {
      Alert.alert("Error", "Title and content are required");
      return;
    }
    if (forbiddenRegex.test(newPostTitle) || forbiddenRegex.test(newPostContent)) {
      setInputError("This message contains inappropriate language");
      return;
    }
    if (!userId) {
      console.warn('[CLIENT] submitNewPost blocked - not logged in');
      Alert.alert("Error", "Please login to post");
      return;
    }
    setInputError(null);
    try {
      setCreatingPost(true);
      const baseUrl = API_URL.replace(/\/+$/, '');
      const url = `${baseUrl}/forum/posts`;
      const payload = {
        title: newPostTitle,
        content: newPostContent,
        category: newPostCategory,
        user_id: userId,
      };
      console.log('[CLIENT] submitNewPost ->', url, payload);
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
          "Accept": "application/json"
        },
        body: JSON.stringify(payload),
      });
      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        const text = await response.text();
        console.error('[CLIENT] submitNewPost non-JSON response:', response.status, text);
        Alert.alert('Error', `Server error: ${response.status}`);
        return;
      }
      const data = await response.json();
      console.log('[CLIENT] submitNewPost response:', response.status, data);
      if (data.success) {
        setPosts((prev) => [data.post, ...prev]);
        setNewPostTitle("");
        setNewPostContent("");
        setNewPostCategory("All");
        setShowNewPostModal(false);
      } else {
        Alert.alert("Error", data.error || "Failed to create post");
      }
    } catch (error) {
      console.error("Error creating post:", error);
      Alert.alert("Error", "Network error");
    } finally {
      setCreatingPost(false);
    }
  };

  // Like a post
  const handleLikePost = async (postId: string) => {
    if (!userId) {
      Alert.alert("Error", "Please login to like posts");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/forum/posts/${postId}/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify({ user_id: userId }),
      });

      const data = await response.json();
      
      if (data.success) {
        // Update post in local state
        setPosts(posts.map(post => 
          post._id === postId 
            ? { ...post, likes: data.likes, liked: data.liked }
            : post
        ));
      }
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  // Like a comment
  const handleLikeComment = async (commentId: string) => {
    if (!userId) {
      Alert.alert("Error", "Please login to like comments");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/forum/comments/${commentId}/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify({ user_id: userId }),
      });

      const data = await response.json();
      
      if (data.success) {
        // Update comment in local state
        setComments(comments.map(comment => 
          comment._id === commentId 
            ? { ...comment, likes: data.likes }
            : comment
        ));
      }
    } catch (error) {
      console.error("Error liking comment:", error);
    }
  };

  // Open comments modal
  const openCommentsModal = (post: ForumPost) => {
    setSelectedPost(post);
    setShowCommentsModal(true);
    fetchComments(post._id);
  };

  // Handle pull to refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchPosts();
  };

  // Fetch posts on component mount and when filters change
  useEffect(() => {
    fetchPosts();
  }, [selectedCategory, searchQuery]);

  // Get user info from AsyncStorage on mount
  useEffect(() => {
    (async () => {
      try {
        const token = await AsyncStorage.getItem('jwt_token');
        const uid = await AsyncStorage.getItem('user_id');
        const name = await AsyncStorage.getItem('name');
        if (uid) setUserId(uid);
        if (name) setUsername(name);
        // Optionally you can verify token by calling /profile
      } catch (err) {
        console.error('[CLIENT] Failed to load auth info:', err);
      }
    })();
  }, []);

  // Debug: log posts state changes
  useEffect(() => {
    console.log('[CLIENT] posts state changed:', posts.length);
  }, [posts]);

  const getCategoryColor = (category: string) => {
    switch(category) {
      case "Quality Issues": return { backgroundColor: "#fee2e2", color: "#dc2626" };
      case "Best Practices": return { backgroundColor: "#dbeafe", color: "#2563eb" };
      case "Export Tips": return { backgroundColor: "#dcfce7", color: "#16a34a" };
      case "General Discussion": return { backgroundColor: "#f3f4f6", color: "#4b5563" };
      default: return { backgroundColor: "#f3f4f6", color: "#4b5563" };
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };

  return (
    <View style={{ flex: 1 }}>
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

      <ScrollView 
        style={styles.container}
        scrollEnabled={!embedded}
        nestedScrollEnabled={!embedded}
        refreshControl={
          embedded ? undefined : <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
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
              onPress={() => {
                setSelectedCategory(category);
                setInputError(null);
                setNewPostTitle("");
                setNewPostContent("");
                setNewComment("");
              }}
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
            <Text style={styles.statValue}>{posts.length}</Text>
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

        {/* Loading Indicator */}
        {loadingPosts && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#16a34a" />
            <Text style={styles.loadingText}>Loading posts...</Text>
          </View>
        )}

        {/* Forum Posts */}
        <View style={styles.postsContainer}>
          {posts.map((post) => {
            const categoryStyle = getCategoryColor(post.category);
            return (
              <View key={post._id} style={styles.postCard}>
                {/* Pinned Badge */}
                {post.is_pinned && (
                  <View style={styles.pinnedBadge}>
                    <Text style={styles.pinnedText}>📌 Pinned</Text>
                  </View>
                )}

                {/* Post Header */}
                <View style={styles.postHeader}>
                  <Image 
                    source={{ uri: post.user_avatar || "https://via.placeholder.com/40" }} 
                    style={styles.authorAvatar} 
                  />
                  <View style={styles.postHeaderInfo}>
                    <Text style={styles.authorName}>{post.username}</Text>
                    <Text style={styles.postTimestamp}>{post.timestamp || "Just now"}</Text>
                  </View>
                  <View style={[styles.categoryBadge, { backgroundColor: categoryStyle.backgroundColor }]}>
                    <Text style={[styles.categoryBadgeText, { color: categoryStyle.color }]}>
                      {post.category}
                    </Text>
                  </View>
                </View>

                {/* Post Content */}
                <TouchableOpacity onPress={() => openCommentsModal(post)}>
                  <Text style={styles.postTitle}>{post.title}</Text>
                  <Text style={styles.postContent} numberOfLines={2}>
                    {post.content}
                  </Text>
                </TouchableOpacity>

                {/* Post Footer */}
                <View style={styles.postFooter}>
                  <View style={styles.postStats}>
                    <TouchableOpacity 
                      style={styles.statGroup}
                      onPress={() => handleLikePost(post._id)}
                    >
                      <Text style={[
                        styles.statIcon,
                        post.liked_by?.includes(userId || "") && styles.likedIcon
                      ]}>
                        {post.liked_by?.includes(userId || "") ? "❤️" : "🤍"}
                      </Text>
                      <Text style={styles.statText}>{formatNumber(post.likes)}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.statGroup}
                      onPress={() => openCommentsModal(post)}
                    >
                      <Text style={styles.statIcon}>💬</Text>
                      <Text style={styles.statText}>{formatNumber(post.replies)}</Text>
                    </TouchableOpacity>
                    <View style={styles.statGroup}>
                      <Text style={styles.statIcon}>👁</Text>
                      <Text style={styles.statText}>{formatNumber(post.views)}</Text>
                    </View>
                  </View>
                  <TouchableOpacity 
                    style={styles.replyButton}
                    onPress={() => openCommentsModal(post)}
                  >
                    <Text style={styles.replyButtonText}>Reply</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>

        {/* Empty State */}
        {!loadingPosts && posts.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>🔍</Text>
            <Text style={styles.emptyStateText}>No posts found</Text>
            <Text style={styles.emptyStateSubtext}>
              Try adjusting your search or filter
            </Text>
          </View>
        )}
      </ScrollView>

      {/* New Post Modal */}
      <Modal
        visible={showNewPostModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowNewPostModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create New Post</Text>
              <TouchableOpacity onPress={() => setShowNewPostModal(false)} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>


            {inputError && (
              <Text style={{ color: 'red', marginBottom: 8, textAlign: 'center' }}>{inputError}</Text>
            )}
            <TextInput
              style={styles.input}
              placeholder="Title"
              value={newPostTitle}
              onChangeText={setNewPostTitle}
            />
            <TextInput
              style={[styles.input, { height: 120 }]}
              placeholder="What's on your mind?"
              value={newPostContent}
              onChangeText={setNewPostContent}
              multiline
            />

            <View style={styles.categorySelection}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  onPress={() => {
                    setNewPostCategory(cat);
                    setInputError(null);
                  }}
                  style={[styles.categoryOption, newPostCategory === cat && styles.categoryOptionActive]}
                >
                  <Text style={styles.categoryOptionText}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity onPress={() => setShowNewPostModal(false)} style={[styles.cancelButton]}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={submitNewPost}
                disabled={creatingPost || !newPostTitle.trim() || !newPostContent.trim()}
                style={[styles.postButton, (creatingPost || !newPostTitle.trim() || !newPostContent.trim()) && styles.postButtonDisabled]}
              >
                {creatingPost ? <ActivityIndicator color="#fff" /> : <Text style={styles.postButtonText}>Post</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Comments Modal */}
      <Modal
        visible={showCommentsModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCommentsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {selectedPost?.replies || 0} {selectedPost?.replies === 1 ? 'Reply' : 'Replies'}
              </Text>
              <TouchableOpacity
                onPress={() => setShowCommentsModal(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Comments List */}
            <ScrollView style={styles.commentsList}>
              {loadingComments ? (
                <ActivityIndicator size="large" color="#16a34a" style={{ marginTop: 20 }} />
              ) : comments.length === 0 ? (
                <View style={styles.noComments}>
                  <Text style={styles.noCommentsText}>No comments yet</Text>
                  <Text style={styles.noCommentsSubtext}>Be the first to comment!</Text>
                </View>
              ) : (
                comments.map((comment) => (
                  <View key={comment._id} style={styles.commentItem}>
                    <Image 
                      source={{ uri: comment.user_avatar || "https://via.placeholder.com/40" }} 
                      style={styles.commentAvatar} 
                    />
                    <View style={styles.commentContent}>
                      <View style={styles.commentHeader}>
                        <Text style={styles.commentAuthor}>{comment.username}</Text>
                        <Text style={styles.commentTime}>{comment.timestamp}</Text>
                      </View>
                      <Text style={styles.commentText}>{comment.content}</Text>
                      <TouchableOpacity 
                        style={styles.commentLikeButton}
                        onPress={() => handleLikeComment(comment._id)}
                      >
                        <Text style={styles.commentLikeIcon}>
                          {comment.liked_by?.includes(userId || "") ? "❤️" : "🤍"}
                        </Text>
                        <Text style={styles.commentLikeCount}>{comment.likes}</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )}
            </ScrollView>

            {/* Comment Input */}
            <View style={styles.commentInputContainer}>
              {inputError && (
                <Text style={{ color: 'red', marginBottom: 4, textAlign: 'center' }}>{inputError}</Text>
              )}
              <TextInput
                style={styles.commentInput}
                placeholder="Write a comment..."
                value={newComment}
                onChangeText={setNewComment}
                multiline
                editable={!submittingComment}
              />
              <TouchableOpacity
                style={[
                  styles.submitCommentButton,
                  (!newComment.trim() || submittingComment) && styles.submitCommentButtonDisabled
                ]}
                onPress={submitComment}
                disabled={!newComment.trim() || submittingComment}
              >
                {submittingComment ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.submitCommentButtonText}>Post</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}