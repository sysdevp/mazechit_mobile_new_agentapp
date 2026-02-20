import React, { useEffect, useState } from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { BottomTabNavigator } from './BottomTabNavigator';
import NavItems from '../components/NavItems';
import LoginScreen from '../components/Login';
import ChangePassword from '../components/ChangePassword';
import OtpUIFunc from '../components/OtpVerify';
import Password from '../components/Password';
import { AlertNotificationRoot } from 'react-native-alert-notification';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SpashScreen from '../components/loaders/SpashScreen';
import OtpPage from '../components/Otp';
import ForPassword from '../components/ForgPassword';

const Drawer = createDrawerNavigator();

export function RootNavigator() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const value = await AsyncStorage.getItem('loginDetails');
        setIsLoggedIn(!!value); // true if data exists
      } catch (error) {
        setIsLoggedIn(false);
        console.log(error);
      }
    };

    checkLogin();
  }, []);

  // Prevent flicker while checking AsyncStorage
  if (isLoggedIn === null) {
    return <SpashScreen />; // or Loader / Splash screen
  }

  return (
    <AlertNotificationRoot>
      <Drawer.Navigator
        initialRouteName={isLoggedIn ? 'MainTabs' : 'Login'}
        // initialRouteName={'MainTabs'}
        screenOptions={{
          headerShown: false,
          drawerStyle: {
            backgroundColor: '#00334E',
            width: 300,
          },
          drawerType: 'slide',
          overlayColor: 'rgba(0, 0, 0, 0.5)',
        }}
        drawerContent={props => <NavItems {...props} />}
      >
        <Drawer.Screen
          name="MainTabs"
          component={BottomTabNavigator}
          options={{
            drawerLabel: 'Main',
          }}
        />

        <Drawer.Screen
          name="Login"
          component={LoginScreen}
          options={{
            drawerItemStyle: { display: 'none' },
          }}
        />
        <Drawer.Screen
          name="ChangePassword"
          component={ChangePassword}
          options={{
            drawerItemStyle: { display: 'none' },
          }}
        />
        <Drawer.Screen
          name="ForPassword"
          component={ForPassword}
          options={{
            drawerItemStyle: { display: 'none' },
          }}
        />
        <Drawer.Screen
          name="OTP"
          component={OtpUIFunc}
          options={{
            drawerItemStyle: { display: 'none' },
          }}
        />
        <Drawer.Screen
          name="OTPPage"
          component={OtpPage}
          options={{
            drawerItemStyle: { display: 'none' },
          }}
        />
        <Drawer.Screen
          name="Password"
          component={Password}
          options={{
            drawerItemStyle: { display: 'none' },
          }}
        />
      </Drawer.Navigator>
    </AlertNotificationRoot>
  );
}
