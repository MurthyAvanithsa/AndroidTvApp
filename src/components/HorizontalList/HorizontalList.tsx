import React from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, useWindowDimensions } from 'react-native';
import { useFeed } from '../../hooks/useFeed';
import CardType1 from '../Cards/CardType1';
import CardType2 from '../Cards/CardType2';

interface HorizontalListProps {
  config: any;
}

export default function HorizontalList({ config }: HorizontalListProps) {
  const { width: screenWidth } = useWindowDimensions();
  // ─── Card Size Calculation (ported from Roku getCardSize()) ───────────────────
  // Roku: totalAvailableWidth = deviceInfo.uiResolutionWidth - config.translationLeft
  //       availableWidth = totalAvailableWidth - (cellsPerView * itemSpacing) - (3 * peekOffset)
  //       cardWidth = Int(availableWidth / cellsPerView)
  //       cardHeight = Int(cardWidth / aspectRatio[0] * aspectRatio[1])
  function getCardSize(): { cardWidth: number; cardHeight: number } {
    const cellsPerView: number = config.cells_per_view;
    const cellGap: number = config.cell_gap;
    const peekOffset: number = config.peek_offset;
    const translationLeft: number = config.list_translation_left;

    // Parse aspect ratio from card_style config string e.g. "aspect_16:9" → [16, 9]
    const aspectRatioStr: string =
      config.card_style?.card_type_1?.aspect_ratio ||
      config.card_style?.aspect_ratio ||
      'aspect_16:9';
    const match = aspectRatioStr.match(/(\d+)[x:](\d+)/);
    const arW = match ? parseInt(match[1], 10) : 16;
    const arH = match ? parseInt(match[2], 10) : 9;

    const totalAvailableWidth = screenWidth - translationLeft;
    const availableWidth =
      totalAvailableWidth -
      cellsPerView * cellGap -   // gaps between cards
      3 * peekOffset;             // peek on both sides + one extra (Roku formula)

    const cardWidth = Math.floor(availableWidth / cellsPerView);
    const cardHeight = Math.floor((cardWidth / arW) * arH);

    return { cardWidth, cardHeight };
  }

  const { cardWidth, cardHeight } = getCardSize();
  // Extract the feed URL. 
  // It may be directly under config.feed, or nested in the card_style layout (as seen in the Roku menu payload)
  let feedUrl = null;
  if (config.feed?.feed_url) {
    feedUrl = config.feed.feed_url;
  } else if (config.card_style?.layout?.roku_menu?.feed?.feed_url) {
    feedUrl = config.card_style.layout.roku_menu.feed.feed_url;
  }

  const { data, feedTitle, loading, loadingMore, error, loadMore } = useFeed(feedUrl);
  // console.log("HorizontalList feedUrl:", feedUrl);
  console.log("HorizontalList config:", config);
  // console.log("Playlist Url:", data)
  // console.log("HorizontalList loading:", loading);
  // console.log("HorizontalList loadingMore:", loadingMore);
  // console.log("HorizontalList error:", error);
  // console.log("HorizontalList loadMore:", loadMore);
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
    const isFirst = index === 0;
    const isLast = index === data.length - 1;

    const commonProps = {
      item,
      cardStyleId: styleId,
      width: cardWidth,
      height: cardHeight,
      isFirst,
      isLast,
    };

    switch (cardType) {
      case 'card_type_1':
        return <CardType1 {...commonProps} />;
      case 'card_type_2':
        return <CardType2 {...commonProps} />;
      case 'button_type_1':
        return (
          <View style={[styles.placeholderCard, { width: cardWidth, height: cardHeight }]}>
            <Text style={styles.placeholderText}>ButtonType1 (Coming Soon)</Text>
            <Text style={styles.placeholderText}>{item.title || 'Item'}</Text>
          </View>
        );
      default:
        return (
          <View style={[styles.placeholderCard, { width: cardWidth, height: cardHeight }]}>
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
    // Silently skip rails that are unauthorized (401) — don't show a red error
    if (error.includes('401')) return null;
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
    <View style={[
      styles.container,
      {
        // Outer row positioning — how far this rail sits from the top/bottom of its container
        marginTop: config.list_translation_top ?? 0,
        marginBottom: config.row_gap ?? 60,
        marginLeft: config.list_translation_left ?? 0,
        marginRight: config.list_translation_right ?? 0,
        paddingBottom: config.list_translation_bottom ?? 0,
      }
    ]}>
      {/* Title — sourced from the feed response (feedTitle), with config.name as fallback */}
      {config.enable_title && (
        <Text style={[
          styles.title,
          {
            color: config.title_color || '#ffffff',
            // Space between title and the list below it
            marginBottom: config.title_translation_bottom ?? 10,
            // Horizontal indent of the title (e.g. to align with peek_offset)
            marginLeft: config.title_translation_left ?? 0,
          }
        ]}>
          {config.title_use_custom_text
            ? config.title_custom_text
            : (feedTitle || config.name || 'List')}
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
          // Gap between each card
          gap: config.cell_gap ?? 20,
          // peek_offset: the left padding so the first card is indented
          // and the previous/next cards peek in from the edges
          paddingLeft: config.peek_offset ?? 0,
          paddingRight: config.peek_offset ?? 0,
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
