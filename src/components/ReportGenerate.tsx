import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Pressable,
  ScrollView,
  Modal,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Header from './Header';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/Ionicons';
import COMMON from '../comon/Common';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomDropdown from './custom/CustomDropdown';
import axios from 'axios';
import { ALERT_TYPE, Dialog } from 'react-native-alert-notification';

const ReportGenerate = () => {
  const OFFLINE_REPORT_RECEIPTS_KEY = 'offline_report_receipts';

  const [tableData, setTableData] = useState<any[]>([]);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const [amount, setAmount] = useState('');
  const [remarks, setRemarks] = useState('');
  const [advance, setAdvance] = useState(0);

  const [installments, setInstallments] = useState<any[]>();

  // Discount states
  const [discountAmount, setDiscountAmount] = useState('');
  const [discountPercent, setDiscountPercent] = useState('');

  const [mode, setMode] = useState<string>();

  const [selectedMode, setSelectedMode] = useState<string>('cash');

  const [modeTypes, setModeTypes] = useState<any[]>([]);

  const [user, setUser] = useState<any>();

  const [showTransactionPicker, setShowTransactionPicker] = useState(false);
  const [showChequePicker, setShowChequePicker] = useState(false);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Amount
  // const [amount, setAmount] = useState('');

  // CHEQUE / D.D
  const [chequeDate, setChequeDate] = useState<Date | null>(null);
  const [chequeNo, setChequeNo] = useState('');
  const [debitBank, setDebitBank] = useState('');
  const [creditBank, setCreditBank] = useState('');
  const [creditBranch, setCreditBranch] = useState('');

  // RTGS / CARD
  const [transactionNo, setTransactionNo] = useState('');
  const [transactionDate, setTransactionDate] = useState<Date | null>(null);

  const isChequeOrDD = selectedMode === 'cheque' || selectedMode === 'd.d';

  const isRtgsOrCard = selectedMode === 'rtgs/neft' || selectedMode === 'card';

  // reportData
  const route = useRoute<any>();
  const { reportData } = route.params;

  const navigation = useNavigation<any>();

  const baseUrl = COMMON.BaseUrl;
  const dataBase = COMMON.DbName;

  console.log('Report data', reportData);

  const handleTableData = () => {
    if (!reportData?.installments_det?.length) return;

    const formattedData = reportData.installments_det.map(item => {
      const penaltyAmount = Number(item.penalty_amounts) || 0;
      const penaltyPercentage = Number(item.penalty_percentage) || 0;

      // Calculate penaltyWith using percentage
      const penaltyWith =
        penaltyPercentage > 0
          ? penaltyAmount - (penaltyAmount * penaltyPercentage) / 100
          : penaltyAmount;

      return {
        auction: item.auction_no.padStart(2, '0'),
        pending: Number(item.pending_due).toLocaleString('en-IN'),
        penaltyWithout: penaltyAmount,
        penaltyWith: Math.round(penaltyWith),
        bonus: Number(item.bonus_amount) || 0,
        paying: 0,

        // --- extra fields ---

        entrollment_id: item?.entrollment_id,
        bidding_id: item?.bidding_id,
        discount_on_due: item?.discount_on_due,
        discount_on_penalty: item?.discount_on_penalty,
        bonus_days: item?.bonus_days,
        penalty_percentage: item?.penalty_percentage,
        bonus_percentage: item?.bonus_percentage,
        instal_pending_day: item?.instal_pending_day,
        paid_amount: item?.paid_amount,
        current_installment_amount: item?.current_installment_amount,
      };
    });

    setTableData(formattedData);
  };

  useEffect(() => {
    if (reportData?.installments_det?.length) {
      handleTableData();
    }
  }, []);
  const openModal = (index: number) => {
    setSelectedRow(index);
    setDiscountAmount('');
    setDiscountPercent('');
    setRemarks('');
    setModalVisible(true);
  };

  // Sync discount amount → percentage
  const handleDiscountAmount = (value: string) => {
    setDiscountAmount(value);

    if (selectedRow === null) return;

    const amountNum = parseInt(value) || 0;
    const maxPenalty = tableData[selectedRow].penaltyWithout;

    let percent = (amountNum / maxPenalty) * 100;
    if (percent > 100) percent = 100;

    setDiscountPercent(percent.toFixed(0));
  };

  // Sync percentage → discount amount
  const handleDiscountPercent = (value: string) => {
    if (selectedRow === null) return;

    let pct = parseInt(value) || 0;
    if (pct > 100) pct = 100;
    if (pct < 0) pct = 0;

    setDiscountPercent(String(pct));

    const maxPenalty = tableData[selectedRow].penaltyWithout;
    const amount = (maxPenalty * pct) / 100;

    setDiscountAmount(amount.toFixed(0));
  };

  const applyDiscount = () => {
    if (selectedRow !== null) {
      const newTable = [...tableData];
      const discountAmt = parseInt(discountAmount) || 0;
      const maxPenalty = newTable[selectedRow].penaltyWithout;

      const finalDiscount = Math.min(discountAmt, maxPenalty);

      newTable[selectedRow].penaltyWith = maxPenalty - finalDiscount;

      setTableData(newTable);
      setModalVisible(false);
      handleAmountChange(amount);
    }
  };

  // Handle received amount input
  const handleAmountChange = (text: string) => {
    setAmount(text);
  
    const amt = parseFloat(text) || 0; // ✅ keep decimals
    let remaining = amt;
  
    const newTable = tableData.map(row => {
      const pendingNum =
        parseFloat(row.pending.replace(/,/g, '')) || 0;
  
      const penaltyWith = parseFloat(row.penaltyWith) || 0;
  
      const totalDue = pendingNum + penaltyWith;
  
      let paying = 0;
  
      if (remaining >= totalDue) {
        paying = totalDue;
        remaining -= totalDue;
      } else {
        paying = remaining;
        remaining = 0;
      }
  
      return {
        ...row,
        paying: Number(paying.toFixed(2)), // ✅ keep 2 decimals
      };
    });
  
    setTableData(newTable);
    setAdvance(Number(remaining.toFixed(2))); // ✅ FIXED
  
    const installmentsPayload = newTable.map(row => ({
      auction_id: row.bidding_id,
      installment_no: Number(row.auction),
      received_amount: row.paying.toFixed(2), // ✅ send decimals
      penalty_inst_wise: row.penaltyWith || 0,
      cancel_dividend_inst_wise: 0,
      bonus_inst_wise: row.bonus || 0,
      discount_inst_wise: row.discount_on_due || 0,
      discount_penalty_wise:
        (row.penaltyWithout || 0) - (row.penaltyWith || 0),
      pending_days: String(row.instal_pending_day || 0),
      penalty_amounts: row.penaltyWithout || 0,
      cancel_dividend_amount: 0,
    }));
  
    setInstallments(installmentsPayload);
  };
  

  const totalPaying = tableData.reduce(
    (sum, row) => sum + (parseFloat(row.paying) || 0),
    0
  );  

  const fetchBranchData = async () => {
    try {
      const storedDataRaw = await AsyncStorage.getItem('paymentMode');

      if (!storedDataRaw) return;

      const parsedData = JSON.parse(storedDataRaw);

      const formattedModes = parsedData.map((item: any) => ({
        label: item.payment_name,
        value: item.payment_type_id,
      }));

      setModeTypes(formattedModes);
    } catch (error) {
      console.log('Error fetching payment modes:', error);
    }
  };

  console.log(modeTypes, "Payment types")

  useEffect(() => {
    // default value
    if (!mode) {
      setSelectedMode('cash');
      return;
    }

    const matchedMode = modeTypes?.find(item => item.value === Number(mode));

    if (matchedMode) {
      setSelectedMode(matchedMode.label.toLowerCase());
    } else {
      // fallback safety
      setSelectedMode('cash');
    }
  }, [mode]);

  console.log(selectedMode);

  const OnTransactonDateSelect = (event: any, selectedDate?: Date) => {
    setShowTransactionPicker(false);
    if (selectedDate) setTransactionDate(selectedDate);
  };

  const OnChequeDateSelect = (event: any, selectedDate?: Date) => {
    setShowChequePicker(false);
    if (selectedDate) setChequeDate(selectedDate);
  };

  const formatDate = date => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');

    const formatDate = `${year}-${month}-${day}`;
    return formatDate;
  };

  const userData = async () => {
    const value = JSON.parse(
      (await AsyncStorage.getItem('loginDetails')) ?? '{}',
    );

    console.log(value);
    setUser(value);
  };

  // Save Offline Report Receipt

  const saveOfflineReportReceipt = async (payload: any) => {
    try {
      const stored = await AsyncStorage.getItem(
        OFFLINE_REPORT_RECEIPTS_KEY,
      );

      const receipts = stored ? JSON.parse(stored) : [];

      receipts.push({
        ...payload,
        offline_id: Date.now(),
        created_at: new Date().toISOString(),
      });

      await AsyncStorage.setItem(
        OFFLINE_REPORT_RECEIPTS_KEY,
        JSON.stringify(receipts),
      );
    } catch (e) {
      console.log('Error saving offline report receipt', e);
    }
  };


  const handleSubmit = async () => {

    if (amount === '' || mode === '') {
      Dialog.show({
        type: ALERT_TYPE.WARNING,
        title: 'Missing Receipt Details',
        textBody: 'Please fill the amount and payment mode',
        button: 'Close',
      });
      setIsLoading(false);
      return;
    }

    const date = formatDate(Date.now());
    const payload = {
      db: dataBase,
      tenant_id: user?.tenant_id,
      branch_id: user?.branch_id,
      other_branch: '',
      balance_advance_amount: advance,
      customer_id: reportData?.customer_id,
      enrollment_id: reportData?.entrollment_id,
      cancel_dividend: '',
      group_id: reportData?.group_id,
      ticket_no: reportData?.ticket_no,
      employee_id: user?.employee_id,
      receipt_date: date,
      receipt_type: 'Normal Receipt',
      payment_type_id: mode,
      cheque_no: chequeNo,
      cheque_date: formatDate(chequeDate), // Need to create a date formate
      bank_name_id: 0,
      bank_branch_name: '',
      bank_name_1: '',
      bank_branch_name_1: '',
      transaction_no: transactionNo,
      transaction_date: formatDate(transactionDate), // Need to create a date formate
      neft_bank_name_id: '',
      alt_rec_no: '123',
      neft_bank_branch_name: '',
      penalty_amount_tot: '',
      debit_to: 'trst',
      amount: amount,
      remarks: remarks,
      created_by: user?.role_id,
      charge_type_id: '',
      other_amount: '',
      offline_receipt_no: '',
      credit_bank: creditBank,
      debit_bank: debitBank,
      credit_branch: creditBranch,
      Installments: installments, // From handleAmountChange
    };

    console.log(payload);

    try {
      await axios.post(
        `${baseUrl}/mobile-add-receipt`,
        null,
        { params: payload },
      );

      Dialog.show({
        type: ALERT_TYPE.SUCCESS,
        title: 'Receipt Generated',
        textBody: 'Report has been generated successfully!',
        button: 'Close',
      });

      navigation.goBack();
    } catch (error) {

      console.log(error);

      await saveOfflineReportReceipt(payload);

      Dialog.show({
        type: ALERT_TYPE.WARNING,
        title: 'Offline Mode',
        textBody:
          'No internet connection. Receipt saved and will sync on refresh.',
        button: 'OK',
      });

      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBranchData();
    userData();
  }, []);

  console.log(user);

  return (
    <LinearGradient colors={['#061C3F', '#0A5E6A']} style={styles.gradient}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 50 : 0}
      >
        <Header title="Generate Report" showBack={true} />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          {/* Top Profile Card */}
          <View style={styles.card}>
            <View style={styles.rowBetween}>
              <View>
                <Text style={styles.name}>{reportData?.customer_name}</Text>
                <Text style={styles.phone}>
                  {reportData?.customer_mobile_no}
                </Text>
              </View>
              <View>
                <Text style={styles.idText}>{reportData?.customer_code}</Text>
              </View>
            </View>
          </View>
          {/* Details Card */}
          <View style={styles.card}>
            <View style={styles.detailRow}>
              <Text style={styles.label}>Chit Value</Text>
              <Text style={styles.value}>₹ {reportData?.chit_value}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.label}>Group</Text>
              <Text style={styles.value}>{reportData?.group_name}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.label}>Prized Status</Text>
              <Text style={styles.value}>{reportData?.prized_status}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.label}>Installments</Text>
              <Text style={styles.value}>₹ {reportData?.install_amount}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.label}>Collected</Text>
              <Text style={styles.value}>₹ {reportData?.paid_amount}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.label}>To Be Collected</Text>
              <Text style={styles.value}>₹ {reportData?.pending_amount}</Text>
            </View>
          </View>
          {/* Input – Amount */}
          <Text style={styles.lable}>Received Amount *</Text>
          <TextInput
            placeholder="Enter Your Amount"
            placeholderTextColor="#fff9"
            style={styles.input}
            keyboardType="numeric"
            value={amount}
            onChangeText={handleAmountChange}
          />
          {/* Table Section */}
          <View style={styles.tableCard}>
            <View style={styles.tableHeader}>
              {[
                { title: 'Auction' },
                { title: 'Pending' },
                { title: 'Penalty', sub: 'Without Discount' },
                { title: 'Penalty', sub: 'With Discount' },
                { title: 'Bonus' },
                { title: 'Paying' },
              ].map((col, i) => (
                <View key={i} style={{ width: '16%', alignItems: 'center' }}>
                  <Text style={styles.tableHeaderText}>{col.title}</Text>
                  {col.sub && (
                    <Text style={styles.subHeaderText}>({col.sub})</Text>
                  )}
                </View>
              ))}
            </View>

            {tableData.length === 0 ? (
              <View style={styles.noDataContainer}>
                <Text style={styles.noDataText}>No data found</Text>
              </View>
            ) : (
              tableData.map((row, index) => (
                <View key={index} style={styles.tableRow}>
                  <Text style={styles.tableCell}>{row.auction}</Text>
                  <Text style={styles.tableCell}>{row.pending}</Text>
                  <Text style={styles.tableCell}>{row.penaltyWithout}</Text>

                  {/* Penalty With Discount – Clickable */}
                  <Pressable
                    style={styles.tableCell}
                    onPress={() => openModal(index)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Text
                      style={{
                        color: '#7CFF78',
                        textAlign: 'center',
                        fontSize: 14,
                      }}
                    >
                      {row.penaltyWith}
                    </Text>
                  </Pressable>

                  <Text style={styles.tableCell}>{row.bonus}</Text>
                  <Text style={styles.tableCell}>{row.paying}</Text>
                </View>
              ))
            )}

            {/* Total Row */}
            <View style={[styles.tableRow, { borderTopWidth: 1 }]}>
              <Text style={[styles.tableCell, { fontWeight: '700' }]}>
                Total
              </Text>
              <Text style={[styles.tableCell, { fontWeight: '700' }]}></Text>
              <Text style={[styles.tableCell, { fontWeight: '700' }]}></Text>
              <Text style={[styles.tableCell, { fontWeight: '700' }]}></Text>
              <Text style={[styles.tableCell, { fontWeight: '700' }]}></Text>
              <Text style={[styles.totalTableCell, { fontWeight: '700' }]}>
              ₹ {totalPaying.toFixed(2)}
              </Text>
            </View>
          </View>
          {/* Advance Section */}
          <View style={styles.advanceBox}>
            <Text style={styles.advanceText}>Advance</Text>
            <Text style={styles.advanceAmount}> ₹ {advance.toFixed(2)}</Text>
          </View>
          {/* Payment Mode */}
          {modeTypes && (
            <CustomDropdown
              label="Payment Mode *"
              placeholder="Select a Mode"
              value1={mode}
              items={modeTypes}
              onChangeValue={(v: string | null) => {
                if (v !== mode) {
                  setMode(v || '');
                }
              }}
            />
          )}

          {/* // ================= CHEQUE / D.D ================= */}
          {isChequeOrDD && (
            <>
              <Text style={[styles.lable, { marginTop: 0 }]}>Cheque Date</Text>
              {/* <TextInput
                style={styles.input}
                placeholder="Cheque Date"
                value={chequeDate}
                onChangeText={setChequeDate}
              /> */}

              {showChequePicker && (
                <DateTimePicker
                  value={chequeDate || new Date()}
                  mode="date"
                  display="default"
                  onChange={OnChequeDateSelect}
                />
              )}
              <Pressable
                style={styles.datePickerButtonSmall}
                onPress={() => setShowChequePicker(true)}
              >
                <Icon name="calendar-outline" size={18} color="#fff" />
                <Text style={styles.datePickerTextSmall}>
                  {chequeDate ? chequeDate.toDateString() : 'Select Date'}
                </Text>
              </Pressable>

              <Text style={styles.lable}>Cheque No</Text>
              <TextInput
                style={styles.input}
                placeholder="Cheque No"
                value={chequeNo}
                onChangeText={setChequeNo}
                keyboardType="numeric"
              />

              <Text style={styles.lable}>Debit Bank</Text>
              <TextInput
                style={styles.input}
                placeholder="Debit Bank"
                value={debitBank}
                onChangeText={setDebitBank}
              />

              <Text style={styles.lable}>Credit Bank</Text>
              <TextInput
                style={styles.input}
                placeholder="Credit Bank"
                value={creditBank}
                onChangeText={setCreditBank}
              />

              <Text style={styles.lable}>Credit Branch</Text>
              <TextInput
                style={styles.input}
                placeholder="Credit Branch"
                value={creditBranch}
                onChangeText={setCreditBranch}
              />
            </>
          )}

          {/* // ================= RTGS / NEFT / CARD ================= */}
          {isRtgsOrCard && (
            <>
              <Text style={[styles.lable, { marginTop: 0 }]}>
                Transaction No
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Transaction No"
                value={transactionNo}
                onChangeText={setTransactionNo}
                keyboardType="numeric"
              />

              <Text style={styles.lable}>Transaction Date</Text>
              {/* <TextInput
                style={styles.input}
                placeholder="Transaction Date"
                value={transactionDate}
                onChangeText={setTransactionDate}
              /> */}
              {showTransactionPicker && (
                <DateTimePicker
                  value={transactionDate || new Date()}
                  mode="date"
                  display="default"
                  onChange={OnTransactonDateSelect}
                />
              )}
              <Pressable
                style={styles.datePickerButtonSmall}
                onPress={() => setShowTransactionPicker(true)}
              >
                <Icon name="calendar-outline" size={18} color="#fff" />
                <Text style={styles.datePickerTextSmall}>
                  {transactionDate
                    ? transactionDate.toDateString()
                    : 'Select Data'}
                </Text>
              </Pressable>

              <Text style={styles.lable}>Credit Bank</Text>
              <TextInput
                style={styles.input}
                placeholder="Credit Bank"
                value={creditBank}
                onChangeText={setCreditBank}
              />

              <Text style={styles.lable}>Credit Branch</Text>
              <TextInput
                style={styles.input}
                placeholder="Credit Branch"
                value={creditBranch}
                onChangeText={setCreditBranch}
              />
            </>
          )}
          {/* Message */}
          <Text style={styles.lable}>Payment Remarks</Text>
          <TextInput
            placeholder="Type your message here..."
            placeholderTextColor="#fff9"
            style={[styles.input, { height: 80 }]}
            value={remarks}
            onChangeText={setRemarks}
            multiline
          />
          {/* Submit Button */}
          {/* <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
            <Text style={styles.submitText}>Submit</Text>
          </TouchableOpacity> */}

          <TouchableOpacity
            onPress={handleSubmit}
            style={[styles.submitBtn, isLoading && { opacity: 0.7 }]}
            disabled={isLoading}
          >
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#fff" />
                <Text style={styles.processingText}>Submitting...</Text>
              </View>
            ) : (
              <Text style={styles.submitText}>Submitt</Text>
            )}
          </TouchableOpacity>

          {/* Discount Modal */}
          <Modal transparent visible={modalVisible} animationType="slide">
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Enter Penalty Discount</Text>

                <View style={styles.discountContainer}>
                  {/* Discount Amount */}
                  <View style={{ width: '48%' }}>
                    <Text style={styles.modalLabel}>Discount Amount</Text>
                    <View style={styles.inputWithSymbol}>
                      <TextInput
                        placeholder="Enter amount"
                        placeholderTextColor="#aaa"
                        style={styles.modalInputWithSymbol}
                        keyboardType="numeric"
                        value={discountAmount}
                        onChangeText={handleDiscountAmount}
                      />
                      <Text style={styles.symbolText}>₹</Text>
                    </View>
                  </View>

                  {/* Percentage */}
                  <View style={{ width: '48%' }}>
                    <Text style={styles.modalLabel}>Percentage</Text>
                    <View style={styles.inputWithSymbol}>
                      <TextInput
                        placeholder="Enter percentage"
                        placeholderTextColor="#aaa"
                        style={styles.modalInputWithSymbol}
                        keyboardType="numeric"
                        value={discountPercent}
                        onChangeText={handleDiscountPercent}
                      />
                      <Text style={styles.symbolText}>%</Text>
                    </View>
                  </View>
                </View>

                {/* Remarks */}
                <Text style={styles.modalLabel}>Remarks</Text>
                <TextInput
                  placeholder="Remarks"
                  placeholderTextColor="#aaa"
                  style={[styles.modalInput, { height: 80 }]}
                  multiline
                  value={remarks}
                  onChangeText={setRemarks}
                />

                <TouchableOpacity
                  style={styles.modalBtn}
                  onPress={applyDiscount}
                >
                  <Text style={styles.modalBtnText}>Apply</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.modalBtn,
                    { backgroundColor: '#555', marginTop: 10 },
                  ]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.modalBtnText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: { flex: 1, paddingHorizontal: 16, paddingTop: 20 },
  card: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    padding: 15,
    borderRadius: 12,
    marginTop: 15,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: { color: '#fff', fontSize: 18, fontWeight: '700' },
  phone: { color: '#E9E648', marginTop: 3, fontSize: 14 },
  idText: { color: '#fff', fontWeight: '700' },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  label: { color: '#ddd', fontSize: 14 },
  value: { color: '#fff', fontSize: 14 },
  tableCard: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    marginTop: 15,
    paddingBottom: 10,
  },
  tableHeaderText: {
    color: '#E9E648',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  subHeaderText: {
    color: '#ccc',
    fontSize: 8,
    marginTop: 2,
    textAlign: 'center',
  },
  tableCell: {
    color: '#fff',
    width: '16%',
    fontSize: 14,
    textAlign: 'right',
    paddingRight: 12,
  },
  totalTableCell: {
    color: '#7CFF78',
    width: '16%',
    fontSize: 14,
    textAlign: 'center',
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 5,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 5,
    borderBottomWidth: 0.4,
    borderColor: '#555',
  },
  advanceBox: {
    backgroundColor: 'rgba(245, 245, 245, 0.15)',
    marginVertical: 15,
    padding: 12,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  advanceText: { color: '#fff', fontWeight: '600' },
  advanceAmount: { color: '#7CFF78', fontWeight: '700' },
  lable: {
    color: '#fff',
    fontWeight: 'bold',
    paddingBottom: 10,
    marginTop: 10,
  },
  noDataContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },

  noDataText: {
    color: '#999',
    fontSize: 14,
  },

  input: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    padding: 14,
    borderRadius: 12,
    color: '#fff',
    fontSize: 14,
    marginBottom: 12,
  },
  dropdown: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 14,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownText: { color: '#aaa', fontSize: 14 },
  submitBtn: {
    marginTop: 25,
    backgroundColor: '#1D5CFF',
    paddingVertical: 14,
    borderRadius: 12,
  },
  submitText: {
    textAlign: 'center',
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  processingText: {
    color: '#fff',
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.87)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#061C3F',
    padding: 20,
    borderRadius: 20,
    width: '85%',
  },
  modalTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 15,
  },
  discountContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  modalLabel: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  inputWithSymbol: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    marginBottom: 15,
    paddingHorizontal: 12,
  },
  modalInputWithSymbol: {
    flex: 1,
    color: '#fff',
    paddingVertical: 12,
    fontSize: 14,
  },
  symbolText: {
    color: '#fff',
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '700',
  },
  modalInput: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 12,
    borderRadius: 12,
    color: '#fff',
    marginBottom: 15,
  },
  modalBtn: {
    backgroundColor: '#1D5CFF',
    paddingVertical: 12,
    borderRadius: 12,
  },
  modalBtnText: { textAlign: 'center', color: '#fff', fontWeight: '700' },
  datePickerButtonSmall: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#ffffff55',
    // marginRight: 8,
  },
  datePickerTextSmall: { marginLeft: 8, color: '#fff', fontSize: 14 },
});

export default ReportGenerate;
