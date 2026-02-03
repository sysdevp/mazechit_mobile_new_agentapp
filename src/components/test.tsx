import React, { useCallback } from 'react';
import { BackHandler, StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {
  RouteProp,
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';

type CollectionRouteParams = {
  from?: string;
};

const Test = () => {
  const navigation = useNavigation<any>();
  const route =
    useRoute<RouteProp<Record<string, CollectionRouteParams>, string>>();
  const from = route.params?.from;

  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        () => {
          if (from === 'AddCust') {
            navigation.navigate('AddCust');
            return true; // handled
          }
          return false; // not handled → use default behavior
        },
      );

      return () => subscription.remove();
    }, [navigation, from]),
  );

  return (
    <LinearGradient colors={['#061C3F', '#0A5E6A']} style={styles.gradient}>
      <View>
        <Text style={{ color: '#fff' }}>Collection UI</Text>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 30,
  },
});

export default Test;
