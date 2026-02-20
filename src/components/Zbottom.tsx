import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  PanResponder,
  Dimensions,
  FlatList,
  ScrollView,
  Image,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const { height } = Dimensions.get('window');
const OPEN_POSITION = height * 0.25; // 75% visible

// Calculate closed position dynamically
const calculateClosedPosition = () => {
  // Header height: ~80-100px
  // Attendance card (when visible): ~90px
  // Income cards: ~170px (2 rows of cards with margins)
  // Tab switcher: ~50px
  // Balance card OR Stack content: ~180px
  // Menu icons (when balance tab): ~140px
  // Margins and padding: ~60px

  const estimatedContentHeight = 100 + 170 + 50 + 180 + 140 + 60;
  return Math.max(estimatedContentHeight, height * 0.7); // Fallback to 65% if calculated is smaller
};

const CLOSED_POSITION = calculateClosedPosition() - 50;

interface BottomDrawerProps {
  contentHeight?: number;
}

export default function BottomDrawer({ contentHeight }: BottomDrawerProps) {
  // Use prop if provided, otherwise use calculated default
  const closedPos = contentHeight ? contentHeight + 20 : CLOSED_POSITION;

  const translateY = useRef(new Animated.Value(closedPos)).current;
  const lastGestureY = useRef(closedPos);

  useEffect(() => {
    // Update position when contentHeight changes
    if (contentHeight) {
      const newClosedPos = contentHeight + 20;
      Animated.timing(translateY, {
        toValue: newClosedPos,
        duration: 300,
        useNativeDriver: false,
      }).start();
      lastGestureY.current = newClosedPos;
    }
  }, [contentHeight]);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dy) > 10,
      onPanResponderGrant: () => {
        // Capture current position when gesture starts
        translateY.stopAnimation(value => {
          lastGestureY.current = value;
        });
      },
      onPanResponderMove: (_, gesture) => {
        let newY = lastGestureY.current + gesture.dy;
        const currentClosedPos = contentHeight
          ? contentHeight + 20
          : CLOSED_POSITION;
        // Clamp movement
        if (newY < OPEN_POSITION) newY = OPEN_POSITION;
        if (newY > currentClosedPos) newY = currentClosedPos;
        translateY.setValue(newY);
      },
      onPanResponderRelease: (_, gesture) => {
        const currentY = lastGestureY.current + gesture.dy;
        const currentClosedPos = contentHeight
          ? contentHeight + 20
          : CLOSED_POSITION;
        const midPoint = (OPEN_POSITION + currentClosedPos) / 2;

        if (gesture.dy < -50 || currentY < midPoint) {
          // Swipe up or past midpoint → open
          Animated.spring(translateY, {
            toValue: OPEN_POSITION,
            useNativeDriver: false,
            tension: 50,
            friction: 8,
          }).start();
        } else {
          // Swipe down or below midpoint → close
          Animated.spring(translateY, {
            toValue: currentClosedPos,
            useNativeDriver: false,
            tension: 50,
            friction: 8,
          }).start();
        }
      },
    }),
  ).current;

  const data = [
    { id: '1', name: 'Grocery Store', amount: '-$45.20' },
    { id: '2', name: 'Salary Deposit', amount: '+$2,500.00' },
    { id: '3', name: 'Coffee Shop', amount: '-$5.80' },
    { id: '4', name: 'Gas Station', amount: '-$42.00' },
    { id: '5', name: 'Online Shopping', amount: '-$89.99' },
  ];

  const transactions = [
    { name: 'Octavia Devi', date: '12 Dec, 10:32 AM', amount: 15.89 },
    { name: 'Arjun Mehta', date: '10 Dec, 04:15 PM', amount: 250.0 },
    { name: 'Sofia Rahman', date: '9 Dec, 08:45 AM', amount: 42.5 },
    { name: 'Daniel Joseph', date: '8 Dec, 11:22 AM', amount: 520.75 },
    { name: 'Priya Singh', date: '6 Dec, 06:50 PM', amount: 120.0 },
    { name: 'Kevin Roshan', date: '3 Dec, 01:10 PM', amount: 89.99 },
  ];

  return (
    <Animated.View
      style={[styles.container, { transform: [{ translateY }] }]}
      {...panResponder.panHandlers}
    >
      <LinearGradient colors={['#061C3F', '#0A5E6A']} style={styles.gradient}>
        {/* Handle */}
        <View style={styles.handle} />

        {/* Receipt Details */}
        <View style={styles.transactionHeader}>
          <Text style={styles.transactionTitle}>Receipt Details</Text>
        </View>
        <ScrollView showsVerticalScrollIndicator={false}>
          {transactions.map((item, index) => (
            <View key={index} style={styles.transactionItem}>
              <Image
                source={{
                  uri: `https://placehold.co/50x50.png?text=${item.name.slice(
                    0,
                    1,
                  )}`,
                }}
                style={styles.avatar}
              />

              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.date}>{item.date}</Text>
              </View>

              <Text
                style={[
                  styles.amount,
                  { color: item.amount > 0 ? '#7CFF78' : 'red' },
                ]}
              >
                {item.amount > 0 ? '+' : ''}
                {item.amount}
              </Text>
            </View>
          ))}
        </ScrollView>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: height,
    backgroundColor: '#0A5E6A',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  handle: {
    width: 60,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ccc',
    alignSelf: 'center',
    marginVertical: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    paddingHorizontal: 16,
    marginBottom: 10,
    color: '#fff',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },

  /* TRANSACTIONS */
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
    marginBottom: 10,
  },

  transactionTitle: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },

  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff22',
    padding: 14,
    borderRadius: 15,
    marginBottom: 10,
  },

  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  date: {
    color: '#E9E648',
    fontSize: 12,
  },

  amount: {
    fontSize: 16,
    fontWeight: '600',
  },
  gradient: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 30,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  avatar: { width: 45, borderRadius: 30, marginRight: 15 },
});
