import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Linking,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import CustomText from './CustomText';
import { Colors } from '../../utils/Constants';
import { screenWidth } from '../../utils/scaling';
import { RFValue } from 'react-native-responsive-fontsize';

interface NewsArticle {
  source: {
    id: string | null;
    name: string;
  };
  author: string | null;
  title: string;
  description: string | null;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  content: string | null;
}

interface NewsResponse {
  status: string;
  totalResults: number;
  articles: NewsArticle[];
}

interface NewsComponentProps {
  bgColor?: string;
}

const NewsComponent: React.FC<NewsComponentProps> = ({ bgColor = '#fff' }) => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  const API_KEY = '65616e2ee13a4347a94031872e9aba7b';
  const NEWS_API_URL = 'https://newsapi.org/v2/everything';

  // Tech-focused keywords for filtering modern tech trends
  const techKeywords = useMemo(() => [
    'AI', 'artificial intelligence', 'machine learning', 'blockchain', 'cryptocurrency',
    'tech', 'technology', 'startup', 'innovation', 'digital', 'software', 'app',
    'smartphone', 'cloud computing', 'cybersecurity', 'data science', 'automation',
    'IoT', 'virtual reality', 'augmented reality', 'robotics', 'quantum computing',
    'coding', 'programming', 'developer', 'silicon valley', 'tech giant', 'Tesla',
    'Apple', 'Google', 'Microsoft', 'Meta', 'Amazon', 'Netflix', 'Uber', 'SpaceX',
  ], []);

  const filterCategories = [
    { id: 'all', label: 'All Tech' },
    { id: 'ai', label: 'AI & ML' },
    { id: 'blockchain', label: 'Blockchain' },
    { id: 'startups', label: 'Startups' },
    { id: 'mobile', label: 'Mobile Tech' },
    { id: 'security', label: 'Cybersecurity' },
  ];

  const fetchNews = useCallback(async (isRefresh: boolean = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      // Use tech-focused query to get relevant articles
      const techQuery = 'technology OR AI OR "artificial intelligence" OR blockchain OR startup OR innovation OR "machine learning" OR cybersecurity OR "cloud computing"';
      const response = await fetch(
        `${NEWS_API_URL}?q=${encodeURIComponent(techQuery)}&language=en&sortBy=publishedAt&pageSize=50&apiKey=${API_KEY}`,
        {
          method: 'GET',
          headers: {
            'X-Api-Key': API_KEY,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: NewsResponse = await response.json();
      
      if (data.status === 'ok') {
        // Filter articles to ensure they're tech-related
        const techFilteredArticles = data.articles.filter(article =>
          techKeywords.some(keyword =>
            article.title.toLowerCase().includes(keyword.toLowerCase()) ||
            (article.description && article.description.toLowerCase().includes(keyword.toLowerCase())) ||
            (article.content && article.content.toLowerCase().includes(keyword.toLowerCase()))
          )
        );
        setArticles(techFilteredArticles);
        setFilteredArticles(techFilteredArticles);
      } else {
        throw new Error('Failed to fetch news');
      }
    } catch (error) {
      console.error('Error fetching news:', error);
      Alert.alert(
        'Error',
        'Failed to fetch news. Please check your internet connection and try again.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [API_KEY, NEWS_API_URL, techKeywords]);

  // Filter articles based on selected category
  const filterArticlesByCategory = (category: string) => {
    setSelectedFilter(category);
    
    if (category === 'all') {
      setFilteredArticles(articles);
      return;
    }

    const filtered = articles.filter(article => {
      const text = `${article.title} ${article.description || ''} ${article.content || ''}`.toLowerCase();
      
      switch (category) {
        case 'ai':
          return text.includes('ai') || text.includes('artificial intelligence') ||
                 text.includes('machine learning') || text.includes('neural network');
        case 'blockchain':
          return text.includes('blockchain') || text.includes('cryptocurrency') ||
                 text.includes('bitcoin') || text.includes('crypto');
        case 'startups':
          return text.includes('startup') || text.includes('venture capital') ||
                 text.includes('funding') || text.includes('investment');
        case 'mobile':
          return text.includes('mobile') || text.includes('smartphone') ||
                 text.includes('app') || text.includes('ios') || text.includes('android');
        case 'security':
          return text.includes('cybersecurity') || text.includes('security breach') ||
                 text.includes('hacking') || text.includes('data protection');
        default:
          return true;
      }
    });
    
    setFilteredArticles(filtered);
  };

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  const handleArticlePress = (url: string) => {
    Linking.openURL(url).catch(err => {
      console.error('Failed to open URL:', err);
      Alert.alert('Error', 'Failed to open article');
    });
  };

  const formatTimeAgo = (publishedAt: string): string => {
    const now = new Date();
    const publishedDate = new Date(publishedAt);
    const diffInHours = Math.floor((now.getTime() - publishedDate.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  const getCategoryColor = (index: number): string => {
    const colors = [Colors.primary, Colors.secondary, Colors.teal_600, Colors.teal_700];
    return colors[index % colors.length];
  };

  const getCategoryName = (index: number): string => {
    const categories = ['Tech', 'Politics', 'Science', 'Business'];
    return categories[index % categories.length];
  };

  const renderNewsItem = ({ item, index }: { item: NewsArticle; index: number }) => (
    <TouchableOpacity
      style={styles.horizontalNewsCard}
      onPress={() => handleArticlePress(item.url)}
      activeOpacity={0.8}
    >
      {item.urlToImage && (
        <View style={styles.horizontalImageContainer}>
          <Image
            source={{ uri: item.urlToImage }}
            style={styles.horizontalNewsImage}
            resizeMode="cover"
          />
        </View>
      )}
      
      <View style={styles.horizontalCardContent}>
        <View style={styles.categoryContainer}>
          <CustomText
            variant="caption"
            weight="medium"
            color={getCategoryColor(index)}
            style={styles.categoryText}
          >
            {getCategoryName(index)}
          </CustomText>
        </View>
        
        <CustomText
          variant="h6"
          weight="semibold"
          color="#1a1a1a"
          numberOfLines={3}
          style={styles.horizontalTitleText}
        >
          {item.title}
        </CustomText>
        
        {item.description && (
          <CustomText
            variant="body"
            weight="regular"
            color="#2C3E50"
            numberOfLines={4}
            style={styles.horizontalDescriptionText}
          >
            {item.description}
          </CustomText>
        )}
        
        <View style={styles.horizontalMetaInfo}>
          <CustomText
            variant="caption"
            weight="regular"
            color="#555555"
            style={styles.timeText}
          >
            {formatTimeAgo(item.publishedAt)}
          </CustomText>
          {item.source.name && (
            <CustomText
              variant="caption"
              weight="regular"
              color="#555555"
              style={styles.horizontalSourceText}
              numberOfLines={1}
            >
              • {item.source.name}
            </CustomText>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <CustomText
        variant="h4"
        weight="bold"
        color="#1a1a1a"
        style={styles.headerTitle}
      >
        Tech News & Trends
      </CustomText>
      <CustomText
        variant="body"
        weight="regular"
        color="#2C3E50"
        style={styles.headerSubtitle}
      >
        Latest technology news and modern trends
      </CustomText>
      
      {/* Filter Categories */}
      <View style={styles.filterContainer}>
        <FlatList
          data={filterCategories}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterButton,
                selectedFilter === item.id && styles.filterButtonActive,
              ]}
              onPress={() => filterArticlesByCategory(item.id)}
            >
              <CustomText
                variant="caption"
                weight="medium"
                color={selectedFilter === item.id ? '#FFFFFF' : Colors.primary}
                style={styles.filterText}
              >
                {item.label}
              </CustomText>
            </TouchableOpacity>
          )}
        />
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <CustomText
          variant="body"
          weight="regular"
          color={Colors.text_light}
          style={styles.loadingText}
        >
          Loading news...
        </CustomText>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      {renderHeader()}
      <FlatList
        data={filteredArticles}
        renderItem={renderNewsItem}
        keyExtractor={(item, index) => `${item.url}-${index}`}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalListContainer}
        style={styles.horizontalList}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchNews(true)}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 16,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  headerContainer: {
    paddingVertical: 20,
    paddingBottom: 24,
  },
  headerTitle: {
    marginBottom: 4,
  },
  headerSubtitle: {
    opacity: 0.7,
  },
  newsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 16,
    marginBottom: 16,
    marginHorizontal: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  cardContent: {
    flexDirection: 'row',
  },
  textContent: {
    flex: 1,
    paddingRight: 12,
  },
  categoryContainer: {
    marginBottom: 8,
  },
  categoryText: {
    fontSize: RFValue(11),
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  titleText: {
    fontSize: RFValue(16),
    lineHeight: RFValue(22),
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: RFValue(14),
    lineHeight: RFValue(20),
    marginBottom: 12,
    opacity: 0.8,
  },
  metaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: RFValue(12),
  },
  sourceText: {
    fontSize: RFValue(12),
    marginLeft: 4,
    flex: 1,
  },
  imageContainer: {
    width: screenWidth * 0.25,
    height: screenWidth * 0.25,
    borderRadius: 12,
    overflow: 'hidden',
  },
  newsImage: {
    width: '100%',
    height: '100%',
  },
  filterContainer: {
    marginTop: 16,
    marginBottom: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  filterButtonActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderColor: 'rgba(255, 255, 255, 0.6)',
  },
  filterText: {
    fontSize: RFValue(12),
    color: '#1a1a1a',
    fontWeight: '600',
  },
  // Horizontal layout styles
  horizontalList: {
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  horizontalListContainer: {
    paddingRight: 16,
    paddingBottom: 10,
  },
  horizontalNewsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 16,
    marginRight: 16,
    marginBottom: 16,
    width: screenWidth * 0.75,
    height: screenWidth * 0.85,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  horizontalImageContainer: {
    width: '100%',
    height: screenWidth * 0.4,
  },
  horizontalNewsImage: {
    width: '100%',
    height: '100%',
  },
  horizontalCardContent: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  horizontalTitleText: {
    fontSize: RFValue(16),
    lineHeight: RFValue(22),
    marginBottom: 8,
    marginTop: 8,
  },
  horizontalDescriptionText: {
    fontSize: RFValue(14),
    lineHeight: RFValue(20),
    opacity: 0.8,
    flex: 1,
  },
  horizontalMetaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  horizontalSourceText: {
    fontSize: RFValue(12),
    marginLeft: 4,
    flex: 1,
  },
});

export default NewsComponent;
