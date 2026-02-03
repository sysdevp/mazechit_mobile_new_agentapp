import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Home from '../components/Home';
import AddCustomer from '../components/AddCustomer';
import Reports from '../components/Reports';
import Settings from '../components/Settings';
import ViewReceipts from '../components/ViewReceipts';
import CutomerList from '../components/CustomerList';
import CutomerDetails from '../components/CutomerDetails';
import ReceiptDetails from '../components/ReceiptDetails';
import Settlement from '../components/Settlement';
import GenerateReport from '../components/GenerateReport';
import FollowupHistory from '../components/FollowupHistory';
import AddLeads from '../components/AddLeads';
import OutstandingReport from '../components/ReportPages/OutstandingReport';
import CollectionReport from '../components/ReportPages/CollectionReport';
import LeadReport from '../components/ReportPages/LeadReport';
import DayClosingReport from '../components/ReportPages/DayClosingReport';
import AuctionReport from '../components/ReportPages/AuctionReport';
import PaymentReport from '../components/ReportPages/PaymentReport';
import EnrollmentReport from '../components/ReportPages/EnrollmentReport';
import NextFollowUp from '../components/NextFollowUp';
import Leads from '../components/Leads';
import CollectionFeedbackReport from '../components/ReportPages/CollectionFeedbackReport';
import OfflineReceiptSync from '../components/OfflineReceiptSync';
import TodaysFollowUps from '../components/TodaysFollowUps';

const Stack = createNativeStackNavigator();

export function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={Home} />
      <Stack.Screen name="CutomerList" component={CutomerList} />
      <Stack.Screen name="AddCust" component={AddCustomer} />
      <Stack.Screen name="Reports" component={Reports} />
      <Stack.Screen name="Settings" component={Settings} />
      <Stack.Screen name="ViewReceipts" component={ViewReceipts} />
      <Stack.Screen name="CutomerDetails" component={CutomerDetails} />
      <Stack.Screen name="ReceiptDetails" component={ReceiptDetails} />
      <Stack.Screen name="Settlement" component={Settlement} />
      <Stack.Screen name="GenerateReport" component={GenerateReport} />
      <Stack.Screen name="NextFollowUp" component={NextFollowUp} />
      <Stack.Screen name="FollowupHistory" component={FollowupHistory} />
      <Stack.Screen name="Leads" component={Leads} />
      <Stack.Screen name="AddLeads" component={AddLeads} />
      <Stack.Screen name="OutstandingReport" component={OutstandingReport} />
      <Stack.Screen name="CollectionReport" component={CollectionReport} />
      <Stack.Screen name="CollectionFeedbackReport" component={CollectionFeedbackReport} />
      <Stack.Screen name="LeadReport" component={LeadReport} />
      <Stack.Screen name="DayClosingReport" component={DayClosingReport} />
      <Stack.Screen name="AuctionReport" component={AuctionReport} />
      <Stack.Screen name="PaymentReport" component={PaymentReport} />
      <Stack.Screen name="EnrollmentReport" component={EnrollmentReport} />
      <Stack.Screen name="syncOfflineReceipts" component={OfflineReceiptSync} />
      <Stack.Screen name="todaysFollowUps" component={TodaysFollowUps} />
    </Stack.Navigator>
  );
}
