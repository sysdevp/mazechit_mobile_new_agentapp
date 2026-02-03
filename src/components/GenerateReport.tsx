import React, { useCallback, useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  // Pressable,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Header from './Header';
import Icon from 'react-native-vector-icons/Ionicons';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';
import COMMON from '../comon/Common';
import AsyncStorage from '@react-native-async-storage/async-storage';
import GenerateReportSkeleton from './loaders/GenerateReportSkeleton';

const GenerateReport = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { data } = route.params;

  const [reports, setReports] = useState<any[]>();
  const [user, setUser] = useState('');

  const [isLoading, setIsLoading] = useState<boolean>(true);

  const baseUrl = COMMON.BaseUrl;
  const dataBase = COMMON.DbName;

  const userData = async () => {
    const value = JSON.parse(
      (await AsyncStorage.getItem('loginDetails')) ?? '{}',
    );

    setUser(value);
  };

  const fetchGenerateReceipt = async () => {
    setIsLoading(true);
    console.log(user);
    const payload = {
      db: dataBase,
      tenant_id: user?.tenant_id,
      customer_id: data?.customer_id,
    };

    try {
      const response = await axios.post(
        `${baseUrl}/mobile-get-customer-wise-entrolment-details-new`,
        null,
        {
          params: payload,
        },
      );

      const res = response.data;
      setReports(res);
    } catch (err) {
      console.error('Error While Fertching generate receipt', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    userData();
  }, [])

  useFocusEffect(
    useCallback(() => {
      if (user?.tenant_id) {
        fetchGenerateReceipt();
      }
    }, [user])
  );


  if (isLoading) {
    return <GenerateReportSkeleton />;
  }

  return (
    <LinearGradient colors={['#061C3F', '#0A5E6A']} style={styles.gradient}>
      <Header title="Generate Report" showBack={true} />

      {/* User Card */}
      <View style={styles.userCard}>
        <View style={styles.profileCircle}>
          <Icon name="person" size={30} color="#666" />
        </View>
        <View>
          <Text style={styles.userName}>{data?.customer_name}</Text>
          <Text style={styles.userPhone}>{data?.mobile_no}</Text>
        </View>
      </View>

      {/* ---------------- Button Row ---------------- */}
      <View style={styles.btnContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() =>
            navigation.navigate('CollectionRemarks', { data: data })
          }
        >
          <Text style={styles.btnText}>Feedback</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() =>
            navigation.navigate('BeforeEnrollment', { data: data })
          }
        >
          <Text style={styles.btnText}>Before Enrollment Receipt</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {reports?.map((item, index) => (
          <View key={index}>
            {/* Info Card */}
            <View style={styles.infoBox}>
              <View style={styles.grid}>
                {renderGridItem('Chit Value', item.chit_value || '-')}
                {renderGridItem('Auction Date', item.auction_date || '-')}
                {renderGridItem('Prized Status', item.prized_status || '-')}

                {renderGridItem('Installments', item.install_amount || '-')}
                {renderGridItem('Collected', item.paid_amount || '-')}
                {renderGridItem('To Be Collected', item.pending_amount || '-')}

                {renderGridItem('Penalty', item.total_penalty || '-')}
                {renderGridItem('Bonus', item.bonus || '-')}
                {renderGridItem('Advance', item.advance_amount || '-')}

                {renderGridItem('Due', item.total_installment_count || '-')}
                {renderGridItem('Pending Due', item.pending_due_count || '-')}
              </View>
              <View style={styles.btnRow}>
                <View>
                  <TouchableOpacity
                    style={styles.linkBtn}
                    onPress={() =>
                      navigation.navigate('ReportGenerate', {
                        reportData: item,
                      })
                    }
                  >
                    <Icon
                      name="document-text-outline"
                      size={16}
                      color="#FFE27A"
                    />
                    <Text style={styles.linkText}>Generate Receipt</Text>
                    {/* <Octicons
                    name="dot-fill"
                    size={15}
                    color={statusColors[item.status] || '#FFE27A'}
                  /> */}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </LinearGradient>
  );
};

/* Grid Item Component */
const renderGridItem = (label: string, value: string) => (
  <View style={styles.gridItem}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 30,
  },

  userCard: {
    backgroundColor: '#ffffff33',
    padding: 16,
    borderRadius: 14,
    // marginTop: 20,
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

  infoBox: {
    backgroundColor: '#ffffff33',
    padding: 18,
    borderRadius: 14,
    marginTop: 15,
  },

  // ---------------- Buttons ----------------

  btnContainer: {
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
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ffffff44',
  },
  btnText: {
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center'
  },

  /* GRID 3 COLUMNS LIKE YOUR IMAGE */
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  gridItem: {
    width: '30%',
    marginVertical: 8,
  },

  label: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
  },

  value: {
    color: '#E9E648',
    fontSize: 14,
    fontWeight: '500',
    marginTop: 2,
  },

  /* Buttons */

  btnRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 8,
  },

  pendingLabel: {
    color: '#F4A261',
    fontWeight: '700',
    fontSize: 15,
    alignSelf: 'center',
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
  },

  linkText: {
    color: '#FFE27A',
    fontWeight: '600',
    fontSize: 14,
  },

  pendingBtn: {
    backgroundColor: '#F4A261',
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderRadius: 20,
  },

  pendingText: {
    color: '#000',
    fontWeight: '600',
  },

  receiptBtn: {
    borderWidth: 1,
    borderColor: '#FFE27A',
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderRadius: 20,
  },

  receiptText: {
    color: '#FFE27A',
    fontWeight: '600',
  },
});

export default GenerateReport;
