import React from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { useFeed } from '../../hooks/useFeed';
import CardType1 from '../Cards/CardType1';
import CardType2 from '../Cards/CardType2';

interface HorizontalListProps {
  config: any;
}

export default function HorizontalList({ config }: HorizontalListProps) {
  // Extract the feed URL. 
  // It may be directly under config.feed, or nested in the card_style layout (as seen in the Roku menu payload)
  let feedUrl = null;
  if (config.feed?.feed_url) {
    feedUrl = config.feed.feed_url;
  } else if (config.card_style?.layout?.roku_menu?.feed?.feed_url) {
    feedUrl = config.card_style.layout.roku_menu.feed.feed_url;
  }

  const { data, loading, loadingMore, error, loadMore } = useFeed(feedUrl);

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#ffffff" />
      </View>
    );
  };

  const renderItem = ({ item, index }: { item: any; index: number }) => {
    const cardStyle = config.card_style;
    if (!cardStyle) return null;
    const cardType = cardStyle.card_type;
    const styleId = cardStyle.documentId || cardStyle.id?.toString();

    // Focus trapping logic:
    // If it's the first item, don't go further left.
    // If it's the last item, don't go further right.
    const isFirst = index === 0;
    const isLast = index === data.length - 1;

    const commonProps = {
      item,
      cardStyleId: styleId,
      isFirst,
      isLast,
    };

    switch (cardType) {
      case 'card_type_1':
        return <CardType1 {...commonProps} />;
      case 'card_type_2':
        return <CardType2 {...commonProps} />;
      case 'button_type_1':
        // TODO: Implement ButtonType1 component when ready
        return (
          <View style={styles.placeholderCard}>
            <Text style={styles.placeholderText}>ButtonType1 (Coming Soon)</Text>
            <Text style={styles.placeholderText}>{item.title || 'Item'}</Text>
          </View>
        );
      default:
        return (
          <View style={styles.placeholderCard}>
            <Text style={styles.placeholderText}>Unsupported: {cardType}</Text>
          </View>
        );
    }
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error loading list: {error}</Text>
      </View>
    );
  }

  if (!data || data.length === 0) {
    return null; // Don't render empty lists
  }

  return (
    <View style={[styles.container, { marginBottom: config.row_gap ?? 20 }]}>
      {/* Title */}
      {config.enable_title && (
        <Text style={[
          styles.title, 
          { 
            color: config.title_color || '#ffffff',
            marginBottom: config.cell_gap ?? 10 
          }
        ]}>
          {config.title_use_custom_text ? config.title_custom_text : (config.name || 'List')}
        </Text>
      )}

      {/* Horizontal List */}
      <FlatList
        horizontal
        data={data}
        keyExtractor={(item, index) => item.id?.toString() || index.toString()}
        renderItem={renderItem}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        showsHorizontalScrollIndicator={false}
        // Critical for TV focus stability:
        removeClippedSubviews={false}
        windowSize={10}
        contentContainerStyle={{
          gap: config.cell_gap ?? 15,
          paddingHorizontal: 20, // Optional: for edge breathing room
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  loaderContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerLoader: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorContainer: {
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#ff4444',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    paddingHorizontal: 20,
  },
  placeholderCard: {
    width: 200,
    height: 100,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  placeholderText: {
    color: '#fff',
    fontSize: 14,
  }
});
