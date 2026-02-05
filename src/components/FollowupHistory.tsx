import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Header from './Header';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRoute } from '@react-navigation/native';
import axios from 'axios';
import COMMON from '../comon/Common';
import HistorySkeleton from './loaders/HistorySkeleton';

type FollowupItem = {
  id: number;
  note: string;
  date: string;
  nextDate: string;
  status: string;
};

const FollowupHistory = () => {

  const [user, setUser] = useState<any>();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [FollowupHistory, setFollowUpHistory] = useState<any[]>([]);

  const route = useRoute<any>();
  const { data } = route.params;

  const baseUrl = COMMON.BaseUrl;
  const dataBase = COMMON.DbName;

  // --- user details getch ---

  const userData = async () => {
    const value = JSON.parse(
      (await AsyncStorage.getItem('loginDetails')) ?? '{}',
    );

    console.log(value);
    setUser(value);
  };

  const handleNextFollowUp = async () => {
    setIsLoading(true);
    const payload = {
      db: dataBase,
      tenant_id: user?.tenant_id,
      branch_id: user?.branch_id,
      lead_management_id: data?.lead_id,
    }

    try {
      const response = await axios.post(`${baseUrl}/get-followups-mobile`, null, {
        params: payload,
      });

      const res = response.data.data;
      setFollowUpHistory(res);


    } catch (err) {
      console.error('Error While Fertching get-followups-mobile', err);
    } finally {
      setIsLoading(false);
    }

  }

  useEffect(() => {
    userData();
  }, [])

  useFocusEffect(
    useCallback(() => {
      if (user?.tenant_id && data?.lead_id) {
        handleNextFollowUp();
      }
    }, [user, data])
  );

  console.log(user, "Data space", data)

  if (isLoading) {
    return <HistorySkeleton />
  }

  const renderCard = ({ item }) => (
    <View style={styles.card}>
      {/* LEFT SECTION */}
      <View style={{ flex: 1 }}>
        <Text style={styles.note}>{item.remarks}</Text>

        {/* DATE ROW */}
        <View style={styles.dateRow}>
          <View style={styles.badgeWrapper}>
            <Text style={styles.dateBadge}>Followed on: {item.followup_date}</Text>
          </View>

          <View style={styles.badgeWrapper}>
            <Text style={styles.nextBadge}>Next Folow-up: {item.next_followup_date}</Text>
          </View>
        </View>
      </View>

      {/* STATUS BADGE */}
      <View
        style={[
          styles.statusBadge,
          item.status_name === 'In Followup'
            ? { backgroundColor: '#FFD66433', borderColor: '#FFD664' }
            : item.status_name === 'Drop' ? { backgroundColor: '#FF6B6B33', borderColor: '#FF6B6B' }
              : { backgroundColor: '#5CB85C55', borderColor: '#5CB85C' },
        ]}
      >
        <Text
          style={[
            styles.statusText,
            item.status_name === 'In Followup'
              ? { color: '#FFD664' }
              : item.status_name === 'Drop' ? { color: '#FF6B6B' }
              : { color: '#FFF' }
          ]}
        >
          {item.status_name}
        </Text>
      </View>
    </View>
  );

  return (
    <LinearGradient colors={['#061C3F', '#0A5E6A']} style={styles.gradient}>
      <Header title="Follow-up History" showBack={true} />

      {/* USER CARD */}
      <View style={styles.userCard}>
        <View style={styles.profileCircle}>
          <Icon name="person" size={30} color="#666" />
        </View>

        <View>
          <Text style={styles.userName}>{data?.lead_customer_name}</Text>
          <Text style={styles.userPhone}>{data?.mobile_no}</Text>
        </View>
      </View>

      <FlatList
        data={FollowupHistory}
        renderItem={renderCard}
        keyExtractor={item => item.followup_id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        ListEmptyComponent={() => (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>No Follow-Up History</Text>
          </View>
        )}
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

  /* Card */
  card: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 14,
    padding: 15,
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },

  note: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
  },

  /* DATE SECTION */
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingTop: 8
  },

  badgeWrapper: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 6,
  },

  dateBadge: {
    color: '#fff',
    fontSize: 12,
  },

  nextBadge: {
    color: '#E9E648',
    fontSize: 12,
    fontWeight: '600',
  },

  /* STATUS BADGE */
  statusBadge: {
    paddingVertical: 2,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    alignSelf: 'flex-start',
    marginLeft: 10,
  },

  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },

  /* USER CARD */
  userCard: {
    backgroundColor: '#ffffff33',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },

  profileCircle: {
    width: 45,
    height: 45,
    borderRadius: 45,
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
  noDataContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },

  noDataText: {
    color: '#999',
    fontSize: 14,
  },
});

export default FollowupHistory;
