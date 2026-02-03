import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';

const Stack = ({ collectionChart, maxValue }: { collectionChart: any, maxValue: any }) => {
  const screenWidth = Dimensions.get('window').width;

  console.log(collectionChart, "collectionChart")
  return (
    <View style={styles.container}>
      <LineChart
        data={collectionChart}
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
