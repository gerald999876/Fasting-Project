import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { ThemeProvider } from '@/contexts/ThemeContext';
import Purchases from 'react-native-purchases';
import { Platform } from 'react-native';


export default function RootLayout() {

  useEffect(() => {
    const initializePurchases = async () => {
      if (Platform.OS === 'ios' && process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_IOS) {
        await Purchases.configure({ apiKey: process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_IOS });
      }
    };

    initializePurchases().then(async () => {
      const offerings = await Purchases.getOfferings();
      const customerInfo = await Purchases.getCustomerInfo();
      
      console.log('Purchases SDK initialized');
      console.log('Premium status:', customerInfo.entitlements.active['premium'] !== undefined);
    }).catch(console.error);
  }, []);

  useFrameworkReady();



  return (
    <ThemeProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="paywall" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
