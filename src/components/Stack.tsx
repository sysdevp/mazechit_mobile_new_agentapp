import React from 'react';
import { View, StyleSheet, Dimensions, Text } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';

const Stack = ({ collectionChart, maxValue }: { collectionChart: any, maxValue: any }) => {
  const screenWidth = Dimensions.get('window').width;

  const collectionChart1 = [
    {
        "value": 19960,
        "label": "03",
        "dataPointText": "₹ 19,960"
    },
    {
        "value": 10260,
        "label": "04",
        "dataPointText": "₹ 10,260"
    },
    {
        "value": 70700,
        "label": "05",
        "dataPointText": "₹ 70,700"
    },
    {
        "value": 214160,
        "label": "06",
        "dataPointText": "₹ 2,14,160"
    },
    {
        "value": 0,
        "label": "07",
        "dataPointText": "₹ 0"
    },
    {
        "value": 0,
        "label": "08",
        "dataPointText": "₹ 0"
    },
    {
        "value": 0,
        "label": "09",
        "dataPointText": "₹ 0"
    }
]

  const TOOLTIP_WIDTH = 70;

  const adjustedData = collectionChart.map((item: any) => ({
    ...item,
    dataPointLabelComponent: () => {
      const isNearTop = item.value > maxValue * 0.85;

      return (
        <View
          style={{
            position: 'absolute',
            top: isNearTop ? 15 : -25,
            left: -TOOLTIP_WIDTH / 2 + 15,
            width: TOOLTIP_WIDTH,
            alignItems: 'center',
            zIndex: 9999
          }}
        >
          {isNearTop && (

            <View
              style={{
                width: 0,
                height: 0,
                borderLeftWidth: 6,
                borderRightWidth: 6,
                borderTopWidth: isNearTop ? 0 : 6,
                borderBottomWidth: isNearTop ? 6 : 0,
                borderLeftColor: 'transparent',
                borderRightColor: 'transparent',
                borderTopColor: isNearTop ? 'transparent' : '#1f2937',
                borderBottomColor: isNearTop ? '#1f2937' : 'transparent',
              }}
            />
          )}
          {/* Tooltip box */}
          <View
            style={{
              backgroundColor: '#1f2937',
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 6,
              minWidth: TOOLTIP_WIDTH,
              alignItems: 'center',

              // Shadow (Android + iOS)
              elevation: 4,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 3,
            }}
          >
            <Text
              style={{
                color: '#fff',
                fontSize: 12,
                fontWeight: '600',
              }}
              numberOfLines={1}
            >
              {item.value}
            </Text>
          </View>

          {/* Tooltip arrow */}
          {!isNearTop && (
            <View
              style={{
                width: 0,
                height: 0,
                borderLeftWidth: 6,
                borderRightWidth: 6,
                borderTopWidth: isNearTop ? 0 : 6,
                borderBottomWidth: isNearTop ? 6 : 0,
                borderLeftColor: 'transparent',
                borderRightColor: 'transparent',
                borderTopColor: isNearTop ? 'transparent' : '#1f2937',
                borderBottomColor: isNearTop ? '#1f2937' : 'transparent',
              }}
            />
          )}
        </View>
      );
    },
  }));




  return (
    <View style={styles.container}>
      <LineChart
        data={adjustedData}
        width={screenWidth - 60}
        height={220}

        spacing={45}
        thickness={3}
        color="#4caf50"

        hideRules
        xAxisThickness={0}
        yAxisThickness={0}

        yAxisTextStyle={{ color: '#fff' }}
        xAxisLabelTextStyle={{ color: '#fff' }}

        noOfSections={5}
        maxValue={maxValue + 500}

        showVerticalLines
        verticalLinesColor="rgba(255,255,255,0.1)"

        dataPointsColor="#2196f3"
        dataPointsRadius={5}

        isAnimated
        animationDuration={800}

        curved
        areaChart
        startFillColor="rgba(76, 175, 80, 0.3)"
        endFillColor="rgba(76, 175, 80, 0.05)"
        startOpacity={0.8}
        endOpacity={0.1}

        textFontSize={12}
        textColor="#ffffff"
        textShiftY={-10}
        textShiftX={0}

        focusEnabled
        showDataPointLabelOnFocus
        showTextOnFocus
        delayBeforeUnFocus={5000}  // Time in milliseconds before auto-close (5 seconds)

        showScrollIndicator
        indicatorColor="black"

        // Background for text
        showTextBackground={true}
        textBackgroundColor="#000000"
        textBackgroundRadius={4}
        textBackgroundPadding={4}

        // Font styling
        fontFamily="YourCustomFont"
        fontWeight="bold"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
  },
});

export default Stack;


// import React from 'react';
// import { View, StyleSheet, Dimensions } from 'react-native';
// import { BarChart } from 'react-native-gifted-charts';

// const data = [
//   {
//     value: 50,
//     label: 'Jan',
//     frontColor: '#4caf50',
//     spacing: 2,
//     labelWidth: 30,
//     labelTextStyle: { color: '#fff' },
//   },
//   {
//     value: 80,
//     frontColor: '#2196f3',
//   },
//   {
//     value: 30,
//     label: 'Feb',
//     frontColor: '#4caf50',
//     spacing: 2,
//     labelWidth: 30,
//     labelTextStyle: { color: '#fff' },
//   },
//   {
//     value: 60,
//     frontColor: '#2196f3',
//   },
//   {
//     value: 70,
//     label: 'Mar',
//     frontColor: '#4caf50',
//     spacing: 2,
//     labelWidth: 30,
//     labelTextStyle: { color: '#fff' },
//   },
//   {
//     value: 90,
//     frontColor: '#2196f3',
//   },
//   {
//     value: 40,
//     label: 'Apr',
//     frontColor: '#4caf50',
//     spacing: 2,
//     labelWidth: 30,
//     labelTextStyle: { color: '#fff' },
//   },
//   {
//     value: 70,
//     frontColor: '#2196f3',
//   },
//   {
//     value: 60,
//     label: 'May',
//     frontColor: '#4caf50',
//     spacing: 2,
//     labelWidth: 30,
//     labelTextStyle: { color: '#fff' },
//   },
//   {
//     value: 100,
//     frontColor: '#2196f3',
//   },
//   {
//     value: 80,
//     label: 'Jun',
//     frontColor: '#4caf50',
//     spacing: 2,
//     labelWidth: 30,
//     labelTextStyle: { color: '#fff' },
//   },
//   {
//     value: 120,
//     frontColor: '#2196f3',
//   },
// ];

// const Stack = () => {
//   const screenWidth = Dimensions.get('window').width;

//   return (
//     <View style={styles.container}>

//       {/* Bar Chart */}
//       <BarChart
//         data={data}
//         width={screenWidth - 60}
//         barWidth={22}
//         spacing={8}
//         roundedTop
//         roundedBottom
//         hideRules
//         xAxisThickness={0}
//         yAxisThickness={0}
//         yAxisTextStyle={{ color: '#fff' }}
//         noOfSections={6}
//         maxValue={150}
//         showGradient
//         gradientColor={'rgba(200, 200, 200, 0.3)'}
//         frontColor={'rgba(219, 182, 249, 1)'}
//         isAnimated
//         animationDuration={800}
//       />
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     // flex: 1,
//     // alignItems: 'center',
//     paddingVertical: 20,
//   },
//   title: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     marginBottom: 20,
//     color: '#fff',
//   },
//   legendContainer: {
//     flexDirection: 'row',
//     marginBottom: 20,
//     gap: 20,
//   },
//   legendItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   legendBox: {
//     width: 16,
//     height: 16,
//     borderRadius: 3,
//     marginRight: 8,
//   },
//   legendText: {
//     fontSize: 14,
//     color: '#fff',
//   },
// });

// export default Stack;
