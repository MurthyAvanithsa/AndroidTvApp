import React from 'react';
import { ScrollView, StyleSheet, View, Text } from 'react-native';
import { useStrapiContext } from '../../context/StrapiContext';
import ScreenFactory from '../ScreenFactory/ScreenFactory';
import { t } from '../../utils/i18n';

export default function ScreenComposition() {
  const { currentActiveItem, contentTypeRoutes, screenConfigs } = useStrapiContext();

  if (!currentActiveItem) {
    return (
      <View style={styles.fallbackContainer}>
        <Text style={styles.fallbackText}>{t('noActiveItem')}</Text>
      </View>
    );
  }

  const contentType = currentActiveItem.type?.value || 'video';
  const route = contentTypeRoutes[contentType];

  if (!route) {
    return (
      <View style={styles.fallbackContainer}>
        <Text style={styles.fallbackText}>{t('noRouteMapping', { contentType })}</Text>
      </View>
    );
  }

  const screen = screenConfigs[route.pageId];

  if (!screen) {
    return (
      <View style={styles.fallbackContainer}>
        <Text style={styles.fallbackText}>{t('noScreenConfig', { pageId: route.pageId })}</Text>
      </View>
    );
  }

  console.log(`🎬 ScreenComposition: Rendering screen "${screen.screenName}" with ${screen.page_blocks?.length ?? 0} page blocks`);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.screenHeader}>{screen.screenName}</Text>
      {screen.page_blocks && screen.page_blocks.length > 0 ? (
        screen.page_blocks.map((block, index) => (
          <View key={`block-container-${index}`} style={styles.blockWrapper}>
            <ScreenFactory block={block} />
          </View>
        ))
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.fallbackText}>{t('noPageBlocks')}</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  content: {
    paddingVertical: 50,
    paddingHorizontal: 20,
  },
  screenHeader: {
    color: '#ffffff',
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  blockWrapper: {
    marginBottom: 40,
    width: '100%',
  },
  fallbackContainer: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  fallbackText: {
    color: '#aaaaaa',
    fontSize: 18,
    textAlign: 'center',
  },
  emptyContainer: {
    paddingVertical: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
