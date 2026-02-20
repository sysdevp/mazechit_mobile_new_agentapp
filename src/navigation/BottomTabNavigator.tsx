import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { HomeStack } from './HomeStack';
import { CollectionStack } from './CollectionStack';
import { LeadsStack } from './LeadsStack';
import { ProfileStack } from './ProfileStack';
import { useNavigationHistory } from './NavigationHistoryContext';
import Feather from 'react-native-vector-icons/Feather';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Octicons from 'react-native-vector-icons/Octicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const Tab = createBottomTabNavigator();

// Stack name to root screen mapping
const stackToRootScreen: Record<string, string> = {
  HomeStack: 'Home',
  CollectionStack: 'Collection',
  LeadsStack: 'Leads',
  ProfileStack: 'Profile',
};

export function BottomTabNavigator() {
  const navigation = useNavigation();
  const { addToHistory } = useNavigationHistory();

  React.useEffect(() => {
    // Track navigation state changes (tab switches, screen navigations)
    const unsubscribeState = navigation.addListener('state', (e) => {
      const state = e.data.state;
      if (state) {
        const tabState = state.routes[state.index];
        if (tabState && tabState.state) {
          const stackName = tabState.name;
          const stackState = tabState.state;
          const screenIndex = stackState.index || 0;
          const currentScreen = stackState.routes[screenIndex]?.name || stackToRootScreen[stackName];
          
          if (stackName && currentScreen) {
            // Small delay to ensure state is fully updated
            setTimeout(() => {
              addToHistory(stackName, currentScreen);
            }, 100);
          }
        }
      }
    });

    // Also track focus events for more reliability
    const unsubscribeFocus = navigation.addListener('focus', () => {
      const state = navigation.getState();
      if (state) {
        const tabState = state.routes[state.index];
        if (tabState && tabState.state) {
          const stackName = tabState.name;
          const stackState = tabState.state;
          const screenIndex = stackState.index || 0;
          const currentScreen = stackState.routes[screenIndex]?.name || stackToRootScreen[stackName];
          
          if (stackName && currentScreen) {
            addToHistory(stackName, currentScreen);
          }
        }
      }
    });

    return () => {
      unsubscribeState();
      unsubscribeFocus();
    };
  }, [navigation, addToHistory]);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#E9E648',
        tabBarInactiveTintColor: '#C4D2D7',
        tabBarStyle: {
          backgroundColor: '#00334E',
          borderTopWidth: 0,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      <Tab.Screen
        name="HomeStack"
        component={HomeStack}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="dashboard" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="CollectionStack"
        component={CollectionStack}
        options={{
          tabBarLabel: 'Collection',
          tabBarIcon: ({ color, size }) => (
            <Octicons name="file-directory" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="LeadsStack"
        component={LeadsStack}
        options={{
          tabBarLabel: 'Leads',
          tabBarIcon: ({ color, size }) => (
            <Feather name="bar-chart-2" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="ProfileStack"
        component={ProfileStack}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account-cog" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

