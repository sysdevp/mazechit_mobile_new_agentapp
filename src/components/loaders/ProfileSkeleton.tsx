import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { SkeletonBox } from './SkeletonBox';

const ProfileSkeleton = () => {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <SkeletonBox width={24} height={24} radius={4} />
        <SkeletonBox width={90} height={18} style={{ marginLeft: 12 }} />
      </View>

      {/* Avatar */}
      <View style={styles.avatarWrapper}>
        <SkeletonBox width={140} height={140} radius={70} />
      </View>

      {/* Info Fields */}
      {[1, 2, 3].map(i => (
        <View key={i} style={styles.field}>
          <SkeletonBox width={80} height={14} />
          <SkeletonBox width="70%" height={16} style={{ marginTop: 8 }} />
          <SkeletonBox
            width="100%"
            height={1}
            style={{ marginTop: 12, opacity: 0.3 }}
          />
        </View>
      ))}

      {/* Action Buttons */}
      <View style={styles.buttonRow}>
        <SkeletonBox width="48%" height={48} radius={14} />
        <SkeletonBox width="48%" height={48} radius={14} />
      </View>

      {/* Note */}
      <SkeletonBox
        width="80%"
        height={12}
        style={{ alignSelf: 'center', marginTop: 20 }}
      />

      {/* Footer */}
      <View style={styles.footer}>
        <SkeletonBox width={60} height={12} />
        <SkeletonBox width={40} height={10} style={{ marginTop: 4 }} />
      </View>
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
      marginBottom: 30,
    },
    avatarWrapper: {
      alignItems: 'center',
      marginBottom: 40,
    },
    field: {
      marginBottom: 24,
    },
    buttonRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 20,
    },
    footer: {
      alignItems: 'center',
      marginTop: 40,
    },
  });
  

export default ProfileSkeleton;
