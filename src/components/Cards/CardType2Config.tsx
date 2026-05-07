import { CardAspectRatio } from "../../types/commontypes";

export interface CardType2Config {
  id: number;
  aspect_ratio: CardAspectRatio;

  // Background
  show_background_rectangle: boolean;
  background_rectangle_color: string | null;
  background_rectangle_width: number | null;
  background_rectangle_height: number | null;
  background_rectangle_translation_top: number | null;
  background_rectangle_translation_left: number | null;
  background_rectangle_enable_rounded_corners: boolean | null;
  background_rectangle_rounded_corners_radius: string | null;

  // Image 1
  show_image_1: boolean;
  image_1_source_key: string;
  image_1_height: number;
  image_1_width: number;
  image_1_object_fit: string;
  image_1_translation_top: number | null;
  image_1_translation_left: number | null;
  image_1_overlay_image: string | null;
  image_1_enable_rounded_corners: boolean | null;
  image_1_rounded_corners_radius: string | null;

  // Image 2
  show_image_2: boolean;
  image_2_source_key: string | null;
  image_2_height: number | null;
  image_2_width: number | null;
  image_2_object_fit: string | null;
  image_2_translation_top: number | null;
  image_2_translation_left: number | null;
  image_2_enable_rounded_corners: boolean | null;
  image_2_rounded_corners_radius: string | null;

  // Label 1
  show_label_1: boolean;
  label_1_source_key: string | null;
  label_1_use_custom_text: boolean;
  label_1_custom_text: string | null;
  label_1_lines: number | null;
  label_1_height: number | null;
  label_1_width: number | null;
  label_1_font_family: string;
  label_1_color: string | null;
  label_1_translation_top: number | null;
  label_1_translation_left: number | null;

  // Label 2
  show_label_2: boolean;
  label_2_source_key: string | null;
  label_2_use_custom_text: boolean;
  label_2_custom_text: string | null;
  label_2_lines: number | null;
  label_2_height: number | null;
  label_2_width: number | null;
  label_2_font_family: string;
  label_2_color: string | null;
  label_2_translation_top: number | null;
  label_2_translation_left: number | null;

  // Label 3
  show_label_3: boolean;
  label_3_source_key: string | null;
  label_3_use_custom_text: boolean;
  label_3_custom_text: string | null;
  label_3_lines: number | null;
  label_3_height: number | null;
  label_3_width: number | null;
  label_3_font_family: string;
  label_3_color: string | null;
  label_3_translation_top: number | null;
  label_3_translation_left: number | null;

  // Badge
  show_badge: boolean;
  badge_url: string | null;
  badge_height: number | null;
  badge_width: number | null;
  badge_translation_top: number | null;
  badge_translation_left: number | null;
}
