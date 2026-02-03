import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  UIManager,
  LayoutAnimation,
  TouchableOpacity,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from './Header';
import { ALERT_TYPE, Dialog } from 'react-native-alert-notification';
import axios from 'axios';
import COMMON from '../comon/Common';
import { useNavigation } from '@react-navigation/native';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental &&
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const OFFLINE_RECEIPTS_KEY = 'offline_receipts';

const OfflineReceiptSync = () => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [leadReports, setLeadReports] = useState<any[]>([]);
  const [paymentTypeMap, setPaymentTypeMap] = useState<Record<number, string>>(
    {},
  );
  const [search, setSearch] = useState('');

  const navigation = useNavigation<any>();

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const toggleExpand = (index: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  // ---------- Date formatter ----------
  const formatDate = (date: any) => {
    const d = new Date(date);
    return `${d.getFullYear()}-${(d.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
  };

  // ---------- Payment modes ----------
  const fetchPaymentModes = async () => {
    const stored = await AsyncStorage.getItem('paymentMode');
    if (!stored) return;

    const parsed = JSON.parse(stored);
    const map = parsed.reduce(
      (acc: Record<number, string>, item: any) => {
        acc[item.payment_type_id] = item.payment_name;
        return acc;
      },
      {},
    );

    setPaymentTypeMap(map);
  };

  // ---------- Offline sync ----------
  const getSyncOfflineReceipts = async () => {
    try {
      const stored = await AsyncStorage.getItem(OFFLINE_RECEIPTS_KEY);
      if (!stored) {
        Dialog.show({
          type: ALERT_TYPE.WARNING,
          title: 'No Data',
          textBody: 'No offline receipts to sync',
          button: 'OK',
        });
        return;
      }

      const receipts = JSON.parse(stored);
      setLeadReports(receipts);

    } catch (e) {
      console.log('Sync error', e);
    }
  };

  // ---------- Hande Submit Offline sync ----------

  const syncOfflineReceipts = async () => {

    setIsLoading(true);


    try {
      const stored = await AsyncStorage.getItem(OFFLINE_RECEIPTS_KEY);
      if (!stored) return;

      let receipts = JSON.parse(stored);
      if (!receipts.length) {
        Dialog.show({
          type: ALERT_TYPE.INFO,
          title: 'No Pending Data',
          textBody: 'No offline receipts to sync',
          button: 'OK',
        });
        return;
      }

      const syncedIds: number[] = [];

      for (const receipt of receipts) {
        try {
          await axios.post(
            `${COMMON.BaseUrl}/store-customer-advance-receipt`,
            receipt,
          );
          syncedIds.push(receipt.offline_id);
        } catch (e) {
          console.log('Still offline', receipt.offline_id);
          console.log('Still offline', e);

          Dialog.show({
            type: ALERT_TYPE.WARNING,
            title: 'Sync Errror',
            textBody: `Still offline Please try again...`,
            button: 'OK',
          });
        }
      }

      receipts = receipts.filter(
        (r: any) => !syncedIds.includes(r.offline_id),
      );

      await AsyncStorage.setItem(
        OFFLINE_RECEIPTS_KEY,
        JSON.stringify(receipts),
      );

      if (syncedIds.length) {
        Dialog.show({
          type: ALERT_TYPE.SUCCESS,
          title: 'Sync Complete',
          textBody: `${syncedIds.length} receipt(s) synced`,
          button: 'OK',
        });

        getSyncOfflineReceipts();
        navigation.goBack()
      }
    } catch (e) {
      console.log('Sync error', e);

      Dialog.show({
        type: ALERT_TYPE.WARNING,
        title: 'Sync Complete',
        textBody: `Still offline Please try again...`,
        button: 'OK',
      });
    } finally {
      setIsLoading(isLoading);
    }
  };

  // const syncOfflineReportReceipts = async () => {
  //   try {
  //     const stored = await AsyncStorage.getItem(
  //       'offline_report_receipts',
  //     );
  //     if (!stored) return;

  //     let receipts = JSON.parse(stored);
  //     if (!receipts.length) return;

  //     const syncedIds: number[] = [];

  //     for (const receipt of receipts) {
  //       try {
  //         await axios.post(
  //           `${COMMON.BaseUrl}/mobile-add-receipt`,
  //           null,
  //           { params: receipt },
  //         );

  //         syncedIds.push(receipt.offline_id);
  //       } catch (e) {
  //         console.log(
  //           'Still offline for report receipt',
  //           receipt.offline_id,
  //         );
  //         console.log(e)
  //       }
  //     }

  //     receipts = receipts.filter(
  //       (r: any) => !syncedIds.includes(r.offline_id),
  //     );

  //     await AsyncStorage.setItem(
  //       'offline_report_receipts',
  //       JSON.stringify(receipts),
  //     );

  //     if (syncedIds.length) {
  //       Dialog.show({
  //         type: ALERT_TYPE.SUCCESS,
  //         title: 'Sync Completed',
  //         textBody: `${syncedIds.length} report receipt(s) synced`,
  //         button: 'OK',
  //       });
  //     }
  //   } catch (e) {
  //     console.log('Report sync error', e);
  //   }
  // };

  const submitOfflineReceipts = async () => {
    await syncOfflineReceipts();
    // await syncOfflineReportReceipts();
  };

  useEffect(() => {
    fetchPaymentModes();
    getSyncOfflineReceipts();
  }, []);

  console.log("Offline Data test", leadReports)

  return (
    <LinearGradient colors={['#061C3F', '#0A5E6A']} style={styles.container}>
      <Header title="Offline Receipt Sync" showBack />

      {/* SEARCH */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search"
          placeholderTextColor="#666"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* RECEIPT LIST */}
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {leadReports.length > 0 ? (
          leadReports
            .filter(item => {
              const text = search.trim().toLowerCase();
              if (!text) return true;

              return (
                item?.data?.customer_name
                  ?.toLowerCase()
                  .includes(text) ||
                item?.data?.mobile_no?.toString().includes(text)
              );
            })
            .map((item, index) => {
              const isExpanded = expandedIndex === index;

              return (
                <Pressable
                  key={index}
                  style={styles.card}
                  onPress={() => toggleExpand(index)}
                >
                  {/* HEADER */}
                  {/* <View style={styles.headerRow}>
                    <View>
                      <Text style={styles.name}>
                        {item?.data?.customer_name || 'N/A'}
                      </Text>
                      <Text style={styles.mobile}>
                        {item?.data?.mobile_no || 'N/A'}
                      </Text>
                    </View>

                    <View style={styles.rightSection}>
                      <Text style={styles.amount}>
                        {formatDate(item.received_date)}
                      </Text>
                      <Icon
                        name={
                          isExpanded
                            ? 'chevron-up'
                            : 'chevron-forward'
                        }
                        size={16}
                        color="#FFD700"
                      />
                    </View>
                  </View> */}

                  {/* Header */}
                  <View style={styles.headerRow}>
                    <View>
                      <Text style={styles.name}>
                        {item?.data?.customer_name || 'N/A'}
                      </Text>
                      <Text style={styles.mobile}>
                        {item?.data?.mobile_no || 'N/A'}
                      </Text>
                    </View>

                    <View style={styles.rightSection}>
                      <View style={styles.dateAmountRow}>
                        <View>
                          <Text style={styles.amount}>
                            {formatDate(item.received_date)}
                          </Text>
                          <Text style={[styles.amount, { textAlign: 'right', paddingTop: 2 }]}>
                            ₹ {item.amount}
                          </Text>
                        </View>
                        <Pressable onPress={() => toggleExpand(index)}>
                          <Icon
                            name={isExpanded ? 'chevron-up' : 'chevron-forward'}
                            size={16}
                            color="#FFD700"
                            style={styles.smallIcon}
                          />
                        </Pressable>
                      </View>
                    </View>
                  </View>

                  {/* EXPANDED */}
                  {isExpanded && (
                    <View style={styles.expandArea}>
                      <View style={styles.row}>
                        <Text style={styles.label}>Customer Code</Text>
                        <Text style={styles.value}>
                          {item?.data?.customer_code}
                        </Text>
                      </View>

                      <View style={styles.row}>
                        <Text style={styles.label}>Payment Mode</Text>
                        <Text style={styles.value}>
                          {paymentTypeMap[item.payment_type_id] || 'N/A'}
                        </Text>
                      </View>

                      <View style={styles.feedbackBox}>
                        <Text style={styles.label}>Feedback</Text>
                        <Text style={styles.feedbackText}>
                          {item?.remarks || 'N/A'}
                        </Text>
                      </View>
                    </View>
                  )}
                </Pressable>
              );
            })
        ) : (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>No receipts found</Text>
          </View>
        )}
      </ScrollView>

      {/* FIXED SYNC BUTTON */}
      <View style={styles.syncButtonContainer}>
        <TouchableOpacity
          style={[
            styles.syncButton,
            isLoading && { opacity: 0.5 }   // faded look when loading
          ]}
          onPress={submitOfflineReceipts}
          disabled={isLoading}
        >
          <MaterialCommunityIcons name="sync" color="#FFFFFF" size={24} />
          <Text style={styles.syncButtonText}>
            {isLoading ? 'Syncing...' : 'Sync Receipts'}
          </Text>
        </TouchableOpacity>

      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, paddingTop: 25 },

  searchContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 20,
    height: 45,
    justifyContent: 'center',
  },
  searchInput: { color: '#000', fontSize: 14 },

  card: {
    backgroundColor: '#ffffff22',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: { color: '#fff', fontSize: 16, fontWeight: '600' },
  mobile: { color: '#FFD700', fontSize: 14 },
  rightSection: { alignItems: 'flex-end' },
  amount: { color: '#fff', fontWeight: '700', fontSize: 14 },
  dateAmountRow: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  smallIcon: { marginTop: 4, alignSelf: 'flex-end', opacity: 0.9 },

  expandArea: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#ffffff44',
    paddingTop: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  label: { color: '#ccc', fontSize: 13 },
  value: { color: '#fff', fontSize: 14, fontWeight: '500' },

  feedbackBox: { marginTop: 6 },
  feedbackText: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 20,
    paddingTop: 6,
  },

  noDataContainer: { alignItems: 'center', marginTop: 20 },
  noDataText: { color: '#999' },

  /* ---- FIXED BUTTON ---- */
  syncButtonContainer: {
    position: 'absolute',
    bottom: 15,
    left: 120,
    right: 120,
  },
  syncButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    borderRadius: 50,
    alignItems: 'center',
    elevation: 5,
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center'
  },
  syncButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default OfflineReceiptSync;
