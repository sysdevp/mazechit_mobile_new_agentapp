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
import CustomDropdownBottom from './custom/CustomDropdownBottom';

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

  const [mode, setMode] = useState<string>('');

  const [selectedMode, setSelectedMode] = useState<string>('cash');

  const [modeTypes, setModeTypes] = useState<any[]>([]);
  const [bankTypes, setBanksTypes] = useState<any[]>([]);
  const [branchTypes, setBranchTypes] = useState<any[]>([]);

  const [user, setUser] = useState<any>();

  const [showTransactionPicker, setShowTransactionPicker] = useState(false);
  const [showChequePicker, setShowChequePicker] = useState(false);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Amount
  // const [amount, setAmount] = useState('');

  // CHEQUE / D.D
  const [chequeDate, setChequeDate] = useState<Date | null>(new Date());
  const [chequeNo, setChequeNo] = useState('');
  const [debitBank, setDebitBank] = useState('');
  const [creditBank, setCreditBank] = useState('');
  const [creditBranch, setCreditBranch] = useState('');

  // RTGS / CARD
  const [transactionNo, setTransactionNo] = useState('');
  const [transactionDate, setTransactionDate] = useState<Date | null>(new Date());

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

    const formattedData = reportData.installments_det.map((item) => {
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

        payingPenalty: 0,
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

    // const newTable = tableData.map(row => {
    //   const pendingNum =
    //     parseFloat(row.pending.replace(/,/g, '')) || 0;

    //   const penaltyWith = parseFloat(row.penaltyWith) || 0;

    //   const totalDue = pendingNum + penaltyWith;

    //   let paying = 0;

    //   if (remaining >= totalDue) {
    //     paying = totalDue;
    //     remaining -= totalDue;
    //   } else {
    //     paying = remaining;
    //     remaining = 0;
    //   }

    //   return {
    //     ...row,
    //     paying: Number(paying.toFixed(2)), // ✅ keep 2 decimals
    //   };
    // });

    const newTable = tableData.map(row => {
      const pendingNum = parseFloat(row.pending.replace(/,/g, '')) || 0;
      const penaltyWith = Number(row.penaltyWith) || 0;

      let payingPenalty = 0;
      let payingInstallment = 0;

      // 1️⃣ Fill penalty first
      if (remaining > 0) {
        payingPenalty = Math.min(remaining, penaltyWith);
        remaining -= payingPenalty;
      }

      // 2️⃣ Then fill installment
      if (remaining > 0) {
        payingInstallment = Math.min(remaining, pendingNum);
        remaining -= payingInstallment;
      }

      return {
        ...row,
        payingPenalty: Number(payingPenalty.toFixed(2)),
        paying: Number(payingInstallment.toFixed(2)),
      };
    });

    setTableData(newTable);
    setAdvance(Number(remaining.toFixed(2)));

    // const installmentsPayload = newTable.map(row => ({
    //   auction_id: row.bidding_id,
    //   installment_no: Number(row.auction),
    //   received_amount: row.paying.toFixed(2),
    //   penalty_inst_wise: row.paying.toFixed(2) !== "0.00" ? row.penaltyWith : 0,
    //   cancel_dividend_inst_wise: 0,
    //   bonus_inst_wise: row.bonus || 0,
    //   discount_inst_wise: row.discount_on_due || 0,
    //   discount_penalty_wise:  
    //     (row.penaltyWithout || 0) - (row.penaltyWith || 0),
    //   pending_days: String(row.instal_pending_day || 0),
    //   penalty_amounts: row.penaltyWithout || 0,
    //   cancel_dividend_amount: 0,
    // }));

    const installmentsPayload = newTable.map(row => {
      const payingAmount = Number(row.paying || 0);
      const payingPenalty = Number(row.payingPenalty || 0);

      return {
        auction_id: row.bidding_id,
        installment_no: Number(row.auction),
        received_amount: payingAmount.toFixed(2),

        penalty_inst_wise: payingPenalty,

        cancel_dividend_inst_wise: 0,
        bonus_inst_wise: row.bonus || 0,
        discount_inst_wise: row.discount_on_due || 0,
        discount_penalty_wise:
          (row.penaltyWithout || 0) - (row.penaltyWith || 0),
        pending_days: String(row.instal_pending_day || 0),
        penalty_amounts: row.penaltyWithout || 0,
        cancel_dividend_amount: 0,
      };
    });

    setInstallments(installmentsPayload);
  };


  const totalPaying = tableData.reduce(
    (sum, row) =>
      sum +
      (parseFloat(row.paying) || 0) +
      (parseFloat(row.payingPenalty) || 0),
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

  const fetchBank = async () => {
    try {
      const storedDataRaw = await AsyncStorage.getItem('bankData');

      if (!storedDataRaw) return;

      const parsedData = JSON.parse(storedDataRaw);
      const formattedModes = parsedData.map((item: any) => ({
        label: item.customer_bank_name,
        value: item.customer_bank_id,
      }));

      setBanksTypes(formattedModes);
    } catch (error) {
      console.log('Error fetching bankData:', error);
    }
  };

  const fetchBranches = async () => {
    try {
      const storedData = await AsyncStorage.getItem('branchData');

      if (storedData) {
        const parsedData = JSON.parse(storedData);

        const formattedBranches = [
          // { label: 'All', value: '' },
          ...parsedData.map((item: any) => ({
            label: item.branch_name,
            value: item.branch_id,
          })),
        ];

        setBranchTypes(formattedBranches);
      }
    } catch (error) {
      console.log('Error fetching branch data:', error);
    }
  };

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
        userName: reportData?.customer_name,
        custCode: reportData?.customer_code,
        groupName: reportData?.group_name,
        ticketNo: reportData?.ticket_no,
        mobileNo: reportData?.customer_mobile_no,
        paymentMode: mode,
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

    console.log('Payload Data of the Report Generate', payload);

    try {
      const response = await axios.post(
        `${baseUrl}/mobile-add-receipt`,
        null,
        { params: payload },
      );

      const res = response.data

      if (res.status === "Success" && !!res.receipt_no) {
        Dialog.show({
          type: ALERT_TYPE.SUCCESS,
          title: 'Receipt Generated',
          textBody: `${ res.msg || 'Report has been generated successfully!'} Receipt No: ${res.receipt_no}`,
          button: 'Close',
        });

        navigation.goBack();
      } else {
        Dialog.show({
          type: ALERT_TYPE.SUCCESS,
          title: 'Receipt Generation',
          textBody: res.msg || 'Receipt generated. Please check the list or try again later.',
          // textBody: 'Failed to generate the Receipt. Please Try Again!',
          button: 'Close',
        });
        navigation.goBack();
      }

      console.log('FULL RESPONSE:', res);

    }catch (error: any) {
      console.log(error);
    
      // ✅ Network error (no internet)
      if (!error.response) {
        await saveOfflineReportReceipt(payload);
    
        Dialog.show({
          type: ALERT_TYPE.WARNING,
          title: 'Offline Mode',
          textBody:
            'No internet connection. Receipt saved and will sync on refresh.',
          button: 'OK',
        });
    
        navigation.goBack();
        return;
      }
    
      // ✅ Server responded with error (like No data Found!!)
      const serverMsg = error.response?.data?.msg;
    
      Dialog.show({
        type: ALERT_TYPE.DANGER,
        title: 'Error',
        textBody: serverMsg || 'Something went wrong',
        button: 'OK',
      });
    }
     finally {
      setIsLoading(false);
    }
  };  

  useEffect(() => {
    fetchBranchData();
    fetchBranches();
    fetchBank();
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
              <Text style={styles.label}>Group/ Ticket No</Text>
              <Text style={styles.value}>{reportData?.group_name}/ {reportData?.ticket_no}</Text>
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
              <Text style={styles.label}>pending due</Text>
              <Text style={[styles.value, { fontWeight: '900' }]}>₹ {reportData?.pending_amount}</Text>
            </View>
            {reportData?.total_penalty > 0 && (
              <View style={styles.detailRow}>
                <Text style={styles.label}>Penalty</Text>
                <Text style={[styles.value, { fontWeight: '900' }]}>
                  ₹ {reportData?.total_penalty}
                </Text>
              </View>
            )}

            {reportData?.bonus > 0 && (
              <View style={styles.detailRow}>
                <Text style={styles.label}>Bonus</Text>
                <Text style={[styles.value, { fontWeight: '900' }]}>
                  ₹ {reportData?.bonus}
                </Text>
              </View>
            )}

            <View style={styles.detailRow}>
              <Text style={styles.label}>To be Collected</Text>
              <Text style={[styles.value, { fontWeight: '900', color: '#7CFF78' }]}>₹ {Number(reportData?.pending_amount) + Number(reportData?.total_penalty) - Number(reportData?.bonus)}</Text>
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
                { title: 'Auc' },
                { title: 'Pending' },
                { title: 'Pen', sub: 'Without Discount' },
                { title: 'Pen', sub: 'With Discount' },
                { title: 'Paying Pen' },
                { title: 'Paying Due' },
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
                  <Text style={[styles.tableCell, { width: '16%', textAlign: 'center', paddingStart: 10 }]}>{row.auction}</Text>
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
                        textAlign: 'right',
                        fontSize: 14,
                      }}
                    >
                      {row.penaltyWith}
                    </Text>
                  </Pressable>

                  {/* <Pressable
                    onPress={() => openModal(index)}
                    style={{
                      backgroundColor: '#1E2A1E0F',
                      paddingVertical: 2,
                      // paddingHorizontal: 1,
                      borderRadius: 8,
                      alignSelf: 'center',
                      borderWidth: 1,
                      borderColor: '#7CFF78',
                      minWidth: 50,
                    }}
                  >
                    <Text
                      style={{
                        color: '#7CFF78',
                        fontSize: 13,
                        fontWeight: '600',
                        textAlign: 'center',
                      }}
                    >
                      {row.penaltyWith}
                    </Text>
                  </Pressable> */}

                  <Text style={styles.tableCell}>
                    {row.payingPenalty?.toFixed(2)}
                  </Text>

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
              <Text style={[styles.totalTableCell, { fontWeight: '700', textAlign: 'right', paddingRight: 10 }]}>
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

              <CustomDropdownBottom
                label="Debit Bank"
                placeholder="Select the Bank"
                value1={debitBank}
                items={bankTypes}
                onChangeValue={(v: string | null) => {
                  setDebitBank(v || '');
                }}
              />

              <CustomDropdownBottom
                label="Credit Bank"
                placeholder="Select the Bank"
                value1={creditBank}
                items={bankTypes}
                onChangeValue={(v: string | null) => {
                  setCreditBank(v || '');
                }}
              />

              <CustomDropdownBottom
                label="Credit Branch"
                placeholder="Select the Branch"
                value1={creditBranch}
                items={branchTypes}
                onChangeValue={(v: string | null) => {
                  setCreditBranch(v || '');
                }}
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

              {showTransactionPicker && (
                <DateTimePicker
                  value={transactionDate || new Date()}
                  mode="date"
                  display="default"
                  onChange={OnTransactonDateSelect}
                />
              )}
              <Pressable
                style={[styles.datePickerButtonSmall, { marginBottom: 15 }]}
                onPress={() => setShowTransactionPicker(true)}
              >
                <Icon name="calendar-outline" size={18} color="#fff" />
                <Text style={styles.datePickerTextSmall}>
                  {transactionDate
                    ? transactionDate.toDateString()
                    : 'Select Date'}
                </Text>
              </Pressable>

              <CustomDropdownBottom
                label="Credit Bank"
                placeholder="Select the Bank"
                value1={creditBank}
                items={bankTypes}
                onChangeValue={(v: string | null) => {
                  setCreditBank(v || '');
                }}
              />

              <CustomDropdownBottom
                label="Credit Branch"
                placeholder="Select the Branch"
                value1={creditBranch}
                items={branchTypes}
                onChangeValue={(v: string | null) => {
                  setCreditBranch(v || '');
                }}
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
    width: '30%',
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
