import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  BackHandler,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import LinearGradient from 'react-native-linear-gradient';
import Header from './Header';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import DeviceInfo from 'react-native-device-info';
import axios, { AxiosError } from 'axios';
import COMMON from '../comon/Common';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ALERT_TYPE, Dialog } from 'react-native-alert-notification';

const ChangePassword = () => {
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [deviecId, setDeviecId] = useState('');

  const [passwordData, setPasswordData] = useState();
  const [user, setUser] = useState();

  const baseUrl = COMMON.BaseUrl;
  const dataBase = COMMON.DbName;

  const navigation = useNavigation<any>();

  DeviceInfo.getAndroidId().then((androidId) => {
    setDeviecId(androidId);
  });

  useFocusEffect(() => {
    const backAction = () => {
      // Navigate to ChangePassword when back is pressed
      navigation.navigate('Login');
      return true; // Prevent default behavior
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => backHandler.remove();
  });

  const validatePhone = (phoneNumber: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(phoneNumber);
  };

  // --- Handle password submit ---

  const handleSubmit = async () => {
    if (!phone.trim()) {
      setError('Email ID is required');
      return;
    }

    if (!validatePhone(phone)) {
      setError('Enter a valid Email address');
      return;
    }

    const payload = {
      email: phone,
      device_id: deviecId,
    };

    try {
      const response = await axios.post(`${baseUrl}/forget-password-request`, null, {
        params: payload,
      });

      const res = response.data;

      Dialog.show({
        type: ALERT_TYPE.SUCCESS,
        title: 'Success',
        textBody: 'OTP sent successfully!',
        button: 'close',
      });

      setError('');
      setPhone('');
      navigation.navigate('OTPPage', {data: res});
      setPasswordData(res);
    }catch (err) {
    
      const error = err as AxiosError<any>;

      const message =
        error.response?.data?.msg ??
        'Something went wrong';

        Dialog.show({
          type: ALERT_TYPE.WARNING,
          title: 'Error',
          textBody: message || 'Failed to Verify. Please Try again',
          button: 'close',
        });

      // if (error.response) {
      //   const message =
      //     error.response.data?.msg ||
      //     error.response.data?.message ||
      //     'Something went wrong';

      //   Dialog.show({
      //     type: ALERT_TYPE.WARNING,
      //     title: 'Error',
      //     textBody: message || 'Failed to Verify. Please Try again',
      //     button: 'close',
      //   });
      // } else if (error.request) {
      //   Dialog.show({
      //     type: ALERT_TYPE.WARNING,
      //     title: 'Error',
      //     textBody:'No response from server',
      //     button: 'close',
      //   });
      // } else {
      //   Dialog.show({
      //     type: ALERT_TYPE.WARNING,
      //     title: 'Error',
      //     textBody: error.message || 'Failed to Verify. Please Try again',
      //     button: 'close',
      //   });
      // }
    } finally {
    }
  };
  return (
    <LinearGradient colors={['#061C3F', '#0A5E6A']} style={styles.container}>
      {/* <Header title="Change Password" showBack /> */}

      {/* Header Section */}
      <View>
        <Text style={styles.title}>Forgot Password</Text>
        <Text style={styles.subtitle}>
          Enter your registered email ID to receive an OTP{'\n'}
          and verify it to update your password.
        </Text>
      </View>

      {/* Phone Input */}
      <View style={styles.inputWrapper}>
        <Icon name="phone" size={18} color="#777" />
        <TextInput
          placeholder="Enter Email ID"
          placeholderTextColor="#888"
          keyboardType="email-address"
          value={phone}
          onChangeText={setPhone}
          style={styles.input}
        />
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      {/* Proceed Button */}
      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Proceed</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
};

export default ChangePassword;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 22,
    paddingTop: 60,
    paddingBottom: 40,
  },

  /* Back Button */
  backButton: {
    width: 40,
    paddingVertical: 6,
  },

  /* Header Text Section */
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#d3d3d3',
    marginTop: 2,
  },

  /* Input Box */
  inputWrapper: {
    marginTop: 40,
    backgroundColor: '#fff',
    borderRadius: 14,
    height: 48,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    marginLeft: 12,
    flex: 1,
    fontSize: 16,
    color: '#000',
  },

  error: {
    color: 'red',
    fontSize: 13,
    marginTop: 5,
    paddingStart: 10,
    paddingTop: 5,
  },

  /* Button */
  button: {
    backgroundColor: '#235DFF',
    height: 55,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 'auto',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
