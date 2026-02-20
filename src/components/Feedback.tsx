import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Header from './Header';
import Icon from 'react-native-vector-icons/Ionicons';

const Feedback = () => {
  const [feedback, setFeedback] = useState('');

  return (
    <LinearGradient colors={['#061C3F', '#0A5E6A']} style={styles.gradient}>
      <Header title="Feedback" showBack={true} />

      {/* User Card */}
      <View style={styles.userCard}>
        <View style={styles.profileCircle}>
          <Icon name="person" size={30} color="#666" />
        </View>
        <View>
          <Text style={styles.userName}>Lokesh Kumar</Text>
          <Text style={styles.userPhone}>9876543210</Text>
        </View>
      </View>

      <View style={styles.container}>
        {/* Feedback */}
        <Text style={[styles.label, { marginTop: 0 }]}>
          Send a message to the organizer to express your interest in joining
          this scheme.
        </Text>

        <TextInput
          style={styles.textArea}
          placeholder="Write feedback..."
          placeholderTextColor="#A9A9A9"
          value={feedback}
          onChangeText={setFeedback}
          multiline
        />

        {/* Submit Button */}
        <TouchableOpacity style={styles.submitBtn}>
          <Text style={styles.submitText}>Send Message</Text>
        </TouchableOpacity>
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

  container: {
    marginTop: 20,
  },

  userCard: {
    backgroundColor: '#ffffff33',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
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

  label: {
    color: '#fff',
    fontSize: 14,
    // fontWeight: '600',
    marginBottom: 8,
  },

  dateInput: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  dateText: {
    color: '#fff',
    fontSize: 15,
  },

  textArea: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1F3A60',
    padding: 12,
    color: '#fff',
    textAlignVertical: 'top',
    minHeight: 120,
  },

  submitBtn: {
    backgroundColor: '#2F56F6',
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 30,
  },

  submitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
});

export default Feedback;
