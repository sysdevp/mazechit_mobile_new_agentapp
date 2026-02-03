/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { StatusBar, StyleSheet, useColorScheme } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import LinearGradient from 'react-native-linear-gradient';
import { RootNavigator } from './src/navigation/RootNavigator';
import { NavigationHistoryProvider } from './src/navigation/NavigationHistoryContext';
function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
        <AppContent />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function AppContent() {
  return (
    <LinearGradient colors={['#061C3F', '#0A5E6A']} style={styles.container}>
      <SafeAreaView
        style={styles.safeArea}
        edges={['left', 'right', 'bottom', 'top']}
      >
        <NavigationContainer>
          <NavigationHistoryProvider>
            <RootNavigator />
          </NavigationHistoryProvider>
        </NavigationContainer>
        {/* <Toast /> */}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
});

export default App;
