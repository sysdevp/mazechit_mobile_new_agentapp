import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const SpashScreen = () => {
  return (
    <LinearGradient colors={['#061C3F', '#0A5E6A']} style={styles.gradient}>
      <View>
        <View style={styles.imageContainer}>
          <Image
            source={require('../../assets/LOGO.png')}
            style={styles.image}
          />
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flexDirection: 'row',
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageContainer: {
    borderWidth: 2,
    borderColor: '#FFFFFF',
    borderRadius: '50%',
    padding: 35,
    backgroundColor: '#FFFFFF',
  },
  image: {
    height: 140,
    width: 140,
  },
});

export default SpashScreen;
