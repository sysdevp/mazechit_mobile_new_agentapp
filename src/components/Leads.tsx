import React, { useCallback, useEffect, useState } from 'react';
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
  RefreshControl,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import Header from './Header';
import Modal from 'react-native-modal';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import COMMON from '../comon/Common';
import CustomDropdown from './custom/CustomDropdown';
import ListHeaderSkeleton from './loaders/ListHeaderSkeleton';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental &&
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const LEADS_CACHE_KEY = 'cached_leads';

const Leads = () => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [filterModalVisible, setFilterModalVisible] = useState(false);

  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const [search, setSearch] = useState<string>('');
  const [leads, setLeads] = useState<any[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<any[]>([]);

  const [userId, setUserId] = useState('');
  const [status, setStatus] = useState('');
  const [branch, setBranch] = useState('');

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [branchData, setBranchData] = useState<any[]>();

  const [leadStatus, setLeadStatus] = useState<any[]>([]);

  const [refreshing, setRefreshing] = useState(false);

  const baseUrl = COMMON.BaseUrl;
  const DbName = COMMON.DbName;

  const navigation = useNavigation<any>();

  const fetchStatus = async () => {
    try {
      const storedData = await AsyncStorage.getItem('status');

      if (storedData) {
        const parsedData = JSON.parse(storedData);

        console.log(parsedData, 'parsedData')
        const formattedBranches = [
          { label: 'All', value: '' },
          ...parsedData.map((item: any) => ({
            label: item.followup_status_name,
            value: item.followup_status_name,
          })),
        ];

        setLeadStatus(formattedBranches);
      }
    } catch (error) {
      console.log('Error fetching status data:', error);
    }
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

  const isWithinDateRange = (dateStr: string) => {
    if (!startDate && !endDate) return true;

    const itemDate = new Date(dateStr);

    if (startDate && itemDate < startDate) return false;
    if (endDate && itemDate > endDate) return false;

    return true;
  };

  const handleFilter = () => {
    let temp = [...leads];

    // 🔹 Search (optional – if you want modal filter only)
    if (search) {
      temp = temp.filter(
        item =>
          item.lead_customer_name
            ?.toLowerCase()
            .includes(search.toLowerCase()) ||
          item.mobile_no?.toString().includes(search),
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

    setFilteredLeads(temp);
    setFilterModalVisible(false);
  };

  const handleFilterClear = () => {
    setFilteredLeads(leads);
    setStartDate(null);
    setEndDate(null);
    setStatus('');
    setBranch('');
    setFilterModalVisible(false);
  };

  const userData = async () => {
    const value = JSON.parse(
      (await AsyncStorage.getItem('loginDetails')) ?? '{}',
    );
    setUserId(value?.tenant_id);
  };

  const fetchLeads = async () => {
    setIsLoading(true);

    const payload = {
      db: DbName,
      tenant_id: userId,
    };

    try {
      const response = await axios.post(
        `${baseUrl}/mobile-list-leads`,
        null,
        { params: payload }
      );

      const res = response.data || [];

      // ✅ Save API data to cache
      await AsyncStorage.setItem(
        LEADS_CACHE_KEY,
        JSON.stringify(res)
      );

      setLeads(res);
      setFilteredLeads(res);

      console.log('Lead view response (API)', res);
    } catch (error) {
      console.log('API failed, loading from cache...', error);

      // 🔁 Load cached data if API fails
      const cachedData = await AsyncStorage.getItem(LEADS_CACHE_KEY);

      if (cachedData) {
        const parsedCache = JSON.parse(cachedData);
        setLeads(parsedCache);
        setFilteredLeads(parsedCache);

        console.log('Loaded leads from cache');
      } else {
        console.log('No cached data available');
        setLeads([]);
        setFilteredLeads([]);
      }
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };


  const loadCachedLeads = async () => {
    const cachedData = await AsyncStorage.getItem(LEADS_CACHE_KEY);
    if (cachedData) {
      const parsed = JSON.parse(cachedData);
      setLeads(parsed);
      setFilteredLeads(parsed);
    }
  };

  useEffect(() => {
    userData();
    fetchStatus();
    fetchBranchData();
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (userId) {
        loadCachedLeads();
        fetchLeads();
      }
    }, [userId]),
  );

  // ---------------- Refresh Handler ----------------
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadCachedLeads();
    fetchLeads();
  }, []);

  if (isLoading) {
    return <ListHeaderSkeleton />;
  }

  return (
    <LinearGradient colors={['#061C3F', '#0A5E6A']} style={styles.container}>
      <Header
        title="Leads"
        rightButton={
          <Pressable
            onPress={() => navigation.navigate('AddLeads')}
            android_ripple={{ color: 'rgba(255,255,255,0.15)' }}
            style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
          >
            <Feather name="plus-circle" size={24} color="#fff" />
          </Pressable>
        }
      />

      {/* <View style={styles.statsRow}>
        {statsData.map((item, idx) => (
          <View
            key={idx}
            style={[styles.statCard, { backgroundColor: item.bg }]}
          >
            <View>
              <Text style={styles.statLabel}>{item.label}</Text>
              <Text style={styles.statValue}>{item.amount}</Text>
            </View>
          </View>
        ))}
      </View> */}

      {/* SEARCH + FILTER */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search"
          value={search}
          onChangeText={setSearch}
          placeholderTextColor="#666"
        />
        <Pressable onPress={() => setFilterModalVisible(true)}>
          <Icon name="filter" size={22} color="#666" />
        </Pressable>
      </View>

      {/* RECEIPT CARDS */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#00E0FF']}   // Android
            tintColor="#fff"      // iOS
          />
        }
      >
        {/* <ScrollView contentContainerStyle={{ paddingBottom: 20 }}> */}
        {filteredLeads.length > 0 &&
          filteredLeads
            .filter(
              item =>
                item.lead_customer_name
                  ?.toLowerCase()
                  .includes(search?.toLowerCase()) ||
                item.mobile_no?.toString().includes(search?.toLowerCase()),
            )
            .map((item, index) => {
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
                      <Text style={styles.name}>{item.lead_customer_name}</Text>
                      <Text style={styles.mobile}>{item.mobile_no}</Text>
                    </View>

                    <View style={styles.rightSection}>
                      <View style={styles.dateAmountRow}>
                        <View>
                          <Text style={styles.date}>Next Followup</Text>
                          <Text style={styles.amount}>
                            {item.next_followup_date}
                          </Text>
                        </View>
                        <Pressable onPress={() => toggleExpand(index)}>
                          <View>
                            <Icon
                              name={
                                isExpanded ? 'chevron-up' : 'chevron-forward'
                              }
                              size={16}
                              color="#FFF"
                              style={styles.smallIcon}
                            />
                          </View>
                        </Pressable>
                      </View>
                    </View>
                  </View>

                  {isExpanded && (
                    <View style={styles.expandArea}>
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                        }}
                      >
                        <View style={styles.row}>
                          <Text style={styles.label}>Followed On:</Text>
                          <Text style={styles.value}>{item.last_followup}</Text>
                        </View>

                        <View style={styles.row}>
                          <Text style={styles.label}>Lead Status:</Text>
                          <Text style={styles.value}>
                            {item.lead_last_followupstatus}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.feedbackBox}>
                        <Text style={styles.feedbackLabel}>Feedback</Text>
                        <Text style={styles.feedbackText}>
                          {item.feedback || 'N/A'}
                        </Text>
                      </View>

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
                      <View style={styles.navButtonContainer}>
                        {/* <View style={styles.buttonRow}>
                      <Pressable
                        onPress={() => navigation.navigate('NextFollowUp')}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        style={styles.navButtons}
                      >
                        <Icon
                          name="add-circle-outline"
                          color="#FFE27A"
                          size={13}
                        />
                        <Text style={styles.linkText}>Follow-Up</Text>
                      </Pressable>
                    </View>
                    <View style={styles.buttonRow}>
                      <Pressable
                        onPress={() => navigation.navigate('FollowupHistory')}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        style={styles.navButtons}
                      >
                        <Icon
                          name="navigate-circle-outline"
                          color="#FFE27A"
                          size={13}
                        />
                        <Text style={styles.linkText}>History</Text>
                      </Pressable>
                    </View> */}

                        <View>
                          <TouchableOpacity
                            style={styles.linkBtn}
                            onPress={() => navigation.navigate('NextFollowUp', { data: item })}
                          >
                            <Icon name="add" size={16} color="#FFE27A" />
                            <Text style={styles.linkText}>Follow-Up</Text>
                          </TouchableOpacity>
                        </View>
                        <View>
                          <TouchableOpacity
                            style={styles.linkBtn}
                            onPress={() =>
                              navigation.navigate('FollowupHistory', { data: item })
                            }
                          >
                            <Icon
                              name="analytics-sharp"
                              size={16}
                              color="#FFE27A"
                            />
                            <Text style={styles.linkText}>History</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  )}
                </Pressable>
              );
            })}
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

          <CustomDropdown
            label="Staus"
            placeholder="Select the Branch"
            value1={status}
            items={leadStatus}
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
    fontSize: 17,
    fontWeight: '700',
    marginTop: 2,
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
    // justifyContent: 'space-between',
    marginBottom: 6,
    paddingRight: 25,
    gap: 10,
  },

  row1: {
    flexDirection: 'row',
    gap: 10,
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
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 50,
    backgroundColor: '#061C3F33',
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
    marginTop: 8,
    marginBottom: 8,
  },

  feedbackLabel: {
    color: '#ccc',
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
});

export default Leads;
