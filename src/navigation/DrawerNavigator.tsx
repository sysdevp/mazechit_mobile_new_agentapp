import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import AddCustomer from '../components/AddCustomer';
import NavItems from '../components/NavItems';
import Reports from '../components/Reports';
import Settings from '../components/Settings';
import LoginScreen from '../components/Login';
import { BottomTabNavigator } from './BottomTabNavigator';
import ViewReceipts from '../components/ViewReceipts';
import CutomerList from '../components/CustomerList';
// import UISample from '../components/UISample';

const Drawer = createDrawerNavigator();

export function AppDrawer() {
  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          backgroundColor: '#00334E',
          width: 300,
        },
      }}
      drawerContent={props => <NavItems {...props} />}
    >
      {/* <Drawer.Screen name="UI" component={UISample} /> */}
      <Drawer.Screen name="MainTabs" component={BottomTabNavigator} />
      <Drawer.Screen name="Login" component={LoginScreen} />
      <Drawer.Screen name="AddCust" component={AddCustomer} />
      <Drawer.Screen name="Reports" component={Reports} />
      <Drawer.Screen name="Settings" component={Settings} />
      <Drawer.Screen name="ViewReceipts" component={ViewReceipts} />
      <Drawer.Screen name="CutomerList" component={CutomerList} />
    </Drawer.Navigator>
  );
}
