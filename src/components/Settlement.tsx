import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Header from './Header';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import COMMON from '../comon/Common';
import axios from 'axios';
import { ALERT_TYPE, Dialog } from 'react-native-alert-notification';

const denominations = [1, 2, 5, 10, 20, 50, 100, 200, 500] as const;

type Denomination = (typeof denominations)[number];
type Counts = Record<Denomination, string>;

const Settlement = () => {
  const [counts, setCounts] = useState<Counts>(
    denominations.reduce((acc, d) => ({ ...acc, [d]: '' }), {} as Counts),
  );
  const [userData, setUserData] = useState<any>();
  const [cashInHand, setCashInHand] = useState<number>();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const baseUrl = COMMON.BaseUrl;
  const DbName = COMMON.DbName;

  const navigation = useNavigation<any>();

  const handleChange = (value: string, denom: Denomination) => {
    setCounts({
      ...counts,
      [denom]: value.replace(/[^0-9]/g, ''),
    });
  };

  const getSubtotal = (denom: Denomination) => {
    const qty = parseInt(counts[denom] || '0', 10);
    return qty * denom;
  };

  const totalAmount = denominations.reduce((sum, d) => sum + getSubtotal(d), 0);

  const fetchUserData = async () => {
    const value = JSON.parse(
      (await AsyncStorage.getItem('loginDetails')) ?? '{}',
    );

    const cihValue = JSON.parse(
      (await AsyncStorage.getItem('cashInHand')) ?? '{}',
    );

    console.log(value);
    setUserData(value);
    setCashInHand(Number(cihValue));
    // setUserId(value?.logged_user_id);
    // setTenantId(value?.tenant_id);
  };

  const handleSettleAmount = async () => {
    setIsLoading(true);

    if (cashInHand !== totalAmount) {
      Dialog.show({
        type: ALERT_TYPE.WARNING,
        title: 'Settlement',
        textBody:
          'The total amount and cash in hand do not match. Please check the entered amounts.',
        button: 'Close',
      });
      setIsLoading(false);
      return;
    }

    const payload = {
      db: DbName,
      tenant_id: userData?.tenant_id,
      user_id: userData?.logged_user_id,
      branch_id: userData?.branch_id,
      employee_id: userData?.employee_id,
      settlement_date: Date.now(),
      total_amount: cashInHand,
      received_amount: totalAmount,
      collection_employee: userData?.logged_user_id,
    };

    console.log(payload);

    try {
      const response = await axios.post(
        `${baseUrl}/add-cash-settlement`,
        null,
        {
          params: payload,
        },
      );

      const res = response.data.cash_in_hand;
      // setCashInHand(res);

      navigation.goBack();

      Dialog.show({
        type: ALERT_TYPE.SUCCESS,
        title: 'Settlement Successful',
        textBody: 'The settlement has been completed successfully.',
        button: 'OK',
        autoClose: 500,
      });

      console.log('Cash In Hand', res);
      return;
    } catch (error) {
      console.error('Error fetching CIH:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  console.log(cashInHand, 'liyh');

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <LinearGradient colors={['#061C3F', '#0A5E6A']} style={styles.gradient}>
        <Header title="Settlement" showBack={true} />

        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* CASH IN HAND */}
          <View style={styles.cashBox}>
            <Text style={styles.cashTitle}>Cash In Hand</Text>
            <Text style={styles.cashAmount}>₹{cashInHand}</Text>
          </View>

          <View style={{ paddingHorizontal: 26 }}>
            {/* DENOMINATION LIST */}
            <View style={{ marginTop: 30 }}>
              {denominations.map(d => (
                <View key={d} style={styles.row}>
                  <Text style={styles.denomText}>₹ {d}</Text>

                  <View style={styles.middleGroup}>
                    <Text style={styles.xText}>×</Text>

                    <TextInput
                      style={styles.input}
                      keyboardType="numeric"
                      value={counts[d]}
                      onChangeText={v => handleChange(v, d)}
                      placeholder="0"
                      placeholderTextColor="#888"
                    />

                    <Text style={styles.equalText}>=</Text>
                  </View>

                  <Text style={styles.subtotal}>₹ {getSubtotal(d)}</Text>
                </View>
              ))}
            </View>

            {/* LINE */}
            <View style={styles.line} />

            {/* TOTAL */}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>₹ {totalAmount}</Text>
            </View>
          </View>

          {/* BUTTON */}
          <TouchableOpacity
            onPress={handleSettleAmount}
            style={[styles.button, isLoading && { opacity: 0.7 }]}
            disabled={isLoading}
          >
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#fff" />
                <Text style={styles.processingText}>Processing...</Text>
              </View>
            ) : (
              <Text style={styles.buttonText}>Settle Amount</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
    paddingHorizontal: 26,
    paddingTop: 20,
  },

  cashBox: {
    backgroundColor: '#E5F04B',
    alignSelf: 'center',
    paddingVertical: 12,
    paddingHorizontal: 45,
    borderRadius: 10,
    marginTop: 15,
  },
  cashTitle: {
    textAlign: 'center',
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
  },
  cashAmount: {
    textAlign: 'center',
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
  },

  /* PERFECTLY ALIGNED ROW */
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
    width: '100%',
    justifyContent: 'space-between',
  },

  denomText: {
    color: '#fff',
    fontSize: 16,
    minWidth: 60,
  },

  middleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 20,
    flexShrink: 1,
  },

  xText: {
    color: '#fff',
    fontSize: 16,
  },

  input: {
    width: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#777',
    color: '#fff',
    paddingVertical: 3,
    fontSize: 16,
    textAlign: 'center',
  },

  equalText: {
    color: '#fff',
    fontSize: 16,
  },

  subtotal: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'right',
    minWidth: 80,
  },

  line: {
    height: 1,
    backgroundColor: '#555',
    marginTop: 15,
  },

  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 15,
  },
  totalLabel: {
    fontSize: 18,
    color: '#fff',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#E5F04B',
  },

  button: {
    backgroundColor: '#246BFD',
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 10,
    marginBottom: 30,
  },
  buttonText: {
    textAlign: 'center',
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  processingText: {
    color: '#fff',
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default Settlement;
