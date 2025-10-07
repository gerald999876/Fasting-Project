import { useState, useEffect } from 'react';
import Purchases, { PurchasesOfferings, PurchasesPackage } from 'react-native-purchases';

export const useRevenueCat = () => {
  const [offerings, setOfferings] = useState<PurchasesOfferings | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    const fetchOfferings = async () => {
      try {
        const offerings = await Purchases.getOfferings();
        setOfferings(offerings);
        
        const customerInfo = await Purchases.getCustomerInfo();
        setIsPremium(customerInfo.entitlements.active['premium'] !== undefined);
      } catch (error) {
        console.error('Error fetching offerings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOfferings();
  }, []);

  const purchasePackage = async (packageToPurchase: PurchasesPackage) => {
    try {
      const { customerInfo } = await Purchases.purchasePackage(packageToPurchase);
      setIsPremium(customerInfo.entitlements.active['premium'] !== undefined);
      return customerInfo;
    } catch (error) {
      throw error;
    }
  };

  const restorePurchases = async () => {
    try {
      const customerInfo = await Purchases.restorePurchases();
      setIsPremium(customerInfo.entitlements.active['premium'] !== undefined);
      return customerInfo;
    } catch (error) {
      throw error;
    }
  };

  const checkPremiumStatus = async () => {
    try {
      const customerInfo = await Purchases.getCustomerInfo();
      const premium = customerInfo.entitlements.active['premium'] !== undefined;
      setIsPremium(premium);
      return premium;
    } catch (error) {
      return false;
    }
  };

  return {
    offerings,
    loading,
    isPremium,
    purchasePackage,
    restorePurchases,
    checkPremiumStatus,
  };
};