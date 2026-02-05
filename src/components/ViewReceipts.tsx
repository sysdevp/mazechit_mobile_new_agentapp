import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Pressable,
  LayoutAnimation,
  Platform,
  UIManager,
  TouchableOpacity,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import Header from './Header';
import Modal from 'react-native-modal';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import COMMON from '../comon/Common';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import HistorySkeleton from './loaders/HistorySkeleton';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental &&
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const data = [
  {
    name: 'Lokesh Kumar',
    mobileNumber: '83928228983',
    emailId: 'abc@gmail.com',
    gender: 'Male',
    dob: '01/12/2025',
    doj: 'Jan 05',
    branch: 'Tree',
    scheme: 'IO343',
    paymentMode: 'UPI',
    amount: '₹10,000',
    address: '123, Example Street',
    state: 'TN',
    city: 'Coimbatore',
    district: 'Coimbatore',
    pincode: '123212',
    status: 'Success',
  },
  {
    name: 'Amit Sharma',
    mobileNumber: '9876543210',
    emailId: 'amit@example.com',
    gender: 'Male',
    dob: '05/10/2024',
    doj: 'Jan 11',
    branch: 'Sunrise',
    scheme: 'AB123',
    paymentMode: 'Bank Transfer',
    amount: '₹2500',
    address: '45 MG Road',
    state: 'KA',
    city: 'Bangalore',
    district: 'Bangalore Urban',
    pincode: '560001',
    status: 'Pending',
  },
  {
    name: 'Priya Singh',
    mobileNumber: '9123456780',
    emailId: 'priya@example.com',
    gender: 'Female',
    dob: '10/04/2023',
    doj: 'Jan 18',
    branch: 'GreenLeaf',
    scheme: 'PL908',
    paymentMode: 'Cash',
    amount: '₹3000',
    address: '78 Gandhi Street',
    state: 'MH',
    city: 'Mumbai',
    district: 'Mumbai Suburban',
    pincode: '400001',
    status: 'Pending',
  },
];

const ViewReceipts = () => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [filterModalVisible, setFilterModalVisible] = useState(false);

  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const [search, setSearch] = useState<string>('');

  const [receipts, setReceipts] = useState<any[]>([]);
  const [user, setUser] = useState<any[]>([]);

  const [branchData, setBranchData] = useState<any[]>();
  const [groupData, setGroupData] = useState<any[]>();

  const [isLoading, setIsLoaading] = useState<boolean>(true);

  const [group, setGroup] = useState('');
  const [branch, setBranch] = useState('');

  const isClearingRef = useRef(false);

  const baseUrl = COMMON.BaseUrl;
  const dataBase = COMMON.DbName;

  const navigation = useNavigation<any>();

  const toggleExpand = (index: number) => {
    LayoutAnimation.configureNext(
      LayoutAnimation.create(
        250,
        LayoutAnimation.Types.easeInEaseOut,
        LayoutAnimation.Properties.opacity,
      ),
    );
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const onChangeStart = (event: any, selectedDate?: Date) => {
    setShowStartPicker(false);
    if (selectedDate) setStartDate(selectedDate);
  };

  const onChangeEnd = (event: any, selectedDate?: Date) => {
    setShowEndPicker(false);
    if (selectedDate) setEndDate(selectedDate);
  };

  const handleFilter = () => {

    fetchReceipts();
    setFilterModalVisible(false);
  };

  const handleFilterClear = () => {
    isClearingRef.current = true;

    setStartDate(null);
    setEndDate(null);
    setGroup('');
    setBranch('');
    setFilterModalVisible(false);
  };

  useEffect(() => {
    if (isClearingRef.current && branch === '' && group === '') {
      fetchReceipts();
      isClearingRef.current = false;
    }
  }, [branch, group, startDate, endDate]);


  // --- Format Date ---

  const formatDate = (date: any) => {
    if (date == null) return null;

    const d = new Date(date);
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');

    const formatDate = `${year}-${month}-${day}`;
    return formatDate;
  };

  // --- Branch details getch ---

  const fetchBranchData = async () => {
    setIsLoaading(true);
    try {
      const storedData = await AsyncStorage.getItem('branchData');

      if (storedData) {
        const parsedData = JSON.parse(storedData);

        const formattedBranches = [
          { label: 'All', value: '' },
          ...parsedData.map((item: any) => ({
            label: item.branch_name,
            value: item.branch_id,
          })),
        ];

        setBranchData(formattedBranches);
      }
    } catch (error) {
      console.log('Error fetching branch data:', error);
    } finally {
      setIsLoaading(false)
    }
  };

  // --- Group details fetch ---

  const fetchGroups = async () => {
    try {
      const storedData = await AsyncStorage.getItem('groups');

      if (storedData) {
        const parsedData = JSON.parse(storedData);

        console.log(parsedData, 'parsedData')
        const formattedBranches = [
          { label: 'All', value: '' },
          ...parsedData.map((item: any) => ({
            label: item.group_name,
            value: item.group_id,
          })),
        ];

        setGroupData(formattedBranches);
      }
    } catch (error) {
      console.log('Error fetching branch data:', error);
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

  const fetchReceipts = async () => {
    const start_date = formatDate(Date.now());
    const end_date = formatDate(Date.now());
    const payload = {
      db: dataBase,
      tenant_id: user?.tenant_id,
      branch_id: branch,
      group_id: group,
      start_date: start_date,
      end_date: end_date,
    };

    try {
      const response = await axios.post(`${baseUrl}/collection-reports`, null, {
        params: payload,
      });

      const res = response.data;
      setReceipts(res);
    } catch (err) {
      console.error('Error While Fertching collection-reports', err);
    } finally {
    }
  };

  useEffect(() => {
    userData();
    fetchBranchData();
    fetchGroups();
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (user?.tenant_id) {
        fetchReceipts();
      }
    }, [user])
  );

  if(isLoading) {
    return <HistorySkeleton />
  }
  return (
    <LinearGradient colors={['#061C3F', '#0A5E6A']} style={styles.container}>
      <Header title="View Receipts" showBack />

      {/* SEARCH + FILTER */}
      <View style={styles.topContainer}>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search"
            placeholderTextColor="#666"
            value={search}
            onChangeText={setSearch}
          />
          {/* <Pressable onPress={() => setFilterModalVisible(true)}>
            <Icon name="filter" size={22} color="#666" />
          </Pressable> */}
        </View>
        {/* <TouchableOpacity style={styles.sync}>
          <MaterialIcons name="sync" color="#fff" size={24} />
        </TouchableOpacity> */}
      </View>

      {/* RECEIPT CARDS */}
      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        {receipts?.length > 0 ? (
          receipts
            .filter(item =>
              item.customer_name
                ?.toLowerCase()
                .includes(search?.toLowerCase()) ||
              item.mobile_no
                ?.toString()
                .toLowerCase()
                .includes(search?.toLowerCase())
            ).map((item, index) => {
          const isExpanded = expandedIndex === index;
          return (
            <Pressable
              key={index}
              style={styles.card}
              onPress={() => toggleExpand(index)}
            // onPress={() => navigation.navigate('ReceiptDetails')}
            >
              <View style={styles.headerRow}>
                <View>
                  <Text style={styles.name}>{item.customer_name}</Text>
                  <Text style={styles.mobile}>{item.mobile_no}</Text>
                </View>

                <View style={styles.rightSection}>
                  <View style={styles.dateAmountRow}>
                    <View>
                      {/* <Text style={styles.date}>{item.receipt_date}</Text> */}
                      <Text style={styles.amount}>₹ {item.received_amount}</Text>
                    </View>
                    <Pressable onPress={() => toggleExpand(index)}>
                      <View>
                        <Icon
                          name={isExpanded ? 'chevron-up' : 'chevron-forward'}
                          size={16}
                          color="#FFD700"
                          style={styles.smallIcon}
                        />
                      </View>
                    </Pressable>
                  </View>
                </View>
              </View>

              {isExpanded && (
                <View style={styles.expandArea}>
                  <View style={styles.row}>
                    <Text style={styles.label}>Customer Code:</Text>
                    <Text style={styles.value}>{item.customer_code || 'N/A'}</Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.label}>Payment Mode:</Text>
                    <Text style={styles.value}>{item.payment_mode || 'N/A'}</Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.label}>Receipt No:</Text>
                    <Text style={styles.value}>{item.receipt_no || 'N/A'}</Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.label}>Receipt Date:</Text>
                    <Text style={styles.value}>{item.receipt_date || 'N/A'}</Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.label}>Receipt Type:</Text>
                    <Text style={styles.value}>{item.receipt_type || 'N/A'}</Text>
                  </View>
                  {/* <View style={styles.row}>
                    <Text style={styles.label}>Group Name:</Text>
                    <Text style={styles.value}>{item.groupname || 'N/A'}</Text>
                  </View> */}

                  {/*
      {renderRow('Group Name:', data.groupname || 'N/A')}
                  
                  {/* <View style={styles.row}>
                    
                    <Text style={styles.label}>Status:</Text>
                    <Text
                      style={[
                        styles.value,
                        {
                          color:
                            item.status === 'Success' ? '#00FF00' : '#F29339',
                        },
                      ]}
                    >
                      
                      {item.status}
                    </Text>
                  </View> */}
                  <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10 }}>
                    <TouchableOpacity
                      onPress={() => navigation.navigate('ReceiptDetails', {data: item})}
                      style={styles.linkBtn}
                    >
                      <Icon
                        name="navigate-circle-outline"
                        color="#FFE27A"
                        size={13}
                      />
                      <Text style={styles.linkText}>View Receipts</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </Pressable>
          );
        })
    ) : (
      <View style={styles.noDataContainer}>
        <Text style={styles.noDataText}>No data found</Text>
      </View>
    )}
  </ScrollView>

      {/* FILTER MODAL */}
      <Modal
        isVisible={filterModalVisible}
        onBackdropPress={() => setFilterModalVisible(false)}
        style={styles.modal}
      >
        <View style={styles.modalContent}>
          {/* CLOSE ICON */}
          <Pressable
            style={styles.closeButton}
            onPress={() => setFilterModalVisible(false)}
          >
            <Icon name="close" size={24} color="#fff" />
          </Pressable>

          <Text style={styles.modalTitle}>Filter</Text>

          {/* DATE RANGE */}
          <Text style={styles.sectionLabel}>Date Range</Text>
          <View style={styles.dateRow}>
            <Pressable
              style={styles.datePickerButtonSmall}
              onPress={() => setShowStartPicker(true)}
            >
              <Icon name="calendar-outline" size={18} color="#fff" />
              <Text style={styles.datePickerTextSmall}>
                {startDate ? startDate.toDateString() : 'Start'}
              </Text>
            </Pressable>
            <Pressable
              style={styles.datePickerButtonSmall}
              onPress={() => setShowEndPicker(true)}
            >
              <Icon name="calendar-outline" size={18} color="#fff" />
              <Text style={styles.datePickerTextSmall}>
                {endDate ? endDate.toDateString() : 'End'}
              </Text>
            </Pressable>
          </View>
          {showStartPicker && (
            <DateTimePicker
              value={startDate || new Date()}
              mode="date"
              display="default"
              onChange={onChangeStart}
            />
          )}
          {showEndPicker && (
            <DateTimePicker
              value={endDate || new Date()}
              mode="date"
              display="default"
              onChange={onChangeEnd}
            />
          )}

          {/* DROPDOWNS */}
          <Text style={styles.sectionLabel}>Sync</Text>
          <Pressable style={styles.dropdown}>
            <Text style={styles.dropdownText}>All</Text>
            <Icon name="chevron-down-outline" size={18} color="#fff" />
          </Pressable>

          <Text style={styles.sectionLabel}>Branch</Text>
          <Pressable style={styles.dropdown}>
            <Text style={styles.dropdownText}>Select Branch</Text>
            <Icon name="chevron-down-outline" size={18} color="#fff" />
          </Pressable>

          <Text style={styles.sectionLabel}>Receive Mode</Text>
          <Pressable style={styles.dropdown}>
            <Text style={styles.dropdownText}>Select Mode</Text>
            <Icon name="chevron-down-outline" size={18} color="#fff" />
          </Pressable>

          {/* BUTTONS */}
          <View style={styles.buttonRow}>
            <Pressable
              style={styles.clearButton}
              onPress={() => console.log('Clear')}
            >
              <Text style={styles.clearText}>Clear Filter</Text>
            </Pressable>
            <Pressable
              style={styles.applyButtonNew}
              onPress={() => {
                console.log('Filter applied', startDate, endDate);
                setFilterModalVisible(false);
              }}
            >
              <Text style={styles.applyText}>Filter</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, paddingTop: 20 },
  searchContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    alignItems: 'center',
    paddingHorizontal: 15,
    marginBottom: 20,
    height: 45,
    width: '100%',
  },
  topContainer: {
    flexDirection: 'row',
    width: '100%',
    // gap: 10,
  },
  searchInput: { flex: 1, color: '#000', fontSize: 14 },
  sync: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff22',
    borderRadius: 12,
    paddingHorizontal: 8,
    marginBottom: 18,
  },
  card: {
    backgroundColor: '#ffffff22',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: { color: '#fff', fontSize: 16, fontWeight: '600' },
  mobile: { color: '#FFD700', fontSize: 14, marginTop: 2 },
  rightSection: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    position: 'relative',
  },
  dateAmountRow: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  date: { color: '#fff', fontSize: 14, textAlign: 'right' },
  amount: { color: '#FFD700', fontSize: 18, fontWeight: '700', marginTop: 2 },
  smallIcon: { marginTop: 4, alignSelf: 'flex-end', opacity: 0.9 },
  expandArea: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#ffffff44',
    paddingTop: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  label: { color: '#ccc', fontSize: 13 },
  value: { color: '#fff', fontSize: 14, fontWeight: '500' },
  modal: { justifyContent: 'flex-end', margin: 0 },
  modalContent: {
    backgroundColor: '#0A5E6A',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  closeButton: { position: 'absolute', top: 15, right: 15 },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    textAlign: 'center',
    color: '#fff',
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  datePickerButtonSmall: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
    backgroundColor: '#ffffff22',
    marginRight: 8,
  },
  datePickerTextSmall: { marginLeft: 8, color: '#fff', fontSize: 14 },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 5,
    color: '#ccc',
  },
  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff22',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  dropdownText: { color: '#fff', fontSize: 14 },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  clearButton: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#fff',
    padding: 12,
    borderRadius: 12,
    marginRight: 8,
    alignItems: 'center',
  },
  clearText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  applyButtonNew: {
    flex: 1,
    backgroundColor: '#235DFF',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  applyText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  // linkText: {
  //   textAlign: 'center',
  //   color: '#FFE27A',
  //   fontWeight: '600',
  //   fontSize: 14,
  //   // paddingRight: 10
  // },

  linkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderColor: '#FFE27A',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 50,
  },

  linkText: {
    color: '#FFE27A',
    fontWeight: '600',
    fontSize: 14,
  },
  noDataContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },

  noDataText: {
    color: '#999',
    fontSize: 14,
  },
});

export default ViewReceipts;
