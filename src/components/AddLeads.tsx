import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Header from './Header';
import Icon from 'react-native-vector-icons/Ionicons';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { ALERT_TYPE, Dialog } from 'react-native-alert-notification';
import { useNavigation } from '@react-navigation/native';
import COMMON from '../comon/Common';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import CustomDropdownBottom from './custom/CustomDropdownBottom';

const AddLeads = () => {
  /* -------------------- STATES -------------------- */
  const [userId, setUserId] = useState('');
  const [branchId, setBranchId] = useState('');
  const [status, setStatus] = useState('');
  const [leadStatus, setLeadStatus] = useState('');
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [address, setAddress] = useState('');
  const [remarks, setRemarks] = useState('');
  const [modeTypes, setModeTypes] = useState<any[]>([]);

  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation<any>();

  const baseUrl = COMMON.BaseUrl;
  const DbName = COMMON.DbName;

  const [branch, setBranch] = useState<any[]>([]);
  const [statusList, setStatusList] = useState<any[]>([]);

  /* -------------------- DROPDOWN DATA -------------------- */
  const leadStatusList = [
    { key: '1', value: 'Own' },
    { key: '2', value: 'In Follow-Up' },
    { key: '3', value: 'Lost' },
  ];

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

  /* -------------------- DATE FORMATTER -------------------- */
  const formatDate = (date: Date) => ({
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
  });

  const branchList = Array.isArray(branch)
    ? branch.map(item => ({
      key: item.branch_id,
      value: item.branch_name,
    }))
    : [];

  /* -------------------- DATE PICKER -------------------- */
  const onDateChange = (_: DateTimePickerEvent, selectedDate?: Date) => {
    setShowPicker(false);
    if (selectedDate) setDate(selectedDate);
  };

  const userData = async () => {
    const value = JSON.parse(
      (await AsyncStorage.getItem('loginDetails')) ?? '{}',
    );
    setUserId(value?.tenant_id);
  };

  const fetchBranch = async () => {
    const payload = {
      db: DbName,
      tenant_id: userId,
    };

    try {
      const response = await axios.post(`${baseUrl}/mobile-list-branches`, null, {
        params: payload,
      });

      const res = response.data.data;
      setBranch(res);

      console.log('Lead view Branches', res);
      return;
    } catch (error) {
      console.error('Error fetching leads:', error);
    }
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

  /* -------------------- API CALL -------------------- */
  const handleAddLead = async () => {
    const errors: string[] = [];

    if (!name) errors.push('• Name is required');
    if (!mobile) errors.push('• Mobile number is required');
    if (!branchId) errors.push('• Branch is required');
    if (!status) errors.push('• Status is required');
    
    if (errors.length > 0) {
      Dialog.show({
        type: ALERT_TYPE.WARNING,
        title: 'Missing Details',
        textBody: errors.join('\n'),
        button: 'OK',
      });
      return;
    }
    

    setIsLoading(true);

    const payload = {
      db: DbName,
      tenant_id: userId,
      branch_id: branchId,
      employee_id: '1',
      lead_customer_name: name,
      phone_no: '',
      mobile_no: mobile,
      email_id: '',
      address_line_1: address,
      address_line_2: '',
      landmark: '',
      state_id: '',
      district_id: '',
      city_id: '',
      pincode: '',
      followup_date: formatDate(new Date()),
      next_followup_date: formatDate(date),
      remarks: remarks,
      followup_status_type_id: status,
      source_type_id: '1',
      created_by: '1',
      database_name: '',
    };

    console.log(payload);

    try {
      const response = await fetch(`${baseUrl}/mobile-add-lead-management`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      console.log('API Response:', result);

      if (response.ok) {
        Dialog.show({
          type: ALERT_TYPE.SUCCESS,
          title: 'Success',
          textBody: 'Lead Added Successfully',
          button: 'close',
          autoClose: 500,
        });

        navigation.goBack();
      } else {
        Dialog.show({
          type: ALERT_TYPE.DANGER,
          title: 'Error',
          textBody: result?.message || 'Failed to add lead',
          button: 'close',
        });
      }
    } catch (error) {
      console.error(error);
      Dialog.show({
        type: ALERT_TYPE.DANGER,
        title: 'Error',
        textBody: 'Something went wrong',
        button: 'close',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    userData();
    fetchBranch();
    fetchStatus();
    fetchPaymentModes();
  }, []);

  /* -------------------- UI -------------------- */
  return (
    <LinearGradient colors={['#061C3F', '#0A5E6A']} style={styles.gradient}>
      <Header title="Add Leads" showBack />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={80}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View>
              {/* Branch */}
              {/* <Text style={styles.label}>Branch</Text>
              <SelectList
                setSelected={setBranchId}
                data={branchList}
                save="key"
                boxStyles={styles.dropdown}
                dropdownTextStyles={styles.placeholder}
                inputStyles={styles.placeholder}
                arrowicon={<Icon name="chevron-down" size={18} color="#fff" />}
                closeicon={<Icon name="close" size={18} color="#FFF" />}
                searchicon={<Icon name="search" size={18} color="#FFF" />}
              /> */}

              <CustomDropdownBottom
                label="Branch"
                placeholder="Select Branch"
                value1={branchId}
                items={modeTypes}
                onChangeValue={(v: string | null) => setBranchId(v || '')}
              />

              {/* Name */}
              <Text style={styles.label}>Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter Your Name"
                placeholderTextColor="#BFC3C8"
                value={name}
                onChangeText={setName}
              />

              {/* Mobile */}
              <Text style={styles.label}>Mobile Number</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter Mobile Number"
                placeholderTextColor="#BFC3C8"
                keyboardType="number-pad"
                value={mobile}
                onChangeText={setMobile}
              />

              {/* Address */}
              <Text style={styles.label}>Address</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter Address"
                placeholderTextColor="#BFC3C8"
                value={address}
                onChangeText={setAddress}
              />

              {/* Followup Date */}
              <Text style={styles.label}>Next Follow-up Date</Text>
              <Pressable
                style={styles.dateInput}
                onPress={() => setShowPicker(true)}
              >
                <Text style={styles.dateText}>{date.toDateString()}</Text>
                <Icon name="calendar-outline" size={20} color="#fff" />
              </Pressable>

              {/* Remarks */}
              <Text style={styles.label}>Remarks</Text>
              <TextInput
                style={[styles.input, { height: 90, textAlignVertical: 'top' }]}
                multiline
                placeholder="Type your message here..."
                placeholderTextColor="#BFC3C8"
                value={remarks}
                onChangeText={setRemarks}
              />

              {/* Lead Status */}
              {/* <Text style={styles.label}>Lead Status</Text>
              <SelectList
                setSelected={setLeadStatus}
                data={leadStatusList}
                save="key"
                boxStyles={styles.dropdown}
                dropdownTextStyles={styles.placeholder}
                inputStyles={styles.placeholder}
                arrowicon={<Icon name="chevron-down" size={18} color="#fff" />}
                closeicon={<Icon name="close" size={18} color="#FFF" />}
                searchicon={<Icon name="search" size={18} color="#FFF" />}
              /> */}

              <CustomDropdownBottom
                label="Lead Status"
                placeholder="Select Status"
                value1={status}
                items={statusList}
                onChangeValue={(v: string | null) => setStatus(v || '')}
              />

              {/* Submit */}
              <TouchableOpacity
                style={[styles.addBtn, isLoading && styles.disabledBtn]}
                onPress={handleAddLead}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                {isLoading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color="#fff" />
                    <Text style={styles.loadingText}>Submitting...</Text>
                  </View>
                ) : (
                  <Text style={styles.btnText}>Add Lead</Text>
                )}
              </TouchableOpacity>

              {showPicker && (
                <DateTimePicker
                  value={date}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={onDateChange}
                />
              )}
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

export default AddLeads;

/* -------------------- STYLES -------------------- */
const styles = StyleSheet.create({
  gradient: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 30,
  },
  label: {
    color: '#fff',
    marginBottom: 6,
    fontSize: 14,
    fontWeight: '600',
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 14,
    paddingHorizontal: 15,
    marginBottom: 15,
    color: '#fff',
    height: 50,
  },
  dropdown: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 14,
    height: 50,
    // marginBottom: 15,
    alignItems: 'center',
  },
  placeholder: {
    color: '#BFC3C8',
    paddingStart: 10,
  },
  dateInput: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    padding: 14,
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  dateText: {
    color: '#fff',
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
