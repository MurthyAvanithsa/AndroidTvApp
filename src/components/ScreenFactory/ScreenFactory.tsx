import React from 'react';
import HorizontalList from '../HorizontalList/HorizontalList';
import GridList from '../GridList/GridList';
import Curation from '../Curation/Curation';
import { PageBlock } from '../../utils/BootstrapUtils';

interface ScreenFactoryProps {
  block: PageBlock;
}

export default function ScreenFactory({ block }: ScreenFactoryProps) {
  const { component, config } = block;

  switch (component) {
    case 'HorizontalList':
      return <HorizontalList config={config as any} />;
    case 'GridList':
    case 'Grid':
      return <GridList config={config as any} />;
    case 'Curation':
      return <Curation />;
    default:
      console.warn(`⚠️ ScreenFactory: Unknown component "${component}"`);
      return null;
  }
}
