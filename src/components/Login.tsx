import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  BackHandler,
  ActivityIndicator,
} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Feather from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { useNavigationHistory } from '../navigation/NavigationHistoryContext';
import COMMON from '../comon/Common';
import { ALERT_TYPE, Dialog } from 'react-native-alert-notification';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { requestLocationPermission } from './helper/requestLocationPermission';
import DeviceInfo from 'react-native-device-info';

type LoginScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Login'
>;

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [deviecId, setDeviecId] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {},
  );

  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { addToHistory } = useNavigationHistory();

  const BaseUrl = COMMON.BaseUrl;

  useEffect(() => {
    DeviceInfo.getAndroidId().then((androidId) => {
      setDeviecId(androidId);
    });
  }, []);

  console.log(deviecId, "Login page device id")

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!email.includes('@')) {
      newErrors.email = 'Invalid Email ID';
    }

    if (!password.trim()) {
      newErrors.password = 'Password is required';
    } else if (password.length < 4) {
      newErrors.password = 'Password should be at least 4 characters';
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // HANDLE BACK BUTTON
  useFocusEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        BackHandler.exitApp();
        return true;
      },
    );

    return () => backHandler.remove();
  });

  const handleSubmit = async () => {
    setIsLoading(true);
    if (!validateForm()) return setIsLoading(false);;

    try {
      const url = `${BaseUrl}/check-login?email=${email}&password=${password}&device_id=${deviecId}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (!response.ok) {
        // API error message
        Dialog.show({
          type: ALERT_TYPE.DANGER,
          title: 'Error',
          textBody: result.message || 'Login failed',
          button: 'close',
        });

        return;
      }

      // If the user login for the first time

      if (result.status !== "Success") {
        Dialog.show({
          type: ALERT_TYPE.WARNING,
          title: 'Warning',
          textBody: 'Device Id missing. PLease Verify',
          button: 'close',
          autoClose: 500,
        });

        // await AsyncStorage.setItem('loginDetails', JSON.stringify(result));

        navigation.navigate('OTP', { data: result });

        return;
      }

      console.log('Login success:', result);

      await AsyncStorage.setItem('loginDetails', JSON.stringify(result));

      const hasLocationPermission = await requestLocationPermission();

      if (!hasLocationPermission) {
        Dialog.show({
          type: ALERT_TYPE.WARNING,
          title: 'Permission Required',
          textBody: 'Location permission is required to continue.',
          button: 'close',
        });
        return; // stop navigation
      }

      Dialog.show({
        type: ALERT_TYPE.SUCCESS,
        title: 'Success',
        textBody: 'Login Successfull',
        button: 'close',
        autoClose: 500,
      });

      setEmail('');
      setPassword('');

      setTimeout(() => {
        // Add Home to history
        addToHistory('HomeStack', 'Home');

        // Navigate to Home
        (navigation as any).navigate('MainTabs', {
          screen: 'HomeStack',
          params: { screen: 'Home' },
        });
      }, 1000);
    } catch (error) {
      console.error('Login error:', error);
      Dialog.show({
        type: ALERT_TYPE.DANGER,
        title: 'Error',
        textBody: 'Something went wrong. Please try again.',
        button: 'close',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    navigation.navigate('ChangePassword')
  }

  return (
    <LinearGradient colors={['#061C3F', '#0A5E6A']} style={styles.container}>
      {/* <View style={styles.container}> */}
      <View style={styles.card}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <Text style={styles.welcomeText}>Welcome</Text>
            <Image source={require('../assets/wave.png')} style={styles.wave} />
          </View>
          <Text style={styles.subText}>
            Let’s Get You Started With Mazenet Solutions
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Email Address */}
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Email Address</Text>

            <View style={styles.inputContainer}>
              {/* <email size={20} color="gray" style={styles.icon} /> */}
              <Feather name="mail" color="gray" size={18} style={styles.icon} />

              <TextInput
                placeholder="Enter email"
                placeholderTextColor="#777"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                style={[styles.input, errors.email && styles.errorBorder]}
              />
            </View>

            {errors.email && (
              <Text style={styles.errorText}>{errors.email}</Text>
            )}
          </View>

          {/* Password */}
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Password</Text>

            <View style={styles.inputContainer}>
              {/* <Lock size={20} color="gray" style={styles.icon} /> */}
              <FontAwesome
                name="lock"
                color="gray"
                size={18}
                style={styles.icon}
              />

              <TextInput
                placeholder="Enter password"
                placeholderTextColor="#777"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                style={[styles.input, errors.password && styles.errorBorder]}
              />

              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                {showPassword ? (
                  <FontAwesome name="eye" color="gray" size={18} />
                ) : (
                  <FontAwesome name="eye-slash" color="gray" size={18} />
                )}
              </TouchableOpacity>
            </View>

            {errors.password && (
              <Text style={styles.errorText}>{errors.password}</Text>
            )}
          </View>

          {/* Remember & Forgot */}
          <View style={styles.optionsRow}>
            <TouchableOpacity
              style={styles.rememberRow}
              onPress={() => setRememberMe(!rememberMe)}
            >
              <View
                style={[styles.checkbox, rememberMe && styles.checkboxChecked]}
              >
                {rememberMe && (
                  <FontAwesome name="check" size={12} color="#fff" />
                )}
              </View>
              <Text style={styles.rememberText}>Remember Me</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleForgotPassword}
            >
              <Text style={styles.ForgotPassword}>Forgot Password</Text>
            </TouchableOpacity>
          </View>

          {/* Login Button */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isLoading}
            style={[
              styles.button,
              styles.buttonRow,
              isLoading && { opacity: 0.7 },
            ]}
          >
            {isLoading && (
              <ActivityIndicator size='small' color="#fff" style={{ marginRight: 8 }} />
            )}
            <Text style={styles.buttonText}>Sign In</Text>
          </TouchableOpacity>


        </View>
      </View>

    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 70,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  welcomeText: {
    color: '#fff',
    fontSize: 30,
    fontWeight: 'bold',
  },
  wave: {
    width: 32,
    height: 32,
    marginLeft: 8,
  },
  subText: {
    color: '#D1D1D1',
    marginTop: 8,
  },

  form: {
    marginTop: 30,
  },

  inputWrapper: {
    marginBottom: 16,
  },
  label: {
    color: '#fff',
    marginBottom: 6,
  },
  inputContainer: {
    position: 'relative',
    justifyContent: 'center',
  },
  input: {
    paddingVertical: 18,
    backgroundColor: '#f0f0f0',
    padding: 12,
    paddingLeft: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    color: '#333',
  },
  icon: {
    position: 'absolute',
    left: 10,
    zIndex: 1,
  },
  eyeIcon: {
    position: 'absolute',
    right: 10,
  },

  errorBorder: {
    borderColor: 'red',
  },
  errorText: {
    color: 'red',
    marginTop: 4,
    fontSize: 12,
  },

  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 2,
    borderColor: '#fff',
    borderRadius: 3,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  checkboxChecked: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  rememberText: {
    color: '#fff',
    fontSize: 13,
  },
  ForgotPassword: {
    color: '#25AAEB',
    fontSize: 14,
    textDecorationLine: 'underline'
  },
  forgotText: {
    color: '#fff',
    // textDecorationLine: 'underline',
    fontSize: 13,
  },

  registerText: {
    textAlign: 'center',
    color: '#fff',
    marginTop: 20,
  },
  registerLink: {
    color: '#FACC15',
    // textDecorationLine: 'underline',
    fontSize: 14,
  },

  button: {
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },

  buttonDisabled: {
    backgroundColor: '#60A5FA',
  },
  buttonText: {
    textAlign: 'center',
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    width: '100%',
    alignItems: 'center',
  },
  appName: {
    fontSize: 14,
    color: '#888',
    fontWeight: '600',
  },
  version: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
});
