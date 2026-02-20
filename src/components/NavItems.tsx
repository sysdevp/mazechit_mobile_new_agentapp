import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image, Pressable, Switch } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Octicons from 'react-native-vector-icons/Octicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import type { DrawerContentComponentProps } from '@react-navigation/drawer';
import { useNavigationHistory } from '../navigation/NavigationHistoryContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ALERT_TYPE, Dialog } from 'react-native-alert-notification';

const routeNameToLabel: Record<string, string> = {
  Home: 'Dashboard',
  CutomerList: 'Add Customer',
  Collection: 'Collection',
  Reports: 'Reports',
  ViewReceipts: 'ViewReceipts',
  ReceiptDetails: 'ReceiptDetails',
  Leads: 'Leads',
  Settings: 'Settings',
  Profile: 'Profile',
};

const NavItems = ({ navigation, state }: DrawerContentComponentProps) => {
  const [selected, setSelected] = React.useState('Dashboard');
  const [isEnabled, setIsEnabled] = React.useState(false);
  const [user, setUser] = React.useState();
  const { addToHistory } = useNavigationHistory();

  // Handle back button navigation
  const handleBackPress = () => {
    const currentRoute = state.routes[state.index];
    const currentRouteName = currentRoute.name;

    // Handle nested bottom tab navigator with stack navigators
    if (currentRouteName === 'MainTabs' && currentRoute.state) {
      const tabState = currentRoute.state;
      const tabIndex = tabState.index;
      if (tabIndex !== undefined && tabState.routes[tabIndex]) {
        const tabRoute = tabState.routes[tabIndex];
        const stackName = tabRoute.name; // HomeStack, CollectionStack, etc.

        // Check if there's a nested stack state with multiple screens
        if (tabRoute.state && tabRoute.state.routes) {
          const stackIndex = tabRoute.state.index;
          // If we're not on the first screen in the stack, go back one step
          if (stackIndex !== undefined && stackIndex > 0) {
            // Navigate to the previous screen in the stack
            const previousScreenName =
              tabRoute.state.routes[stackIndex - 1].name;
            navigation.navigate('MainTabs', {
              screen: stackName,
              params: { screen: previousScreenName },
            });
            navigation.closeDrawer();
            return;
          }
        }
      }
    }

    // If we can't go back in stack, just close the drawer
    navigation.closeDrawer();
  };

  // Keep menu selection in sync with current route (including back button)
  React.useEffect(() => {
    const currentRoute = state.routes[state.index];
    const currentRouteName = currentRoute.name;

    // Handle nested bottom tab navigator with stack navigators
    if (currentRouteName === 'MainTabs' && currentRoute.state) {
      const tabState = currentRoute.state;
      const tabIndex = tabState.index;
      if (tabIndex !== undefined && tabState.routes[tabIndex]) {
        const tabRoute = tabState.routes[tabIndex];
        const stackName = tabRoute.name; // HomeStack, CollectionStack, etc.

        // Check if there's a nested stack state
        if (tabRoute.state && tabRoute.state.routes) {
          const stackIndex = tabRoute.state.index;
          if (stackIndex !== undefined && tabRoute.state.routes[stackIndex]) {
            const screenName = tabRoute.state.routes[stackIndex].name;
            const mappedLabel = routeNameToLabel[screenName];
            if (mappedLabel) {
              setSelected(mappedLabel);
              return;
            }
          }
        }

        // Fallback: map stack name to label
        const stackToLabel: Record<string, string> = {
          HomeStack: 'Dashboard',
          CollectionStack: 'Collection',
          LeadsStack: 'Leads',
          ProfileStack: 'Profile',
        };
        const label = stackToLabel[stackName];
        if (label) {
          setSelected(label);
        }
      }
    } else {
      const mappedLabel = routeNameToLabel[currentRouteName];
      if (mappedLabel) {
        setSelected(mappedLabel);
      }
    }
  }, [state]);
  const handleLogout = async () => {

    Dialog.show({
      type: ALERT_TYPE.SUCCESS,
      title: 'Success',
      textBody: 'Logged out successfully',
      button: 'close',
    });
    await AsyncStorage.removeItem('loginDetails');
    navigation.navigate('Login');
    navigation.closeDrawer();
  };

  // --- user details fetch ---

  const userData = async () => {
    const value = JSON.parse(
      (await AsyncStorage.getItem('loginDetails')) ?? '{}',
    );

    console.log(value);
    setUser(value);
  };


  useEffect(() => {
    userData()
  }, [])

  console.log(user, "User Data From Nav Items components")

  return (
    <View style={styles.wrapper}>
      {/* Top Row: Back + Online/Offline */}
      <View style={styles.closeRow}>
        <Pressable onPress={handleBackPress}>
          <Feather name="arrow-left" color="#fff" size={28} />
        </Pressable>

        {/* <View style={styles.toggle}>
          <Text style={styles.statusText}>
            {isEnabled ? 'Online' : 'Offline'}
          </Text>

          <Switch
            value={isEnabled}
            onValueChange={setIsEnabled}
            thumbColor="#fff"
            trackColor={{ false: '#555', true: '#E9E648' }}
          />
        </View> */}
      </View>

      {/* Profile Section */}
      <Pressable
        onPress={() => {
          navigation.navigate('MainTabs', {
            screen: 'ProfileStack',
            params: { screen: 'Profile' },
          });
          navigation.closeDrawer();
        }}
      >
        <View style={styles.profileBox}>
          <Image
            source={{ uri: `https://placehold.co/100x100.png?text=${user?.logged_user_name?.slice(0, 1).toUpperCase()}` }}
            style={styles.profileImg}
          />
          <Text style={styles.name}>{user?.logged_user_name}</Text>
          <Text style={styles.role}>{user?.role_type}</Text>
        </View>
      </Pressable>

      {/* Menu List */}
      <View style={styles.menuList}>
        <MenuItem
          icon={<MaterialIcons name="dashboard" color="#fff" size={20} />}
          label="Dashboard"
          screen="Home"
          selected={selected}
          setSelected={setSelected}
          onPress={() => {
            addToHistory('HomeStack', 'Home');
            navigation.navigate('MainTabs', {
              screen: 'HomeStack',
              params: { screen: 'Home' },
            });
            navigation.closeDrawer();
          }}
        />

        <MenuItem
          icon={<Feather name="user-plus" size={20} color="#fff" />}
          label="Customer"
          screen="CutomerList"
          selected={selected}
          setSelected={setSelected}
          onPress={() => {
            addToHistory('HomeStack', 'CutomerList');
            navigation.navigate('MainTabs', {
              screen: 'HomeStack',
              params: { screen: 'CutomerList' },
            });
            navigation.closeDrawer();
          }}
        />

        <MenuItem
          icon={<Octicons name="file-directory" size={20} color="#fff" />}
          label="Collection"
          screen="Collection"
          selected={selected}
          setSelected={setSelected}
          onPress={() => {
            addToHistory('CollectionStack', 'Collection');
            navigation.navigate('MainTabs', {
              screen: 'CollectionStack',
              params: { screen: 'Collection' },
            });
            navigation.closeDrawer();
          }}
        />
        {/* <MenuItem
          icon={<Octicons name="file-directory" size={20} color="#fff" />}
          label="Collection"
          screen="Collection"
          selected={selected}
          setSelected={setSelected}
          onPress={() => {
            const from = state.routeNames[state.index];
            navigation.navigate('Collection', { from });
            navigation.closeDrawer();
          }}
        /> */}

        <MenuItem
          icon={<FontAwesome name="files-o" size={20} color="#fff" />}
          label="Reports"
          selected={selected}
          setSelected={setSelected}
          onPress={() => {
            navigation.navigate('MainTabs', {
              screen: 'HomeStack',
              params: { screen: 'Reports' },
            });
            navigation.closeDrawer();
          }}
        />

        <MenuItem
          icon={<Feather name="bar-chart-2" size={20} color="#fff" />}
          label="Leads"
          selected={selected}
          setSelected={setSelected}
          onPress={() => {
            addToHistory('LeadsStack', 'Leads');
            navigation.navigate('MainTabs', {
              screen: 'LeadsStack',
              params: { screen: 'Leads' },
            });
            navigation.closeDrawer();
          }}
        />

        <MenuItem
          icon={<Feather name="settings" size={20} color="#fff" />}
          label="Settings"
          selected={selected}
          setSelected={setSelected}
          onPress={() => {
            navigation.navigate('MainTabs', {
              screen: 'ProfileStack',
              params: { screen: 'Profile' },
            });
            navigation.closeDrawer();
          }}
        />

        <MenuItem
          icon={<Feather name="log-out" size={20} color="#fff" />}
          label="Logout"
          last
          selected={selected}
          setSelected={setSelected}
          onPress={handleLogout}
        />
      </View>
    </View>
  );
};

const MenuItem = ({
  icon,
  label,
  last,
  selected,
  setSelected,
  onPress,
}: any) => {
  const isActive =
    label === 'Settings' ? selected === 'Profile' : selected === label;

  return (
    <Pressable
      style={[
        styles.menuItem,
        last && { marginTop: 20 },
        isActive && styles.activeItem, // Apply highlight
      ]}
      android_ripple={{ color: '#0E3B52' }}
      onPress={() => {
        setSelected(label);
        onPress && onPress();
      }}
    >
      {icon}
      <Text style={[styles.menuLabel, isActive && styles.activeLabel]}>
        {label}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 30,
    backgroundColor: '#00334E',
  },

  closeRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 10,
  },

  toggle: {
    flexDirection: 'row',
    gap: 5,
    alignItems: 'center',
  },

  statusText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '300',
  },

  profileBox: {
    alignItems: 'center',
    marginBottom: 30,
  },

  profileImg: {
    width: 80,
    height: 80,
    borderRadius: 50,
    marginBottom: 10,
  },

  name: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },

  role: {
    color: '#C4D2D7',
    fontSize: 13,
  },

  menuList: {
    width: '80%',
    marginTop: 20,
  },

  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    gap: 15,
    borderRadius: 8,
  },

  menuLabel: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '500',
  },

  activeItem: {
    backgroundColor: '#0E3B52',
    borderRadius: 8,
  },

  activeLabel: {
    color: '#E9E648',
    fontWeight: '700',
  },
});

export default NavItems;
