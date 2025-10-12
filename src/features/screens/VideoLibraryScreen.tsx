import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { useVideos } from '@service/hooks/useVideos';
import { Play, ArrowLeft, Search, Calendar, HardDrive, Video } from 'lucide-react-native';
import { goBack, push } from '../../utils/Navigation';

interface VideoData {
  _id: string;
  id: string;
  title: string;
  description: string;
  url: string;
  fullUrl: string;
  fileSize: number;
  uploadedAt: string;
}

const VideoLibraryScreen = () => {
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [filteredVideos, setFilteredVideos] = useState<VideoData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const { getAllVideos } = useVideos();

  // Fetch all videos from API
  const fetchVideos = async () => {
    try {
      setIsInitialLoading(true);
      const result = await getAllVideos();
      console.log('🎥 Videos fetched:', result);
      if (result && Array.isArray(result)) {
        setVideos(result);
        setFilteredVideos(result);
      } else {
        console.error('Invalid videos result:', result);
        setVideos([]);
        setFilteredVideos([]);
      }
    } catch (fetchError) {
      console.error('Error fetching videos:', fetchError);
      Alert.alert('Error', 'An error occurred while fetching videos');
      setVideos([]);
      setFilteredVideos([]);
    } finally {
      setIsInitialLoading(false);
    }
  };

  // Filter videos based on search query
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setFilteredVideos(videos);
    } else {
      const filtered = videos.filter(video =>
        video.title.toLowerCase().includes(query.toLowerCase()) ||
        video.description.toLowerCase().includes(query.toLowerCase()),
      );
      setFilteredVideos(filtered);
    }
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) {
      return '0 Bytes';
    }
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  // Handle video selection
  const handleVideoSelect = (video: VideoData) => {
    console.log('🎬 Selected video:', video.title);
    push('VideoPlayerScreen', { video });
  };

  useEffect(() => {
    fetchVideos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isInitialLoading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingContent}>
          <Video size={48} color="#8B5CF6" strokeWidth={2} />
          <ActivityIndicator size="large" color="#8B5CF6" style={styles.loadingSpinner} />
          <Text style={styles.loadingText}>Loading Videos...</Text>
          <Text style={styles.loadingSubtext}>Please wait</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => goBack()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <View style={styles.backButtonCircle}>
            <ArrowLeft size={20} color="#8B5CF6" strokeWidth={2.5} />
          </View>
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Video Library</Text>
          <Text style={styles.headerSubtitle}>Educational Content</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchWrapper}>
          <Search size={20} color="#8B5CF6" strokeWidth={2} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by title or description..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={handleSearch}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => handleSearch('')}
              style={styles.clearButton}
              activeOpacity={0.7}
            >
              <View style={styles.clearIconCircle}>
                <Text style={styles.clearIcon}>✕</Text>
              </View>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Video List */}
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.subHeaderContainer}>
          <Text style={styles.subHeaderText}>
            All Videos
          </Text>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{filteredVideos?.length || 0}</Text>
          </View>
        </View>

        {!filteredVideos || filteredVideos.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <Video size={64} color="#C4B5FD" strokeWidth={1.5} />
            </View>
            <Text style={styles.emptyText}>
              {searchQuery ? 'No videos found' : 'No videos available'}
            </Text>
            <Text style={styles.emptySubtext}>
              {searchQuery ? 'Try adjusting your search terms' : 'Check back later for new content'}
            </Text>
          </View>
        ) : (
          <View style={styles.videoList}>
            {filteredVideos.map((video) => (
              <TouchableOpacity
                key={video._id || video.id}
                style={styles.videoCard}
                onPress={() => handleVideoSelect(video)}
                activeOpacity={0.8}
              >
                {/* Play Icon */}
                <View style={styles.playIconContainer}>
                  <View style={styles.playIconCircle}>
                    <Play size={20} color="#fff" fill="#fff" strokeWidth={2} />
                  </View>
                </View>

                {/* Content Area */}
                <View style={styles.contentArea}>
                  <Text style={styles.videoTitle} numberOfLines={2}>
                    {video.title}
                  </Text>

                  <Text style={styles.videoDescription} numberOfLines={2}>
                    {video.description}
                  </Text>

                  <View style={styles.videoMeta}>
                    <View style={styles.metaBadge}>
                      <HardDrive size={12} color="#8B5CF6" strokeWidth={2} />
                      <Text style={styles.metaText}>
                        {formatFileSize(video.fileSize)}
                      </Text>
                    </View>
                    {video.uploadedAt && (
                      <View style={styles.metaBadge}>
                        <Calendar size={12} color="#8B5CF6" strokeWidth={2} />
                        <Text style={styles.metaText}>
                          {new Date(video.uploadedAt).toLocaleDateString()}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>

                {/* Arrow Icon */}
                <View style={styles.arrowContainer}>
                  <View style={styles.arrowCircle}>
                    <Play size={14} color="#8B5CF6" fill="#8B5CF6" strokeWidth={2} />
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 20,
    backgroundColor: '#FFFFFF',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  backButton: {
    marginRight: 12,
  },
  backButtonCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    fontFamily: 'Inter-Bold',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
    fontFamily: 'Inter-Medium',
    marginTop: 2,
  },
  headerSpacer: {
    width: 40,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: 'transparent',
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 4,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: '#111827',
    fontFamily: 'Inter-Regular',
    marginLeft: 12,
  },
  clearButton: {
    marginLeft: 8,
  },
  clearIconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearIcon: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  subHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  subHeaderText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    fontFamily: 'Inter-Bold',
    letterSpacing: -0.3,
  },
  countBadge: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 12,
  },
  countText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
  },
  videoList: {
    gap: 16,
  },
  videoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  playIconContainer: {
    marginRight: 16,
  },
  playIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  contentArea: {
    flex: 1,
  },
  videoTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
    fontFamily: 'Inter-Bold',
    letterSpacing: -0.3,
  },
  videoDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
  },
  videoMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  metaText: {
    fontSize: 12,
    color: '#4B5563',
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  arrowContainer: {
    marginLeft: 14,
  },
  arrowCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    fontFamily: 'Inter-Regular',
    maxWidth: 250,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingContent: {
    alignItems: 'center',
  },
  loadingSpinner: {
    marginTop: 20,
  },
  loadingText: {
    fontSize: 18,
    color: '#111827',
    marginTop: 16,
    fontWeight: '700',
    fontFamily: 'Inter-Bold',
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 6,
    fontWeight: '500',
    fontFamily: 'Inter-Medium',
  },
});

export default VideoLibraryScreen;

