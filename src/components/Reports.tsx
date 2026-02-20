import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Header from './Header';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ProfileSkeleton from './loaders/ProfileSkeleton';

const Reports = () => {

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const navigation = useNavigation<any>();
  
    // --- user details fetch ---

    const userData = async () => {
      setIsLoading(true);
      try {
        const value = JSON.parse(
          (await AsyncStorage.getItem('loginDetails')) ?? '{}',
        );
  
        console.log(value, "user data");
        setIsAdmin(value?.role_type === 'Admin' ? true : false);
      } catch (error) {
        console.log(error, "error while fetching user data");
      } finally {
        setIsLoading(false);
      }
    };

  const reportItems = [
    { title: 'Outstanding Report', icon: 'document-text-outline', screen: 'OutstandingReport' },
    { title: 'Collection Report', icon: 'cash-outline', screen: 'CollectionReport' },
    { title: 'Collection Feedback Report', icon: 'cash-outline', screen: 'CollectionFeedbackReport' },
    { title: 'Lead Report', icon: 'person-outline', screen: 'LeadReport' },
    { title: 'Day Closing Report', icon: 'calendar-outline', screen: 'DayClosingReport' },
    { title: 'Auction Report', icon: 'newspaper-outline', screen: 'AuctionReport' },
    { title: 'Payment Report', icon: 'card-outline', screen: 'PaymentReport' },
    { title: 'Enrollment Report', icon: 'people-outline', screen: 'EnrollmentReport' },
  ];  

  
// reports allowed for NON-admin
const nonAdminScreens = [
  'CollectionReport',
  'OutstandingReport',
  'LeadReport',
  'CollectionFeedbackReport',
];

// final list to render
const visibleReports = isAdmin
  ? reportItems
  : reportItems.filter(item =>
      nonAdminScreens.includes(item.screen)
    );

  useEffect(() => {
    userData();
  }, [])

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  return (
    <LinearGradient colors={['#061C3F', '#0A5E6A']} style={styles.gradient}>
      <Header title="Reports" />

      <View style={{ marginTop: 10 }}>
        {visibleReports.map((item, index) => (
          <Pressable
            key={index}
            style={styles.card}
            onPress={() => navigation.navigate(item.screen)}
          >
            <View style={styles.leftRow}>
              <Ionicons name={item.icon} size={22} color="#fff" />
              <Text style={styles.cardText}>{item.title}</Text>
            </View>

            <Ionicons name="chevron-forward" size={22} color="#fff" />
          </Pressable>
        ))}
      </View>
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
    backgroundColor: '#ffffff22',
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#ffffff22',
  },

  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  cardText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default Reports;
