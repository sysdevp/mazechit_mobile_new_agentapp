import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { SkeletonBox } from './SkeletonBox';

const ListHeaderSkeleton = () => {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <SkeletonBox width={24} height={24} radius={4} />
        <SkeletonBox width={120} height={18} style={{ marginLeft: 12 }} />
      </View>

      {/* Top Summary Cards */}
      <View style={styles.cardRow}>
        <SkeletonBox width="30%" height={80} radius={20} />
        <SkeletonBox width="30%" height={80} radius={20} />
        <SkeletonBox width="30%" height={80} radius={20} />
      </View>

      {/* Action Buttons */}
      <View style={styles.actionRow}>
        <SkeletonBox width="48%" height={50} radius={14} />
        <SkeletonBox width="48%" height={50} radius={14} />
      </View>

      {/* Search Bar */}
      <SkeletonBox width="100%" height={48} radius={14} style={styles.mb} />

      {/* Legend */}
      <View style={styles.legendRow}>
        <SkeletonBox width={70} height={14} radius={7} />
        <SkeletonBox width={70} height={14} radius={7} />
      </View>

      {/* Collection List */}
      {[1, 2, 3, 4, 5].map(i => (
        <View key={i} style={styles.listItem}>
          <SkeletonBox width={44} height={44} radius={22} />

          <View style={{ flex: 1, marginLeft: 12 }}>
            <SkeletonBox width="60%" height={16} />
            <SkeletonBox width="40%" height={12} style={{ marginTop: 6 }} />
          </View>

          <SkeletonBox width={80} height={32} radius={16} />
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
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  legendRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#123a4a',
    padding: 14,
    borderRadius: 16,
    marginBottom: 14,
  },
  mb: {
    marginBottom: 16,
  },
});

export default ListHeaderSkeleton;
