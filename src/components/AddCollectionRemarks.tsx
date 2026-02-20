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
import { ALERT_TYPE, Dialog } from 'react-native-alert-notification';
import axios from 'axios';
import COMMON from '../comon/Common';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AddCollectionRemarks = () => {
  const [showPicker, setShowPicker] = useState(false);
  const [nextDate, setNextDate] = useState(new Date());
  const [feedback, setFeedback] = useState('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [userData, setUserData] = useState<any>();
  const baseUrl = COMMON.BaseUrl;
  const DbName = COMMON.DbName;

  const navigation = useNavigation();
  const route = useRoute<any>();
  const { data } = route.params;

  const onDateChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowPicker(false);
    if (selectedDate) {
      setNextDate(selectedDate);
    }
  };

  const fetchUserData = async () => {
    const value = JSON.parse(
      (await AsyncStorage.getItem('loginDetails')) ?? '{}',
    );

    console.log(value);
    setUserData(value);
  };

  // --- Format Date ---
 
  const formatDate = (date: any) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');

    const formatDate = `${year}-${month}-${day}`;
    return formatDate;
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    console.log(feedback, 'Feedback', nextDate);
    if (feedback === '' || nextDate == null) {
      Dialog.show({
        type: ALERT_TYPE.WARNING,
        title: 'Remarks Needed',
        textBody: 'Please fill the remark details',
        button: 'Close',
      });
      setIsLoading(false);
      return;
    }

    const remark_date = formatDate(Date.now())

    const payload = {
      db: DbName,
      tenant_id: userData?.tenant_id,
      branch_id: userData?.branch_id,
      customer_id: data?.customer_id,
      employee_id: userData?.employee_id,
      remarks: feedback,
      remark_time: 1,
      remark_date: remark_date,
      next_followup_date: nextDate,
    };

    try {
      const response = await axios.post(`${baseUrl}/store-remarks`, null, {
        params: payload,
      });

      const res = response.data;

      Dialog.show({
        type: ALERT_TYPE.SUCCESS,
        title: 'Success',
        textBody: 'Remarks added successfully!',
        button: 'Close',
      });

      setFeedback('');

      navigation.goBack();

      console.log('Confirmation response', res);
      return;
    } catch (e) {
      console.error('Error Submitting Remarks', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);
  return (
    <LinearGradient colors={['#061C3F', '#0A5E6A']} style={styles.gradient}>
      <Header title="Add Collection Remarks" showBack={true} />

      {/* User Card */}
      <View style={styles.userCard}>
        <View style={styles.profileCircle}>
          <Icon name="person" size={30} color="#666" />
        </View>
        <View>
          <Text style={styles.userName}>{data?.customer_name}</Text>
          <Text style={styles.userPhone}>{data?.mobile_no}</Text>
        </View>
      </View>

      <View style={styles.container}>
        {/* Date Label */}
        <Text style={styles.label}>Next Collection Date</Text>

        {/* Date Input */}
        {/* Date Input */}
        <Pressable style={styles.dateInput} onPress={() => setShowPicker(true)}>
          <Text style={styles.dateText}>{nextDate.toDateString()}</Text>

          {/* Calendar Icon */}
          <Icon name="calendar-outline" size={20} color="#fff" />
        </Pressable>

        {/* Date Picker */}
        {showPicker && (
          <DateTimePicker
            value={nextDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onDateChange}
          />
        )}

        {/* Feedback */}
        <Text style={[styles.label, { marginTop: 20 }]}>
          Collection Remarks
        </Text>

        <TextInput
          style={styles.textArea}
          placeholder="Write feedback..."
          placeholderTextColor="#A9A9A9"
          value={feedback}
          onChangeText={setFeedback}
          multiline
        />

        {/* Submit Button */}
        <TouchableOpacity
          onPress={handleSubmit}
          style={styles.submitBtn}
          disabled={isLoading}
        >
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#fff" />
              <Text style={styles.processingText}>Processing...</Text>
            </View>
          ) : (
            <Text style={styles.submitText}>Submit</Text>
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
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  processingText: {
    textAlign: 'center',
    color: '#fff',
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AddCollectionRemarks;
