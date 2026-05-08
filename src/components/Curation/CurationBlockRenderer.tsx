// src/components/Curation/CurationBlockRenderer.tsx
//
// Maps a component identifier string (from preset_blocks[].component)
// to the actual React component to render.
//
// Component identifiers come from the Strapi __component field, normalized
// by parsePageBlocks() in BootstrapUtils:
//   'roku.horizontal-list'  → 'HorizontalList'
//   'roku.responsive-grid'  → 'ResponsiveGrid'
//
// To add a new component:
//   1. Import it below
//   2. Add a case in the switch statement

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import HorizontalList from '../HorizontalList/HorizontalList';
import GridList from '../GridList/GridList';

interface CurationBlockRendererProps {
  component: string;
  config: Record<string, any>;
}

export default function CurationBlockRenderer({ component, config }: CurationBlockRendererProps) {
  switch (component) {
    case 'HorizontalList':
      return <HorizontalList config={config} />;

    case 'ResponsiveGrid':
    case 'GridList':
      return <GridList config={config} />;

    default:
      // Unknown component — log for debugging, render nothing in production
      console.warn(`⚠️ CurationBlockRenderer: Unknown component "${component}"`);
      return (
        <View style={styles.unknown}>
          <Text style={styles.unknownText}>Unknown block: {component}</Text>
        </View>
      );
  }
}

const styles = StyleSheet.create({
  unknown: {
    padding: 16,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#444',
  },
  unknownText: {
    color: '#888',
    fontSize: 14,
  },
});
