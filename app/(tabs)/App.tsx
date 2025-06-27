import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Alert, Platform } from 'react-native';
import { ref, onValue } from 'firebase/database';
import { database } from '../../firebaseConfig';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from './index';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';


Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

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

export default function HomeScreen() {
  const [data, setData] = useState<FullData>({});
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'Home'>>();
  const notified = useRef<Record<string, boolean>>({});
  const [expoPushToken, setExpoPushToken] = useState<string | undefined>();
  const [notificationPermission, setNotificationPermission] = useState<string | undefined>();

  
  useEffect(() => {
    registerForPushNotificationsAsync().then(token => setExpoPushToken(token));
  }, []);

  
  useEffect(() => {
    if (Device.isDevice) {
      Notifications.requestPermissionsAsync().then(({ status }) => {
        setNotificationPermission(status);
        if (status !== 'granted') {
          Alert.alert(
            'Notification Permission',
            'Please enable notifications to receive alerts about water quality issues.',
            [{ text: 'OK' }]
          );
        }
      });
    }
  }, []);

  
  useEffect(() => {
    const sensorRef = ref(database);
    const unsubscribe = onValue(sensorRef, (snapshot) => {
      const value = snapshot.val();
      if (value) {
        const typedData = value as FullData;
        setData(typedData);

        Object.entries(typedData).forEach(([city, readings]) => {
          if (!readings || typeof readings !== 'object') return;

          const timestamps = Object.keys(readings).sort().reverse();
          if (timestamps.length === 0) return;

          const latestTimestamp = timestamps[0];
          const latestReading = readings[latestTimestamp];
          const key = `${city}-${latestTimestamp}`;

          
          if (
            latestReading &&
            typeof latestReading.pH === 'number' &&
            typeof latestReading.tds === 'number' &&
            (latestReading.pH > 8 || latestReading.pH < 3 || 
             latestReading.tds > 1000) &&
            !notified.current[key]
          ) {
            
            console.log(`Abnormal water quality detected in ${city}: pH=${latestReading.pH}, TDS=${latestReading.tds}, Turbidity=${latestReading.turbidity}`);
            
            
            sendWaterQualityNotification(city, latestReading);
            
           
            notified.current[key] = true;
          }
        });
      }
      
      console.log('Notification permission:', notificationPermission);
      console.log('Push token:', expoPushToken);
    });

    return () => unsubscribe();
  }, [notificationPermission, expoPushToken]);

  
  const sendWaterQualityNotification = async (city: string, reading: Reading) => {
    try {
      
      const abnormalParams = [];
      if (reading.pH > 8 || reading.pH < 3) {
        abnormalParams.push(`pH: ${reading.pH.toFixed(2)}`);
      }
      if (reading.tds > 1000) {
        abnormalParams.push(`TDS: ${reading.tds.toFixed(2)}`);
      }

      const notificationContent = {
        title: `⚠️ Water Quality Alert in ${city}`,
        body: `Abnormal levels detected: ${abnormalParams.join(', ')}`,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      };
      
      
      await Notifications.scheduleNotificationAsync({
        content: notificationContent,
        trigger: null, 
      });
      
      console.log('Notification scheduled successfully');
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={require('../../assets/images/logo.png')} style={styles.image} />
      {Object.keys(data).map((city) => {
        const readings = data[city];
        const timestamps = Object.keys(readings).sort().reverse();
        const latestTimestamp = timestamps[0];
        const { pH, turbidity, tds } = readings[latestTimestamp];

        
        const isAbnormalPH = pH > 8 || pH < 3;
        const isAbnormalTDS = tds > 1000;
        const hasAbnormalReading = isAbnormalPH || isAbnormalTDS;

        return (
          <TouchableOpacity
            key={city}
            style={[styles.card, hasAbnormalReading && styles.alertCard]}
            onPress={() =>
              navigation.navigate('Details', {
                pH,
                turbidity,
                tds,
                city,
              })
            }
          >
            <View>
              <Text style={styles.text}>{city}</Text>
              {hasAbnormalReading && (
                <View>
                  {isAbnormalPH && (
                    <Text style={styles.alertText}>⚠️ pH: {pH.toFixed(2)}</Text>
                  )}
                  {isAbnormalTDS && (
                    <Text style={styles.alertText}>⚠️ TDS: {tds.toFixed(2)}</Text>
                  )}
                </View>
              )}
            </View>
            <View style={styles.iconBox}>
              <Ionicons name="chevron-forward" size={24} color="#fff" />
            </View>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}


async function registerForPushNotificationsAsync() {
  let token;

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.warn('Failed to get push token for push notification!');
      return;
    }
    
   
    token = (await Notifications.getExpoPushTokenAsync()).data;
  } else {
    console.warn('Must use physical device for Push Notifications');
  }

  
  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  return token;
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#2E2E2E',
    flexGrow: 1,
    alignItems: 'center',
    paddingVertical: 50,
  },
  image: {
    width: 120,
    height: 120,
    marginBottom: 40,
    resizeMode: 'contain',
  },
  card: {
    width: '80%',
    backgroundColor: '#3A3A3A',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#00BFFF',
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  alertCard: {
    borderColor: '#FF4500',
    borderWidth: 3,
  },
  text: {
    color: '#fff',
    fontSize: 16,
  },
  alertText: {
    color: '#FF4500',
    fontSize: 14,
    marginTop: 5,
  },
  iconBox: {
    backgroundColor: '#00BFFF',
    borderRadius: 8,
    padding: 6,
  },
});