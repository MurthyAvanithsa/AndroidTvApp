export interface HorizontalListConfig {
  
  item_limit: null;
  identifier: string;
  enable_feed_refreshing: boolean;
  feed_refresh_interval: number;
  cells_focusable: boolean;
  enable_title: true,
  title_source_key: "title",
  title_use_custom_text: false,
  title_custom_text: null,
  title_color: "#ffffff",
  title_focused_color: "#ffffff",
  title_font_family: "MediumBoldSystemFont",
  title_translation_bottom: 50,
  title_translation_left: 125,
  cells_per_view: 3,
  cell_gap: 40,
  peek_offset: 125,
  show_row_counter: false,
  lazy_load_item_count: 4,
  item_reload_offset: 2,
  enable_auto_scroll: false,
  auto_scroll_interval: null,
  focus_animation_style: "fixedFocus",
  focus_bitmap_url: null,
  focus_bitmap_color: "#ffffff",
  enable_pagination_dots: false,
  pagination_dots_dot_size: null,
  pagination_dots_gap: null,
  pagination_dots_translation_top: null,
  pagination_dots_translation_left: null,
  pagination_dots_selected_color: null,
  pagination_dots_unselected_color: null,
  focus_height: null,
  list_translation_left: null,
  list_translation_top: null,
  list_translation_bottom: null,
  row_gap: 50,
  name?: string;
  feed?: {
    feed_url?: string;
    documentId?:string;
    name?:string;
enable_feed_mapping?:boolean;
    feed_mapping:any
    method:string;
    
  };
  card_style?: any;
}
