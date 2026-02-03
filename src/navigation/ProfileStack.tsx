import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Profile from '../components/Profile';
import Settings from '../components/Settings';
import Reports from '../components/Reports';
import DeviceManager from '../components/DeviceManager';

const Stack = createNativeStackNavigator();

export function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Profile" component={Profile} />
      <Stack.Screen name="Settings" component={Settings} />
      <Stack.Screen name="Reports" component={Reports} />
      <Stack.Screen name="Devices" component={DeviceManager} />
    </Stack.Navigator>
  );
}

