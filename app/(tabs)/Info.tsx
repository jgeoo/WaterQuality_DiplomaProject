import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

export default function InfoScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Water Quality App</Text>
      <Text style={styles.text}>
        WaterQuality focuses on buliding low-cost IoT system for real-time water quality data collected from public water sources such as 
        springs or public fountains. Using a Raspberry Pi 5, water 
        parameters such as pH, turbidity, and TDS (Total Dissolved Solids) are collected and displayed with instant notification when the quality of water becomes unsafe.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#2E2E2E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: '#00BFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  text: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
});
