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
import { useFocusEffect } from '@react-navigation/native';
import COMMON from '../../comon/Common';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import CustomDropdown from '../custom/CustomDropdown';
import Modal from 'react-native-modal';
import DateTimePicker from '@react-native-community/datetimepicker';

const EnrollmentReport = () => {

  const [filterModalVisible, setFilterModalVisible] = useState(false);

  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const [tempStartDate, setTempStartDate] = useState<Date | null>(null);
  const [tempEndDate, setTempEndDate] = useState<Date | null>(null);
  const [tempBranch, setTempBranch] = useState('');
  const [tempGroup, setTempGroup] = useState('');
  const [tempEmployee, setTempEmployee] = useState<any>(null);

  const [search, setSearch] = useState<string>('');

  const [Enrollments, setEnrollements] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);

  const [branchData, setBranchData] = useState<any[]>([]);
  const [employeeData, setEmployeeData] = useState<any[]>([]);
  const [groupData, setGroupData] = useState<any[]>([]);

  const [group, setGroup] = useState('');
  const [branch, setBranch] = useState('');
  const [employee, setEmployee] = useState<any>(null);

  const isClearingRef = useRef(false);

  const baseUrl = COMMON.BaseUrl;
  const dataBase = COMMON.DbName;
  const DbName = COMMON.DbName;

  // --- Format Date ---

  const formatDate = (date: Date | string | number | null) => {
    if (date == null) return null;

    const d = new Date(date);
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');

    const formatDate = `${year}-${month}-${day}`;
    return formatDate;
  };

  const onChangeStart = (event: any, selectedDate?: Date) => {
    setShowStartPicker(false);
    if (selectedDate) setTempStartDate(selectedDate);
  };

  const onChangeEnd = (event: any, selectedDate?: Date) => {
    setShowEndPicker(false);
    if (selectedDate) setTempEndDate(selectedDate);
  };

  const handleFilter = () => {
    setStartDate(tempStartDate);
    setEndDate(tempEndDate);
    setBranch(tempBranch);
    setGroup(tempGroup);
    setEmployee(tempEmployee);
    fetchEnrollementReport({
      nextStartDate: tempStartDate,
      nextEndDate: tempEndDate,
      nextBranch: tempBranch,
      nextGroup: tempGroup,
      nextEmployee: tempEmployee,
    });
    setFilterModalVisible(false);
  };

  const handleFilterClear = () => {
    isClearingRef.current = true;
    setTempStartDate(null);
    setTempEndDate(null);
    setTempBranch('');
    setTempGroup('');
    setTempEmployee(null);

    setStartDate(null);
    setEndDate(null);
    setBranch('');
    setGroup('');
    setEmployee(null);

    fetchEnrollementReport({
      nextStartDate: null,
      nextEndDate: null,
      nextBranch: '',
      nextGroup: '',
      nextEmployee: null,
    });
    setFilterModalVisible(false);
  };

  const fetchBranchData = async () => {
    const payload = {
      db: DbName,
      tenant_id: user?.tenant_id,
      user_id: user?.logged_user_id,
    };
    try {
      const response = await axios.post(
        `${baseUrl}/mobile-list-branches`,
        null,
        {
          params: payload,
        },
      );

      const storedData = JSON.stringify(response.data.data);

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
    const payload = {
      db: DbName,
      tenant_id: user?.tenant_id,
      branch_id: branch,
      user_id: user?.logged_user_id,
    };
    try {
      const response = await axios.post(
        `${baseUrl}/mobile-list-groups`,
        null,
        {
          params: payload,
        },
      );
      const storedData = JSON.stringify(response.data);

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
    try {
      const stored = (await AsyncStorage.getItem('loginDetails')) ?? '{}';
      const employeeStored = (await AsyncStorage.getItem('employeeData')) ?? '[]';
      const branchStored = (await AsyncStorage.getItem('branchData')) ?? '[]';

      const value = stored ? JSON.parse(stored) : {};
      const employeeList = employeeStored ? JSON.parse(employeeStored) : [];
      const branchList = branchStored ? JSON.parse(branchStored) : [];

      setUser(value);

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

  const fetchEnrollementReport = async (opts?: {
    nextStartDate?: Date | null;
    nextEndDate?: Date | null;
    nextBranch?: string;
    nextGroup?: string;
    nextEmployee?: any;
  }) => {
    const nextStart = opts?.nextStartDate ?? startDate;
    const nextEnd = opts?.nextEndDate ?? endDate;
    const nextBranch = opts?.nextBranch ?? branch;
    const nextGroup = opts?.nextGroup ?? group;
    const nextEmployee = opts?.nextEmployee ?? employee;

    const start_date = formatDate(nextStart);
    const end_date = formatDate(nextEnd);
    const payload = {
      db: dataBase,
      tenant_id: user?.tenant_id,
      user_id: user?.logged_user_id,
      branch_id: nextBranch,
      group_id: nextGroup,
      employee_id: nextEmployee,
      start_date: start_date,
      end_date: end_date,
    };

    try {
      const response = await axios.post(`${baseUrl}/enrol-report-mobile`, null, {
        params: payload,
      });

      const res = response.data.data;
      setEnrollements(res);
    } catch (err) {
      console.error('Error While Fertching enrol-report-mobile', err);
    } finally {
    }
  };

  useEffect(() => {
    userData();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchGroups();
    }, [branch])
  );

  useFocusEffect(
    useCallback(() => {
      if (user?.tenant_id) {
        fetchEnrollementReport();
      }
    }, [user])
  );

  return (
    <LinearGradient colors={['#061C3F', '#0A5E6A']} style={styles.gradient}>
      <Header title="Enrollment Report" showBack={true} />

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
            setTempStartDate(startDate);
            setTempEndDate(endDate);
            setTempBranch(branch);
            setTempGroup(group);
            setTempEmployee(employee);
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

          {/* <Text style={styles.sectionLabel}>Date Range</Text> */}
          {/* <View style={styles.dateRow}>
            <Pressable
              style={styles.datePickerButton}
              onPress={() => setShowStartPicker(true)}
            >
              <Icon name="calendar-outline" size={18} color="#fff" />
              <Text style={styles.dateText}>
                {tempStartDate ? tempStartDate.toDateString() : 'Start'}
              </Text>
            </Pressable>

            <Pressable
              style={styles.datePickerButton}
              onPress={() => setShowEndPicker(true)}
            >
              <Icon name="calendar-outline" size={18} color="#fff" />
              <Text style={styles.dateText}>
                {tempEndDate ? tempEndDate.toDateString() : 'End'}
              </Text>
            </Pressable>
          </View> */}

          {/* {showStartPicker && (
            <DateTimePicker
              value={tempStartDate || new Date()}
              mode="date"
              display="default"
              onChange={onChangeStart}
            />
          )}

          {showEndPicker && (
            <DateTimePicker
              value={tempEndDate || new Date()}
              mode="date"
              display="default"
              onChange={onChangeEnd}
            />
          )} */}

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
              value1={tempEmployee}
              items={employeeData}
              onChangeValue={v => setTempEmployee(v || '')}
            />
          )}

          {/* {groupData?.length > 1 && ( */}
            <CustomDropdown
              label="Group"
              placeholder="Select Group"
              value1={tempGroup}
              items={groupData}
              onChangeValue={(v: string | null) => setTempGroup(v || '')}
            />
          {/* )} */}

          <View style={styles.buttonRow}>
            <Pressable style={styles.clearButton} onPress={handleFilterClear}>
              <Text style={styles.clearText}>Clear</Text>
            </Pressable>
            <Pressable style={styles.applyButton} onPress={handleFilter}>
              <Text style={styles.applyText}>Apply</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* AUCTION CARDS */}
      <ScrollView showsVerticalScrollIndicator={false}>
        {Enrollments?.length > 0 ? (
          Enrollments
            .filter((item: any) =>
              item.customer_name
                ?.toLowerCase()
                .includes(search?.toLowerCase()) ||
              item.group_name
                ?.toString()
                .toLowerCase()
                .includes(search?.toLowerCase())
            ).map((item, index) => (
              <View key={index} style={styles.card}>
                <View style={styles.row}>
                  <Text style={styles.label}>Group Name / Ticket:</Text>
                  <Text style={styles.value}>{item.group_name} / {item.ticket_no}</Text>
                </View>

                <View style={styles.row}>
                  <Text style={styles.label}>Customer Name:</Text>
                  <Text style={styles.value}>{item.customer_name}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Referred By:</Text>
                  <Text style={styles.value}>{item.referred_by}</Text>
                </View>
              </View>
            ))
        ) : (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>No data found</Text>
          </View>
        )}
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

  closeButton: { position: 'absolute', right: 15, top: 15, zIndex: 10, },

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
    gap: 10,
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
  dropdown: {
    flex: 1,
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

export default EnrollmentReport;
