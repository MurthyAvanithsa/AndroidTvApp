import React, { useState, useEffect, useRef } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, useWindowDimensions, TVFocusGuideView } from 'react-native';
import { useFeed } from '../../hooks/useFeed';
import CardType1 from '../Cards/CardType1';
import CardType2 from '../Cards/CardType2';
import { HorizontalListConfig } from './HorizontalListProps';

interface HorizontalListProps {
  config: HorizontalListConfig;
  hasTVPreferredFocus?: boolean;
  componentName?: string;
}

export default function HorizontalList({ config, hasTVPreferredFocus, componentName }: HorizontalListProps) {
  const { width: screenWidth } = useWindowDimensions();
  const flatListRef = useRef<FlatList>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(0);
  function getCardSize(): { cardWidth: number; cardHeight: number } {
    // Featured rails and Inline features should default to 1 card per view (full width) if not specified
    const isFullWidthRail = componentName === 'FeaturedHomeRail' || componentName === 'FeaturedCarousel' || componentName === 'InlineFeature';
    const cellsPerView: number = config.cells_per_view ?? (isFullWidthRail ? 1 : 3);
    
    const cellGap: number = config.cell_gap ?? 20;
    const translationLeft: number = config.list_translation_left ?? 0;
    const peekOffset: number = config.peek_offset ?? 0;
    const itemSpacing: number = cellGap;

    const aspectRatioStr: string =
      config.card_style?.card_type_1?.aspect_ratio || config.card_style?.card_type_2?.aspect_ratio ||
      config.card_style?.aspect_ratio ||
      'aspect_16:9';
    console.log("aspectRatioStr: ", aspectRatioStr);
    const match = aspectRatioStr.match(/(\d+)[x:](\d+)/);
    const arW = match ? parseInt(match[1], 10) : 16;
    const arH = match ? parseInt(match[2], 10) : 9;

    const totalAvailableWidth = screenWidth - translationLeft;
    const availableWidth = totalAvailableWidth - (cellsPerView * itemSpacing) - (3 * peekOffset);
    
    const cardWidth = availableWidth / cellsPerView;
    let cardHeight = cardWidth * (arH / arW);

    // Roku logic: calculateFocusHeight
    if (config.focus_height && config.focus_height > cardHeight) {
      cardHeight = config.focus_height;
    }

    return { cardWidth, cardHeight };
  }

  const { cardWidth, cardHeight } = getCardSize();

  let feedUrl = null;
  if (config.feed?.feed_url) {
    feedUrl = config.feed.feed_url;
  } else if (config.card_style?.layout?.roku_menu?.feed?.feed_url) {
    feedUrl = config.card_style.layout.roku_menu.feed.feed_url;
  }

  const { data, feedTitle, loading, loadingMore, error, loadMore, hasMore } = useFeed(feedUrl, {
    pageSize: config.lazy_load_item_count ?? 4,
    itemLimit: config.item_limit ?? 0
  });

  useEffect(() => {
    if (config.enable_auto_scroll && data?.length > 0 && !isFocused) {
      const interval = setInterval(() => {
        setFocusedIndex((prev) => {
          const next = prev >= data.length - 1 ? 0 : prev + 1;
          flatListRef.current?.scrollToIndex({ index: next, animated: true });
          return next;
        });
      }, (config.auto_scroll_interval ?? 5) * 1000);
      return () => clearInterval(interval);
    }
  }, [config.enable_auto_scroll, config.auto_scroll_interval, data, isFocused]);
  // if (config.name == "FeaturedHomeRail") {
  //   console.log('HorizontalList config:', config.card_style);
  //   console.log('HorizontalList data:', data);
  // }

  const renderFooter = () => {
    if (!hasMore || !loadingMore) return null;
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

    const isFirst = index === 0;
    const isLast = index === data.length - 1;
    console.log("isLast: ", isLast);
    console.log("isFirst: ", isFirst);
    
    const commonProps = {
      item,
      cardStyleId: styleId,
      width: cardWidth,
      presetName: config.name,
      isFirst,
      isLast,
      onFocus: () => {
        setFocusedIndex(index);
      },
      hasTVPreferredFocus: hasTVPreferredFocus && index === 0,
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

  // FIX: use computed cardHeight for the loading placeholder so layout doesn't shift
  if (loading) {
    return (
      <View style={[styles.loaderContainer, { height: cardHeight }]}>
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    );
  }

  if (error) {
    if (error.includes('401')) return null;
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error loading list: {error}</Text>
      </View>
    );
  }

  if (!data || data.length === 0) {
    return null;
  }
// console.log("cardHeight: ", cardHeight);
return(
    <TVFocusGuideView 
      autoFocus
      style={styles.container}
    >
      <View 
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      >
      {config.enable_title && (
        <Text style={[
          styles.title,
          {
            color: isFocused ? (config.title_focused_color || '#ffffff') : (config.title_color || '#ffffff'),
            
          }
        ]}>
          {config.title_use_custom_text
            ? config.title_custom_text
            : (feedTitle || config.name || 'List')}
        </Text>
      )}

      
        <FlatList
          ref={flatListRef}
          horizontal
          data={data}
          keyExtractor={(item, index) => item.id?.toString() || index.toString()}
          renderItem={renderItem}
          onEndReached={hasMore ? loadMore : null}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          showsHorizontalScrollIndicator={false}
          removeClippedSubviews={false}
          windowSize={10}
          contentContainerStyle={{
            gap: 10,
            // marginTop: 5,
          }}
        />
      {/* Pagination Dots (Equivalent to applyPaginationDotsStyles) */}
      {config.enable_pagination_dots && data && (
        <View style={styles.dotContainer}>
          {data.slice(0, 10).map((_, i) => (
            <View 
              key={i} 
              style={[
                styles.dot, 
                { backgroundColor: i === focusedIndex ? (config.pagination_dots_selected_color || '#ffffff') : (config.pagination_dots_unselected_color || '#666666') }
              ]} 
            />
          ))}
        </View>
      )}
      </View>
    </TVFocusGuideView>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  loaderContainer: {
    // FIX: height is now set dynamically from cardHeight (see above)
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
    paddingBottom:20
    // paddingHorizontal: 20,
  },
  placeholderCard: {
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  placeholderText: {
    color: '#fff',
    fontSize: 14,
  },
  dotContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  }
});