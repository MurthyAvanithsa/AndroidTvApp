
export type TextDecoration = 'none' | 'underline' | 'strikethrough';

export type TextTransform = 'none' | 'uppercase' | 'lowercase' | 'capitalize';

export type Action = 'play' | 'share';


export type FontWeight =
  | 'thin'
  | 'extra-thin'
  | 'light'
  | 'normal'
  | 'medium'
  | 'semi-bold'
  | 'bold'
  | 'extra-bold'
  | 'black';

export interface TitleConfig {
  sourceKey?: string;
  color?: Color;
  hoverColor?: Color;
  height?: number;
  lines?: number;
  align: ContentAlignment;
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: FontWeight;
  fontSpacing?: number;
  textTransform?: TextTransform;
  textDecoration?: TextDecoration;
  hoverTextDecoration?: TextDecoration;
  margin?: Spacing;
  padding?: Spacing;
  useCustomText: boolean;
  customText?: string;
  backgroundColor?: Color;
  hoverBackgroundColor?: Color;
  border?: Border;
  hoverBorder?: Border;
}

export interface TextConfig {
  source_key?: string;
  color?: Color;
  hover_color?: Color;
  height?: number;
  lines?: number;
  align: ContentAlignment;
  font_family?: string;
  font_size?: number;
  font_weight?: FontWeight;
  font_spacing?: number;
  text_transform?: TextTransform;
  text_decoration?: TextDecoration;
  hover_text_decoration?: TextDecoration;
  margin?: Spacing;
  padding?: Spacing;
  use_custom_text: boolean;
  custom_text?: string;
}

export interface MediaItem {
  key: string;
  src: string | null;
}

export type Position =
  | 'topLeft'
  | 'topCenter'
  | 'topRight'
  | 'bottomLeft'
  | 'bottomCenter'
  | 'bottomRight';

export type CardAspectRatio =
  | 'aspectRatio_16:9'
  | 'aspectRatio_16:4'
  | 'aspectRatio_16:6'
  | 'aspectRatio_16:2'
  | 'aspectRatio_2:3'
  | 'aspectRatio_1:1'
  | 'aspectRatio_4:3';

export type ObjectFit = 'contain' | 'cover' | 'fill' | 'none' | 'scaleDown';

export interface MediaGroup {
  type: string;
  media_item: MediaItem[];
}

export interface Feed {
  id: string;
  title: string;
  description?: string;
  type: {
    value: string;
  };
  entry: Entry[];
  extensions?: {
    [key: string]: unknown;
  };
}

export interface Entry {
  title: string;
  summary?: string;
  media_group?: MediaGroup[];
  type?: { value: string };
  content?: { type: string };
  id?: string;
  extensions?: {
    [key: string]: unknown;
  };
  tags?: string[];
  link?: { rel: string; href: string };
}

export type Spacing = string; // "top, right, bottom, left"

export type BorderRadius = string; // "topLeft, topRight, bottomLeft, bottomRight"

export type Color = string; // "hex, opacity"

export type BorderStyles =
  | 'none'
  | 'solid'
  | 'dashed'
  | 'dotted'
  | 'double'
  | 'groove'
  | 'ridge'
  | 'inset'
  | 'outset';

export type Border = {
  style: BorderStyles;
  cornerRadius: BorderRadius;
  width: number;
  color: Color;
};

export interface ButtonLabel {
  sourceKey: string;
  enableCustomLabel: boolean;
  customLabel?: string;
  color?: Color;
  selectedColor?: Color;
  hoverColor?: Color;
  fontFamily?: string;
  fontSize: number;
  fontWeight: FontWeight;
  fontHeight: number;
  fontSpacing: number;
  textTransform: TextTransform;
  textDecoration?: TextDecoration;
  hoverTextDecoration?: TextDecoration;
  margin?: Spacing;
  padding?: Spacing;
}

export type DisplayMode = 'Dynamic' | 'fixed';
export type ContentAlignment = 'left' | 'center' | 'right';
export type IconPosition = 'left' | 'right';

export interface BadgeConfig {
  entityType: string;
  badgeIcon: string;
  width?: number;
  height?: number;
  hoverBadgeIcon?: string;
  position?: Position;
  margin?: Spacing;
}

export interface LockBadgeConfig {
  lockIconUrl: string;
  unlockIconUrl?: string;
  position?: Position;
  sourceKey: string;
  height: number;
  width: number;
  margin?: Spacing;
}

export type ProgressBarAlignment = 'top' | 'bottom';

export interface ProgressBarConfig {
  hideUnwatched: boolean;
  totalBarColor?: Color;
  totalBarCornerRadius: number;
  progressBarColor?: Color;
  cornerRadius: number;
  position?: ProgressBarAlignment;
  margin?: Spacing;
  height: number;
}

export interface TagConfig {
  sourceKey?: string;
  useCustomText?: boolean;
  customText?: string;
  height?: number;
  align?: ContentAlignment;
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: FontWeight;
  fontSpacing?: number;
  textTransform?: TextTransform;
  textDecoration?: TextDecoration;
  hoverTextDecoration?: TextDecoration;
  margin?: Spacing;
  padding?: Spacing;
  backgroundColor?: Color;
  border?: Border;
  hoverBorder?: Border;
  textColor?: Color;
  hoverTextColor?: Color;
  hoverBackgroundColor?: Color;
  position?: Position;
}

export interface CardType2Type {
  maxWidth?: number;
  hoverScaling?: number;
  enableTitle1?: boolean;
  enableTitle2?: boolean;
  enableTitle3?: boolean;
  title1?: TitleConfig;
  title2?: TitleConfig;
  title3?: TitleConfig;
  enableBadge1?: boolean;
  enableBadge2?: boolean;
  enableTag?: boolean;
  badge1?: BadgeConfig;
  badge2?: BadgeConfig;
  tag?: TagConfig;
  enableActionIcon1?: boolean;
  enableActionIcon2?: boolean;
  image?: any;
  border?: Border;
  hoverBorder?: Border;
  enableLockBadge?: boolean;
  lockBadge?: LockBadgeConfig;
  enableProgressBar?: boolean;
  progressBar?: ProgressBarConfig;
  progressPercentage?: number;
  backgroundColor?: Color;
  padding?: Spacing;
  margin?: Spacing;
  enableActionIcons?: boolean;
  enablePreviewPlayback?: boolean;
}

export interface CardType1Type {
  enableTitle1: boolean;
  enableTitle2: boolean;
  enableTitle3: boolean;
  enableBadge1: boolean;
  enableBadge2: boolean;
  enableTag?: boolean;
  enableLockBadge: boolean;
  enableProgressBar: boolean;
  enableSecondaryImage: boolean;
  image: any;
  secondaryImage?: any;
  title1?: TitleConfig;
  title2?: TitleConfig;
  title3?: TitleConfig;
  badge1?: BadgeConfig;
  badge2?: BadgeConfig;
  tag?: TagConfig;
  lockBadge?: LockBadgeConfig;
  progressBar?: ProgressBarConfig;
  progressPercentage?: number;
  maxWidth?: number;
  padding?: string;
  margin?: string;
  border?: Border;
  hoverBorder?: Border;
  backgroundColor?: Color;
  enablePreviewPlayback?: boolean;
}