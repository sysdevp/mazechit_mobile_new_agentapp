import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const BottomNav: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute();

  const navItems = [
    {
      id: 'home',
      label: 'Home',
      iconProvider: 'FontAwesome',
      icon: 'home',
      route: 'Dashboard',
  },
    {
      id: 'mychits',
      label: 'My Chits',
      iconProvider: 'MaterialCommunityIcons',
      icon: 'sack',
      route: 'Mychits',
    },
    {
      id: 'due',
      label: 'Dues',
      iconProvider: 'MaterialCommunityIcons',
      icon: 'wallet',
      route: 'Paydues',
    },
    {
      id: 'profile',
      label: 'Profile',
      iconProvider: 'FontAwesome',
      // icon: 'user',
      icon: 'account-cog',
      route: 'Profile',
    },
  ];

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        {navItems.map(item => {
          const isActive = route.name === item.route;

          return (
            <TouchableOpacity
              key={item.id}
              style={styles.tab}
              activeOpacity={0.7}
              hitSlop={{ top: 15, bottom: 15, left: 20, right: 20 }}
              onPress={() => navigation.navigate(item.route as never)}
            >
              {item.iconProvider == 'FontAwesome' ? (
                <FontAwesome
                  name={item.icon}
                  size={20}
                  color={isActive ? '#E9E648' : '#fff'}
                />
              ) : (
                <MaterialCommunityIcons
                  name={item.icon}
                  size={20}
                  color={isActive ? '#E9E648' : '#fff'}
                />
              )}

              <Text style={[styles.label, isActive && styles.activeLabel]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export default BottomNav;

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 20,
    left: 10,
    right: 10,
  },
  container: {
    backgroundColor: '#003C59',
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderRadius: 30,
    elevation: 10,
  },
  tab: {
    alignItems: 'center',
  },
  label: {
    color: '#ffffff',
    fontSize: 12,
    marginTop: 4,
    opacity: 0.8,
  },
  activeLabel: {
    color: '#FFD700',
    opacity: 1,
  },
});
