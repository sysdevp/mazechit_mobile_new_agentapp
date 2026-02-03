import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  TextInput,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Header from '../Header';
import Icon from 'react-native-vector-icons/Ionicons';
import Modal from 'react-native-modal';
import DateTimePicker from '@react-native-community/datetimepicker';
import COMMON from '../../comon/Common';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native';
import CustomDropdown from '../custom/CustomDropdown';

const auctionData = [
  {
    date: '2026-01-07',
    group: 'GRP-12 / TCKT-018',
    customer: 'Lokesh Kumar',
    chitValue: '8,00,000',
    biddingAmount: '7,85,000',
    prizedAmount: '15,000',
  },
  {
    date: '2026-01-07',
    group: 'GRP-09 / TCKT-010',
    customer: 'Priya Sharma',
    chitValue: '5,00,000',
    biddingAmount: '4,70,000',
    prizedAmount: '30,000',
  },
];

const Payment = () => {
  const [filterModalVisible, setFilterModalVisible] = useState(false);

  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const [search, setSearch] = useState<string>('');

  const [payments, setPayments] = useState<any[]>([]);
  const [user, setUser] = useState<any[]>([]);

  const [branchData, setBranchData] = useState<any[]>();
  const [groupData, setGroupData] = useState<any[]>();

  const [group, setGroup] = useState('');
  const [branch, setBranch] = useState('');

  const isClearingRef = useRef(false);

  const baseUrl = COMMON.BaseUrl;
  const dataBase = COMMON.DbName;

  const onChangeStart = (event: any, selectedDate?: Date) => {
    setShowStartPicker(false);
    if (selectedDate) setStartDate(selectedDate);
  };

  const onChangeEnd = (event: any, selectedDate?: Date) => {
    setShowEndPicker(false);
    if (selectedDate) setEndDate(selectedDate);
  };

  const handleFilter = () => {
    // let temp = [...auctions];

    // // 🔹 Search (optional – if you want modal filter only)
    // if (search) {
    //   temp = temp.filter(
    //     item =>
    //       item.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
    //       item.customer_mobile_no?.toString().includes(search),
    //   );
    // }

    // // 🔹 Status filter
    // if (group) {
    //   temp = temp.filter(item => item.lead_last_followupstatus === group);
    // }

    // // 🔹 Branch filter
    // if (branch) {
    //   temp = temp.filter(item => item.branch === branch);
    // }

    // // 🔹 Date range filter
    // if (startDate || endDate) {
    //   temp = temp.filter(item => isWithinDateRange(item.next_followup_date));
    // }

    fetchAuctionReport();
    setFilterModalVisible(false);
  };

  // const isWithinDateRange = (dateStr: string) => {
  //   if (!startDate && !endDate) return true;

  //   const itemDate = new Date(dateStr);

  //   if (startDate && itemDate < startDate) return false;
  //   if (endDate && itemDate > endDate) return false;

  //   return true;
  // };

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
      fetchAuctionReport();
      isClearingRef.current = false;
    }
  }, [branch, group, startDate, endDate]);


  // --- Format Date ---

  const formatDate = date => {
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
    }
  };

  // --- Group details getch ---

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

  const fetchAuctionReport = async () => {
    const start_date = formatDate(startDate);
    const end_date = formatDate(endDate);
    const payload = {
      db: dataBase,
      tenant_id: user?.tenant_id,
      branch_id: branch,
      group_id: group,
      start_date: start_date,
      end_date: end_date,
    };

    try {
      const response = await axios.post(`${baseUrl}/payment-report-mobile`, null, {
        params: payload,
      });

      const res = response.data.data;
      setPayments(res);
    } catch (err) {
      console.error('Error While Fertching payment-details', err);
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
        fetchAuctionReport();
      }
    }, [user])
  );

  console.log(payments)
  return (
    <LinearGradient colors={['#061C3F', '#0A5E6A']} style={styles.gradient}>
      <Header title="Payment Report" showBack />

      {/* SEARCH + FILTER */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search"
          placeholderTextColor="#666"
          value={search}
          onChangeText={setSearch}
        />
        <Pressable onPress={() => setFilterModalVisible(true)}>
          <Icon name="filter" size={22} color="#666" />
        </Pressable>
      </View>

      {/* AUCTION CARDS */}
      <ScrollView showsVerticalScrollIndicator={false}>
        {payments?.length > 0 ? (
          payments.filter(
            item =>
              item.customer_name
                ?.toLowerCase()
                .includes(search?.toLowerCase()) ||
              item.group_name?.toString().includes(search?.toLowerCase()) ||
              item.payment_mode?.toString().includes(search?.toLowerCase()),
          ).map((item, index) => (
            <View key={index} style={styles.card}>
              <View style={styles.row}>
                <Text style={styles.label}>Date:</Text>
                <Text style={styles.value}>{item.payment_date}</Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.label}>Group Name / Ticket:</Text>
                <Text style={styles.value}>{item.group_name} / {item.ticket_no}</Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.label}>Customer Name:</Text>
                <Text style={styles.value}>{item.customer_name}</Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.label}>Prized Amount:</Text>
                <Text style={[styles.value, { color: '#7CF5A6' }]}>
                  ₹ {item.amount}
                </Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.label}>Mode:</Text>
                <Text style={[styles.value, { color: '#FFCF5C' }]}>{item.payment_mode}</Text>
              </View>

            </View>
          ))
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
          {/* CLOSE BUTTON */}
          <Pressable
            style={styles.closeButton}
            onPress={() => setFilterModalVisible(false)}
            hitSlop={{ top: 15, bottom: 15, left: 20, right: 20 }}
          >
            <Icon name="close" size={24} color="#fff" />
          </Pressable>

          <Text style={styles.modalTitle}>Filter</Text>

          {/* DATE RANGE */}
          <Text style={styles.sectionLabel}>Date Range</Text>
          <View style={styles.dateRow}>
            <Pressable
              style={styles.datePickerButton}
              onPress={() => setShowStartPicker(true)}
            >
              <Icon name="calendar-outline" size={18} color="#fff" />
              <Text style={styles.dateText}>
                {startDate ? startDate.toDateString() : 'Start'}
              </Text>
            </Pressable>

            <Pressable
              style={styles.datePickerButton}
              onPress={() => setShowEndPicker(true)}
            >
              <Icon name="calendar-outline" size={18} color="#fff" />
              <Text style={styles.dateText}>
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

          {/* GROPU DROPDOWN */}
          <CustomDropdown
            label="Group"
            placeholder="Select the Branch"
            value1={group}
            items={groupData}
            onChangeValue={(v: string | null) => {
              setGroup(v || '');
            }}
          />

          {/* BRANCH DROPDOWN */}
          <CustomDropdown
            label="Branch"
            placeholder="Select the Branch"
            value1={branch}
            items={branchData}
            onChangeValue={(v: string | null) => {
              setBranch(v || '');
            }}
          />

          {/* BUTTONS */}
          <View style={styles.buttonRow}>
            <Pressable style={styles.clearButton}
              onPress={handleFilterClear}>
              <Text style={styles.clearText}>Clear</Text>
            </Pressable>

            <Pressable
              style={styles.applyButton}
              onPress={handleFilter}
            >
              <Text style={styles.applyText}>Apply</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: { flex: 1, paddingHorizontal: 16, paddingTop: 30 },

  searchContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 20,
    height: 45,
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    color: '#000',
    fontSize: 14,
  },

  card: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: { color: '#A9C1D9', fontSize: 14, fontWeight: '600' },
  value: { color: '#fff', fontSize: 15, fontWeight: '700' },

  modal: { justifyContent: 'flex-end', margin: 0 },
  modalContent: {
    backgroundColor: '#0A5E6A',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },

  closeButton: { position: 'absolute', right: 15, top: 15 },

  modalTitle: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 15,
  },

  sectionLabel: { color: '#ccc', marginBottom: 5, fontSize: 12 },

  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff33',
    padding: 10,
    borderRadius: 12,
    flex: 1,
    marginRight: 10,
  },

  dateText: { color: '#fff', marginLeft: 8 },

  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff33',
    padding: 12,
    borderRadius: 10,
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
    borderWidth: 1,
    borderColor: '#fff',
    padding: 12,
    borderRadius: 12,
    marginRight: 10,
    alignItems: 'center',
  },
  clearText: { color: '#fff', fontWeight: '600' },

  applyButton: {
    flex: 1,
    backgroundColor: '#235DFF',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  applyText: { color: '#fff', fontWeight: '600' },
  noDataContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },

  noDataText: {
    color: '#999',
    fontSize: 14,
  },
});

export default Payment;
