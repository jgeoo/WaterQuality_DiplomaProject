import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { FontAwesome } from '@expo/vector-icons';


export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
          },
          default: {},
        }),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="Info"
        options={{
          title: 'App Info',
          tabBarIcon: ({ color }) => <FontAwesome name="info-circle" size={28} color={color} />,
        }}
      />
            <Tabs.Screen
        name="HistoryScreen"
        options={{
          title: 'History',
          tabBarIcon: ({ color }) => <FontAwesome name="history" size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="Details"
        options={{
          href: null, 
        }}
      />
       <Tabs.Screen
        name="App"
        options={{
          href: null, 
        }}
      />
   
    </Tabs>
  );
}
