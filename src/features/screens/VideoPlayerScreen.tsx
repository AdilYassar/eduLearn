import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  ScrollView,
  Alert,
  BackHandler,
} from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import Video from 'react-native-video';
import { ArrowLeft, Calendar, HardDrive, FileText } from 'lucide-react-native';

interface VideoData {
  _id: string;
  id: string;
  title: string;
  description: string;
  url: string;
  fileSize: number;
  uploadedAt: string;
}

type VideoPlayerScreenRouteProp = RouteProp<{ params: { video: VideoData } }, 'params'>;

const { width, height } = Dimensions.get('window');

const VideoPlayerScreen = () => {
  const route = useRoute<VideoPlayerScreenRouteProp>();
  const navigation = useNavigation();
  const { video } = route.params;
  const [videoError, setVideoError] = useState(false);
  const [isBuffering, setIsBuffering] = useState(true);

  // Clean and validate video URL
  const getCleanVideoUrl = (url: string): string => {
    // If URL is already a full CDN URL, extract the proper part
    if (url.startsWith('http://') || url.startsWith('https://')) {
      // Find the first occurrence of a video extension and cut everything after it
      const extensionMatch = url.match(/(https?:\/\/.*?\.(mp4|webm|mov|avi|mkv|m3u8))/i);
      if (extensionMatch) {
        const cleanUrl = extensionMatch[1];
        if (cleanUrl !== url) {
          console.log('🔧 Fixed malformed URL');
          console.log('   Original:', url);
          console.log('   Fixed:', cleanUrl);
        }
        return cleanUrl;
      }
    }
    return url;
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

  useEffect(() => {
    const cleanUrl = getCleanVideoUrl(video.url);
    console.log('🎬 Video Player Screen loaded');
    console.log('📹 Original URL:', video.url);
    console.log('📹 Clean URL:', cleanUrl);
    console.log('🔍 Can go back:', navigation.canGoBack());
  }, [video, navigation]);

  // Handle Android hardware back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      console.log('🔙 Hardware back button pressed');
      if (navigation.canGoBack()) {
        navigation.goBack();
        return true; // Prevent default behavior
      }
      return false; // Allow default behavior (exit app)
    });

    return () => backHandler.remove();
  }, [navigation]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <View style={styles.backButtonCircle}>
            <ArrowLeft size={20} color="#FFFFFF" strokeWidth={2.5} />
          </View>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {video.title}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Video Player */}
      <View style={styles.videoPlayerContainer}>
        {!videoError ? (
          <>
            <Video
              source={{
                uri: getCleanVideoUrl(video.url),
                headers: {
                  'Accept': 'video/*',
                },
              }}
              style={styles.videoPlayer}
              controls={true}
              resizeMode="contain"
              paused={false}
              playInBackground={false}
              playWhenInactive={false}
              bufferConfig={{
                minBufferMs: 15000,
                maxBufferMs: 50000,
                bufferForPlaybackMs: 2500,
                bufferForPlaybackAfterRebufferMs: 5000,
              }}
              onBuffer={(buffer) => {
                console.log('🔄 Buffering:', buffer.isBuffering);
                setIsBuffering(buffer.isBuffering);
              }}
              onError={(error) => {
                console.error('❌ Video playback error:', error);
                setVideoError(true);
                setIsBuffering(false);
                Alert.alert(
                  'Playback Error',
                  `Unable to play this video. Error: ${error.error?.localizedDescription || 'Unknown error'}`
                );
              }}
              onLoad={(data) => {
                console.log('✅ Video loaded successfully:', data);
                setIsBuffering(false);
              }}
              onLoadStart={() => {
                console.log('🔄 Video loading started...');
                setIsBuffering(true);
              }}
              onReadyForDisplay={() => {
                console.log('✅ Video ready for display');
                setIsBuffering(false);
              }}
            />
            {/* Buffering Indicator */}
            {isBuffering && (
              <View style={styles.bufferingOverlay}>
                <View style={styles.bufferingContent}>
                  <ActivityIndicator size="large" color="#8B5CF6" />
                  <Text style={styles.bufferingText}>Loading video...</Text>
                </View>
              </View>
            )}
          </>
        ) : (
          <View style={styles.errorContainer}>
            <View style={styles.errorIconContainer}>
              <Text style={styles.errorEmoji}>⚠️</Text>
            </View>
            <Text style={styles.errorText}>Unable to play video</Text>
            <Text style={styles.errorSubtext}>Please check your connection and try again</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => {
                setVideoError(false);
                setIsBuffering(true);
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Video Info */}
      <ScrollView style={styles.videoInfoContainer}>
        <View style={styles.videoInfo}>
          <Text style={styles.videoTitle}>{video.title}</Text>

          <View style={styles.metaRow}>
            <View style={styles.metaBadge}>
              <HardDrive size={14} color="#8B5CF6" strokeWidth={2} />
              <Text style={styles.metaText}>{formatFileSize(video.fileSize)}</Text>
            </View>
            {video.uploadedAt && (
              <View style={styles.metaBadge}>
                <Calendar size={14} color="#8B5CF6" strokeWidth={2} />
                <Text style={styles.metaText}>
                  {new Date(video.uploadedAt).toLocaleDateString()}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.divider} />

          <View style={styles.sectionHeader}>
            <FileText size={18} color="#8B5CF6" strokeWidth={2} />
            <Text style={styles.sectionTitle}>Description</Text>
          </View>
          <Text style={styles.description}>{video.description}</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F0F',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    paddingTop: 16,
    backgroundColor: 'rgba(15, 15, 15, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(139, 92, 246, 0.1)',
  },
  backButton: {
    marginRight: 12,
  },
  backButtonCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginHorizontal: 12,
    fontFamily: 'Inter-Bold',
    letterSpacing: -0.3,
  },
  headerSpacer: {
    width: 40,
  },
  videoPlayerContainer: {
    width: width,
    height: height * 0.35,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoPlayer: {
    width: '100%',
    height: '100%',
  },
  bufferingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    zIndex: 10,
  },
  bufferingContent: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 24,
    borderRadius: 20,
  },
  bufferingText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 16,
    fontFamily: 'Inter-SemiBold',
    fontWeight: '600',
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  errorEmoji: {
    fontSize: 40,
  },
  errorText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
    marginBottom: 8,
  },
  errorSubtext: {
    color: '#9CA3AF',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 16,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Inter-Bold',
  },
  videoInfoContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  videoInfo: {
    padding: 24,
  },
  videoTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
    fontFamily: 'Inter-Bold',
    letterSpacing: -0.5,
    lineHeight: 30,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  metaText: {
    fontSize: 13,
    color: '#4B5563',
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    fontFamily: 'Inter-Bold',
    letterSpacing: -0.3,
  },
  description: {
    fontSize: 15,
    color: '#6B7280',
    lineHeight: 24,
    fontFamily: 'Inter-Regular',
  },
});

export default VideoPlayerScreen;
