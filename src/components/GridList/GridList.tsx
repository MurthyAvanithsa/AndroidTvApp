import React from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Dimensions } from 'react-native';
import { useFeed } from '../../hooks/useFeed';
import CardType1 from '../Cards/CardType1';
import CardType2 from '../Cards/CardType2';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface GridListProps {
  config: any;
}

export default function GridList({ config }: GridListProps) {
  // Extract configuration fields
  const columnCount = config.column_count || config.cells_per_view || 4;
  const rowCount = config.row_count || 4;
  const columnGap = config.column_gap ?? config.cell_gap ?? 20;
  const rowGap = config.row_gap ?? config.cell_gap ?? 20;
  const translationTop = config.translation_top ?? 0;
  const translationLeft = config.translation_left ?? 0;
  const translationRight = config.translation_right ?? 0;
  const translationBottom = config.translation_bottom ?? 0;

  // Calculate card width to fit the grid perfectly
  let availableWidth = SCREEN_WIDTH - translationLeft - translationRight;
  availableWidth = availableWidth - ((columnCount - 1) * columnGap);
  const cardWidth = availableWidth / columnCount;

  // Extract the feed URL
  let feedUrl = null;
  if (config.feed?.feed_url) {
    feedUrl = config.feed.feed_url;
  } else if (config.card_style?.layout?.roku_menu?.feed?.feed_url) {
    feedUrl = config.card_style.layout.roku_menu.feed.feed_url;
  }

  const { data, loading, loadingMore, error, loadMore } = useFeed(feedUrl);

  // If item_limit is set, use it. Otherwise, if row_count is set, 
  // it might imply a limited view or just a preferred initial layout.
  // For now, we'll slice the data only if item_limit is explicitly provided.
  const displayData = config.item_limit ? data.slice(0, config.item_limit) : data;

  const renderItem = ({ item }: { item: any }) => {
    const cardStyle = config.card_style;
    if (!cardStyle) return null;

    const cardType = cardStyle.card_type;
    const styleId = cardStyle.documentId || cardStyle.id?.toString();
    console.log("cardWidth:",cardWidth);
    switch (cardType) {
      case 'card_type_1':
        return <CardType1 item={item} cardStyleId={styleId} width={cardWidth} />;
      case 'card_type_2':
        return <CardType2 item={item} cardStyleId={styleId} width={cardWidth} />;
      default:
        return (
          <View style={[styles.placeholderCard, { width: cardWidth }]}>
            <Text style={styles.placeholderText}>{item.title || 'Item'}</Text>
          </View>
        );
    }
  };

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#ffffff" />
      </View>
    );
  };

  if (loading && data.length === 0) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    );
  }

  if (error && data.length === 0) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error loading grid: {error}</Text>
      </View>
    );
  }

  return (
    <View style={{marginTop:60, marginLeft:20, marginRight:20}}>
      {/* Title */}
      {config.enable_title && (
        <Text style={[
          styles.title, 
          { 
            color: config.title_color || '#ffffff',
            marginBottom: config.title_translation_bottom ?? 30,
            marginLeft: config.title_translation_left ?? 0,
            fontFamily: config.title_font_family?.includes('Bold') ? 'System' : 'System', // Placeholder for font family mapping
          }
        ]}>
          {config.title_use_custom_text ? config.title_custom_text : (config.name || 'Grid')}
        </Text>
      )}

      {/* Grid List */}
      <FlatList
        data={displayData}
        keyExtractor={(item, index) => item.id?.toString() || index.toString()}
        renderItem={renderItem}
        numColumns={columnCount}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        columnWrapperStyle={{
          gap: columnGap,
          marginBottom: rowGap,
        }}
        contentContainerStyle={{
          paddingBottom: 100,
        }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    // width: '100%',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 300,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
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
    flex: 1,
    height: 150,
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
