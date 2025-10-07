import Purchases from 'react-native-purchases';

export const checkPremiumStatus = async (): Promise<boolean> => {
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    return customerInfo.entitlements.active['premium'] !== undefined;
  } catch (error) {
    console.error('Error checking premium status:', error);
    return false;
  }
};

export const formatPrice = (price: number, currencyCode: string): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
  }).format(price / 100); // RevenueCat prices are in cents
};