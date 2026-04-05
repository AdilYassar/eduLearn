import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
  Dimensions,
  Image,
} from 'react-native';
import { useVideos } from '@service/hooks/useVideos';
import { Play, ArrowLeft, Search, Calendar, HardDrive, Video } from 'lucide-react-native';
import { goBack, push } from '../../utils/Navigation';
import { GlassCard, ThemedContainer, ThemedText } from '../../components/ui/ThemedComponents';
import { useTheme } from '../../context/ThemeContext';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

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
  const { theme } = useTheme();
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [filteredVideos, setFilteredVideos] = useState<VideoData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const { getAllVideos } = useVideos();

  const fetchVideos = async () => {
    try {
      setIsInitialLoading(true);
      const result = await getAllVideos();
      if (result && Array.isArray(result)) {
        setVideos(result);
        setFilteredVideos(result);
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to fetch videos.');
    } finally {
      setIsInitialLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setFilteredVideos(videos);
    } else {
      const filtered = videos.filter(v =>
        v.title.toLowerCase().includes(query.toLowerCase()) ||
        v.description.toLowerCase().includes(query.toLowerCase()),
      );
      setFilteredVideos(filtered);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 10) / 10 + ' ' + sizes[i];
  };

  const handleVideoSelect = (video: VideoData) => {
    push('VideoPlayerScreen', { video });
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  return (
    <ThemedContainer>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => goBack()}>
            <ArrowLeft size={20} color={theme.text.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text.primary }]}>Video Library</Text>
        <FileVideo size={20} color={theme.primary} />
      </View>

      <View style={styles.searchWrap}>
        <View style={[styles.searchBar, { backgroundColor: 'rgba(255,255,255,0.05)' }]}>
            <Search size={18} color={theme.text.secondary} />
            <TextInput
                style={[styles.input, { color: theme.text.primary }]}
                placeholder="Search tutorials..."
                placeholderTextColor="rgba(255,255,255,0.3)"
                value={searchQuery}
                onChangeText={handleSearch}
            />
        </View>
      </View>

      {isInitialLoading ? (
        <View style={styles.center}>
            <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
          {filteredVideos.length > 0 ? (
            filteredVideos.map((video, index) => (
              <Animated.View key={video._id} entering={FadeInDown.delay(index * 100)}>
                <TouchableOpacity activeOpacity={0.9} onPress={() => handleVideoSelect(video)}>
                    <GlassCard style={styles.videoCard} opacity={0.08}>
                        <View style={styles.thumbnailWrap}>
                            <View style={[styles.playAura, { backgroundColor: theme.primary }]}>
                                <Play size={12} color="#FFF" fill="#FFF" />
                            </View>
                            {/* Placeholder for video thumbnail if available */}
                            <View style={styles.placeholderImg}>
                                <Video size={30} color="rgba(255,255,255,0.1)" />
                            </View>
                        </View>
                        <View style={styles.info}>
                            <Text style={[styles.videoTitle, { color: theme.text.primary }]} numberOfLines={1}>
                                {video.title}
                            </Text>
                            <View style={styles.metaRow}>
                                <View style={styles.metaItem}>
                                    <HardDrive size={12} color={theme.text.secondary} />
                                    <Text style={[styles.metaText, { color: theme.text.secondary }]}>{formatFileSize(video.fileSize)}</Text>
                                </View>
                                <View style={styles.metaItem}>
                                    <Calendar size={12} color={theme.text.secondary} />
                                    <Text style={[styles.metaText, { color: theme.text.secondary }]}>{new Date(video.uploadedAt).toLocaleDateString()}</Text>
                                </View>
                            </View>
                        </View>
                    </GlassCard>
                </TouchableOpacity>
              </Animated.View>
            ))
          ) : (
            <View style={styles.empty}>
                <Video size={48} color="rgba(255,255,255,0.1)" />
                <Text style={{ color: theme.text.secondary, marginTop: 12 }}>No videos found.</Text>
            </View>
          )}
        </ScrollView>
      )}
    </ThemedContainer>
  );
};

// Helper components for consistency
const Text = ({ children, style, ...props }: any) => <ThemedText style={style} {...props}>{children}</ThemedText>;
const FileVideo = ({ size, color }: any) => <Video size={size} color={color} />;

const styles = StyleSheet.create({
  header: {
    height: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Manrope',
    letterSpacing: 1,
  },
  searchWrap: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 40,
    borderRadius: 8,
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Manrope',
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  videoCard: {
    flexDirection: 'row',
    padding: 10,
    marginBottom: 12,
    alignItems: 'center',
    borderRadius: 12,
  },
  thumbnailWrap: {
    width: 60,
    height: 60,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  playAura: {
    position: 'absolute',
    zIndex: 10,
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  placeholderImg: {
    opacity: 0.5,
  },
  info: {
    flex: 1,
    paddingLeft: 12,
    justifyContent: 'center',
  },
  videoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'Manrope',
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 10,
    opacity: 0.6,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  empty: {
    alignItems: 'center',
    marginTop: 100,
    opacity: 0.5,
  },
});

export default VideoLibraryScreen;
