import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Dimensions, Linking, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Crown, X, Check, Star, TrendingUp, ChartBar as BarChart3, Calendar, Download, Headphones, Bell, Zap, Target, Award } from 'lucide-react-native';
import { storageService } from '@/utils/storage';
import { useRevenueCat } from '@/hooks/useRevenueCat';
import { PurchasesPackage } from 'react-native-purchases';
import PurchasesUI from 'react-native-purchases-ui';

const { width } = Dimensions.get('window');

const premiumFeatures = [
  {
    icon: TrendingUp,
    title: 'Advanced Analytics',
    description: 'Detailed insights, trends, and personalized recommendations',
    color: '#3B82F6',
  },
  {
    icon: BarChart3,
    title: 'Comprehensive Charts',
    description: 'Weight tracking, mood analysis, and energy level monitoring',
    color: '#10B981',
  },
  {
    icon: Calendar,
    title: 'Custom Fasting Plans',
    description: 'Create and save your own personalized fasting schedules',
    color: '#F59E0B',
  },
  {
    icon: Download,
    title: 'Export Data',
    description: 'Export your fasting history and health metrics to CSV/PDF',
    color: '#8B5CF6',
  },
  {
    icon: Bell,
    title: 'Smart Reminders',
    description: 'Intelligent notifications based on your patterns and goals',
    color: '#06B6D4',
  },
  {
    icon: Headphones,
    title: 'Priority Support',
    description: '24/7 premium customer support and expert guidance',
    color: '#EF4444',
  },
];

export default function PaywallScreen() {
  const { offerings, loading: rcLoading, purchasePackage, restorePurchases, isPremium } = useRevenueCat();
  const [selectedPackage, setSelectedPackage] = useState<PurchasesPackage | null>(null);
  const [loading, setLoading] = useState(false);

  // Show customer center if user has active subscription
  React.useEffect(() => {
    if (isPremium && !rcLoading) {
      presentCustomerCenter();
    }
  }, [isPremium, rcLoading]);

  const presentCustomerCenter = async () => {
    try {
      await PurchasesUI.presentCustomerCenter();
      // Update premium status after customer center closes
      const settings = await storageService.getUserSettings();
      const customerInfo = await require('react-native-purchases').default.getCustomerInfo();
      const isStillPremium = customerInfo.entitlements.active['premium'] !== undefined;
      
      await storageService.saveUserSettings({
        ...settings,
        isPremium: isStillPremium,
      });
      
      if (!isStillPremium) {
        // If subscription was cancelled, stay on paywall
        return;
      }
      
      // If still premium, go to main app
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Error presenting customer center:', error);
      router.replace('/(tabs)');
    }
  };

  // Set default selected package to monthly when offerings load
  React.useEffect(() => {
    if (offerings?.current?.monthly && !selectedPackage) {
      setSelectedPackage(offerings.current.monthly);
    }
  }, [offerings, selectedPackage]);

  if (rcLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Loading pricing...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const packages = offerings?.current?.availablePackages || [];

  const handleContinueWithFree = async () => {
    try {
      const settings = await storageService.getUserSettings();
      await storageService.saveUserSettings({
        ...settings,
        isPremium: false,
        paywallSeen: true,
      });
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Error continuing with free version:', error);
      router.replace('/(tabs)');
    }
  };

  const handleUpgrade = async () => {
    if (!selectedPackage) return;

    setLoading(true);
    try {
      await purchasePackage(selectedPackage);

      const settings = await storageService.getUserSettings();
      await storageService.saveUserSettings({
        ...settings,
        isPremium: true,
      });

      Alert.alert(
        'Welcome to Premium! 🎉',
        'Thank you for upgrading! You now have access to all premium features.',
        [{ text: 'Start Using Premium', onPress: () => router.replace('/(tabs)') }]
      );
    } catch (error: any) {
      if (!error.userCancelled) {
        Alert.alert('Purchase Failed', error.message || 'Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const openPrivacyPolicy = async () => {
    const privacyPolicyUrl = 'https://www.termsfeed.com/live/6e8222c1-1d38-4a79-8fb1-1005211dadad';

    try {
      const supported = await Linking.canOpenURL(privacyPolicyUrl);
      if (supported) {
        await Linking.openURL(privacyPolicyUrl);
      } else {
        Alert.alert(
          'Error',
          'Unable to open Privacy Policy. Please visit: https://www.termsfeed.com/live/6e8222c1-1d38-4a79-8fb1-1005211dadad',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error opening Privacy Policy:', error);
      Alert.alert(
        'Error',
        'Unable to open Privacy Policy. Please visit: https://www.termsfeed.com/live/6e8222c1-1d38-4a79-8fb1-1005211dadad',
        [{ text: 'OK' }]
      );
    }
  };

  const openTermsAndConditions = async () => {
    const privacyPolicyUrl = 'https://www.apple.com/legal/internet-services/itunes/dev/stdeula/';

    try {
      const supported = await Linking.canOpenURL(privacyPolicyUrl);
      if (supported) {
        await Linking.openURL(privacyPolicyUrl);
      } else {
        Alert.alert(
          'Error',
          'Unable to open Terms of Service. Please visit: https://www.apple.com/legal/internet-services/itunes/dev/stdeula/',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error opening Terms of Service:', error);
      Alert.alert(
        'Error',
        'Unable to open Terms of Service. Please visit: https://www.apple.com/legal/internet-services/itunes/dev/stdeula/',
        [{ text: 'OK' }]
      );
    }
  };

  const handleRestorePurchases = async () => {
    try {
      const customerInfo = await restorePurchases();
      if (customerInfo.entitlements.active['premium']) {
        const settings = await storageService.getUserSettings();
        await storageService.saveUserSettings({ ...settings, isPremium: true });
        Alert.alert('Success', 'Your purchases have been restored!');
        router.replace('/(tabs)');
      } else {
        Alert.alert('No Purchases', 'No previous purchases found.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to restore purchases.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={handleContinueWithFree}>
            <X size={24} color="#6B7280" />
          </TouchableOpacity>

          <View style={styles.crownContainer}>
            <Crown size={48} color="#FFD700" />
          </View>

          <Text style={styles.title}>Unlock Premium</Text>
          <Text style={styles.subtitle}>
            Take your fasting journey to the next level with advanced features and insights
          </Text>
        </View>

        {/* Features List */}
        <View style={styles.featuresContainer}>
          <Text style={styles.featuresTitle}>Premium Features</Text>
          {premiumFeatures.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <View key={index} style={styles.featureItem}>
                <View style={[styles.featureIcon, { backgroundColor: feature.color + '20' }]}>
                  <IconComponent size={20} color={feature.color} />
                </View>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDescription}>{feature.description}</Text>
                </View>
                <Check size={20} color="#10B981" />
              </View>
            );
          })}
        </View>

        {/* Pricing Plans */}
        <View style={styles.pricingContainer}>
          <Text style={styles.pricingTitle}>Choose Your Plan</Text>
          {packages
            .sort((a, b) => a.product.price - b.product.price)
            .map((pkg: any) => {
              const isSelected = selectedPackage?.identifier === pkg.identifier;
              const isPopular = pkg.packageType === 'ANNUAL';
              
              const getFeatures = (packageType: string) => {
                switch (packageType) {
                  case 'MONTHLY':
                    return [
                      'All premium features',
                      'Advanced analytics',
                      'Custom fasting plans',
                      'Export data',
                      'Priority support',
                    ];
                  case 'ANNUAL':
                    return [
                      'All premium features',
                      'Advanced analytics',
                      'Custom fasting plans',
                      'Export data',
                      'Priority support',
                      'Save 33% vs monthly',
                    ];
                  case 'LIFETIME':
                    return [
                      'All premium features',
                      'Lifetime access',
                      'Future updates included',
                      'No recurring payments',
                      'Best value',
                    ];
                  default:
                    return ['All premium features'];
                }
              };
              
              const features = getFeatures(pkg.packageType);

              return (
                <TouchableOpacity
                  key={pkg.identifier}
                  style={[
                    styles.planCard,
                    isSelected && styles.selectedPlan,
                    isPopular && styles.popularPlan,
                  ]}
                  onPress={() => setSelectedPackage(pkg)}
                >
                  {isPopular && (
                    <View style={styles.popularBadge}>
                      <Star size={12} color="#000000" />
                      <Text style={styles.popularText}>MOST POPULAR</Text>
                    </View>
                  )}

                  <View style={styles.planHeader}>
                    <Text style={styles.planName}>
                      {pkg.packageType === 'MONTHLY' ? 'Monthly' :
                       pkg.packageType === 'ANNUAL' ? 'Yearly' : 'Lifetime'}
                    </Text>
                    <View style={styles.priceContainer}>
                      <Text style={styles.price}>{pkg.product.priceString}</Text>
                      <Text style={styles.duration}>
                        {pkg.packageType === 'MONTHLY' ? 'per month' :
                         pkg.packageType === 'ANNUAL' ? 'per year' : 'one-time'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.planFeatures}>
                    {features.slice(0, 3).map((feature, index) => (
                      <View key={index} style={styles.planFeatureItem}>
                        <Check size={14} color="#10B981" />
                        <Text style={styles.planFeatureText}>{feature}</Text>
                      </View>
                    ))}
                    {features.length > 3 && (
                      <Text style={styles.moreFeatures}>
                        +{features.length - 3} more features
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
        </View>

        {/* CTA Buttons */}
        <View style={styles.ctaContainer}>
          <TouchableOpacity
            style={[styles.upgradeButton, (loading || !selectedPackage) && styles.disabledButton]}
            onPress={handleUpgrade}
            disabled={loading || !selectedPackage}
          >
            <Crown size={20} color="#FFFFFF" />
            <Text style={styles.upgradeButtonText}>
              {loading ? 'Processing...' : `Start ${selectedPackage?.product.title || 'Premium'}`}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.freeButton} onPress={handleContinueWithFree}>
            <Text style={styles.freeButtonText}>Continue with Free Version</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.restoreButton} onPress={handleRestorePurchases}>
            <Text style={styles.restoreButtonText}>Restore Purchases</Text>
          </TouchableOpacity>



        </View>

        {/* Footer */}
        <View style={styles.footer}>

          <Text style={styles.termsText}>
            By continuing, you agree to our {' '}
            <Text style={styles.linkText} onPress={openTermsAndConditions}>
              Terms of Service
            </Text>
            {' '} and{' '}
            <Text style={styles.linkText} onPress={openPrivacyPolicy}>
              Privacy Policy
            </Text>
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 8,
    marginBottom: 16,
  },
  crownContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFD700' + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  featuresContainer: {
    marginBottom: 32,
  },
  featuresTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 20,
    textAlign: 'center',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    marginBottom: 8,
    gap: 12,
  },
  featureIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  featureDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 18,
  },
  pricingContainer: {
    marginBottom: 32,
  },
  pricingTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 20,
    textAlign: 'center',
  },
  planCard: {
    backgroundColor: '#F9FAFB',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    position: 'relative',
  },
  selectedPlan: {
    borderColor: '#3B82F6',
    backgroundColor: '#EBF8FF',
  },
  popularPlan: {
    borderColor: '#FFD700',
    backgroundColor: '#FFFBEB',
  },
  popularBadge: {
    position: 'absolute',
    top: -8,
    left: 20,
    right: 20,
    backgroundColor: '#FFD700',
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  popularText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#000000',
  },
  planHeader: {
    marginBottom: 16,
    marginTop: 8,
  },
  planName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  price: {
    fontSize: 24,
    fontWeight: '700',
    color: '#3B82F6',
  },
  duration: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  planFeatures: {
    gap: 6,
  },
  planFeatureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  planFeatureText: {
    fontSize: 14,
    color: '#4B5563',
    flex: 1,
  },
  moreFeatures: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
    marginTop: 4,
  },
  ctaContainer: {
    gap: 12,
    marginBottom: 32,
  },
  upgradeButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  disabledButton: {
    opacity: 0.6,
  },
  upgradeButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  freeButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  freeButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '600',
  },
  restoreButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  restoreButtonText: {
    color: '#3B82F6',
    fontSize: 14,
    fontWeight: '500',
  },
  footer: {
    alignItems: 'center',
    gap: 8,
  },
  footerText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 16,
  },
  termsText: {
    fontSize: 11,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 14,
  },
  linkText: {
    color: '#3B82F6',
    textDecorationLine: 'underline',
  },
});