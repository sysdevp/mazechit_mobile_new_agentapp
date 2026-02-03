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
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import CustomDropdown from '../custom/CustomDropdown';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental &&
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const LeadReport = () => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [filterModalVisible, setFilterModalVisible] = useState(false);

  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const [leadReports, setLeadReports] = useState<any[]>();
  const [user, setUser] = useState<any[]>([]);

  const [branchData, setBranchData] = useState<any[]>();
  const [branch, setBranch] = useState('');

  const [search, setSearch] = useState('');

  const baseUrl = COMMON.BaseUrl;
  const dataBase = COMMON.DbName;

  const isClearingRef = useRef(false);

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

  // --- Format Date-- -

  const formatDate = (date: any) => {

    if (date == null) return;

    const d = new Date(date);
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');

    const formatDate = `${year}-${month}-${day}`;
    return formatDate;
  };

  // --- user details getch-- -

  const userData = async () => {
    const value = JSON.parse(
      (await AsyncStorage.getItem('loginDetails')) ?? '{}',
    );

    console.log(value);
    setUser(value);
  };

  // --- Branch List-- -

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

  // Filter model 

  const handleFilter = () => {

    fetchLeadReport();
    setFilterModalVisible(false);
  };

  const handleFilterClear = () => {
    isClearingRef.current = true;

    setStartDate(null);
    setEndDate(null);
    setBranch('');
    setFilterModalVisible(false);
  };

  useEffect(() => {
    if (isClearingRef.current && branch === '') {
      fetchLeadReport();
      isClearingRef.current = false;
    }
  }, [branch, startDate, endDate]);


  // --- Api call ---

  const fetchLeadReport = async () => {
    const from_date = formatDate(startDate);
    const to_date = formatDate(endDate);
    const payload = {
      db: dataBase,
      tenant_id: user?.tenant_id,
      branch_id: branch,
      from_date: from_date,
      to_date: to_date,
    };

    try {
      const response = await axios.post(`${baseUrl}/get-lead-report-mobile`, null, {
        params: payload,
      });

      const res = response.data.data;
      setLeadReports(res);
    } catch (err) {
      console.error('Error While Fertching get-lead-report-mobile', err);
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
      if (user?.tenant_id) {
        fetchLeadReport();
      }
    }, [user])
  );

  return (
    <LinearGradient colors={['#061C3F', '#0A5E6A']} style={styles.container}>
      <Header title="Lead Report" showBack />

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
        {leadReports && leadReports.length > 0 ? (
          leadReports
            .filter(item => {
              const text = search.trim().toLowerCase();

              if (!text) return true;

              const nameMatch = item.lead_customer_name
                ?.toLowerCase()
                .includes(text);

              const mobileMatch = item.mobile_no
                ?.toString()
                .includes(text);

              return nameMatch || mobileMatch;
            })
            .map((item, index) => {
              const isExpanded = expandedIndex === index;

              return (
                <Pressable
                  key={index}
                  style={styles.card}
                  onPress={() => toggleExpand(index)}
                >
                  {/* Header */}
                  <View style={styles.headerRow}>
                    <View>
                      <Text style={styles.name}>
                        {item.lead_customer_name || 'N/A'}
                      </Text>
                      <Text style={styles.mobile}>
                        {item.mobile_no || 'N/A'}
                      </Text>
                    </View>

                    <View style={styles.rightSection}>
                      <View style={styles.dateAmountRow}>
                        <Text style={styles.amount}>
                          {item.created_date || 'N/A'}
                        </Text>

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

                  {/* Expanded Area */}
                  {isExpanded && (
                    <View style={styles.expandArea}>
                      <View style={styles.row}>
                        <Text style={styles.label}>Lead Date:</Text>
                        <Text style={styles.value}>
                          {item.created_date || 'N/A'}
                        </Text>
                      </View>

                      <View style={styles.row}>
                        <Text style={styles.label}>Branch:</Text>
                        <Text style={styles.value}>
                          {item.branch_name || 'N/A'}
                        </Text>
                      </View>

                      <View style={styles.row}>
                        <Text style={styles.label}>Status:</Text>
                        <Text style={styles.value}>
                          {item.followup_status || 'N/A'}
                        </Text>
                      </View>

                      <View style={styles.row}>
                        <Text style={styles.label}>Next Followup Date:</Text>
                        <Text style={styles.value}>
                          {item.last_followup_next_date || 'N/A'}
                        </Text>
                      </View>

                      <View style={styles.feedbackBox}>
                        <Text style={styles.label}>Feedback</Text>
                        <Text style={styles.feedbackText}>
                          {item.last_followup_remarks || 'N/A'}
                        </Text>
                      </View>

                      <View style={styles.navButtonContainer}>
                        <TouchableOpacity
                          style={styles.linkBtn}
                          onPress={() =>
                            navigation.navigate('FollowupHistory', { data: item })
                          }
                        >
                          <Icon
                            name="add-circle-outline"
                            size={16}
                            color="#FFE27A"
                          />
                          <Text style={styles.linkText}>
                            Follow-up History
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.linkBtn}
                          onPress={() =>
                            navigation.navigate('NextFollowUp', { data: item })
                          }
                        >
                          <Icon
                            name="navigate-circle-outline"
                            size={16}
                            color="#FFE27A"
                          />
                          <Text style={styles.linkText}>
                            New Follow-up
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </Pressable>
              );
            })
        ) : (
          /* No Data State */
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>No leads found</Text>
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

          {/*BRANCH DROPDOWNS */}

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
            <Pressable
              style={styles.clearButton}
              onPress={handleFilterClear}
            >
              <Text style={styles.clearText}>Clear Filter</Text>
            </Pressable>
            <Pressable
              style={styles.applyButtonNew}
              onPress={handleFilter}
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
  feedbackBox: {
    // backgroundColor: 'rgba(255, 255, 255, 0.08)',
    // padding: 12,
    borderRadius: 10,
    // marginTop: 8,
    marginBottom: 8,
  },

  feedbackLabel: {
    // color: '#FFE27A',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 6,
  },

  feedbackText: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'left',
    paddingTop: 10,
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

export default LeadReport;
