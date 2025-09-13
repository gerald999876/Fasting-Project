import * as Notifications from 'expo-notifications';
import { Platform, Alert } from 'react-native';
import { dateUtils } from './dateUtils';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Create notification channels for Android
const createNotificationChannels = async () => {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('fasting-reminders', {
      name: 'Fasting Reminders',
      description: 'Notifications for fasting start, end, and reminders',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });

    await Notifications.setNotificationChannelAsync('general', {
      name: 'General',
      description: 'General app notifications',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
};

export const notificationService = {
  async initialize(): Promise<void> {
    try {
      await createNotificationChannels();
      console.log('Notification channels created successfully');
    } catch (error) {
      console.error('Error creating notification channels:', error);
    }
  },

  async requestPermissions(): Promise<boolean> {
    try {
      if (Platform.OS === 'web') {
        return await this.requestWebNotificationPermission();
      }

      // Create notification channels first
      await this.initialize();

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync({
          ios: {
            allowAlert: true,
            allowBadge: true,
            allowSound: true,
            allowAnnouncements: true,
          },
        });
        finalStatus = status;
      }

      const granted = finalStatus === 'granted';
      console.log('Notification permission status:', finalStatus);
      return granted;
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  },

  async scheduleNotification(title: string, body: string, trigger: Date, channelId?: string): Promise<string | null> {
    try {
      if (Platform.OS === 'web') {
        // For web, we can show a browser notification if supported
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(title, { 
            body,
            icon: '/assets/images/icon.png',
            badge: '/assets/images/icon.png'
          });
        }
        return 'web-notification';
      }

      // Ensure the trigger date is in the future
      const now = new Date();
      if (trigger <= now) {
        console.warn('Notification trigger time is in the past, scheduling for 1 minute from now');
        trigger = new Date(now.getTime() + 60000); // 1 minute from now
      }

      const notificationContent: Notifications.NotificationContentInput = {
        title,
        body,
        sound: 'default',
        data: {
          type: 'fasting',
          scheduledAt: trigger.toISOString(),
        },
      };

      // Add channel ID for Android
      if (Platform.OS === 'android' && channelId) {
        notificationContent.android = {
          channelId,
        };
      }

      const id = await Notifications.scheduleNotificationAsync({
        content: notificationContent,
        trigger,
      });
      
      console.log(`Scheduled notification: ${title} for ${trigger.toISOString()}`);
      return id;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      return null;
    }
  },

  async cancelNotification(id: string): Promise<void> {
    if (Platform.OS === 'web') {
      return;
    }

    try {
      await Notifications.cancelScheduledNotificationAsync(id);
    } catch (error) {
      console.error('Error canceling notification:', error);
    }
  },

  async cancelAllNotifications(): Promise<void> {
    if (Platform.OS === 'web') {
      return;
    }

    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error canceling all notifications:', error);
    }
  },

  async scheduleRecurringReminder(title: string, body: string, intervalMinutes: number): Promise<string | null> {
    if (Platform.OS === 'web') {
      return null;
    }

    try {
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: 'default',
          data: {
            type: 'reminder',
            interval: intervalMinutes,
          },
        },
        trigger: {
          seconds: intervalMinutes * 60,
          repeats: true,
        },
      });
      return id;
    } catch (error) {
      console.error('Error scheduling recurring reminder:', error);
      return null;
    }
  },

  async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    if (Platform.OS === 'web') {
      return [];
    }

    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error getting scheduled notifications:', error);
      return [];
    }
  },

  async requestWebNotificationPermission(): Promise<boolean> {
    if (Platform.OS !== 'web' || !('Notification' in window)) {
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  },
};