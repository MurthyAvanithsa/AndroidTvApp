// src/components/Cards/Card1.tsx

import React, { useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  type ImageStyle,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { useStrapiContext } from '../../context/StrapiContext';
import {
  getStringByPath,
  getImageFromMediaGroup,
} from '../../utils/ObjectUtils';
import { applyDataMap } from '../../utils/Cardcommon';
import { buildCardStyle, type CardStyleFields } from '../../utils/CardStyleUtils';

// ─── Types ────────────────────────────────────────────────────────────────────


export interface EntryData {
  title?: string;
  summary?: string;
  id?: string;
  media_group?: Array<{
    type: string;
    media_item: Array<{ key: string; src: string }>;
  }>;
  extensions?: Record<string, any>;
  [key: string]: any;
}

export interface ItemContent {
  documentId: string;
  entryData: EntryData;
  resolvedStyle?: CardStyleFields | null; // pre-resolved from AsyncStorage
  isSelected?: boolean;
}

interface Card1Props {
  itemContent: ItemContent;
  cardStyleId: string;
  rowHasFocus?: boolean;
  gridHasFocus?: boolean;
  itemHasFocus?: boolean;
  onSelected?: (entryData: EntryData) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

const Card1: React.FC<Card1Props> = ({
  itemContent,
  cardStyleId,
  rowHasFocus = false,
  gridHasFocus = false,
  itemHasFocus = false,
  onSelected,
}) => {
  const { cardStyles } = useStrapiContext();
  const hasFocusRef = useRef(false);
  const prevItemContentRef = useRef<ItemContent | null>(null);

  // ── Debug ──────────────────────────────────────────────────────────────────
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🃏 Card1 render | cardStyleId:', cardStyleId);
  console.log('🗂️  Available cardStyle keys:', Object.keys(cardStyles));

  // ── Resolve style ─────────────────────────────────────────────────────────
  // Priority:
  //   1. itemContent.resolvedStyle  — pre-resolved by TVAppScreen from AsyncStorage
  //   2. cardStyles[cardStyleId]    — from StrapiContext (set by BootstrapProcess)
  //   3. null

  // Option 1: pre-resolved from AsyncStorage via TVAppScreen
  let style: CardStyleFields | null = itemContent?.resolvedStyle ?? null;

  // Option 2: look up from StrapiContext and drill into active card_type
  if (!style) {
    const rawCardStyle = cardStyles[cardStyleId];
    const activeCardTypeKey = rawCardStyle?.card_type as string | undefined;
    const resolvedFromContext = activeCardTypeKey
      ? (rawCardStyle as any)?.[activeCardTypeKey]
      : null;
    style = resolvedFromContext ? buildCardStyle(resolvedFromContext) : null;
    console.log(
      '🔍 Style source: StrapiContext |',
      activeCardTypeKey,
      '|',
      style ? '✅' : '❌',
    );
  } else {
    console.log(
      '🔍 Style source: AsyncStorage (pre-resolved) |',
      style ? '✅' : '❌',
    );
  }

  console.log('📐 dataMap :', JSON.stringify(style?.dataMap, null, 2));
  console.log('🖼️  image1  :', JSON.stringify(style?.image1, null, 2));
  console.log('🔠 label1  :', JSON.stringify(style?.label1, null, 2));
  console.log('🔠 label2  :', JSON.stringify(style?.label2, null, 2));

  // ── applyStyles() / applyFocusedStyles() ─────────────────────────────────
  const getActiveStyles = useCallback(() => {
    const focused = itemHasFocus && (rowHasFocus || gridHasFocus);
    console.log('🎯 focused:', focused);
    return {
      image1Style: focused ? style?.focusedImage1 : style?.image1,
      label1Style: focused ? style?.focusedLabel1 : style?.label1,
      label2Style: focused ? style?.focusedLabel2 : style?.label2,
      backgroundStyle: focused
        ? style?.focusedBackgroundRectangle
        : style?.backgroundRectangle,
    };
  }, [style, itemHasFocus, rowHasFocus, gridHasFocus]);

  // ── mapEntryData() ────────────────────────────────────────────────────────
  const getMappedData = useCallback(() => {
    const entryData = itemContent?.entryData;
    if (!entryData) {
      console.warn('⚠️  no entryData');
      return { imageUri: '', label1Text: '', label2Text: '' };
    }

    // Use CMS dataMap if configured
    if (style?.dataMap && style.dataMap.length > 0) {
      const resolvedData = applyDataMap(style.dataMap, { entryData });
      
      const imageUri = resolvedData.image1Uri || '';
      const label1Text = resolvedData.label1Text || '';
      const label2Text = resolvedData.label2Text || '';

      console.log(
        '🗺️  dataMap resolved → imageUri:',
        imageUri || '(empty)',
        '| label1:',
        label1Text || '(empty)',
        '| label2:',
        label2Text || '(empty)',
      );
      return { imageUri, label1Text, label2Text };
    }

    // Fallback: use known DSP field names directly
    console.warn('⚠️  No dataMap in Strapi — using DSP field defaults');
    const imageUri =
      getImageFromMediaGroup(entryData.media_group, '720', '') ||
      getImageFromMediaGroup(entryData.media_group, '480', '');
    const label1Text = entryData.title ?? '';
    const label2Text =
      entryData.extensions?.TBN_Host ?? entryData.extensions?.programName ?? '';
    console.log(
      '🗺️  DSP defaults → imageUri:',
      imageUri || '(empty)',
      '| label1:',
      label1Text || '(empty)',
      '| label2:',
      label2Text || '(empty)',
    );
    return { imageUri, label1Text, label2Text };
  }, [style, itemContent]);

  // ── onItemContentChanged() ────────────────────────────────────────────────
  useEffect(() => {
    if (
      !itemContent ||
      prevItemContentRef.current?.documentId === itemContent.documentId
    )
      return;
    prevItemContentRef.current = itemContent;
    if (!style) console.error('Card1: No styles found for:', cardStyleId);
    if (!itemContent.entryData) console.error('Card1: No entryData');
  }, [itemContent, style]);

  // ── onFocusChanged() ─────────────────────────────────────────────────────
  useEffect(() => {
    hasFocusRef.current = itemHasFocus && (rowHasFocus || gridHasFocus);
  }, [itemHasFocus, rowHasFocus, gridHasFocus]);

  // ── onItemSelectedChanged() ───────────────────────────────────────────────
  const handlePress = useCallback(() => {
    if (!itemContent?.entryData) return;
    onSelected?.(itemContent.entryData);
  }, [itemContent, onSelected]);

  // ── Render ────────────────────────────────────────────────────────────────
  if (!itemContent?.entryData) {
    console.error('🚫 Card1 blocked — no entryData');
    return null;
  }

  const { image1Style, label1Style, label2Style, backgroundStyle } =
    getActiveStyles();
  const { imageUri, label1Text, label2Text } = getMappedData();

  console.log(
    '✅ Card1 rendering → imageUri:',
    imageUri || '(none)',
    '| label1:',
    label1Text || '(none)',
  );
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  return (
    <Pressable onPress={handlePress}>
      {(!style?.backgroundRectangle || style.backgroundRectangle.visible !== false) && (
        <View style={[styles.backgroundRectangle, backgroundStyle]}>
          {/* image1 */}
          {(!style?.image1 || style.image1.visible !== false) && (
            imageUri !== '' ? (
              <Image
                source={{ uri: imageUri }}
                style={[styles.image1, image1Style as ImageStyle]}
                resizeMode="cover"
                onLoad={() => console.log('🖼️  Image loaded:', imageUri)}
                onError={e =>
                  console.error(
                    '🖼️  Image error:',
                    e.nativeEvent.error,
                    '| uri:',
                    imageUri,
                  )
                }
              />
            ) : (
              // Placeholder so you can see the card bounds even without an image
              <View style={[styles.imagePlaceholder, image1Style as ViewStyle]} />
            )
          )}

          {/* label1 */}
          {label1Text !== '' && (!style?.label1 || style.label1.visible !== false) && (
            <Text
              style={[styles.label1, label1Style as TextStyle]}
              numberOfLines={style?.label1?.numberOfLines ?? 2}
            >
              {label1Text}
            </Text>
          )}

          {/* label2 */}
          {label2Text !== '' && (!style?.label2 || style.label2.visible !== false) && (
            <Text
              style={[styles.label2, label2Style as TextStyle]}
              numberOfLines={style?.label2?.numberOfLines ?? 1}
            >
              {label2Text}
            </Text>
          )}
        </View>
      )}
    </Pressable>
  );
};

// ─── Base styles ──────────────────────────────────────────────────────────────
// These are fallback dimensions. In production the CMS backgroundRectangle
// style fields will override width/height.

const styles = StyleSheet.create({
  backgroundRectangle: {
    width: 320,
    height: 180,
    overflow: 'hidden',
    backgroundColor: '#1a1a1a', // visible when image hasn't loaded
  },
  image1: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#333',
  },
  label1: {
    position: 'absolute',
    bottom: 24,
    left: 8,
    right: 8,
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  label2: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
    color: '#ccc',
    fontSize: 12,
  },
});

export default Card1;
