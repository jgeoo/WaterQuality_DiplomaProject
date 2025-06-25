export const unstable_excludeFromRootRoutes = true;
import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, Image, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from './index';  
import { useRoute } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type Props = NativeStackScreenProps<RootStackParamList, 'Details'>;

export default function DetailsScreen({ route }: Props ) {

    const router = useRoute()
    const { pH, turbidity , tds , city } = router.params as {
      pH: string | number;
      turbidity: number;
      tds: number;
      city: string;
    };
    
    const roundedpH = Number(pH).toFixed(2);
    const roundedturbidity = Number(turbidity).toFixed(2);


    return (
      <SafeAreaView style={styles.container}>
        
      <Text style={styles.header}> { city }</Text>
      

      <View style={styles.circleContainer}>
        <View style={styles.circle}>
          <Image source={require('../../assets/images/ph.png')} style={styles.iconImage} />
          <Text style={styles.label}>pH</Text>
          <Text style={styles.value}>{roundedpH}</Text>
        </View>
      </View>

      <View style={styles.circleContainer}>
        <View style={styles.circle}>
          <Image source={require('../../assets/images/tss.png')} style={styles.iconImage} />
          <Text style={styles.label}>Turbidity</Text>
          <Text style={styles.value}>{ roundedturbidity } %</Text>
        </View>
      </View>

      <View style={styles.circleContainer}>
        <View style={styles.circle}>
          <Image source={require('../../assets/images/tds.png')} style={styles.iconImage} />
          <Text style={styles.label}>TDS</Text>
          <Text style={styles.value}>{ tds.toFixed(2) } ppm</Text>
        </View>
      </View>
    </SafeAreaView>
  );
    
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2b2727',
    alignItems: 'center',
    paddingTop: 40,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    backgroundColor: '#4a4a4a',
    padding: 10,
    borderColor: '#0093e9',
    borderBottomWidth: 2,
    width: '100%',
    textAlign: 'center',
  },
  circleContainer: {
    marginVertical: 20,
    alignItems: 'center',
  },
  circle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#4a6d77',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#fff',
    padding: 10,
  },
  iconImage: {
    width: 30,
    height: 30,
    marginBottom: 8,
  },
  label: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 4,
  },
  value: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
} );
