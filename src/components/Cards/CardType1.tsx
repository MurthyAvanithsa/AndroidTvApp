import React, { useRef } from 'react';
import { Text, View, Image, StyleSheet, Pressable, findNodeHandle } from "react-native";
import { useStrapiContext } from "../../context/StrapiContext";
import { calculateCardDimensions, getImageFromMediaGroup, parseAspectRatio, parseBorderRadius } from "../../utils/CardHelpers";
import { CardType1Config } from "./CardType1Config";

interface CardType1Props {
  item: any;
  cardStyleId: string;
  width?: number;
  height?: number; // Computed from getCardSize() in HorizontalList
  isFirst?: boolean;
  isLast?: boolean;
}

export default function CardType1({ item, cardStyleId, width: overrideWidth, height: overrideHeight, isFirst, isLast }: CardType1Props) {
  const { cardStyles } = useStrapiContext();
  const cardRef = useRef(null);
  const rawStyle = cardStyles[cardStyleId];

  if (!rawStyle) {
    console.warn(`⚠️ CardStyle not found for ID: ${cardStyleId}`);
    return (
      <View style={styles.fallback}>
        <Text style={{ color: '#fff' }}>Style {cardStyleId} missing</Text>
      </View>
    );
  }

  const cardStyle = (rawStyle.card_type_1 || rawStyle) as CardType1Config;

  const { width: styleWidth, height: styleHeight, ratio } = calculateCardDimensions(cardStyle, overrideWidth);
  const finalWidth = overrideWidth || styleWidth || 200;
  // Use explicitly passed height, then aspect-ratio computed, then style height, then fallback
  const finalHeight = overrideHeight || (overrideWidth ? Math.floor(overrideWidth / ratio) : (styleHeight || 100));

  const aspectRatio = parseAspectRatio(cardStyle.aspect_ratio);
  const imageUri = getImageFromMediaGroup(
    item?.media_group,
    cardStyle.image_1_source_key
  );
  const borderRadius = parseBorderRadius(cardStyle.image_1_rounded_corners_radius);
  return (
    <Pressable
      ref={cardRef}
      nextFocusLeft={isFirst ? findNodeHandle(cardRef.current) : undefined}
      nextFocusRight={isLast ? findNodeHandle(cardRef.current) : undefined}
      style={({ focused }) => [
        styles.container,
        {
          marginTop:40,
          marginLeft:40,
          backgroundColor: cardStyle.background_rectangle_color ?? '#1a1a1a',
          borderWidth: focused ? 4 : 0,
          borderColor: '#ffffff',
          transform: [{ scale: focused ? 1.05 : 1 }],
          zIndex: focused ? 10 : 1,
          borderRadius: cardStyle.image_1_enable_rounded_corners
            ? borderRadius
            : undefined,
        }
      ]}
    >
      {cardStyle.show_image_1 && imageUri ? (
        <Image
          source={{ uri: imageUri }}
          style={[
            styles.image,
            {
              width: '100%',
              aspectRatio: aspectRatio,
              top: cardStyle.image_1_translation_top ?? 0,
              left: cardStyle.image_1_translation_left ?? 0,
            }
          ]}
          resizeMode={cardStyle.image_1_object_fit === 'ScaleToFit' ? 'contain' : 'cover'}
        />
      ) : null}

      {cardStyle.show_label_1 && (
        <Text style={[
          styles.label,
          {
            color: cardStyle.label_1_color ?? '#fff',
            top: cardStyle.label_1_translation_top,
            left: cardStyle.label_1_translation_left,
            width: cardStyle.label_1_width ?? '100%',
          }
        ]} numberOfLines={cardStyle.label_1_lines}>
          {cardStyle.label_1_use_custom_text ? cardStyle.label_1_custom_text : item?.title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    // overflow: 'hidden',
    // position: 'relative',
    width: 200,
    height: 115,
  },
  image: {
    position: 'absolute',
  },
  label: {
    position: 'absolute',
    fontSize: 16,
  },
  fallback: {
    width: 200,
    height: 100,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  }
});