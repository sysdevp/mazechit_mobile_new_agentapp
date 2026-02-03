import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { SkeletonBox } from './SkeletonBox';

const DashboardSkeleton = () => {
  return (
    <ScrollView style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <SkeletonBox width={40} height={40} radius={20} />
        <SkeletonBox width={160} height={18} style={{ marginLeft: 12 }} />
      </View>

      {/* Attendance */}
      <SkeletonBox width="100%" height={70} radius={14} style={styles.mb} />

      {/* Stats Cards */}
      <View style={styles.row}>
        <SkeletonBox width="48%" height={80} />
        <SkeletonBox width="48%" height={80} />
      </View>

      <View style={styles.row}>
        <SkeletonBox width="48%" height={80} />
        <SkeletonBox width="48%" height={80} />
      </View>

      {/* Balance / Progress */}
      <View style={styles.row}>
        <SkeletonBox width={80} height={28} radius={20} />
        <SkeletonBox width={80} height={28} radius={20} />
      </View>

      {/* Cash in Hand Big Card */}
      <SkeletonBox width="100%" height={120} radius={18} style={styles.mb} />

      {/* Action Buttons */}
      <View style={styles.rowCenter}>
        <SkeletonBox width={60} height={60} radius={30} />
        <SkeletonBox width={60} height={60} radius={30} />
        <SkeletonBox width={60} height={60} radius={30} />
      </View>

      {/* Receipt List */}
      <SkeletonBox width={140} height={18} style={styles.mb} />

      {[1, 2, 3].map(i => (
        <SkeletonBox
          key={i}
          width="100%"
          height={70}
          radius={14}
          style={styles.mb}
        />
      ))}

    </ScrollView>
  );
};

export default DashboardSkeleton;

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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  rowCenter: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 20,
  },
  mb: {
    marginBottom: 16,
  },
});
