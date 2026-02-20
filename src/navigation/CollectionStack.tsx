import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Collection from '../components/Collections';
import ViewReceipts from '../components/ViewReceipts';
import Settings from '../components/Settings';
import ReceiptDetails from '../components/ReceiptDetails';
import Settlement from '../components/Settlement';
import GenerateReport from '../components/GenerateReport';
import ReportGenerate from '../components/ReportGenerate';
import CollectionRemarks from '../components/CollectionRemarks';
import AddCollectionRemarks from '../components/AddCollectionRemarks';
import Feedback from '../components/Feedback';
import BeforeEnrollment from '../components/BeforeEnrollment';
import OfflineReceiptSync from '../components/OfflineReceiptSync';

const Stack = createNativeStackNavigator();

export function CollectionStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Collection" component={Collection} />
      <Stack.Screen name="ViewReceipts" component={ViewReceipts} />
      <Stack.Screen name="ReceiptDetails" component={ReceiptDetails} />
      <Stack.Screen name="Settings" component={Settings} />
      <Stack.Screen name="Settlement" component={Settlement} />
      <Stack.Screen name="GenerateReport" component={GenerateReport} />
      <Stack.Screen name="ReportGenerate" component={ReportGenerate} />
      <Stack.Screen name="CollectionRemarks" component={CollectionRemarks} />
      <Stack.Screen name="AddCollectionRemarks" component={AddCollectionRemarks} />
      <Stack.Screen name="Feedback" component={Feedback} />
      <Stack.Screen name="BeforeEnrollment" component={BeforeEnrollment} />
      <Stack.Screen name="syncOfflineReceipts" component={OfflineReceiptSync} />
    </Stack.Navigator>
  );
}