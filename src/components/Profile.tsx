/* ---- BUTTONS FIXED + CLEAN UI ---- */

import React, { useEffect, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Header from './Header';
import DeviceInfo from 'react-native-device-info';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ALERT_TYPE, Dialog } from 'react-native-alert-notification';
import ProfileSkeleton from './loaders/ProfileSkeleton';

const Profile = () => {
  const appVersion = DeviceInfo.getVersion();
  const companyName = DeviceInfo.getApplicationName();

  const [isLoading, setIsLoading] = useState<Boolean>(false);

  const [user, setUser] = useState<any>('');

  const navigation = useNavigation<any>();

  // --- user details fetch ---

  const userData = async () => {
    const value = JSON.parse(
      (await AsyncStorage.getItem('loginDetails')) ?? '{}',
    );

    console.log(value);
    setUser(value);
  };

  const handleChangePassword = () => {
    navigation.navigate('Password');
    console.log('Change Password Clicked');
  };

  const handleLogout = async () => {
    setIsLoading(true);

    try {
      await AsyncStorage.removeItem('loginDetails');
      Dialog.show({
        type: ALERT_TYPE.SUCCESS,
        title: 'Success',
        textBody: 'Logged out successfully',
        button: 'close',
      });
      navigation.navigate('Login');
    } catch (err) {
      console.log('Error while Logout', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    userData();
  }, [])

  if (isLoading || user === '') {
    return <ProfileSkeleton />;
  }

  console.log(user, "Profile page")

  return (
    <LinearGradient colors={['#061C3F', '#0A5E6A']} style={styles.gradient}>
      <Header title="Profile"
        rightButton={
          <Pressable
            onPress={handleLogout}
            android_ripple={{ color: 'rgba(255,255,255,0.15)' }}
            style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1, paddingRight: 2 }]}
          >
            <MaterialIcons name="logout" size={22} color="#ff5b5b" />
          </Pressable>

        } />

      <View style={styles.container}>
        {/* Profile Avatar */}
        <View style={styles.imageWrapper}>
          <Image
            source={{
              uri: user?.profile_pic
            }}
            style={styles.image}
          />
        </View>

        {/* Details */}
        <View style={styles.section}>
          <Text style={styles.label}>Name</Text>
          <Text style={styles.value}>{user?.logged_user_name}</Text>
          <View style={styles.line} />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Device Name</Text>
          <Text
            style={[
              styles.value,
              { paddingLeft: user?.device_id !== "" ? 0 : 40 },
            ]}
          >
            {user?.device_id !== "" ? user?.device_id : '-'}
          </Text>

          <View style={styles.line} />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Mobile Number</Text>
          <Text
            style={[
              styles.value,
              { paddingLeft: user?.mobile_no !== "" ? 0 : 40 },
            ]}
          >{user?.mobile_no !== "" ? user?.mobile_no : '-'}</Text>
          <View style={styles.line} />
        </View>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          {/* Change Password */}
          <TouchableOpacity
            style={styles.cleanButton}
            onPress={handleChangePassword}
          >
            <Text style={styles.cleanText}>Change Password</Text>
          </TouchableOpacity>

          {/* Logout */}
          {user?.role_type == "Admin" && (

            <TouchableOpacity style={styles.cleanButton} onPress={() => navigation.navigate('Devices')}>
              <Text style={styles.cleanText}>Manage Devices</Text>
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.note}>
          *NOTE: The admin has permission to edit the details.
        </Text>
      </View>

      <View style={{ flex: 1 }}>
        <View style={styles.footer}>
          <Text style={styles.appName}>{companyName}</Text>
          <Text style={styles.version}>{`v${appVersion}`}</Text>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 30,
  },

  container: {
    marginTop: 40,
  },

  imageWrapper: {
    alignSelf: 'center',
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#ffffff20',
    borderWidth: 2,
    borderColor: '#ffffff50',
    marginBottom: 30,
  },

  section: {
    marginBottom: 25,
  },
  label: {
    color: '#CBEA00',
    fontSize: 12,
    marginBottom: 6,
  },
  value: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 6,
  },
  line: {
    height: 1,
    backgroundColor: '#ffffff30',
  },

  buttonContainer: {
    flexDirection: 'row',
    gap: 15,
    marginTop: 10,
  },

  /* clean button */
  cleanButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#ffffff15',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ffffff30',
    alignItems: 'center',
  },
  cleanText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },

  /* Logout */
  logoutButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ff5b5b50',
    backgroundColor: '#ff5b5b20',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  logoutText: {
    color: '#ff5b5b',
    fontSize: 15,
    fontWeight: '700',
  },

  note: {
    textAlign: 'center',
    color: '#ffffff90',
    marginTop: 20,
  },

  footer: {
    position: 'absolute',
    bottom: 30,
    width: '100%',
    alignItems: 'center',
  },
  appName: {
    color: '#bbb',
    fontSize: 14,
  },
  version: {
    color: '#bbb',
    fontSize: 12,
  },
  image: { width: 45, borderRadius: 30, marginRight: 15 },
});

export default Profile;
