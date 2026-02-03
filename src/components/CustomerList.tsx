import React, { useCallback, useEffect, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  ScrollView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Header from './Header';
import Feather from 'react-native-vector-icons/Feather';
import Icon from 'react-native-vector-icons/Ionicons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import COMMON from '../comon/Common';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const DATA = [
  {
    id: 'CUS-00001',
    name: 'Lokesh Kumar',
    phone: '8648231445',
  },
  {
    id: 'CUS-00001',
    name: 'Manoj',
    phone: '8648231445',
  },
];

const CustomerList = () => {

  const [isLoading, setIsLoading] = useState<Boolean>(true);
  const navigation = useNavigation<any>();
  const [user, setUser] = useState();

  const [customers, setCustomers] = useState<any[]>();

  const baseUrl = COMMON.BaseUrl;
  const dataBase = COMMON.DbName;

  const userData = async () => {
    const value = JSON.parse(
      (await AsyncStorage.getItem('loginDetails')) ?? '{}',
    );

    console.log(value);

    setUser(value);
  };

  const fetchCustomers = async () => {
    setIsLoading(true)
    const payload = {
      db: dataBase,
      tenant_id: user?.tenant_id,
      branch_id: user?.branch_id,
    };

    try {
      const response = await axios.post(`${baseUrl}/mobile-list-customers`, null, {
        params: payload,
      });

      const res = response.data.data;
      console.log(res)
      setCustomers(res);
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
      if (user?.tenant_id) {
        fetchCustomers();
      }
    }, [user])
  );

  return (
    <LinearGradient colors={['#061C3F', '#0A5E6A']} style={styles.gradient}>
      <Header
        title="Customer"
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

      <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: 20 }}>
        {customers?.map((item, index) => (
          <Pressable key={index}
            // onPress={() => navigation.navigate('CutomerDetails', { id: item.customer_id})}
            style={({ pressed }) => [
              styles.card,
              pressed && { opacity: 0.6 }
            ]}>
            <View style={styles.row}>
              <View style={styles.avatar}>
                <Icon name="person-circle-outline" size={45} color="#8CA7C2" />
              </View>

              <View style={styles.info}>
                <Text style={styles.name}>{item.customer_name}</Text>
                <Text style={styles.phone}>{item.mobile_no}</Text>
              </View>

              <Text style={styles.customerId}>{item.customer_code}</Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 30,
  },

  card: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  avatar: {
    marginRight: 12,
  },

  info: {
    flex: 1,
  },

  name: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  phone: {
    color: '#CDE28A',
    marginTop: 2,
    fontSize: 13,
  },

  customerId: {
    color: '#fff',
    opacity: 0.7,
    fontWeight: '500',
  },
});

export default CustomerList;
