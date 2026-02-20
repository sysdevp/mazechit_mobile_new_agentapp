import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { SkeletonBox } from './SkeletonBox';

const GenerateReportSkeleton = () => {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <SkeletonBox width={24} height={24} radius={4} />
        <SkeletonBox width={140} height={18} style={{ marginLeft: 12 }} />
      </View>

      {/* Customer Card */}
      <View style={styles.card}>
        <SkeletonBox width="50%" height={18} />
        <SkeletonBox width="40%" height={14} style={{ marginTop: 6 }} />
        <SkeletonBox
          width={80}
          height={14}
          style={{ position: 'absolute', right: 16, top: 16 }}
        />
      </View>

      {/* Details Card */}
      <View style={styles.card}>
        {Array.from({ length: 6 }).map((_, i) => (
          <View key={i} style={styles.row}>
            <SkeletonBox width="40%" height={14} />
            <SkeletonBox width="25%" height={14} />
          </View>
        ))}
      </View>

      {/* Received Amount Input */}
      <SkeletonBox width={140} height={16} style={styles.sectionTitle} />
      <SkeletonBox width="100%" height={52} radius={14} style={styles.mb} />

      {/* Table Header */}
      <View style={styles.tableHeader}>
        {['A', 'P', 'P', 'P', 'B', 'Pay'].map((_, i) => (
          <SkeletonBox key={i} width="14%" height={14} />
        ))}
      </View>

      {/* Table Rows */}
      {[1, 2].map(i => (
        <View key={i} style={styles.tableRow}>
          <SkeletonBox width="12%" height={14} />
          <SkeletonBox width="18%" height={14} />
          <SkeletonBox width="12%" height={14} />
          <SkeletonBox width="12%" height={14} />
          <SkeletonBox width="12%" height={14} />
          <SkeletonBox width="12%" height={14} />
        </View>
      ))}

      {/* Total Row */}
      <View style={styles.totalRow}>
        <SkeletonBox width={80} height={16} />
        <SkeletonBox width={60} height={16} />
      </View>

      {/* Advance */}
      <View style={styles.advanceRow}>
        <SkeletonBox width={100} height={16} />
        <SkeletonBox width={60} height={16} />
      </View>

      {/* Payment Mode */}
      <SkeletonBox width={140} height={16} style={styles.sectionTitle} />
      <SkeletonBox width="100%" height={52} radius={14} />
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
  card: {
    backgroundColor: '#123a4a',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    marginBottom: 8,
    marginTop: 6,
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 14,
  },
  advanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#1a4a57',
    padding: 14,
    borderRadius: 14,
    marginBottom: 18,
  },
  mb: {
    marginBottom: 18,
  },
});

export default GenerateReportSkeleton;
