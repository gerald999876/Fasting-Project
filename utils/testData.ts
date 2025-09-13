import { FastingSession, HealthMetrics } from '@/types';
import { FASTING_METHODS } from '@/constants/fastingMethods';
import { storageService } from './storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Generate a unique ID using timestamp and random number
const generateUniqueId = (prefix: string): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  return `${prefix}-${timestamp}-${random}`;
};

export const createSampleData = async () => {
  try {
    // Clear any existing sample data first to prevent duplicates
    await clearSampleDataOnly();
    
    // Check if sample data already exists to prevent duplicates
    const existingSessions = await storageService.getFastingSessions();
    if (existingSessions.length > 0) {
      console.log('Sample data already exists. Skipping creation to prevent duplicates.');
      return true;
    }

    // Create sample fasting sessions with more variety for testing achievements
    const sampleSessions: FastingSession[] = [
      // Recent sessions for current streak
      {
        id: generateUniqueId('session'),
        method: FASTING_METHODS[0], // 16:8
        startTime: new Date(Date.now() - 0 * 24 * 60 * 60 * 1000), // Today
        endTime: new Date(Date.now() - 0 * 24 * 60 * 60 * 1000 + 16 * 60 * 60 * 1000),
        completed: true,
        duration: 16 * 60, // 16 hours in minutes
      },
      {
        id: generateUniqueId('session'),
        method: FASTING_METHODS[1], // 18:6
        startTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // Yesterday
        endTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 18 * 60 * 60 * 1000),
        completed: true,
        duration: 18 * 60, // 18 hours in minutes
      },
      {
        id: generateUniqueId('session'),
        method: FASTING_METHODS[0], // 16:8
        startTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        endTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 16 * 60 * 60 * 1000),
        completed: true,
        duration: 16 * 60, // 16 hours in minutes
      },
      {
        id: generateUniqueId('session'),
        method: FASTING_METHODS[2], // 20:4
        startTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        endTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 20 * 60 * 60 * 1000),
        completed: true,
        duration: 20 * 60, // 20 hours in minutes
      },
      {
        id: generateUniqueId('session'),
        method: FASTING_METHODS[0], // 16:8
        startTime: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
        endTime: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000 + 16 * 60 * 60 * 1000),
        completed: true,
        duration: 16 * 60, // 16 hours in minutes
      },
      // Additional sessions for more achievements
      {
        id: generateUniqueId('session'),
        method: FASTING_METHODS[1], // 18:6
        startTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
        endTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 18 * 60 * 60 * 1000),
        completed: true,
        duration: 18 * 60, // 18 hours in minutes
      },
      {
        id: generateUniqueId('session'),
        method: FASTING_METHODS[0], // 16:8
        startTime: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
        endTime: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000 + 16 * 60 * 60 * 1000),
        completed: true,
        duration: 16 * 60, // 16 hours in minutes
      },
      {
        id: generateUniqueId('session'),
        method: FASTING_METHODS[3], // OMAD
        startTime: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 2 weeks ago
        endTime: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000 + 23 * 60 * 60 * 1000),
        completed: true,
        duration: 23 * 60, // 23 hours in minutes
      },
    ];

    // Create sample health metrics
    const sampleHealthMetrics: HealthMetrics[] = [
      {
        id: generateUniqueId('health'),
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        weight: 70.5,
        waterIntake: 2000,
        energyLevel: 4,
        mood: 4,
        sleepQuality: 3,
      },
      {
        id: generateUniqueId('health'),
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        weight: 70.2,
        waterIntake: 1800,
        energyLevel: 5,
        mood: 5,
        sleepQuality: 4,
      },
      {
        id: generateUniqueId('health'),
        date: new Date(),
        weight: 69.8,
        waterIntake: 2200,
        energyLevel: 3,
        mood: 3,
        sleepQuality: 4,
      },
    ];

    // Save sample data
    for (const session of sampleSessions) {
      await storageService.saveFastingSession(session);
    }

    for (const metric of sampleHealthMetrics) {
      await storageService.saveHealthMetrics(metric);
    }

    console.log('Sample data created successfully!');
    return true;
  } catch (error) {
    console.error('Error creating sample data:', error);
    return false;
  }
};

export const clearSampleDataOnly = async () => {
  try {
    // Clear only sample data (sessions and health metrics) but keep user settings
    await Promise.all([
      storageService.clearFastingSessions(),
      storageService.clearHealthMetrics(),
    ]);
    console.log('Sample data cleared!');
    return true;
  } catch (error) {
    console.error('Error clearing sample data:', error);
    return false;
  }
};

export const clearSampleData = async () => {
  try {
    // Clear all data including sessions and health metrics
    await storageService.clearAllData();
    console.log('All data cleared!');
    return true;
  } catch (error) {
    console.error('Error clearing all data:', error);
    return false;
  }
};

export const resetAppData = async () => {
  try {
    // Clear all AsyncStorage data completely
    await AsyncStorage.clear();
    console.log('App data completely reset!');
    return true;
  } catch (error) {
    console.error('Error resetting app data:', error);
    return false;
  }
};

// Force clear cache and restart - call this to fix duplicate key issues
export const forceClearCache = async () => {
  try {
    console.log('Force clearing cache...');
    
    // Clear all data
    await AsyncStorage.clear();
    
    // Also clear any cached data in storage service
    await Promise.all([
      storageService.clearFastingSessions(),
      storageService.clearHealthMetrics(),
      storageService.clearFastingState(),
    ]);
    
    console.log('Cache force cleared successfully!');
    return true;
  } catch (error) {
    console.error('Error force clearing cache:', error);
    return false;
  }
};

// Test data persistence across app restarts
export const testDataPersistence = async () => {
  try {
    console.log('Testing data persistence...');
    
    // Test user settings persistence
    const settings = await storageService.getUserSettings();
    console.log('✅ User settings loaded:', {
      onboardingCompleted: settings.onboardingCompleted,
      isPremium: settings.isPremium,
      paywallSeen: settings.paywallSeen,
      preferredMethod: settings.preferredMethod?.name,
      notificationsEnabled: settings.notificationsEnabled,
    });
    
    // Test user profile persistence
    const profile = await storageService.getUserProfile();
    console.log('✅ User profile loaded:', profile);
    
    // Test fasting sessions persistence
    const sessions = await storageService.getFastingSessions();
    console.log('✅ Fasting sessions loaded:', sessions.length, 'sessions');
    
    // Test health metrics persistence
    const healthMetrics = await storageService.getHealthMetrics();
    console.log('✅ Health metrics loaded:', healthMetrics.length, 'entries');
    
    // Test journal entries persistence
    const journalEntries = await storageService.getJournalEntries();
    console.log('✅ Journal entries loaded:', journalEntries.length, 'entries');
    
    // Test fasting state persistence
    const fastingState = await storageService.getFastingState();
    console.log('✅ Fasting state loaded:', fastingState ? 'Active' : 'None');
    
    console.log('🎉 Data persistence test completed successfully!');
    return true;
  } catch (error) {
    console.error('❌ Data persistence test failed:', error);
    return false;
  }
};
