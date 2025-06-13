import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { registerForPushNotifications, onMessage } from '../services/notification.service';
import * as Notifications from 'expo-notifications';
import { account } from '../lib/appwrite';

export default function UserAppLayout() {
  useEffect(() => {
    const setupNotifications = async () => {
      try {
        const user = await account.get();
        if (user?.$id) {
          const token = await registerForPushNotifications(user.$id);
          console.log('FCM Token:', token);
        }
      } catch (error) {
        console.error('Failed to setup notifications:', error);
      }
    };

    setupNotifications();

    // Handle foreground notifications
    const unsubscribe = onMessage(async (remoteMessage) => {
      Notifications.scheduleNotificationAsync({
        content: {
          title: remoteMessage.notification?.title,
          body: remoteMessage.notification?.body,
        },
        trigger: null,
      });
    });

    return unsubscribe;
  }, []);

  return <Stack screenOptions={{ headerShown: false }} />;
}