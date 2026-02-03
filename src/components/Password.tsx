import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';
import Header from './Header';
import COMMON from '../comon/Common';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { ALERT_TYPE, Dialog } from 'react-native-alert-notification';
const Password = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigation = useNavigation<any>();

  const [oldPassword, setOldPassword] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [user, setUser] = useState<any>();
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [errors, setErrors] = useState<{
    password?: string;
    confirmPassword?: string;
  }>({});

  const baseUrl = COMMON.BaseUrl;
  const dataBase = COMMON.DbName;

  const validateForm = () => {
    const newErrors: { password?: string; confirmPassword?: string } = {};

    if (!password.trim()) {
      newErrors.password = 'Password is required';
    } else if (password.length < 4) {
      newErrors.password = 'Password must be at least 4 characters';
    }

    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = 'Confirm password is required';
    } else if (confirmPassword !== password) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // useFocusEffect(() => {
  //   const backAction = () => {
  //     // Navigate to ChangePassword when back is pressed
  //     navigation.navigate('ChangePassword');
  //     return true; // Prevent default behavior
  //   };

  //   const backHandler = BackHandler.addEventListener(
  //     'hardwareBackPress',
  //     backAction,
  //   );

  //   return () => backHandler.remove(); // Clean up
  // });


  // --- user details getch ---

  const userData = async () => {
    const value = JSON.parse(
      (await AsyncStorage.getItem('loginDetails')) ?? '{}',
    );

    console.log(value);
    setUser(value);
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    if (oldPassword === password) {
      Dialog.show({
        type: ALERT_TYPE.WARNING,
        title: 'Waring',
        textBody: 'The password and old password must be different.',
        button: 'close',
      });

      return;
    }

    const payload = {
      db: dataBase,
      tenant_id: user?.tenant_id,
      user_id: user?.logged_user_id,
      old_password: oldPassword,
      password: password,
    };

    try {
      const response = await axios.post(`${baseUrl}/employee-change-password`, null, {
        params: payload,
      });

      const res = response.data;

      Dialog.show({
        type: ALERT_TYPE.SUCCESS,
        title: 'Success',
        textBody: 'Password Updated successfully!',
        button: 'close',
      });

      setPassword('');
      setOldPassword('');
      setConfirmPassword('');

      navigation.goBack();
      console.log(res)
    } catch (err) {
      Dialog.show({
        type: ALERT_TYPE.WARNING,
        title: 'Warning',
        textBody: 'Please check your current password',
        button: 'close',
      });

      console.error('Error While Fertching employee-change-password', err);
    } finally {

    }
  };

  useEffect(() => {
    userData();
  }, [])

  return (
    <LinearGradient colors={['#061C3F', '#0A5E6A']} style={styles.container}>
      {/* Top Content */}
      <View style={styles.topContent}>
        <Header
          title="Update Password"
          showBack
          customBackAction={() => navigation.navigate('ChangePassword')}
        />

        <View style={styles.content}>
          <Text style={styles.title}>Set Your Password</Text>
          {/* <Text style={styles.subtitle}>Please enter your new password</Text> */}

          {/* Old Password */}
          <Text style={styles.label}>Current Password</Text>
          <View style={styles.inputMainWrapper}>
            <View style={styles.inputWrapper}>
              <Icon name="lock" size={18} color="#B0B0B0" />
              <TextInput
                placeholder="Enter Password"
                placeholderTextColor="#B0B0B0"
                secureTextEntry={!showPassword}
                value={oldPassword}
                onChangeText={setOldPassword}
                style={styles.input}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Icon
                  name={showPassword ? 'eye' : 'eye-slash'}
                  size={18}
                  color="#B0B0B0"
                />
              </TouchableOpacity>
            </View>

            {errors.password && (
              <Text style={styles.errorText}>{errors.password}</Text>
            )}
          </View>

          {/* New Password */}
          <Text style={styles.label}>New Password</Text>
          <View style={styles.inputMainWrapper}>
            <View style={styles.inputWrapper}>
              <Icon name="lock" size={18} color="#B0B0B0" />
              <TextInput
                placeholder="Enter Password"
                placeholderTextColor="#B0B0B0"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                style={styles.input}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Icon
                  name={showPassword ? 'eye' : 'eye-slash'}
                  size={18}
                  color="#B0B0B0"
                />
              </TouchableOpacity>
            </View>

            {errors.password && (
              <Text style={styles.errorText}>{errors.password}</Text>
            )}
          </View>

          {/* Confirm Password */}
          <Text style={styles.label}>Confirm Password</Text>
          <View style={styles.inputWrapper}>
            <Icon name="lock" size={18} color="#B0B0B0" />
            <TextInput
              placeholder="Confirm Password"
              placeholderTextColor="#B0B0B0"
              value={confirmPassword}
              secureTextEntry={!showConfirmPassword}
              onChangeText={setConfirmPassword}
              style={styles.input}
            />
            <TouchableOpacity
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              <Icon
                name={showConfirmPassword ? 'eye' : 'eye-slash'}
                size={18}
                color="#B0B0B0"
              />
            </TouchableOpacity>
          </View>
          {errors.confirmPassword && (
            <Text style={styles.errorText}>{errors.confirmPassword}</Text>
          )}

          {/* Note */}
          <Text style={styles.note}>
            *NOTE: Choose a password that is distinctive & you
            {'\n'}can easily remember.
          </Text>
        </View>
      </View>

      {/* Bottom Button */}
      <TouchableOpacity onPress={handleSubmit} style={styles.button}>
        <Text style={styles.buttonText}>Proceed</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
};

export default Password;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'space-between',
    paddingBottom: 30,
  },
  topContent: {
    marginTop: 50,
  },
  content: {
    marginTop: 10,
  },

  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 20,
  },

  subtitle: {
    fontSize: 16,
    color: '#E0E0E0',
    marginBottom: 40,
  },

  label: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 8,
  },

  inputMainWrapper: {
    marginBottom: 20,
  },

  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 55,
  },

  input: {
    flex: 1,
    marginLeft: 10,
    marginRight: 10,
    fontSize: 16,
    color: '#000',
  },
  errorText: {
    color: 'red',
    marginTop: 4,
    fontSize: 12,
    paddingStart: 10,
  },

  note: {
    fontSize: 14,
    color: '#E0E0E0',
    marginTop: 30,
    lineHeight: 18,
  },

  button: {
    backgroundColor: '#2962FF',
    borderRadius: 12,
    height: 55,
    justifyContent: 'center',
    alignItems: 'center',
  },

  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
