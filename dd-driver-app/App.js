import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { useFonts, Lexend_300Light, Lexend_400Regular, Lexend_500Medium, Lexend_600SemiBold, Lexend_700Bold } from '@expo-google-fonts/lexend';
import { View, ActivityIndicator } from 'react-native';
import RequestRideScreen from './screens/RequestRideScreen';
import ProfileScreen from './screens/ProfileScreen';
import HowToUseScreen from './screens/HowToUseScreen';
import { Ionicons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();

export default function App() {
  let [fontsLoaded] = useFonts({
    Lexend_300Light,
    Lexend_400Regular,
    Lexend_500Medium,
    Lexend_600SemiBold,
    Lexend_700Bold,
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#D7DEED' }}>
        <ActivityIndicator size="large" color="#5ABAEA" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: {
            backgroundColor: '#FFFFFF',
            borderTopWidth: 0,
            elevation: 8,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            height: 85,
            paddingBottom: 10,
            paddingTop: 10,
          },
          tabBarActiveTintColor: '#5ABAEA',
          tabBarInactiveTintColor: '#9CA3AF',
          tabBarLabelStyle: {
            fontFamily: 'Lexend_500Medium',
            fontSize: 12,
            marginTop: 4,
          },
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            if (route.name === 'Request Ride') {
              iconName = focused ? 'car' : 'car-outline';
            } else if (route.name === 'Profile') {
              iconName = focused ? 'person' : 'person-outline';
            } else if (route.name === 'How to Use') {
              iconName = focused ? 'information-circle' : 'information-circle-outline';
            }
            return <Ionicons name={iconName} size={26} color={color} />;
          },
        })}
      >
        <Tab.Screen name="Request Ride" component={RequestRideScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
        <Tab.Screen name="How to Use" component={HowToUseScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
