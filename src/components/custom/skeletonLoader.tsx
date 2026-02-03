import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ScrollView } from 'react-native';

const SkeletonItem = () => {
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(shimmer, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: false,
      }),
    ).start();
  }, []);

  const bgColor = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: ['#2f4f5a', '#3f6a78'],
  });

  return (
    <Animated.View style={[styles.card, { backgroundColor: bgColor }]}>
      <View style={styles.avatar} />

      <View style={{ flex: 1 }}>
        <View style={styles.lineSmall} />
        <View style={styles.lineTiny} />
      </View>

      <View style={styles.amount} />
    </Animated.View>
  );
};

const SkeletonLoader = () => {
  return (
    <View style={styles.container}>
      {/* Search Skeleton */}
      <View style={styles.searchSkeleton} />

      <ScrollView showsVerticalScrollIndicator={false}>
        {[1, 2, 3, 4, 5].map(i => (
          <SkeletonItem key={i} />
        ))}
      </ScrollView>
    </View>
  );
};

export default SkeletonLoader;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#083c4a',
    padding: 12,
  },
  searchSkeleton: {
    height: 42,
    borderRadius: 10,
    backgroundColor: '#2f4f5a',
    marginBottom: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#1f3944',
    marginRight: 12,
  },
  lineSmall: {
    height: 14,
    width: '60%',
    borderRadius: 6,
    backgroundColor: '#1f3944',
    marginBottom: 6,
  },
  lineTiny: {
    height: 12,
    width: '40%',
    borderRadius: 6,
    backgroundColor: '#1f3944',
  },
  amount: {
    width: 70,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#1f3944',
  },
});
