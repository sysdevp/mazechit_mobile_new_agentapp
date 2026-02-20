import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Home from '../components/Home';
import AddCustomer from '../components/AddCustomer';
import type { RootStackParamList } from './types';
import Reports from '../components/Reports';
import Collection from '../components/Collections';
import Leads from '../components/Leads';
import ViewReceipts from '../components/ViewReceipts';
import ReceiptDetails from '../components/ReceiptDetails';
import NextFollowUp from '../components/NextFollowUp';
import CollectionRemarks from '../components/CollectionRemarks';
import AddCollectionRemarks from '../components/AddCollectionRemarks';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function MainStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={Home} />
      <Stack.Screen name="AddCust" component={AddCustomer} />
      <Stack.Screen name="Reports" component={Reports} />
      <Stack.Screen name="Collection" component={Collection} />
      <Stack.Screen name="Leads" component={Leads} />
      <Stack.Screen name="ViewReceipts" component={ViewReceipts} />
      <Stack.Screen name="ReceiptDetails" component={ReceiptDetails} />
      <Stack.Screen name="NextFollowUp" component={NextFollowUp} />
      <Stack.Screen name="CollectionRemarks" component={CollectionRemarks} />
      <Stack.Screen name="AddCollectionRemarks" component={AddCollectionRemarks} />
    </Stack.Navigator>
  );
}
