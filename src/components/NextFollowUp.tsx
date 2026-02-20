import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Pressable,
  Platform,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Header from './Header';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';
import COMMON from '../comon/Common';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ALERT_TYPE, Dialog } from 'react-native-alert-notification';
import axios from 'axios';
import CustomDropdownBottom from './custom/CustomDropdownBottom';

const NextFollowUp = () => {
  const [showPicker, setShowPicker] = useState(false);
  const [nextDate, setNextDate] = useState<Date | null>(null);
  const [feedback, setFeedback] = useState('');
  const [status, setStatus] = useState<any>();
  const [leadStatus1, setLeadStatus] = useState<any[]>([]);
  const [user, setUser] = useState<any>();

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const baseUrl = COMMON.BaseUrl;
  const dataBase = COMMON.DbName;

  const navigation = useNavigation<any>();

  const route = useRoute<any>();
  const { data } = route.params;

  const leadStatus = [
    { label: 'Won', value: 1 },
    { label: 'In Followup', value: 2 },
    { label: 'Lost', value: 3 },
  ];

  const onDateChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowPicker(false);
    if (selectedDate) {
      setNextDate(selectedDate);
    }
  };

  // --- user details getch ---

  const userData = async () => {
    const value = JSON.parse(
      (await AsyncStorage.getItem('loginDetails')) ?? '{}',
    );

    console.log(value);
    setUser(value);
  };

    // --- Status List ---

    const fetchStatus = async () => {
      try {
        const storedData = await AsyncStorage.getItem('status');
  
        if (storedData) {
          const parsedData = JSON.parse(storedData);
  
          console.log(parsedData, 'parsedData')
          const formattedBranches = [
            // { label: 'All', value: '' },
            ...parsedData.map((item: any) => ({
              label: item.followup_status_name,
              value: item.followup_status_id,
            })),
          ];
  
          setLeadStatus(formattedBranches);
        }
      } catch (error) {
        console.log('Error fetching status data:', error);
      }
    };

  const formatDate = (date: any) => {

    if (date == null) return;

    const d = new Date(date);
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');

    const formatDate = `${year}-${month}-${day}`;
    return formatDate;
  };

  const handleNextFollowUp = async () => {
    setIsLoading(true);

    const followup_date = formatDate(Date.now());
    const next_followup_date = formatDate(nextDate);
    const payload = {
      db: dataBase,
      tenant_id: user?.tenant_id,
      branch_id: user?.branch_id,
      created_by: user?.role_id,
      lead_management_id: data?.lead_id,
      employee_id: user?.employee_id,
      followup_date: followup_date,
      next_followup_date: next_followup_date,
      followup_status_type_id: status,
      remarks: feedback,
    }

    try {
      const response = await axios.post(`${baseUrl}/store-followup-mobile`, null, {
        params: payload,
      });

      const res = response.data;
      if (res.status === 'Success') {
        Dialog.show({
          type: ALERT_TYPE.SUCCESS,
          title: 'Success',
          textBody: res.msg || "Next Followup added successfully!! ",
          button: 'close',
          autoClose: 500,
        });

        navigation.goBack();
        return;
      }
      if (res.status === 'Error') {
        Dialog.show({
          type: ALERT_TYPE.DANGER,
          title: 'Success',
          textBody: res.msg || "Error While Adding Next Followup. Please Try Again",
          button: 'close',
          autoClose: 500,
        });
        return;
      }
    } catch (err) {
      console.error('Error While Fertching store-followup-mobile', err);
    } finally {
      setIsLoading(false);
    }

  }

  useEffect(() => {
    userData();
    fetchStatus()
  }, [])

  return (
    <LinearGradient colors={['#061C3F', '#0A5E6A']} style={styles.gradient}>
      <Header title="Next Follow-Up" showBack={true} />

      {/* User Card */}
      <View style={styles.userCard}>
        <View style={styles.profileCircle}>
          <Icon name="person" size={30} color="#666" />
        </View>
        <View>
          <Text style={styles.userName}>{data?.lead_customer_name}</Text>
          <Text style={styles.userPhone}>{data?.mobile_no}</Text>
        </View>
      </View>

      <View style={styles.container}>
        {/* Feedback */}
        <Text style={styles.label}>Feedback</Text>

        <TextInput
          style={styles.textArea}
          placeholder="Write feedback..."
          placeholderTextColor="#A9A9A9"
          value={feedback}
          onChangeText={setFeedback}
          multiline
        />

        {/* Date Label */}
        <Text style={[styles.label, { marginTop: 20 }]}>
          Next Follow-up Date
        </Text>

        {/* Date Input */}
        <Pressable style={styles.dateInput} onPress={() => setShowPicker(true)}>
          <Text style={styles.dateText}>
            {nextDate ? nextDate.toDateString() : 'Select Date'}
          </Text>

          {/* Calendar Icon */}
          <Icon name="calendar-outline" size={20} color="#fff" />
        </Pressable>

        {/* Date Picker */}
        {showPicker && (
          <DateTimePicker
            value={nextDate || new Date()}
            mode="date"
            display="default"
            onChange={onDateChange}
          />
        )}

        <CustomDropdownBottom
          label="Staus"
          placeholder="Select Status"
          value1={status}
          items={leadStatus1}
          onChangeValue={(v: string | null) => {
            setStatus(v || '');
          }}
        />

        {/* Submit Button */}

        <TouchableOpacity
          style={[styles.addBtn, isLoading && styles.disabledBtn]}
          onPress={handleNextFollowUp}
          disabled={isLoading}
          activeOpacity={0.8}
        >
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#fff" />
              <Text style={styles.loadingText}>Submitting...</Text>
            </View>
          ) : (
            <Text style={styles.btnText}>Submit</Text>
          )}
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 30,
  },

  container: {
    marginTop: 20,
  },

  userCard: {
    backgroundColor: '#ffffff33',
    padding: 16,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },

  profileCircle: {
    width: 45,
    height: 45,
    borderRadius: 50,
    backgroundColor: '#EEE',
    justifyContent: 'center',
    alignItems: 'center',
  },

  userName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },

  userPhone: {
    color: '#E9E648',
    fontSize: 14,
    marginTop: 2,
  },

  label: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },

  dateInput: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },

  dateText: {
    color: '#fff',
    fontSize: 15,
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
  },

  dropdown: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 14,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownText: { color: '#aaa', fontSize: 14 },

  submitBtn: {
    backgroundColor: '#2F56F6',
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 30,
  },

  submitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  addBtn: {
    marginTop: 30,
    backgroundColor: '#2F56F6',
    borderRadius: 14,
    alignItems: 'center',
    paddingVertical: 16,
    marginBottom: 40,
  },
  btnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },

  disabledBtn: {
    opacity: 0.7,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    marginLeft: 10,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default NextFollowUp;
