// src/utils/CardStyleNode.ts
//
// Converted from CardStyleNode.brs
// Builds typed React Native style props from a flat Strapi card style object.
// Each function mirrors its BrightScript counterpart exactly.

import type { ImageStyle, TextStyle, ViewStyle } from 'react-native';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ImageProps {
  visible: boolean;
  uri?: string;
  width?: number;
  height?: number;
  loadWidth?: number;
  loadHeight?: number;
  loadDisplayMode?: string;
  margin?: [number, number];
}

export interface LabelProps {
  visible: boolean;
  text?: string;
  width?: number;
  height?: number;
  font?: string;
  color?: string;
  wrap?: boolean;
  maxLines?: number;
  lineSpacing?: number;
  vertAlign?: string;
  horizAlign?: string;
  margin?: [number, number];
}

export interface BackgroundRectProps {
  visible: boolean;
  color?: string;
  width?: number;
  height?: number;
  margin?: [number, number];
}

export interface BadgeProps {
  visible: boolean;
  uri?: string;
  width?: number;
  height?: number;
  loadWidth?: number;
  loadHeight?: number;
  margin?: [number, number];
}

export interface ProgressBarProps {
  visible: boolean;
  margin?: [number, number];
  config?: {
    barHeight?: number;
    barWidth?: number;
    progressBarColor?: string;
    backgroundBarColor?: string;
  };
}

export interface PreviewPlayerProps {
  visible: boolean;
  width?: number;
  height?: number;
  margin?: [number, number];
  config?: {
    previewDelay: number;
    repeatCount: number;
    enableVolume: boolean;
    videoStreamFormat: string;
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getMargin(
  style: any,
  topKey: string,
  leftKey: string,
): [number, number] {
  const posY = typeof style[topKey] === 'number' ? style[topKey] : 0;
  const posX = typeof style[leftKey] === 'number' ? style[leftKey] : 0;
  return [posX, posY];
}

// ─── getCardType ──────────────────────────────────────────────────────────────

export function getCardType(style: any): string {
  if (style && typeof style.card_type === 'string') return style.card_type;
  return 'Card1';
}

// ─── getCardAspectRatio ───────────────────────────────────────────────────────
// Converts "aspect_16:9" → [16, 9]

export function getCardAspectRatio(style: any): [number, number] {
  if (
    style &&
    typeof style.aspect_ratio === 'string' &&
    style.aspect_ratio !== ''
  ) {
    const raw = style.aspect_ratio.replace('aspect_', '');
    const parts = raw.split(':');
    if (parts.length === 2) {
      const w = parseFloat(parts[0]);
      const h = parseFloat(parts[1]);
      if (!isNaN(w) && !isNaN(h)) return [w, h];
    }
  }
  return [1, 1];
}

// ─── getImage1Props ───────────────────────────────────────────────────────────

export function getImage1Props(style: any): ImageProps {
  const props: ImageProps = { visible: false };
  if (!style) return props;

  props.visible = style.show_image_1 === true;
  if (!props.visible) return props;

  if (
    style.image_1_use_custom_url === true &&
    typeof style.image_1_custom_url === 'string'
  ) {
    props.uri = style.image_1_custom_url;
  }
  if (typeof style.image_1_height === 'number') {
    props.height = style.image_1_height;
    props.loadHeight = style.image_1_height;
  }
  if (typeof style.image_1_width === 'number') {
    props.width = style.image_1_width;
    props.loadWidth = style.image_1_width;
  }
  if (typeof style.image_1_object_fit === 'string') {
    props.loadDisplayMode = style.image_1_object_fit;
  }
  props.margin = getMargin(
    style,
    'image_1_translation_top',
    'image_1_translation_left',
  );
  return props;
}

// ─── getImage1OverlayProps ────────────────────────────────────────────────────

export function getImage1OverlayProps(style: any): ImageProps {
  const props: ImageProps = { visible: false };
  if (!style) return props;

  props.visible =
    typeof style.image_1_overlay_image === 'string' &&
    style.image_1_overlay_image !== '';

  if (!props.visible) return props;

  props.uri = style.image_1_overlay_image;
  if (typeof style.image_1_height === 'number') {
    props.height = style.image_1_height;
    props.loadHeight = style.image_1_height;
  }
  if (typeof style.image_1_width === 'number') {
    props.width = style.image_1_width;
    props.loadWidth = style.image_1_width;
  }
  if (typeof style.image_1_object_fit === 'string') {
    props.loadDisplayMode = style.image_1_object_fit;
  }
  props.margin = getMargin(
    style,
    'image_1_translation_top',
    'image_1_translation_left',
  );
  return props;
}

// ─── getImage2Props ───────────────────────────────────────────────────────────

export function getImage2Props(style: any): ImageProps {
  const props: ImageProps = { visible: false };
  if (!style) return props;

  props.visible = style.show_image_2 === true;
  if (!props.visible) return props;

  if (
    style.image_2_use_custom_url === true &&
    typeof style.image_2_custom_url === 'string'
  ) {
    props.uri = style.image_2_custom_url;
  }
  if (typeof style.image_2_height === 'number') {
    props.height = style.image_2_height;
    props.loadHeight = style.image_2_height;
  }
  if (typeof style.image_2_width === 'number') {
    props.width = style.image_2_width;
    props.loadWidth = style.image_2_width;
  }
  if (typeof style.image_2_object_fit === 'string') {
    props.loadDisplayMode = style.image_2_object_fit;
  }
  props.margin = getMargin(
    style,
    'image_2_translation_top',
    'image_2_translation_left',
  );
  return props;
}

// ─── getLabel1Props ───────────────────────────────────────────────────────────

export function getLabel1Props(style: any): LabelProps {
  const props: LabelProps = { visible: false };
  if (!style) return props;

  props.visible = style.show_label_1 === true;
  if (!props.visible) return props;

  if (style.label_1_use_custom_text === true)
    props.text = style.label_1_custom_text ?? '';
  if (typeof style.label_1_height === 'number')
    props.height = style.label_1_height;
  if (typeof style.label_1_width === 'number')
    props.width = style.label_1_width;
  if (typeof style.label_1_font_family === 'string')
    props.font = style.label_1_font_family;
  if (typeof style.label_1_color === 'string')
    props.color = style.label_1_color;
  if (typeof style.label_1_lines === 'number')
    props.maxLines = style.label_1_lines;
  if (typeof style.label_1_line_spacing === 'number')
    props.lineSpacing = style.label_1_line_spacing;
  if (typeof style.label_1_vertical_align === 'string')
    props.vertAlign = style.label_1_vertical_align;
  if (typeof style.label_1_horizontal_align === 'string')
    props.horizAlign = style.label_1_horizontal_align;
  props.wrap = true;
  props.margin = getMargin(
    style,
    'label_1_translation_top',
    'label_1_translation_left',
  );
  return props;
}

// ─── getLabel2Props ───────────────────────────────────────────────────────────

export function getLabel2Props(style: any): LabelProps {
  const props: LabelProps = { visible: false };
  if (!style) return props;

  props.visible = style.show_label_2 === true;
  if (!props.visible) return props;

  if (style.label_2_use_custom_text === true)
    props.text = style.label_2_custom_text ?? '';
  if (typeof style.label_2_height === 'number')
    props.height = style.label_2_height;
  if (typeof style.label_2_width === 'number')
    props.width = style.label_2_width;
  if (typeof style.label_2_font_family === 'string')
    props.font = style.label_2_font_family;
  if (typeof style.label_2_color === 'string')
    props.color = style.label_2_color;
  if (typeof style.label_2_lines === 'number')
    props.maxLines = style.label_2_lines;
  if (typeof style.label_2_line_spacing === 'number')
    props.lineSpacing = style.label_2_line_spacing;
  if (typeof style.label_2_vertical_align === 'string')
    props.vertAlign = style.label_2_vertical_align;
  if (typeof style.label_2_horizontal_align === 'string')
    props.horizAlign = style.label_2_horizontal_align;
  props.wrap = true;
  props.margin = getMargin(
    style,
    'label_2_translation_top',
    'label_2_translation_left',
  );
  return props;
}

// ─── getLabel3Props ───────────────────────────────────────────────────────────

export function getLabel3Props(style: any): LabelProps {
  const props: LabelProps = { visible: false };
  if (!style) return props;

  props.visible = style.show_label_3 === true;
  if (!props.visible) return props;

  if (style.label_3_use_custom_text === true)
    props.text = style.label_3_custom_text ?? '';
  if (typeof style.label_3_height === 'number')
    props.height = style.label_3_height;
  if (typeof style.label_3_width === 'number')
    props.width = style.label_3_width;
  if (typeof style.label_3_font_family === 'string')
    props.font = style.label_3_font_family;
  if (typeof style.label_3_color === 'string')
    props.color = style.label_3_color;
  if (typeof style.label_3_lines === 'number')
    props.maxLines = style.label_3_lines;
  if (typeof style.label_3_line_spacing === 'number')
    props.lineSpacing = style.label_3_line_spacing;
  if (typeof style.label_3_vertical_align === 'string')
    props.vertAlign = style.label_3_vertical_align;
  if (typeof style.label_3_horizontal_align === 'string')
    props.horizAlign = style.label_3_horizontal_align;
  props.wrap = true;
  props.margin = getMargin(
    style,
    'label_3_translation_top',
    'label_3_translation_left',
  );
  return props;
}

// ─── getBackgroundRectangleProps ──────────────────────────────────────────────

export function getBackgroundRectangleProps(style: any): BackgroundRectProps {
  const props: BackgroundRectProps = { visible: false };
  if (!style) return props;

  props.visible = style.show_background_rectangle === true;
  if (!props.visible) return props;

  if (typeof style.background_rectangle_color === 'string')
    props.color = style.background_rectangle_color;
  if (typeof style.background_rectangle_width === 'number')
    props.width = style.background_rectangle_width;
  if (typeof style.background_rectangle_height === 'number')
    props.height = style.background_rectangle_height;
  props.margin = getMargin(
    style,
    'background_rectangle_translation_top',
    'background_rectangle_translation_left',
  );
  return props;
}

// ─── getBadgeProps ────────────────────────────────────────────────────────────

export function getBadgeProps(style: any): BadgeProps {
  const props: BadgeProps = { visible: false };
  if (!style) return props;

  props.visible = style.show_badge === true;
  if (!props.visible) return props;

  if (typeof style.badge_url === 'string') props.uri = style.badge_url;
  if (typeof style.badge_height === 'number') {
    props.height = style.badge_height;
    props.loadHeight = style.badge_height;
  }
  if (typeof style.badge_width === 'number') {
    props.width = style.badge_width;
    props.loadWidth = style.badge_width;
  }
  props.margin = getMargin(
    style,
    'badge_translation_top',
    'badge_translation_left',
  );
  return props;
}

// ─── getProgressBarProps ──────────────────────────────────────────────────────

export function getProgressBarProps(style: any): ProgressBarProps {
  const props: ProgressBarProps = { visible: false };
  if (!style) return props;

  props.visible = style.show_progress_bar === true;
  if (!props.visible) return props;

  const config: ProgressBarProps['config'] = {};
  if (typeof style.progress_bar_height === 'number')
    config.barHeight = style.progress_bar_height;
  if (typeof style.progress_bar_width === 'number')
    config.barWidth = style.progress_bar_width;
  if (typeof style.progress_bar_color === 'string')
    config.progressBarColor = style.progress_bar_color;
  if (typeof style.progress_bar_background_color === 'string')
    config.backgroundBarColor = style.progress_bar_background_color;
  props.config = config;
  props.margin = getMargin(
    style,
    'progress_bar_translation_top',
    'progress_bar_translation_left',
  );
  return props;
}

// ─── getPreviewPlayerProps ────────────────────────────────────────────────────

export function getPreviewPlayerProps(style: any): PreviewPlayerProps {
  const props: PreviewPlayerProps = { visible: false };
  if (!style) return props;

  props.visible = style.show_preview_player === true;

  const config: PreviewPlayerProps['config'] = {
    previewDelay:
      typeof style.preview_player_delay === 'number'
        ? style.preview_player_delay
        : 5000,
    repeatCount:
      typeof style.preview_player_repeat_count === 'number'
        ? style.preview_player_repeat_count
        : 1,
    enableVolume:
      typeof style.preview_player_enable_volume === 'boolean'
        ? style.preview_player_enable_volume
        : false,
    videoStreamFormat: 'hls',
  };
  props.config = config;

  if (!props.visible) return props;

  if (typeof style.preview_player_height === 'number')
    props.height = style.preview_player_height;
  if (typeof style.preview_player_width === 'number')
    props.width = style.preview_player_width;
  props.margin = getMargin(
    style,
    'preview_player_translation_top',
    'preview_player_translation_left',
  );
  return props;
}

// ─── Focused state props ──────────────────────────────────────────────────────

export function getImage1FocusedProps(style: any): ImageProps {
  return { visible: style?.show_image_1_on_focus === true };
}

export function getImage1OverlayFocusedProps(style: any): ImageProps {
  return { visible: style?.show_image_1_on_focus === true };
}

export function getImage2FocusedProps(style: any): ImageProps {
  return { visible: style?.show_image_2_on_focus === true };
}

export function getLabel1FocusedProps(style: any): LabelProps {
  const props: LabelProps = { visible: false };
  if (!style) return props;

  props.visible = style.show_label_1_on_focus === true;
  if (!props.visible) return props;

  if (typeof style.label_1_focused_color === 'string')
    props.color = style.label_1_focused_color;
  if (typeof style.label_1_focused_font_family === 'string')
    props.font = style.label_1_focused_font_family;
  if (typeof style.label_1_focused_height === 'number')
    props.height = style.label_1_focused_height;
  if (typeof style.label_1_focused_width === 'number')
    props.width = style.label_1_focused_width;
  props.margin = getMargin(
    style,
    'label_1_focused_translation_top',
    'label_1_focused_translation_left',
  );
  return props;
}

export function getLabel2FocusedProps(style: any): LabelProps {
  const props: LabelProps = { visible: false };
  if (!style) return props;

  props.visible = style.show_label_2_on_focus === true;
  if (!props.visible) return props;

  if (typeof style.label_2_focused_color === 'string')
    props.color = style.label_2_focused_color;
  if (typeof style.label_2_focused_font_family === 'string')
    props.font = style.label_2_focused_font_family;
  if (typeof style.label_2_focused_height === 'number')
    props.height = style.label_2_focused_height;
  if (typeof style.label_2_focused_width === 'number')
    props.width = style.label_2_focused_width;
  props.margin = getMargin(
    style,
    'label_2_focused_translation_top',
    'label_2_focused_translation_left',
  );
  return props;
}

export function getLabel3FocusedProps(style: any): LabelProps {
  const props: LabelProps = { visible: false };
  if (!style) return props;

  props.visible = style.show_label_3_on_focus === true;
  if (!props.visible) return props;

  if (typeof style.label_3_focused_color === 'string')
    props.color = style.label_3_focused_color;
  if (typeof style.label_3_focused_font_family === 'string')
    props.font = style.label_3_focused_font_family;
  if (typeof style.label_3_focused_height === 'number')
    props.height = style.label_3_focused_height;
  if (typeof style.label_3_focused_width === 'number')
    props.width = style.label_3_focused_width;
  props.margin = getMargin(
    style,
    'label_3_focused_translation_top',
    'label_3_focused_translation_left',
  );
  return props;
}

export function getBackgroundRectangleFocusedProps(
  style: any,
): BackgroundRectProps {
  const props: BackgroundRectProps = { visible: false };
  if (!style) return props;

  props.visible = style.show_background_rectangle_on_focus === true;
  if (!props.visible) return props;

  if (typeof style.background_rectangle_focused_color === 'string')
    props.color = style.background_rectangle_focused_color;
  if (typeof style.background_rectangle_focused_width === 'number')
    props.width = style.background_rectangle_focused_width;
  if (typeof style.background_rectangle_focused_height === 'number')
    props.height = style.background_rectangle_focused_height;
  props.margin = getMargin(
    style,
    'background_rectangle_focused_translation_top',
    'background_rectangle_focused_translation_left',
  );
  return props;
}

export function getBadgeFocusedProps(style: any): BadgeProps {
  const props: BadgeProps = { visible: false };
  if (!style) return props;

  props.visible = style.show_badge_on_focus === true;
  if (!props.visible) return props;

  if (typeof style.badge_focused_url === 'string')
    props.uri = style.badge_focused_url;
  if (typeof style.badge_focused_height === 'number') {
    props.height = style.badge_focused_height;
    props.loadHeight = style.badge_focused_height;
  }
  if (typeof style.badge_focused_width === 'number') {
    props.width = style.badge_focused_width;
    props.loadWidth = style.badge_focused_width;
  }
  props.margin = getMargin(
    style,
    'badge_focused_translation_top',
    'badge_focused_translation_left',
  );
  return props;
}

// ─── Source key getters ───────────────────────────────────────────────────────
// Used by applyDataMap to know which entryData path to read for each control

export function getImage1SourceKey(style: any): string {
  if (
    style &&
    style.image_1_use_custom_url !== true &&
    typeof style.image_1_source_key === 'string'
  ) {
    return style.image_1_source_key;
  }
  return '';
}

export function getImage2SourceKey(style: any): string {
  if (
    style &&
    style.image_2_use_custom_url !== true &&
    typeof style.image_2_source_key === 'string'
  ) {
    return style.image_2_source_key;
  }
  return '';
}

export function getLabel1SourceKey(style: any): string {
  if (
    style &&
    style.label_1_use_custom_text !== true &&
    typeof style.label_1_source_key === 'string'
  ) {
    return style.label_1_source_key;
  }
  return '';
}

export function getLabel2SourceKey(style: any): string {
  if (
    style &&
    style.label_2_use_custom_text !== true &&
    typeof style.label_2_source_key === 'string'
  ) {
    return style.label_2_source_key;
  }
  return '';
}

export function getLabel3SourceKey(style: any): string {
  if (
    style &&
    style.label_3_use_custom_text !== true &&
    typeof style.label_3_source_key === 'string'
  ) {
    return style.label_3_source_key;
  }
  return '';
}

export function getProgressBarSourceKey(style: any): string {
  if (
    style &&
    style.show_progress_bar === true &&
    typeof style.progress_bar_source_key === 'string'
  ) {
    return style.progress_bar_source_key;
  }
  return '';
}

export function getPreviewPlayerVideoSourceKey(style: any): string {
  return style && typeof style.preview_player_video_source_key === 'string'
    ? style.preview_player_video_source_key
    : '';
}

export function getPreviewPlayerStartTimeSourceKey(style: any): string {
  return style && typeof style.preview_player_video_start_time_key === 'string'
    ? style.preview_player_video_start_time_key
    : '';
}

export function getPreviewPlayerEndTimeSourceKey(style: any): string {
  return style && typeof style.preview_player_video_end_time_key === 'string'
    ? style.preview_player_video_end_time_key
    : '';
}

// ─── buildCardStyle ───────────────────────────────────────────────────────────
// Converts the flat Strapi style object into structured styles for React Native
// using margins instead of transforms.

import { type DataMapEntry } from './Cardcommon';

export interface CardStyleFields {
  image1: ImageStyle & { visible: boolean; uri?: string };
  image2: ImageStyle & { visible: boolean; uri?: string };
  label1: TextStyle & { visible: boolean; numberOfLines?: number };
  label2: TextStyle & { visible: boolean; numberOfLines?: number };
  label3: TextStyle & { visible: boolean; numberOfLines?: number };
  backgroundRectangle: ViewStyle & { visible: boolean };
  focusedImage1: ImageStyle & { visible: boolean };
  focusedImage2: ImageStyle & { visible: boolean };
  focusedLabel1: TextStyle & { visible: boolean };
  focusedLabel2: TextStyle & { visible: boolean };
  focusedLabel3: TextStyle & { visible: boolean };
  focusedBackgroundRectangle: ViewStyle & { visible: boolean };
  dataMap: DataMapEntry[];
}

function toImageStyle(props: ImageProps): ImageStyle & { visible: boolean; uri?: string } {
  return {
    visible: props.visible,
    uri: props.uri,
    width: props.width,
    height: props.height,
    position: 'absolute',
    marginLeft: props.margin?.[0] || 0,
    marginTop: props.margin?.[1] || 0,
  };
}

function toTextStyle(props: LabelProps): TextStyle & { visible: boolean; numberOfLines?: number } {
  return {
    visible: props.visible,
    width: props.width,
    height: props.height,
    color: props.color,
    fontFamily: props.font,
    numberOfLines: props.maxLines,
    lineHeight: props.lineSpacing,
    textAlignVertical: props.vertAlign === 'center' ? 'center' : (props.vertAlign === 'bottom' ? 'bottom' : 'top'),
    textAlign: props.horizAlign === 'center' ? 'center' : (props.horizAlign === 'right' ? 'right' : 'left'),
    position: 'absolute',
    marginLeft: props.margin?.[0] || 0,
    marginTop: props.margin?.[1] || 0,
  };
}

function toViewStyle(props: BackgroundRectProps): ViewStyle & { visible: boolean } {
  return {
    visible: props.visible,
    width: props.width,
    height: props.height,
    backgroundColor: props.color,
    position: 'absolute',
    marginLeft: props.margin?.[0] || 0,
    marginTop: props.margin?.[1] || 0,
  };
}

export function buildCardStyle(style: any): CardStyleFields {
  const dataMap: DataMapEntry[] = [];

  const i1Key = getImage1SourceKey(style);
  if (i1Key) dataMap.push({ control: 'image1', field: 'uri', path: i1Key });
  
  const i2Key = getImage2SourceKey(style);
  if (i2Key) dataMap.push({ control: 'image2', field: 'uri', path: i2Key });
  
  const l1Key = getLabel1SourceKey(style);
  if (l1Key) dataMap.push({ control: 'label1', field: 'text', path: l1Key });
  
  const l2Key = getLabel2SourceKey(style);
  if (l2Key) dataMap.push({ control: 'label2', field: 'text', path: l2Key });
  
  const l3Key = getLabel3SourceKey(style);
  if (l3Key) dataMap.push({ control: 'label3', field: 'text', path: l3Key });

  return {
    image1: toImageStyle(getImage1Props(style)),
    image2: toImageStyle(getImage2Props(style)),
    label1: toTextStyle(getLabel1Props(style)),
    label2: toTextStyle(getLabel2Props(style)),
    label3: toTextStyle(getLabel3Props(style)),
    backgroundRectangle: toViewStyle(getBackgroundRectangleProps(style)),
    
    focusedImage1: toImageStyle(getImage1FocusedProps(style)),
    focusedImage2: toImageStyle(getImage2FocusedProps(style)),
    focusedLabel1: toTextStyle(getLabel1FocusedProps(style)),
    focusedLabel2: toTextStyle(getLabel2FocusedProps(style)),
    focusedLabel3: toTextStyle(getLabel3FocusedProps(style)),
    focusedBackgroundRectangle: toViewStyle(getBackgroundRectangleFocusedProps(style)),
    
    dataMap,
  };
}
