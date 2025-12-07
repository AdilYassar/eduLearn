import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
import { ArrowLeft, Calendar, HardDrive, FileText, Clock, PlayCircle } from 'lucide-react-native';

interface VideoData {
  _id: string;
  id: string;
  title: string;
  description: string;
  url: string;
  driveFileId?: string; // Google Drive file ID
  fileSize: number;
  uploadedAt: string;
  duration?: number; // Video duration in seconds
}

type VideoPlayerScreenRouteProp = RouteProp<{ params: { video: VideoData } }, 'params'>;

const { width, height } = Dimensions.get('window');

const VideoPlayerScreen = () => {
  const route = useRoute<VideoPlayerScreenRouteProp>();
  const navigation = useNavigation();
  const { video } = route.params;
  const [videoError, setVideoError] = useState(false);
  const [isBuffering, setIsBuffering] = useState(true);
  const [connectionWarning, setConnectionWarning] = useState('');
  const [loadingTimeout, setLoadingTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Clean and validate video URL - Updated for Google Drive compatibility
  const getCleanVideoUrl = useCallback((url: string): string => {
    // Check if it's a Google Drive URL and convert to direct streaming format
    if (url.includes('drive.google.com')) {
      // Extract file ID from various Google Drive URL formats
      let fileId = '';
      
      // Format: https://drive.google.com/file/d/FILE_ID/view
      if (url.includes('/file/d/')) {
        const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
        if (match) {
          fileId = match[1];
        }
      }
      
      // Format: https://drive.google.com/open?id=FILE_ID
      else if (url.includes('?id=')) {
        const match = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
        if (match) {
          fileId = match[1];
        }
      }
      
      // Format: https://drive.google.com/uc?export=download&id=FILE_ID
      else if (url.includes('uc?export=download') || url.includes('uc?export=view')) {
        const match = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
        if (match) {
          fileId = match[1];
        } else {
          return url; // Return as-is if ID not extractable
        }
      }
      
      // If we extracted a file ID, create direct streaming URL
      if (fileId) {
        // Try different URL formats based on retry count
        let streamUrl = '';
        
        if (retryCount === 0) {
          // First attempt: Use download format
          streamUrl = `https://drive.google.com/uc?export=download&confirm=1&id=${fileId}`;
        } else if (retryCount === 1) {
          // Second attempt: Use preview format
          streamUrl = `https://drive.google.com/file/d/${fileId}/preview`;
        } else {
          // Third attempt: Use view format
          streamUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;
        }
        
        console.log('🔧 Converted Google Drive URL for direct streaming');
        console.log('   Original:', url);
        console.log('   Streaming:', streamUrl);
        console.log('   File ID:', fileId);
        console.log('   Retry count:', retryCount);
        return streamUrl;
      }
    }
    
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
  }, [retryCount]); // Only retryCount dependency

  // Memoize the video source to prevent excessive URL processing
  const videoSource = useMemo(() => ({
    uri: getCleanVideoUrl(video.url),
  }), [video.url, getCleanVideoUrl]);

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

  // Format video duration
  const formatDuration = (seconds: number): string => {
    if (!seconds || seconds === 0) {
      return 'Unknown';
    }
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  useEffect(() => {
    console.log('🎬 Video Player Screen loaded');
    console.log('📹 Original URL:', video.url);
    console.log(' Can go back:', navigation.canGoBack());
  }, [video.url, navigation]); // Simplified dependencies

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

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (loadingTimeout) {
        clearTimeout(loadingTimeout);
      }
    };
  }, [loadingTimeout]);

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
              source={videoSource}
              style={styles.videoPlayer}
              controls={true}
              resizeMode="contain"
              paused={false}
              playInBackground={false}
              playWhenInactive={false}
              repeat={false}
              volume={1.0}
              muted={false}
              onBuffer={(buffer) => {
                console.log('🔄 Buffering:', buffer.isBuffering);
                setIsBuffering(buffer.isBuffering);
              }}
              onError={(error) => {
                console.error('❌ Video playback error:', error);
                setVideoError(true);
                setIsBuffering(false);
                
                let errorMessage = 'Unknown error occurred';
                if (error.error?.localizedDescription) {
                  errorMessage = error.error.localizedDescription;
                } else if (error.error?.errorString) {
                  errorMessage = error.error.errorString;
                }
                
                // Special handling for Google Drive videos
                if (video.url.includes('drive.google.com')) {
                  if (errorMessage.toLowerCase().includes('network') ||
                      errorMessage.toLowerCase().includes('connection') ||
                      errorMessage.toLowerCase().includes('timeout') ||
                      errorMessage.toLowerCase().includes('loading')) {
                    setConnectionWarning('Google Drive video taking long to load? Try refreshing.');
                    errorMessage = 'Google Drive videos can be slow to start. Please wait a moment or try again.';
                  } else if (errorMessage.toLowerCase().includes('forbidden') ||
                            errorMessage.toLowerCase().includes('permission') ||
                            errorMessage.toLowerCase().includes('access')) {
                    errorMessage = 'This Google Drive video may not be publicly accessible or shared properly.';
                  } else if (errorMessage.toLowerCase().includes('not found') ||
                            errorMessage.toLowerCase().includes('404')) {
                    errorMessage = 'Google Drive video not found. It may have been moved or deleted.';
                  } else {
                    setConnectionWarning('Google Drive videos sometimes take extra time to load.');
                    errorMessage = 'Having trouble loading this Google Drive video. Try the alternative retry method.';
                  }
                }
                
                Alert.alert(
                  'Playback Error',
                  `Unable to play this video. ${errorMessage}`,
                  [
                    {
                      text: 'OK',
                      onPress: () => console.log('Error alert dismissed'),
                    },
                  ],
                );
              }}
              onLoad={(data) => {
                console.log('✅ Video loaded successfully:', data);
                console.log('📊 Video duration:', Math.round(data.duration || 0), 'seconds');
                console.log('📊 Video dimensions:', data.naturalSize);
                setIsBuffering(false);
                // Clear timeout when video loads successfully
                if (loadingTimeout) {
                  clearTimeout(loadingTimeout);
                  setLoadingTimeout(null);
                }
                setConnectionWarning('');
                setRetryCount(0);
              }}
              onLoadStart={() => {
                console.log('🔄 Video loading started...');
                console.log('🔄 Video source URI:', getCleanVideoUrl(video.url));
                setIsBuffering(true);
                
                // Set timeout for all videos to see what's happening
                const timeout = setTimeout(() => {
                  if (video.url.includes('drive.google.com')) {
                    console.log('⏰ Google Drive video still loading after 15 seconds');
                    setConnectionWarning(
                      `Still loading... Google Drive videos can be very slow (Attempt ${retryCount + 1})`
                    );
                  } else {
                    console.log('⏰ Regular video still loading after 15 seconds');
                    setConnectionWarning('Video taking longer than expected to load...');
                  }
                }, 15000); // 15 second warning
                setLoadingTimeout(timeout);
              }}
              onReadyForDisplay={() => {
                console.log('✅ Video ready for display');
                setIsBuffering(false);
              }}
              onProgress={(data) => {
                // Log progress occasionally to verify video is actually playing
                if (Math.floor(data.currentTime) % 10 === 0) {
                  console.log('📹 Video progress:', Math.floor(data.currentTime), 'seconds');
                }
              }}
            />
            {/* Buffering Indicator */}
            {isBuffering && (
              <View style={styles.bufferingOverlay}>
                <View style={styles.bufferingContent}>
                  <ActivityIndicator size="large" color="#8B5CF6" />
                  <Text style={styles.bufferingText}>
                    {video.url.includes('drive.google.com')
                      ? 'Loading Google Drive video...'
                      : 'Loading video...'}
                  </Text>
                  {connectionWarning && (
                    <Text style={styles.connectionWarning}>{connectionWarning}</Text>
                  )}
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
                console.log(`🔄 Retrying video load (attempt ${retryCount + 1})`);
                setVideoError(false);
                setIsBuffering(true);
                setConnectionWarning('');
                setRetryCount(prev => prev + 1);
                
                // Clear any existing timeout
                if (loadingTimeout) {
                  clearTimeout(loadingTimeout);
                  setLoadingTimeout(null);
                }
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.retryText}>
                {retryCount > 0 ? `Retry (${retryCount + 1})` : 'Retry'}
              </Text>
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
            {video.duration && (
              <View style={styles.metaBadge}>
                <Clock size={14} color="#8B5CF6" strokeWidth={2} />
                <Text style={styles.metaText}>{formatDuration(video.duration)}</Text>
              </View>
            )}
            {video.uploadedAt && (
              <View style={styles.metaBadge}>
                <Calendar size={14} color="#8B5CF6" strokeWidth={2} />
                <Text style={styles.metaText}>
                  {new Date(video.uploadedAt).toLocaleDateString()}
                </Text>
              </View>
            )}
            {video.url.includes('drive.google.com') && (
              <View style={styles.metaBadge}>
                <PlayCircle size={14} color="#8B5CF6" strokeWidth={2} />
                <Text style={styles.metaText}>Google Drive</Text>
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
    textAlign: 'center',
  },
  connectionWarning: {
    color: '#FCD34D',
    fontSize: 12,
    marginTop: 8,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    fontStyle: 'italic',
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
