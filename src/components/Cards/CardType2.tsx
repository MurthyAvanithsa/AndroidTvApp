import React, { useState, useRef, useEffect } from 'react';
import { 
  Text, 
  View, 
  Image, 
  StyleSheet, 
  Pressable, 
  findNodeHandle 
} from "react-native";
import { useStrapiContext } from "../../context/StrapiContext";
import { 
  calculateCardDimensions, 
  getImageFromMediaGroup, 
  getBorderRadius, 
  getAspectRatioValue, 
  scaleToLogical 
} from "../../utils/CardHelpers";
import { getStringByPath } from "../../utils/ObjectUtils";

interface CardType2Props {
  item: any;
  cardStyleId: string;
  width?: number;
  presetName?: string;
  isFirst?: boolean;
  isLast?: boolean;
  onFocus?: () => void;
}

export default function CardType2({ item, cardStyleId, width: overrideWidth, presetName, isFirst, isLast, onFocus }: CardType2Props) {
  const { cardStyles } = useStrapiContext();
  const [isFocused, setIsFocused] = useState(false);
  const cardRef = useRef(null);
  const [node, setNode] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (cardRef.current) {
      const handle = findNodeHandle(cardRef.current);
      if (handle) setNode(handle);
    }
  }, []);

  const rawStyle = cardStyles[cardStyleId];
  if (!rawStyle) return null;

  const cardStyle = (rawStyle.card_type_2 || rawStyle);

  // --- Data Mapping (Equivalent to Roku mapEntryData) ---
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

  // --- Layout Calculations ---
  const finalWidth = cardStyle.image_1_width ? scaleToLogical(cardStyle.image_1_width) : (overrideWidth || 300);
  const finalHeight = cardStyle.image_1_height ? scaleToLogical(cardStyle.image_1_height) : (finalWidth / cardStyle.aspect_ratio);
  const borderColor = cardStyle.background_rectangle_color || 'transparent';
  // console.log(`[${presetName || 'Unknown Preset'}] Card Width:`, finalWidth, "Height:", finalHeight);

  // // Apply 1x1 multiplier matching HorizontalList logic
  // if (ratio === 1) {
  //   finalHeight = finalHeight * 2.35;
  // }

  // Allow focus_height override if specified in the card style
  // if (cardStyle.focus_height && cardStyle.focus_height > finalHeight) {
  //   finalHeight = cardStyle.focus_height;
  // }

  // Handle Selection (Equivalent to onItemSelectedChanged)
  // const handlePress = () => {
  //   if (setActiveEntry && navigateToScreen) {
  //     setActiveEntry(item);
  //     navigateToScreen("Details"); 
  //   }
  // };
// console.log("border radius: ", getBorderRadius(cardStyle.image_1_enable_rounded_corners, cardStyle.image_1_rounded_corners_radius));
return (
    <Pressable
      ref={cardRef}
      onFocus={() => {
        setIsFocused(true);
        onFocus?.();
      }}
      onBlur={() => setIsFocused(false)}
      // onPress={handlePress}
      // Roku logic: Prevents focus from leaving row bounds incorrectly
      nextFocusLeft={isFirst ? node : undefined}
      nextFocusRight={isLast ? node : undefined}
      style={[
        styles.container,
        {
          width: finalWidth,
          height: finalHeight,
          borderRadius: getBorderRadius(cardStyle.image_1_enable_rounded_corners, cardStyle.image_1_rounded_corners_radius),
          borderWidth: isFocused ? 4 : 2,
          borderColor: isFocused ? 'white' : borderColor,
          // transform: [{ scale: isFocused ? 1.05 : 1 }],
          // zIndex: isFocused ? 10 : 1,
        }
      ]}
    >
      {/* Background Image (Image1) */}
      {cardStyle.show_image_1 && image1Uri && (
        <Image
          source={{ uri: image1Uri }}
          style={[
            styles.absolute,
            {
              width: cardStyle.image_1_width ? scaleToLogical(cardStyle.image_1_width) : '100%',
              height: cardStyle.image_1_height ? scaleToLogical(cardStyle.image_1_height) : (finalWidth / cardStyle.aspect_ratio),
              marginTop: scaleToLogical(cardStyle.image_1_translation_top ?? 0),
              marginLeft: scaleToLogical(cardStyle.image_1_translation_left ?? 0),
              // borderRadius: getBorderRadius(cardStyle.image_1_enable_rounded_corners, cardStyle.image_1_rounded_corners_radius),
            }
          ]}
          resizeMode={cardStyle.image_1_object_fit === 'ScaleToFit' ? 'contain' : 'cover'}
        />
      )}

      {/* Logo/Secondary Image (Image2) */}
      {cardStyle.show_image_2 && image2Uri && (
        <Image
          source={{ uri: image2Uri }}
          style={[
            styles.absolute,
            {
              width: cardStyle.image_2_width ? scaleToLogical(cardStyle.image_2_width) : '50%',
              height: cardStyle.image_2_height ? scaleToLogical(cardStyle.image_2_height) : (finalWidth / cardStyle.aspect_ratio),
              marginTop: scaleToLogical(cardStyle.image_2_translation_top ?? 0),
              marginLeft: scaleToLogical(cardStyle.image_2_translation_left ?? 0),
              borderRadius: getBorderRadius(cardStyle.image_2_enable_rounded_corners, cardStyle.image_2_rounded_corners_radius),
            }
          ]}
          resizeMode="contain"
        />
      )}

      {/* Labels (Equivalent to applyStyles/applyFocusedStyles logic) */}
      {cardStyle.show_label_1 && (
        <Text style={[
          styles.label,
          {
            color: isFocused ? (cardStyle.label_1_focused_color || '#fff') : (cardStyle.label_1_color || '#fff'),
            marginTop: scaleToLogical(cardStyle.label_1_translation_top || 0),
            marginLeft: scaleToLogical(cardStyle.label_1_translation_left || 0),
          }
        ]}>
          {label1Text}
        </Text>
      )}

      {/* Label 2 */}
      {cardStyle.show_label_2 && (
        <Text style={[
          styles.label,
          {
            color: isFocused ? (cardStyle.label_2_focused_color || '#ccc') : (cardStyle.label_2_color || '#ccc'),
            marginTop: scaleToLogical(cardStyle.label_2_translation_top || 30),
            marginLeft: scaleToLogical(cardStyle.label_2_translation_left || 0),
          }
        ]}>
          {label2Text}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    position: 'relative',
    marginRight: 10,
  },
  absolute: {
    position: 'absolute',
  },
  label: {
    position: 'absolute',
    fontSize: 18,
    fontWeight: '600',
  }
});