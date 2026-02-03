import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  BackHandler,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import OTPTextView from 'react-native-otp-textinput';
import Header from './Header';
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import { ALERT_TYPE, Dialog } from 'react-native-alert-notification';

const OtpPage = () => {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(60);
  const navigation = useNavigation<any>();

  const route = useRoute<any>();
  const data = route.params?.data || '';
  const otpInputRef = useRef<any>(null);

  console.log(data)

  // Timer countdown
  useEffect(() => {
    const intervalId = setInterval(() => {
      setTimer(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(intervalId);
  }, []);

  useFocusEffect(() => {
    const backAction = () => {
      // Navigate to ChangePassword when back is pressed
      navigation.navigate('ChangePassword');
      return true; // Prevent default behavior
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => backHandler.remove(); // Clean up
  });

  const handleVerify = async () => {
    if (otp.length !== 4) {
      setError('OTP must be 4 digits');
      return;
    }

    if (otp != data?.otp) {
      otpInputRef.current.clear();
      Dialog.show({
        type: ALERT_TYPE.WARNING,
        title: 'Warning',
        textBody: 'Entered Otp is Wrong. Pleasse try Again',
        button: 'close',
        autoClose: 500,
      });
      return;
    }

    Dialog.show({
      type: ALERT_TYPE.SUCCESS,
      title: 'Success',
      textBody: 'OTP Verified Succesfully!!',
      button: 'close',
    });

    navigation.navigate('ForPassword', {data: data})


    // const payload = {
    //   db: dataBase,
    //   user_id: data?.user_id,
    //   device_primary_id: data?.device_primary_id,
    // };

    // try {
    //   const response = await axios.post(`${baseUrl}/otp-verified`, null, {
    //     params: payload,
    //   });

    //   const res = response.data;

    //   Dialog.show({
    //     type: ALERT_TYPE.SUCCESS,
    //     title: 'Success',
    //     textBody: res.msg || 'OTP verified successfully!!',
    //     button: 'close',
    //     autoClose: 500,
    //   });

    //   navigation.navigate("Login")

    // } catch (err) {
    //   console.error('Error While Fertching otp-verified', err);
    // } finally {
    //   setError('');
    //   setOtp('');
    // }
    // navigation.navigate('Password');
    if (otpInputRef.current) otpInputRef.current.clear();
  };

  const handleResend = () => {
    if (timer === 0) {
      setTimer(60);
      setOtp('');
      navigation.navigate('ChangePassword');
      if (otpInputRef.current) otpInputRef.current.clear();
    }
  };

  return (
    <LinearGradient colors={['#061C3F', '#0A5E6A']} style={styles.container}>
      <Header
        title="OTP Verification"
        showBack
        customBackAction={() => navigation.navigate('ChangePassword')}
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>OTP Verification</Text>
          <Text style={styles.subtitle}>
            Enter the 4-digit code verify the OTP
          </Text>

          <View style={styles.otpWrapper}>
            <OTPTextView
              ref={otpInputRef}
              inputCount={4}
              handleTextChange={text => {
                setOtp(text);
                setError('');
              }}
              keyboardType="numeric"
              tintColor="#BBBBBB"
              offTintColor="#BBBBBB"
              textInputStyle={styles.otpBox}
            />
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <View style={styles.resendContainer}>
            <Text style={styles.resendText}>Didn’t receive code?</Text>
            <TouchableOpacity disabled={timer > 0} onPress={handleResend}>
              <Text
                style={[styles.resendLink, timer > 0 && { color: '#0A5E6A' }]}
              >
                Resend Now
              </Text>
            </TouchableOpacity>
          </View>

          {timer > 0 && <Text style={styles.timerText}>{timer}s</Text>}
        </ScrollView>

        {/* Button fixed at bottom */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={handleVerify}>
            <Text style={styles.buttonText}>Verify</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

export default OtpPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 22,
    paddingTop: 30,
    paddingBottom: 40,
  },
  content: {
    flexGrow: 1,
    alignItems: 'center',
    paddingTop: 80,
  },
  title: { color: '#fff', fontSize: 26, fontWeight: '700', marginBottom: 10 },
  subtitle: { color: '#d3d3d3', fontSize: 14, lineHeight: 20, textAlign: 'center' },
  otpWrapper: { marginTop: 50, alignItems: 'center' },
  otpBox: {
    width: 50,
    height: 50,
    borderBottomWidth: 2,
    borderBottomColor: '#fff',
    fontSize: 22,
    color: '#fff',
    textAlign: 'center',
  },
  errorText: { color: 'red', fontSize: 13, marginTop: 5, textAlign: 'center' },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 30,
  },
  resendText: { color: '#dcdcdc', fontSize: 14 },
  resendLink: {
    color: '#FFD93D',
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 4,
  },
  timerText: {
    textAlign: 'center',
    color: '#FFD93D',
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
  },
  buttonContainer: {
    paddingVertical: 10,
  },
  button: {
    backgroundColor: '#2962FF',
    height: 55,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
});
