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
import DeviceInfo from 'react-native-device-info';
import COMMON from '../comon/Common';
import axios from 'axios';
import { Alert, Linking } from 'react-native';

const Drawer = createDrawerNavigator();

const baseUrl = COMMON.BaseUrl;
const DbName = COMMON.DbName;

export function RootNavigator() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

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

  const compareVersions = (v1: string, v2: string) => {
    const a = v1.split(".").map(Number);
    const b = v2.split(".").map(Number);

    for (let i = 0; i < Math.max(a.length, b.length); i++) {
      const num1 = a[i] || 0;
      const num2 = b[i] || 0;

      if (num1 > num2) return 1;
      if (num1 < num2) return -1;
    }

    return 0;
  };

  const isSafeVersion = async () => {
    setIsLoading(true);

    try {
      const appVersion = await DeviceInfo.getVersion();
      // const appVersion = "1.1";
      const packageName = DeviceInfo.getBundleId();
      console.log(appVersion, "App Version");

      const response = await axios.post(
        `${baseUrl}/mobile-app-version?db=${DbName}`
      );

      const { latest_version, critical_version } = response.data;
      console.log(response.data);

      const playStoreUrl =
        `https://play.google.com/store/apps/details?id=${packageName}`;

      // FORCE UPDATE
      if (compareVersions(appVersion, critical_version) === -1) {
        Alert.alert(
          "⚠️ Update Required",
          "You must update the app to continue using it.",
          [
            {
              text: "Update",
              onPress: () => Linking.openURL(playStoreUrl),
            },
          ],
          { cancelable: false }
        );
        return;
      }

      // OPTIONAL UPDATE
      if (compareVersions(appVersion, latest_version) === -1) {
        Alert.alert(
          "🚨 Update Available",
          "A new version of the app is available.",
          [
            { text: "Later", style: "cancel" },
            {
              text: "Update",
              onPress: () => Linking.openURL(playStoreUrl),
            },
          ]
        );
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    isSafeVersion();
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
