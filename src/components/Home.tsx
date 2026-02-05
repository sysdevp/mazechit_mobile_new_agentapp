import React, { useCallback, useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  TouchableOpacity,
  Modal,
  TextInput,
  RefreshControl,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Header from './Header';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
type RootStackParamList = {
  AddLeads: undefined;
  ViewReceipts: undefined;
  Settlement: undefined;
  // Add other screens as needed
};

// Define the navigation type
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import COMMON from '../comon/Common';
import Stack from './Stack';
import DashboardSkeleton from './loaders/DashboardSkeleton';
import Geolocation from '@react-native-community/geolocation';
import { ALERT_TYPE, Dialog } from 'react-native-alert-notification';

const OFFLINE_RECEIPTS_KEY = 'offline_receipts';

const IncomeCards = ({ incomeCardsData }: { incomeCardsData: any }) => {
  const navigation = useNavigation();
  return (
    <View style={styles.cardsWrapper}>
      {incomeCardsData.map((item: any) => (
        <TouchableOpacity
          key={item.id}
          style={[styles.card,
          item.isLeft === true ? { borderRightColor: item.color, borderRightWidth: 5, } : { borderLeftColor: item.color, borderLeftWidth: 5, }]}
          onPress={() => navigation.navigate(item.route)}
        >
          <View style={styles.iconContainer}>
            <Ionicons name={item.icon} size={28} color="#9C8FD9" />
            {/* <Ionicons name={item.icon} size={28} color="#E9E648" /> */}
          </View>

          <View style={styles.textContainer}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.amountText}>{item.amount}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const AttendanceListCards = ({ attendanceListData }: { attendanceListData: any }) => {
  return (
    <View style={styles.attcardsWrapper}>
      {attendanceListData.map((item: any) => (
        <Pressable
          key={item.id}
          style={[styles.attcard, { borderTopColor: item.color, borderColor: '#ffffff33', borderTopWidth: 5 }]}
          activeOpacity={0.8}
        >
          <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons name={item.icon} size={28} color={item.color} />
              {/* <Ionicons name={item.icon} size={28} color="#E9E648" /> */}
            </View>

            <View>
              <Text style={styles.attcount}>
                {item.count} <Text style={{ fontSize: 14 }}>Day(s)</Text>
              </Text>

              <Text style={styles.atttitle}>{item.title}</Text>
            </View>
          </View>
        </Pressable>
      ))}
    </View>
  );
};

const Home = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [_attendanceStatus, setAttendanceStatus] = useState<
    null | 'present' | 'absent'
  >(null);

  const [attendanceStatusStored, setAttendanceStatusStored] = useState<string>('');

  const [pre, setPre] = useState<number>(0)
  const [_preSet, setPreset] = useState<number>(0)

  const [activeTab, _setActiveTab] = useState<'stack' | 'balance'>('balance');

  const baseUrl = COMMON.BaseUrl;
  const DbName = COMMON.DbName;

  const [_branch, setBranch] = useState<any[]>([]);
  const [incomeCardsData, setIncomeCardsData] = useState<any[]>([]);
  const [attendanceListData, setAttendanceListData] = useState<any[]>([]);
  const [collectionChart, setCollectionChart] = useState<any[]>([]);
  const [maxValue, setMaxValue] = useState('');
  const [Unsynced, setUnsynced] = useState(0);
  const [userId, setUserId] = useState('');
  const [user, setUser] = useState();
  const [userName, setUserName] = useState('');
  const [tenantId, setTenantId] = useState<number>();

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [cashInHand, setCashInHand] = useState<string>();

  const [isAttendanceMarked, setIsAttendanceMarked] = useState(0);

  const [isLocation, setIsLocation] = useState<boolean>(false);

  const [notifications, setNotifications] = useState<any[]>([])

  const [refreshing, setRefreshing] = useState(false);

  // ========== Attendance Status Fetch ==========
  const attendanceStatusFetch = async () => {
    try {
      const TWELVE_HOURS = 12 * 60 * 60 * 1000;
      const value = await AsyncStorage.getItem('attendanceStatus');

      if (!value) {
        setAttendanceStatusStored('');
        return;
      }

      const parsed = JSON.parse(value);

      if (!parsed?.savedAt || !parsed?.status) {
        await AsyncStorage.removeItem('attendanceStatus');
        setAttendanceStatusStored('');
        return;
      }

      const now = Date.now();

      if (now - parsed.savedAt > TWELVE_HOURS) {
        await AsyncStorage.removeItem('attendanceStatus');
        setAttendanceStatusStored('');
        return;
      }

      setAttendanceStatusStored(parsed.status);
    } catch (error) {
      console.log('attendanceStatusFetch error:', error);
      await AsyncStorage.removeItem('attendanceStatus');
      setAttendanceStatusStored('');
    }
  };

  // ========== User Details ==========

  const userData = async () => {
    const value = JSON.parse(
      (await AsyncStorage.getItem('loginDetails')) ?? '{}',
    );

    console.log(value);
    setUser(value);
    setUserName(value?.logged_user_name)
    setUserId(value?.logged_user_id);
    setTenantId(value?.tenant_id);
  };

  // ========== Dashboard Details ==========

  const fetchDashboard = async () => {
    setIsLoading(true);

    const payload = {
      db: DbName,
      tenant_id: tenantId,
      user_id: userId,
    };

    const DASHBOARD_CACHE_KEY = `dashboard_cache_${userId}`;

    try {
      const response = await axios.post(
        `${baseUrl}/mobile-employee-dashboard`,
        null,
        { params: payload }
      );

      const res = response.data.data[0];

      // 🔹 Save raw data to cache
      await AsyncStorage.setItem(
        DASHBOARD_CACHE_KEY,
        JSON.stringify(res)
      );

      // 🔹 Prepare + set UI data
      prepareDashboardData(res);

      console.log('Dashboard API Data', res);

      setPreset((pre: any) => pre + 1)

    } catch (error) {
      console.log('API failed — trying cache');
      setNotifications([...notifications, { id: notifications.length, title: `You're Offline Please check the internet connection...` }])

      try {
        const cached = await AsyncStorage.getItem(DASHBOARD_CACHE_KEY);

        if (cached) {
          const res = JSON.parse(cached);
          prepareDashboardData(res);
          console.log('Loaded Dashboard from cache', res);
        } else {
          console.log('No cached dashboard data');
        }

      } catch (cacheError) {
        console.error('Cache read error:', cacheError);
      }

    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  // ========== Dashboard Cache Details ==========

  const prepareDashboardData = (res: any) => {

    const cardConfig: any = {
      'Todays Collections': {
        route: 'ViewReceipts',
        icon: 'cash',
        color: '#FF8C42',
        isLeft: false,
      },
      'Receipts Generated': {
        route: 'ViewReceipts',
        icon: 'receipt-outline',
        color: '#4F6EF7',
        isLeft: true,
      },
      'Todays Followup': {
        route: 'todaysFollowUps',
        icon: 'people-outline',
        color: '#7C6AE6',
        isLeft: true,
      },
    };

    const preparedCards = res.incomeCardsData.map((item: any) => ({
      ...item,
      route: cardConfig[item.title]?.route || '',
      icon: cardConfig[item.title]?.icon || 'stats-chart',
      color: cardConfig[item.title]?.color || '#999',
      isLeft: cardConfig[item.title]?.isLeft || false,
    }));

    const unsyncedCard = {
      id: 3,
      title: 'Unsynced Receipts',
      amount: Unsynced,
      route: 'syncOfflineReceipts',
      icon: 'sync',
      color: '#F4C430',
      isLeft: false,
    };

    preparedCards.splice(2, 0, unsyncedCard);
    setIncomeCardsData(preparedCards);

    const attendanceCardConfig: any = {
      Present: {
        color: '#4CBB17',
        icon: 'account-check',
      },
      Absent: {
        color: '#FF8C42',
        icon: 'account-cancel',
      },
    };

    const preparedAttendanceCards = res.attendanceListData.map((item) => ({
      ...item,
      icon: attendanceCardConfig[item.title]?.icon || 'stats-chart',
      color: attendanceCardConfig[item.title]?.color || '#999',
    }));

    setAttendanceListData(preparedAttendanceCards);

    const formatAmt = (v) =>
      `₹ ${Number(v || 0).toLocaleString('en-IN')}`;

    const lineData = res.collectionChart.map((item: any) => ({
      value: Number(item.value) || 0,
      label: item.label,
      dataPointText: formatAmt(item.value),
    }));

    setCollectionChart(lineData);
    setMaxValue(res.maxValue);

    setIsAttendanceMarked(res.isAttendanceMarked)

    setCashInHand(res.cashInHand)  // Case In Hand from Cache
  };

  console.log("Attendance status Check", isAttendanceMarked)

  // ========== Branck List ==========

  const fetchBranch = async () => {
    const payload = {
      db: DbName,
      tenant_id: tenantId,
    };

    try {
      const response = await axios.post(
        `${baseUrl}/mobile-list-branches`,
        null,
        {
          params: payload,
        },
      );

      const res = response.data.data;
      setBranch(res);

      await AsyncStorage.setItem('branchData', JSON.stringify(res));

      console.log('Lead view Branches', res);
      return;
    } catch (error) {
      console.error('Error fetching leads:', error);
    }
  };

  // ========== Bank List ==========

  const fetchBanks = async () => {
    const payload = {
      db: DbName,
      tenant_id: tenantId,
    };

    try {
      const response = await axios.post(
        `${baseUrl}/list-customer-bank-names`,
        null,
        {
          params: payload,
        },
      );

      const res = response.data;
      setBranch(res);

      await AsyncStorage.setItem('bankData', JSON.stringify(res));

      console.log('Lead view Banks', res);
      return;
    } catch (error) {
      console.error('Error fetching leads:', error);
    }
  };

  // ========== Payment Modes ==========

  const fetchPaymentMode = async () => {
    const payload = {
      db: DbName,
    };

    try {
      const response = await axios.post(
        `${baseUrl}/mobile-list-payment-types`,
        null,
        {
          params: payload,
        },
      );

      const res = response.data;
      setBranch(res);

      await AsyncStorage.setItem('paymentMode', JSON.stringify(res));

      console.log('Lead view paymentMode', res);
      return;
    } catch (error) {
      console.error('Error fetching Paymentmode:', error);
    }
  };

  // ========== Schemes list ==========

  const fetchSchemes = async () => {
    const payload = {
      db: DbName,
      tenant_id: tenantId,
    };

    try {
      const response = await axios.post(
        `${baseUrl}/mobile-list-schemes`,
        null,
        {
          params: payload,
        },
      );

      const res = response.data.data;
      setBranch(res);

      await AsyncStorage.setItem('schemes', JSON.stringify(res));

      console.log('Schemes response', res);
      return;
    } catch (error) {
      console.error('Error fetching Schemes:', error);
    }
  };

  // ========== State List ==========

  const fetchState = async () => {
    const payload = {
      db: DbName,
      tenant_id: tenantId,
    };

    try {
      const response = await axios.post(
        `${baseUrl}/mobile-list-states`,
        null,
        {
          params: payload,
        },
      );

      const res = response.data.data;
      setBranch(res);

      await AsyncStorage.setItem('states', JSON.stringify(res));

      console.log('States fetch response', res);
      return;
    } catch (error) {
      console.error('Error fetching State:', error);
    }
  };

  // ========== Cities List ==========

  const fetchCities = async () => {
    const payload = {
      db: DbName,
    };

    try {
      const response = await axios.post(
        `${baseUrl}/mobile-list-cities`,
        null,
        {
          params: payload,
        },
      );

      const res = response.data;
      setBranch(res);

      await AsyncStorage.setItem('cities', JSON.stringify(res));

      console.log('Cities response', res);
      return;
    } catch (error) {
      console.error('Error fetching Cities:', error);
    }
  };

  // ========== District List ==========

  const fetchDistrict = async () => {
    const payload = {
      db: DbName,
    };

    try {
      const response = await axios.post(
        `${baseUrl}/mobile-list-districts`,
        null,
        {
          params: payload,
        },
      );

      const res = response.data;
      setBranch(res);

      await AsyncStorage.setItem('district', JSON.stringify(res));

      console.log('District response', res);
      return;
    } catch (error) {
      console.error('Error fetching District:', error);
    }
  };

  // ========== Group List ==========

  const fetchGroups = async () => {
    const payload = {
      db: DbName,
      tenant_id: tenantId,
    };

    try {
      const response = await axios.post(
        `${baseUrl}/mobile-list-groups`,
        null,
        {
          params: payload,
        },
      );

      const res = response.data;
      setBranch(res);

      await AsyncStorage.setItem('groups', JSON.stringify(res));

      console.log('Groups Response', res);
      return;
    } catch (error) {
      console.error('Error fetching Groups:', error);
    }
  };

  // ========== Employee List ==========

  const fetchEmployees = async () => {
    const payload = {
      db: DbName,
      tenant_id: tenantId,
    };

    try {
      const response = await axios.post(
        `${baseUrl}/mobile-list-employees`,
        null,
        {
          params: payload,
        },
      );

      const res = response.data;
      setBranch(res);

      await AsyncStorage.setItem('employees', JSON.stringify(res));

      return;
    } catch (error) {
      console.error('Error fetching Employees:', error);
    }
  };

  // ========== Status List ==========

  const fetchStatus = async () => {
    const payload = {
      db: DbName,
      tenant_id: tenantId,
    };

    try {
      const response = await axios.post(
        `${baseUrl}/list-followup-status-types`,
        null,
        {
          params: payload,
        },
      );

      const res = response.data.data;
      setBranch(res);

      await AsyncStorage.setItem('status', JSON.stringify(res));
      console.log("Status Data", res)
      return;
    } catch (error) {
      console.error('Error fetching status:', error);
    }
  };

  // ========== Fetc Cash In Hand==========

  const fetchCashInHand = async () => {
    setIsLoading(true);
    const payload = {
      db: DbName,
      tenant_id: tenantId,
      user_id: userId,
    };

    try {
      const response = await axios.post(`${baseUrl}/get-cash-in-hand`, null, {
        params: payload,
      });

      const res = response.data.cash_in_hand;
      setCashInHand(res);

      await AsyncStorage.setItem('cashInHand', JSON.stringify(res));

      console.log('Cash In Hand', res);
      return;
    } catch (error) {
      console.error('Error fetching CIH:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // ========== Fetc Offline Receipt ==========

  const syncOfflineReceipts = async () => {
    try {
      const stored = await AsyncStorage.getItem(OFFLINE_RECEIPTS_KEY);
      if (!stored) return;

      let receipts = JSON.parse(stored);

      console.log("Length Of offline receipts", receipts.length)

      setUnsynced(receipts.length)

      // {
      //   receipts.length > 0 && (
      //     setNotifications([...notifications, { id: notifications.length, title: `You Have ${receipts.length} Un Synced Receipts(s)` }])
      //   )
      // }

    } catch (e) {
      console.log('Sync error', e);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);

    // 🔁 API call / reload logic
    fetchDashboard();

    // setTimeout(() => {
    //   setRefreshing(false);
    // }, 2000);
  }, []);

  useEffect(() => {
    attendanceStatusFetch();
  }, [pre]);

  useEffect(() => {
    attendanceStatusFetch();
    userData();
    fetchBranch();
    fetchBanks();
    fetchPaymentMode();
    fetchSchemes();
    fetchState();
    fetchCities();
    fetchDistrict();
    fetchGroups();
    fetchEmployees();
    fetchStatus();

    // fetchDashboard();
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      if (userId) {
        syncOfflineReceipts();
        fetchCashInHand();
        fetchDashboard();
      }
    }, [userId, Unsynced])
  )

  useFocusEffect(
    useCallback(() => {
      setIncomeCardsData(prev =>
        prev.map(card =>
          card.title === 'Unsynced Receipts'
            ? { ...card, amount: Unsynced }
            : card
        )
      );
      syncOfflineReceipts();
    }, [Unsynced])
  )

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <LinearGradient colors={['#061C3F', '#0A5E6A']} style={styles.gradient}>
      <Header attendance={attendanceStatusStored} notifications={notifications} setNotifications={setNotifications} userName={userName} />
      {/* === ATTENDANCE CARD === */}
      {isAttendanceMarked !== 1 && (
        <AttendanceCard onSubmit={setAttendanceStatus} DbName={DbName} tenantId={tenantId} BaseUrl={baseUrl} user={user} setIsLocation={setIsLocation} isLocation={isLocation} setPre={setPre} setNotifications={setNotifications} notifications={notifications} />
      )}

      <IncomeCards incomeCardsData={incomeCardsData} />

      {activeTab === 'balance' && (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ flexGrow: 1 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#00E0FF']}   // Android
              tintColor="#fff"      // iOS
            />
          }
        >

          <View>
            {/* BALANCE CARD */}
            <TouchableOpacity onPress={() => navigation.navigate('Settlement')}>

              <LinearGradient
                colors={['#0A355C', '#0C6C79']}
                style={styles.balanceCard}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.balanceLabel}>CASH IN HAND</Text>
                <Text style={styles.balanceAmount}>₹{cashInHand}</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Attendance section  */}

            {attendanceListData.length > 0 && (
              <View>
                <Text style={[styles.tabText, { fontSize: 20, paddingVertical: 10 }]}>Attendance</Text>

                <AttendanceListCards attendanceListData={attendanceListData} />
              </View>
            )}

            {/* Collections section  */}

            {collectionChart?.length > 0 && (
              <View>
                <Text style={[styles.tabText, { fontSize: 20, paddingVertical: 10 }]}>Collections</Text>

                <Stack collectionChart={collectionChart} maxValue={maxValue} />
              </View>
            )}


          </View>
        </ScrollView>
      )}
    </LinearGradient>
  );
};

export default Home;

/* ===========================================================
   ATTENDANCE CARD COMPONENT
   =========================================================== */

const AttendanceCard = ({
  onSubmit,
  tenantId,
  DbName,
  BaseUrl,
  user,
  setPre,
  setNotifications,
  notifications,
}: {
  onSubmit: (status: 'present' | 'absent') => void;
  tenantId: any;
  DbName: any;
  BaseUrl: any;
  user: any;
  isLocation: any;
  setIsLocation: any;
  setPre: any;
  setNotifications: any;
  notifications: any;
}) => {

  const [absentModal, setAbsentModal] = useState<boolean>(false);
  const [forenoonSession, setForenoonSession] = useState<number | null>(null);
  const [afternoonSession, setAfternoonSession] = useState<number | null>(null);
  const [locationError, setLocationError] = useState<boolean>(false);
  const [lat, setLat] = useState<string | number>();
  const [long, setLong] = useState<string | number>();
  const [remarks, setRemarks] = useState<string>();

  const navigation = useNavigation<any>();

  const saveAttendanceStatus = async (status: 'present' | 'absent') => {
    const data = {
      status,
      savedAt: Date.now(), // current timestamp
    };

    await AsyncStorage.setItem(
      'attendanceStatus',
      JSON.stringify(data)
    );
  };


  const handleGetLocation = async () => {
    try {
      setLocationError(false);

      const position = await new Promise<any>((resolve, reject) => {
        Geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 10000,
          }
        );
      });

      const { latitude, longitude } = position.coords;

      setLat(latitude);
      setLong(longitude);

      console.log('Geo Location info:', position);
    } catch (error) {
      console.log('Location error:', error);
      setLocationError(true);
    }
  };

  // --- Format Date ---

  const formatDate = (date: any) => {

    const d = new Date(date);
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');

    const formatDate = `${year}-${month}-${day}`;
    return formatDate;
  };

  const formatAttendanceDate = (date: any) =>
    new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    }).replace(',', '');


  const handleAttendance = async (type: string) => {

    if (locationError) {
      Dialog.show({
        type: ALERT_TYPE.WARNING,
        title: 'Enable Location',
        textBody: 'Please make sure You have enabled the location!!',
        button: 'close',
        autoClose: 500,
      });
      navigation.navigate('Login')
      await AsyncStorage.removeItem('loginDetails');
      return;
    }

    const att_date = formatDate(Date.now())

    const attendanceType = type === 'present' ? 1 : 2;

    const payload = {
      db: DbName,
      tenant_id: tenantId,
      branch_id: user?.branch_id,
      att_date: att_date,
      employee_id: user?.employee_id,
      attendance_type: attendanceType,
      afternoon_session: afternoonSession,
      forenoon_session: forenoonSession,
      latitude: lat,
      longitude: long,
      remarks: remarks,
      created_by: user?.role_id,
      status: 1
    }

    try {
      const response = await axios.post(`${BaseUrl}/mobile-store-employee-attendance`, null, {
        params: payload,
      });

      const res = response.data;

      console.log(res)

      if (type === 'present') {
        onSubmit('present')
        setPre((pre: any) => pre + 1);
        await saveAttendanceStatus('present');

        setNotifications([...notifications, { id: notifications.length, title: `Attendance status updated: Present` }])

        // setNotifications([...notifications, { id: 'notify', title: "Attendance status updates: Present" }])
      } else {
        setPre((pre: any) => pre + 1);
        onSubmit('absent')
        await saveAttendanceStatus('absent');

        setNotifications([...notifications, { id: notifications.length, title: `Attendance status updated: Absent` }])

        // setNotifications([...notifications, { id: 'notify', title: "Attendance status updates: Absent" }])
      }
    } catch (err) {
      console.error('Error While Fertching feedvack', err);
    } finally {
    }
  }

  useEffect(() => {
    handleGetLocation();
  }, [])

  return (
    <View style={styles.attCard}>
      {/* LEFT */}
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Ionicons
          name="person"
          size={24}
          color="#fff"
          style={{ marginRight: 12 }}
        />

        <View>
          <Text style={styles.attTitle}>Attendance</Text>
          <Text style={styles.attDate}>{formatAttendanceDate(Date.now())}</Text>
        </View>
      </View>

      {/* RIGHT SIDE */}

      <View style={styles.attBtnRow}>
        <Pressable
          onPress={() => handleAttendance('present')}
          style={[styles.attBtn, { backgroundColor: '#2563FF' }]}
        >
          <Text style={[styles.attBtnText, { color: '#fff' }]}>Present</Text>
        </Pressable>

        <Pressable
          onPress={() => setAbsentModal(true)}
          style={[styles.attBtn, { backgroundColor: '#D9D9D9' }]}
        >
          <Text style={[styles.attBtnText, { color: '#000' }]}>Absent</Text>
        </Pressable>
      </View>

      <Modal
        transparent
        animationType="slide"
        visible={absentModal}
        onRequestClose={() => setAbsentModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Mark Absent</Text>

            {/* Forenoon */}
            <Pressable
              style={styles.checkboxRow}
              onPress={() =>
                setForenoonSession(forenoonSession === 1 ? null : 1)
              }
            >
              <View style={styles.checkbox}>
                {forenoonSession === 1 && <View style={styles.checkboxTick} />}
              </View>
              <Text>Forenoon Session</Text>
            </Pressable>

            {/* Afternoon */}
            <Pressable
              style={styles.checkboxRow}
              onPress={() =>
                setAfternoonSession(afternoonSession === 1 ? null : 1)
              }
            >
              <View style={styles.checkbox}>
                {afternoonSession === 1 && <View style={styles.checkboxTick} />}
              </View>
              <Text>Afternoon Session</Text>
            </Pressable>

            {/* Remarks */}
            <TextInput
              placeholder="Enter remarks"
              value={remarks}
              onChangeText={setRemarks}
              multiline
              numberOfLines={4}
              style={styles.remarksInput}
            />

            {/* Buttons */}
            <View style={styles.modalBtnRow}>
              <Pressable
                onPress={() => setAbsentModal(false)}
                style={[styles.modalBtn, { backgroundColor: '#E5E5E5' }]}
              >
                <Text>Cancel</Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  setAbsentModal(false);
                  handleAttendance('absent');
                }}
                style={[styles.modalBtn, { backgroundColor: '#2563FF' }]}
              >
                <Text style={{ color: '#fff' }}>Submit</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

    </View>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 30,
  },

  /* ATTENDANCE CARD */
  attCard: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    padding: 18,
    marginBottom: 10,
    borderRadius: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  attTitle: {
    color: '#E9E648',
    fontSize: 18,
    fontWeight: '600',
  },

  attDate: {
    color: '#D0D0D0',
    fontSize: 12,
  },

  attBtnRow: {
    flexDirection: 'row',
    gap: 10,
  },

  attBtn: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 14,
  },

  presentActive: {
    backgroundColor: '#2563FF',
  },

  absentActive: {
    backgroundColor: '#D9D9D9',
  },

  inactiveBtn: {
    backgroundColor: '#ffffff22',
  },

  attBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },

  activeText: { color: '#fff' },
  inactiveText: { color: '#fff' },

  activeTextDark: { color: '#000' },
  inactiveTextDark: { color: '#000' },

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 14,
  },

  presentBadge: {
    backgroundColor: '#2563FF',
  },

  absentBadge: {
    backgroundColor: '#D9D9D9',
  },

  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },

  /* BALANCE */
  avatar: { width: 45, borderRadius: 30, marginRight: 15 },

  balanceCard: {
    borderRadius: 20,
    padding: 20,
    elevation: 5,
    marginTop: 20,
  },

  balanceLabel: {
    color: '#D8E7FF',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: 'bold',
  },

  balanceAmount: {
    fontSize: 38,
    fontWeight: 'bold',
    marginVertical: 10,
    color: '#FFFFFF',
    textAlign: 'center',
  },

  /* MENU */
  menuRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 15,
    gap: 20,
  },

  menuBox: {
    width: 90,
    height: 110,
    borderRadius: 20,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    // marginRight: 12,
  },

  menuIconWrapper: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 14,
    borderRadius: 50,
  },

  menuIcon: {
    backgroundColor: '#ffffff22',
    padding: 10,
    borderRadius: 40,
  },

  menuLabel: {
    color: '#F5F5F5',
    fontSize: 13,
    fontWeight: '500',
    marginTop: 5,
  },

  /* TRANSACTIONS */
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 10,
  },

  transactionTitle: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: 'bold',
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

  // ===== text card ======

  cardsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  container: {
    padding: 12,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    backgroundColor: '#FFFFFF44',
    padding: 14,
    borderRadius: 14,
    marginTop: 10,
  },
  iconContainer: {
    marginRight: 10,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 12,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  amountText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
  topTabContainer: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    backgroundColor: '#E6EEF533',
    borderRadius: 15,
    padding: 4,
    marginTop: 12,
  },

  tabBtn: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 15,
  },

  activeTab: {
    backgroundColor: '#0b7383',
  },

  tabText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#fff',
  },

  activeTabText: {
    color: '#fff',
  },
  legendContainer: {
    flexDirection: 'row',
    gap: 20,
    alignItems: 'center',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendBox: {
    width: 16,
    height: 16,
    borderRadius: 3,
    marginRight: 8,
  },
  legendText: {
    fontSize: 14,
    color: '#fff',
  },

  // attendance modal design 

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: '#333',
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxTick: {
    width: 12,
    height: 12,
    backgroundColor: '#2563FF',
  },
  remarksInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
    textAlignVertical: 'top',
  },
  modalBtnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  modalBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },

  attcardsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  attcard: {
    width: '48%',
    backgroundColor: '#ffffff33',
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 14,
    borderWidth: 1.5,
    borderBottomLeftRadius: 3,
    borderTopRightRadius: 3,
  },

  attcount: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 6,
    color: '#fff'
  },

  atttitle: {
    fontSize: 14,
    color: '#FFF',
    fontWeight: '500',
  },

});
