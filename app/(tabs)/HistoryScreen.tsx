import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { ref, onValue } from 'firebase/database';
import { database } from '../../firebaseConfig';

type Reading = {
  pH: number;
  turbidity: number;
  tds: number;
};

type CityReadings = {
  [timestamp: string]: Reading;
};

type FullData = {
  [cityName: string]: CityReadings;
};

export default function HistoryScreen() {
  const [data, setData] = useState<FullData>({});

  useEffect(() => {
    const sensorRef = ref(database);
    const unsubscribe = onValue(sensorRef, (snapshot) => {
      const value = snapshot.val();
      if (value) {
        setData(value as FullData);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>History of Readings</Text>
      {Object.entries(data).map(([city, readings]) => (
        <View key={city} style={styles.cityContainer}>
          <Text style={styles.cityTitle}>{city}</Text>
          {Object.entries(readings)
            .sort((a, b) => Number(b[0]) - Number(a[0])) 
            .slice(0,10)
            .map(([timestamp, { pH, turbidity, tds }]) => (
              <View key={timestamp} style={styles.readingCard}>
               
                <Text style={styles.readingText}>pH: {pH.toFixed(2)}</Text>
                <Text style={styles.readingText}>Turbidity: {turbidity.toFixed(2)}%</Text>
                <Text style={styles.readingText}>TDS: {tds.toFixed(2)} ppm</Text>
              </View>
            ))}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#1c1c1e', padding: 20, paddingBottom: 50 },
  title: { color: '#fff', fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  cityContainer: { marginBottom: 30 },
  cityTitle: { color: '#00BFFF', fontSize: 20, fontWeight: '600', marginBottom: 10 },
  readingCard: {
    backgroundColor: '#2e2e2e',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#444',
  },
  readingText: { color: '#fff', fontSize: 14 },
});
