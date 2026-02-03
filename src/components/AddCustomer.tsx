import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import DropDownPicker from 'react-native-dropdown-picker';
import Icon from 'react-native-vector-icons/Ionicons';
import Header from './Header';
import axios from 'axios';
import COMMON from '../comon/Common';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import { ALERT_TYPE, Dialog } from 'react-native-alert-notification';

// Define types
interface FormInputProps {
  label: string;
  error?: string;
  [key: string]: any;
}

interface DropdownItem {
  label: string;
  value: string;
}

interface CustomDropdownProps {
  label: string;
  items: DropdownItem[];
  placeholder: string;
  error?: string;
  onChangeValue: (value: string | null) => void;
}

interface FormState {
  name: string;
  mobile: string;
  email: string;
  branch: string;
  scheme: string;
  agent: string;
  gender: string;
  paymentMode: string;
  amount: string;
  address: string;
  state: string;
  district: string;
  city: string;
  pincode: string;
}

interface FormErrors {
  [key: string]: string | undefined;
}

/* -------------------- Reusable Input -------------------- */
const FormInput: React.FC<FormInputProps> = ({ label, error, ...props }) => (
  <View style={styles.field}>
    <Text style={styles.label}>{label}</Text>

    <TextInput
      placeholderTextColor="rgba(255,255,255,0.5)"
      style={[styles.input, error && { borderColor: 'red', borderWidth: 1 }]}
      {...props}
    />

    {error && <Text style={styles.errorText}>{error}</Text>}
  </View>
);

/* -------------------- Reusable Dropdown -------------------- */
const CustomDropdown: React.FC<CustomDropdownProps> = ({
  label,
  items,
  placeholder,
  error,
  onChangeValue,
}) => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<string | null>(null);
  const [dropdownItems, setDropdownItems] = useState<DropdownItem[]>([]);

  // 🔥 IMPORTANT FIX
  useEffect(() => {
    setDropdownItems(items);
  }, [items]);

  return (
    <View style={{ marginBottom: open ? 150 : 18, zIndex: open ? 1000 : 1 }}>
      <Text style={styles.label}>{label}</Text>

      <DropDownPicker
        open={open}
        value={value}
        items={dropdownItems}
        setOpen={setOpen}
        setValue={(callback) => {
          const v = callback(value);
          setValue(v);
          onChangeValue(v);
        }}
        setItems={setDropdownItems}
        placeholder={placeholder}
        style={[
          styles.dropdown,
          error && { borderColor: 'red', borderWidth: 1 },
        ]}
        dropDownContainerStyle={styles.dropdownContainer}
        textStyle={styles.dropdownText}
        placeholderStyle={styles.placeholder}
        ArrowDownIconComponent={() => (
          <Icon name="chevron-down" size={22} color="#E6F2F5" />
        )}
        ArrowUpIconComponent={() => (
          <Icon name="chevron-up" size={22} color="#E6F2F5" />
        )}
      />

      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};


/* -------------------- Sample Data -------------------- */
const branchData = [
  { label: 'Chennai', value: 'chennai' },
  { label: 'Bangalore', value: 'bangalore' },
  { label: 'Hyderabad', value: 'hyderabad' },
];

const schemeData = [
  { label: 'Gold Scheme', value: 'gold' },
  { label: 'Silver Scheme', value: 'silver' },
  { label: 'Diamond Scheme', value: 'diamond' },
];

const agentData = [
  { label: 'Agent A', value: 'agent_a' },
  { label: 'Agent B', value: 'agent_b' },
  { label: 'Agent C', value: 'agent_c' },
];

const genderData = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
  { label: 'Other', value: 'other' },
];

const paymentModeData = [
  { label: 'Cash', value: 'cash' },
  { label: 'UPI', value: 'upi' },
  { label: 'Card', value: 'card' },
];

/* -------------------- Main Screen -------------------- */
const AddCustomer = () => {
  const [showMore, setShowMore] = useState(false);

  const [form, setForm] = useState<FormState>({
    name: '',
    mobile: '',
    email: '',
    branch: '',
    scheme: '',
    agent: '',
    gender: '',
    paymentMode: '',
    amount: '',
    address: '',
    state: '',
    district: '',
    city: '',
    pincode: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState();
  const [pre, setPre] = useState(1);

  const [mode, setMode] = useState<string>('');
  const [modeTypes, setModeTypes] = useState<any[]>([]);
  const [selectedMode, setSelectedMode] = useState<string>('cash');

  const [branch, setBranch] = useState<any[]>([]);
  const [schemes, setSchemes] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [state, setState] = useState<any[]>([]);
  const [district, setDistrict] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);

  // Cheque / DD
  const [chequeDate, setChequeDate] = useState<Date | null>(null);
  const [chequeNo, setChequeNo] = useState('');
  const [debitBank, setDebitBank] = useState('');
  const [creditBank, setCreditBank] = useState('');
  const [creditBranch, setCreditBranch] = useState('');
  const [showChequePicker, setShowChequePicker] = useState(false);

  // RTGS / CARD
  const [transactionNo, setTransactionNo] = useState('');
  const [transactionDate, setTransactionDate] = useState<Date | null>(null);
  const [showTransactionPicker, setShowTransactionPicker] = useState(false);

  const isChequeOrDD =
    selectedMode === 'cheque' || selectedMode === 'd.d';

  const isRtgsOrCard =
    selectedMode === 'rtgs/neft' || selectedMode === 'card';

  const navigation = useNavigation<any>();

  const baseUrl = COMMON.BaseUrl;
  const dataBase = COMMON.DbName;

  const clearError = (field: string) => {
    if (errors[field]) {
      setErrors({ ...errors, [field]: undefined });
    }
  };

  const validate = (): boolean => {

    const newErrors: FormErrors = {};

    if (!form.name) newErrors.name = 'Customer name is required';
    // Mobile validation
    if (!form.mobile) {
      newErrors.mobile = 'Mobile number is required';
    } else if (!/^[6-9]\d{9}$/.test(form.mobile)) {
      newErrors.mobile = 'Enter a valid 10-digit mobile number';
    }

    // Email validation
    if (!form.email) {
      newErrors.email = 'Email ID is required';
    } else if (
      !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(form.email)
    ) {
      newErrors.email = 'Enter a valid email address';
    }
    if (!form.branch) newErrors.branch = 'Branch is required';
    if (!form.scheme) newErrors.scheme = 'Scheme is required';
    if (!form.agent) newErrors.agent = 'Agent is required';


    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const userData = async () => {
    const value = JSON.parse(
      (await AsyncStorage.getItem('loginDetails')) ?? '{}',
    );

    console.log(value);

    setUser(value);
  };

  const formatDate = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');

    const formatDate = `${year}-${month}-${day}`;
    return formatDate;
  };

  const OnTransactonDateSelect = (event: any, selectedDate?: Date) => {
    setShowTransactionPicker(false);
    if (selectedDate) setTransactionDate(selectedDate);
  };

  const OnChequeDateSelect = (event: any, selectedDate?: Date) => {
    setShowChequePicker(false);
    if (selectedDate) setChequeDate(selectedDate);
  };

  const handleSubmit = async () => {
    setSubmitted(true);
    setIsLoading(true)

    const dateOfJoining = formatDate(Date.now());

    if (validate()) {
      console.log('Form Data:', form);
      const payload = {
        db: dataBase,

        tenant_id: user?.tenant_id,
        branch_id: user?.branch_id,
        scheme_id: form.scheme,

        name: form.name,
        // dob: '1990-05-15',
        gender: form.gender === 'male' ? 1 : form.gender === 'female' ? 2 : '',
        mobile_no: form.mobile,
        email_id: form.email,

        doj: dateOfJoining,

        address_line_1: form.address,
        state_id: form.state,
        district_id: form.district,
        city_id: form.city,
        pincode: form.pincode,

        created_by: user?.role_id,
        status: 1,

        agent_id: form.agent,

        lead_management_id: 10,
      };

      console.log(payload, 'Add Customer Payload');

      try {
        const response = await axios.post(
          `${baseUrl}/mobile-store-customer`,
          payload,
        );

        const res = response.data;

        if (res.status == 'Success') {
          Dialog.show({
            type: ALERT_TYPE.SUCCESS,
            title: 'Success',
            textBody: 'Customer Added Successfully!',
            button: 'Close',
            autoClose: 2000,
          });
          navigation.goBack();
          console.log('Customer Added', res);
        }
      } catch (err) {
        console.error('Error While Fertching feedvack', err);
      } finally {
        setIsLoading(false);
      }
    }
    setIsLoading(false);

  };

  const fetchPaymentModes = async () => {
    const stored = await AsyncStorage.getItem('paymentMode');
    if (!stored) return;

    const parsed = JSON.parse(stored);
    const formatted = parsed.map((i: any) => ({
      label: i.payment_name,
      value: i.payment_type_id,
    }));

    setModeTypes(formatted);
  };

  const fetchBranch = async () => {
    const stored = await AsyncStorage.getItem('branchData');
    if (!stored) return;

    const parsed = JSON.parse(stored);
    const formatted = parsed.map((i: any) => ({
      label: i.branch_name,
      value: i.branch_id,
    }));

    setBranch(formatted);
  };

  const fetchScheme = async () => {
    const stored = await AsyncStorage.getItem('schemes');
    if (!stored) return;

    const parsed = JSON.parse(stored);

    const formatted = parsed.map((i: any) => ({
      label: i.scheme_format,
      value: i.id,
    }));

    setSchemes(formatted);
  };

  const fetchCity = async () => {
    const stored = await AsyncStorage.getItem('cities');
    if (!stored) return;

    const parsed = JSON.parse(stored);

    const formatted = parsed.map((i: any) => ({
      label: i.city_name,
      value: i.city_id,
    }));

    setCities(formatted);
  };

  const fetchState = async () => {
    const stored = await AsyncStorage.getItem('states');
    if (!stored) return;

    const parsed = JSON.parse(stored);

    const formatted = parsed.map((i: any) => ({
      label: i.state_name,
      value: i.state_id,
    }));

    setState(formatted);
  };

  const fetchDistrict = async () => {
    const stored = await AsyncStorage.getItem('district');
    if (!stored) return;

    const parsed = JSON.parse(stored);

    const formatted = parsed.map((i: any) => ({
      label: i.district_name,
      value: i.district_id,
    }));

    setDistrict(formatted);
  };

  const fetchEmployees = async () => {
    const stored = await AsyncStorage.getItem('employees');
    if (!stored) return;

    const parsed = JSON.parse(stored);
    console.log(parsed)

    const formatted = parsed.map((i: any) => ({
      label: i.employee_name,
      value: i.employee_id,
    }));

    setEmployees(formatted);
  };

  useEffect(() => {
    if (!mode || !modeTypes.length) return;

    const matched = modeTypes.find(
      m => m.value === Number(mode),
    );

    setSelectedMode(matched?.label.toLowerCase() || 'cash');
  }, [mode]);

  useEffect(() => {
    userData();
    fetchCity();
    fetchState();
    fetchDistrict();
    fetchScheme();
    fetchEmployees();
    fetchBranch();

    fetchPaymentModes();

  }, []);

  console.log(branch, "Branch from ", pre);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 50 : 0}
    >
      <LinearGradient colors={['#061C3F', '#0A5E6A']} style={styles.gradient}>
        <Header title="Add Customer" showBack={true} />

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <FormInput
            label="Customer Name"
            placeholder="Enter Your Name"
            value={form.name}
            onChangeText={(t: string) => {
              setForm({ ...form, name: t });
              clearError('name');
            }}
            error={submitted && errors.name ? errors.name : undefined}
          />

          <FormInput
            label="Mobile Number"
            placeholder="Enter Your Mobile Number"
            keyboardType="phone-pad"
            value={form.mobile}
            onChangeText={(t: string) => {
              setForm({ ...form, mobile: t });
              clearError('mobile');
            }}
            error={submitted && errors.mobile ? errors.mobile : undefined}
          />

          <FormInput
            label="Email ID"
            placeholder="Enter Your Mail ID"
            keyboardType="email-address"
            value={form.email}
            onChangeText={(t: string) => {
              setForm({ ...form, email: t });
              clearError('email');
            }}
            error={submitted && errors.email ? errors.email : undefined}
          />

          <CustomDropdown
            label="Branch"
            placeholder="Select the Branch"
            items={branch}
            error={submitted && errors.branch ? errors.branch : undefined}
            onChangeValue={(v: string | null) => {
              setForm({ ...form, branch: v || '' });
              clearError('branch');
            }}
          />

          <CustomDropdown
            label="Preferred Schemes"
            placeholder="Select the Scheme"
            items={schemes}
            error={submitted && errors.scheme ? errors.scheme : undefined}
            onChangeValue={(v: string | null) => {
              setForm({ ...form, scheme: v || '' });
              clearError('scheme');
            }}
          />

          <CustomDropdown
            label="Agent"
            placeholder="Select Your Agent"
            items={employees}
            error={submitted && errors.agent ? errors.agent : undefined}
            onChangeValue={(v: string | null) => {
              setForm({ ...form, agent: v || '' });
              clearError('agent');
            }}
          />

          {showMore && (
            <>
              <CustomDropdown
                label="Gender"
                placeholder="Select Gender"
                items={genderData}
                onChangeValue={(v: string | null) => {
                  setForm({ ...form, gender: v || '' });
                  clearError('gender');
                }}
              />

              {/* Payment Mode */}
              {/* {modeTypes && (
                <CustomDropdown
                  label="Payment Mode"
                  placeholder="Select a Mode"
                  value1={mode}
                  items={modeTypes}
                  onChangeValue={(v: string | null) => {
                    if (v !== mode) {
                      setMode(v || '');
                    }
                  }}
                />
              )} */}

              {/* // ================= CHEQUE / D.D ================= */}
              {/* {isChequeOrDD && (
                <>
                  <Text style={[styles.lable, { marginTop: 0 }]}>Cheque Date</Text>

                  {showChequePicker && (
                    <DateTimePicker
                      value={chequeDate || new Date()}
                      mode="date"
                      display="default"
                      onChange={OnChequeDateSelect}
                    />
                  )}
                  <Pressable
                    style={styles.datePickerButtonSmall}
                    onPress={() => setShowChequePicker(true)}
                  >
                    <Icon name="calendar-outline" size={18} color="#fff" />
                    <Text style={styles.datePickerTextSmall}>
                      {chequeDate ? chequeDate.toDateString() : 'Select Date'}
                    </Text>
                  </Pressable>

                  <Text style={styles.lable}>Cheque No</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Cheque No"
                    value={chequeNo}
                    onChangeText={setChequeNo}
                    keyboardType="numeric"
                  />

                  <Text style={styles.lable}>Debit Bank</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Debit Bank"
                    value={debitBank}
                    onChangeText={setDebitBank}
                  />

                  <Text style={styles.lable}>Credit Bank</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Credit Bank"
                    value={creditBank}
                    onChangeText={setCreditBank}
                  />

                  <Text style={styles.lable}>Credit Branch</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Credit Branch"
                    value={creditBranch}
                    onChangeText={setCreditBranch}
                  />
                </>
              )} */}

              {/* // ================= RTGS / NEFT / CARD ================= */}
              {/* {isRtgsOrCard && (
                <>
                  <Text style={[styles.lable, { marginTop: 0 }]}>
                    Transaction No
                  </Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Transaction No"
                    value={transactionNo}
                    onChangeText={setTransactionNo}
                    keyboardType="numeric"
                  />

                  <Text style={styles.lable}>Transaction Date</Text>

                  {showTransactionPicker && (
                    <DateTimePicker
                      value={transactionDate || new Date()}
                      mode="date"
                      display="default"
                      onChange={OnTransactonDateSelect}
                    />
                  )}
                  <Pressable
                    style={styles.datePickerButtonSmall}
                    onPress={() => setShowTransactionPicker(true)}
                  >
                    <Icon name="calendar-outline" size={18} color="#fff" />
                    <Text style={styles.datePickerTextSmall}>
                      {transactionDate
                        ? transactionDate.toDateString()
                        : 'Select Data'}
                    </Text>
                  </Pressable>

                  <Text style={styles.lable}>Credit Bank</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Credit Bank"
                    value={creditBank}
                    onChangeText={setCreditBank}
                  />

                  <Text style={styles.lable}>Credit Branch</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Credit Branch"
                    value={creditBranch}
                    onChangeText={setCreditBranch}
                  />
                </>
              )} */}

              {/* <FormInput
                label="Amount"
                placeholder="Enter Amount"
                value={form.amount}
                keyboardType="numeric"
                onChangeText={(t: string) => {
                  setForm({ ...form, amount: t });
                  clearError('amount');
                }}
              /> */}

              <FormInput
                label="Address"
                placeholder="Enter Your Address"
                value={form.address}
                onChangeText={(t: string) => {
                  setForm({ ...form, address: t });
                  clearError('address');
                }}
              />

              <CustomDropdown
                label="City"
                placeholder="Select the City"
                items={cities}
                error={submitted && errors.scheme ? errors.scheme : undefined}
                onChangeValue={(v: string | null) => {
                  setForm({ ...form, city: v || '' });
                  clearError('city');
                }}
              />

              <CustomDropdown
                label="State"
                placeholder="Select the State"
                items={state}
                error={submitted && errors.scheme ? errors.scheme : undefined}
                onChangeValue={(v: string | null) => {
                  setForm({ ...form, state: v || '' });
                  clearError('state');
                }}
              />

              <CustomDropdown
                label="District"
                placeholder="Select the District"
                items={district}
                error={submitted && errors.scheme ? errors.scheme : undefined}
                onChangeValue={(v: string | null) => {
                  setForm({ ...form, district: v || '' });
                  clearError('district');
                }}
              />

              <FormInput
                label="Pincode"
                placeholder="Enter Pincode"
                keyboardType="numeric"
                value={form.pincode}
                onChangeText={(t: string) => {
                  setForm({ ...form, pincode: t });
                  clearError('pincode');
                }}
              />
            </>
          )}

          <TouchableOpacity
            style={styles.showMoreBtn}
            onPress={() => setShowMore(!showMore)}
          >
            <Text style={styles.showMoreText}>
              {showMore ? 'Show Less' : 'Show More'}
            </Text>
          </TouchableOpacity>
        </ScrollView>

        <TouchableOpacity
          style={styles.addBtn}
          onPress={handleSubmit}
          disabled={isLoading}
          activeOpacity={0.8}
        >
          {isLoading ? (
            <View style={{ flexDirection: 'row' }}>
              <ActivityIndicator size="small" color="#fff" />
              <Text style={[styles.addBtnText, { marginLeft: 3 }]}>
                Adding...
              </Text>
            </View>
          ) : (
            <Text style={styles.addBtnText}>Add Customer</Text>
          )}
        </TouchableOpacity>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
};

export default AddCustomer;

/* -------------------- Styles -------------------- */
const styles = StyleSheet.create({
  gradient: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 30,
  },
  content: {
    padding: 8,
    paddingBottom: 120,
  },
  field: {
    marginBottom: 18,
  },
  label: {
    color: '#E6F2F5',
    fontSize: 14,
    marginBottom: 6,
  },
  input: {
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 18,
    color: '#fff',
    fontSize: 15,
  },
  dropdown: {
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 0,
  },
  dropdownContainer: {
    backgroundColor: '#0A5E6A',
    borderRadius: 15,
    borderWidth: 0,
  },
  dropdownText: {
    color: '#fff',
    fontSize: 15,
  },
  placeholder: {
    color: 'rgba(255,255,255,0.5)',
  },
  showMoreBtn: {
    alignSelf: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#BDEEEF',
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 8,
  },
  showMoreText: {
    color: '#BDEEEF',
    fontSize: 14,
  },
  addBtn: {
    position: 'absolute',
    bottom: 25,
    left: 20,
    right: 20,
    height: 55,
    backgroundColor: '#2D5BFF',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: 'red',
    marginTop: 4,
    fontSize: 12,
  },
  lable: {
    color: '#fff',
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 6,
  },
  // input: {
  //   backgroundColor: 'rgba(255,255,255,0.3)',
  //   padding: 14,
  //   borderRadius: 12,
  //   color: '#fff',
  //   marginBottom: 12,
  // },
  dateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff55',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  dateText: {
    marginLeft: 8,
    color: '#fff',
  },
  datePickerButtonSmall: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    paddingVertical: 16,
    borderRadius: 50,
    backgroundColor: '#ffffff33',
    // marginRight: 8,
  },
  datePickerTextSmall: { marginLeft: 8, color: '#fff', fontSize: 14 },
});
