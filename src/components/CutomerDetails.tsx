import React, { useCallback } from 'react';
import {
  BackHandler,
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {
  RouteProp,
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import Header from './Header';
import Feather from 'react-native-vector-icons/Feather';

type CollectionRouteParams = {
  from?: string;
};

const Test = () => {
  const navigation = useNavigation<any>();
  const route =
    useRoute<RouteProp<Record<string, CollectionRouteParams>, string>>();
  const from = route.params?.from;

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

  // ⬇⬇⬇ MULTIPLE CUSTOMER LIST HERE
  const customers = [
    {
      name: 'User 01',
      phone: '9864852486',
      email: 'User01@gmail.com',
      gender: 'Male',
      dob: '05.01.2001',
      doj: '10.05.2022',
      branch: 'Main',
      scheme: 'GNS001',
      mode: 'Gpay',
      amount: '1000',
      agent: 'Siva',
      address: 'Street 1',
      state: 'TN',
      district: 'Chennai',
      city: 'Chennai',
      pincode: '600001',
    },
    {
      name: 'User 02',
      phone: '7845122399',
      email: 'user02@gmail.com',
      gender: 'Female',
      dob: '12.04.1999',
      doj: '01.03.2021',
      branch: 'Test',
      scheme: 'GNS002',
      mode: 'Cash',
      amount: '2000',
      agent: 'Ravi',
      address: 'Street 2',
      state: 'TN',
      district: 'Madurai',
      city: 'Madurai',
      pincode: '625001',
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
        <Text style={styles.headerName}>{data.name}</Text>
        <Text style={styles.headerPhone}>{data.phone}</Text>
      </View>

      {/* Details */}
      {renderRow('Email ID:', data.email)}
      {renderRow('Gender:', data.gender)}
      {renderRow('Date of Birth:', data.dob)}
      {renderRow('Date of Joining:', data.doj)}
      {renderRow('Branch:', data.branch)}
      {renderRow('Select Scheme:', data.scheme)}
      {renderRow('Payment Mode:', data.mode)}
      {renderRow('Amount:', data.amount)}
      {renderRow('Agent:', data.agent)}
      {renderRow('Address:', data.address)}
      {renderRow('State:', data.state)}
      {renderRow('District:', data.district)}
      {renderRow('City:', data.city)}
      {renderRow('Pincode:', data.pincode)}
    </View>
  );

  return (
    <LinearGradient colors={['#061C3F', '#0A5E6A']} style={styles.gradient}>
      <Header
        title="Customer Details"
        showBack={true}
        rightButton={
          <Pressable
            onPress={() => navigation.navigate('AddCust')}
            android_ripple={{ color: 'rgba(255,255,255,0.15)' }}
            style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
          >
            <Feather name="plus-circle" size={24} color="#fff" />
          </Pressable>
        }
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        {customers.map(renderCustomerCard)}
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
    padding: 16,
    paddingTop: 30,
  },

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
    color: '#fff',
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
});

export default Test;
