import React, { useRef } from 'react';
import { Text, View, Image, StyleSheet, Pressable, findNodeHandle } from "react-native";
import { useStrapiContext } from "../../context/StrapiContext";
import { calculateCardDimensions, getImageFromMediaGroup, getBorderRadius, getAspectRatioValue } from "../../utils/CardHelpers";
import { getStringByPath } from "../../utils/ObjectUtils";
import { CardType2Config } from "./CardType2Config";

interface CardType2Props {
  item: any;
  cardStyleId: string;
  width?: number;
  isFirst?: boolean;
  isLast?: boolean;
}

export default function CardType2({ item, cardStyleId, width: overrideWidth, isFirst, isLast }: CardType2Props) {
  const { cardStyles } = useStrapiContext();
  const rawStyle = cardStyles[cardStyleId];
  const cardRef = useRef(null);

  if (!rawStyle) {
    console.warn(`⚠️ CardStyle not found for ID: ${cardStyleId}`);
    return (
      <View style={styles.fallback}>
        <Text style={{ color: '#fff' }}>Style {cardStyleId} missing</Text>
      </View>
    );
  }

  // Depending on Strapi structure, the fields might be flat or under 'card_type_2'
  const cardStyle = (rawStyle.card_type_2 || rawStyle) as CardType2Config;
const aspectRatio = getAspectRatioValue(cardStyle.aspect_ratio);
console.log("Aspect Ratio: ", aspectRatio);
  const image1Uri = getImageFromMediaGroup(item?.media_group, cardStyle.image_1_source_key);
  const image2Uri = getImageFromMediaGroup(item?.media_group, cardStyle.image_2_source_key || '');

  const label1Text = cardStyle.label_1_use_custom_text 
    ? cardStyle.label_1_custom_text 
    : getStringByPath(item, cardStyle.label_1_source_key || '');

  const label2Text = cardStyle.label_2_use_custom_text 
    ? cardStyle.label_2_custom_text 
    : getStringByPath(item, cardStyle.label_2_source_key || '');

  const label3Text = cardStyle.label_3_use_custom_text 
    ? cardStyle.label_3_custom_text 
    : getStringByPath(item, cardStyle.label_3_source_key || '');

  const { width: styleWidth, height: styleHeight, ratio } = calculateCardDimensions(cardStyle, overrideWidth);
  const finalWidth = overrideWidth || styleWidth || 200;
  const finalHeight = overrideWidth ? (overrideWidth / ratio) : (styleHeight || 100);
  
  const backgroundBorderRadius = getBorderRadius(
    cardStyle.background_rectangle_enable_rounded_corners, 
    cardStyle.background_rectangle_rounded_corners_radius
  );

  const image1BorderRadius = getBorderRadius(
    cardStyle.image_1_enable_rounded_corners, 
    cardStyle.image_1_rounded_corners_radius
  );
  // console.log("Image1BorderRadius: ", image1BorderRadius);
  const image2BorderRadius = getBorderRadius(
    cardStyle.image_2_enable_rounded_corners, 
    cardStyle.image_2_rounded_corners_radius
  );
  // console.log("Image2BorderRadius: ", image2BorderRadius);

  // console.log("margin left: ", cardStyle.image_2_translation_left);
  // console.log("Image2uri, sourcekey: ", image2Uri, cardStyle.image_2_source_key);
  // console.log("Calculated dimensions in card type2:", width, "x", height, "Ratio:", cardStyle.aspect_ratio);

  return (
    <Pressable
      ref={cardRef}
      nextFocusLeft={isFirst ? findNodeHandle(cardRef.current) : undefined}
      nextFocusRight={isLast ? findNodeHandle(cardRef.current) : undefined}
      style={({ focused }) => [
        styles.container,
        {
          width: finalWidth,
          height: finalHeight,
          backgroundColor: cardStyle.background_rectangle_color ?? 'transparent',
          borderRadius: backgroundBorderRadius,
          borderWidth: focused ? 4 : 0,
          borderColor: '#ffffff',
          transform: [{ scale: focused ? 1.05 : 1 }],
          zIndex: focused ? 10 : 1,
        }
      ]}
    >
      {/* Image 1 (Background) */}
      {cardStyle.show_image_1 && image1Uri ? (
        <Image
          source={{ uri: image1Uri }}
          style={[
            styles.absolute,
            {
              width: '100%',
              aspectRatio: ratio,
              top: cardStyle.image_1_translation_top ?? 0,
              left: cardStyle.image_1_translation_left ?? 0,
              borderRadius: image1BorderRadius,
            }
          ]}
          resizeMode={cardStyle.image_1_object_fit === 'ScaleToFit' ? 'contain' : 'cover'}
        />
      ) : null}

      {/* Overlay Image (e.g. Gradient) */}
      {/* {cardStyle.image_1_overlay_image ? (
        <Image
           // Note: In a real app, this might be a local path or URL. 
           // If it's pkg:/, it's a Roku convention. For RN, we'd need a mapping.
          source={{ uri: cardStyle.image_1_overlay_image.replace('pkg:/', '') }} 
          style={styles.overlay}
        />
      ) : null} */}

      {/* Image 2 (Logo) */}
      {cardStyle.show_image_2 && image2Uri ? (
        <Image
          source={{ uri: image2Uri }}
          style={[
            styles.absolute,
            {
              width: cardStyle.image_2_width ?? 290,
              aspectRatio: ratio,
              marginTop: cardStyle.image_2_translation_top ?? 40,
              marginLeft:  90,
              borderRadius: image2BorderRadius,
            }
          ]}
          resizeMode={cardStyle.image_2_object_fit === 'ScaleToFit' ? 'contain' : 'cover'}
        />
      ) : null}

      {/* Label 1 */}
      {cardStyle.show_label_1 && label1Text ? (
        <Text style={[
          styles.label,
          {
            color: cardStyle.label_1_color ?? '#fff',
            top: cardStyle.label_1_translation_top ?? 0,
            left: cardStyle.label_1_translation_left ?? 0,
            width: cardStyle.label_1_width ?? '100%',
            fontFamily: cardStyle.label_1_font_family,
          }
        ]} numberOfLines={cardStyle.label_1_lines ?? 1}>
          {label1Text}
        </Text>
      ) : null}

      {/* Label 2 */}
      {cardStyle.show_label_2 && label2Text ? (
        <Text style={[
          styles.label,
          {
            color: cardStyle.label_2_color ?? '#fff',
            top: cardStyle.label_2_translation_top ?? 0,
            left: cardStyle.label_2_translation_left ?? 0,
            width: cardStyle.label_2_width ?? '100%',
            fontFamily: cardStyle.label_2_font_family,
          }
        ]} numberOfLines={cardStyle.label_2_lines ?? 2}>
          {label2Text}
        </Text>
      ) : null}

      {/* Label 3 */}
      {cardStyle.show_label_3 && label3Text ? (
        <Text style={[
          styles.label,
          {
            color: cardStyle.label_3_color ?? '#fff',
            top: cardStyle.label_3_translation_top ?? 0,
            left: cardStyle.label_3_translation_left ?? 0,
            width: cardStyle.label_3_width ?? '100%',
            fontFamily: cardStyle.label_3_font_family,
          }
        ]} numberOfLines={cardStyle.label_3_lines ?? 1}>
          {label3Text}
        </Text>
      ) : null}

      {/* Badge */}
      {cardStyle.show_badge && cardStyle.badge_url ? (
        <Image
          source={{ uri: cardStyle.badge_url }}
          style={[
            styles.absolute,
            {
              width: cardStyle.badge_width ?? 200,
              height: cardStyle.badge_height ?? 70,
              top: cardStyle.badge_translation_top ?? 0,
              left: cardStyle.badge_translation_left ?? 0,
            }
          ]}
          resizeMode="contain"
        />
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    position: 'relative',
  },
  absolute: {
    position: 'absolute',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  label: {
    position: 'absolute',
    fontSize: 24, // Default base size, should ideally come from font_family mapping
  },
  fallback: {
    width: 400,
    height: 225,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  }
});
