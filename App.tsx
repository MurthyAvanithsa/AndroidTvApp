// App.tsx

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StrapiProvider } from './src/context/StrapiContext';
import BootstrapProcess from './src/components/BootstrapProcess';
import TVAppScreen from './src/TVAppScreen';
import GridScreen from './src/components/GridList/GridScreen';
import Curation from './src/components/Curation/Curation';
import ScreenComposition from './src/components/ScreenComposition/ScreenComposition';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <StrapiProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Bootstrap" component={BootstrapProcess} />
          <Stack.Screen name="Home" component={TVAppScreen} />
          <Stack.Screen name="HomeFeed" component={Curation} />
          <Stack.Screen name="Grid" component={GridScreen} />
          <Stack.Screen name="ScreenComposition" component={ScreenComposition} />
        </Stack.Navigator>
      </NavigationContainer>
    </StrapiProvider>
  );
}
