import { CardAspectRatio } from "../../types/commontypes";

export interface CardType1Config {
  id: number;
  aspect_ratio: CardAspectRatio;
  // Background
  show_background_rectangle: boolean;
  background_rectangle_color: string | null;
  background_rectangle_width: number | null;
  background_rectangle_height: number | null;
  background_rectangle_translation_top: number;
  background_rectangle_translation_left: number;
  background_rectangle_enable_rounded_corners: boolean | null;
  background_rectangle_rounded_corners_radius: string | number | null;

  show_background_rectangle_on_focus: boolean;
  background_rectangle_focused_color: string | null;
  background_rectangle_focused_width: number | null;
  background_rectangle_focused_height: number | null;
  background_rectangle_focused_translation_top: number;
  background_rectangle_focused_translation_left: number;

  // Image
  show_image_1: boolean;
  image_1_source_key: string;
  image_1_height: number;
  image_1_width: number;
  image_1_object_fit: string;
  image_1_translation_top: number;
  image_1_translation_left: number;
  image_1_enable_rounded_corners: boolean | null;
  image_1_rounded_corners_radius: string | number | null;
  show_image_1_on_focus: boolean;

  // Label 1
  show_label_1: boolean;
  label_1_source_key: string | null;
  label_1_use_custom_text: boolean;
  label_1_custom_text: string | null;
  label_1_lines: number;
  label_1_height: number | null;
  label_1_width: number | null;
  label_1_horizontal_align: string;
  label_1_vertical_align: string;
  label_1_line_spacing: number | null;
  label_1_font_family: string;
  label_1_color: string | null;
  label_1_translation_top: number;
  label_1_translation_left: number;

  show_label_1_on_focus: boolean;
  label__1_focused_height?: number | null;
  label_1_focused_width?: number | null;
  label_1_focused_font_family: string;
  label_1_focused_color: string | null;
  label_1_focused_translation_top: number;
  label_1_focused_translation_left: number;

  // Label 2
  show_label_2: boolean;
  label_2_source_key: string | null;
  label_2_use_custom_text: boolean;
  label_2_custom_text: string | null;
  label_2_lines: number;
  label_2_height: number | null;
  label_2_width: number | null;
  label_2_horizontal_align: string;
  label_2_vertical_align: string;
  label_2_line_spacing: number | null;
  label_2_font_family: string;
  label_2_color: string | null;
  label_2_translation_top: number;
  label_2_translation_left: number;

  show_label_2_on_focus: boolean;
  label_2_focused_height?: number | null;
  label_2_focused_width?: number | null;
  label_2_focused_font_family: string;
  label_2_focused_color: string | null;
  label_2_focused_translation_top: number;
  label_2_focused_translation_left: number;
}