import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
  Dimensions,
  ScrollView,
  Image,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { useAppTheme } from '../../../context/ThemeContext';
import { getVideos, uploadVideo, deleteVideo } from '../../../redux/reducers/adminSlice';
import { AppDispatch, RootState } from '../../../redux/store';
import AdminHeader from '../ui/AdminHeader';
import { AdminCard } from '../ui/AdminCard';
import { AdminEmptyState, AdminErrorBanner } from '../ui/AdminEmpty';
import AdminInput from '../ui/AdminInput';
import AdminButton from '../ui/AdminButton';
import {
  Video,
  Trash2,
  Plus,
  PlayCircle,
  Upload,
  X,
  FileVideo,
  ChevronLeft,
  ChevronRight,
  Eye,
  Clock,
  MoreVertical,
  Maximize2
} from 'lucide-react-native';
import VideoPlayer from 'react-native-video';
import { launchImageLibrary } from 'react-native-image-picker';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  useAnimatedScrollHandler,
  interpolate,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = width * 0.78;
const SPACING = (width - ITEM_WIDTH) / 2;

interface Props {
  navigation: any;
}

const AnimatedVideoCard = React.memo(({
  item,
  index,
  theme,
  styles,
  onDelete,
  onPreview,
  scrollX,
}: {
  item: any;
  index: number;
  theme: any;
  styles: any;
  onDelete: (id: string) => void;
  onPreview: (item: any) => void;
  scrollX: Animated.SharedValue<number>;
}) => {
  const inputRange = [
    (index - 1) * ITEM_WIDTH,
    index * ITEM_WIDTH,
    (index + 1) * ITEM_WIDTH,
  ];

  const animatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(scrollX.value, inputRange, [0.85, 1, 0.85], 'clamp');
    const opacity = interpolate(scrollX.value, inputRange, [0.4, 1, 0.4], 'clamp');
    const translateY = interpolate(scrollX.value, inputRange, [40, 0, 40], 'clamp');
    const rotateY = interpolate(scrollX.value, inputRange, [15, 0, -15], 'clamp');

    return {
      opacity,
      transform: [
        { perspective: 1000 },
        { translateY },
        { scale },
        { rotateY: `${rotateY}deg` },
      ],
    };
  });

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <Animated.View style={[{ width: ITEM_WIDTH }, animatedStyle]}>
      <TouchableOpacity activeOpacity={0.9} onPress={() => onPreview(item)}>
        <AdminCard style={styles.videoCard}>
          <View style={styles.thumbnailBox}>
            <View style={styles.playOverlay}>
              <PlayCircle size={48} color="#ffffff" fill="rgba(93, 75, 163, 0.3)" />
            </View>
            <View style={styles.durationBadge}>
              <Text style={styles.durationText}>{formatDuration(item.duration || 0)}</Text>
            </View>
          </View>

        <View style={styles.videoInfo}>
          <Text style={[styles.videoTitle, { color: theme.dark ? '#fdf7ff' : '#2D2560' }]} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={[styles.videoDesc, { color: theme.dark ? '#cac4d3' : '#797582' }]} numberOfLines={2}>
            {item.description || 'Cloud-based educational video content.'}
          </Text>
        </View>

        <View style={[styles.divider, { backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]} />

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Eye size={16} color="#5D4BA3" />
            <Text style={[styles.statText, { color: theme.dark ? '#cac4d3' : '#797582' }]}>{item.views || 0} plays</Text>
          </View>
          <View style={styles.statItem}>
            <Clock size={16} color="#5D4BA3" />
            <Text style={[styles.statText, { color: theme.dark ? '#cac4d3' : '#797582' }]}>
              {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}
            </Text>
          </View>
        </View>

        <View style={styles.cardActions}>
          <TouchableOpacity onPress={() => onPreview(item)} style={styles.actionBtn}>
            <PlayCircle size={18} color="#5D4BA3" />
            <Text style={[styles.btnText, { color: '#5D4BA3' }]}>Preview</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onDelete(item._id || item.id)} style={[styles.actionBtn, styles.deleteBtn]}>
            <Trash2 size={18} color="#ba1a1a" />
          </TouchableOpacity>
        </View>
      </AdminCard>
      </TouchableOpacity>
    </Animated.View>
  );
});

const AdminVideoLibraryScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useAppTheme();
  const dispatch = useDispatch<AppDispatch>();
  const { videos, isLoading, error, pagination } = useSelector(
    (state: RootState) => state.admin
  );

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadData, setUploadData] = useState({ title: '', description: '', video: null as any });
  const [playingVideo, setPlayingVideo] = useState<any>(null);

  const scrollX = useSharedValue(0);
  const flatListRef = React.useRef<any>(null);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  useEffect(() => {
    dispatch(getVideos({ page: pagination.page, limit: pagination.limit }));
  }, [dispatch]);

  const handlePickVideo = async () => {
    const result = await launchImageLibrary({ mediaType: 'video', quality: 1 });
    if (result.didCancel || !result.assets) return;
    setUploadData({ ...uploadData, video: result.assets[0] });
  };

  const handleUpload = async () => {
    if (!uploadData.title || !uploadData.video) {
      Alert.alert('Error', 'Title and video file are required');
      return;
    }

    const formData = new FormData();
    formData.append('title', uploadData.title);
    formData.append('description', uploadData.description);

    const videoFile = {
      uri: uploadData.video.uri,
      name: uploadData.video.fileName || `video_${Date.now()}.mp4`,
      type: uploadData.video.type || 'video/mp4',
    };

    formData.append('video', videoFile as any);

    try {
      await dispatch(uploadVideo(formData)).unwrap();
      Alert.alert('Success', 'Video uploaded successfully');
      setShowUploadModal(false);
      setUploadData({ title: '', description: '', video: null });
    } catch (err) {
      Alert.alert('Upload Failed', 'Check file size and network');
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Media', 'Remove this video from cloud storage?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => dispatch(deleteVideo(id)) }
    ]);
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.dark ? '#1c1b21' : '#F8F6FD',
    },
    wheelerContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 10, // Move up
    },
    videoCard: {
      height: 420, // Reduced for compactness
      borderRadius: 32,
      padding: 20,
      backgroundColor: theme.dark ? '#25232a' : '#ffffff',
      gap: 5, // Tighter gaps
      shadowColor: '#5D4BA3',
      shadowOffset: { width: 0, height: 20 },
      shadowOpacity: 0.15,
      shadowRadius: 30,
      elevation: 10,
    },
    thumbnailBox: {
      width: '100%',
      height: 130, // Reduced from 180 to prevent overflow
      backgroundColor: theme.dark ? '#1c1b21' : '#F4F2FF',
      borderRadius: 24,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 10,
      overflow: 'hidden',
    },
    playOverlay: {
      ...StyleSheet.absoluteFillObject,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.1)',
    },
    durationBadge: {
      position: 'absolute',
      bottom: 12,
      right: 12,
      backgroundColor: 'rgba(0,0,0,0.75)',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
    },
    durationText: {
      color: '#fff',
      fontSize: 10,
      fontWeight: '700',
    },
    videoInfo: {
      marginBottom: 20,
    },
    videoTitle: {
      fontSize: 20,
      fontWeight: '800',
      marginBottom: 8,
      lineHeight: 26,
    },
    videoDesc: {
      fontSize: 13,
      fontWeight: '500',
      lineHeight: 18,
    },
    divider: {
      height: 1,
      marginBottom: 20,
    },
    statsRow: {
      flexDirection: 'row',
      gap: 20,
      marginBottom: 24,
    },
    statItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    statText: {
      fontSize: 12,
      fontWeight: '600',
    },
    cardActions: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 'auto',
      marginBottom: 10,
    },
    actionBtn: {
      flex: 3,
      height: 48,
      borderRadius: 14,
      backgroundColor: theme.dark ? '#312f36' : '#F4F2FF',
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 8,
    },
    deleteBtn: {
      flex: 1,
      backgroundColor: theme.dark ? '#3a1f21' : '#FFEBEE',
    },
    btnText: {
      fontSize: 14,
      fontWeight: '700',
    },
    paginationCard: {
      width: ITEM_WIDTH,
      height: 480,
      borderRadius: 32,
      padding: 24,
      backgroundColor: '#5D4BA3',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContainer: {
      flex: 1,
      backgroundColor: 'rgba(45, 37, 96, 0.4)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: theme.dark ? '#1c1b21' : '#ffffff',
      borderTopLeftRadius: 32,
      borderTopRightRadius: 32,
      padding: 24,
      paddingBottom: 40,
      minHeight: '60%',
    },
    playerOverlay: {
      flex: 1,
      backgroundColor: '#000',
      justifyContent: 'center',
    },
    videoPlayer: {
      width: '100%',
      aspectRatio: 16 / 9,
    },
    closePlayerBtn: {
      position: 'absolute',
      top: 40,
      right: 20,
      zIndex: 10,
      padding: 10,
      backgroundColor: 'rgba(255,255,255,0.2)',
      borderRadius: 20,
    },
    playerInfo: {
      position: 'absolute',
      bottom: 60,
      left: 20,
      right: 20,
    },
  });

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <AdminHeader
        title="Video Vault"
        subtitle="Cloud Media Library"
        showBack
        onBackPress={() => navigation.goBack()}
        rightAction={
          <TouchableOpacity onPress={() => setShowUploadModal(true)}>
            <Plus size={24} color="#5D4BA3" />
          </TouchableOpacity>
        }
      />

      <View style={{ flex: 1 }}>
        {error && <AdminErrorBanner message={error} />}

        <View style={styles.wheelerContainer}>
          <Animated.FlatList
            ref={flatListRef}
            data={videos}
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={ITEM_WIDTH}
            decelerationRate="fast"
            contentContainerStyle={{ paddingHorizontal: SPACING, alignItems: 'center' }}
            onScroll={scrollHandler}
            scrollEventThrottle={16}
            keyExtractor={(item) => item._id || item.id}
            renderItem={({ item, index }) => (
              <AnimatedVideoCard
                item={item}
                index={index}
                theme={theme}
                styles={styles}
                onDelete={handleDelete}
                onPreview={(v) => setPlayingVideo(v)}
                scrollX={scrollX}
              />
            )}
            ListEmptyComponent={
              !isLoading ? (
                <View style={{ width: width - SPACING * 2 }}>
                  <AdminEmptyState
                    title="No Videos Uploaded"
                    description="Populate your library with high-quality educational videos."
                    icon={<Video size={64} color="#5D4BA3" />}
                    onPress={() => setShowUploadModal(true)}
                    buttonText="Upload Media"
                  />
                </View>
              ) : (
                <ActivityIndicator size="large" color="#5D4BA3" />
              )
            }
            ListFooterComponent={() => {
              const totalPages = Math.ceil((pagination.total || 0) / (pagination.limit || 10));
              if (totalPages <= 1) return null;
              return (
                <View style={{ width: ITEM_WIDTH, paddingHorizontal: 8 }}>
                  <View style={styles.paginationCard}>
                    <Text style={{ color: '#fff', fontSize: 24, fontWeight: '800' }}>Navigation</Text>
                    <Text style={{ color: 'rgba(255,255,255,0.7)', marginVertical: 8 }}>End of Library</Text>
                  </View>
                </View>
              );
            }}
          />
        </View>
      </View>

      <Modal visible={showUploadModal} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 }}>
              <Text style={{ fontSize: 22, fontWeight: '800', color: theme.dark ? '#fdf7ff' : '#2D2560' }}>Cloud Upload</Text>
              <TouchableOpacity onPress={() => setShowUploadModal(false)}>
                <X size={24} color="#797582" />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <AdminInput label="Media Title" value={uploadData.title} onChangeText={(t) => setUploadData({ ...uploadData, title: t })} />
              <AdminInput label="Description" value={uploadData.description} onChangeText={(t) => setUploadData({ ...uploadData, description: t })} multiline numberOfLines={3} />

              <TouchableOpacity onPress={handlePickVideo} style={{
                height: 120,
                backgroundColor: theme.dark ? '#312f36' : '#F4F2FF',
                borderRadius: 16,
                borderWidth: 2,
                borderStyle: 'dashed',
                borderColor: '#5D4BA3',
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: 16,
                marginBottom: 24
              }}>
                {uploadData.video ? (
                  <Text style={{ color: '#5D4BA3', fontWeight: '700' }}>{uploadData.video.fileName || 'Video Selected'}</Text>
                ) : (
                  <>
                    <Upload size={32} color="#5D4BA3" />
                    <Text style={{ color: '#5D4BA3', fontWeight: '600', marginTop: 8 }}>Choose Video File</Text>
                  </>
                )}
              </TouchableOpacity>

              <AdminButton title="Push to Cloud" onPress={handleUpload} loading={isLoading} />
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal visible={!!playingVideo} animationType="fade" transparent statusBarTranslucent>
        <View style={styles.playerOverlay}>
          <TouchableOpacity 
            style={styles.closePlayerBtn} 
            onPress={() => setPlayingVideo(null)}
          >
            <X size={24} color="#fff" />
          </TouchableOpacity>

          {playingVideo && (
            <>
              <VideoPlayer
                source={{ uri: playingVideo.videoUrl || playingVideo.url }}
                style={styles.videoPlayer}
                controls={true}
                resizeMode="contain"
                paused={false}
                repeat={false}
                playInBackground={false}
                onEnd={() => setPlayingVideo(null)}
                onError={(e) => {
                  console.error('Video Player Error:', e);
                  Alert.alert(
                    'Playback Error', 
                    'The native player could not stream this video. Would you like to open it in your browser instead?',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Open in Browser', onPress: () => Linking.openURL(playingVideo.videoUrl || playingVideo.url) }
                    ]
                  );
                }}
              />
              
              <View style={styles.playerInfo}>
                <Text style={{ color: '#fff', fontSize: 24, fontWeight: '800', marginBottom: 8 }}>
                  {playingVideo.title}
                </Text>
                <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14 }}>
                  {playingVideo.description || 'No description available.'}
                </Text>
                
                <TouchableOpacity 
                  onPress={() => Linking.openURL(playingVideo.videoUrl || playingVideo.url)}
                  style={{ 
                    marginTop: 20, 
                    flexDirection: 'row', 
                    alignItems: 'center',
                    backgroundColor: 'rgba(93, 75, 163, 0.4)',
                    padding: 12,
                    borderRadius: 12,
                    alignSelf: 'flex-start'
                  }}
                >
                  <Maximize2 size={18} color="#fff" style={{ marginRight: 8 }} />
                  <Text style={{ color: '#fff', fontWeight: '600' }}>Open in Cloud Viewer</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default AdminVideoLibraryScreen;
