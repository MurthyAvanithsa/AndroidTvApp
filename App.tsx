// App.tsx

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StrapiProvider } from './src/context/StrapiContext';
import BootstrapProcess from './src/components/BootstrapProcess';
import TVAppScreen from './src/TVAppScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <StrapiProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Bootstrap" component={BootstrapProcess} />
          <Stack.Screen name="Home" component={TVAppScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </StrapiProvider>
  );
}
