import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Header from './Header';
import { useNavigation, useRoute } from '@react-navigation/native';
import COMMON from '../comon/Common';
import { ALERT_TYPE, Dialog } from 'react-native-alert-notification';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomDropdownBottom from './custom/CustomDropdownBottom';

const OFFLINE_RECEIPTS_KEY = 'offline_receipts';

const BeforeEnrollment = () => {
  const [userData, setUserData] = useState<any>();
  const [isLoading, setIsLoading] = useState(false);

  const [amount, setAmount] = useState('');
  const [mode, setMode] = useState('');
  const [modeTypes, setModeTypes] = useState<any[]>([]);
  const [feedback, setFeedback] = useState('');
  const [status, setStatus] = useState('');
  const [statusList, setStatusList] = useState<any[]>([]);

  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { data } = route.params;

  const baseUrl = COMMON.BaseUrl;
  const DbName = COMMON.DbName;

  console.log(modeTypes[1])

  /* ---------------- OFFLINE SAVE ---------------- */
  const saveOfflineReceipt = async (payload: any) => {
    try {
      const stored = await AsyncStorage.getItem(OFFLINE_RECEIPTS_KEY);
      const receipts = stored ? JSON.parse(stored) : [];

      receipts.push({
        ...payload,
        offline_id: Date.now(),
        data,
      });

      await AsyncStorage.setItem(
        OFFLINE_RECEIPTS_KEY,
        JSON.stringify(receipts),
      );
    } catch (e) {
      console.log('Offline save error', e);
    }
  };

  /* ---------------- FETCH DATA ---------------- */
  const fetchUserData = async () => {
    const value = JSON.parse(
      (await AsyncStorage.getItem('loginDetails')) ?? '{}',
    );
    setUserData(value);
  };

  const fetchStatus = async () => {
    const stored = await AsyncStorage.getItem('status');
    if (!stored) return;

    const parsed = JSON.parse(stored);
    setStatusList(
      parsed.map((item: any) => ({
        label: item.followup_status_name,
        value: item.followup_status_id,
      })),
    );
  };

  const fetchPaymentModes = async () => {
    const stored = await AsyncStorage.getItem('paymentMode');
    if (!stored) return;

    const parsed = JSON.parse(stored);
    setModeTypes(
      parsed.map((item: any) => ({
        label: item.payment_name,
        value: item.payment_type_id,
      })),
    );
  };

  /* ---------------- SUBMIT ---------------- */
  const handleSubmit = async () => {
    if (!amount || !mode || !feedback) {
      Dialog.show({
        type: ALERT_TYPE.WARNING,
        title: 'Missing Details',
        textBody: 'Please fill all fields',
        button: 'Close',
      });
      return;
    }

    const payload = {
      db: DbName,
      tenant_id: userData?.tenant_id,
      branch_id: userData?.branch_id,
      customer_id: data?.customer_id,
      employee_id: userData?.employee_id,
      received_date: Date.now(),
      amount,
      payment_type_id: mode,
      debit_to: null,
      remarks: feedback,
      created_by: userData?.employee_id,
      status: 1,
    };

    setIsLoading(true);

    try {
      await axios.post(
        `${baseUrl}/store-customer-advance-receipt`,
        payload,
      );

      Dialog.show({
        type: ALERT_TYPE.SUCCESS,
        title: 'Success',
        textBody: 'Receipt added successfully',
        button: 'OK',
      });

      navigation.goBack();
    } catch (error) {
      console.log(error)
      await saveOfflineReceipt(payload);

      Dialog.show({
        type: ALERT_TYPE.WARNING,
        title: 'Offline Mode',
        textBody: 'No internet. Receipt saved & will sync on refresh.',
        button: 'OK',
      });

      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
    fetchStatus();
    fetchPaymentModes();
  }, []);

  return (
    <LinearGradient colors={['#061C3F', '#0A5E6A']} style={styles.gradient}>
      <Header title="Before Enrollment Receipt" showBack />

      <View style={styles.profileCard}>
        <View style={styles.profilePic}>
          <Ionicons name="person" size={30} color="#fff" />
        </View>
        <View>
          <Text style={styles.profileName}>{data?.customer_name}</Text>
          <Text style={styles.profileNumber}>{data?.mobile_no}</Text>
        </View>
      </View>

      <Text style={styles.label}>Amount</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter Amount"
        placeholderTextColor="#ccc"
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
      />

      <CustomDropdownBottom
        label="Payment Mode"
        placeholder="Select Mode"
        value1={mode}
        items={modeTypes}
        onChangeValue={(v: string | null) => setMode(v || '')}
      />
{/* 
      <CustomDropdownBottom
        label="Status"
        placeholder="Select Status"
        value1={status}
        items={statusList}
        onChangeValue={(v: string | null) => setStatus(v || '')}
      /> */}

      <Text style={styles.label}>Remarks</Text>
      <TextInput
        style={styles.textArea}
        placeholder="Write remarks..."
        placeholderTextColor="#aaa"
        multiline
        value={feedback}
        onChangeText={setFeedback}
      />

      <TouchableOpacity
        style={styles.submitBtn}
        onPress={handleSubmit}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitText}>Submit</Text>
        )}
      </TouchableOpacity>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 30,
  },

  /* Profile Card */
  profileCard: {
    backgroundColor: '#ffffff33',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    marginBottom: 20,
  },
  profilePic: {
    width: 50,
    height: 50,
    borderRadius: 30,
    backgroundColor: '#ffffff22',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  profileName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  profileNumber: {
    color: '#E9E648',
    marginTop: 2,
  },

  /* Inputs */
  label: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#ffffff45',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 16,
    color: '#fff',
    marginBottom: 20,
  },

  /* Dropdown */
  dropdown: {
    backgroundColor: '#ffffff33',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  dropdownText: {
    color: '#aaa',
  },

  textArea: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1F3A60',
    padding: 12,
    color: '#fff',
    textAlignVertical: 'top',
    minHeight: 120,
    marginBottom: 30,
  },
  /* Submit Button */
  submitBtn: {
    backgroundColor: '#1F6AF3',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  processingText: {
    textAlign: 'center',
    color: '#fff',
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default BeforeEnrollment;
