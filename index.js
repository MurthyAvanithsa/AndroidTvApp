/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

// This is where 'AppRegistry' is registered as a callable module
AppRegistry.registerComponent(appName, () => App);
