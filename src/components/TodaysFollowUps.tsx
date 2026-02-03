import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  UIManager,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import Header from './Header';
import Modal from 'react-native-modal';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import COMMON from '.././comon/Common';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import CustomDropdown from './custom/CustomDropdown';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

const TodaysFollowUps = () => {
  const [filterModalVisible, setFilterModalVisible] = useState(false);

  const [startDate, setStartDate] = useState<Date | null>(null);
  const [showStartPicker, setShowStartPicker] = useState(false);

  const [user, setUser] = useState<any>();
  const [collectionFbReport, setCollectionFbReport] = useState<any[]>([]);
  const [filteredFBReport, setFilteredFBReport] = useState<any[]>([]);
  const [branchData, setBranchData] = useState<any[]>([]);
  const [branch, setBranch] = useState('');
  const [search, setSearch] = useState('');

  const isClearingRef = useRef(false);

  const baseUrl = COMMON.BaseUrl;
  const dataBase = COMMON.DbName;

  /* ---------------- DATE HANDLERS ---------------- */
  const onChangeStart = (_: any, selectedDate?: Date) => {
    setShowStartPicker(false);
    if (selectedDate) setStartDate(selectedDate);
  };

  const formatDate = (date: any) => {
    if (date == null) return null;

    const d = new Date(date);
    return `${d.getFullYear()}-${(d.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
  };

  /* ---------------- USER DATA ---------------- */
  const userData = async () => {
    const value = JSON.parse(
      (await AsyncStorage.getItem('loginDetails')) ?? '{}',
    );
    setUser(value);
  };

  /* ---------------- BRANCH DATA ---------------- */
  const fetchBranchData = async () => {
    const storedData = await AsyncStorage.getItem('branchData');
    if (storedData) {
      const parsed = JSON.parse(storedData);
      setBranchData([
        { label: 'All', value: '' },
        ...parsed.map((b: any) => ({
          label: b.branch_name,
          value: b.branch_id,
        })),
      ]);
    }
  };

  /* ---------------- API CALL ---------------- */
  const fetchCollectionFeedbackReport = async () => {

    // const remark_date = formatDate(Date.now());

    const payload = {
      db: dataBase,
      tenant_id: user?.tenant_id,
      branch_id: branch,
      // created_by: 1,
      // remark_date: remark_date,
    };

    try {
      const res = await axios.post(
        `${baseUrl}/feedback-reports`,
        null,
        { params: payload },
      );

      const today = formatDate(Date.now());

      const filtered = (res.data || []).filter(
        (item: any) => item.next_followup_date === today
      );

      setCollectionFbReport(filtered);

      // setCollectionFbReport(res.data || []);
      setFilteredFBReport(res.data || []);
    } catch (err) {
      console.error('Feedback fetch error', err);
    }
  };

  /* ---------------- FILTER ---------------- */
  const handleFilter = () => {
    let temp = [...collectionFbReport];

    if (search) {
      temp = temp.filter((i: any) =>
        i.customer_name?.toLowerCase().includes(search.toLowerCase()),
      );
    }

    if (branch) {
      temp = temp.filter((i: any) => i.branch_id === branch);
    }

    if (startDate) {
      temp = temp.filter(
        (i: any) =>
          new Date(i.next_followup_date) >= new Date(startDate),
      );
    }

    setFilteredFBReport(temp);
    setFilterModalVisible(false);

    fetchCollectionFeedbackReport();
  };

  const handleClear = () => {
    isClearingRef.current = true;

    setFilteredFBReport(collectionFbReport);
    setBranch('');
    setStartDate(null);
    setFilterModalVisible(false);
  };

  useEffect(() => {
    if (isClearingRef.current && branch === '') {
      fetchCollectionFeedbackReport();
      isClearingRef.current = false;
    }
  }, [branch, startDate]);

  /* ---------------- EFFECTS ---------------- */
  useEffect(() => {
    userData();
    fetchBranchData();
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (user?.tenant_id) fetchCollectionFeedbackReport();
    }, [user]),
  );

  return (
    <LinearGradient colors={['#061C3F', '#0A5E6A']} style={styles.container}>
      <Header title="Todays Followup" showBack />

      {/* SEARCH */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search Customer"
          placeholderTextColor="#666"
          value={search}
          onChangeText={setSearch}
        />
        {/* <Pressable onPress={() => setFilterModalVisible(true)}>
          <Icon name="filter" size={22} color="#666" />
        </Pressable> */}
      </View>

      {/* REPORT LIST */}
      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        {collectionFbReport?.length > 0 ? (
          collectionFbReport.filter(
            item =>
              // item.next_followup_date === formatDate(Date.now()) &&
              item.customer_name
                ?.toLowerCase()
                .includes(search?.toLowerCase())
          ).map((item, index) => (
            <View key={index} style={styles.card}>
              <View style={styles.headerRow}>
                <Text style={styles.name}>{item.customer_name}</Text>

                <View style={styles.dateBadge}>
                  <Icon name="calendar-outline" size={14} color="#FFD700" />
                  <Text style={styles.dateText}>{item.next_followup_date}</Text>
                </View>
              </View>

              <View style={styles.remarksBox}>
                <Text style={styles.label}>Remarks</Text>
                <Text style={styles.remarksText}>
                  {item.remarks || '—'}
                </Text>
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
          <Text style={styles.modalTitle}>Filter</Text>

          <CustomDropdown
            label="Branch"
            placeholder="Select Branch"
            value1={branch}
            items={branchData}
            onChangeValue={v => setBranch(v || '')}
          />

          <Text style={styles.sectionLabel}>Next Follow-up Date</Text>
          <Pressable
            style={styles.datePickerButtonSmall}
            onPress={() => setShowStartPicker(true)}
          >
            <Icon name="calendar-outline" size={18} color="#fff" />
            <Text style={styles.datePickerTextSmall}>
              {startDate ? startDate.toDateString() : 'Select Date'}
            </Text>
          </Pressable>

          {showStartPicker && (
            <DateTimePicker
              value={startDate || new Date()}
              mode="date"
              onChange={onChangeStart}
            />
          )}

          <View style={styles.buttonRow}>
            <Pressable style={styles.clearButton} onPress={handleClear}>
              <Text style={styles.clearText}>Clear</Text>
            </Pressable>

            <Pressable style={styles.applyButtonNew} onPress={handleFilter}>
              <Text style={styles.applyText}>Apply</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    paddingTop: 25,
  },

  /* ---------- SEARCH ---------- */
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

  /* ---------- CARD ---------- */
  card: {
    backgroundColor: '#ffffff22',
    borderRadius: 14,
    padding: 15,
    marginBottom: 12,
  },

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  name: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  /* ---------- DATE BADGE ---------- */
  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff22',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 5,
  },

  dateText: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: '600',
  },

  /* ---------- INFO ROW ---------- */
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },

  label: {
    color: '#ccc',
    fontSize: 13,
  },

  value: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },

  /* ---------- REMARKS ---------- */
  remarksBox: {
    marginTop: 10,
    // backgroundColor: '#ffffff22',
    // padding: 10,
    borderRadius: 10,
  },

  remarksText: {
    color: '#fff',
    fontSize: 14,
    marginTop: 4,
    lineHeight: 18,
  },

  /* ---------- MODAL ---------- */
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },

  modalContent: {
    backgroundColor: '#0A5E6A',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },

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

  datePickerButtonSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#ffffff55',
    marginBottom: 15,
  },

  datePickerTextSmall: {
    marginLeft: 8,
    color: '#fff',
    fontSize: 14,
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

  clearText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },

  applyButtonNew: {
    flex: 1,
    backgroundColor: '#235DFF',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },

  applyText: {
    color: '#fff',
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

export default TodaysFollowUps;
