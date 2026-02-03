import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { SkeletonBox } from './SkeletonBox';

const HistorySkeleton = () => {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <SkeletonBox width={24} height={24} radius={4} />
        <SkeletonBox width={160} height={18} style={{ marginLeft: 12 }} />
      </View>

      {/* Customer Card */}
      <View style={styles.customerCard}>
        <SkeletonBox width={48} height={48} radius={24} />
        <View style={{ marginLeft: 12 }}>
          <SkeletonBox width={140} height={16} />
          <SkeletonBox width={100} height={14} style={{ marginTop: 6 }} />
        </View>
      </View>

      {/* Follow-up Cards */}
      {[1, 2, 3, 4, 5].map(i => (
        <View key={i} style={styles.followCard}>
          {/* Description + Status */}
          <View style={styles.cardTop}>
            <SkeletonBox width="70%" height={16} />
            <SkeletonBox width={80} height={26} radius={13} />
          </View>

          {/* Dates */}
          <View style={styles.cardBottom}>
            <SkeletonBox width="40%" height={12} />
            <SkeletonBox width="45%" height={12} />
          </View>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b2c3d',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  customerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#123a4a',
    padding: 14,
    borderRadius: 16,
    marginBottom: 16,
  },
  followCard: {
    backgroundColor: '#1a4a57',
    padding: 14,
    borderRadius: 16,
    marginBottom: 14,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

export default HistorySkeleton;
