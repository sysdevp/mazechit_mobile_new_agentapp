import React, { useCallback, useEffect, useState } from 'react';
import {
  BackHandler,
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  TextInput,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {
  RouteProp,
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import Header from './Header';
import Icon from 'react-native-vector-icons/Ionicons';
import Modal from 'react-native-modal';
import DateTimePicker from '@react-native-community/datetimepicker';
import COMMON from '../comon/Common';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

type CollectionRouteParams = {
  from?: string;
};

const ReceiptDetails = () => {
  const navigation = useNavigation<any>();
  const [filterModalVisible, setFilterModalVisible] = useState(false);

  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const router = useRoute<any>();
  const { data } = router.params;

  const [receipts, setReceipts] = useState<any[]>();
  const [user, setUser] = useState();
  const [search, setSearch] = useState<string>('');

  const baseUrl = COMMON.BaseUrl;
  const dataBase = COMMON.DbName;

  const route =
    useRoute<RouteProp<Record<string, CollectionRouteParams>, string>>();
  const from = route.params?.from;

  const onChangeStart = (event: any, selectedDate?: Date) => {
    setShowStartPicker(false);
    if (selectedDate) setStartDate(selectedDate);
  };

  const onChangeEnd = (event: any, selectedDate?: Date) => {
    setShowEndPicker(false);
    if (selectedDate) setEndDate(selectedDate);
  };

  console.log(data)

  // --- user details getch ---

  const userData = async () => {
    const value = JSON.parse(
      (await AsyncStorage.getItem('loginDetails')) ?? '{}',
    );

    console.log(value);
    setUser(value);
  };

  const fetchReceiptDetails = async () => {
    const payload = {
      db: dataBase,
      tenant_id: data?.tenant_id,
      receipt_no: data?.receipt_no
    };

    try {
      const response = await axios.post(`${baseUrl}/receipt-details-new`, null, {
        params: payload,
      });

      const res = response.data;

      setReceipts(Array.isArray(res) ? res : [res]);
    } catch (err) {
      console.error('Error While Fertching receipt-details-new', err);
    } finally {
    }
  };

  useEffect(() => {
    userData();
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (user?.tenant_id) {
        fetchReceiptDetails();
      }
    }, [user])
  );

  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        () => {
          if (from === 'AddCust') {
            navigation.navigate('AddCust');
            return true;
          }
          return false;
        },
      );

      return () => subscription.remove();
    }, [navigation, from]),
  );

  // MULTIPLE CUSTOMER LIST HERE
  const customers = [
    {
      name: 'Alice',
      phone: '9864852486',
      custId: 'CUS-00001',
      gropuName: 'sample group',
      date: '05.01.2001',
      mode: 'Gpay',
      amount: '2000',
      receiptNumber: 'adk-123'
    },
    {
      name: 'Bob',
      phone: '7845122399',
      custId: 'CUS-00001',
      gropuName: 'sample group',
      date: '12.04.1999',
      mode: 'Cash',
      amount: '2000',
      receiptNumber: 'adk-103'
    },
  ];

  const renderRow = (label: string, value: string) => (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );

  // ⬇ A reusable card component for **each customer**
  const renderCustomerCard = (data: any, index: number) => (
    <View key={index} style={styles.card}>
      {/* Header Row */}
      <View style={styles.headerRow}>
        <Text style={styles.headerName}>{data.customer_name}</Text>
        <Text style={styles.headerPhone}>{data.customer_code}</Text>
      </View>

      {/* Details */}
      {renderRow('Mobile Number:', data.mobile_no)}
      {renderRow('Receipt Date:', data.receipt_date)}
      {renderRow('Payment Mode:', data.payemnt_type)}
      {renderRow('Group Name:', data.groupname || 'N/A')}
      {renderRow('Receipt Number:', data.receipt_no)}
      {renderRow('Amount:', `₹ ${data.received_amount}`)}
    </View>
  );

  return (
    <LinearGradient colors={['#061C3F', '#0A5E6A']} style={styles.gradient}>
      <Header title="View Receipts" showBack={true} />

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

      <ScrollView showsVerticalScrollIndicator={false}>
        {receipts?.length > 0 &&
          receipts.filter(item =>
            item.customer_name
              ?.toLowerCase()
              .includes(search?.toLowerCase()) ||
            item.mobile_no
              ?.toString()
              .toLowerCase()
              .includes(search?.toLowerCase())
          ).length > 0 ? (
          receipts
            .filter(item =>
              item.customer_name
                ?.toLowerCase()
                .includes(search?.toLowerCase()) ||
              item.mobile_no
                ?.toString()
                .toLowerCase()
                .includes(search?.toLowerCase())
            )
            .map(renderCustomerCard)
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
  gradient: {
    flex: 1,
    padding: 16,
    paddingTop: 30,
  },
  searchContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    alignItems: 'center',
    paddingHorizontal: 15,
    marginBottom: 20,
    height: 45,
  },
  searchInput: { flex: 1, color: '#000', fontSize: 14 },

  card: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 14,
    padding: 18,
    marginBottom: 20, // spacing between cards
  },

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.15)',
    paddingBottom: 15,
  },

  headerName: {
    color: '#FFD700',
    fontSize: 17,
    fontWeight: '600',
  },

  headerPhone: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },

  row: {
    flexDirection: 'row',
    marginBottom: 8,
  },

  label: {
    width: 140,
    color: '#fff',
    opacity: 0.9,
    fontSize: 14,
  },

  value: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },

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
  noDataContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },

  noDataText: {
    color: '#999',
    fontSize: 14,
  },
});

export default ReceiptDetails;
