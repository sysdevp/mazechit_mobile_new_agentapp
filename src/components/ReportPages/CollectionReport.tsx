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
import Header from '../Header';
import Modal from 'react-native-modal';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import COMMON from '../../comon/Common';
import CustomDropdown from '../custom/CustomDropdown';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental &&
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const data = [
  {
    name: 'Lokesh Kumar',
    mobileNumber: '83928228983',
    custCode: 'CUST-021',
    ReceiptNo: 'REC-09798',
    amount: '8,00,000',
    Mode: 'Online',
  },
  {
    name: 'Priya Sharma',
    mobileNumber: '9876543210',
    custCode: 'CUST-021',
    ReceiptNo: 'REC-09798',
    amount: '36,000',
    Mode: 'UPI',
  },
];

const CollectionReport = () => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [filterModalVisible, setFilterModalVisible] = useState(false);

  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);


  const [search, setSearch] = useState<string>('');

  const [collections, setCollections] = useState<any[]>([]);
  const [user, setUser] = useState<any[]>([]);

  const [branchData, setBranchData] = useState<any[]>();
  const [groupData, setGroupData] = useState<any[]>();

  const [group, setGroup] = useState('');
  const [branch, setBranch] = useState('');

  const isClearingRef = useRef(false);

  const baseUrl = COMMON.BaseUrl;
  const dataBase = COMMON.DbName;
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

    fetchCollectionReport();
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
      fetchCollectionReport();
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

  const fetchCollectionReport = async () => {
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
      const response = await axios.post(`${baseUrl}/collection-reports`, null, {
        params: payload,
      });

      const res = response.data;
      setCollections(res);
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
        fetchCollectionReport();
      }
    }, [user])
  );

  console.log(collections)

  return (
    <LinearGradient colors={['#061C3F', '#0A5E6A']} style={styles.container}>
      <Header
        title="Collection Report" showBack />

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

      {/* RECEIPT CARDS */}
      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        {collections?.length > 0 ? (
          collections
            .filter(item =>
              item.customer_name
                ?.toLowerCase()
                .includes(search?.toLowerCase()) ||
              item.mobile_no
                ?.toString()
                .toLowerCase()
                .includes(search?.toLowerCase())
            )
            .map((item, index) => {
              const isExpanded = expandedIndex === index;

              return (
                <Pressable
                  key={index}
                  style={styles.card}
                  onPress={() => toggleExpand(index)}
                >
                  <View style={styles.headerRow}>
                    <View>
                      <Text style={styles.name}>{item.customer_name}</Text>
                      <Text style={styles.mobile}>{item.mobile_no}</Text>
                    </View>

                    <View style={styles.rightSection}>
                      <View style={styles.dateAmountRow}>
                        <View>
                          <Text style={styles.amount}>{item.customer_code}</Text>
                        </View>

                        <Pressable onPress={() => toggleExpand(index)}>
                          <Icon
                            name={isExpanded ? 'chevron-up' : 'chevron-forward'}
                            size={16}
                            color="#FFD700"
                            style={styles.smallIcon}
                          />
                        </Pressable>
                      </View>
                    </View>
                  </View>

                  {isExpanded && (
                    <View style={styles.expandArea}>
                      <View style={styles.row}>
                        <Text style={styles.label}>Receipt Date:</Text>
                        <Text style={styles.value}>{item.receipt_date}</Text>
                      </View>

                      <View style={styles.row}>
                        <Text style={styles.label}>Receipt No:</Text>
                        <Text style={styles.value}>{item.receipt_no}</Text>
                      </View>

                      <View style={styles.row}>
                        <Text style={styles.label}>Amount:</Text>
                        <Text style={styles.value}>{item.received_amount}</Text>
                      </View>

                      <View style={styles.row}>
                        <Text style={styles.label}>Mode:</Text>
                        <Text style={styles.value}>{item.payment_mode}</Text>
                      </View>

                      {/* <View style={styles.navButtonContainer}>
                        <TouchableOpacity
                          style={styles.linkBtn}
                          onPress={() => navigation.navigate('FollowupHistory', { data: item })}
                        >
                          <Icon
                            name="add-circle-outline"
                            size={16}
                            color="#FFE27A"
                          />
                          <Text style={styles.linkText}>Follow-up History</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.linkBtn}
                          onPress={() => navigation.navigate('NextFollowUp', { data: item })}
                        >
                          <Icon
                            name="navigate-circle-outline"
                            size={16}
                            color="#FFE27A"
                          />
                          <Text style={styles.linkText}>New Follow-up</Text>
                        </TouchableOpacity>
                      </View> */}
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

  searchInput: {
    flex: 1,
    color: '#000',
    fontSize: 14,
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
  date: { color: '#FFF', fontSize: 12, textAlign: 'right' },
  amount: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'right',
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

  applyButton: {
    flex: 1,
    backgroundColor: '#235DFF',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
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

export default CollectionReport;
