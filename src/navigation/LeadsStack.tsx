import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Leads from '../components/Leads';
import Settings from '../components/Settings';
import FollowupHistory from '../components/FollowupHistory';
import AddLeads from '../components/AddLeads';
import NextFollowUp from '../components/NextFollowUp';

const Stack = createNativeStackNavigator();

export function LeadsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Leads" component={Leads} />
      <Stack.Screen name="Settings" component={Settings} />
      <Stack.Screen name="FollowupHistory" component={FollowupHistory} />
      <Stack.Screen name="AddLeads" component={AddLeads} />
      <Stack.Screen name="NextFollowUp" component={NextFollowUp} />
    </Stack.Navigator>
  );
}

