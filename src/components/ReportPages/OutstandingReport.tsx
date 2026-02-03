import React, { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  TouchableOpacity,
  Image,
  TextInput,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import Header from '../Header';
import Modal from 'react-native-modal';
import DateTimePicker from '@react-native-community/datetimepicker';
import COMMON from '../../comon/Common';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import HistorySkeleton from '../loaders/HistorySkeleton';
import CustomDropdown from '../custom/CustomDropdown';

// Define the navigation type
const OutstandingReport = () => {
  const [filterModalVisible, setFilterModalVisible] = useState(false);

  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const [data, setData] = useState();
  const [outstandingReport, setOutstandingReport] = useState<any[]>([]);
  const [filteredoutstandingReport, setFilteredOutstandingReport] =
    useState<any[]>();

  const [search, setSearch] = useState<string>('');

  const [status, setStatus] = useState('');
  const [branch, setBranch] = useState('');

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [branchData, setBranchData] = useState<any[]>();
  const [groupData, setGroupData] = useState<any[]>();

  const isClearingRef = useRef(false);

  const baseUrl = COMMON.BaseUrl;
  const dataBase = COMMON.DbName;

  const transactions = [
    { name: 'Octavia Devi', ticketNo: 'CUST-2382', amount: 15.89 },
    { name: 'Arjun Mehta', ticketNo: 'CUST-2382', amount: 250.0 },
    { name: 'Priya Sharma', ticketNo: 'CUST-2383', amount: 120.5 },
    { name: 'Lokesh Kumar', ticketNo: 'CUST-2384', amount: 300.0 },
    { name: 'Rohit Singh', ticketNo: 'CUST-2385', amount: 75.25 },
    { name: 'Neha Gupta', ticketNo: 'CUST-2386', amount: 180.0 },
    { name: 'Sonal Verma', ticketNo: 'CUST-2387', amount: 95.75 },
  ];

  const statusData = [
    { label: 'All', value: '' },
    { label: 'Won', value: 'Won' },
    { label: 'In Followup', value: 'In Followup' },
    { label: 'Lost', value: 'Lost' },
  ];

  const onChangeStart = (event: any, selectedDate?: Date) => {
    setShowStartPicker(false);
    if (selectedDate) setStartDate(selectedDate);
  };

  const onChangeEnd = (event: any, selectedDate?: Date) => {
    setShowEndPicker(false);
    if (selectedDate) setEndDate(selectedDate);
  };

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

  const userData = async () => {
    const value = JSON.parse(
      (await AsyncStorage.getItem('loginDetails')) ?? '{}',
    );

    console.log(value);
    setData(value);
  };

  const handleFilter = () => {
    let temp = [...outstandingReport];

    // 🔹 Search (optional – if you want modal filter only)
    if (search) {
      temp = temp.filter(
        item =>
          item.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
          item.customer_mobile_no?.toString().includes(search),
      );
    }

    // 🔹 Status filter
    if (status) {
      temp = temp.filter(item => item.lead_last_followupstatus === status);
    }

    // 🔹 Branch filter
    if (branch) {
      temp = temp.filter(item => item.branch === branch);
    }

    // 🔹 Date range filter
    if (startDate || endDate) {
      temp = temp.filter(item => isWithinDateRange(item.next_followup_date));
    }

    fetchFeedback();
    setFilteredOutstandingReport(temp);
    setFilterModalVisible(false);
  };

  const isWithinDateRange = (dateStr: string) => {
    if (!startDate && !endDate) return true;

    const itemDate = new Date(dateStr);

    if (startDate && itemDate < startDate) return false;
    if (endDate && itemDate > endDate) return false;

    return true;
  };

  const handleFilterClear = () => {
    isClearingRef.current = true;

    setFilteredOutstandingReport(outstandingReport);
    setStartDate(null);
    setEndDate(null);
    setStatus('');
    setBranch('');
    setFilterModalVisible(false);
  };

  useEffect(() => {
    if (isClearingRef.current && branch === '' && status === '') {
      fetchFeedback();
      isClearingRef.current = false;
    }
  }, [branch, status]);

  const fetchFeedback = async () => {
    setIsLoading(true);
    const payload = {
      db: dataBase,
      tenant_id: data?.tenant_id,
      // branch_id: data?.branch_id,
      branch_id: branch,
      group_id: status
    };

    try {
      const response = await axios.post(
        `${baseUrl}/outstanding-reports`,
        null,
        {
          params: payload,
        },
      );

      const res = response.data;
      setOutstandingReport(res);
      setFilteredOutstandingReport(res);
    } catch (err) {
      console.error('Error While Fertching Outstanding reports', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    userData();
    fetchBranchData();
    fetchGroups();
    fetchFeedback();
  }, []);

  console.log(filteredoutstandingReport, "Filtered Outstanding reorts")

  if (isLoading) {
    return <HistorySkeleton />;
  }

  return (
    <LinearGradient colors={['#061C3F', '#0A5E6A']} style={styles.container}>
      <Header title="Outstanding Report" showBack />

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

      <ScrollView showsVerticalScrollIndicator={false}>
        {filteredoutstandingReport?.length > 0 ? (
          filteredoutstandingReport
            .filter(
              item =>
                item.customer_name
                  ?.toLowerCase()
                  .includes(search?.toLowerCase()) ||
                item.customer_mobile_no?.toString().includes(search?.toLowerCase()),  
            )
            .map((item, index) => (
              <View key={index} style={styles.transactionItem}>
                <Image
                  source={{
                    uri: `https://placehold.co/50x50.png?text=${item.customer_name?.slice(
                      0,
                      1,
                    )}`,
                  }}
                  style={styles.avatar}
                />

                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{item.customer_name}</Text>
                  <Text style={styles.date}>{item.customer_code}</Text>
                </View>

                <Text
                  style={[
                    styles.amount,
                    { color: item.total_pending > 0 ? '#7CFF78' : 'red' },
                  ]}
                >
                  ₹ {item.total_pending}
                </Text>
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
          {/* CLOSE ICON */}
          <Pressable
            style={styles.closeButton}
            onPress={() => setFilterModalVisible(false)}
          >
            <Icon name="close" size={24} color="#fff" />
          </Pressable>

          <Text style={styles.modalTitle}>Filter</Text>

          {/* DATE RANGE */}
          {/* <Text style={styles.sectionLabel}>Date Range</Text>
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
          )} */}

          {/* DROPDOWNS */}

          <CustomDropdown
            label="Group"
            placeholder="Select the Branch"
            value1={status}
            items={groupData}
            onChangeValue={(v: string | null) => {
              setStatus(v || '');
            }}
          />

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
            <TouchableOpacity
              style={styles.clearButton}
              onPress={handleFilterClear}
            >
              <Text style={styles.clearText}>Clear Filter</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.applyButtonNew}
              onPress={handleFilter}
            >
              <Text style={styles.applyText}>Filter</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, paddingTop: 25 },
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

  // ---------------- Stats Cards ----------------
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
    gap: 15,
  },
  statCard: {
    width: '37%',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignContent: 'center',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000',
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 5,
    textAlign: 'center',
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
    paddingRight: 25,
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
    backgroundColor: '#ffffff33',
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
    backgroundColor: '#ffffff33',
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
  //   textAlign: 'right',
  //   color: '#FFE27A',
  //   fontWeight: '600',
  //   fontSize: 14,
  //   paddingRight: 25,
  // },
  navButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 5,
  },

  linkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderColor: '#FFE27A',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 50,
  },

  linkText: {
    color: '#FFE27A',
    fontWeight: '600',
    fontSize: 14,
  },
  navButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 5,
    alignItems: 'center',
    paddingTop: 8,
  },
  feedbackBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    padding: 12,
    borderRadius: 10,
    marginTop: 8,
    marginBottom: 8,
  },

  feedbackLabel: {
    color: '#FFE27A',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 6,
  },

  feedbackText: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'left',
  },

  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff22',
    padding: 14,
    borderRadius: 15,
    marginBottom: 10,
  },

  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  date: {
    color: '#E9E648',
    fontSize: 12,
  },

  amount: {
    fontSize: 16,
    fontWeight: '600',
  },
  avatar: { width: 45, height: 45, borderRadius: 30, marginRight: 15 },
  noDataContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },

  noDataText: {
    color: '#999',
    fontSize: 14,
  },
});

export default OutstandingReport;

// return (
//   <LinearGradient colors={['#061C3F', '#0A5E6A']} style={styles.gradient}>
//     <Header title="Outstanding Report" showBack={true} />
// <ScrollView showsVerticalScrollIndicator={false}>
//   {transactions.map((item, index) => (
//     <View key={index} style={styles.transactionItem}>
//       <Image
//         source={{
//           uri: `https://placehold.co/50x50.png?text=${item.name.slice(
//             0,
//             1,
//           )}`,
//         }}
//         style={styles.avatar}
//       />

//       <View style={{ flex: 1 }}>
//         <Text style={styles.name}>{item.name}</Text>
//         <Text style={styles.date}>{item.date}</Text>
//       </View>

//       <Text
//         style={[
//           styles.amount,
//           { color: item.amount > 0 ? '#7CFF78' : 'red' },
//         ]}
//       >
//         {item.amount > 0 ? '+' : ''}
//         {item.amount}
//       </Text>
//     </View>
//   ))}
// </ScrollView>
//   </LinearGradient>
// );
// };

// const styles = StyleSheet.create({
// gradient: {
//   flex: 1,
//   paddingHorizontal: 16,
//   paddingTop: 30,
// },

// transactionItem: {
//   flexDirection: 'row',
//   alignItems: 'center',
//   backgroundColor: '#ffffff22',
//   padding: 14,
//   borderRadius: 15,
//   marginBottom: 10,
// },

// name: {
//   fontSize: 16,
//   fontWeight: '600',
//   color: '#FFFFFF',
// },

// date: {
//   color: '#E9E648',
//   fontSize: 12,
// },

// amount: {
//   fontSize: 16,
//   fontWeight: '600',
// },
// avatar: { width: 45, height: 45, borderRadius: 30, marginRight: 15 },
// });
