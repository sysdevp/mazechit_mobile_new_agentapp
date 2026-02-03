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

const DayClosingReport = () => {
  const [date, setDate] = useState<Date>(new Date());
  const [showDatePicker, setDatePicker] = useState(false);

  const [search, setSearch] = useState<string>('');
  const [openingBalance, setOpeningBalance] = useState<string>('0');
  const [closingBalance, setClosingBalance] = useState<string>('0');

  const [branchData, setBranchData] = useState<any[]>();
  const [branch, setBranch] = useState('1');

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

  const totalDebit = transactions.reduce((sum, t) => sum + t.debit, 0);
  const totalCredit = transactions.reduce((sum, t) => sum + t.credit, 0);

  const onDateChange = (event: any, selectedDate?: Date) => {
    setDatePicker(false);
    if (selectedDate) setDate(selectedDate);
  };

  const [user, setUser] = useState<any[]>();
  const [dayReport, setDayReport] = useState<any[]>();

  const baseUrl = COMMON.BaseUrl;
  const dataBase = COMMON.DbName;

  //  --- Format Date ---

  const formatDate = date => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');

    const formatDate = `${year}-${month}-${day}`;
    return formatDate;
  };

  //  --- user details getch ---

  const userData = async () => {
    const value = JSON.parse(
      (await AsyncStorage.getItem('loginDetails')) ?? '{}',
    );

    console.log(value);
    setUser(value);
  };

  // --- Branch list ---

  const fetchBranchData = async () => {
    try {
      const storedData = await AsyncStorage.getItem('branchData');

      if (storedData) {
        const parsedData = JSON.parse(storedData);

        const formattedBranches = [
          { label: 'All', value: '1' },
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
    };

    try {
      const response = await axios.post(`${baseUrl}/day-book-mobile`, null, {
        params: payload,
      });

      const res = response.data;
      setDayReport(res);
      setOpeningBalance(res.opening_balance)
      setClosingBalance(res.closing_balance)
    } catch (err) {
      console.error('Error While Fertching day-book-mobile', err);
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
      if (user?.branch_id) {
        fetchDayClosing();
      }
    }, [user, branch, date])
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
      </View>

      <View>
        <View style={styles.dateRow}>
          <View
            style={styles.datePickerButtonSmallCotainer}
          >
            <Text style={styles.label}>Date</Text>

            <Pressable
              style={styles.datePickerButtonSmall}
              onPress={() => setDatePicker(true)}
            >
              <Icon name="calendar-outline" size={18} color="#fff" />
              <Text style={styles.datePickerTextSmall}>
                {date ? date.toDateString() : 'Select Date'}
              </Text>
            </Pressable>
          </View>

          {/* BRANCH DROPDOWN */}
          <CustomDropdownBottom
            label="Branch"
            placeholder="Select the Branch"
            value1={branch}
            items={branchData}
            onChangeValue={(v: string | null) => {
              setBranch(v || '');
            }}
          />
        </View>
        {showDatePicker && (
          <DateTimePicker
            value={date || new Date()}
            mode="date"
            display="default"
            onChange={onDateChange}
          />
        )}
      </View>

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
              { title: 'Debit' },
              { title: 'Credit' },
            ].map((col, i) => (
              <View key={i} style={styles.tableCellWrapper}>
                <Text style={styles.tableHeaderText}>{col.title}</Text>
              </View>
            ))}
          </View>

          {/* Rows */}
          {dayReport?.data?.length > 0 ? (
            dayReport?.data
              .filter(item =>
                item.receipt_no
                  ?.toLowerCase()
                  .includes(search?.toLowerCase())
              )
              .map((row, index) => (
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
                ₹ {totalDebit.toLocaleString()}
              </Text>
            </View>
            <View style={styles.tableCellWrapper}>
              <Text style={[styles.tableCell, { fontWeight: '700' }]}>
                ₹ {totalCredit.toLocaleString()}
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
});

export default DayClosingReport;
