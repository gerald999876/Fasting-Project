import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity, Alert, Platform, Linking } from 'react-native';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bell, User, Info, Shield, Trash2, BookOpen, Moon, Sun, Crown, Star, Download } from 'lucide-react-native';
import { UserSettings } from '@/types';
import { storageService } from '@/utils/storage';
import { notificationService } from '@/utils/notifications';
import { useTheme } from '@/contexts/ThemeContext';
import { PremiumBadge } from '@/components/PremiumBadge';
import { router } from 'expo-router';

export default function SettingsScreen() {
  const { colors, toggleDarkMode } = useTheme();
  const [settings, setSettings] = useState<UserSettings>({
    preferredMethod: { id: '16_8', name: '16:8', fastingHours: 16, eatingHours: 8, description: '' },
    notificationsEnabled: true,
    fastingStartNotification: true,
    fastingEndNotification: true,
    reminderInterval: 60,
    units: 'metric',
    darkMode: false,
    onboardingCompleted: false,
    isPremium: false,
    premiumExpiryDate: undefined,
    paywallSeen: false,
  });
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const userSettings = await storageService.getUserSettings();
      setSettings(userSettings);
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (newSettings: UserSettings) => {
    try {
      await storageService.saveUserSettings(newSettings);
      setSettings(newSettings);
    } catch (error) {
      console.error('Error saving settings:', error);
      Alert.alert('Error', 'Failed to save settings');
    }
  };

  const handleDarkModeToggle = async (enabled: boolean) => {
    await toggleDarkMode();
    const newSettings = { ...settings, darkMode: enabled };
    setSettings(newSettings);
  };

  const toggleNotifications = async (enabled: boolean) => {
    if (enabled) {
      let hasPermission = await notificationService.requestPermissions();

      // Also try web notifications if on web platform
      if (!hasPermission && Platform.OS === 'web') {
        hasPermission = await notificationService.requestWebNotificationPermission();
      }

      if (!hasPermission) {
        Alert.alert(
          'Permission Required',
          Platform.OS === 'web'
            ? 'Please allow notifications in your browser to receive fasting reminders.'
            : 'Please enable notifications in your device settings to receive fasting reminders.'
        );
        return;
      }
    }

    const newSettings = { ...settings, notificationsEnabled: enabled };
    await saveSettings(newSettings);
  };

  const testNotification = async () => {
    try {
      const hasPermission = await notificationService.requestPermissions();
      if (!hasPermission) {
        Alert.alert(
          'Permission Required',
          'Please enable notifications first to test them.'
        );
        return;
      }

      // Schedule a test notification for 5 seconds from now
      const testTime = new Date(Date.now() + 5000);
      const notificationId = await notificationService.scheduleNotification(
        'Test Notification 🔔',
        'This is a test notification from FastTrack!',
        testTime,
        'fasting-reminders'
      );

      if (notificationId) {
        Alert.alert(
          'Test Notification Scheduled',
          'A test notification will appear in 5 seconds. Make sure your device is not in silent mode.'
        );
      } else {
        Alert.alert(
          'Error',
          'Failed to schedule test notification. Please check your notification settings.'
        );
      }
    } catch (error) {
      console.error('Error testing notification:', error);
      Alert.alert(
        'Error',
        'Failed to test notification. Please check your notification settings.'
      );
    }
  };

  const clearAllData = () => {
    Alert.alert(
      'Clear All Data',
      'This will permanently delete all your fasting history, health metrics, and settings. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await storageService.clearAllData();

              // Reset local state to default values
              const defaultSettings: UserSettings = {
                preferredMethod: { id: '16_8', name: '16:8', fastingHours: 16, eatingHours: 8, description: '' },
                notificationsEnabled: true,
                fastingStartNotification: true,
                fastingEndNotification: true,
                reminderInterval: 60,
                units: 'metric' as const,
                darkMode: false,
                onboardingCompleted: false,
                isPremium: false,
                premiumExpiryDate: undefined,
                paywallSeen: false,
              };
              setSettings(defaultSettings);

              Alert.alert('Success', 'All data has been cleared');
            } catch (error) {
              console.error('Error clearing data:', error);
              Alert.alert('Error', 'Failed to clear data');
            }
          },
        },
      ]
    );
  };

  const showAbout = () => {
    Alert.alert(
      'About FastTrack',
      'FastTrack is your companion for intermittent fasting. Track your fasting schedule, monitor your health, and achieve your wellness goals.\n\nVersion 1.0.0',
      [{ text: 'OK' }]
    );
  };

  const showPrivacyPolicy = async () => {
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




  const togglePremiumDemo = async () => {
    // Demo function to toggle premium status for testing
    const newSettings = { ...settings, isPremium: !settings.isPremium };
    await saveSettings(newSettings);
  };


  const handleExportData = async () => {
    if (exporting) return; // Prevent multiple exports

    setExporting(true);
    try {
      // Get all data for export
      const [fastingSessions, healthMetrics, journalEntries] = await Promise.all([
        storageService.getFastingSessions(),
        storageService.getHealthMetrics(),
        storageService.getJournalEntries()
      ]);

      // Check if there's any data to export
      if (fastingSessions.length === 0 && healthMetrics.length === 0 && journalEntries.length === 0) {
        Alert.alert(
          'No Data to Export',
          'You don\'t have any fasting data to export yet. Start fasting and tracking your health to build up your data!',
          [{ text: 'OK' }]
        );
        return;
      }

      // Create CSV content
      const csvContent = generateCSVContent(fastingSessions, healthMetrics, journalEntries);

      // Create filename with timestamp
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `fasting-data-${timestamp}.csv`;

      if (Platform.OS === 'web') {
        // Web fallback - download file directly
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        Alert.alert(
          'Export Successful',
          `Data exported successfully!\n\nFasting Sessions: ${fastingSessions.length}\nHealth Metrics: ${healthMetrics.length}\nJournal Entries: ${journalEntries.length}\n\nFile downloaded as: ${filename}`,
          [{ text: 'OK' }]
        );
      } else {
        // Mobile - use expo-sharing
        const isAvailable = await Sharing.isAvailableAsync();
        if (!isAvailable) {
          Alert.alert('Error', 'Sharing is not available on this device');
          return;
        }

        // Create file path
        const fileUri = FileSystem.documentDirectory + filename;

        // Write CSV content to file
        await FileSystem.writeAsStringAsync(fileUri, csvContent, {
          encoding: FileSystem.EncodingType.UTF8,
        });

        // Share the file
        await Sharing.shareAsync(fileUri, {
          mimeType: 'text/csv',
          dialogTitle: 'Export Fasting Data',
          UTI: 'public.comma-separated-values-text'
        });

        Alert.alert(
          'Export Successful',
          `Data exported successfully!\n\nFasting Sessions: ${fastingSessions.length}\nHealth Metrics: ${healthMetrics.length}\nJournal Entries: ${journalEntries.length}\n\nFile saved as: ${filename}`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      Alert.alert('Error', 'Failed to export data. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const generateCSVContent = (sessions: any[], metrics: any[], entries: any[]) => {
    // Helper function to escape CSV values
    const escapeCSV = (value: any) => {
      if (value === null || value === undefined) return '';
      const str = String(value);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    // Helper function to format date
    const formatDate = (date: Date) => {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    };

    // Helper function to format time
    const formatTime = (date: Date) => {
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    };

    // Create CSV headers
    const sessionHeaders = 'Date,Method,Start Time,End Time,Duration (hours),Completed\n';
    const metricHeaders = 'Date,Weight (kg),Water Intake (ml),Energy Level (1-5),Mood (1-5),Sleep Quality (1-5)\n';
    const entryHeaders = 'Date,Title,Mood,Tags,Content\n';

    // Create CSV rows with proper escaping
    const sessionRows = sessions.map(s => {
      const startTime = s.startTime ? new Date(s.startTime) : new Date();
      const endTime = s.endTime ? new Date(s.endTime) : new Date();
      const duration = s.duration ? (s.duration / 60).toFixed(1) : '0'; // Convert minutes to hours

      return [
        formatDate(startTime),
        escapeCSV(s.method?.name || 'Unknown'),
        formatTime(startTime),
        formatTime(endTime),
        duration,
        s.completed ? 'Yes' : 'No'
      ].join(',');
    }).join('\n');

    const metricRows = metrics.map(m => {
      const date = m.date ? new Date(m.date) : new Date();
      return [
        formatDate(date),
        m.weight || '',
        m.waterIntake || 0,
        m.energyLevel || 0,
        m.mood || 0,
        m.sleepQuality || 0
      ].join(',');
    }).join('\n');

    const entryRows = entries.map(e => {
      const date = e.date ? new Date(e.date) : new Date();
      return [
        formatDate(date),
        escapeCSV(e.title || ''),
        escapeCSV(e.mood || ''),
        escapeCSV((e.tags || []).join('; ')),
        escapeCSV(e.content || '')
      ].join(',');
    }).join('\n');

    // Add export metadata
    const exportDate = new Date().toLocaleString();
    const metadata = `# Fasting Data Export\n# Generated on: ${exportDate}\n# Total Sessions: ${sessions.length}\n# Total Health Metrics: ${metrics.length}\n# Total Journal Entries: ${entries.length}\n\n`;

    return metadata +
      `FASTING SESSIONS\n${sessionHeaders}${sessionRows}\n\n` +
      `HEALTH METRICS\n${metricHeaders}${metricRows}\n\n` +
      `JOURNAL ENTRIES\n${entryHeaders}${entryRows}`;
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading settings...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
            {settings.isPremium && <PremiumBadge size="small" />}
          </View>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {settings.isPremium ? 'Premium member - enjoy all features!' : 'Customize your fasting experience'}
          </Text>
        </View>

        {!settings.isPremium && (
          <TouchableOpacity
            style={[styles.premiumCard, { backgroundColor: '#FFD700' + '20', borderColor: '#FFD700' + '40' }]}
            onPress={() => router.push('/paywall')}
          >
            <View style={styles.premiumCardContent}>
              <Crown size={24} color="#FFD700" />
              <View style={styles.premiumCardText}>
                <Text style={[styles.premiumCardTitle, { color: colors.text }]}>Upgrade to Premium</Text>
                <Text style={[styles.premiumCardSubtitle, { color: colors.textSecondary }]}>
                  Unlock advanced analytics, custom plans, and more
                </Text>
              </View>
              <Star size={20} color="#FFD700" />
            </View>
          </TouchableOpacity>
        )}

        <View key="appearance-section" style={styles.section}>
          <View style={styles.sectionHeader}>
            {settings.darkMode ? (
              <Moon size={20} color="#8B5CF6" />
            ) : (
              <Sun size={20} color="#F59E0B" />
            )}
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Appearance</Text>
          </View>

          <View style={[styles.settingItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>Dark Mode</Text>
              <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                Switch between light and dark themes
              </Text>
            </View>
            <Switch
              value={settings.darkMode}
              onValueChange={handleDarkModeToggle}
              trackColor={{ false: colors.border, true: colors.primary + '60' }}
              thumbColor={settings.darkMode ? '#8B5CF6' : '#9CA3AF'}
            />
          </View>
        </View>

        <View key="notifications-section" style={styles.section}>
          <View style={styles.sectionHeader}>
            <Bell size={20} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Notifications</Text>
          </View>

          <View style={[styles.settingItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>Enable Notifications</Text>
              <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                Receive reminders for fasting start and end times
              </Text>
            </View>
            <Switch
              value={settings.notificationsEnabled}
              onValueChange={toggleNotifications}
              trackColor={{ false: colors.border, true: colors.primary + '60' }}
              thumbColor={settings.notificationsEnabled ? colors.primary : colors.textTertiary}
            />
          </View>

          <View style={[styles.settingItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>Fasting Start Notifications</Text>
              <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                Get notified when it's time to start fasting
              </Text>
            </View>
            <Switch
              value={settings.fastingStartNotification && settings.notificationsEnabled}
              onValueChange={(value) => saveSettings({ ...settings, fastingStartNotification: value })}
              disabled={!settings.notificationsEnabled}
              trackColor={{ false: colors.border, true: colors.primary + '60' }}
              thumbColor={settings.fastingStartNotification ? colors.primary : colors.textTertiary}
            />
          </View>

          <View style={[styles.settingItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>Fasting End Notifications</Text>
              <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                Get notified when your fasting window ends
              </Text>
            </View>
            <Switch
              value={settings.fastingEndNotification && settings.notificationsEnabled}
              onValueChange={(value) => saveSettings({ ...settings, fastingEndNotification: value })}
              disabled={!settings.notificationsEnabled}
              trackColor={{ false: colors.border, true: colors.primary + '60' }}
              thumbColor={settings.fastingEndNotification ? colors.primary : colors.textTertiary}
            />
          </View>

          {/* Test Notification Button */}
          <TouchableOpacity
            style={[styles.testNotificationButton, { backgroundColor: colors.primary + '20', borderColor: colors.primary + '40' }]}
            onPress={testNotification}
          >
            <Bell size={16} color={colors.primary} />
            <Text style={[styles.testNotificationText, { color: colors.primary }]}>Test Notification</Text>
          </TouchableOpacity>
        </View>

        <View key="preferences-section" style={styles.section}>
          <View style={styles.sectionHeader}>
            <User size={20} color={colors.success} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Preferences</Text>
          </View>

          <TouchableOpacity
            style={[styles.settingItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => {
              Alert.alert(
                'Choose Units',
                'Select your preferred measurement system',
                [
                  {
                    text: 'Cancel',
                    style: 'cancel',
                  },
                  {
                    text: 'Metric (kg)',
                    onPress: () => saveSettings({ ...settings, units: 'metric' }),
                    style: settings.units === 'metric' ? 'default' : 'default',
                  },
                  {
                    text: 'Imperial (lbs)',
                    onPress: () => saveSettings({ ...settings, units: 'imperial' }),
                    style: settings.units === 'imperial' ? 'default' : 'default',
                  },
                ]
              );
            }}
          >
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>Units</Text>
              <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                Choose your preferred measurement system
              </Text>
            </View>
            <Text style={[styles.settingValue, { color: colors.primary }]}>
              {settings.units === 'metric' ? 'Metric (kg)' : 'Imperial (lbs)'}
            </Text>
          </TouchableOpacity>
        </View>

        <View key="learn-section" style={styles.section}>
          <View style={styles.sectionHeader}>
            <BookOpen size={20} color={colors.warning} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Learn</Text>
          </View>

          <TouchableOpacity style={[styles.actionItem, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={() => {
            Alert.alert(
              'Intermittent Fasting Guide',
              'Intermittent fasting is an eating pattern that cycles between periods of fasting and eating. Popular methods include:\n\n• 16:8 - Fast 16 hours, eat in 8 hours\n• 18:6 - Fast 18 hours, eat in 6 hours\n• 20:4 - Fast 20 hours, eat in 4 hours\n• OMAD - One meal a day\n\nAlways consult with a healthcare provider before starting any fasting regimen.',
              [{ text: 'OK' }]
            );
          }}>
            <Text style={[styles.actionItemText, { color: colors.text }]}>Fasting Guide</Text>
          </TouchableOpacity>
        </View>

        <View key="about-section" style={styles.section}>
          <View style={styles.sectionHeader}>
            <Info size={20} color="#8B5CF6" />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>About</Text>
          </View>

          <TouchableOpacity style={[styles.actionItem, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={showAbout}>
            <Text style={[styles.actionItemText, { color: colors.text }]}>About FastTrack</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionItem, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={showPrivacyPolicy}>
            <Text style={[styles.actionItemText, { color: colors.text }]}>Privacy Policy</Text>
          </TouchableOpacity>
        </View>



        <View key="data-section" style={styles.section}>
          <View style={styles.sectionHeader}>
            <Shield size={20} color={colors.error} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Data</Text>
          </View>

          {/* Export Data - Premium Feature */}
          <TouchableOpacity
            style={[
              styles.exportItem,
              {
                backgroundColor: settings.isPremium ? colors.primary + '20' : colors.surface,
                borderColor: settings.isPremium ? colors.primary + '40' : colors.border,
                opacity: settings.isPremium ? (exporting ? 0.7 : 1) : 0.7
              }
            ]}
            onPress={settings.isPremium ? handleExportData : () => router.push('/paywall')}
            disabled={exporting}
          >
            <Download
              size={16}
              color={settings.isPremium ? colors.primary : colors.textSecondary}
              style={exporting ? { opacity: 0.7 } : undefined}
            />
            <View style={styles.exportContent}>
              <Text style={[styles.exportTitle, { color: settings.isPremium ? colors.primary : colors.textSecondary }]}>
                {exporting ? 'Exporting...' : 'Export Data'}
              </Text>
              <Text style={[styles.exportDescription, { color: settings.isPremium ? colors.primary : colors.textTertiary }]}>
                {exporting ? 'Creating your data file...' : 'Export your fasting history and health metrics'}
              </Text>
            </View>
            {!settings.isPremium && <PremiumBadge size="small" />}
          </TouchableOpacity>

          <TouchableOpacity style={[styles.dangerItem, { backgroundColor: colors.error + '20', borderColor: colors.error + '40' }]} onPress={clearAllData}>
            <Trash2 size={16} color={colors.error} />
            <Text style={[styles.dangerItemText, { color: colors.error }]}>Clear All Data</Text>
          </TouchableOpacity>

        </View>


      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  premiumCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
  },
  premiumCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  premiumCardText: {
    flex: 1,
  },
  premiumCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  premiumCardSubtitle: {
    fontSize: 14,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
  },
  settingValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  actionItem: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
  },
  actionItemText: {
    fontSize: 16,
    fontWeight: '500',
  },
  dangerItem: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dangerItemText: {
    fontSize: 16,
    fontWeight: '500',
  },
  exportItem: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  exportContent: {
    flex: 1,
  },
  exportTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  exportDescription: {
    fontSize: 14,
    lineHeight: 18,
  },
  testNotificationButton: {
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  testNotificationText: {
    fontSize: 16,
    fontWeight: '600',
  },
});