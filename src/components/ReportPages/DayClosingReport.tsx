import React, { useCallback, useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  Pressable,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Header from '../Header';
import Icon from 'react-native-vector-icons/Ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';
import COMMON from '../../comon/Common';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native';
import CustomDropdownBottom from '../custom/CustomDropdownBottom';
import Modal from 'react-native-modal';
import CustomDropdown from '../custom/CustomDropdown';

const DayClosingReport = () => {
  const [date, setDate] = useState<Date>(new Date());
  const [showDatePicker, setDatePicker] = useState(false);

  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [tempDate, setTempDate] = useState<Date>(new Date());
  const [tempBranch, setTempBranch] = useState('');

  const [search, setSearch] = useState<string>('');
  const [openingBalance, setOpeningBalance] = useState<string>('0');
  const [closingBalance, setClosingBalance] = useState<string>('0');

  const [totalDebit, setTotalDebit] = useState<string>('0');
  const [totalCredit, setTotalCredit] = useState<string>('0');

  const [branchData, setBranchData] = useState<any[]>([]);
  const [employeeData, setEmployeeData] = useState<any[]>([]);
  const [branch, setBranch] = useState('');
  const [employee, setEmployee] = useState<any>(null);

  const transactions = [
    {
      recNo: 'REC-09798',
      mode: 'Online',
      particulars: 'Payment Received',
      debit: 0,
      credit: 800000,
    },
    {
      recNo: 'REC-09799',
      mode: 'Cash',
      particulars: 'Purchase Materials',
      debit: 150000,
      credit: 0,
    },
    {
      recNo: 'REC-09800',
      mode: 'UPI',
      particulars: 'Misc Expense',
      debit: 20000,
      credit: 0,
    },
  ];

  // const openingBalance = 200000;
  // const closingBalance = 830000;


  const onDateChange = (event: any, selectedDate?: Date) => {
    setDatePicker(false);
    if (selectedDate) setDate(selectedDate);
  };

  const onTempDateChange = (event: any, selectedDate?: Date) => {
    setDatePicker(false);
    if (selectedDate) setTempDate(selectedDate);
  };

  const [user, setUser] = useState<any>(null);
  const [dayReport, setDayReport] = useState<any>(null);

  const baseUrl = COMMON.BaseUrl;
  const dataBase = COMMON.DbName;

  //  --- Format Date ---

  const formatDate = (date: Date | string | number) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');

    const formatDate = `${year}-${month}-${day}`;
    return formatDate;
  };

  //  --- user details getch ---

  // const userData = async () => {
  //   const value = JSON.parse(
  //     (await AsyncStorage.getItem('loginDetails')) ?? '{}',
  //   );

  //   console.log(value);
  //   setUser(value);
  // };

  const userData = async () => {
    try {
      const stored = await AsyncStorage.getItem('loginDetails') ?? '{}';
      const employeeData = await AsyncStorage.getItem('employeeData') ?? '{}';
      const branchData = await AsyncStorage.getItem('branchData') ?? '{}';
      const value = stored ? JSON.parse(stored) : {};

      const branchList = branchData ? JSON.parse(branchData) : [];
      const employeeList = employeeData ? JSON.parse(employeeData) : [];

      setUser(value);

      console.log(employeeList, "employeeList", branchList, "branchList", value);

      setBranchData([
        { label: 'All', value: '' },
        ...branchList.map((b: any) => ({
          label: b.branch_name,
          value: b.branch_id,
        })),
      ]);

      setEmployeeData([
        { label: 'All', value: '' },
        ...employeeList.map((e: any) => ({
          label: `${e.first_name} - ${e.last_name}`,
          value: e.employee_id,
        })),
      ]);

    } catch (err) {
      console.error('Error parsing loginDetails', err);
    }
  };

  // --- Branch list ---

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

  // --- Api call ---

  const fetchDayClosing = async () => {
    const account_date = formatDate(date);
    const payload = {
      db: dataBase,
      branch_id: branch,
      account_date: account_date,
      // account_date: "2026-01-13",
      user_id: user?.logged_user_id,
      employee_id: employee,
    };

    try {
      const response = await axios.post(`${baseUrl}/day-book-mobile`, null, {
        params: payload,
      });

      const res = response.data;
      const totalDebit = res.data.reduce((sum: number, t: any) => {
        if (t.type === 'debit') {
          const amount = Number(t.payment_amount ?? t.amount ?? 0);
          return sum + amount;
        }
        return sum;
      }, 0);

      const totalCredit = res.data.reduce((sum: number, t: any) => {
        if (t.type === 'credit') {
          const amount = Number(t.amount ?? 0);
          return sum + amount;
        }
        return sum;
      }, 0);

      setDayReport(res);
      setTotalDebit(totalDebit);
      setTotalCredit(totalCredit);
      setOpeningBalance(res.opening_balance)
      setClosingBalance(res.closing_balance)
    } catch (err) {
      console.error('Error While Fertching day-book-mobile', err);
      setTotalDebit('0');
      setTotalCredit('0');
      setOpeningBalance('0')
      setClosingBalance('0')
    } finally {
    }
  };

  // --- Api function call ---

  useEffect(() => {
    userData();
    fetchBranchData();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchDayClosing();
    }, [user])
  );

  return (
    <LinearGradient colors={['#061C3F', '#0A5E6A']} style={styles.gradient}>
      <Header title="Day Closing Report" showBack={true} />

      {/* SEARCH + FILTER */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search"
          placeholderTextColor="#666"
          value={search}
          onChangeText={setSearch}
        />
        <Pressable
          onPress={() => {
            setTempDate(date);
            setTempBranch(branch);
            setEmployee(employee);
            setFilterModalVisible(true);
          }}
        >
          <Icon name="filter" size={22} color="#666" />
        </Pressable>
      </View>

      {/* FILTER MODAL */}
      <Modal
        isVisible={filterModalVisible}
        onBackdropPress={() => setFilterModalVisible(false)}
        style={styles.modal}
      >
        <View style={styles.modalContent}>
          <Pressable
            style={styles.closeButton}
            onPress={() => setFilterModalVisible(false)}
            hitSlop={{ top: 15, bottom: 15, left: 20, right: 20 }}
          >
            <Icon name="close" size={24} color="#fff" />
          </Pressable>

          <Text style={styles.modalTitle}>Filter</Text>

          <Text style={styles.sectionLabel}>Date</Text>
          <View style={styles.dateRow}>
            <Pressable
              style={styles.datePickerButton}
              onPress={() => setDatePicker(true)}
            >
              <Icon name="calendar-outline" size={18} color="#fff" />
              <Text style={styles.dateText}>
                {tempDate ? tempDate.toDateString() : 'Select Date'}
              </Text>
            </Pressable>
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={tempDate || new Date()}
              mode="date"
              display="default"
              onChange={onTempDateChange}
            />
          )}

          {branchData?.length > 1 && (
            <CustomDropdown
              label="Branch"
              placeholder="Select the Branch"
              value1={tempBranch}
              items={branchData}
              onChangeValue={(v: string | null) => setTempBranch(v || '')}
            />
          )}

          {employeeData?.length > 1 && (
            <CustomDropdown
              label="Employee"
              placeholder="Select Employee"
              value1={employee}
              items={employeeData}
              onChangeValue={(v: string | null) => setEmployee(v || '')}
            />
          )}

          <View style={styles.buttonRow}>
            <Pressable
              style={styles.clearButton}
              onPress={() => {
                const defaultDate = new Date();
                setTempDate(defaultDate);
                setTempBranch('');
                setDate(defaultDate);
                setBranch('');
                setEmployee('');
                setFilterModalVisible(false);
              }}
            >
              <Text style={styles.clearText}>Clear</Text>
            </Pressable>

            <Pressable
              style={styles.applyButton}
              onPress={() => {
                setDate(tempDate);
                setBranch(tempBranch);
                setEmployee(employee);
                setFilterModalVisible(false);
              }}
            >
              <Text style={styles.applyText}>Filter</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Opening Balance */}
        <View style={styles.balanceBox}>
          <Text style={styles.balanceLabel}>Opening Balance</Text>
          <Text style={styles.balanceValue}>
            ₹ {openingBalance.toLocaleString()}
          </Text>
        </View>

        {/* Table */}
        <View style={styles.tableCard}>
          {/* Header */}
          <View style={styles.tableHeader}>
            {[
              { title: 'Rec No' },
              { title: 'Mode' },
              { title: 'Particulars' },
              { title: 'Credit' },
              { title: 'Debit' },
            ].map((col, i) => (
              <View key={i} style={styles.tableCellWrapper}>
                <Text style={styles.tableHeaderText}>{col.title}</Text>
              </View>
            ))}
          </View>

          {/* Rows */}
          {dayReport?.data?.length > 0 ? (
            dayReport?.data
              .filter((item: any) =>
                item.receipt_no
                  ?.toLowerCase()
                  .includes(search?.toLowerCase())
              )
              .map((row: any, index: number) => (
                <View key={index} style={styles.tableRow}>
                  <View style={styles.tableCellWrapper}>
                    <Text style={styles.tableCell}>{row.receipt_no}</Text>
                  </View>

                  <View style={styles.tableCellWrapper}>
                    <Text style={styles.tableCell}>{row.payment_type}</Text>
                  </View>

                  <View style={styles.tableCellWrapper}>
                    <Text style={styles.tableCell}>
                      {row.receipt_passbook_mode}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.tableCellWrapper,
                      { alignItems: 'flex-end', paddingRight: 10 },
                    ]}
                  >
                    <Text
                      style={[
                        styles.tableCell,
                        { textAlign: row.type === 'credit' ? 'center' : 'right' },
                      ]}
                    >
                      {row.type === 'credit' ? ` ₹ ${row.amount?.toLocaleString()}` : '-'}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.tableCellWrapper,
                      { alignItems: 'flex-end', paddingRight: 10 },
                    ]}
                  >
                    <Text
                      style={[
                        styles.tableCell,
                        { textAlign: row.type !== 'credit' ? 'center' : 'right' },
                      ]}
                    >
                      {row.type !== 'credit' ? ` ₹ ${row.payment_amount?.toLocaleString()}` : '-'}
                      {/* ₹ {row.amount?.toLocaleString()} */}
                    </Text>
                  </View>
                </View>
              ))
          ) : (
            <View style={styles.noDataContainer}>
              <Text style={styles.noDataText}>No data found</Text>
            </View>
          )}


          {/* Total Row */}
          <View
            style={[
              styles.tableRow,
              { borderTopWidth: 1, borderColor: '#555' },
            ]}
          >
            <View style={styles.tableCellWrapper}>
              <Text style={[styles.tableCell, { fontWeight: '700' }]}>
                Total
              </Text>
            </View>
            <View style={styles.tableCellWrapper}>
              <Text style={styles.tableCell}></Text>
            </View>
            <View style={styles.tableCellWrapper}>
              <Text style={styles.tableCell}></Text>
            </View>
            <View style={styles.tableCellWrapper}>
              <Text style={[styles.tableCell, { fontWeight: '700' }]}>
                ₹ {totalCredit.toLocaleString()}
              </Text>
            </View>
            <View style={styles.tableCellWrapper}>
              <Text style={[styles.tableCell, { fontWeight: '700' }]}>
                ₹ {totalDebit.toLocaleString()}
              </Text>
            </View>
          </View>
        </View>

        {/* Closing Balance */}
        <View style={styles.balanceBox}>
          <Text style={styles.balanceLabel}>Closing Balance</Text>
          <Text style={styles.balanceValue}>
            ₹ {closingBalance.toLocaleString()}
          </Text>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: { flex: 1, paddingHorizontal: 16, paddingTop: 30 },
  searchContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    alignItems: 'center',
    paddingHorizontal: 15,
    marginBottom: 20,
    height: 45,
  },

  searchInput: {
    flex: 1,
    color: '#000',
    fontSize: 14,
  },
  modal: { justifyContent: 'flex-end', margin: 0 },
  modalContent: {
    backgroundColor: '#0A5E6A',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  closeButton: { position: 'absolute', top: 15, right: 15, zIndex: 10 },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    textAlign: 'center',
    color: '#fff',
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 5,
    color: '#ccc',
  },
  balanceBox: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    padding: 12,
    borderRadius: 12,
    marginTop: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  balanceLabel: { color: '#fff', fontWeight: '600', fontSize: 16 },
  balanceValue: { color: '#7CFF78', fontWeight: '700', fontSize: 16 },
  tableCard: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    marginTop: 15,
    paddingBottom: 10,
  },
  tableHeaderText: {
    color: '#E9E648',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 5,
    borderBottomWidth: 0.6,
    borderColor: '#555',
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 5,
    borderBottomWidth: 0.4,
    borderColor: '#555',
  },
  tableCellWrapper: { width: '20%', alignItems: 'center' },
  tableCell: { color: '#fff', fontSize: 14, textAlign: 'center' },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff33',
    padding: 10,
    borderRadius: 12,
    flex: 1,
  },
  dateText: { color: '#fff', marginLeft: 8 },
  datePickerButtonSmall: {
    // flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    paddingVertical: 15,
    borderRadius: 12,
    backgroundColor: '#ffffff44',
    marginRight: 8,
  },
  datePickerButtonSmallCotainer: {
    flex: 1,
    // flexDirection: 'row',
    // alignItems: 'center',
    // padding: 10,
    borderRadius: 12,
    // backgroundColor: '#ffffff33',
    marginRight: 8,
  },
  datePickerTextSmall: { marginLeft: 8, color: '#fff', fontSize: 14 },
  dropdown: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff33',
    borderRadius: 12,
    padding: 12,
  },
  dropdownText: { color: '#fff', fontSize: 14 },
  noDataContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },

  noDataText: {
    color: '#999',
    fontSize: 14,
  },
  label: {
    color: '#E6F2F5',
    fontSize: 14,
    marginBottom: 6,
  },
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
  applyButton: {
    flex: 1,
    backgroundColor: '#235DFF',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  applyText: { color: '#fff', fontWeight: '600', fontSize: 14 },
});

export default DayClosingReport;
