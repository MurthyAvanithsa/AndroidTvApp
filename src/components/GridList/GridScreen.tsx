import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import GridList from './GridList';
import { MOCK_GRID_CONFIG } from '../../mockData';

export default function GridScreen() {
  return (
    <View style={styles.container}>
      {/* <View style={styles.header}>
        <Text style={styles.headerText}>Grid View</Text>
      </View> */}
      <GridList config={MOCK_GRID_CONFIG} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: '#111',
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  headerText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
  },
});
