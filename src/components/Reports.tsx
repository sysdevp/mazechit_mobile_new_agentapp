import React from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Header from './Header';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

const Reports = () => {

  const navigation = useNavigation<any>();
  
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

  return (
    <LinearGradient colors={['#061C3F', '#0A5E6A']} style={styles.gradient}>
      <Header title="Reports" />

      <View style={{ marginTop: 10 }}>
        {reportItems.map((item, index) => (
          <Pressable
            key={index}
            style={styles.card}
            onPress={() => navigation.navigate(item.screen)} // If using navigation
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
