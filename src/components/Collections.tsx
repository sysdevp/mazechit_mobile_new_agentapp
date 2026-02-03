import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  Pressable,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import Octicons from 'react-native-vector-icons/Octicons';
import Header from './Header';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import COMMON from '../comon/Common';
import ListHeaderSkeleton from './loaders/ListHeaderSkeleton';
import { ALERT_TYPE, Dialog } from 'react-native-alert-notification';

const COLLECTION_CACHE_KEY = 'COLLECTION_CACHE';
const OFFLINE_RECEIPTS_KEY = 'offline_receipts';

const Collection = () => {
  const [search, setSearch] = useState('');
  const navigation = useNavigation<any>();
  const [userId, setUserId] = useState('');
  const [statsData, setStatsData] = useState<any[]>([]);
  const [collection, setCollection] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [refreshing, setRefreshing] = useState(false);

  const baseUrl = COMMON.BaseUrl;
  const DbName = COMMON.DbName;

  // ---------------- Get user info ----------------
  const userData = async () => {
    const value = JSON.parse(
      (await AsyncStorage.getItem('loginDetails')) ?? '{}',
    );
    setUserId(value?.tenant_id);
  };

  // ---------------- Fetch collections (Offline First) ----------------
  const fetchCollections = async () => {
    setIsLoading(true);

    const payload = {
      db: DbName,
      tenant_id: userId,
    };

    try {
      // 🔹 Try API
      const response = await axios.get(
        `${baseUrl}/mobile-get-collection-area-customers-new`,
        { params: payload },
      );

      const res = response.data ?? [];

      // 🔹 Update UI
      setCollection(res.customers);

      const summaryCards = [
        {
          label: 'To be Collected',
          amount: `₹${res.overall_to_be_collected ?? 0}`,
          bg: '#E9E648',
        },
        {
          label: 'Cash in Hand',
          amount: `₹${res.cash_in_hand ?? 0}`,
          bg: '#E9E648',
        },
      ];

      setStatsData(summaryCards);

      // 🔹 Save to AsyncStorage
      await AsyncStorage.setItem(
        COLLECTION_CACHE_KEY,
        JSON.stringify(res),
      );

      console.log('Collections loaded from API');
    } catch (error) {
      console.log('API failed, loading cached collections', error);

      // 🔹 Load from cache
      const cachedData = await AsyncStorage.getItem(COLLECTION_CACHE_KEY);

      if (cachedData) {
        const cacheCollection = JSON.parse(cachedData)

        const summaryCards = [
          {
            label: 'To be Collected',
            amount: `₹${cacheCollection.overall_to_be_collected ?? 0}`,
            bg: '#E9E648',
          },
          {
            label: 'Cash in Hand',
            amount: `₹${cacheCollection.cash_in_hand ?? 0}`,
            bg: '#E9E648',
          },
        ];

        setStatsData(summaryCards);

        setCollection(cacheCollection.customers);

        console.log('Collections loaded from cache', JSON.parse(cachedData));
      } else {
        setCollection([]);
        console.log('No cached data found');
      }
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  // ---------------- Refresh Handler ----------------
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchCollections();
  }, []);

  const filteredCollection = collection?.length > 0 && collection?.filter(c =>
    c.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
    c.mobile_no?.toString().includes(search),
  );


  // ---------------- Initial load ----------------
  useEffect(() => {
    userData();
  }, []);

  // ---------------- Reload on focus ----------------
  useFocusEffect(
    useCallback(() => {
      if (userId) {
        fetchCollections();
      }
    }, [userId]),
  );

  // const statsData = [
  //   { label: 'To be Collected', amount: '₹5000', bg: '#E9E648' },
  //   { label: 'Cash in Hand', amount: '₹1000', bg: '#E9E648' },
  // ];

  if (isLoading) {
    return <ListHeaderSkeleton />;
  }
  console.log(filteredCollection, "filteredCollection filteredCollection")

  return (
    <LinearGradient colors={['#061C3F', '#0A5E6A']} style={styles.gradient}>
      <Header title="Collection" />

      {/* ---------------- Stats ---------------- */}
      <View style={styles.statsRow}>
        {statsData?.map((item, idx) => (
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
      </View>

      {/* ---------------- Buttons ---------------- */}
      <View style={styles.btnRow}>
        <Pressable
          style={styles.button}
          onPress={() => navigation.navigate('ViewReceipts')}
        >
          <Text style={styles.btnText}>Online Receipts</Text>
        </Pressable>

        <Pressable
          style={styles.button}
          onPress={() => navigation.navigate('syncOfflineReceipts')}
        >
          <Text style={styles.btnText}>Offline Receipts</Text>
        </Pressable>
      </View>

      {/* ---------------- Search ---------------- */}
      <View style={styles.searchContainer}>

        <View style={styles.searchBox}>
          <Icon name="search" size={20} color="#666" />
          <TextInput
            placeholder="Search"
            placeholderTextColor="#666"
            value={search}
            onChangeText={setSearch}
            style={styles.searchInput}
          />
        </View>
        {/* <TouchableOpacity style={styles.sync} onPress={onRefresh}>
          <MaterialIcon name="sync" size={26} color="#fff" />
        </TouchableOpacity> */}
      </View>

      {/* ---------------- Status Legend ---------------- */}
      <View style={styles.statusContainer}>
        <View style={styles.statusIndicator}>
          <Octicons name="dot-fill" size={15} color="#F29339" />
          <Text style={styles.statusIndicatorText}>Pending</Text>
        </View>

        <View style={styles.statusIndicator}>
          <Octicons name="dot-fill" size={15} color="#E53935" />
          <Text style={styles.statusIndicatorText}>Over Due</Text>
        </View>
      </View>

      {/* ---------------- Customer List ---------------- */}
      <FlatList
        data={filteredCollection}
        keyExtractor={(_, index) => index.toString()}
        contentContainerStyle={{ paddingBottom: 40, flexGrow: 1 }}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', marginTop: 40 }}>
            <Text style={{ fontSize: 16, color: '#888' }}>
              No collection found
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            style={styles.customerCard}
            onPress={() =>
              navigation.navigate('GenerateReport', { data: item })
            }
          >
            <View style={styles.leftView}>
              <View style={styles.avatar}>
                <Icon name="person" size={26} color="#666" />
              </View>
              <View>
                <Text style={styles.customerName}>
                  {item.customer_name}
                </Text>
                <Text style={styles.phone}>{item.mobile_no}</Text>
              </View>
            </View>

            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor:
                    item.overdue !== 1 && item.total_pending === '0'
                      ? '#4CAF50' // Green
                      : item.overdue === 1 && item.total_pending !== '0'
                        ? '#E53935' // Red
                        : '#F29339', // Orange (default)
                },
              ]}
            >
              <Text style={styles.statusText}>
                ₹ {item.total_pending}
              </Text>
            </View>
          </Pressable>
        )}
      />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
  },

  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    gap: 10,
  },
  statCard: {
    width: '40%',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 10,
    justifyContent: 'center',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center'
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 5,
    textAlign: 'center',
  },

  btnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    flex: 1,
    backgroundColor: '#ffffff22',
    marginHorizontal: 5,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ffffff44',
  },
  btnText: {
    color: '#fff',
    fontWeight: '600',
  },
  searchContainer: {
    // flexDirection: 'row',
    // gap: 20
  },

  searchBox: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginTop: 20,
    paddingHorizontal: 12,
    height: 45,
    flexDirection: 'row',
    alignItems: 'center',
    // minWidth: '80%',
  },

  sync: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff22',
    borderRadius: 12,
    paddingHorizontal: 8,
    marginTop: 18,
  },

  searchInput: {
    marginLeft: 10,
    flex: 1,
    color: '#000',
  },

  customerCard: {
    backgroundColor: '#ffffff33',
    marginTop: 14,
    padding: 12,
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftView: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    backgroundColor: '#fff',
    height: 45,
    width: 45,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  customerName: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  phone: {
    color: '#AEE1FF',
    marginTop: 3,
  },

  statusBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  statusText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },

  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingTop: 10,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  statusIndicatorText: {
    color: '#fff',
    fontWeight: 'bold',
    paddingHorizontal: 5,
  },
});

export default Collection;
