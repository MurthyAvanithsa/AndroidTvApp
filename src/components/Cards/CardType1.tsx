import React, { useRef, useState, useEffect } from 'react';
import { Text, View, Image, StyleSheet, Pressable, findNodeHandle } from "react-native";
import { useStrapiContext } from "../../context/StrapiContext";
import { calculateCardDimensions, getImageFromMediaGroup, parseAspectRatio, parseBorderRadius, scaleToLogical } from "../../utils/CardHelpers";
import { CardType1Config } from "./CardType1Config";
import { useNavigation } from '@react-navigation/native';

interface CardType1Props {
  item: any;
  cardStyleId: string;
  width?: number;
  presetName?: string;
  isFirst?: boolean;
  isLast?: boolean;
  onFocus?: () => void;
  hasTVPreferredFocus?: boolean;
}

export default function CardType1({ item, cardStyleId, width: overrideWidth, presetName, isFirst, isLast, onFocus, hasTVPreferredFocus }: CardType1Props) {
  const { cardStyles, setCurrentActiveItem } = useStrapiContext();
  const navigation = useNavigation<any>();
  const cardRef = useRef(null);
  const rawStyle = cardStyles[cardStyleId];
  const [isFocused, setIsFocused] = useState(false);
  const [node, setNode] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (cardRef.current) {
      const handle = findNodeHandle(cardRef.current);
      if (handle) setNode(handle);
    }
  }, []);

  if (!rawStyle) {
    console.log("CardType1 style not found: ", cardStyleId);
    return null;
  }

  const cardStyle = (rawStyle.card_type_1 || rawStyle) as CardType1Config;

  const aspectRatio = parseAspectRatio(cardStyle.aspect_ratio);
  const finalWidth = cardStyle.image_1_width ? scaleToLogical(cardStyle.image_1_width) : (overrideWidth || 300);
  const finalHeight = cardStyle.image_1_height ? scaleToLogical(cardStyle.image_1_height) : (finalWidth / aspectRatio);
    
  const imageUri = getImageFromMediaGroup(
    item?.media_group,
    cardStyle.image_1_source_key
  );
  const borderRadius = parseBorderRadius(cardStyle.image_1_rounded_corners_radius);
  const borderColor = cardStyle.background_rectangle_color || 'transparent';
  // console.log("CardType1: ", cardStyle);
  console.log(`[${presetName || 'Unknown Preset'}] Card Width:`, finalWidth, "Height:", finalHeight);
  return (
    <Pressable
      ref={cardRef}
            onFocus={() => {
              setIsFocused(true);
              onFocus?.();
            }}
            onBlur={() => setIsFocused(false)}
            onPress={() => {
              setCurrentActiveItem(item);
              navigation.navigate('ScreenComposition');
            }}
            // Roku logic: Prevents focus from leaving row bounds incorrectly
            nextFocusLeft={isFirst ? node : undefined}
            nextFocusRight={isLast ? node : undefined}
      style={({ focused }) => [
        styles.container,
        {
          width: finalWidth,
          height: finalHeight,
          // marginTop:10,
          // marginLeft:20,
          // backgroundColor: cardStyle.background_rectangle_color ?? '#1a1a1a',
          borderWidth: focused ? 4 : 2,
          borderColor:  focused ? 'white' : borderColor,
          // transform: [{ scale: focused ? 1.05 : 1 }],
          // zIndex: focused ? 10 : 1,
          borderRadius: borderRadius,
        }
      ]}
    >
      {cardStyle.show_image_1 && imageUri ? (
        <Image
          source={{ uri: imageUri }}
          style={[
            styles.image,
            {
              width: cardStyle.image_1_width?scaleToLogical(cardStyle.image_1_width):'100%',
              aspectRatio:aspectRatio,
              borderRadius:borderRadius,
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
            top: scaleToLogical(cardStyle.label_1_translation_top ?? 0),
            left: scaleToLogical(cardStyle.label_1_translation_left ?? 0),
            width: cardStyle.label_1_width ? scaleToLogical(cardStyle.label_1_width) : '100%',
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
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
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