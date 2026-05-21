// src/components/Curation/Curation.tsx
//
// Flow:
//   1. useHpc() fetches the HPC feed → array of { preset_name, feed_url, index }
//   2. For each rail, look up preset_name in screenPresets (from StrapiContext)
//   3. The preset has preset_blocks, each with a `component` identifier + config
//   4. Feed the HPC feed_url into the block config
//   5. CurationBlockRenderer maps component identifier → the correct React component

import React from 'react';
import { FlatList, View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { useHpc } from '../../hooks/useHpc';
import { useStrapiContext } from '../../context/StrapiContext';
import CurationBlockRenderer from './CurationBlockRenderer';

export default function Curation() {
  const { data, loading, loadingMore, error, loadMore } = useHpc();
  const { screenPresets } = useStrapiContext();
  console.log('🔑 All Available Strapi Preset Keys:', Object.keys(screenPresets));
console.log('🔐 HPC Feed Data:', JSON.stringify(data, null, 2));
  const renderItem = ({ item }: { item: any }) => {
    const { preset_name, feed_url } = item;
// console.log("preset_name: ",preset_name);
    // Normalize preset key (matches parseScreenPresets key logic)
    // e.g. "16x9-NoTitle" → "16x9NoTitle"
    const basePresetKey = preset_name?.replace(/-([a-zA-Z0-9])/g, (_: string, c: string) =>
      c.toUpperCase()
    );
    
    // First try the exact preset name, then try falling back to the Android-specific preset name
    const presetKey = screenPresets[basePresetKey] ? basePresetKey : `${basePresetKey}Android`;
    const preset = screenPresets[presetKey];
// console.log("preset: ",preset); 
    if (!preset) {
      console.warn(`⚠️ Curation: No preset found for "${preset_name}" (key: "${presetKey}")`);
      return null;
    }

    const { preset_blocks } = preset;

    if (!preset_blocks || preset_blocks.length === 0) {
      console.warn(`⚠️ Curation: Preset "${preset_name}" has no blocks.`);
      return null;
    }
    return (
      <View style={styles.railContainer}>
        {preset_blocks.map((block: any, blockIndex: number) => (
          <CurationBlockRenderer
            key={`${preset_name}-block-${blockIndex}`}
            component={block.component}
            isFirstBlock={item.index === 0 && blockIndex === 0}
            config={{
              ...block.config,
              feed: {
                ...block.config?.feed,
                feed_url: feed_url,
              },
            }}
          />
        ))}
      </View>
    );
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
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    );
  }

  if (error && data.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Error loading curation: {error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item) => `rail-${item.index}-${item.preset_name}`}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        // Lazy loading optimizations:
        initialNumToRender={2}
        maxToRenderPerBatch={2}
        windowSize={5}
        removeClippedSubviews={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flex: 1,
    backgroundColor: '#000000',
  },
  listContent: {
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  railContainer: {
    marginBottom: 60,
    minHeight: 150,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 400,
  },
  footerLoader: {
    paddingVertical: 30,
    alignItems: 'center',
  },
  errorText: {
    color: '#ff4444',
    fontSize: 16,
  },
});
