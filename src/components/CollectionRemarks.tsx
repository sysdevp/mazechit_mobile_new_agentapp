import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList, Pressable } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Header from './Header';
import Feather from 'react-native-vector-icons/Feather';
import Icon from 'react-native-vector-icons/Ionicons';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import COMMON from '../comon/Common';
import axios from 'axios';
import HistorySkeleton from './loaders/HistorySkeleton';
import AsyncStorage from '@react-native-async-storage/async-storage';

const followupData = [
  {
    id: 1,
    note: 'Requested product details. Follow-up tomorrow.',
    date: 'Jan 06',
    nextDate: 'Jan 08',
  },
  {
    id: 2,
    note: 'Asked to call next week regarding EMI options.',
    date: 'Jan 05',
    nextDate: 'Jan 08',
  },
  {
    id: 3,
    note: 'Customer said he will confirm after discussing with family.',
    date: 'Jan 04',
    nextDate: 'Jan 09',
  },
  {
    id: 4,
    note: 'Shared pricing details on WhatsApp. Waiting for response.',
    date: 'Jan 03',
    nextDate: 'Jan 07',
  },
  {
    id: 5,
    note: 'Customer asked to call after salary credit.',
    date: 'Jan 01',
    nextDate: 'Jan 10',
  },
];

type FollowupItem = {
  id: number;
  note: string;
  date: string;
  nextDate: string;
};

const CollectionRemarks = () => {
  const [isLoading, setIsLoading] = useState<Boolean>(true);
  const navigation = useNavigation<any>();
  const [user, setUser] = useState();

  const route = useRoute<any>();
  const { data } = route.params;

  const [remarks, setRemarks] = useState<any[]>();

  const baseUrl = COMMON.BaseUrl;
  const dataBase = COMMON.DbName;

  const userData = async () => {
    const value = JSON.parse(
      (await AsyncStorage.getItem('loginDetails')) ?? '{}',
    );

    console.log(value);

    setUser(value);
  };

  const fetchFeedback = async () => {
    setIsLoading(true)
    const payload = {
      db: dataBase,
      tenant_id: user?.tenant_id,
      customer_id: data?.customer_id,
    };

    try {
      const response = await axios.post(`${baseUrl}/feedback-customers`, null, {
        params: payload,
      });

      const res = response.data.data;
      console.log(res)
      setRemarks(res);
    } catch (err) {
      console.error('Error While Fertching feedvack', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    userData();
  }, []);
  useFocusEffect(
    useCallback(() => {
      if (user?.tenant_id && data?.customer_id) {
        fetchFeedback();
      }
    }, [user, data])
  );


  console.log(user, "test");

  const renderCard = ({ item }: { item: FollowupItem }) => (
    <View style={styles.card}>
      {/* Note Text */}
      <Text style={styles.note}>{item?.remarks}</Text>

      {/* DATE ROW */}
      <View style={styles.dateRow}>
        <Text style={styles.dateBadge}>Created: {item.remark_date}</Text>
        <Text style={styles.nextBadge}>Next: {item.next_followup_date}</Text>
      </View>
    </View>
  );

  if (isLoading) {
    return <HistorySkeleton />
  }

  return (
    <LinearGradient colors={['#061C3F', '#0A5E6A']} style={styles.gradient}>
      <Header
        title="Collection Remarks"
        showBack={true}
        rightButton={
          <Pressable
            onPress={() =>
              navigation.navigate('AddCollectionRemarks', { data: data })
            }
            android_ripple={{ color: 'rgba(255,255,255,0.15)' }}
            style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
          >
            <Feather name="plus-circle" size={24} color="#fff" />
          </Pressable>
        }
      />

      {/* USER CARD */}
      <View style={styles.userCard}>
        <View style={styles.profileCircle}>
          <Icon name="person" size={30} color="#666" />
        </View>
        <View>
          <Text style={styles.userName}>{data?.customer_name}</Text>
          <Text style={styles.userPhone}>{data?.mobile_no}</Text>
        </View>
      </View>

      <FlatList
        data={remarks}
        renderItem={renderCard}
        keyExtractor={item => item.customer_id.toString()}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 30,
  },

  /* COMPACT & CLEAN CARD */
  card: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },

  note: {
    color: '#fff',
    paddingHorizontal: 5,
    fontSize: 14,
    lineHeight: 18,
    marginBottom: 8,
  },

  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  dateBadge: {
    // backgroundColor: '#ffffff22',
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: 6,
    color: '#fff',
    fontSize: 12,
  },

  nextBadge: {
    // backgroundColor: '#6EE7F822',
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 6,
    color: '#E9E648',
    fontSize: 12,
    fontWeight: '600',
  },

  /* User Card */
  userCard: {
    backgroundColor: '#ffffff33',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },

  profileCircle: {
    width: 45,
    height: 45,
    borderRadius: 50,
    backgroundColor: '#EEE',
    justifyContent: 'center',
    alignItems: 'center',
  },

  userName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },

  userPhone: {
    color: '#E9E648',
    fontSize: 14,
    marginTop: 2,
  },
});

export default CollectionRemarks;
