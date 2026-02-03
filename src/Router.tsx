import { StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const Router = () => {
  return (
    <View style={{ flex: 1 }}>
      <LinearGradient colors={['#061C3F', '#0A5E6A']} style={styles.container}>
        <Text style={styles.text}>Router message</Text>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#fff',
    fontSize: 20,
  },
});

export default Router;
