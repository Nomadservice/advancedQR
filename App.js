import React, { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, StatusBar, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Screens
import ScannerScreen from './src/screens/ScannerScreen';
import GeneratorScreen from './src/screens/GeneratorScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import PaywallScreen from './src/screens/PaywallScreen';
import SettingsScreen from './src/screens/SettingsScreen';

// Context
import { PremiumProvider } from './src/context/PremiumContext';

// Theme
import { COLORS, DARK_MODE } from './src/styles/theme';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Componente per i Tab
function QRTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: DARK_MODE.background,
          borderTopColor: DARK_MODE.borderColor,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: DARK_MODE.textSecondary,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 4,
        },
      }}
    >
      <Tab.Screen
        name="Scanner"
        component={ScannerScreen}
        options={{
          tabBarLabel: 'Scanner',
          tabBarIcon: ({ color }) => (
            <View style={{ fontSize: 20 }}>📱</View>
          ),
        }}
      />
      <Tab.Screen
        name="Generator"
        component={GeneratorScreen}
        options={{
          tabBarLabel: 'Genera',
          tabBarIcon: ({ color }) => (
            <View style={{ fontSize: 20 }}>✨</View>
          ),
        }}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{
          tabBarLabel: 'Cronologia',
          tabBarIcon: ({ color }) => (
            <View style={{ fontSize: 20 }}>⏱️</View>
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Impostazioni',
          tabBarIcon: ({ color }) => (
            <View style={{ fontSize: 20 }}>⚙️</View>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(true);

  useEffect(() => {
    // Inizializzazione dell'app
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      const premiumStatus = await AsyncStorage.getItem('isPremium');
      if (!premiumStatus) {
        await AsyncStorage.setItem('isPremium', 'false');
      }
    } catch (error) {
      console.error('Errore durante l\'inizializzazione:', error);
    }
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <PremiumProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={DARK_MODE.background}
        />
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="MainTabs" component={QRTabs} />
            <Stack.Screen
              name="Paywall"
              component={PaywallScreen}
              options={{
                animationEnabled: true,
                cardStyle: { backgroundColor: 'transparent' },
              }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaView>
    </PremiumProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DARK_MODE.background,
  },
});
