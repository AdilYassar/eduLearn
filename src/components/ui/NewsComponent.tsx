import React, { useState, useEffect, useCallback } from 'react';
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
  Dimensions,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { GlassCard, ThemedText } from './ThemedComponents';
import Animated, { FadeInRight } from 'react-native-reanimated';

const { width: screenWidth } = Dimensions.get('window');

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

const NewsComponent: React.FC = () => {
  const { theme } = useTheme();
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  const API_KEY = '65616e2ee13a4347a94031872e9aba7b';
  const NEWS_API_URL = 'https://newsapi.org/v2/everything';

  const filterCategories = [
    { id: 'all', label: 'All News' },
    { id: 'ai', label: 'AI & ML' },
    { id: 'tech', label: 'Tech' },
    { id: 'science', label: 'Science' },
  ];

  const fetchNews = useCallback(async (isRefresh: boolean = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const techQuery = 'technology OR AI OR "artificial intelligence" OR "machine learning" OR "blockchain" OR "startup"';
      const response = await fetch(
        `${NEWS_API_URL}?q=${encodeURIComponent(techQuery)}&language=en&sortBy=publishedAt&pageSize=20&apiKey=${API_KEY}`
      );

      const data: NewsResponse = await response.json();
      if (data.status === 'ok') {
        const withImages = data.articles.filter(a => a.urlToImage);
        setArticles(withImages);
      }
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [API_KEY]);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  const handleArticlePress = (url: string) => {
    Linking.openURL(url).catch(() => Alert.alert('Error', 'Failed to open article'));
  };

  const renderNewsItem = ({ item, index }: { item: NewsArticle; index: number }) => (
    <Animated.View entering={FadeInRight.delay(index * 100).duration(500)}>
      <TouchableOpacity
        onPress={() => handleArticlePress(item.url)}
        activeOpacity={0.9}
      >
        <GlassCard style={styles.newsCard} opacity={0.08} glow={false}>
          <Image source={{ uri: item.urlToImage! }} style={styles.cardImage} />
          <View style={styles.cardContent}>
            <ThemedText style={styles.sourceTag} color={theme.primary}>{item.source.name}</ThemedText>
            <ThemedText style={styles.articleTitle} weight="bold" numberOfLines={2}>
              {item.title}
            </ThemedText>
          </View>
        </GlassCard>
      </TouchableOpacity>
    </Animated.View>
  );

  if (loading && !refreshing) {
    return <ActivityIndicator size="large" color={theme.primary} style={styles.loader} />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
         <ThemedText style={styles.title} weight="bold">Latest Insights</ThemedText>
      </View>
      
      <View style={styles.filterRow}>
         {filterCategories.map(cat => (
             <TouchableOpacity 
                key={cat.id}
                onPress={() => setSelectedFilter(cat.id)}
                style={[
                    styles.filterChip, 
                    { backgroundColor: selectedFilter === cat.id ? theme.primary : 'rgba(255,255,255,0.05)' }
                ]}
             >
                 <ThemedText 
                    style={styles.filterText} 
                    color={selectedFilter === cat.id ? '#FFF' : theme.text.secondary}
                 >
                    {cat.label}
                 </ThemedText>
             </TouchableOpacity>
         ))}
      </View>

      <FlatList
        data={articles}
        renderItem={renderNewsItem}
        keyExtractor={(item, index) => `${item.url}-${index}`}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listPadding}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchNews(true)}
            colors={[theme.primary]}
            tintColor={theme.primary}
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
  },
  header: {
    paddingHorizontal: 24,
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    letterSpacing: 0.5,
  },
  filterRow: {
      flexDirection: 'row',
      paddingHorizontal: 24,
      marginBottom: 16,
      gap: 8,
  },
  filterChip: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 10,
  },
  filterText: {
      fontSize: 11,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
  },
  loader: {
    marginVertical: 40,
  },
  listPadding: {
    paddingHorizontal: 16,
  },
  newsCard: {
    width: screenWidth * 0.7,
    marginHorizontal: 8,
    padding: 0,
    overflow: 'hidden',
    height: 180,
    borderRadius: 18,
    marginVertical: 4,
  },
  cardImage: {
    width: '100%',
    height: '60%',
    resizeMode: 'cover',
  },
  cardContent: {
    padding: 12,
  },
  sourceTag: {
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  articleTitle: {
    fontSize: 14,
    lineHeight: 18,
  },
});

export default NewsComponent;
